-- Create storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-images', 'landing-images', true);

-- Create storage policies for landing images
CREATE POLICY "Anyone can view landing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'landing-images');

CREATE POLICY "Admins can upload landing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update landing images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete landing images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'landing-images' AND public.has_role(auth.uid(), 'admin'));