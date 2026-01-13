-- Create virtual_tours table for video content
CREATE TABLE public.virtual_tours (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.virtual_tours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage virtual tours" 
ON public.virtual_tours 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view visible virtual tours" 
ON public.virtual_tours 
FOR SELECT 
USING (is_visible = true);

-- Create update trigger for updated_at
CREATE TRIGGER update_virtual_tours_updated_at
BEFORE UPDATE ON public.virtual_tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();