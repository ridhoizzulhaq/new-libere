---
noteId: "552dea20b7c811f08d56a990e7f97797"
tags: []

---

# Phase 0: Quick Start Guide

**Goal:** Migrate EPUB files from IPFS to Supabase Storage (5 minutes setup)

---

## ⚡ Quick Steps

### 1. Setup Supabase Storage (2 minutes)

Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Storage:

1. **Create Bucket:**
   - Name: `libere-books`
   - Public: ❌ **OFF** (private)
   - Click **"Create bucket"**

2. **Add RLS Policy** (Go to Storage → Policies):
   - Click **"New Policy"**
   - Template: **Custom policy**
   - Paste this SQL:

```sql
-- Allow authenticated users to read EPUBs
CREATE POLICY "Authenticated users can read EPUBs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'libere-books');

-- Allow authenticated users to upload EPUBs
CREATE POLICY "Authenticated users can upload EPUBs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'libere-books');
```

✅ **Done!** Your Supabase Storage is ready.

---

### 2. Run Migration (1 minute)

```bash
# Preview changes (dry run)
npm run migrate:epub:dry-run

# Run actual migration
npm run migrate:epub
```

**What it does:**
- Downloads EPUBs from IPFS
- Uploads to Supabase Storage
- Updates database URLs
- **Cover images stay on IPFS** ✅

---

### 3. Test (1 minute)

```bash
# Start the app
npm run dev
```

1. Open [http://localhost:5173/bookselfs](http://localhost:5173/bookselfs)
2. Click any book to read
3. ✅ **Should load the actual book** (not Alice in Wonderland demo!)

**Check browser console:**
```
✅ [LoadBook] Book fetched: Your Book Title
🔐 [LoadBook] Generating signed URL for Supabase Storage...
✅ [LoadBook] Signed URL generated (expires in 1 hour)
```

---

## ✅ Success Checklist

- [ ] Supabase bucket `libere-books` created
- [ ] RLS policies added
- [ ] Migration completed (all books show ✅)
- [ ] Books load correctly in the app
- [ ] No more Alice in Wonderland demo

---

## 🆘 Troubleshooting

### Error: "Permission denied"
**Fix:** Add RLS policies (see step 1.2 above)

### Error: "Book not found"
**Fix:** Check database has books:
```sql
SELECT id, title, epub FROM "Book" LIMIT 5;
```

### Error: "Failed to generate signed URL"
**Fix:** Verify environment variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_anon_key
```

---

## 📚 Full Documentation

- **Detailed setup:** [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)
- **Migration guide:** [PHASE_0_MIGRATION_GUIDE.md](PHASE_0_MIGRATION_GUIDE.md)

---

## ⏭️ What's Next?

After Phase 0:
- **Phase 1:** PWA infrastructure (offline assets)
- **Phase 2:** JWT ownership tokens (security)
- **Phase 3:** AES-GCM encryption (secure offline storage)
- **Phase 4:** Download UI (offline reading)
