-- =====================================================
-- TEMPORARY PUBLIC POLICIES - FOR MIGRATION ONLY!
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Allow PUBLIC upload (temporary, for migration script)
CREATE POLICY "TEMP: Allow public upload for migration"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'libere-books');

-- Allow PUBLIC read (temporary, for migration script)
CREATE POLICY "TEMP: Allow public read for migration"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'libere-books');

-- Allow PUBLIC update (temporary, for migration script)
CREATE POLICY "TEMP: Allow public update for migration"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'libere-books')
WITH CHECK (bucket_id = 'libere-books');

-- =====================================================
-- AFTER MIGRATION: DELETE THESE POLICIES!
-- =====================================================

/*

-- Run these commands AFTER migration completes:

DROP POLICY IF EXISTS "TEMP: Allow public upload for migration" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow public read for migration" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow public update for migration" ON storage.objects;

*/
