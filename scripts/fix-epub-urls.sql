-- Fix EPUB URLs in Book table
-- Convert from public URLs to storage paths for private bucket
--
-- Run this in Supabase Dashboard → SQL Editor
--
-- BEFORE: https://mbgbxpmgjrtmjibygpdc.supabase.co/storage/v1/object/public/libere-books/1761747515/book.epub
-- AFTER:  libere-books/1761747515/book.epub

-- Update all books that have public storage URLs
UPDATE "Book"
SET epub = REGEXP_REPLACE(
  epub,
  'https://mbgbxpmgjrtmjibygpdc\.supabase\.co/storage/v1/object/public/(libere-books/\d+/book\.epub)',
  '\1'
)
WHERE epub LIKE '%/storage/v1/object/public/libere-books%';

-- Verify the changes
SELECT
  id,
  title,
  epub,
  CASE
    WHEN epub LIKE 'libere-books/%' THEN '✅ Storage Path'
    WHEN epub LIKE '%ipfs%' OR epub LIKE '%pinata%' THEN '📦 IPFS'
    WHEN epub LIKE '%supabase.co/storage%' THEN '⚠️ Storage URL'
    ELSE '❓ Unknown'
  END as format
FROM "Book"
ORDER BY id;
