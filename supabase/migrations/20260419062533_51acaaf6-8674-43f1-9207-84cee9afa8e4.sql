-- Auto badge granting via triggers based on approved content thresholds
CREATE OR REPLACE FUNCTION public.auto_grant_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_count INT;
  v_badge_id UUID;
BEGIN
  -- only act when row is approved (insert with approved, or status changed to approved)
  IF NEW.status IS DISTINCT FROM 'approved' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN
    RETURN NEW;
  END IF;

  v_profile_id := NEW.profile_id;

  IF TG_TABLE_NAME = 'publications' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.publications
    WHERE profile_id = v_profile_id AND status = 'approved';

    -- 5+ approved publications -> "research" (باحث متميز)
    IF v_count >= 5 THEN
      SELECT id INTO v_badge_id FROM public.badges WHERE key = 'research' LIMIT 1;
      IF v_badge_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.member_badges WHERE profile_id = v_profile_id AND badge_id = v_badge_id
      ) THEN
        INSERT INTO public.member_badges (profile_id, badge_id, note)
        VALUES (v_profile_id, v_badge_id, 'تم منحه تلقائياً عند بلوغ 5 أبحاث معتمدة');
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (v_profile_id, '🏅 وسام جديد: باحث متميز',
                'تهانينا! حصلت على وسام "باحث متميز" لتجاوزك 5 أبحاث معتمدة.',
                'success', '/dashboard');
      END IF;
    END IF;

    -- 10+ approved publications -> "topPublisher" (الأكثر نشراً)
    IF v_count >= 10 THEN
      SELECT id INTO v_badge_id FROM public.badges WHERE key = 'topPublisher' LIMIT 1;
      IF v_badge_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.member_badges WHERE profile_id = v_profile_id AND badge_id = v_badge_id
      ) THEN
        INSERT INTO public.member_badges (profile_id, badge_id, note)
        VALUES (v_profile_id, v_badge_id, 'تم منحه تلقائياً عند بلوغ 10 أبحاث معتمدة');
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (v_profile_id, '🏆 وسام جديد: الأكثر نشراً',
                'تهانينا! حصلت على وسام "الأكثر نشراً" لتجاوزك 10 أبحاث معتمدة.',
                'success', '/dashboard');
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME = 'events' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.events
    WHERE profile_id = v_profile_id AND status = 'approved';

    -- 5+ approved events -> "communityService" (خدمة المجتمع)
    IF v_count >= 5 THEN
      SELECT id INTO v_badge_id FROM public.badges WHERE key = 'communityService' LIMIT 1;
      IF v_badge_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM public.member_badges WHERE profile_id = v_profile_id AND badge_id = v_badge_id
      ) THEN
        INSERT INTO public.member_badges (profile_id, badge_id, note)
        VALUES (v_profile_id, v_badge_id, 'تم منحه تلقائياً عند المشاركة في 5 فعاليات معتمدة');
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (v_profile_id, '🤝 وسام جديد: خدمة المجتمع',
                'تهانينا! حصلت على وسام "خدمة المجتمع" لمشاركتك في 5 فعاليات.',
                'success', '/dashboard');
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME = 'awards' THEN
    -- first approved award -> "excellence" (وسام التميز)
    SELECT id INTO v_badge_id FROM public.badges WHERE key = 'excellence' LIMIT 1;
    IF v_badge_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.member_badges WHERE profile_id = v_profile_id AND badge_id = v_badge_id
    ) THEN
      INSERT INTO public.member_badges (profile_id, badge_id, note)
      VALUES (v_profile_id, v_badge_id, 'تم منحه تلقائياً عند الحصول على أول جائزة معتمدة');
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (v_profile_id, '⭐ وسام جديد: وسام التميز',
              'تهانينا! حصلت على وسام "التميز" بعد اعتماد جائزتك.',
              'success', '/dashboard');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach triggers (AFTER INSERT/UPDATE for status transitions to approved)
DROP TRIGGER IF EXISTS trg_auto_badges_publications ON public.publications;
CREATE TRIGGER trg_auto_badges_publications
AFTER INSERT OR UPDATE OF status ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_badges();

DROP TRIGGER IF EXISTS trg_auto_badges_events ON public.events;
CREATE TRIGGER trg_auto_badges_events
AFTER INSERT OR UPDATE OF status ON public.events
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_badges();

DROP TRIGGER IF EXISTS trg_auto_badges_awards ON public.awards;
CREATE TRIGGER trg_auto_badges_awards
AFTER INSERT OR UPDATE OF status ON public.awards
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_badges();