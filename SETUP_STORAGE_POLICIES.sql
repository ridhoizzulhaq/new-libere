-- =====================================================
-- Supabase Storage Policies Setup
--
-- Run this SQL in Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Allow PUBLIC upload (untuk migration script)
-- Note: Ganti ke authenticated setelah migration selesai!
CREATE POLICY "Allow public upload during migration"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'libere-books');

-- 2. Allow PUBLIC read (untuk migration script)
-- Note: Ganti ke authenticated setelah migration selesai!
CREATE POLICY "Allow public read during migration"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'libere-books');

-- 3. Allow PUBLIC update (optional, untuk overwrite files)
CREATE POLICY "Allow public update during migration"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'libere-books')
WITH CHECK (bucket_id = 'libere-books');

-- 4. Allow PUBLIC delete (optional, untuk cleanup)
CREATE POLICY "Allow public delete during migration"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'libere-books');

-- =====================================================
-- AFTER MIGRATION: Replace with secure policies
-- =====================================================

-- Run these commands AFTER migration completes:

/*

-- Drop temporary public policies
DROP POLICY IF EXISTS "Allow public upload during migration" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read during migration" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update during migration" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete during migration" ON storage.objects;

-- Create secure authenticated-only policies
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'libere-books');

CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'libere-books');

CREATE POLICY "Allow authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'libere-books')
WITH CHECK (bucket_id = 'libere-books');

-- Admin delete only (optional)
CREATE POLICY "Admin delete only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'libere-books'
  AND auth.jwt() ->> 'role' = 'admin'
);

*/
