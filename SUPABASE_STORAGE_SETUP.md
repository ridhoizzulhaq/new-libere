# Supabase Storage Setup - Quick Start Guide

Integrasi Supabase Storage untuk EPUB files sudah berhasil ditambahkan ke project **llibere-main**!

## ✅ Yang Sudah Terintegrasi

### 1. Utility Functions
- **File**: [src/utils/supabaseStorage.ts](src/utils/supabaseStorage.ts)
- **Fungsi**:
  - `uploadEpub()` - Upload EPUB ke bucket
  - `getSignedEpubUrl()` - Generate signed URL (1 jam expiry)
  - `downloadEpubBlob()` - Download EPUB sebagai Blob
  - `epubExists()` - Check apakah EPUB ada
  - `deleteEpub()` - Hapus EPUB dari bucket
  - `isSupabaseStorageUrl()` - Detect URL dari Supabase
  - `isIpfsUrl()` - Detect URL dari IPFS

### 2. CreateBookV2Screen - Updated
- **File**: [src/pages/CreateBookV2Screen.tsx](src/pages/CreateBookV2Screen.tsx)
- **Perubahan**:
  - Import `uploadEpub` dari utils
  - Cover image → tetap ke IPFS (public)
  - EPUB file → upload ke Supabase Storage (private)
  - Loading message: "Uploading EPUB file to secure storage..."

### 3. EpubReaderScreen - Updated
- **File**: [src/pages/EpubReaderScreen.tsx](src/pages/EpubReaderScreen.tsx)
- **Perubahan**:
  - Fetch book data dari database
  - Auto-detect URL type (Supabase vs IPFS)
  - Generate signed URL untuk Supabase Storage
  - Fallback ke IPFS untuk book lama
  - Loading dan error states

### 4. Migration Scripts
- **Directory**: [scripts/](scripts/)
- **Files**:
  - `migrate-simple.ts` - Simple migration script
  - `migrate-epubs-to-supabase.ts` - Advanced migration
  - `test-supabase-connection.ts` - Test setup
  - `README.md` - Scripts documentation

### 5. Documentation
- [SUPABASE_STORAGE_INTEGRATION.md](SUPABASE_STORAGE_INTEGRATION.md) - Full integration guide
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration step-by-step
- [scripts/README.md](scripts/README.md) - Scripts usage

### 6. Package.json - Updated
```json
{
  "scripts": {
    "migrate:epubs": "tsx scripts/migrate-epubs-to-supabase.ts",
    "migrate:simple": "tsx scripts/migrate-simple.ts",
    "test:supabase": "tsx scripts/test-supabase-connection.ts"
  }
}
```

## 🚀 Langkah Selanjutnya

### Step 1: Setup Supabase Bucket

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih project** Anda
3. **Klik Storage** di sidebar
4. **Klik "New bucket"**
5. **Isi form**:
   - Name: `libere-books`
   - **UNCHECK "Public"** (harus private!)
   - Click "Create bucket"

### Step 2: Setup Storage Policies

Di Supabase Dashboard → Storage → libere-books → Policies:

**Policy 1: Allow Upload**
```sql
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'libere-books');
```

**Policy 2: Allow Read**
```sql
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'libere-books');
```

### Step 3: Verify Environment Variables

Check file `.env`:

```bash
# Harus sudah ada
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_supabase_anon_key
```

### Step 4: Test Setup

```bash
# Test koneksi dan bucket
npm run test:supabase
```

Output yang diharapkan:
```
✅ Environment variables found
✅ Supabase client initialized
✅ Database connection successful
✅ Bucket "libere-books" exists!
✅ File upload successful!
✅ File download successful!
✅ Signed URL generated successfully!
✅ ALL TESTS PASSED!
```

### Step 5: Migrasi EPUB dari IPFS

```bash
# Migrate all books
npm run migrate:simple
```

Output:
```
📚 Found 10 books
   - IPFS (needs migration): 8
   - Already migrated: 2

📖 Migrating Book ID: 1
   ✅ Downloaded 2.34 MB
   ✅ Uploaded to Supabase
   ✅ Database updated
   🎉 Migration completed!

✅ Successful: 8
❌ Failed: 0
```

### Step 6: Verify di Web App

```bash
npm run dev
```

1. Login ke app
2. Buka bookshelf
3. Read any book
4. Check browser console:
   ```
   🔐 [LoadBook] Generating signed URL for Supabase Storage...
   ✅ [LoadBook] Signed URL generated (expires in 1 hour)
   📖 [Reader] EPUB URL ready
   ```

## 📋 Checklist Setup

- [ ] Bucket `libere-books` dibuat di Supabase
- [ ] Bucket setting: **Private** (not public)
- [ ] Storage policies sudah disetup (upload & read)
- [ ] Environment variables sudah benar di `.env`
- [ ] Test passed: `npm run test:supabase`
- [ ] Migration completed: `npm run migrate:simple`
- [ ] Web app bisa read books dari Supabase Storage

## 🔧 Troubleshooting

### Error: "Bucket not found"

**Solusi**: Buat bucket di Supabase Dashboard dengan nama `libere-books`

### Error: "Failed to upload"

**Penyebab**: Storage policies belum disetup

**Solusi**: Run SQL policies di Supabase SQL Editor (lihat Step 2)

### Error: "Failed to generate signed URL"

**Penyebab**:
- File belum di-upload
- Permissions tidak benar

**Solusi**:
1. Check file ada di bucket
2. Verify storage policies

### Books tidak bisa dibuka

**Solusi**:
1. Check browser console untuk error
2. Verify signed URL generated
3. Re-migrate book jika perlu:
   ```bash
   tsx scripts/migrate-simple.ts 1
   ```

## 📚 File Structure

```
llibere-main/
├── src/
│   ├── utils/
│   │   └── supabaseStorage.ts          # Utility functions ✅
│   └── pages/
│       ├── CreateBookV2Screen.tsx       # Updated ✅
│       └── EpubReaderScreen.tsx         # Updated ✅
├── scripts/
│   ├── migrate-simple.ts                # Migration script ✅
│   ├── migrate-epubs-to-supabase.ts    # Advanced migration ✅
│   ├── test-supabase-connection.ts      # Test script ✅
│   └── README.md                        # Scripts docs ✅
├── SUPABASE_STORAGE_INTEGRATION.md      # Full guide ✅
├── MIGRATION_GUIDE.md                   # Migration guide ✅
└── package.json                         # Updated scripts ✅
```

## 🎯 Arsitektur Storage

```
┌─────────────────────────────────────────────┐
│         USER PUBLISHES BOOK                  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  CreateBookV2Screen │
        └─────────┬───────────┘
                  │
        ┌─────────▼──────────┐
        │   Cover Image       │──────► IPFS (Public)
        │   +                 │        gateway.pinata.cloud
        │   EPUB File        │
        └─────────┬───────────┘
                  │
        ┌─────────▼──────────┐
        │  uploadEpub()       │──────► Supabase Storage
        └─────────┬───────────┘        (Private)
                  │                     libere-books/
                  │                     └── {bookId}/book.epub
        ┌─────────▼──────────┐
        │   Save to DB        │
        │   epub: supabase_url│
        └─────────────────────┘

┌─────────────────────────────────────────────┐
│          USER READS BOOK                     │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  EpubReaderScreen   │
        └─────────┬───────────┘
                  │
        ┌─────────▼──────────┐
        │  Fetch book data    │
        │  from database      │
        └─────────┬───────────┘
                  │
        ┌─────────▼──────────┐
        │  Is Supabase URL?   │
        └─────┬───────┬───────┘
              │       │
          YES │       │ NO
              │       │
    ┌─────────▼───┐   └────► Use IPFS URL
    │getSignedUrl │           (old books)
    │(expires 1h) │
    └─────────┬───┘
              │
        ┌─────▼──────────┐
        │  Load EPUB      │
        │  with ReactReader│
        └─────────────────┘
```

## 🔐 Security Features

1. **Private Bucket** - EPUB tidak bisa diakses public
2. **Signed URLs** - Temporary access (1 jam)
3. **Authenticated Access** - Hanya user yang login
4. **Row Level Security** - Database policies

## 💡 Tips

1. **Test dengan 1 book dulu** sebelum migrate all
2. **Keep IPFS files** untuk beberapa waktu sebagai backup
3. **Monitor storage usage** di Supabase Dashboard
4. **Verify migration** dengan test read di web app

## 📖 Dokumentasi Lengkap

- [SUPABASE_STORAGE_INTEGRATION.md](SUPABASE_STORAGE_INTEGRATION.MD) - Complete setup guide
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration walkthrough
- [scripts/README.md](scripts/README.md) - Scripts documentation

## 🆘 Support

Jika ada masalah:

1. Check browser console untuk error messages
2. Run `npm run test:supabase` untuk diagnose
3. Check Supabase Dashboard logs
4. Review dokumentasi di file-file markdown

---

**Status**: ✅ Ready to use!

**Next Step**: Setup Supabase bucket → Run test → Migrate books
