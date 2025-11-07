# 📚 Library Access Verification - Complete Guide

## Overview

The EPUB reader now supports **dual access verification**:
1. ✅ **NFT Ownership** (via purchase)
2. ✅ **Library Borrowing** (temporary access)

**Implementation Date**: 2025-01-04
**File**: [src/pages/EpubReaderScreen.tsx](src/pages/EpubReaderScreen.tsx)

---

## 🔐 How It Works

### Access Verification Flow

```
User opens /read-book/1761747515
         ↓
┌────────────────────────────────────┐
│  1. Check Authentication           │
│     - Is user logged in?           │
│     - Does user have wallet?       │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  2. Check NFT Ownership            │
│     Contract: Marketplace          │
│     Function: balanceOf()          │
└────────────────────────────────────┘
         ↓
    Balance > 0?
         │
    YES  │  NO
    ✅   │   ↓
    │    │  ┌─────────────────────────┐
    │    │  │  3. Check Library Borrow│
    │    │  │     Contract: LibPool   │
    │    │  │     Function:           │
    │    │  │     getActiveBorrows()  │
    │    │  └─────────────────────────┘
    │    │           ↓
    │    │      Has Borrow?
    │    │           │
    │    │      YES  │  NO
    │    │      ✅   │  ❌
    │    │       │   │
    │    └───────┴───┴──────┐
    │                       │
    ↓                       ↓
✅ GRANT ACCESS      ❌ REDIRECT
   Load EPUB            Alert + Go to /books/:id
```

---

## 💻 Implementation Details

### State Management

```typescript
const [ownsNFT, setOwnsNFT] = useState<boolean | null>(null);
const [hasBorrowed, setHasBorrowed] = useState<boolean | null>(null);
const [borrowExpiry, setBorrowExpiry] = useState<number | null>(null);

// null = still checking
// true = has access via this method
// false = no access via this method
```

### Verification Code

```typescript
// CHECK 1: NFT Ownership
const balance = await publicClient.readContract({
  address: contractAddress,
  abi: contractABI,
  functionName: 'balanceOf',
  args: [userWalletAddress, bookId],
});

if (balance > 0n) {
  setOwnsNFT(true);
  return; // ✅ Has access via ownership
}

// CHECK 2: Library Borrowing
const activeBorrows = await publicClient.readContract({
  address: libraryPoolAddress,
  abi: libraryPoolABI,
  functionName: 'getActiveBorrows',
  args: [userWalletAddress],
});

const borrowForThisBook = activeBorrows.find(
  (borrow) => Number(borrow.tokenId) === Number(bookId)
);

if (borrowForThisBook && borrowForThisBook.expiry > now) {
  setHasBorrowed(true);
  setBorrowExpiry(borrowForThisBook.expiry);
  return; // ✅ Has access via borrowing
}

// ❌ No access
```

---

## 🎨 UI Features

### Borrow Status Badge

When user reads a **borrowed book**, a blue badge appears in the header:

```
┌────────────────────────────────────────┐
│ ← Back  │  📖 Book Title               │
│         │  📚 Borrowed - Expires: 6d 5h│
└────────────────────────────────────────┘
```

**Badge shows**:
- `6d 5h` → 6 days 5 hours remaining
- `23h` → 23 hours remaining
- `Soon` → Less than 1 hour

**Styling**:
- Background: `bg-blue-100`
- Text: `text-blue-700`
- Rounded pill shape

---

## 📊 Access Scenarios

### Scenario 1: User Owns NFT (Purchased)

```
Input: User purchased book #1761747515
Output:
  - ownsNFT: true
  - hasBorrowed: false
  - Access: ✅ GRANTED
  - Badge: NOT shown (owned permanently)

Console:
  ✅ [Access Check] User OWNS this book NFT (purchased)
  ✅ [Access Check] User granted access via: NFT Ownership
```

---

### Scenario 2: User Borrowed from Library

```
Input: User borrowed book #1761866400 from library
Output:
  - ownsNFT: false
  - hasBorrowed: true
  - borrowExpiry: 1735987200 (future timestamp)
  - Access: ✅ GRANTED
  - Badge: ✅ SHOWN (Borrowed - Expires: 5d 12h)

Console:
  📖 [Access Check] Checking NFT ownership...
     User does not own NFT, checking library borrow...
  📚 [Access Check] Checking library borrow status...
  ✅ [Access Check] User has BORROWED this book from library
     Expiry: 2025-01-10 12:00:00 PM
  ✅ [Access Check] User granted access via: Library Borrowing
```

---

### Scenario 3: Borrowed but Expired

```
Input: User borrowed book but 7 days passed
Output:
  - ownsNFT: false
  - hasBorrowed: false
  - Access: ❌ DENIED
  - Redirect: /books/1761866400

Console:
  ⚠️ [Access Check] Borrow has EXPIRED
  ❌ [Access Check] User has NO access to this book
  🚫 [Access Check] Redirecting - no access

Alert:
  "⚠️ You do not have access to this book!
   Please purchase the book or borrow it from the library."
```

---

### Scenario 4: No Access at All

```
Input: User never purchased or borrowed
Output:
  - ownsNFT: false
  - hasBorrowed: false
  - Access: ❌ DENIED
  - Redirect: /books/1761747515

Console:
     User does not own NFT, checking library borrow...
     User has not borrowed this book
  ❌ [Access Check] User has NO access to this book
  🚫 [Access Check] Redirecting - no access
```

---

## 🧪 Testing Guide

### Test Case 1: Purchased Book ✅

**Setup**:
```bash
# User purchased book #1761747515
# Balance in contract = 1
```

**Steps**:
1. Login as user
2. Navigate to `/read-book/1761747515`

**Expected**:
- ✅ Book loads
- ❌ No blue badge (owned, not borrowed)
- Console: `User OWNS this book NFT`

---

### Test Case 2: Borrowed Book ✅

**Setup**:
```bash
# User borrowed book #1761866400
# Active borrow record exists
# Expiry: 6 days from now
```

**Steps**:
1. Login as user
2. Navigate to `/read-book/1761866400`

**Expected**:
- ✅ Book loads
- ✅ Blue badge shows: "📚 Borrowed - Expires: 6d"
- Console: `User has BORROWED this book from library`

---

### Test Case 3: Expired Borrow ❌

**Setup**:
```bash
# User borrowed book 8 days ago (expired)
```

**Steps**:
1. Login as user
2. Try to open borrowed book

**Expected**:
- ❌ Alert: "You do not have access to this book!"
- ❌ Redirect to `/books/:id`
- Console: `Borrow has EXPIRED`

---

### Test Case 4: Both Owned AND Borrowed

**Setup**:
```bash
# Edge case: User owns book AND also borrowed it
```

**Steps**:
1. User purchases book
2. User also borrows from library
3. Navigate to `/read-book/:id`

**Expected**:
- ✅ Book loads via ownership (check 1 passes)
- ❌ No blue badge (ownership takes precedence)
- Console: `User OWNS this book NFT` (stops after check 1)

---

## 🔧 Smart Contracts

### Main Marketplace Contract

```solidity
// Address: 0xC12F333f41D7cedB209F24b303287531Bb05Bc67

function balanceOf(address account, uint256 id)
  external
  view
  returns (uint256);

// Returns: Number of NFTs owned (0 or 1 for ERC-1155)
```

### Library Pool Contract

```solidity
// Address: 0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0

struct BorrowView {
  uint256 recordId;
  uint256 tokenId;
  uint256 expiry; // Unix timestamp
}

function getActiveBorrows(address user)
  external
  view
  returns (BorrowView[] memory);

// Returns: Array of active borrows (not expired)
```

---

## 📝 Console Logs Reference

### Successful Access (Owned)
```
🔐 [Access Check] Verifying access for book #1761747515
   User wallet: 0xABC123...
📖 [Access Check] Checking NFT ownership...
   NFT Balance: 1
✅ [Access Check] User OWNS this book NFT (purchased)
✅ [Access Check] User granted access via: NFT Ownership
📚 [LoadBook] Fetching book #1761747515 from database...
```

### Successful Access (Borrowed)
```
🔐 [Access Check] Verifying access for book #1761866400
📖 [Access Check] Checking NFT ownership...
   NFT Balance: 0
   User does not own NFT, checking library borrow...
📚 [Access Check] Checking library borrow status...
   Active borrows: [Array(1)]
✅ [Access Check] User has BORROWED this book from library
   Expiry: 2025-01-10 3:00:00 PM
✅ [Access Check] User granted access via: Library Borrowing
```

### Failed Access
```
🔐 [Access Check] Verifying access for book #1761747515
   User wallet: 0xXYZ789...
📖 [Access Check] Checking NFT ownership...
   NFT Balance: 0
   User does not own NFT, checking library borrow...
📚 [Access Check] Checking library borrow status...
   Active borrows: []
   User has not borrowed this book
❌ [Access Check] User has NO access to this book
⏳ [Access Check] Still checking access...
🚫 [Access Check] Redirecting - no access
```

---

## 🎯 Key Features

### ✅ Implemented

1. **Dual Verification System**
   - Checks NFT ownership first
   - Falls back to library borrowing
   - Both methods grant full access

2. **Expiry Checking**
   - Validates borrow expiry timestamp
   - Rejects expired borrows
   - Shows time remaining in UI

3. **Visual Feedback**
   - Blue badge for borrowed books
   - Shows countdown timer
   - Updates dynamically

4. **Graceful Fallback**
   - If owned, skip borrow check
   - If no access, redirect with message
   - Handles errors gracefully

5. **Comprehensive Logging**
   - Tracks verification steps
   - Shows access method used
   - Debuggable flow

---

## 🔒 Security Notes

### Access Control

**Strengths**:
- ✅ Blockchain verification (cannot be faked)
- ✅ Dual verification adds flexibility
- ✅ Expiry checking prevents stale access
- ✅ Same protection as NFT ownership

**Consistency**:
- ✅ Both purchased AND borrowed books get same reading experience
- ✅ Both get watermark overlay
- ✅ Both get content protection (right-click disabled)
- ✅ No difference in functionality

**Limitations**:
- ⚠️ Borrow expiry checked only on page load (not live)
- ⚠️ If borrow expires while reading, user can continue until page refresh
- ✅ This is acceptable (same as library due dates in real life)

---

## 🚀 Future Enhancements

### Priority MEDIUM

**Live Expiry Monitoring**:
```typescript
// Check expiry every 5 minutes while reading
useEffect(() => {
  if (!hasBorrowed || !borrowExpiry) return;

  const checkExpiry = () => {
    const now = Math.floor(Date.now() / 1000);
    if (now > borrowExpiry) {
      alert('⚠️ Your borrow period has expired!');
      navigate('/libraries');
    }
  };

  const interval = setInterval(checkExpiry, 5 * 60 * 1000); // 5 min
  return () => clearInterval(interval);
}, [hasBorrowed, borrowExpiry]);
```

**Auto-Renew Prompt**:
```typescript
// Show reminder when < 24 hours left
if (timeLeft < 86400) {
  // "Your borrow expires in 23 hours. Renew now?"
}
```

---

## 📖 Related Documentation

- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) - General security features
- [CLAUDE.md](CLAUDE.md) - Project overview
- [LIBRARY_BORROWING_IMPLEMENTATION.md](LIBRARY_BORROWING_IMPLEMENTATION.md) - Library system details

---

## 🎉 Summary

**Status**: ✅ **Production Ready**

**What Works**:
- ✅ NFT ownership verification
- ✅ Library borrowing verification
- ✅ Expiry checking
- ✅ Visual indicators
- ✅ Graceful redirects

**User Experience**:
- 📖 Owned books: Permanent access, no badge
- 📚 Borrowed books: Temporary access, blue badge with countdown
- 🚫 No access: Redirect with helpful message

**Access Methods**:
1. **Purchase** → NFT ownership → Permanent
2. **Borrow** → Library record → 7 days
3. **None** → Blocked → Purchase or borrow

---

**Document Version**: 1.0
**Last Updated**: 2025-01-04
**Maintainer**: Development Team
