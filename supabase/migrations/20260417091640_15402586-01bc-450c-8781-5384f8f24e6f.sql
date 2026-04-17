-- =========================================
-- منصة إنجاز الأكاديمية - الهيكل الكامل
-- =========================================

-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin', 'professor', 'visitor');
CREATE TYPE public.academic_rank AS ENUM ('professor', 'associate', 'lecturer', 'assistant');
CREATE TYPE public.content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.publication_type AS ENUM ('journal', 'conference', 'book', 'chapter', 'thesis', 'other');
CREATE TYPE public.event_type AS ENUM ('conference', 'workshop', 'seminar', 'training', 'community', 'other');
CREATE TYPE public.member_status AS ENUM ('active', 'suspended', 'inactive');

-- =========================================
-- 1) DEPARTMENTS
-- =========================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'Building2',
  color_class TEXT DEFAULT 'from-blue-500/10 to-cyan-500/10',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- 2) PROFILES (faculty members)
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  initials TEXT,
  rank public.academic_rank,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  specialty_ar TEXT,
  specialty_en TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  avatar_url TEXT,
  phone TEXT,
  office_location TEXT,
  website_url TEXT,
  scholar_url TEXT,
  orcid TEXT,
  years_exp INT DEFAULT 0,
  status public.member_status NOT NULL DEFAULT 'active',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_dept   ON public.profiles(department_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_rank   ON public.profiles(rank);

-- =========================================
-- 3) USER ROLES
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- Security Definer function (no recursion in RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================
-- 4) PUBLICATIONS
-- =========================================
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  type public.publication_type NOT NULL DEFAULT 'journal',
  publication_year INT NOT NULL,
  publisher TEXT,
  journal_name TEXT,
  doi TEXT,
  url TEXT,
  authors TEXT,
  abstract TEXT,
  citations_count INT DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pubs_profile ON public.publications(profile_id);
CREATE INDEX idx_pubs_status  ON public.publications(status);
CREATE INDEX idx_pubs_year    ON public.publications(publication_year DESC);

-- =========================================
-- 5) CERTIFICATES
-- =========================================
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  issuer TEXT NOT NULL,
  year INT NOT NULL,
  url TEXT,
  image_url TEXT,
  description TEXT,
  status public.content_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_certs_profile ON public.certificates(profile_id);
CREATE INDEX idx_certs_status  ON public.certificates(status);

-- =========================================
-- 6) AWARDS
-- =========================================
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  granting_body TEXT NOT NULL,
  year INT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  status public.content_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_awards_profile ON public.awards(profile_id);
CREATE INDEX idx_awards_status  ON public.awards(status);

-- =========================================
-- 7) EVENTS
-- =========================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  type public.event_type NOT NULL DEFAULT 'conference',
  event_date DATE NOT NULL,
  location TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url TEXT,
  status public.content_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_profile ON public.events(profile_id);
CREATE INDEX idx_events_status  ON public.events(status);

-- =========================================
-- 8) BADGES (catalog)
-- =========================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT NOT NULL DEFAULT 'Award',
  color TEXT DEFAULT 'gold',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- 9) MEMBER BADGES
-- =========================================
CREATE TABLE public.member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  UNIQUE (profile_id, badge_id)
);
CREATE INDEX idx_member_badges_profile ON public.member_badges(profile_id);

-- =========================================
-- TRIGGER FUNCTIONS
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated  BEFORE UPDATE ON public.profiles     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_depts_updated     BEFORE UPDATE ON public.departments  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pubs_updated      BEFORE UPDATE ON public.publications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_certs_updated     BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_awards_updated    BEFORE UPDATE ON public.awards       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_events_updated    BEFORE UPDATE ON public.events       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name_ar, name_en)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name_ar', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name_en', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  -- default role: visitor (admin promotes to professor/super_admin manually)
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'visitor');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- RLS — enable on all tables
-- =========================================
ALTER TABLE public.departments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_badges  ENABLE ROW LEVEL SECURITY;

-- ---------- DEPARTMENTS ----------
CREATE POLICY "Departments are viewable by everyone"
  ON public.departments FOR SELECT USING (true);
CREATE POLICY "Only admins can manage departments"
  ON public.departments FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ---------- PROFILES ----------
CREATE POLICY "Active profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (status = 'active' OR auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR auth.uid() = id);
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ---------- USER ROLES ----------
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ---------- Generic content policies (publications, certificates, awards, events) ----------
-- Public sees only approved
CREATE POLICY "Approved publications viewable by everyone"
  ON public.publications FOR SELECT
  USING (status = 'approved' OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners can insert their publications"
  ON public.publications FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Owners can update their pending publications"
  ON public.publications FOR UPDATE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners or admins can delete publications"
  ON public.publications FOR DELETE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Approved certificates viewable by everyone"
  ON public.certificates FOR SELECT
  USING (status = 'approved' OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners can insert certificates"
  ON public.certificates FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Owners can update certificates"
  ON public.certificates FOR UPDATE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners or admins can delete certificates"
  ON public.certificates FOR DELETE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Approved awards viewable by everyone"
  ON public.awards FOR SELECT
  USING (status = 'approved' OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners can insert awards"
  ON public.awards FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Owners can update awards"
  ON public.awards FOR UPDATE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners or admins can delete awards"
  ON public.awards FOR DELETE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Approved events viewable by everyone"
  ON public.events FOR SELECT
  USING (status = 'approved' OR auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners can insert events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Owners can update events"
  ON public.events FOR UPDATE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners or admins can delete events"
  ON public.events FOR DELETE
  USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- BADGES ----------
CREATE POLICY "Badges viewable by everyone"
  ON public.badges FOR SELECT USING (true);
CREATE POLICY "Only admins can manage badges"
  ON public.badges FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Member badges viewable by everyone"
  ON public.member_badges FOR SELECT USING (true);
CREATE POLICY "Only admins can grant badges"
  ON public.member_badges FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================
-- SEED DATA — departments + badges
-- =========================================
INSERT INTO public.departments (key, name_ar, name_en, icon, color_class, display_order) VALUES
  ('artEd',     'التربية الفنية',       'Art Education',           'Palette',     'from-pink-500/10 to-rose-500/10',     1),
  ('musicEd',   'التربية الموسيقية',    'Music Education',         'Music2',      'from-purple-500/10 to-indigo-500/10', 2),
  ('homeEc',    'الاقتصاد المنزلي',     'Home Economics',          'Home',        'from-amber-500/10 to-orange-500/10',  3),
  ('eduTech',   'تكنولوجيا التعليم',    'Educational Technology',  'MonitorPlay', 'from-blue-500/10 to-cyan-500/10',     4),
  ('eduMedia',  'الإعلام التربوي',      'Educational Media',       'Radio',       'from-emerald-500/10 to-teal-500/10',  5);

INSERT INTO public.badges (key, name_ar, name_en, icon, description_ar, description_en) VALUES
  ('topPublisher',     'الأكثر نشراً',        'Top Publisher',           'BookOpen',     'وسام لمن نشر أكثر من 30 بحثاً',         'Awarded for over 30 publications'),
  ('communityService', 'خدمة المجتمع',        'Community Service',       'Heart',        'وسام لخدمة المجتمع المتميزة',          'For outstanding community service'),
  ('excellence',       'وسام التميز',         'Excellence Award',        'Crown',        'وسام التميز العام',                     'General excellence award'),
  ('research',         'باحث متميز',          'Distinguished Researcher','Sparkles',     'وسام للأبحاث ذات التأثير العالي',       'For high-impact research'),
  ('teaching',         'التميز في التدريس',   'Teaching Excellence',     'GraduationCap','وسام التميز في التدريس',                'For teaching excellence');