---
noteId: "98b45560b7ee11f08d56a990e7f97797"
tags: []

---

# Migration Scripts

Scripts untuk migrasi EPUB files dari IPFS ke Supabase Storage.

## Prerequisites

1. **Pastikan Supabase bucket sudah dibuat**:
   - Bucket name: `libere-books`
   - Public: **Disabled** (private bucket)
   - Storage policies sudah disetup (lihat [SUPABASE_STORAGE_INTEGRATION.md](../SUPABASE_STORAGE_INTEGRATION.md))

2. **Environment variables**:
   ```bash
   # .env file
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_API_KEY=your_supabase_anon_key
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Scripts Available

### 1. Simple Migration Script (Recommended)

**File**: [migrate-simple.ts](migrate-simple.ts)

Script sederhana dan cepat untuk migrasi.

**Migrate all books**:
```bash
npm run migrate:simple
```

**Migrate specific books** (by ID):
```bash
tsx scripts/migrate-simple.ts 1 2 3
# atau
npm run migrate:simple -- 1 2 3
```

**Features**:
- Lebih sederhana dan mudah dipahami
- Progress logging yang jelas
- Error handling
- Summary report
- 1 detik delay antar book untuk avoid rate limiting

### 2. Advanced Migration Script

**File**: [migrate-epubs-to-supabase.ts](migrate-epubs-to-supabase.ts)

Script lengkap dengan fitur advanced.

**Run migration**:
```bash
npm run migrate:epubs
```

**Features**:
- Batch processing (5 books per batch)
- Retry logic (3 attempts per book)
- Detailed JSON report
- Skip already migrated books
- Error recovery
- Rate limiting protection

## Migration Process

Script akan melakukan:

1. **Fetch books** dari database Supabase
2. **Filter** hanya books dengan EPUB dari IPFS
3. **Download** EPUB dari IPFS/Pinata
4. **Upload** ke Supabase Storage bucket `libere-books/{bookId}/book.epub`
5. **Update** database dengan URL Supabase Storage yang baru
6. **Report** hasil migrasi

## Output Example

```
🚀 Migrating ALL books from IPFS to Supabase Storage

📚 Found 10 books in database
   - IPFS (needs migration): 8
   - Already migrated: 2

📖 Migrating Book ID: 1
   Title: Introduction to Blockchain
   Current EPUB URL: https://gateway.pinata.cloud/ipfs/QmXXX...
   📥 Downloading from IPFS...
   ✅ Downloaded 2.34 MB
   📤 Uploading to Supabase Storage...
   ✅ Uploaded to Supabase
   New URL: https://xxx.supabase.co/storage/v1/object/public...
   💾 Updating database...
   ✅ Database updated
   🎉 Migration completed for Book 1!

...

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successful: 8
❌ Failed: 0
⏭️  Skipped: 0
============================================================
```

## Verification

Setelah migrasi, verify dengan:

1. **Check Supabase Dashboard**:
   - Storage → libere-books
   - Pastikan files ada dengan structure `{bookId}/book.epub`

2. **Check Database**:
   ```sql
   SELECT id, title, epub
   FROM "Book"
   WHERE epub LIKE '%supabase.co/storage%';
   ```

3. **Test di Web App**:
   ```bash
   npm run dev
   ```
   - Login dan buka bookshelf
   - Buka salah satu book untuk read
   - EPUB harus load dengan signed URL dari Supabase

## Troubleshooting

### Error: "Failed to upload to Supabase"

**Kemungkinan penyebab**:
- Bucket belum dibuat atau nama salah
- Storage policies belum disetup
- Storage quota exceeded

**Solusi**:
1. Check bucket name di Supabase Dashboard (harus: `libere-books`)
2. Setup storage policies (lihat [SUPABASE_STORAGE_INTEGRATION.md](../SUPABASE_STORAGE_INTEGRATION.md))
3. Check storage usage di dashboard

### Error: "Failed to download from IPFS"

**Kemungkinan penyebab**:
- IPFS gateway down
- File tidak ada di IPFS
- Network timeout

**Solusi**:
1. Verify IPFS URL bisa diakses di browser
2. Try different IPFS gateway (edit script)
3. Increase timeout di script

### Error: "Database update failed"

**Kemungkinan penyebab**:
- Supabase API key tidak valid
- Database connection error
- Table permissions

**Solusi**:
1. Verify `VITE_SUPABASE_API_KEY` di .env
2. Check Supabase project status
3. Verify table permissions di dashboard

### Some books skipped

Jika ada books yang di-skip dengan "Already migrated", itu normal. Script skip books yang sudah punya URL Supabase Storage.

## Manual Migration

Jika ingin migrate 1 book secara manual:

```typescript
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Fetch book
const { data: book } = await supabase
  .from('Book')
  .select('*')
  .eq('id', 1)
  .single();

// 2. Download EPUB
const response = await axios.get(book.epub, {
  responseType: 'arraybuffer'
});
const buffer = Buffer.from(response.data);

// 3. Upload to Supabase
const { data } = await supabase.storage
  .from('libere-books')
  .upload(`${book.id}/book.epub`, buffer, {
    contentType: 'application/epub+zip',
  });

// 4. Update database
const { data: urlData } = supabase.storage
  .from('libere-books')
  .getPublicUrl(`${book.id}/book.epub`);

await supabase
  .from('Book')
  .update({ epub: urlData.publicUrl })
  .eq('id', book.id);
```

## Best Practices

1. **Backup database** sebelum migrasi:
   ```bash
   # Di Supabase Dashboard: Database → Backups
   ```

2. **Test dengan 1 book dulu**:
   ```bash
   tsx scripts/migrate-simple.ts 1
   ```

3. **Monitor storage usage** di Supabase Dashboard

4. **Keep IPFS files** untuk beberapa waktu sebagai backup

5. **Verify migration** dengan test read di web app

## Rollback

Jika perlu rollback ke IPFS:

1. Simpan `migration-report.json` yang berisi old URLs
2. Update database:
   ```sql
   UPDATE "Book"
   SET epub = 'old_ipfs_url'
   WHERE id = book_id;
   ```

## Support

Lihat dokumentasi lengkap di [SUPABASE_STORAGE_INTEGRATION.md](../SUPABASE_STORAGE_INTEGRATION.md)
