-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    roll_number TEXT NOT NULL UNIQUE,
    register_number TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    department TEXT DEFAULT 'CSE',
    section TEXT,
    batch_year INTEGER,
    current_semester INTEGER,
    admission_year INTEGER,
    parent_name TEXT,
    parent_phone TEXT,
    address TEXT,
    blood_group TEXT,
    avatar_url TEXT,
    avatar_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Admins can manage all students
CREATE POLICY "Admins can manage students"
ON public.students
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Students can view their own record
CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
USING (user_id = auth.uid());

-- Students can update limited fields on their own record
CREATE POLICY "Students can update own avatar"
ON public.students
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Faculty can view students
CREATE POLICY "Faculty can view students"
ON public.students
FOR SELECT
USING (public.has_role(auth.uid(), 'faculty'));

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at 
BEFORE UPDATE ON public.students 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_students_roll_number ON public.students(roll_number);
CREATE INDEX idx_students_batch_section ON public.students(batch_year, section);
CREATE INDEX idx_students_department ON public.students(department);