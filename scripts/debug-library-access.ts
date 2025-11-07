/**
 * Debug Script: Library Access Verification
 *
 * Purpose: Test library borrowing verification to diagnose why user can't access borrowed books
 *
 * Usage:
 *   1. Update USER_ADDRESS and BOOK_ID below
 *   2. Run: npx tsx scripts/debug-library-access.ts
 */

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { libraryPoolABI, libraryPoolAddress } from '../src/library-pool.abi';
import { contractABI, contractAddress } from '../src/smart-contract.abi';

// ===== CONFIGURATION =====
// Try different addresses - Privy might use smart wallet instead of EOA
const POSSIBLE_ADDRESSES = [
  '0x6BEc334AfeA71D59077ed138910FD299bdC51E1A', // EOA address from Blockscout
  // Add more addresses here if you find them in browser console
];

const USER_ADDRESS = POSSIBLE_ADDRESSES[0]; // We'll test all of them
const BOOK_ID = 1761747515; // Update with book ID you're trying to access

// ===== SETUP =====
console.log('🔍 Library Access Debug Tool');
console.log('='.repeat(80));
console.log('Configuration:');
console.log('  User Address:', USER_ADDRESS);
console.log('  Book ID:', BOOK_ID);
console.log('  Library Pool:', libraryPoolAddress);
console.log('  Marketplace:', contractAddress);
console.log('='.repeat(80));

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// ===== TEST FUNCTIONS =====

async function testNFTOwnership() {
  console.log('\n📖 TEST 1: NFT Ownership (Purchase)');
  console.log('-'.repeat(80));

  try {
    const balance = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: contractABI,
      functionName: 'balanceOf',
      args: [USER_ADDRESS as `0x${string}`, BigInt(BOOK_ID)],
    });

    console.log('✅ Query successful');
    console.log('   Balance:', balance.toString());
    console.log('   Owns NFT:', balance > 0n ? 'YES ✅' : 'NO ❌');
    return balance > 0n;
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    return false;
  }
}

async function testLibraryBorrow() {
  console.log('\n📚 TEST 2: Library Borrowing (ERC-5006)');
  console.log('-'.repeat(80));

  try {
    const usableBalance = await publicClient.readContract({
      address: libraryPoolAddress as `0x${string}`,
      abi: libraryPoolABI,
      functionName: 'usableBalanceOf',
      args: [USER_ADDRESS as `0x${string}`, BigInt(BOOK_ID)],
    });

    console.log('✅ Query successful');
    console.log('   Usable Balance:', usableBalance.toString());
    console.log('   Has Borrow:', usableBalance > 0n ? 'YES ✅' : 'NO ❌');
    console.log('   Type:', typeof usableBalance);

    if (usableBalance === 0n) {
      console.log('\n⚠️  Usable balance is 0. Possible reasons:');
      console.log('   1. No active borrow record exists');
      console.log('   2. Borrow has expired');
      console.log('   3. Record was returned/deleted');
      console.log('   4. Wrong user address being checked');
    }

    return usableBalance > 0n;
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    console.error('   Full error:', error);
    return false;
  }
}

async function testActiveRecordOf() {
  console.log('\n🔍 TEST 3: Active Record Lookup');
  console.log('-'.repeat(80));

  try {
    const recordId = await publicClient.readContract({
      address: libraryPoolAddress as `0x${string}`,
      abi: libraryPoolABI,
      functionName: 'activeRecordOf',
      args: [USER_ADDRESS as `0x${string}`, BigInt(BOOK_ID)],
    });

    console.log('✅ Query successful');
    console.log('   Record ID:', recordId.toString());

    if (recordId > 0n) {
      console.log('   ✅ Found active record!');

      // Fetch record details
      console.log('\n   Fetching record details...');
      const record = await publicClient.readContract({
        address: libraryPoolAddress as `0x${string}`,
        abi: libraryPoolABI,
        functionName: 'userRecordOf',
        args: [recordId],
      });

      const tokenId = record[0];
      const owner = record[1];
      const user = record[2];
      const amount = record[3];
      const expiry = record[4];

      const expiryDate = new Date(Number(expiry) * 1000);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = Number(expiry) <= now;

      console.log('   Record Details:');
      console.log('     - Token ID:', tokenId.toString());
      console.log('     - Owner:', owner);
      console.log('     - User:', user);
      console.log('     - Amount:', amount.toString());
      console.log('     - Expiry:', expiry.toString());
      console.log('     - Expiry Date:', expiryDate.toLocaleString());
      console.log('     - Is Expired:', isExpired ? 'YES ❌' : 'NO ✅');

      if (isExpired) {
        console.log('\n   ⚠️  Record exists but has EXPIRED!');
        console.log('      Time since expiry:', Math.floor((now - Number(expiry)) / 60), 'minutes');
      }

      return !isExpired;
    } else {
      console.log('   ❌ No active record found');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    return false;
  }
}

async function testGetActiveBorrows() {
  console.log('\n📋 TEST 4: All Active Borrows');
  console.log('-'.repeat(80));

  try {
    const borrows = await publicClient.readContract({
      address: libraryPoolAddress as `0x${string}`,
      abi: libraryPoolABI,
      functionName: 'getActiveBorrows',
      args: [USER_ADDRESS as `0x${string}`],
    });

    console.log('✅ Query successful');
    console.log('   Total Active Borrows:', borrows.length);

    if (borrows.length === 0) {
      console.log('   ❌ No active borrows found for this user');
      return false;
    }

    borrows.forEach((borrow: any, index: number) => {
      const recordId = borrow.recordId;
      const tokenId = borrow.tokenId;
      const expiry = borrow.expiry;
      const expiryDate = new Date(Number(expiry) * 1000);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = Number(expiry) <= now;
      const isThisBook = Number(tokenId) === BOOK_ID;

      console.log(`\n   Borrow #${index + 1}:`, isThisBook ? '⭐ THIS BOOK' : '');
      console.log('     - Record ID:', recordId.toString());
      console.log('     - Token ID:', tokenId.toString());
      console.log('     - Expiry:', expiryDate.toLocaleString());
      console.log('     - Is Expired:', isExpired ? 'YES ❌' : 'NO ✅');

      if (isThisBook && isExpired) {
        console.log('     ⚠️  This is your book but borrow has EXPIRED!');
      }
    });

    // Check if this specific book is in active borrows
    const thisBookBorrow = borrows.find((b: any) => Number(b.tokenId) === BOOK_ID);
    if (thisBookBorrow) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = Number(thisBookBorrow.expiry) <= now;
      console.log('\n   ✅ Found borrow for book #' + BOOK_ID);
      console.log('   Status:', isExpired ? 'EXPIRED ❌' : 'ACTIVE ✅');
      return !isExpired;
    } else {
      console.log('\n   ❌ Book #' + BOOK_ID + ' not found in active borrows');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    return false;
  }
}

async function testGetBorrowOf() {
  console.log('\n🎯 TEST 5: Direct Borrow Lookup');
  console.log('-'.repeat(80));

  try {
    const borrowInfo = await publicClient.readContract({
      address: libraryPoolAddress as `0x${string}`,
      abi: libraryPoolABI,
      functionName: 'getBorrowOf',
      args: [USER_ADDRESS as `0x${string}`, BigInt(BOOK_ID)],
    });

    const recordId = borrowInfo[0];
    const expiry = borrowInfo[1];
    const active = borrowInfo[2];

    const expiryDate = new Date(Number(expiry) * 1000);
    const now = Math.floor(Date.now() / 1000);
    const isExpired = Number(expiry) <= now;

    console.log('✅ Query successful');
    console.log('   Record ID:', recordId.toString());
    console.log('   Expiry:', expiry.toString());
    console.log('   Expiry Date:', expiryDate.toLocaleString());
    console.log('   Is Active:', active ? 'YES' : 'NO');
    console.log('   Is Expired:', isExpired ? 'YES ❌' : 'NO ✅');

    if (recordId === 0n) {
      console.log('\n   ❌ No borrow record found (recordId = 0)');
      return false;
    }

    if (!active) {
      console.log('\n   ❌ Borrow exists but is NOT active');
      return false;
    }

    if (isExpired) {
      console.log('\n   ⚠️  Borrow is active but has EXPIRED');
      console.log('      Time since expiry:', Math.floor((now - Number(expiry)) / 60), 'minutes');
      return false;
    }

    console.log('\n   ✅ Valid active borrow found!');
    return true;
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    return false;
  }
}

// ===== RUN ALL TESTS =====

async function runAllTests() {
  console.log('\n\n🚀 Running all diagnostic tests...\n');

  const results = {
    nftOwnership: await testNFTOwnership(),
    libraryBorrow: await testLibraryBorrow(),
    activeRecord: await testActiveRecordOf(),
    activeBorrows: await testGetActiveBorrows(),
    borrowOf: await testGetBorrowOf(),
  };

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log('NFT Ownership (Purchase):', results.nftOwnership ? '✅ PASS' : '❌ FAIL');
  console.log('Library Borrow (usableBalanceOf):', results.libraryBorrow ? '✅ PASS' : '❌ FAIL');
  console.log('Active Record Lookup:', results.activeRecord ? '✅ PASS' : '❌ FAIL');
  console.log('Get Active Borrows:', results.activeBorrows ? '✅ PASS' : '❌ FAIL');
  console.log('Get Borrow Of:', results.borrowOf ? '✅ PASS' : '❌ FAIL');

  const hasAccess = results.nftOwnership || results.libraryBorrow;
  console.log('\n' + '='.repeat(80));
  console.log('🎯 FINAL VERDICT:', hasAccess ? '✅ USER HAS ACCESS' : '❌ USER HAS NO ACCESS');
  console.log('='.repeat(80));

  if (!hasAccess) {
    console.log('\n❓ WHY USER HAS NO ACCESS:');
    if (!results.nftOwnership) {
      console.log('  ❌ User does not own this book NFT');
    }
    if (!results.libraryBorrow) {
      console.log('  ❌ User does not have active borrow');
    }
    if (!results.activeRecord && !results.activeBorrows && !results.borrowOf) {
      console.log('\n💡 DIAGNOSIS: No borrow record found in any query');
      console.log('   Possible causes:');
      console.log('   1. Borrow was never created (transaction failed?)');
      console.log('   2. Borrow was returned already');
      console.log('   3. Wrong user address being checked');
      console.log('   4. Wrong book ID');
      console.log('\n   📝 NEXT STEPS:');
      console.log('   - Verify transaction hash of borrow transaction');
      console.log('   - Check if CreateUserRecord event was emitted');
      console.log('   - Confirm user address matches wallet address in app');
    } else if (results.activeRecord || results.activeBorrows || results.borrowOf) {
      console.log('\n💡 DIAGNOSIS: Borrow record exists but expired or inactive');
      console.log('   📝 NEXT STEPS:');
      console.log('   - Check expiry timestamp in record details above');
      console.log('   - User needs to borrow book again');
    }
  }

  console.log('\n');
}

// Run
runAllTests().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
