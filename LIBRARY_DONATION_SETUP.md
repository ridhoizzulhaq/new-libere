# Library Donation Feature - Setup Guide

This feature adds a popup modal to the "Donate to Library" button that allows users to:
- Select from registered libraries stored in Supabase
- Enter a custom library contract address
- Specify the number of books to donate
- Complete the donation transaction to the selected library

## Files Created/Modified

### New Files:
1. **src/libs/supabase.ts** - Supabase client configuration
2. **src/core/interfaces/library.interface.ts** - Library type definition
3. **src/components/LibraryDonationModal.tsx** - Main modal component
4. **supabase-setup.sql** - Database setup script

### Modified Files:
1. **src/pages/BookDetailScreen.tsx** - Integrated modal with donation flow

## Database Setup

### Step 1: Run SQL Script in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the script

This will:
- Create the `libraries` table
- Insert 3 sample libraries for testing
- Add an index for performance

### Step 2: Verify Table Creation

Run this query to verify:
```sql
SELECT * FROM libraries;
```

You should see 3 sample libraries.

## Usage

### User Flow:

1. User navigates to a book detail page
2. Clicks the **"Donate to Library"** button
3. A modal popup appears with:
   - **Dropdown** to select a registered library
   - Option to enter a **custom address**
   - **Amount field** to specify number of books (default: 1)
   - **Price summary** showing total cost
4. User selects a library or enters custom address
5. User adjusts amount if needed
6. Clicks **"Donate"** button
7. Modal closes and transaction begins:
   - Step 1: Approve USDC spending (price × amount)
   - Step 2: Call `purchaseItemForLibrary(address, bookId, amount)`
8. Success message displays on main page

### Adding New Libraries to Database:

```sql
INSERT INTO libraries (name, address, description) VALUES
  ('Your Library Name', '0xYourLibraryContractAddress', 'Library description');
```

## Technical Details

### Contract Function Used:
```solidity
function purchaseItemForLibrary(
    address pool,     // Library contract address
    uint256 id,       // Book ID
    uint256 amount    // Number of books
) external payable nonReentrant
```

### Validation:
- Address must be a valid Ethereum address (42 chars, starts with 0x)
- Amount must be >= 1
- Uses `viem.isAddress()` for validation

### Payment Flow:
1. Calculate total: `bookPrice × amount`
2. Approve USDC token spending
3. Execute `purchaseItemForLibrary` transaction
4. Books are minted to the library pool address

## Testing Checklist

- [ ] Modal opens when clicking "Donate to Library"
- [ ] Libraries load from Supabase dropdown
- [ ] Can select a registered library
- [ ] Can select "Custom Address" option
- [ ] Custom address input appears when selected
- [ ] Address validation works (invalid addresses show error)
- [ ] Amount can be changed (min: 1)
- [ ] Total price updates when amount changes
- [ ] "Donate" button triggers transaction
- [ ] Success message appears after completion
- [ ] Error handling works for failed transactions

## Environment Variables Required

Make sure these are set in your `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_API_KEY=your_supabase_anon_key
```

## Troubleshooting

### Libraries not loading?
- Check Supabase connection in browser console
- Verify environment variables are set
- Check if `libraries` table exists in Supabase

### Transaction fails?
- Ensure user has enough USDC balance
- Verify library address is a valid contract
- Check network (Base Sepolia testnet)

### Address validation error?
- Address must be 42 characters
- Must start with "0x"
- Must be a valid Ethereum address format

## Future Enhancements

Possible improvements:
- [ ] Add search/filter for libraries dropdown
- [ ] Show library metadata (logo, website)
- [ ] Add "Recently used" libraries
- [ ] Save favorite libraries per user
- [ ] Add library verification badge
- [ ] Show library statistics (total books, members)
