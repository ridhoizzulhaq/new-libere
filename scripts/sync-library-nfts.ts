/**
 * Sync Library NFTs from Blockscout to Supabase
 *
 * This script fetches all ERC-1155 NFTs held by library pool contracts
 * from the Blockscout API and syncs them to the library_books table.
 *
 * New books are added as invisible (is_visible = false) by default.
 * Admin must manually set is_visible = true to show them in the library UI.
 *
 * Usage:
 *   npm run sync:libraries           # Sync all libraries
 *   tsx scripts/sync-library-nfts.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env') });

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_API_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Library {
  id: number;
  name: string;
  address: string;
  description?: string;
}

interface BlockscoutNFTItem {
  id: string;
  token: {
    address: string;
    type: string;
  };
  value: string;
}

interface BlockscoutResponse {
  items: BlockscoutNFTItem[];
  next_page_params?: any;
}

interface SyncResult {
  libraryId: number;
  libraryName: string;
  totalNFTs: number;
  newBooks: number;
  existingBooks: number;
  errors: string[];
}

const BLOCKSCOUT_BASE_URL = 'https://base-sepolia.blockscout.com/api/v2';
const REQUEST_DELAY = 1000; // 1 second delay between API calls to respect rate limits

/**
 * Fetch all NFTs owned by a library pool contract from Blockscout API
 */
async function fetchLibraryNFTs(libraryAddress: string): Promise<string[]> {
  try {
    const url = `${BLOCKSCOUT_BASE_URL}/addresses/${libraryAddress}/nft?type=ERC-1155`;

    console.log(`  📡 Fetching NFTs from Blockscout: ${libraryAddress}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status} ${response.statusText}`);
    }

    const data: BlockscoutResponse = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('  ⚠️  No NFT items found in response');
      return [];
    }

    // Extract unique book IDs from NFT items
    const bookIds = data.items
      .map(item => item.id)
      .filter((id): id is string => id !== null && id !== undefined);

    console.log(`  ✅ Found ${bookIds.length} NFTs`);

    return bookIds;

  } catch (error) {
    console.error(`  ❌ Error fetching NFTs:`, error);
    throw error;
  }
}

/**
 * Get existing book IDs from library_books table
 */
async function getExistingLibraryBooks(libraryId: number): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('library_books')
    .select('book_id')
    .eq('library_id', libraryId);

  if (error) {
    throw new Error(`Failed to fetch existing library books: ${error.message}`);
  }

  return new Set((data || []).map(row => String(row.book_id)));
}

/**
 * Sync NFTs for a single library
 */
async function syncLibraryNFTs(library: Library): Promise<SyncResult> {
  const result: SyncResult = {
    libraryId: library.id,
    libraryName: library.name,
    totalNFTs: 0,
    newBooks: 0,
    existingBooks: 0,
    errors: [],
  };

  console.log(`\n📚 Syncing library: ${library.name} (ID: ${library.id})`);
  console.log(`   Contract: ${library.address}`);

  try {
    // 1. Fetch NFTs from Blockscout
    const nftIds = await fetchLibraryNFTs(library.address);
    result.totalNFTs = nftIds.length;

    if (nftIds.length === 0) {
      console.log(`  ℹ️  No NFTs found for this library`);
      return result;
    }

    // 2. Get existing books in library_books table
    const existingBooks = await getExistingLibraryBooks(library.id);
    console.log(`  📋 Existing books in database: ${existingBooks.size}`);

    // 3. Determine new books to add
    const newBookIds = nftIds.filter(id => !existingBooks.has(id));
    result.newBooks = newBookIds.length;
    result.existingBooks = existingBooks.size;

    console.log(`  🆕 New books to add: ${newBookIds.length}`);

    if (newBookIds.length === 0) {
      console.log(`  ✓ No new books to sync`);
      return result;
    }

    // 4. Insert new books as invisible (is_visible = false)
    const insertData = newBookIds.map(bookId => ({
      library_id: library.id,
      book_id: parseInt(bookId, 10),
      is_visible: false, // Default: hidden until manually enabled
      last_synced: new Date().toISOString(),
    }));

    console.log(`  💾 Inserting ${insertData.length} new books...`);

    const { error: insertError } = await supabase
      .from('library_books')
      .upsert(insertData, {
        onConflict: 'library_id,book_id',
        ignoreDuplicates: false,
      });

    if (insertError) {
      const errorMsg = `Failed to insert books: ${insertError.message}`;
      result.errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
      return result;
    }

    console.log(`  ✅ Successfully synced ${newBookIds.length} new books`);
    console.log(`  ⚠️  Note: New books are set as INVISIBLE by default`);

    // 5. Update last_synced timestamp for all existing books
    const { error: updateError } = await supabase
      .from('library_books')
      .update({ last_synced: new Date().toISOString() })
      .eq('library_id', library.id)
      .in('book_id', nftIds.map(id => parseInt(id, 10)));

    if (updateError) {
      console.warn(`  ⚠️  Warning: Failed to update last_synced: ${updateError.message}`);
    }

    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    console.error(`  ❌ Error syncing library:`, error);
    return result;
  }
}

/**
 * Sync all libraries
 */
async function syncAllLibraries() {
  console.log('🚀 Starting library NFT sync...\n');

  try {
    // Fetch all libraries from database
    const { data: libraries, error } = await supabase
      .from('libraries')
      .select('id, name, address, description')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch libraries: ${error.message}`);
    }

    if (!libraries || libraries.length === 0) {
      console.log('⚠️  No libraries found in database');
      return;
    }

    console.log(`📖 Found ${libraries.length} library(ies) to sync\n`);

    const results: SyncResult[] = [];

    // Sync each library with delay between requests
    for (let i = 0; i < libraries.length; i++) {
      const library = libraries[i];
      const result = await syncLibraryNFTs(library);
      results.push(result);

      // Add delay between library syncs to respect API rate limits
      if (i < libraries.length - 1) {
        console.log(`  ⏳ Waiting ${REQUEST_DELAY}ms before next library...`);
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));

    let totalNew = 0;
    let totalErrors = 0;

    results.forEach(result => {
      console.log(`\n${result.libraryName} (ID: ${result.libraryId})`);
      console.log(`  Total NFTs: ${result.totalNFTs}`);
      console.log(`  New books added: ${result.newBooks}`);
      console.log(`  Existing books: ${result.existingBooks}`);

      if (result.errors.length > 0) {
        console.log(`  ❌ Errors: ${result.errors.length}`);
        result.errors.forEach(err => console.log(`     - ${err}`));
      } else {
        console.log(`  ✅ No errors`);
      }

      totalNew += result.newBooks;
      totalErrors += result.errors.length;
    });

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Sync completed!`);
    console.log(`   Total new books added: ${totalNew}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log('='.repeat(60));

    if (totalNew > 0) {
      console.log('\n⚠️  IMPORTANT: New books are set as INVISIBLE by default.');
      console.log('   Go to admin panel to set is_visible = true for books you want to show.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run sync if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllLibraries()
    .then(() => {
      console.log('\n✓ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed:', error);
      process.exit(1);
    });
}

// Export functions for use in frontend
export {
  syncAllLibraries,
  syncLibraryNFTs,
  fetchLibraryNFTs,
};
