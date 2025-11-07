-- =====================================================
-- CLEANUP: Remove Temporary Public Policies
-- Run this AFTER migration completes!
-- =====================================================

-- Drop temporary public policies
DROP POLICY IF EXISTS "TEMP: Allow public upload for migration" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow public read for migration" ON storage.objects;
DROP POLICY IF EXISTS "TEMP: Allow public update for migration" ON storage.objects;

-- Verify policies remaining (should only show authenticated policies)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
