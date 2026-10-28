CREATE POLICY "Authenticated users upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners update their business media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-media' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'business-media' AND owner = auth.uid());

CREATE POLICY "Owners delete their business media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-media' AND owner = auth.uid());

CREATE POLICY "Owners read their business media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'business-media' AND owner = auth.uid());