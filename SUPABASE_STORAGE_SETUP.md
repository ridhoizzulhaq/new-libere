---
noteId: "9c9c1380b7c511f08d56a990e7f97797"
tags: []

---

# Supabase Storage Setup Guide

This guide walks you through setting up Supabase Storage for private EPUB file hosting in the Libere application.

## Prerequisites

- Access to Supabase dashboard: https://app.supabase.com
- Your Libere project already connected to Supabase
- Admin access to execute SQL policies

---

## Step 1: Create Storage Bucket

### Via Supabase Dashboard:

1. Navigate to **Storage** in the left sidebar
2. Click **"Create a new bucket"**
3. Configure the bucket:
   - **Name:** `libere-books`
   - **Public:** ❌ **Disable** (private bucket)
   - **File size limit:** `52428800` (50 MB)
   - **Allowed MIME types:** `application/epub+zip`
4. Click **"Create bucket"**

### Via SQL (Alternative):

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'libere-books',
  'libere-books',
  false, -- Private bucket
  52428800, -- 50 MB limit
  ARRAY['application/epub+zip']
);
```

---

## Step 2: Configure Row Level Security (RLS) Policies

### Policy 1: Authenticated Read Access

Allow authenticated users to read EPUB files (required for generating signed URLs).

```sql
-- Allow authenticated users to read EPUBs
CREATE POLICY "Authenticated users can read EPUBs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'libere-books');
```

### Policy 2: Authenticated Upload Access

Allow authenticated users to upload EPUBs (for admin-publish tool).

```sql
-- Allow authenticated users to upload EPUBs
CREATE POLICY "Authenticated users can upload EPUBs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'libere-books'
  AND (storage.foldername(name))[1] ~ '^[0-9]+$' -- Folder name must be numeric (bookId)
);
```

### Policy 3: Authenticated Update Access (Optional)

Allow updating existing EPUBs (for re-uploads or corrections).

```sql
-- Allow authenticated users to update EPUBs
CREATE POLICY "Authenticated users can update EPUBs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'libere-books')
WITH CHECK (bucket_id = 'libere-books');
```

### Policy 4: Authenticated Delete Access (Optional)

Allow deleting EPUBs (for admin cleanup).

```sql
-- Allow authenticated users to delete EPUBs
CREATE POLICY "Authenticated users can delete EPUBs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'libere-books');
```

---

## Step 3: Verify Setup

### Test Upload (via Supabase Dashboard):

1. Go to **Storage** → `libere-books` bucket
2. Click **"Upload file"**
3. Create a test folder: `999/`
4. Upload a test EPUB file: `999/test.epub`
5. Verify upload succeeds

### Test Signed URL (via App Console):

**Easiest method** - Open the Libere app in browser:

1. Start the app: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Import the utility function
import { getSignedEpubUrl } from './src/utils/supabaseStorage';

// Test with book ID 999 (or any book ID you uploaded)
const url = await getSignedEpubUrl(999);
console.log('Signed URL:', url);

// Try to fetch it
if (url) {
  const response = await fetch(url);
  console.log('Status:', response.status, response.statusText);
  console.log('Can access:', response.ok);
}
```

**Alternative: Direct Supabase client:**

```javascript
// Access the supabase client from libs
import { supabase } from './src/libs/supabase';

const { data, error } = await supabase.storage
  .from('libere-books')
  .createSignedUrl('999/test.epub', 3600); // 1 hour expiry

console.log('Signed URL:', data?.signedUrl);
console.log('Error:', error);
```

You should receive a signed URL like:
```
https://[project].supabase.co/storage/v1/object/sign/libere-books/999/test.epub?token=...
```

**Alternative: Test via curl:**

```bash
curl "https://[project].supabase.co/storage/v1/object/sign/libere-books/999/test.epub" \
  -X POST \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"expiresIn": 3600}'
```

### Test Public Access (Should Fail):

Try accessing the file without authentication:
```
https://[project].supabase.co/storage/v1/object/public/libere-books/999/test.epub
```

This should return **401 Unauthorized** or **403 Forbidden** (confirming private bucket).

---

## Step 4: Update Application Configuration

No environment variables need to be changed. The existing Supabase config will work:

```env
# .env (no changes needed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_anon_public_key
```

---

## File Organization Structure

EPUBs will be organized by book ID:

```
libere-books/
├── 1/
│   └── book.epub
├── 2/
│   └── book.epub
├── 3/
│   └── book.epub
└── ...
```

**Why this structure?**
- Easy to locate files by `bookId`
- Supports future expansion (e.g., multiple formats per book)
- Clean organization for backups

---

## Security Considerations

### ✅ What's Protected:
- EPUBs are **not publicly accessible** (require authentication)
- Signed URLs **expire after 1 hour** (time-limited access)
- RLS policies ensure only authenticated users can access files
- Bucket policies can be updated without code changes

### ⚠️ What's NOT Protected (Yet):
- Any authenticated Supabase user can read any EPUB (Phase 2 will add ownership verification)
- No rate limiting on signed URL generation (can be added via Edge Functions)
- No audit logging of file access (can enable via Supabase logs)

**These will be addressed in Phase 2 with JWT ownership tokens.**

---

## Troubleshooting

### Issue: "Permission denied" on upload

**Solution:** Verify RLS policies are active:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Issue: "Bucket not found"

**Solution:** Verify bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'libere-books';
```

### Issue: Signed URL returns 404

**Solution:** Verify file exists in bucket:
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'libere-books';
```

---

## Next Steps

After completing this setup:

1. ✅ **Phase 0.2:** Run the migration script to move existing EPUBs from IPFS to Supabase
2. ✅ **Phase 0.3:** Update admin-publish tool to upload new EPUBs to Supabase
3. ✅ **Phase 0.4:** Update EpubReaderScreen to load from Supabase signed URLs

---

## Cleanup (If Needed)

To delete the bucket and start over:

```sql
-- Delete all files in bucket
DELETE FROM storage.objects WHERE bucket_id = 'libere-books';

-- Delete all policies
DROP POLICY "Authenticated users can read EPUBs" ON storage.objects;
DROP POLICY "Authenticated users can upload EPUBs" ON storage.objects;
DROP POLICY "Authenticated users can update EPUBs" ON storage.objects;
DROP POLICY "Authenticated users can delete EPUBs" ON storage.objects;

-- Delete bucket
DELETE FROM storage.buckets WHERE id = 'libere-books';
```

---

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Signed URLs Documentation](https://supabase.com/docs/guides/storage/serving/downloads#authenticated-downloads)
