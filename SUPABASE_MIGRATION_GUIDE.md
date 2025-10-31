# Supabase Migration Guide

## Overview
This guide will help you migrate Libere project to a new Supabase instance.

---

## Prerequisites
- [ ] Active Supabase account (https://supabase.com)
- [ ] Access to this project's codebase
- [ ] Node.js and npm installed

---

## Step 1: Create New Supabase Project

### 1.1 Login to Supabase
1. Go to https://supabase.com
2. Login with your account

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in project details:
   - **Organization**: Select or create
   - **Name**: `libere` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia`, `US East`, etc.)
   - **Pricing Plan**: Free tier is sufficient to start
3. Click **"Create new project"**
4. Wait ~2 minutes for project to be provisioned

---

## Step 2: Get API Credentials

### 2.1 Navigate to Project Settings
1. In your new project, click **Settings** (gear icon) in sidebar
2. Click **API** section

### 2.2 Copy Credentials
You'll need two values:

**Project URL** (looks like):
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon/public key** (looks like):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Note**: Use the `anon public` key, NOT the `service_role secret` key!

---

## Step 3: Setup Database

### 3.1 Open SQL Editor
1. In Supabase Dashboard, click **SQL Editor** in sidebar
2. Click **"New query"**

### 3.2 Run Setup Script
1. Open the file `supabase-setup.sql` in this project
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter`

### 3.3 Verify Success
You should see:
- ✅ "Success. No rows returned"
- ✅ Table `Book` created
- ✅ Indexes created
- ✅ RLS policies created

To double-check, go to **Table Editor** in sidebar and verify `Book` table exists.

---

## Step 4: Update Environment Variables

### 4.1 Update `.env` File
1. Open `.env` file in project root
2. Find the `#SUPABASE` section
3. Replace placeholders with your credentials:

```env
#SUPABASE
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Verify Other Variables
Make sure other environment variables are set:
- `VITE_PRIVY_APP_ID` - For wallet authentication
- `VITE_PINATA_API_KEY` - For IPFS uploads
- `VITE_PINATA_SECRET_API_KEY` - For IPFS uploads

---

## Step 5: Test the Migration

### 5.1 Restart Dev Server
```bash
npm run dev
```

### 5.2 Test Publish Book
1. Navigate to `http://localhost:5173/publish`
2. Fill in book details:
   - Title, Author, Publisher, Description
   - Upload cover image (PNG/JPG)
   - Upload EPUB file
   - Set price and royalty
3. Click **"Publish Book"**
4. Wait for transaction to complete

### 5.3 Verify in Supabase
1. Go to Supabase Dashboard → **Table Editor**
2. Click on `Book` table
3. You should see the new book record

### 5.4 Test Other Pages
- **Home** (`/books`): Should display published books
- **Book Detail** (`/books/{id}`): Should show book details
- **Bookshelf** (`/bookselfs`): Should show owned NFTs

---

## Database Schema Reference

### Book Table Structure

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | BIGINT | No | Primary key, matches NFT token ID |
| `title` | TEXT | No | Book title |
| `description` | TEXT | Yes | Book description |
| `author` | TEXT | No | Author name |
| `publisher` | TEXT | Yes | Publisher name |
| `metadataUri` | TEXT | No | Cover image URL (IPFS/HTTP) |
| `epub` | TEXT | No | EPUB file URL (IPFS/HTTP) |
| `priceEth` | TEXT | No | Price in smallest unit (6 decimals for USDC) |
| `royalty` | INTEGER | No | Royalty in basis points (500 = 5%) |
| `addressReciepent` | TEXT | No | Payment recipient address |
| `addressRoyaltyRecipient` | TEXT | No | Royalty recipient address |
| `created_at` | TIMESTAMP | No | Auto-generated timestamp |

### Row Level Security (RLS)

**Enabled Policies:**
- ✅ **SELECT**: Public read access (anyone can view books)
- ✅ **INSERT**: Public write access (anyone can publish books)
- ❌ **UPDATE**: Disabled (no policy)
- ❌ **DELETE**: Disabled (no policy)

---

## Troubleshooting

### Issue: "Failed to fetch books"
**Solution**:
1. Check `.env` file has correct `VITE_SUPABASE_URL`
2. Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
3. Restart dev server after changing `.env`

### Issue: "Failed to publish book"
**Solution**:
1. Check `VITE_SUPABASE_API_KEY` is correct (anon/public key)
2. Verify RLS policies are enabled (run `supabase-setup.sql` again)
3. Check browser console for detailed error

### Issue: "Table 'Book' does not exist"
**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase-setup.sql` script again
3. Verify table exists in Table Editor

### Issue: "CORS error" when fetching
**Solution**:
1. Supabase handles CORS automatically
2. Make sure you're using the correct Project URL
3. Check if project is still provisioning (wait a few minutes)

---

## Data Migration (Optional)

If you have access to old Supabase data:

### Option 1: CSV Export/Import
1. **Old Supabase**: Table Editor → Export as CSV
2. **New Supabase**: Table Editor → Import from CSV

### Option 2: SQL Dump
1. **Old Supabase**: Settings → Database → Download backup
2. **New Supabase**: SQL Editor → Run restore script

> ⚠️ **Note**: If you lost access to old Supabase, you'll start with empty database.

---

## Security Best Practices

### ✅ Do's
- Use `anon/public` key for frontend
- Enable RLS on all tables
- Keep `service_role` key secret (never commit to git)
- Use environment variables for all credentials

### ❌ Don'ts
- Don't commit `.env` file to git (already in `.gitignore`)
- Don't share `service_role` key publicly
- Don't disable RLS without good reason
- Don't hardcode API keys in source code

---

## Maintenance

### Backup Database
**Recommended Schedule**: Weekly

1. Supabase Dashboard → Settings → Database
2. Click **"Download backup"**
3. Save `.sql` file to secure location

### Monitor Usage
Check your Supabase usage:
- Dashboard → Settings → Usage
- Free tier limits:
  - 500 MB database
  - 1 GB bandwidth/month
  - 50,000 monthly active users

---

## Support

### Supabase Resources
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Status Page: https://status.supabase.com

### Project Resources
- Smart Contract: `0xC12F333f41D7cedB209F24b303287531Bb05Bc67` (Base Sepolia)
- Blockscout: https://base-sepolia.blockscout.com/

---

## Checklist

Before going to production, ensure:

- [ ] Supabase project created
- [ ] Database table created (run `supabase-setup.sql`)
- [ ] Environment variables updated in `.env`
- [ ] Dev server restarted
- [ ] Test book published successfully
- [ ] Book visible in Supabase Table Editor
- [ ] Home page shows books
- [ ] Book detail page works
- [ ] Bookshelf shows owned NFTs
- [ ] Backup strategy in place

---

## Done! 🎉

Your Libere project is now connected to the new Supabase instance.

For questions or issues, check the Troubleshooting section above.
