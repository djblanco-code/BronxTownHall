CREATE POLICY "org logos are viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-logos');

CREATE POLICY "users upload their org logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'org-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users update their org logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'org-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users delete their org logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'org-logos' AND (storage.foldername(name))[1] = auth.uid()::text);