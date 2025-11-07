---
noteId: "6cbf2770ba6711f098c215b9d310be9c"
tags: []

---

# Multi-Library System Implementation Guide

## 🎉 Overview

This document describes the multi-library system implementation for Libere, enabling multiple decentralized libraries with individual book collections and visibility control.

## ✨ Features Implemented

### 1. **Multi-Library Support**
- Multiple libraries with unique smart contract addresses
- Each library has its own book collection
- Library profile cards with stats (books, members, borrows)

### 2. **Auto-Sync from Blockchain**
- Automatic NFT sync from Blockscout API every 5 minutes
- Client-side polling mechanism
- Manual sync button for immediate refresh
- New books added as invisible by default

### 3. **Visibility Control**
- Per-library, per-book visibility settings
- Books can be hidden/shown via SQL database
- Users only see books marked as `is_visible = true`
- Admin can control which books appear in each library

### 4. **New User Flow**
```
/libraries → Library List (cards)
            ↓
         Click "Kunjungi Perpustakaan"
            ↓
/libraries/:id → Library Detail (filtered books)
```

## 📦 Files Created

### 1. Database Migration
**`scripts/setup-library-tables.sql`**
- Creates `library_books` junction table
- Adds metadata columns to `libraries` table
- Creates helper views and triggers
- Seeds "The Room 19" library data

### 2. Sync Script
**`scripts/sync-library-nfts.ts`**
- Fetches NFTs from Blockscout for each library
- Syncs with database (upserts library_books)
- Respects rate limits with delays
- Can be run manually: `npm run sync:libraries`

### 3. UI Components
**`src/components/library/LibraryProfileCard.tsx`**
- Library card component matching mockup design
- Shows stats, description, contract address
- "Kunjungi Perpustakaan" and "Join Library" buttons

### 4. Pages
**`src/pages/LibraryListScreen.tsx`**
- Landing page showing all libraries
- Auto-sync polling (5 min interval)
- Loading/error states
- Sync status indicator

**`src/pages/LibraryDetailScreen.tsx`**
- Library-specific book view
- Fetches only visible books from database
- Shows library info and stats
- Pass library address to components

### 5. Helper Functions
**`src/libs/supabase-helpers.ts`**
- Reusable functions for library operations:
  - `getAllLibraries()` - Get all libraries
  - `getLibraryById(id)` - Get single library
  - `getLibraryVisibleBooks(id)` - Get visible books
  - `toggleBookVisibility()` - Show/hide books
  - `upsertLibraryBooks()` - Bulk sync books
  - And more...

## 📂 Files Modified

### 1. Routes
**`src/main.tsx`**
```typescript
// Old:
<Route path="/libraries" element={<LibraryScreen />} />

// New:
<Route path="/libraries" element={<LibraryListScreen />} />
<Route path="/libraries/:id" element={<LibraryDetailScreen />} />
```

### 2. Components
**`src/components/civilib/CivilibBookList.tsx`**
- Added `libraryAddress?: string` prop
- Pass to child components

**`src/components/civilib/CivilibBookCard.tsx`**
- Added `libraryAddress?: string` prop
- Use `effectiveLibraryAddress` for contract calls
- Support multiple library pool contracts

**`src/components/civilib/CivilibAccessButton.tsx`**
- Added `libraryAddress?: string` prop
- Use effective address for borrow/return operations

### 3. Package.json
Added new script:
```json
"sync:libraries": "tsx scripts/sync-library-nfts.ts"
```

## 🗄️ Database Schema

### `libraries` Table (Updated)
```sql
CREATE TABLE libraries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  member_count INTEGER DEFAULT 0,
  book_count INTEGER DEFAULT 0,
  borrow_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `library_books` Table (New)
```sql
CREATE TABLE library_books (
  id SERIAL PRIMARY KEY,
  library_id INTEGER REFERENCES libraries(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT false, -- ⚠️ Default: hidden!
  added_at TIMESTAMP DEFAULT NOW(),
  last_synced TIMESTAMP DEFAULT NOW(),
  UNIQUE(library_id, book_id)
);
```

**Important**: New books are added with `is_visible = false` by default. Admin must manually set to `true` to show in UI.

## 🔄 Auto-Sync Flow

### Client-Side Polling (LibraryListScreen)

```
On Page Load:
  → Fetch all libraries
  → Wait 2 seconds
  → Initial sync (fetch NFTs, upsert to DB)

Every 5 Minutes:
  → For each library:
    1. Fetch NFTs from Blockscout
    2. Get existing library_books
    3. Find new NFTs (not in DB)
    4. Insert new books as invisible
    5. Update last_synced timestamp
  → Refresh library data
  → Update UI
```

### Manual Sync

User can click "Sync Now" button to trigger immediate sync without waiting.

## 📊 Data Flow

### 1. Library List Flow
```
LibraryListScreen
  ↓
getAllLibraries() → Supabase
  ↓
Display LibraryProfileCard[]
```

### 2. Library Detail Flow
```
LibraryDetailScreen (/:id)
  ↓
getLibraryById(id) → Supabase
  ↓
getLibraryVisibleBooks(id) → Supabase
  ↓  (JOIN library_books WHERE is_visible = true)
Display CivilibBookList (filtered)
  ↓
CivilibBookCard (with libraryAddress)
  ↓
Contract: balanceOf(libraryAddress, bookId)
```

### 3. Sync Flow
```
Every 5 minutes:
  ↓
For Each Library:
  ↓
Blockscout API → NFT IDs
  ↓
Compare with library_books
  ↓
New NFTs? → INSERT (is_visible = false)
  ↓
Update last_synced
```

## 🚀 Setup Instructions

### 1. Run Database Migration

**Option A: Direct SQL (Supabase Dashboard)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/setup-library-tables.sql`
3. Execute the script

**Option B: Via psql**
```bash
psql -h your-db-host -U postgres -d postgres -f scripts/setup-library-tables.sql
```

### 2. Verify Data

Check if "The Room 19" library was created:
```sql
SELECT * FROM libraries WHERE name = 'The Room 19';
```

### 3. Initial Sync

Run the sync script to fetch NFTs:
```bash
npm run sync:libraries
```

This will populate the `library_books` table with books from the blockchain.

### 4. Set Books as Visible

By default, all books are invisible. To make books visible:

```sql
-- Make all books visible for The Room 19 (library_id = 1)
UPDATE library_books
SET is_visible = true
WHERE library_id = 1;

-- Or make specific books visible
UPDATE library_books
SET is_visible = true
WHERE library_id = 1 AND book_id IN (1, 2, 3, 4, 5);
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:5173/libraries to see the library list!

## 🎨 UI Components

### Library Profile Card

Styled like the mockup with:
- **Header**: Library banner image
- **Logo**: Circular, positioned at bottom-left of banner
- **Info**: Name, location, description
- **Stats**: Books (98) | Members (843) | Copies (267)
- **Contract**: Truncated address with copy button
- **Actions**:
  - "Kunjungi Perpustakaan" (white button with border)
  - "Join Library" (gradient amber button)

### Library List Screen

- Grid layout (3 columns on desktop)
- Auto-sync indicator (5 min interval)
- Last sync timestamp
- Manual "Sync Now" button
- Loading states and error handling

### Library Detail Screen

- Library banner with info overlay
- Stats display (books, members, borrows)
- Filtered book grid (only visible books)
- Empty state if no visible books

## 🔐 Security & Best Practices

### 1. Default Invisible

New books are **always** added as invisible by default:
```typescript
is_visible: false // Safety first!
```

This prevents accidentally showing unauthorized content.

### 2. Rate Limiting

Sync script includes delays between API calls:
```typescript
const REQUEST_DELAY = 1000; // 1 second between libraries
```

Respects Blockscout API rate limits.

### 3. Error Handling

All functions have try-catch blocks with meaningful error messages:
```typescript
try {
  // operation
} catch (error) {
  console.error('Context:', error);
  throw new Error('User-friendly message');
}
```

### 4. Type Safety

TypeScript interfaces for all data structures:
- `Library` interface
- `LibraryBook` interface
- `Book` interface

## 📝 SQL Queries Cheat Sheet

### Get all visible books for a library
```sql
SELECT b.*
FROM "Book" b
INNER JOIN library_books lb ON b.id = lb.book_id
WHERE lb.library_id = 1 AND lb.is_visible = true;
```

### Get library stats
```sql
SELECT * FROM library_stats WHERE id = 1;
```

### Toggle book visibility
```sql
UPDATE library_books
SET is_visible = NOT is_visible
WHERE library_id = 1 AND book_id = 123;
```

### Add a book to library (hidden)
```sql
INSERT INTO library_books (library_id, book_id, is_visible)
VALUES (1, 456, false)
ON CONFLICT (library_id, book_id) DO NOTHING;
```

### Remove a book from library
```sql
DELETE FROM library_books
WHERE library_id = 1 AND book_id = 789;
```

### See books not yet synced
```sql
SELECT lb.*
FROM library_books lb
WHERE lb.last_synced < NOW() - INTERVAL '1 day';
```

## 🛠️ Admin Tasks

### Add a New Library

1. **Insert library record:**
```sql
INSERT INTO libraries (name, address, description, logo_url)
VALUES (
  'New Library Name',
  '0xYourContractAddress',
  'Library description',
  '/library-logos/yourlogo.png'
);
```

2. **Run sync:**
```bash
npm run sync:libraries
```

3. **Set books visible:**
```sql
UPDATE library_books
SET is_visible = true
WHERE library_id = 2; -- Use the new library's ID
```

### Make Books Visible

**All books:**
```sql
UPDATE library_books
SET is_visible = true
WHERE library_id = 1;
```

**Specific books:**
```sql
UPDATE library_books
SET is_visible = true
WHERE library_id = 1
  AND book_id IN (1, 2, 3, 5, 8, 13);
```

**Books by title pattern:**
```sql
UPDATE library_books lb
SET is_visible = true
FROM "Book" b
WHERE lb.book_id = b.id
  AND lb.library_id = 1
  AND b.title ILIKE '%Indonesia%';
```

### Hide Books

**Hide specific book:**
```sql
UPDATE library_books
SET is_visible = false
WHERE library_id = 1 AND book_id = 999;
```

## 🧪 Testing Checklist

### Database Setup
- [ ] Run migration SQL script
- [ ] Verify `library_books` table exists
- [ ] Verify `libraries` table has new columns
- [ ] Check "The Room 19" library exists

### Sync Script
- [ ] Run `npm run sync:libraries`
- [ ] Check console output for success
- [ ] Verify `library_books` has records
- [ ] Confirm books are invisible by default

### Frontend - Library List
- [ ] Navigate to `/libraries`
- [ ] See "The Room 19" card
- [ ] Stats are displayed correctly
- [ ] Contract address is truncated
- [ ] Click "Kunjungi Perpustakaan" works
- [ ] Auto-sync indicator shows status
- [ ] Manual sync button works

### Frontend - Library Detail
- [ ] Navigate to `/libraries/1`
- [ ] Library info is displayed
- [ ] Only visible books show up
- [ ] Empty state if no visible books
- [ ] Borrow/return buttons work
- [ ] Can read book after borrowing

### Visibility Control
- [ ] Set books invisible → don't show in UI
- [ ] Set books visible → show in UI
- [ ] New sync adds books as invisible
- [ ] Database updates reflect immediately

## 🐛 Troubleshooting

### No libraries showing

**Check database:**
```sql
SELECT * FROM libraries;
```

If empty, run migration script.

### No books showing in library

**Check visibility:**
```sql
SELECT book_id, is_visible
FROM library_books
WHERE library_id = 1;
```

Make books visible:
```sql
UPDATE library_books SET is_visible = true WHERE library_id = 1;
```

### Sync not working

**Check console for errors:**
- Blockscout API rate limit?
- Network connectivity?
- Invalid library address?

**Manual sync:**
```bash
npm run sync:libraries
```

### Books show in wrong library

**Check library_books mappings:**
```sql
SELECT lb.library_id, l.name, lb.book_id, b.title
FROM library_books lb
JOIN libraries l ON lb.library_id = l.id
JOIN "Book" b ON lb.book_id = b.id
WHERE lb.book_id = 123; -- Replace with your book ID
```

## 🔮 Future Enhancements

### 1. Admin Panel UI
Build web UI for managing visibility:
- `/admin/libraries/:id/books`
- Toggle switches for each book
- Bulk show/hide actions
- Search and filter books

### 2. Library Analytics
Track usage metrics:
- Most borrowed books per library
- Active users per library
- Borrow duration statistics

### 3. Multiple Pool Contracts
Support libraries with multiple pool contracts:
```sql
ALTER TABLE libraries ADD COLUMN pool_addresses TEXT[];
```

### 4. Waitlist System
Queue users when all copies are borrowed.

### 5. Library Groups
Group libraries by region, category, or organization.

## 📚 References

- [Blockscout API Docs](https://docs.blockscout.com/)
- [Supabase Postgres Docs](https://supabase.com/docs/guides/database)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [Libere Main README](./README.md)
- [CLAUDE.md](./CLAUDE.md)

## ✅ Summary

The multi-library system is now fully implemented with:

✅ **Database schema** for library-book associations with visibility control
✅ **Auto-sync mechanism** that polls Blockscout every 5 minutes
✅ **Library list UI** with profile cards and stats
✅ **Library detail pages** showing only visible books
✅ **Helper functions** for reusable database operations
✅ **Admin-friendly** SQL queries for managing visibility
✅ **Security-first** approach (books invisible by default)

Ready to scale to multiple libraries! 🚀
