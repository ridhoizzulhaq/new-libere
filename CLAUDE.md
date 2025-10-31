---
noteId: "20570f30b60a11f0ad8f4f365506ecb8"
tags: []

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Libere** is a decentralized digital library platform built on Base Sepolia blockchain. It enables users to publish, purchase, donate, borrow, and read digital books (EPUB format) as ERC-1155 NFTs with USDC payments and gasless transactions.

## Key Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Auth & Wallet**: Privy (embedded wallets with smart wallet support)
- **Blockchain**: Base Sepolia testnet
- **Smart Contracts**: ERC-1155 NFT marketplace + Library Pool (ERC-4337)
- **Payment**: USDC (6 decimals) - address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Storage**: Pinata (IPFS) for book files, Supabase for metadata
- **Ethereum Libraries**: viem v2 + ethers v6 + permissionless

## Smart Contracts

### Main Marketplace Contract
- **Address**: `0xC12F333f41D7cedB209F24b303287531Bb05Bc67`
- **Functions**:
  - `createItem()` - Publish new book NFT
  - `purchaseItem()` - Buy book with USDC
  - `purchaseItemForLibrary()` - Donate book to library pool
- **ABI**: [src/smart-contract.abi.ts](src/smart-contract.abi.ts)

### Library Pool Contract
- **Address**: `0xA31D6d3f2a6C5fBA99E451CCAAaAdf0bca12cbF0`
- **Functions**:
  - `borrowFromPool(tokenId)` - Borrow book (returns recordId)
  - `returnMyBorrow(tokenId)` - Return borrowed book
  - `getActiveBorrows(address)` - Get user's active borrows with expiry
  - `previewAvailability(tokenId)` - Check available copies
- **ABI**: [src/library-pool.abi.ts](src/library-pool.abi.ts)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Lint code
npm run lint
```

## Environment Setup

Copy `.env.example` (provided in git status output) and configure:

```env
# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id

# Pinata IPFS Storage
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_api_key

# Supabase Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your_supabase_anon_public_key

# Base Sepolia Blockchain API
VITE_BASE_SEPOLIA_LIBRARY_URL=https://base-sepolia.blockscout.com/api/v2/addresses/...
VITE_BASE_SEPOLIA_LIBRARY_BASE_URL=https://base-sepolia.blockscout.com/api/v2/addresses/
```

## Architecture

### Application Flow

```
main.tsx → PrivyProvider (auth) → CurrencyProvider → BrowserRouter → Routes
```

### Route Structure

**Public Routes:**
- `/` → Redirect to `/books`
- `/auth` → AuthScreen (Privy login)
- `/books` → HomeScreen (browse all books)
- `/books/:id` → BookDetailScreen (view book details + purchase/donate)

**Protected Routes** (requires Privy authentication):
- `/libraries` → LibraryScreen (browse library books + borrow)
- `/bookselfs` → BookselfScreen (user's owned + borrowed books)
- `/read-book/:id` → EpubReaderScreen (read EPUB with watermark)

**Temporarily Hidden:**
- `/publish` → CreateBookV2Screen (publish new books - currently disabled due to onlyOwner contract restriction)

### Core Directories

```
src/
├── pages/              # Route screens
├── components/         # Reusable UI components
│   ├── civilib/       # Library-specific components
│   ├── bookself/      # Bookshelf-specific components
│   ├── layouts/       # Layout wrappers (AuthLayout, HomeLayout)
│   ├── reader/        # EPUB reader components (WatermarkOverlay)
│   └── buttons/       # Button components (GoogleAuthButton)
├── providers/          # Context providers (PrivyProvider)
├── contexts/          # React contexts (CurrencyContext)
├── routes/            # Route guards (ProtectedRoute)
├── core/
│   ├── interfaces/    # TypeScript interfaces (Book, Library)
│   └── constants/     # Constants (ETH_PRICE)
├── libs/              # External service configs (supabase, config)
├── smart-contract.abi.ts  # Main contract ABI + address
├── library-pool.abi.ts    # Library pool contract ABI + address
└── usdc-token.ts          # USDC token address + decimals
```

### Key Interfaces

**Book Interface** ([src/core/interfaces/book.interface.ts](src/core/interfaces/book.interface.ts)):
```typescript
interface Book {
  id: number;                    // NFT token ID
  title: string;
  author: string;
  publisher: string;
  description: string;
  metadataUri: string;           // IPFS cover image URL
  epub: string;                  // IPFS EPUB file URL
  priceEth: string;              // USDC price (6 decimals) - misleading name!
  royalty: number;               // Basis points (500 = 5%)
  addressReciepent: string;      // Payment recipient
  addressRoyaltyRecipient: string;
  quantity?: number;             // NFT balance (for bookshelf)
}
```

**Library Interface** ([src/core/interfaces/library.interface.ts](src/core/interfaces/library.interface.ts)):
```typescript
interface Library {
  id: number;
  name: string;
  address: string;               // Ethereum address (pool contract)
  description?: string;
  created_at?: string;
}
```

## Transaction Patterns

### Gasless Transactions (Sponsored by Privy)

All blockchain transactions use Privy Smart Wallets (ERC-4337) for gasless execution:

```typescript
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { encodeFunctionData } from "viem";
import { baseSepolia } from "viem/chains";

const { client } = useSmartWallets();

// Encode function call
const data = encodeFunctionData({
  abi: contractABI,
  functionName: "functionName",
  args: [arg1, arg2],
});

// Send gasless transaction
const txHash = await client.sendTransaction({
  chain: baseSepolia,
  to: contractAddress,
  data: data,
  value: BigInt(0), // No ETH needed
});
```

### USDC Purchase Flow (2 Steps)

**Step 1: Approve USDC spending**
```typescript
// User must first approve marketplace to spend USDC
const approveData = encodeFunctionData({
  abi: erc20Abi,
  functionName: "approve",
  args: [contractAddress, priceInUSDC],
});

await client.sendTransaction({
  chain: baseSepolia,
  to: usdcTokenAddress,
  data: approveData,
});
```

**Step 2: Purchase book**
```typescript
const purchaseData = encodeFunctionData({
  abi: contractABI,
  functionName: "purchaseItem",
  args: [BigInt(bookId), BigInt(1)], // amount is always 1
});

await client.sendTransaction({
  chain: baseSepolia,
  to: contractAddress,
  data: purchaseData,
  value: BigInt(0), // Using USDC, not ETH
});
```

### Library Borrowing Flow

**Borrow a book:**
```typescript
const borrowData = encodeFunctionData({
  abi: libraryPoolABI,
  functionName: "borrowFromPool",
  args: [BigInt(bookId)],
});

const txHash = await client.sendTransaction({
  chain: baseSepolia,
  to: libraryPoolAddress,
  data: borrowData,
});
```

**Return a book:**
```typescript
const returnData = encodeFunctionData({
  abi: libraryPoolABI,
  functionName: "returnMyBorrow",
  args: [BigInt(bookId)],
});

await client.sendTransaction({
  chain: baseSepolia,
  to: libraryPoolAddress,
  data: returnData,
});
```

**Check active borrows:**
```typescript
import { readContract } from "viem/actions";
import { createPublicClient, http } from "viem";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const activeBorrows = await readContract(publicClient, {
  address: libraryPoolAddress,
  abi: libraryPoolABI,
  functionName: "getActiveBorrows",
  args: [userAddress],
});
// Returns: BorrowView[] { recordId, tokenId, expiry }
```

## Important Implementation Notes

### Price Storage
The database field `priceEth` is **misleadingly named** - it actually stores USDC units (6 decimals), not ETH wei (18 decimals).

```typescript
// Convert USDC units to readable format
const usdcUnitsToReadable = (units: string | number | bigint) => {
  return Number(units) / Math.pow(10, 6); // USDC has 6 decimals
};

// Example: "1000000" stored → displays as "1.00 USDC"
```

### Royalty Conversion
Royalties are stored as basis points (1% = 100 bps):

```typescript
// Convert percentage to basis points
const royaltyPercentage = 5.0; // 5%
const royaltyBps = royaltyPercentage * 100; // 500 bps
```

### Authentication Pattern

```typescript
import { usePrivy } from "@privy-io/react-auth";

const { authenticated, user, login, logout } = usePrivy();

if (!authenticated) {
  // Redirect to /auth or show login button
  login();
}

// Access user data
console.log(user?.wallet?.address); // Smart wallet address
```

### Reading Contract Data

Use `readContract` from viem for read-only operations (no gas needed):

```typescript
import { readContract } from "viem/actions";

const balance = await readContract(publicClient, {
  address: contractAddress,
  abi: contractABI,
  functionName: "balanceOf",
  args: [userAddress, BigInt(bookId)],
});
```

### IPFS Integration

Books are stored on IPFS via Pinata:
- **Cover images**: Uploaded as PNG/JPG
- **EPUB files**: Uploaded as .epub
- **URLs**: `https://gateway.pinata.cloud/ipfs/{hash}`

Access Pinata credentials from `config.env.pinata` ([src/libs/config.ts](src/libs/config.ts)).

### Supabase Integration

Database schema includes:
- `Book` table: Stores book metadata
- `Library` table: Stores library pool information

Access via initialized client:
```typescript
import { supabase } from './libs/supabase';

const { data, error } = await supabase
  .from('Book')
  .select('*')
  .eq('id', bookId)
  .single();
```

## Admin Publishing Tool

Located in `admin-publish/` directory - a standalone Vite app for publishing books:

**Setup:**
```bash
cd admin-publish
npm install
npm run dev
```

**Important**: Requires owner private key in `.env`. Only for local development - never deploy to production.

See [admin-publish/README.md](admin-publish/README.md) for detailed instructions.

## Known Issues & Workarounds

### 1. onlyOwner Restriction on createItem()
The marketplace contract's `createItem()` function has an `onlyOwner` modifier, preventing regular users from publishing books directly.

**Workaround**: Use the admin-publish tool with owner private key.

**Future Fix**: Deploy new contract without onlyOwner modifier for public publishing.

### 2. Payment Token Configuration
The marketplace contract must have `setPaymentToken()` called with USDC address before purchases work.

**Verify with**:
```typescript
const paymentToken = await readContract(publicClient, {
  address: contractAddress,
  abi: contractABI,
  functionName: "paymentToken",
});
// Should return: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

### 3. Testnet Tokens Required
Users need Base Sepolia testnet USDC for purchases. Get from faucets:
- Base Sepolia ETH: https://docs.base.org/tools/network-faucets
- USDC: Use bridge or request from team

## Documentation Files

Additional implementation guides:
- [USDC_PURCHASE_FLOW_COMPLETE.md](USDC_PURCHASE_FLOW_COMPLETE.md) - Complete USDC purchase implementation
- [LIBRARY_BORROWING_IMPLEMENTATION.md](LIBRARY_BORROWING_IMPLEMENTATION.md) - Borrowing system details
- [SUPABASE_MIGRATION_GUIDE.md](SUPABASE_MIGRATION_GUIDE.md) - Database setup
- [PUBLISH_BOOK_USDC_GUIDE.md](PUBLISH_BOOK_USDC_GUIDE.md) - Publishing books guide
- [SOLUTION_ONLYOWNER_ISSUE.md](SOLUTION_ONLYOWNER_ISSUE.md) - onlyOwner workaround details

## Testing & Debugging

### Test with Dummy Book
HomeScreen includes a dummy book (ID 1, price: 1 USDC) for testing purchase flow.

### Console Logging
The app uses console.log extensively. Check browser console for:
- Transaction hashes
- Contract call results
- Error details
- User authentication state

### Blockchain Explorer
Verify transactions on Base Sepolia:
- https://sepolia.basescan.org
- https://base-sepolia.blockscout.com

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [status, setStatus] = useState("");

try {
  setLoading(true);
  setStatus("Processing...");
  // ... perform operation
  setStatus("Success!");
} catch (error) {
  setStatus(`Error: ${error.message}`);
} finally {
  setLoading(false);
}
```

### Currency Conversion
```typescript
import { ETH_PRICE } from './core/constants';

// USDC to USD (1:1 stablecoin)
const usdValue = usdcUnitsToReadable(priceEth);

// ETH to USD (if needed for display)
const ethToUSD = ethAmount * ETH_PRICE;
```

### Expiry Time Display
Library borrows show countdown timers:
```typescript
// Calculate time remaining
const now = Math.floor(Date.now() / 1000);
const timeLeft = expiryTimestamp - now;

// Format as "2d 5h left" or "3h 45m left"
if (timeLeft > 86400) {
  return `${Math.floor(timeLeft / 86400)}d ${Math.floor((timeLeft % 86400) / 3600)}h left`;
} else if (timeLeft > 3600) {
  return `${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m left`;
} else {
  return `${Math.floor(timeLeft / 60)}m left`;
}
```

## Code Style

- TypeScript strict mode enabled
- React 19 with functional components only
- Tailwind CSS for all styling (v4 syntax)
- Arrow functions preferred
- ESLint configured (run with `npm run lint`)
