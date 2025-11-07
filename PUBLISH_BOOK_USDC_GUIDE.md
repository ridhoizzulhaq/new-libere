---
noteId: "79566120b7f511f08d56a990e7f97797"
tags: []

---

# Publish Book dengan USDC - Implementation Guide

## Overview
Menu Publish Book telah diubah untuk menggunakan USDC sebagai mata uang pricing, menggantikan sistem ETH sebelumnya.

## Perubahan Utama

### 1. Files yang Dibuat/Dimodifikasi

#### File Baru:
- **`src/usdc-token.ts`**
  - USDC token address di Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
  - USDC decimals constant: 6
  - ERC20 ABI untuk token operations

#### File yang Dimodifikasi:
- **Book Publishing** (now handled by `admin-publish/` tool)
  - Menghilangkan dependency ke ETH_PRICE
  - Update pricing logic dari ETH (18 decimals) ke USDC (6 decimals)
  - Update UI labels dari "USD" ke "USDC"

## Implementasi Detail

### Konversi Harga USDC

```typescript
// USDC memiliki 6 decimals
const USDC_DECIMALS = 6;

// Contoh: User memasukkan 10 USDC
const userInput = 10; // USDC

// Convert ke USDC units (smallest unit)
const priceInUSDC = Math.floor(userInput * Math.pow(10, USDC_DECIMALS));
// Result: 10000000 (10 * 10^6)
```

### Smart Contract Integration

Fungsi `createItem` dipanggil dengan parameter:

```solidity
function createItem(
    uint256 id,              // Unix timestamp
    uint256 price,           // Price dalam USDC units (dengan 6 decimals)
    address payable recipient,
    address royaltyRecipient,
    uint96 royaltyBps,       // Royalty dalam basis points (100 = 1%)
    string memory metadataUri
)
```

### Transaction Flow

1. **Upload Cover ke IPFS**
   - File cover image diupload ke Pinata
   - Mendapatkan IPFS hash untuk metadata URI

2. **Upload EPUB ke IPFS**
   - File EPUB diupload ke Pinata
   - Mendapatkan IPFS hash untuk epub data

3. **Prepare Transaction Data**
   ```typescript
   const id = dayjs().unix(); // Current Unix timestamp
   const priceInUSDC = Math.floor(Number(formData.price) * Math.pow(10, 6));
   const royaltyPercent = Number(formData.royaltyValue) * 100;
   ```

4. **Send Blockchain Transaction**
   ```typescript
   client.sendTransaction({
     chain: baseSepolia,
     to: contractAddress,
     data: encodeFunctionData({
       abi: contractABI,
       functionName: "createItem",
       args: [
         BigInt(id),
         BigInt(priceInUSDC),
         addressRecipient,
         addressRoyaltyRecipient,
         royaltyPercent,
         metadataUri,
       ],
     }),
   });
   ```

5. **Save to Database**
   - Metadata book disimpan ke Supabase
   - Price disimpan sebagai USDC units (integer)

## Form UI Changes

### Sebelum:
```
Label: "Price (USD)"
Placeholder: "Enter book price in USD"
Helper: "≈ 0.0022 ETH ($Current ETH price: 4538.00)"
```

### Sesudah:
```
Label: "Price (USDC)"
Placeholder: "Enter book price in USDC"
Helper: "= 10,000,000 USDC units"
```

## Validasi

Form melakukan validasi:
1. ✅ Wallet connected
2. ✅ Cover image dan EPUB uploaded
3. ✅ Royalty antara 0-10%
4. ✅ Price > 0
5. ✅ All required fields filled

## Error Handling

Implementasi mencakup error handling untuk:
- Wallet tidak terkoneksi
- File upload gagal
- IPFS upload error
- Transaction rejection
- Database save failure

Semua error ditampilkan dengan UI yang jelas di form.

## Loading States

Progress messages yang ditampilkan:
1. "Uploading cover image to IPFS..."
2. "Uploading EPUB file to IPFS..."
3. "Creating book on blockchain..."
4. "Saving book metadata..."
5. "Book published successfully!"

## Contoh Penggunaan

### Scenario: Publisher ingin publish buku seharga 5 USDC

1. **Input Form:**
   - Title: "The Great Gatsby"
   - Author: "F. Scott Fitzgerald"
   - Publisher: "Scribner"
   - Description: "A novel about the American Dream"
   - Cover Image: upload gatsby-cover.jpg
   - EPUB File: upload gatsby.epub
   - **Price: 5** (USDC)
   - Royalty: 5 (%)

2. **Conversion:**
   - Price input: 5 USDC
   - Converted: 5 × 10^6 = 5,000,000 USDC units
   - Royalty: 5% × 100 = 500 basis points

3. **Smart Contract:**
   ```typescript
   createItem(
     id: 1704067200,           // timestamp
     price: 5000000,           // 5 USDC in units
     recipient: "0x...",       // Publisher address
     royaltyRecipient: "0x...",
     royaltyBps: 500,          // 5%
     metadataUri: "ipfs://..."
   )
   ```

4. **Database:**
   ```json
   {
     "id": 1704067200,
     "title": "The Great Gatsby",
     "priceEth": "5000000",  // Stored as USDC units
     "royalty": 500,
     ...
   }
   ```

## Important Notes

⚠️ **Breaking Changes:**
- Field `priceEth` sekarang menyimpan USDC units (6 decimals), bukan ETH wei (18 decimals)
- Semua buku yang ada di database dengan harga dalam ETH perlu di-migrate
- Frontend yang menampilkan harga perlu diupdate untuk konversi USDC

🔐 **Smart Contract Requirements:**
- Contract owner harus call `setPaymentToken(usdcAddress)` untuk enable USDC payments
- USDC address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

💡 **Best Practices:**
- Selalu validate price > 0
- Pastikan USDC decimals (6) digunakan dengan benar
- Handle BigInt conversion untuk blockchain
- Provide clear feedback untuk user

## Testing Checklist

- [ ] Form validation bekerja dengan benar
- [ ] Image preview muncul setelah upload
- [ ] USDC price conversion akurat
- [ ] Blockchain transaction berhasil
- [ ] Data tersimpan di database dengan benar
- [ ] Loading states ditampilkan
- [ ] Error handling bekerja
- [ ] Success message dan redirect ke /books

## Migration Notes

Jika ada existing books dengan ETH pricing, perlu migration:

```typescript
// Old format (ETH wei - 18 decimals)
priceEth: "2200000000000000" // 0.0022 ETH

// New format (USDC units - 6 decimals)
priceEth: "10000000" // 10 USDC

// Conversion function needed:
function convertEthToUSDC(ethWei: string, ethPrice: number): string {
  const ethAmount = Number(ethWei) / 1e18; // Convert wei to ETH
  const usdAmount = ethAmount * ethPrice;  // Convert to USD
  const usdcUnits = Math.floor(usdAmount * 1e6); // Convert to USDC units
  return usdcUnits.toString();
}
```

## Future Enhancements

Potensial improvements:
- Dynamic USDC balance check sebelum publish
- Preview harga dalam berbagai currencies
- Batch publishing multiple books
- Draft save functionality
- Price history tracking
- USDC approval flow (jika diperlukan untuk fees)
