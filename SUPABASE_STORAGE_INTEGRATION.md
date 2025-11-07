---
noteId: "2beb0f50b7ee11f08d56a990e7f97797"
tags: []

---

# Supabase Storage Integration - Setup Guide

## Overview

Libere menggunakan **Supabase Storage** untuk menyimpan file EPUB secara private dan aman. File EPUB disimpan di bucket yang hanya bisa diakses dengan authentication, berbeda dengan cover image yang disimpan di IPFS secara public.

## Arsitektur Storage

- **Cover Images**: IPFS/Pinata (public, decentralized)
- **EPUB Files**: Supabase Storage (private, authenticated access only)

## Setup Supabase Storage Bucket

### 1. Buat Bucket di Supabase Dashboard

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu **Storage** di sidebar
4. Klik tombol **New bucket**
5. Isi form dengan:
   - **Name**: `libere-books`
   - **Public**: **UNCHECK** (private bucket)
   - **File size limit**: 50 MB (opsional, sesuaikan dengan ukuran EPUB maksimal)
   - **Allowed MIME types**: `application/epub+zip` (opsional, untuk keamanan)
6. Klik **Create bucket**

### 2. Setup Storage Policies

Untuk mengatur akses ke bucket, Anda perlu membuat Storage Policies:

#### Policy 1: Upload EPUB (Authenticated Users)

```sql
-- Policy: Allow authenticated users to upload EPUB files
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'libere-books');
```

#### Policy 2: Download EPUB (Authenticated Users Only)

```sql
-- Policy: Allow authenticated users to download their own books
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'libere-books');
```

#### Policy 3: Update EPUB (Authenticated Users - Optional)

```sql
-- Policy: Allow authenticated users to update EPUB files
CREATE POLICY "Allow authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'libere-books')
WITH CHECK (bucket_id = 'libere-books');
```

#### Policy 4: Delete EPUB (Admin Only - Optional)

```sql
-- Policy: Allow only admin to delete EPUB files
CREATE POLICY "Admin delete only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'libere-books'
  AND auth.jwt() ->> 'role' = 'admin'
);
```

### 3. Cara Setup Policies di Dashboard

1. Di Supabase Dashboard, klik **Storage**
2. Klik bucket `libere-books`
3. Klik tab **Policies**
4. Klik **New Policy**
5. Pilih **Custom Policy** atau gunakan template
6. Masukkan SQL policy di atas
7. Klik **Save**

### 4. Verify Bucket Configuration

Setelah bucket dibuat, verifikasi di dashboard:

- Bucket name: `libere-books`
- Public access: **Disabled** (harus private)
- Policies: Minimal ada policy untuk upload dan download

## Environment Variables

Pastikan file `.env` Anda sudah berisi kredensial Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_supabase_anon_public_key
```

Kredensial ini bisa ditemukan di:
1. Supabase Dashboard > Settings > API
2. Copy **Project URL** dan **anon/public** key

## File Structure di Bucket

EPUB files disimpan dengan struktur:

```
libere-books/
├── 1/
│   └── book.epub
├── 2/
│   └── book.epub
├── 123/
│   └── book.epub
└── ...
```

- Setiap book memiliki folder dengan ID-nya
- File EPUB selalu bernama `book.epub`
- Format: `{bookId}/book.epub`

## Integration dengan Aplikasi

### 1. Upload EPUB saat Publish Book

Book publishing is handled by the `admin-publish/` tool due to contract `onlyOwner` restriction.

```typescript
import { uploadEpub } from "../utils/supabaseStorage";

// Upload EPUB to Supabase Storage
const epubUrl = await uploadEpub(bookId, epubFile);

// Save URL to database
const data: Book = {
  id: bookId,
  epub: epubUrl, // Supabase storage URL
  // ... other fields
};
```

### 2. Generate Signed URL saat Read Book

File: [src/pages/EpubReaderScreen.tsx](src/pages/EpubReaderScreen.tsx)

```typescript
import { getSignedEpubUrl, isSupabaseStorageUrl } from "../utils/supabaseStorage";

// Check if EPUB is from Supabase Storage
if (isSupabaseStorageUrl(book.epub)) {
  // Generate signed URL (expires in 1 hour)
  const signedUrl = await getSignedEpubUrl(book.id);

  // Use signed URL to load EPUB
  setEpubUrl(signedUrl);
}
```

### 3. Utility Functions

File: [src/utils/supabaseStorage.ts](src/utils/supabaseStorage.ts)

Fungsi-fungsi yang tersedia:

- `uploadEpub(bookId, file)` - Upload EPUB ke bucket
- `getSignedEpubUrl(bookId)` - Generate signed URL untuk akses temporary
- `downloadEpubBlob(bookId)` - Download EPUB sebagai Blob (untuk offline caching)
- `epubExists(bookId)` - Check apakah EPUB sudah ada
- `deleteEpub(bookId)` - Hapus EPUB dari bucket
- `isSupabaseStorageUrl(url)` - Check apakah URL dari Supabase Storage
- `isIpfsUrl(url)` - Check apakah URL dari IPFS

## Security Features

### Signed URLs

- Generated dengan `createSignedUrl()`
- Expires dalam 1 jam (3600 detik)
- Hanya valid untuk user yang authenticated
- Bisa digunakan offline sampai expired

### Private Bucket

- EPUB tidak bisa diakses langsung via URL public
- Memerlukan authentication token dari Supabase
- User hanya bisa akses EPUB yang sudah mereka beli/pinjam

### Content-Type Validation

- EPUB di-upload dengan `content-type: application/epub+zip`
- Mencegah upload file yang bukan EPUB

## Migration dari IPFS

Untuk book yang sudah ada di IPFS, aplikasi tetap mendukung:

```typescript
// EpubReaderScreen.tsx akan check format URL
if (isSupabaseStorageUrl(book.epub)) {
  // Use Supabase Storage
  epubUrl = await getSignedEpubUrl(book.id);
} else if (isIpfsUrl(book.epub)) {
  // Use IPFS URL directly (for old books)
  epubUrl = book.epub;
}
```

## Testing

### 1. Test Upload via Admin Publish Tool

```bash
cd admin-publish
npm run dev
```

1. Login dengan owner wallet
2. Upload cover image dan EPUB file
3. Submit form
4. Check Supabase Dashboard > Storage > libere-books
5. Verify file sudah masuk dengan path `{bookId}/book.epub`

### 2. Test Read via Web App

```bash
npm run dev
```

1. Login sebagai user
2. Purchase atau borrow book
3. Buka book di Bookshelf
4. Click "Read Now"
5. EPUB harus terbuka dengan signed URL

### 3. Manual Test di Browser Console

```javascript
// Import utility
import { getSignedEpubUrl } from './utils/supabaseStorage';

// Test generate signed URL
const signedUrl = await getSignedEpubUrl(1);
console.log('Signed URL:', signedUrl);

// URL format should be:
// https://[project].supabase.co/storage/v1/object/sign/libere-books/1/book.epub?token=...
```

## Troubleshooting

### Error: "Failed to create signed URL"

**Penyebab:**
- Bucket tidak ada atau salah nama
- File EPUB belum di-upload
- Storage policies tidak disetup dengan benar

**Solusi:**
1. Verify bucket name di dashboard (`libere-books`)
2. Check file ada di path `{bookId}/book.epub`
3. Verify storage policies untuk SELECT operation

### Error: "Failed to upload EPUB"

**Penyebab:**
- Storage policy untuk INSERT tidak ada
- User belum authenticated
- Bucket full atau quota exceeded

**Solusi:**
1. Check storage policies untuk INSERT operation
2. Verify user authentication status
3. Check storage quota di dashboard

### EPUB tidak bisa dibuka di reader

**Penyebab:**
- Signed URL sudah expired (>1 jam)
- Network error saat fetch
- EPUB file corrupt

**Solusi:**
1. Reload page untuk generate signed URL baru
2. Check network connection
3. Re-upload EPUB file

### File tidak muncul di dashboard

**Penyebab:**
- Upload gagal tapi tidak ada error message
- Path salah (bukan `{bookId}/book.epub`)

**Solusi:**
1. Check console log untuk error messages
2. Verify uploadEpub() function dipanggil dengan parameter benar
3. Check Supabase logs di dashboard

## Advanced: Offline Caching

Untuk enable offline reading, gunakan `downloadEpubBlob()`:

```typescript
// Download EPUB as Blob
const epubBlob = await downloadEpubBlob(bookId);

// Save to IndexedDB or localStorage (for PWA)
// ... implement offline storage logic
```

## Monitoring & Logs

### Check Upload Activity

1. Supabase Dashboard > Storage > libere-books
2. View files dan metadata
3. Check file size dan last modified

### Check Access Logs

1. Supabase Dashboard > Logs > Storage Logs
2. Filter by bucket: `libere-books`
3. Monitor signed URL generation dan access

## Best Practices

1. **Always generate fresh signed URLs** - Jangan simpan signed URL di database
2. **Validate file type** - Pastikan file yang di-upload adalah EPUB
3. **Handle expiry** - Implement refresh mechanism jika signed URL expired
4. **Cleanup old files** - Hapus EPUB dari bucket jika book dihapus dari database
5. **Monitor storage quota** - Check storage usage secara berkala di dashboard

## Next Steps

- [ ] Implement offline caching dengan Service Worker
- [ ] Add file size validation sebelum upload
- [ ] Create admin dashboard untuk manage storage
- [ ] Implement automatic cleanup untuk unused files
- [ ] Add file compression untuk reduce storage cost

## Support

Jika ada masalah dengan Supabase Storage integration:

1. Check dokumentasi Supabase: https://supabase.com/docs/guides/storage
2. Check logs di browser console
3. Verify environment variables di `.env`
4. Check storage policies di dashboard
