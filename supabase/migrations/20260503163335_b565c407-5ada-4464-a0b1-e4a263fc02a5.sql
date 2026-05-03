CREATE TABLE public.dean_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name_ar TEXT NOT NULL DEFAULT '',
  name_en TEXT,
  title_ar TEXT,
  title_en TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  message_ar TEXT,
  message_en TEXT,
  vision_ar TEXT,
  vision_en TEXT,
  mission_ar TEXT,
  mission_en TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dean_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dean profile viewable by everyone" ON public.dean_profile FOR SELECT USING (true);
CREATE POLICY "Dean or admin insert dean profile" ON public.dean_profile FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Dean or admin update dean profile" ON public.dean_profile FOR UPDATE
  USING (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin delete dean profile" ON public.dean_profile FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_dean_profile_updated BEFORE UPDATE ON public.dean_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.college_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  year INTEGER,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.college_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "College achievements viewable by everyone" ON public.college_achievements FOR SELECT USING (true);
CREATE POLICY "Dean or admin manage college achievements" ON public.college_achievements FOR ALL
  USING (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_college_achievements_updated BEFORE UPDATE ON public.college_achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.college_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.college_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "College news viewable by everyone" ON public.college_news FOR SELECT USING (true);
CREATE POLICY "Dean or admin manage college news" ON public.college_news FOR ALL
  USING (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'dean') OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_college_news_updated BEFORE UPDATE ON public.college_news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();