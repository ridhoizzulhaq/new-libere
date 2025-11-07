-- ============================================
-- Libere Multi-Library System - Database Setup
-- ============================================
-- This script sets up the database schema for multi-library support
-- with per-library book visibility control and NFT tracking.

-- 1. Update libraries table with additional metadata columns
-- ============================================
ALTER TABLE libraries
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE libraries
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

ALTER TABLE libraries
  ADD COLUMN IF NOT EXISTS book_count INTEGER DEFAULT 0;

ALTER TABLE libraries
  ADD COLUMN IF NOT EXISTS borrow_count INTEGER DEFAULT 0;

ALTER TABLE libraries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create update trigger for libraries.updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_libraries_modtime ON libraries;
CREATE TRIGGER update_libraries_modtime
  BEFORE UPDATE ON libraries
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 2. Create library_books junction table
-- ============================================
-- Links books to libraries with visibility control
-- Each library can have different books with different visibility settings

CREATE TABLE IF NOT EXISTS library_books (
  id SERIAL PRIMARY KEY,
  library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT false, -- Default: hidden until manually enabled
  added_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP DEFAULT NOW(),
  UNIQUE(library_id, book_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_library_books_library ON library_books(library_id);
CREATE INDEX IF NOT EXISTS idx_library_books_book ON library_books(book_id);
CREATE INDEX IF NOT EXISTS idx_library_books_visible ON library_books(library_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_library_books_lookup ON library_books(library_id, book_id, is_visible);

-- 3. Insert/Update "The Room 19" library
-- ============================================
INSERT INTO libraries (
  name,
  address,
  description,
  logo_url,
  member_count,
  book_count,
  borrow_count
) VALUES (
  'The Room 19',
  '0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0',
  'Bandung Public Library serves the creative community of Bandung with a curated selection of digital books. From Indonesian literature to international bestsellers, our collection reflects the vibrant cultural scene of Kota Kembang.',
  '/library-logos/room19.png',
  843,  -- Mock data: member count
  98,   -- Mock data: book count (visible books)
  267   -- Mock data: total borrow/salinan count
)
ON CONFLICT (address) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  member_count = EXCLUDED.member_count,
  book_count = EXCLUDED.book_count,
  borrow_count = EXCLUDED.borrow_count,
  updated_at = NOW();

-- 4. Create helper view for library stats
-- ============================================
CREATE OR REPLACE VIEW library_stats AS
SELECT
  l.id,
  l.name,
  l.address,
  l.description,
  l.logo_url,
  l.member_count,
  COUNT(DISTINCT lb.book_id) FILTER (WHERE lb.is_visible = true) as visible_book_count,
  COUNT(DISTINCT lb.book_id) as total_book_count,
  l.borrow_count,
  l.created_at,
  l.updated_at
FROM libraries l
LEFT JOIN library_books lb ON l.id = lb.library_id
GROUP BY l.id;

-- 5. Create function to sync library book count
-- ============================================
CREATE OR REPLACE FUNCTION sync_library_book_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE libraries
  SET book_count = (
    SELECT COUNT(*)
    FROM library_books
    WHERE library_id = NEW.library_id
      AND is_visible = true
  ),
  updated_at = NOW()
  WHERE id = NEW.library_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update book_count when library_books changes
DROP TRIGGER IF EXISTS sync_library_book_count_trigger ON library_books;
CREATE TRIGGER sync_library_book_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON library_books
  FOR EACH ROW EXECUTE FUNCTION sync_library_book_count();

-- ============================================
-- Usage Instructions
-- ============================================
--
-- To add a book to a library (initially hidden):
--   INSERT INTO library_books (library_id, book_id, is_visible)
--   VALUES (1, 123, false)
--   ON CONFLICT (library_id, book_id) DO NOTHING;
--
-- To make a book visible in a library:
--   UPDATE library_books
--   SET is_visible = true
--   WHERE library_id = 1 AND book_id = 123;
--
-- To get all visible books for a library:
--   SELECT b.*
--   FROM "Book" b
--   INNER JOIN library_books lb ON b.id = lb.book_id
--   WHERE lb.library_id = 1 AND lb.is_visible = true;
--
-- To get library stats:
--   SELECT * FROM library_stats WHERE id = 1;
--
-- ============================================

COMMENT ON TABLE library_books IS 'Junction table linking books to libraries with visibility control';
COMMENT ON COLUMN library_books.is_visible IS 'Controls whether this book is shown in the library UI (default: false)';
COMMENT ON COLUMN library_books.last_synced IS 'Last time this book was detected in blockchain (from Blockscout API)';
COMMENT ON VIEW library_stats IS 'Aggregated statistics for each library with visible book counts';
