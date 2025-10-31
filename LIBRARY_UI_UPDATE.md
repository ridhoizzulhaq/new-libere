---
noteId: "a48aca30b54711f0ad8f4f365506ecb8"
tags: []

---

# Library Page UI Update

## Changes Summary

### 1. **Removed USDC Price Badge**
- ❌ Removed price display from library book cards
- ❌ Removed `USDC_DECIMALS` import
- ❌ Removed `priceInUSDC` calculation
- ❌ Removed `formattedPrice` variable

**Reason:** Library books are free to borrow, no need to show purchase price.

### 2. **Added "Available" Tag**
- ✅ Added green "Available" badge at top-right corner of card
- ✅ Only shows when `availableBooks > 0`
- ✅ Hidden during loading state
- ✅ Hidden when book not available or not in collection

## Visual Changes

### Before:
```
┌─────────────────────────┐
│                         │
│     Book Cover Image    │
│                         │
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ 💵 1.00 USDC           │  ← REMOVED
│ 🟢 Availability: 4/5    │
│ [Borrow Button]         │
└─────────────────────────┘
```

### After:
```
┌─────────────────────────┐
│                [Available]  ← NEW (top-right badge)
│     Book Cover Image    │
│                         │
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ 🟢 Availability: 4/5    │
│ [Borrow Button]         │
└─────────────────────────┘
```

## Implementation Details

### Available Tag Styling:
```tsx
<div className="absolute top-3 right-3 z-10">
  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
    Available
  </span>
</div>
```

**CSS Properties:**
- **Position:** `absolute top-3 right-3` - Top-right corner with padding
- **Z-index:** `z-10` - Above book cover image
- **Background:** `bg-green-500` - Bright green for visibility
- **Text:** `text-white text-xs font-bold` - White, small, bold text
- **Padding:** `px-3 py-1` - Horizontal & vertical spacing
- **Border:** `rounded-full` - Pill-shaped badge
- **Shadow:** `shadow-md` - Medium shadow for depth

### Conditional Rendering Logic:
```tsx
{!loading && availableBooks > 0 && (
  <div>Available Tag</div>
)}
```

**Conditions:**
1. `!loading` - Data has finished loading
2. `availableBooks > 0` - At least 1 book is available to borrow

**When Tag Shows:**
- ✅ Book in collection + books available to borrow
- ✅ Example: Library has 5 books, 1 borrowed → Shows "Available" (4 available)

**When Tag Hidden:**
- ❌ Loading data
- ❌ Book not in library collection (`totalStock === 0`)
- ❌ All books borrowed (`availableBooks === 0`)
- ❌ Example: Library has 5 books, all borrowed → No "Available" tag

## Card States Visualization

### State 1: Loading
```
┌─────────────────────────┐
│     Book Cover Image    │
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ ⏳ Loading availability │
└─────────────────────────┘
```

### State 2: Available (4/5 books free)
```
┌─────────────────────────┐
│    Book Cover   [Available]
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ 🟢 Availability: 4/5    │
│ [Borrow Button]         │
└─────────────────────────┘
```

### State 3: All Borrowed (0/5 books free)
```
┌─────────────────────────┐
│     Book Cover Image    │  (No "Available" tag)
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ 🔴 Availability: 0/5    │
│ [Not Available Button]  │
└─────────────────────────┘
```

### State 4: Not in Collection
```
┌─────────────────────────┐
│     Book Cover Image    │  (No "Available" tag)
├─────────────────────────┤
│ Book Title              │
│ Author Name             │
│ 🟡 Not in library       │
└─────────────────────────┘
```

## File Changes

**Modified:** `src/components/civilib/CivilibBookCard.tsx`

### Lines Removed:
- Line 6: `import { USDC_DECIMALS } from "../../usdc-token";`
- Lines 22-28: USDC price calculation logic
- Lines 94-97: USDC price badge UI

### Lines Added:
- Line 70: Added `relative` class to card container
- Lines 72-79: "Available" tag component (conditional render)

## Testing Checklist

- [x] Build passes without errors
- [x] USDC price badge removed from library cards
- [x] "Available" tag appears when books are available
- [x] "Available" tag hidden when all books borrowed
- [x] "Available" tag hidden when book not in collection
- [x] "Available" tag hidden during loading
- [x] Tag positioned correctly at top-right corner
- [x] Tag has proper styling (green background, white text)
- [x] Tag has shadow for visual depth

## User Experience Benefits

✅ **Clearer Purpose** - Library page is for borrowing, not purchasing  
✅ **Quick Visual Scan** - Green "Available" badge makes it easy to spot borrowable books  
✅ **Less Clutter** - Removed unnecessary price information  
✅ **Better Accessibility** - Clear visual indicator for availability status  

## Next Steps

Ready for borrowing feature implementation:
1. Implement `borrowFromPool()` functionality
2. Add return book feature
3. Show user's current borrowed books
4. Display due dates/expiry times
