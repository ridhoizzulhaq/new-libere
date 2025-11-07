/**
 * Quick Migration Script - Plain Node.js (ESM)
 * Run with: node scripts/quick-migrate.mjs
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY;
const EPUB_BUCKET = 'libere-books';

console.log('🚀 Quick Migration Script\n');
console.log('Environment check:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
console.log('  VITE_SUPABASE_API_KEY:', supabaseKey ? '✅' : '❌');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
const isIpfsUrl = (url) => url.includes('ipfs') || url.includes('pinata.cloud');
const isSupabaseUrl = (url) => url.includes('.supabase.co/storage/');

async function migrateBook(bookId) {
  console.log(`\n📖 Migrating Book ID: ${bookId}`);

  try {
    // 1. Fetch book
    const { data: book, error: fetchError } = await supabase
      .from('Book')
      .select('*')
      .eq('id', bookId)
      .single();

    if (fetchError || !book) {
      throw new Error(`Book not found: ${fetchError?.message}`);
    }

    console.log(`   Title: ${book.title}`);
    console.log(`   Current EPUB URL: ${book.epub.substring(0, 60)}...`);

    // 2. Check if already migrated
    if (isSupabaseUrl(book.epub)) {
      console.log(`   ✅ Already migrated to Supabase Storage`);
      return true;
    }

    // 3. Check if from IPFS
    if (!isIpfsUrl(book.epub)) {
      console.log(`   ⚠️  URL is not from IPFS, skipping...`);
      return false;
    }

    // 4. Download from IPFS
    console.log(`   📥 Downloading from IPFS...`);
    const response = await axios.get(book.epub, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    const epubBuffer = Buffer.from(response.data);
    const sizeMB = (epubBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Downloaded ${sizeMB} MB`);

    // 5. Upload to Supabase
    console.log(`   📤 Uploading to Supabase Storage...`);
    const filePath = `${bookId}/book.epub`;

    // Remove old file if exists
    await supabase.storage
      .from(EPUB_BUCKET)
      .remove([filePath]);

    // Upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(EPUB_BUCKET)
      .upload(filePath, epubBuffer, {
        contentType: 'application/epub+zip',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 6. Get new URL
    const { data: urlData } = supabase.storage
      .from(EPUB_BUCKET)
      .getPublicUrl(filePath);

    console.log(`   ✅ Uploaded to Supabase`);

    // 7. Update database
    console.log(`   💾 Updating database...`);
    const { error: updateError } = await supabase
      .from('Book')
      .update({ epub: urlData.publicUrl })
      .eq('id', bookId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`   ✅ Database updated`);
    console.log(`   🎉 Migration completed!`);

    return true;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function migrateAll() {
  console.log('📚 Fetching all books from database...\n');

  try {
    const { data: books, error } = await supabase
      .from('Book')
      .select('id, title, epub')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }

    console.log(`Found ${books.length} books total`);

    const ipfsBooks = books.filter(book => isIpfsUrl(book.epub));
    const supabaseBooks = books.filter(book => isSupabaseUrl(book.epub));

    console.log(`   - IPFS (needs migration): ${ipfsBooks.length}`);
    console.log(`   - Already migrated: ${supabaseBooks.length}`);

    if (ipfsBooks.length === 0) {
      console.log('\n✅ All books already migrated!');
      return;
    }

    // Migrate each book
    let success = 0;
    let failed = 0;

    for (const book of ipfsBooks) {
      const result = await migrateBook(book.id);
      if (result) success++;
      else failed++;

      // Wait between books
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  // No args = migrate all
  await migrateAll();
} else {
  // Specific book IDs
  console.log(`Migrating ${args.length} specific book(s)\n`);

  for (const arg of args) {
    const bookId = parseInt(arg, 10);

    if (isNaN(bookId)) {
      console.log(`⚠️  Invalid book ID: ${arg}, skipping...`);
      continue;
    }

    await migrateBook(bookId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

console.log('\n✅ Done!\n');
