# Solution: onlyOwner Modifier Issue

## Problem

Fungsi `createItem` di smart contract memiliki modifier `onlyOwner`, yang menyebabkan:
- ❌ User biasa tidak bisa publish book
- ❌ Transaction reverted dengan "Execution reverted for an unknown reason"
- ❌ Hanya contract owner yang bisa create items

## Root Cause

```solidity
function createItem(...) external onlyOwner {
    // Function body
}
```

Modifier `onlyOwner` membatasi akses hanya untuk contract owner address.

## Solutions

### Solution 1: Remove onlyOwner Modifier (RECOMMENDED)

Deploy smart contract baru dengan perubahan:

```solidity
// BEFORE (Current - BROKEN)
function createItem(
    uint256 id,
    uint256 price,
    address payable recipient,
    address royaltyRecipient,
    uint96 royaltyBps,
    string memory metadataUri
) external onlyOwner {  // ❌ PROBLEM
    // ...
}

// AFTER (Fixed)
function createItem(
    uint256 id,
    uint256 price,
    address payable recipient,
    address royaltyRecipient,
    uint96 royaltyBps,
    string memory metadataUri
) external {  // ✅ SOLUTION - Remove onlyOwner
    require(msg.sender == recipient, "must be recipient");  // Optional: Add this validation
    // ...
}
```

**Advantages:**
- ✅ User dapat langsung publish book
- ✅ Fully decentralized
- ✅ No backend dependency
- ✅ Gas efficient

**Steps:**
1. Update smart contract code
2. Deploy new contract ke Base Sepolia
3. Update `contractAddress` di `src/smart-contract.abi.ts`
4. Test publish functionality

---

### Solution 2: Backend Relay Service

Buat backend API yang menerima request dari user dan relay ke smart contract sebagai owner.

#### Architecture:

```
User → Frontend → Backend API → Smart Contract
                      ↓
                  Owner Wallet
```

#### Backend Implementation (Node.js + Express):

```typescript
// server.js
import express from 'express';
import { ethers } from 'ethers';

const app = express();
app.use(express.json());

// Owner wallet (KEEP SECRET!)
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

const contractAddress = "0xC12F333f41D7cedB209F24b303287531Bb05Bc67";
const contract = new ethers.Contract(contractAddress, contractABI, ownerWallet);

app.post('/api/publish-book', async (req, res) => {
  try {
    const { id, price, recipient, royaltyRecipient, royaltyBps, metadataUri } = req.body;

    // Validate inputs
    if (!recipient || !royaltyRecipient || !metadataUri) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call smart contract as owner
    const tx = await contract.createItem(
      id,
      price,
      recipient,
      royaltyRecipient,
      royaltyBps,
      metadataUri
    );

    await tx.wait();

    res.json({
      success: true,
      transactionHash: tx.hash
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

#### Frontend Update:

```typescript
// CreateBookV2Screen.tsx

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  // ... existing code for IPFS upload ...

  // Instead of calling smart contract directly
  setLoadingMessage("Creating book on blockchain...");

  // Call backend API
  const response = await axios.post('http://localhost:3000/api/publish-book', {
    id: id,
    price: priceInUSDC,
    recipient: client.account.address,
    royaltyRecipient: client.account.address,
    royaltyBps: royaltyPercent,
    metadataUri: metadataUri,
  });

  if (!response.data.success) {
    throw new Error('Failed to create book on blockchain');
  }

  const tx = response.data.transactionHash;

  // ... continue with database save ...
};
```

**Advantages:**
- ✅ No smart contract changes needed
- ✅ Can add additional validation/logic
- ✅ Can implement rate limiting
- ✅ Can add authentication

**Disadvantages:**
- ❌ Centralized (requires trusted backend)
- ❌ Backend must hold owner private key (security risk)
- ❌ Additional infrastructure cost
- ❌ Single point of failure

---

### Solution 3: Multi-Sig / Role-Based Access

Update contract dengan role-based permissions:

```solidity
// Add to contract
mapping(address => bool) public publishers;

modifier onlyPublisher() {
    require(publishers[msg.sender] || owner() == msg.sender, "not publisher");
    _;
}

function addPublisher(address publisher) external onlyOwner {
    publishers[publisher] = true;
}

function createItem(...) external onlyPublisher {
    // Function body
}
```

**Advantages:**
- ✅ Controlled access
- ✅ Can whitelist trusted publishers
- ✅ Still decentralized

**Disadvantages:**
- ❌ Requires contract update
- ❌ Users must be whitelisted first
- ❌ Extra transaction for whitelisting

---

## Recommendation

**Use Solution 1** (Remove onlyOwner) because:

1. ✅ **Truly Decentralized**: Anyone can publish books
2. ✅ **Better UX**: No approval/whitelist process needed
3. ✅ **No Backend**: Fully client-side
4. ✅ **Secure**: Built-in validation checks remain (recipient, price, royalty)

The existing validations in the contract are sufficient:
```solidity
require(recipient != address(0), "bad recipient");
require(royaltyRecipient != address(0), "bad royalty recipient");
require(royaltyBps <= 1000, "royalty too high");
require(price > 0, "price=0");
```

## Implementation Steps

1. **Update Smart Contract**
   ```solidity
   function createItem(...) external {  // Remove onlyOwner
       // Add optional validation
       require(msg.sender == recipient, "sender must be recipient");
       // ... rest of function
   }
   ```

2. **Deploy New Contract**
   ```bash
   # Using Hardhat/Foundry
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

3. **Update Frontend Config**
   ```typescript
   // src/smart-contract.abi.ts
   export const contractAddress = "0x<NEW_CONTRACT_ADDRESS>";
   ```

4. **Test Publishing**
   - Try publishing a test book
   - Verify transaction succeeds
   - Check book appears in marketplace

## Temporary Workaround

Jika tidak bisa deploy contract baru segera, gunakan owner wallet untuk test:

1. Import owner wallet private key ke Privy/wallet
2. Use owner account untuk test publish
3. Plan untuk deploy fixed contract ASAP

## Security Considerations

Dengan menghilangkan `onlyOwner`:
- ✅ Anyone dapat create items (sesuai marketplace model)
- ✅ Creator tetap perlu provide valid recipient address
- ✅ Royalty dibatasi max 10%
- ✅ Price harus > 0
- ⚠️ Bisa ada spam items (mitigasi: minimum price, platform fee)

## Questions?

Jika ada pertanyaan atau butuh bantuan deploy contract baru, silakan tanya!
