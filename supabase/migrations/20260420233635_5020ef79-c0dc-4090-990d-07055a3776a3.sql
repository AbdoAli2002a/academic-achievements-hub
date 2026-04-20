-- Create publication_reviews table for peer-review ratings
CREATE TABLE public.publication_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (publication_id, reviewer_id)
);

CREATE INDEX idx_publication_reviews_pub ON public.publication_reviews(publication_id);
CREATE INDEX idx_publication_reviews_reviewer ON public.publication_reviews(reviewer_id);

-- Enable RLS
ALTER TABLE public.publication_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews viewable by everyone"
ON public.publication_reviews FOR SELECT
USING (true);

-- Only authenticated users with professor/super_admin role can insert (and not their own publication)
CREATE POLICY "Members can insert reviews"
ON public.publication_reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id
  AND (public.has_role(auth.uid(), 'professor') OR public.has_role(auth.uid(), 'super_admin'))
);

-- Reviewer can update their own review
CREATE POLICY "Reviewer can update own review"
ON public.publication_reviews FOR UPDATE
USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'super_admin'));

-- Reviewer or admin can delete
CREATE POLICY "Reviewer or admin can delete"
ON public.publication_reviews FOR DELETE
USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'super_admin'));

-- Trigger: prevent owner from reviewing own publication, and require approved publications
CREATE OR REPLACE FUNCTION public.validate_publication_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_status content_status;
BEGIN
  SELECT profile_id, status INTO v_owner, v_status
  FROM public.publications WHERE id = NEW.publication_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Publication not found';
  END IF;

  IF v_owner = NEW.reviewer_id THEN
    RAISE EXCEPTION 'لا يمكنك تقييم بحثك الخاص';
  END IF;

  IF v_status <> 'approved' THEN
    RAISE EXCEPTION 'لا يمكن تقييم بحث غير معتمد';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_publication_review
BEFORE INSERT OR UPDATE ON public.publication_reviews
FOR EACH ROW EXECUTE FUNCTION public.validate_publication_review();

-- Trigger: keep updated_at fresh
CREATE TRIGGER trg_publication_reviews_updated_at
BEFORE UPDATE ON public.publication_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: notify publication owner when a new review is added
CREATE OR REPLACE FUNCTION public.notify_owner_on_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_title TEXT;
  v_reviewer_name TEXT;
BEGIN
  SELECT profile_id, title_ar INTO v_owner, v_title
  FROM public.publications WHERE id = NEW.publication_id;

  SELECT name_ar INTO v_reviewer_name
  FROM public.profiles WHERE id = NEW.reviewer_id;

  INSERT INTO public.notifications (user_id, title, message, type, link, ref_table, ref_id)
  VALUES (
    v_owner,
    '⭐ تقييم جديد على بحثك',
    COALESCE(v_reviewer_name, 'عضو') || ' قيّم بحثك "' || COALESCE(v_title, '') || '" بـ ' || NEW.rating || ' نجوم',
    'info',
    '/member/' || v_owner::text,
    'publication_reviews',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_owner_new_review
AFTER INSERT ON public.publication_reviews
FOR EACH ROW EXECUTE FUNCTION public.notify_owner_on_new_review();