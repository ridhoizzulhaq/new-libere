# Quick Setup Guide - Migrasi EPUB ke Supabase Storage

## ✅ Status Check

Policies sudah ada di Supabase:
- ✅ Authenticated users can upload EPUBs
- ✅ Authenticated users can read EPUBs
- ✅ Authenticated users can update EPUBs
- ✅ Authenticated users can delete EPUBs

## ❌ Issue Yang Terjadi

```
❌ Error: Upload failed: new row violates row-level security policy
```

**Penyebab**: Migration script menggunakan **anon key** yang tidak authenticated. Policies Anda require **authenticated users** only.

## ✅ Solusi: Gunakan Service Role Key

### Step 1: Dapatkan Service Role Key

1. Buka **Supabase Dashboard** → **Settings** → **API**
2. Scroll ke bagian **Project API keys**
3. Copy **`service_role`** key (BUKAN anon key!)
   - Klik icon "eye" untuk show key
   - Klik icon "copy"

⚠️ **PENTING**: Service role key adalah admin key, jangan share atau commit ke git!

### Step 2: Setup .env.migration File

Edit file `.env.migration`:

```bash
# .env.migration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paste service_role key yang Anda copy dari Step 1
```

Ganti:
- `your-project.supabase.co` dengan URL project Anda
- `eyJhbG...` dengan service_role key yang Anda copy

### Step 3: Jalankan Migration dengan Service Key

```bash
cd /Users/ridhoizzulhaq/llibere-main

# Migrate all books (recommended)
/opt/homebrew/bin/node scripts/migrate-with-service-key.mjs

# Or migrate specific book (contoh: book ID 1761747515)
/opt/homebrew/bin/node scripts/migrate-with-service-key.mjs 1761747515
```

Expected output:
```
🔑 Using SERVICE ROLE key (bypasses RLS policies)

📚 Fetching all books from database...

Found 4 books total
   - IPFS (needs migration): 4
   - Already migrated: 0

📖 Migrating Book ID: 1761747515
   Title: Around the World in Eighty Days
   📥 Downloading from IPFS...
   ✅ Downloaded 0.42 MB
   📤 Uploading to Supabase Storage...
   ✅ Uploaded to: libere-books/1761747515/book.epub
   💾 Updating database...
   ✅ Database updated
   🎉 Migration completed!

[... 3 more books ...]

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successful: 4
❌ Failed: 0
============================================================

⚠️  REMINDER: Delete .env.migration after migration!
```

### Step 4: Verify di Supabase Dashboard

1. **Storage** → **libere-books**
2. Harusnya ada folder dengan ID books:
   ```
   📁 1761747515/
     📄 book.epub
   📁 1761866400/
     📄 book.epub
   📁 1761866611/
     📄 book.epub
   📁 1761866872/
     📄 book.epub
   ```

### Step 5: Test di Web App

```bash
npm run dev
```

1. Login ke app
2. Buka bookshelf
3. Click "Read Now" pada salah satu book
4. Book harusnya load dari Supabase Storage!

### Step 6: Cleanup Service Key File

⚠️ **PENTING**: Delete `.env.migration` setelah migration selesai!

```bash
rm /Users/ridhoizzulhaq/llibere-main/.env.migration
```

Service role key adalah admin key dan tidak boleh disimpan di project!

## 🔒 Security: Policies Sudah Aman

Policies Anda sudah aman (authenticated users only):
- ✅ Only authenticated users can upload
- ✅ Only authenticated users can read
- ✅ Only authenticated users can update
- ✅ Only authenticated users can delete

Tidak perlu ganti policies! 👍

## 📋 Checklist

- [x] Bucket `libere-books` sudah dibuat ✅
- [x] Bucket setting: Private ✅
- [x] Storage policies sudah ada (authenticated only) ✅
- [ ] Service role key didapatkan dari dashboard
- [ ] `.env.migration` file sudah diisi
- [ ] Migration script berhasil
- [ ] Files ada di Storage dashboard
- [ ] Web app bisa baca books
- [ ] `.env.migration` file sudah didelete

## 🔧 Troubleshooting

### Error: "Bucket not found"

**Solusi**: Buat bucket dulu di Storage → New bucket → Name: `libere-books` → UNCHECK Public

### Error: "Policy already exists"

**Solusi**: Policy sudah ada, skip step 2

### Migration berhasil tapi book tidak bisa dibuka

**Penyebab**: Policies sudah di-drop

**Solusi**: Run secure policies (authenticated only) dari Step 6

## 📊 Current Status

Books di database Anda:
- **Total**: 4 books
- **Need migration**: 4 books (semuanya dari IPFS)
- **File sizes**:
  - Around the World in Eighty Days: 0.42 MB
  - Alice's Adventures in Wonderland: 0.18 MB
  - Frankenstein: 0.45 MB
  - Beowulf: 0.38 MB

**Total download**: ~1.43 MB (cepat!)

## 🚀 Ready to Go!

Jalankan Step 1-6 di atas, dan books Anda akan ter-migrate ke Supabase Storage!
