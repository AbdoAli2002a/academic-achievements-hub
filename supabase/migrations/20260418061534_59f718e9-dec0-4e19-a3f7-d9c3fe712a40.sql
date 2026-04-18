-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Achievement images bucket (public) - for awards/certificates/events images
INSERT INTO storage.buckets (id, name, public) VALUES ('achievements', 'achievements', true)
ON CONFLICT (id) DO NOTHING;

-- Avatar policies: anyone can view, owner can manage their own folder
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Achievements policies
CREATE POLICY "Achievement images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'achievements');

CREATE POLICY "Users can upload their own achievement images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own achievement images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own achievement images"
ON storage.objects FOR DELETE
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);