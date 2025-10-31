# Libere Admin - Publish Book Tool

Simple admin UI untuk publish book ke blockchain dan database Supabase.

## ⚠️ Security Warning

**Proyek ini menggunakan private key hardcoded untuk owner contract.**
- **Hanya untuk local development**
- **JANGAN deploy ke production**
- **JANGAN commit private key ke git**

---

## Prerequisites

- Node.js v18+
- npm atau yarn
- Owner private key (untuk contract `0xC12F333f41D7cedB209F24b303287531Bb05Bc67`)
- Pinata API credentials
- Supabase credentials

---

## Setup

### 1. Install Dependencies

```bash
cd admin-publish
npm install
```

### 2. Configure Environment Variables

Edit file `.env`:

```env
# OWNER PRIVATE KEY (DO NOT COMMIT!)
VITE_OWNER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# PINATA (already configured)
VITE_PINATA_API_KEY=c29de4e0fcf6380edb88
VITE_PINATA_SECRET_API_KEY=c5b2f6a9a13fec5e3e0335b384829afd8e238d1b6f933dac800290d7ed48057a

# SUPABASE (already configured)
VITE_SUPABASE_URL=https://mbgbxpmgjrtmjibygpdc.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SMART CONTRACT (already configured)
VITE_CONTRACT_ADDRESS=0xC12F333f41D7cedB209F24b303287531Bb05Bc67

# RPC (already configured)
VITE_RPC_URL=https://sepolia.base.org
```

**Important**: Replace `VITE_OWNER_PRIVATE_KEY` with your actual private key!

### 3. Run Development Server

```bash
npm run dev
```

Open browser di: `http://localhost:5173`

---

## Usage

### Publishing a Book

1. **Fill Form**:
   - Title (required)
   - Author (required)
   - Publisher (optional)
   - Description (optional)
   - Price in USDC (required, e.g., `10.00`)
   - Royalty percentage (required, 0-10%, e.g., `5.0`)

2. **Upload Files**:
   - Cover Image (PNG/JPG, required)
   - EPUB File (required)

3. **Click "Publish Book"**

4. **Wait for Process**:
   - ✅ Upload cover to IPFS
   - ✅ Upload EPUB to IPFS
   - ✅ Create transaction on blockchain
   - ✅ Wait for confirmation
   - ✅ Save metadata to Supabase

5. **Success!**
   - Book ID dan transaction hash akan ditampilkan
   - Form akan reset otomatis setelah 3 detik

---

## How It Works

### 1. **IPFS Upload** (via Pinata)
- Cover image di-upload ke IPFS
- EPUB file di-upload ke IPFS
- Returns URL: `https://gateway.pinata.cloud/ipfs/{hash}`

### 2. **Blockchain Transaction**
- Generate book ID dari Unix timestamp
- Convert price ke smallest unit (6 decimals untuk USDC)
- Convert royalty ke basis points (5% = 500)
- Call contract function `createItem()`:
  ```solidity
  createItem(
    uint256 id,
    uint256 price,
    address payable recipient,
    address royaltyRecipient,
    uint96 royaltyBps,
    string metadataUri
  )
  ```
- Menunggu transaction confirmation

### 3. **Database Save** (Supabase)
- Save metadata ke table `Book`:
  - id, title, author, publisher, description
  - metadataUri (cover image URL)
  - epub (EPUB file URL)
  - priceEth (USDC price dengan 6 decimals)
  - royalty (basis points)
  - addressReciepent, addressRoyaltyRecipient

---

## Troubleshooting

### Error: "Private key not configured"
**Solution**: Set `VITE_OWNER_PRIVATE_KEY` in `.env` file

### Error: "Failed to upload to IPFS"
**Solution**: Check Pinata API credentials in `.env`

### Error: "Transaction reverted"
**Solution**:
- Ensure you're using the correct owner private key
- Check if you have enough ETH for gas
- Verify contract address is correct

### Error: "Failed to save to Supabase"
**Solution**:
- Check Supabase URL and API key
- Verify table `Book` exists (run `supabase-setup.sql`)
- Check RLS policies allow INSERT

---

## Tech Stack

- **Vite** - Build tool & dev server
- **Viem** - Ethereum library untuk contract interaction
- **Axios** - HTTP client untuk IPFS & Supabase API
- **Dayjs** - Date library untuk generate book ID
- **Vanilla JS** - No framework untuk simplicity

---

## File Structure

```
admin-publish/
├── index.html          # Main HTML file
├── style.css           # Styling
├── main.js             # Main logic (publish book)
├── contract-abi.ts     # Smart contract ABI
├── package.json        # Dependencies
├── .env                # Environment variables (DO NOT COMMIT!)
├── .gitignore          # Git ignore file
└── README.md           # This file
```

---

## Security Best Practices

### ✅ Do's
- Use `.env` file for private key (already in `.gitignore`)
- Only run locally, never deploy to public server
- Keep private key secret
- Use separate wallet for testing

### ❌ Don'ts
- Never commit `.env` file to git
- Never share private key publicly
- Never deploy this to production
- Never use main wallet with large funds

---

## Network Info

- **Chain**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Contract**: `0xC12F333f41D7cedB209F24b303287531Bb05Bc67`

---

## Support

Untuk pertanyaan atau issues:
1. Check console browser untuk error details
2. Verify semua credentials di `.env`
3. Check blockchain explorer untuk transaction status

---

## License

Private - Internal Use Only
