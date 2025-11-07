---
noteId: "c761f2f0b7ee11f08d56a990e7f97797"
tags: []

---

# Migration Guide: IPFS to Supabase Storage

Panduan lengkap untuk migrasi EPUB files dari IPFS/Pinata ke Supabase Storage bucket.

## Quick Start

### 1. Setup Supabase Storage Bucket

Ikuti panduan di [SUPABASE_STORAGE_INTEGRATION.md](SUPABASE_STORAGE_INTEGRATION.md) untuk:

1. ✅ Buat bucket `libere-books` (private)
2. ✅ Setup storage policies untuk authenticated access
3. ✅ Verify environment variables di `.env`

### 2. Run Migration

**Option A: Migrate all books** (Recommended):
```bash
npm run migrate:simple
```

**Option B: Migrate specific books** by ID:
```bash
npm run migrate:simple -- 1 2 3
```

**Option C: Advanced migration** with batching and retry:
```bash
npm run migrate:epubs
```

### 3. Verify Migration

1. Check Supabase Dashboard → Storage → libere-books
2. Check database:
   ```sql
   SELECT id, title, epub FROM "Book" LIMIT 10;
   ```
3. Test di web app: buka book dan read EPUB

## Pre-Migration Checklist

Sebelum menjalankan migration, pastikan:

- [ ] Supabase bucket `libere-books` sudah dibuat
- [ ] Bucket setting: **Private** (not public)
- [ ] Storage policies sudah disetup
- [ ] Environment variables sudah benar di `.env`:
  ```bash
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_API_KEY=your_anon_key
  ```
- [ ] Dependencies sudah terinstall (`npm install`)
- [ ] Database backup sudah dibuat (optional, recommended)

## Migration Scripts

### Simple Migration (`migrate-simple.ts`)

**Recommended untuk most use cases**.

**Features**:
- Simple and fast
- Clear progress logging
- Migrate all or specific books
- 1 second delay between books
- Error handling with clear messages

**Usage**:
```bash
# Migrate all books
npm run migrate:simple

# Migrate specific books
tsx scripts/migrate-simple.ts 1 2 3
```

**Process**:
1. Fetch book from database
2. Check if already migrated (skip if yes)
3. Download EPUB from IPFS
4. Upload to Supabase Storage
5. Update database with new URL
6. Show summary report

### Advanced Migration (`migrate-epubs-to-supabase.ts`)

**For large-scale migrations with advanced features**.

**Features**:
- Batch processing (5 books per batch)
- Retry logic (3 attempts per book)
- Detailed JSON report saved to file
- Rate limiting protection (3s delay between batches)
- Comprehensive error handling

**Usage**:
```bash
npm run migrate:epubs
```

**Output**:
- Console logs with progress
- `migration-report.json` with detailed results

## What Happens During Migration?

### Step 1: Fetch Books
```
📚 Fetching books from database...
✅ Found 10 books
   - IPFS (needs migration): 8
   - Supabase Storage (already migrated): 2
```

### Step 2: Download from IPFS
```
📖 Migrating Book ID: 1
   Title: Introduction to Blockchain
   📥 Downloading from IPFS...
   ✅ Downloaded 2.34 MB
```

### Step 3: Upload to Supabase
```
   📤 Uploading to Supabase Storage...
   ✅ Uploaded to Supabase
   New URL: https://xxx.supabase.co/storage/v1/object/public/libere-books/1/book.epub
```

### Step 4: Update Database
```
   💾 Updating database...
   ✅ Database updated
   🎉 Migration completed for Book 1!
```

### Step 5: Summary Report
```
============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successful: 8
❌ Failed: 0
⏭️  Skipped: 2 (already migrated)
============================================================
```

## File Structure After Migration

```
Supabase Storage Bucket: libere-books/
├── 1/
│   └── book.epub          (Book ID 1)
├── 2/
│   └── book.epub          (Book ID 2)
├── 3/
│   └── book.epub          (Book ID 3)
└── ...
```

Database `Book` table:
```
id  | title                  | epub
----|------------------------|----------------------------------------
1   | Introduction to...     | https://xxx.supabase.co/storage/v1/...
2   | Advanced Programming   | https://xxx.supabase.co/storage/v1/...
3   | Web Development        | https://ipfs.io/ipfs/QmXXX... (not migrated yet)
```

## Verification Steps

### 1. Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: Storage → libere-books
4. Verify files exist with structure: `{bookId}/book.epub`

### 2. Check Database

```sql
-- Check migrated books
SELECT id, title, epub
FROM "Book"
WHERE epub LIKE '%supabase.co/storage%';

-- Check IPFS books (not yet migrated)
SELECT id, title, epub
FROM "Book"
WHERE epub LIKE '%ipfs%' OR epub LIKE '%pinata%';
```

### 3. Test in Web App

```bash
npm run dev
```

1. Login to app
2. Go to Bookshelf (if you own books)
3. Click "Read Now" on any book
4. Book should open with EPUB from Supabase Storage
5. Check browser console for logs:
   ```
   ✅ [LoadBook] EPUB URL ready: https://xxx.supabase.co/storage/v1/object/sign/...
   ```

### 4. Test Signed URL Generation

Open browser console di EPUB reader page:

```javascript
// Should see logs like:
🔐 [LoadBook] Generating signed URL for Supabase Storage...
✅ [LoadBook] Signed URL generated (expires in 1 hour)
📖 [Reader] Rendition loaded
```

## Troubleshooting

### Error: "Failed to upload to Supabase"

**Symptoms**:
```
❌ Migration failed: Upload failed: The resource already exists
```

**Causes**:
- File already exists in bucket
- Permissions issue
- Bucket doesn't exist

**Solutions**:

1. **Check bucket exists**:
   - Go to Supabase Dashboard → Storage
   - Verify `libere-books` bucket exists

2. **Check permissions**:
   ```sql
   -- Run in SQL Editor
   SELECT * FROM storage.policies WHERE bucket_id = 'libere-books';
   ```

3. **Manual cleanup** (if needed):
   ```typescript
   // Remove existing file
   await supabase.storage
     .from('libere-books')
     .remove(['1/book.epub']);
   ```

### Error: "Failed to download from IPFS"

**Symptoms**:
```
❌ Migration failed: Failed to download from IPFS: timeout of 60000ms exceeded
```

**Causes**:
- IPFS gateway slow or down
- Network issues
- File doesn't exist

**Solutions**:

1. **Test IPFS URL manually** in browser
2. **Increase timeout** in script:
   ```typescript
   // Edit migrate-simple.ts
   timeout: 120000, // 2 minutes instead of 1
   ```
3. **Try different gateway**:
   - Change `gateway.pinata.cloud` to `ipfs.io`
   - Or use `cloudflare-ipfs.com`

### Error: "Database update failed"

**Symptoms**:
```
❌ Migration failed: Database update failed: permission denied
```

**Causes**:
- Invalid API key
- Table permissions
- Row Level Security (RLS) blocking update

**Solutions**:

1. **Check API key**:
   ```bash
   # In .env file
   VITE_SUPABASE_API_KEY=your_anon_key  # Should be anon/public key
   ```

2. **Check RLS policies**:
   ```sql
   -- Temporarily disable RLS for migration (re-enable after!)
   ALTER TABLE "Book" DISABLE ROW LEVEL SECURITY;

   -- Run migration...

   -- Re-enable RLS
   ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
   ```

3. **Use service role key** (for migration only):
   ```bash
   # Create .env.migration
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_API_KEY=your_service_role_key  # Service role (admin)
   ```

   **WARNING**: Never commit service role key to git!

### Books show "Already migrated" but not working

**Symptoms**:
- Migration says book already migrated
- But EPUB doesn't load in reader

**Causes**:
- Signed URL expired
- File actually doesn't exist in bucket
- Storage policies not setup

**Solutions**:

1. **Verify file exists**:
   - Check Supabase Dashboard → Storage → libere-books
   - Look for `{bookId}/book.epub`

2. **Test signed URL generation**:
   ```typescript
   import { getSignedEpubUrl } from './src/utils/supabaseStorage';

   const url = await getSignedEpubUrl(1);
   console.log(url); // Should return signed URL
   ```

3. **Re-upload specific book**:
   ```bash
   # Force re-migration of book ID 1
   tsx scripts/migrate-simple.ts 1
   ```

### Some books skipped

**Normal behavior** - Script skips:
- Books already migrated to Supabase Storage
- Books with unknown URL format

**To check**:
```sql
-- See all book URL types
SELECT
  id,
  title,
  CASE
    WHEN epub LIKE '%supabase.co%' THEN 'Supabase'
    WHEN epub LIKE '%ipfs%' OR epub LIKE '%pinata%' THEN 'IPFS'
    ELSE 'Unknown'
  END as storage_type
FROM "Book"
ORDER BY id;
```

## Advanced: Manual Migration

For debugging or custom migrations:

```typescript
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(supabaseUrl, supabaseKey);

async function manualMigrate(bookId: number) {
  // 1. Get book
  const { data: book } = await supabase
    .from('Book')
    .select('*')
    .eq('id', bookId)
    .single();

  console.log('Current EPUB URL:', book.epub);

  // 2. Download from IPFS
  const response = await axios.get(book.epub, {
    responseType: 'arraybuffer',
    timeout: 60000,
  });
  const buffer = Buffer.from(response.data);
  console.log('Downloaded:', buffer.length, 'bytes');

  // 3. Upload to Supabase
  const filePath = `${bookId}/book.epub`;
  const { error: uploadError } = await supabase.storage
    .from('libere-books')
    .upload(filePath, buffer, {
      contentType: 'application/epub+zip',
      upsert: true, // Overwrite if exists
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  // 4. Get new URL
  const { data: urlData } = supabase.storage
    .from('libere-books')
    .getPublicUrl(filePath);

  console.log('New URL:', urlData.publicUrl);

  // 5. Update database
  const { error: updateError } = await supabase
    .from('Book')
    .update({ epub: urlData.publicUrl })
    .eq('id', bookId);

  if (updateError) {
    console.error('Update error:', updateError);
    return;
  }

  console.log('Migration completed!');
}

// Run
manualMigrate(1);
```

## Rollback

If you need to rollback migration:

### Option 1: Use migration report

```bash
# Migration report saved as migration-report.json
cat migration-report.json
```

```typescript
// Rollback script
import report from './migration-report.json';

for (const result of report) {
  if (result.success && result.oldUrl !== result.newUrl) {
    // Restore old IPFS URL
    await supabase
      .from('Book')
      .update({ epub: result.oldUrl })
      .eq('id', result.bookId);
  }
}
```

### Option 2: Manual rollback

```sql
-- If you have backup table
UPDATE "Book"
SET epub = backup."Book".epub
FROM backup."Book"
WHERE "Book".id = backup."Book".id;
```

## Performance Optimization

### For large databases (100+ books):

1. **Use batching**:
   ```bash
   npm run migrate:epubs  # Uses batch processing
   ```

2. **Parallel processing** (modify script):
   ```typescript
   // Process 5 books in parallel
   const batchPromises = batch.map(book => migrateBook(book));
   await Promise.all(batchPromises);
   ```

3. **Increase timeouts** for large files:
   ```typescript
   timeout: 180000, // 3 minutes for large EPUBs
   ```

## Cost Estimation

### Supabase Storage Pricing

- **Free tier**: 1 GB storage, 2 GB transfer
- **Pro**: $0.021/GB storage, $0.09/GB transfer

### Example:
- 100 books × 2MB average = 200MB
- Well within free tier
- Migration transfer: ~200MB (one-time)

### IPFS vs Supabase

| Feature | IPFS | Supabase Storage |
|---------|------|------------------|
| Cost | Gateway fees | Free tier: 1GB |
| Speed | Variable | Fast (CDN) |
| Privacy | Public | Private (authenticated) |
| Reliability | Depends on pins | 99.9% uptime |
| Offline | Via gateway | Signed URLs |

## Post-Migration

### 1. Monitor Storage Usage

Supabase Dashboard → Storage → libere-books
- Check total size
- Monitor growth
- Setup alerts (optional)

### 2. Cleanup IPFS (Optional)

After verifying migration successful:
- Unpin files from Pinata (to save costs)
- Keep metadata for 30 days as backup

### 3. Update Documentation

- Update [CLAUDE.md](CLAUDE.md) if needed
- Note migration completion date
- Document any issues encountered

## FAQ

### Q: Can I keep IPFS and Supabase both?

**A**: Yes, but not recommended. Pick one:
- **IPFS**: Public, decentralized
- **Supabase**: Private, authenticated

Current setup: Cover images on IPFS, EPUBs on Supabase.

### Q: What if migration fails midway?

**A**: Safe to re-run! Script skips already migrated books.

### Q: How long does migration take?

**A**: Depends on:
- Number of books
- File sizes
- Network speed

**Estimate**: ~10-30 seconds per book

Example:
- 10 books: ~2-5 minutes
- 100 books: ~20-50 minutes

### Q: Can I migrate while app is running?

**A**: Yes! App supports both IPFS and Supabase URLs:
- Old books: Still use IPFS
- New books: Use Supabase
- Migrated books: Use Supabase

### Q: What about cover images?

**A**: Cover images stay on IPFS (public, for display). Only EPUBs migrate to Supabase (private, for authenticated reading).

## Support

- Full docs: [SUPABASE_STORAGE_INTEGRATION.md](SUPABASE_STORAGE_INTEGRATION.md)
- Scripts docs: [scripts/README.md](scripts/README.md)
- Issues: Check console logs and Supabase Dashboard logs

## Next Steps After Migration

- [ ] Test reading books in app
- [ ] Monitor storage usage
- [ ] Setup automated backups
- [ ] Consider implementing offline caching
- [ ] Update publish flow using admin-publish tool
