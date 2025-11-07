---
noteId: "14bccad0b7c611f08d56a990e7f97797"
tags: []

---

# Phase 0: EPUB Migration Guide

This guide helps you migrate existing EPUB files from IPFS/Pinata to Supabase Storage.

## 📋 Prerequisites Checklist

Before running the migration, ensure you have completed:

- [ ] **Supabase Storage Setup** (see [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md))
  - [ ] Created `libere-books` bucket
  - [ ] Configured RLS policies
  - [ ] Tested signed URL generation
- [ ] **Environment Variables** configured in `.env`:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_API_KEY=your_anon_public_key
  ```
- [ ] **Dependencies Installed**:
  ```bash
  npm install
  ```

---

## 🚀 Quick Start

### Step 1: Test Migration (Dry Run)

First, run a dry run to preview what will be migrated without making any changes:

```bash
npm run migrate:epub:dry-run
```

**Expected output:**
```
========================================
📚 EPUB Migration: IPFS → Supabase Storage
========================================

🔍 DRY RUN MODE - No changes will be made

📊 Fetching books from database...
✓ Found 5 book(s) to process

📖 Migrating Book #1: "The Great Gatsby" by F. Scott Fitzgerald
  🔍 [DRY RUN] Would migrate: https://gateway.pinata.cloud/ipfs/Qm.../book.epub

...

========================================
📊 Migration Summary
========================================

✅ Successful: 5
   └─ Migrated: 5
   └─ Skipped (already migrated): 0
❌ Failed: 0

🔍 This was a dry run. No changes were made.
   Run without DRY_RUN=true to perform actual migration.
========================================
```

---

### Step 2: Run Actual Migration

If the dry run looks good, proceed with the actual migration:

```bash
npm run migrate:epub
```

**This will:**
1. Download each EPUB from IPFS/Pinata
2. Upload to Supabase Storage (`libere-books/{bookId}/book.epub`)
3. Update database `epub` column with new Supabase URL
4. **Leave `metadataUri` (cover images) unchanged on IPFS**

**Expected output:**
```
📖 Migrating Book #1: "The Great Gatsby" by F. Scott Fitzgerald
  📥 Downloading from IPFS: https://gateway.pinata.cloud/ipfs/...
  ✓ Downloaded 2.5 MB
  📤 Uploading to Supabase: 1/book.epub
  ✓ Uploaded successfully
  💾 Updating database...
  ✓ Database updated
  ✅ Migration completed successfully

...

========================================
📊 Migration Summary
========================================

✅ Successful: 5
   └─ Migrated: 5
   └─ Skipped (already migrated): 0
❌ Failed: 0

📦 Total data migrated: 12.45 MB

✓ Migrated Books:
   - Book #1: The Great Gatsby (2.5 MB)
   - Book #2: 1984 (2.8 MB)
   ...

========================================
✅ Migration completed!
========================================
```

---

## 🎯 Migrate Specific Books Only

To migrate only specific book IDs:

```bash
BOOK_IDS=1,2,3 npm run migrate:epub
```

Or with dry run:

```bash
BOOK_IDS=1,2,3 npm run migrate:epub:dry-run
```

---

## ✅ Verification

After migration, verify the changes:

### 1. Check Database

```sql
-- Check that epub URLs have changed
SELECT id, title, epub
FROM "Book"
WHERE epub LIKE '%supabase.co%';

-- Old IPFS URLs (if any remain)
SELECT id, title, epub
FROM "Book"
WHERE epub LIKE '%ipfs%' OR epub LIKE '%pinata%';
```

### 2. Test EPUB Loading

1. Open the app: `npm run dev`
2. Navigate to [http://localhost:5173/bookselfs](http://localhost:5173/bookselfs)
3. Click on a migrated book to read
4. Verify the EPUB loads correctly (not the demo Alice in Wonderland!)

### 3. Check Browser Console

Open DevTools console and look for:
```
📚 [LoadBook] Fetching book #1 from database...
✅ [LoadBook] Book fetched: The Great Gatsby
🔐 [LoadBook] Generating signed URL for Supabase Storage...
✅ [LoadBook] Signed URL generated (expires in 1 hour)
✅ [LoadBook] EPUB URL ready: https://[project].supabase.co/storage/v1/object/sign/...
```

---

## 🔄 Re-running Migration

The migration script is **idempotent** - it can be run multiple times safely:

- Already migrated books (Supabase URLs) will be skipped
- Books with IPFS URLs will be re-downloaded and re-uploaded
- Existing files in Supabase Storage will be overwritten

To force re-migration of all books:
```bash
npm run migrate:epub
```

---

## ❌ Troubleshooting

### Issue: "Permission denied" during upload

**Solution:** Verify RLS policies are configured correctly in Supabase dashboard:

```sql
-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

Ensure you have the "Authenticated users can upload EPUBs" policy.

---

### Issue: "Failed to fetch book" during migration

**Possible causes:**
1. Book record doesn't exist in database
2. `epub` column is null or empty
3. IPFS URL is no longer accessible

**Solution:** Check the book record:
```sql
SELECT id, title, epub FROM "Book" WHERE id = <book_id>;
```

---

### Issue: IPFS download times out

**Solution:** Some IPFS gateways can be slow. The script will retry automatically. If it consistently fails:

1. Try migrating one book at a time:
   ```bash
   BOOK_IDS=1 npm run migrate:epub
   ```

2. Check if the IPFS URL is accessible manually in your browser

3. Consider using a different IPFS gateway (requires code modification)

---

### Issue: Migration succeeds but EPUB won't load in reader

**Check these:**

1. **Signed URL generation:** Verify in browser console
2. **CORS settings:** Ensure Supabase Storage has CORS enabled
3. **File integrity:** Check file size in Supabase dashboard matches original

**Debug command:**
```typescript
// In browser console
const { data, error } = await supabase.storage
  .from('libere-books')
  .createSignedUrl('1/book.epub', 3600);
console.log(data);
```

---

## 📊 Migration Statistics

After successful migration, you'll have:

- ✅ **EPUBs:** Supabase Storage (private, authenticated)
- ✅ **Covers:** IPFS/Pinata (public, immutable)
- ✅ **Metadata:** Supabase database (structured)

**Before:**
```
Book #1:
  metadataUri: https://gateway.pinata.cloud/ipfs/Qm.../cover.png (unchanged)
  epub: https://gateway.pinata.cloud/ipfs/Qm.../book.epub (old)
```

**After:**
```
Book #1:
  metadataUri: https://gateway.pinata.cloud/ipfs/Qm.../cover.png (unchanged)
  epub: https://[project].supabase.co/storage/v1/object/public/libere-books/1/book.epub (new)
```

---

## 🎉 What's Next?

After successful migration, proceed to:

- **Phase 0.3:** Update admin-publish tool to upload new books to Supabase
- **Phase 1:** Setup PWA infrastructure for offline capabilities
- **Phase 2:** Implement JWT ownership tokens for secure offline access

---

## 🗑️ Cleanup (Optional)

After verifying all books work correctly, you can optionally:

1. **Remove old EPUBs from IPFS/Pinata** (to save storage costs)
   - ⚠️ **Warning:** Only do this after thorough testing!
   - ⚠️ Keep backups before deleting

2. **Update .env to remove Pinata credentials** (if covers are also migrated)
   - Currently covers are still on IPFS, so **keep Pinata credentials**

---

## 📝 Rollback Plan

If you need to roll back the migration:

1. **Restore database backup:**
   ```sql
   -- Restore epub URLs to IPFS
   UPDATE "Book"
   SET epub = '<old_ipfs_url>'
   WHERE id = <book_id>;
   ```

2. **Delete Supabase Storage files:**
   ```sql
   DELETE FROM storage.objects
   WHERE bucket_id = 'libere-books';
   ```

3. **Re-run the app** - it will fall back to IPFS URLs

---

## 📞 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Review [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md) for configuration
3. Verify environment variables are correct
4. Test with a single book first using `BOOK_IDS=1`

---

## ✅ Success Checklist

Migration is complete when:

- [ ] All books show ✅ in migration summary
- [ ] Database `epub` column contains Supabase URLs
- [ ] Books can be opened and read in the app
- [ ] No more hardcoded demo book (Alice in Wonderland)
- [ ] Browser console shows signed URL generation
- [ ] Cover images still load (from IPFS)

**Congratulations! Phase 0 is complete. You can now proceed to Phase 1.**
