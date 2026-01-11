-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');

-- Create user_roles table (roles stored separately from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT,
    designation TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create landing_page_sections table (for managing section visibility and order)
CREATE TABLE public.landing_page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;

-- Public can read visible sections
CREATE POLICY "Anyone can view sections"
ON public.landing_page_sections
FOR SELECT
USING (true);

-- Only admins can manage sections
CREATE POLICY "Admins can manage sections"
ON public.landing_page_sections
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create landing_page_content table (for text content)
CREATE TABLE public.landing_page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    content_key TEXT NOT NULL,
    title TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(section_key, content_key)
);

-- Enable RLS
ALTER TABLE public.landing_page_content ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Anyone can view published content"
ON public.landing_page_content
FOR SELECT
USING (is_published = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage content"
ON public.landing_page_content
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create landing_page_images table
CREATE TABLE public.landing_page_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.landing_page_images ENABLE ROW LEVEL SECURITY;

-- Public can view visible images
CREATE POLICY "Anyone can view visible images"
ON public.landing_page_images
FOR SELECT
USING (is_visible = true);

-- Admins can manage images
CREATE POLICY "Admins can manage images"
ON public.landing_page_images
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'department',
    image_url TEXT,
    achievement_date DATE,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Public can view visible achievements
CREATE POLICY "Anyone can view visible achievements"
ON public.achievements
FOR SELECT
USING (is_visible = true);

-- Admins can manage achievements
CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    image_url TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view visible events
CREATE POLICY "Anyone can view visible events"
ON public.events
FOR SELECT
USING (is_visible = true);

-- Admins can manage events
CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create faculty table
CREATE TABLE public.faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    designation TEXT,
    specialization TEXT,
    qualification TEXT,
    experience_years INTEGER,
    email TEXT,
    phone TEXT,
    image_url TEXT,
    bio TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Public can view visible faculty
CREATE POLICY "Anyone can view visible faculty"
ON public.faculty
FOR SELECT
USING (is_visible = true);

-- Admins can manage faculty
CREATE POLICY "Admins can manage faculty"
ON public.faculty
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create programs table
CREATE TABLE public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    degree_type TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    eligibility TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Public can view visible programs
CREATE POLICY "Anyone can view visible programs"
ON public.programs
FOR SELECT
USING (is_visible = true);

-- Admins can manage programs
CREATE POLICY "Admins can manage programs"
ON public.programs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create infrastructure/labs table
CREATE TABLE public.infrastructure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    capacity INTEGER,
    equipment TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.infrastructure ENABLE ROW LEVEL SECURITY;

-- Public can view visible infrastructure
CREATE POLICY "Anyone can view visible infrastructure"
ON public.infrastructure
FOR SELECT
USING (is_visible = true);

-- Admins can manage infrastructure
CREATE POLICY "Admins can manage infrastructure"
ON public.infrastructure
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create content_versions table for version history
CREATE TABLE public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    previous_data JSONB NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Only admins can view version history
CREATE POLICY "Admins can view version history"
ON public.content_versions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_page_sections_updated_at BEFORE UPDATE ON public.landing_page_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_page_content_updated_at BEFORE UPDATE ON public.landing_page_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_page_images_updated_at BEFORE UPDATE ON public.landing_page_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_infrastructure_updated_at BEFORE UPDATE ON public.infrastructure FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default landing page sections
INSERT INTO public.landing_page_sections (section_key, title, display_order, is_visible) VALUES
('hero', 'Hero Section', 1, true),
('about', 'About Department', 2, true),
('programs', 'Programs Offered', 3, true),
('faculty', 'Faculty', 4, true),
('research', 'Research & Publications', 5, true),
('achievements', 'Achievements', 6, true),
('events', 'Events & Announcements', 7, true),
('infrastructure', 'Infrastructure & Labs', 8, true);

-- Insert default content
INSERT INTO public.landing_page_content (section_key, content_key, title, content) VALUES
('hero', 'main', 'Department of Computer Science and Engineering', 'Empowering Future Innovators Through Excellence in Computing'),
('about', 'main', 'About the Department', 'The Department of Computer Science and Engineering was started in 2001 with the primary objective of providing world class education in the field of Computer Science and Engineering. The department offers undergraduate program B.E. Computer Science and Engineering, postgraduate program M.E. Computer Science and Engineering and research programs leading to Ph.D. degree.'),
('about', 'vision', 'Vision', 'To be a center of excellence in Computer Science and Engineering education and research, producing competent professionals who can contribute to the technological advancement of the nation.'),
('about', 'mission', 'Mission', 'To impart quality education and training in Computer Science and Engineering to meet the challenges of the industry and society.');