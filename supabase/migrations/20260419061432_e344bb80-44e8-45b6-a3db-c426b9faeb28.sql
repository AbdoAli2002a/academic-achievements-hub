
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  ref_table TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System and admins insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Helper: notify all admins of new submission
CREATE OR REPLACE FUNCTION public.notify_admins_new_submission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_id UUID;
  content_label TEXT;
  owner_name TEXT;
BEGIN
  IF TG_TABLE_NAME = 'publications' THEN content_label := 'بحث جديد';
  ELSIF TG_TABLE_NAME = 'awards' THEN content_label := 'جائزة جديدة';
  ELSIF TG_TABLE_NAME = 'certificates' THEN content_label := 'شهادة جديدة';
  ELSIF TG_TABLE_NAME = 'events' THEN content_label := 'فعالية جديدة';
  ELSE content_label := 'محتوى جديد';
  END IF;

  SELECT name_ar INTO owner_name FROM public.profiles WHERE id = NEW.profile_id;

  FOR admin_id IN SELECT user_id FROM public.user_roles WHERE role = 'super_admin' LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link, ref_table, ref_id)
    VALUES (
      admin_id,
      'محتوى بانتظار المراجعة: ' || content_label,
      COALESCE(owner_name, 'عضو') || ' قدّم: ' || COALESCE(NEW.title_ar, ''),
      'submission',
      '/admin',
      TG_TABLE_NAME,
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Helper: notify owner on review
CREATE OR REPLACE FUNCTION public.notify_owner_on_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  content_label TEXT;
  status_label TEXT;
  notif_type TEXT;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('approved','rejected') THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'publications' THEN content_label := 'بحثك';
  ELSIF TG_TABLE_NAME = 'awards' THEN content_label := 'جائزتك';
  ELSIF TG_TABLE_NAME = 'certificates' THEN content_label := 'شهادتك';
  ELSIF TG_TABLE_NAME = 'events' THEN content_label := 'فعاليتك';
  ELSE content_label := 'محتواك';
  END IF;

  IF NEW.status = 'approved' THEN
    status_label := 'تم اعتماد ' || content_label;
    notif_type := 'success';
  ELSE
    status_label := 'تم رفض ' || content_label;
    notif_type := 'error';
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, link, ref_table, ref_id)
  VALUES (
    NEW.profile_id,
    status_label,
    COALESCE(NEW.title_ar, '') ||
      CASE WHEN TG_TABLE_NAME = 'publications' AND NEW.status = 'rejected' AND NEW.rejection_reason IS NOT NULL
           THEN ' — السبب: ' || NEW.rejection_reason ELSE '' END,
    notif_type,
    '/dashboard',
    TG_TABLE_NAME,
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Triggers: new submission
CREATE TRIGGER trg_publications_notify_admins AFTER INSERT ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_submission();
CREATE TRIGGER trg_awards_notify_admins AFTER INSERT ON public.awards
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_submission();
CREATE TRIGGER trg_certificates_notify_admins AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_submission();
CREATE TRIGGER trg_events_notify_admins AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_submission();

-- Triggers: review status change
CREATE TRIGGER trg_publications_notify_owner AFTER UPDATE OF status ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.notify_owner_on_review();
CREATE TRIGGER trg_awards_notify_owner AFTER UPDATE OF status ON public.awards
  FOR EACH ROW EXECUTE FUNCTION public.notify_owner_on_review();
CREATE TRIGGER trg_certificates_notify_owner AFTER UPDATE OF status ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_owner_on_review();
CREATE TRIGGER trg_events_notify_owner AFTER UPDATE OF status ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.notify_owner_on_review();
