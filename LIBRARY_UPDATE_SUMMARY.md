---
noteId: "3b703440b54711f0ad8f4f365506ecb8"
tags: []

---

# Library Page Update - Implementation Summary

## Changes Made

### 1. **New Library Pool Contract**
- **Old Address:** `0x584f1c676445707E3AF1A16b4B78186E445A8C93`
- **New Address:** `0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0`

### 2. **Files Created**

#### `src/library-pool.abi.ts` (NEW)
- Exports library pool contract address
- Exports library pool ABI from `abi-libere.json`
- Provides TypeScript-friendly imports for library pool integration

### 3. **Files Modified**

#### `src/pages/LibraryScreen.tsx`
**Changes:**
- Added import: `import { libraryPoolAddress } from "../library-pool.abi"`
- **Line 44:** Changed hardcoded URL to use `libraryPoolAddress` variable
- Now dynamically fetches NFTs from the new library pool contract

**Before:**
```typescript
const res = await fetch('https://base-sepolia.blockscout.com/api/v2/addresses/0x584f1c676445707E3AF1A16b4B78186E445A8C93/nft?type=ERC-1155');
```

**After:**
```typescript
const res = await fetch(`https://base-sepolia.blockscout.com/api/v2/addresses/${libraryPoolAddress}/nft?type=ERC-1155`);
```

#### `src/components/civilib/CivilibBookCard.tsx`
**Major Refactor:**

**Old Implementation:**
- Called `getAccessInfo(bookId)` which doesn't exist in new architecture
- Showed: `"Availability: X left"`
- Used state: `accessed`, `availability`

**New Implementation:**
- Calls TWO contract functions to get accurate availability data
- Shows: `"Availability: X/Y"` format
- Uses state: `totalStock`, `frozenNow`, `loading`

**Contract Calls:**

1. **`balanceOf()` on Main Contract** (`0xC12F333f41D7cedB209F24b303287531Bb05Bc67`)
   ```typescript
   const totalStockBalance = await clientPublic.readContract({
     address: contractAddress,
     abi: contractABI,
     functionName: "balanceOf",
     args: [libraryPoolAddress, BigInt(book.id)],
   });
   ```
   - Gets total number of NFTs the library pool owns for this book

2. **`previewAvailability()` on Library Pool Contract** (`0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0`)
   ```typescript
   const availabilityData = await clientPublic.readContract({
     address: libraryPoolAddress,
     abi: libraryPoolABI,
     functionName: "previewAvailability",
     args: [BigInt(book.id)],
   });
   ```
   - Returns `[available, frozenNow]`
   - `frozenNow` = number of books currently borrowed

**Calculation:**
```typescript
availableBooks = totalStock - frozenNow
```

**UI Display Logic:**
- **Loading state:** Shows "Loading availability..." with pulse animation
- **No stock:** `totalStock === 0` → Shows "Not in library collection" (yellow badge)
- **Books available:** `availableBooks > 0` → Shows "Availability: X/Y" (green badge)
- **All borrowed:** `availableBooks === 0` → Shows "Availability: 0/Y" (red badge)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Main Contract (0xC12F333f41D7cedB209F24b303287531Bb05Bc67) │
│  - Stores all book NFTs (ERC-1155)                          │
│  - balanceOf(libraryPool, bookId) → Get library's stock    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Library Pool (0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0)  │
│  - Manages book borrowing/lending (ERC-5006)                │
│  - previewAvailability(bookId) → [available, frozenNow]     │
│  - borrowFromPool(bookId) → Borrow a book                   │
│  - returnMyBorrow(bookId) → Return borrowed book            │
└─────────────────────────────────────────────────────────────┘
```

## Display Examples

### Example 1: Library has 5 books, none borrowed
- `balanceOf()` returns: `5`
- `previewAvailability()` returns: `[5, 0]`
- **Display:** `Availability: 5/5` (green badge)

### Example 2: Library has 5 books, 1 borrowed
- `balanceOf()` returns: `5`
- `previewAvailability()` returns: `[4, 1]`
- **Display:** `Availability: 4/5` (green badge)

### Example 3: Library has 5 books, all borrowed
- `balanceOf()` returns: `5`
- `previewAvailability()` returns: `[0, 5]`
- **Display:** `Availability: 0/5` (red badge)

### Example 4: Book not in library
- `balanceOf()` returns: `0`
- **Display:** `Not in library collection` (yellow badge)

## Data Flow

```
User opens /libraries page
         ↓
LibraryScreen fetches books from Supabase
         ↓
LibraryScreen queries Blockscout API with NEW address
         ↓
Filters books by NFT IDs in library pool
         ↓
CivilibBookList renders filtered books
         ↓
For each book, CivilibBookCard:
  1. Calls balanceOf() on main contract
  2. Calls previewAvailability() on library pool
  3. Calculates: available = totalStock - frozenNow
  4. Displays: "X/Y" format with color-coded badge
```

## Testing Checklist

- [x] Build succeeds without errors in modified files
- [x] LibraryScreen uses new contract address
- [x] CivilibBookCard imports library pool ABI
- [x] CivilibBookCard calls balanceOf() correctly
- [x] CivilibBookCard calls previewAvailability() correctly
- [x] Availability calculation logic is correct
- [x] UI displays X/Y format
- [x] Loading state shows while fetching
- [x] Yellow badge for books not in collection
- [x] Green badge for available books
- [x] Red badge for unavailable books

## Next Steps (Future Implementation)

1. **Borrowing Feature** - Implement `borrowFromPool()` function
2. **Return Feature** - Implement `returnMyBorrow()` function
3. **Borrow History** - Show user's borrowing history
4. **Due Dates** - Display expiry time for borrowed books
5. **EAS Integration** - Ethereum Attestation Service for borrow records

## Technical Notes

- **Main Contract ABI:** Uses existing `smart-contract.abi.ts`
- **Library Pool ABI:** Uses new `library-pool.abi.ts` importing from `abi-libere.json`
- **Network:** Base Sepolia Testnet
- **API:** Blockscout API for fetching NFT ownership data
- **Error Handling:** Graceful fallback to 0 stock if contract calls fail
