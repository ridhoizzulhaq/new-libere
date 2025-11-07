/**
 * Migration Script: IPFS to Supabase Storage
 *
 * This script migrates EPUB files from IPFS/Pinata to Supabase Storage bucket.
 *
 * Usage:
 *   npm run migrate:epubs
 *
 * Features:
 * - Fetch all books from database
 * - Download EPUB from IPFS
 * - Upload to Supabase Storage
 * - Update database with new URL
 * - Skip already migrated books
 * - Error handling and retry logic
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const EPUB_BUCKET = 'libere-books';
const BATCH_SIZE = 5; // Process 5 books at a time
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Types
interface Book {
  id: number;
  title: string;
  author: string;
  epub: string;
  metadataUri: string;
}

interface MigrationResult {
  bookId: number;
  title: string;
  success: boolean;
  oldUrl: string;
  newUrl?: string;
  error?: string;
}

/**
 * Check if URL is from IPFS
 */
function isIpfsUrl(url: string): boolean {
  return url.includes('ipfs') || url.includes('pinata.cloud');
}

/**
 * Check if URL is from Supabase Storage
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/') && url.includes(EPUB_BUCKET);
}

/**
 * Download EPUB file from IPFS
 */
async function downloadEpubFromIpfs(url: string, bookId: number): Promise<Buffer> {
  console.log(`  📥 Downloading EPUB from IPFS...`);

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000, // 60 seconds timeout
      maxContentLength: 50 * 1024 * 1024, // Max 50MB
    });

    const buffer = Buffer.from(response.data);
    console.log(`  ✅ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

    return buffer;
  } catch (error: any) {
    throw new Error(`Failed to download from IPFS: ${error.message}`);
  }
}

/**
 * Upload EPUB to Supabase Storage
 */
async function uploadEpubToSupabase(bookId: number, fileBuffer: Buffer): Promise<string> {
  console.log(`  📤 Uploading to Supabase Storage...`);

  const filePath = `${bookId}/book.epub`;

  try {
    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from(EPUB_BUCKET)
      .list(bookId.toString());

    const fileExists = existingFiles?.some(file => file.name === 'book.epub');

    if (fileExists) {
      console.log(`  ⚠️  File already exists, removing old file...`);
      await supabase.storage
        .from(EPUB_BUCKET)
        .remove([filePath]);
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from(EPUB_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: 'application/epub+zip',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL (for storage path reference)
    const { data: urlData } = supabase.storage
      .from(EPUB_BUCKET)
      .getPublicUrl(filePath);

    console.log(`  ✅ Uploaded successfully`);
    return urlData.publicUrl;
  } catch (error: any) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }
}

/**
 * Update book record in database
 */
async function updateBookEpubUrl(bookId: number, newUrl: string): Promise<void> {
  console.log(`  💾 Updating database...`);

  const { error } = await supabase
    .from('Book')
    .update({ epub: newUrl })
    .eq('id', bookId);

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }

  console.log(`  ✅ Database updated`);
}

/**
 * Migrate a single book with retry logic
 */
async function migrateBook(book: Book, attempt = 1): Promise<MigrationResult> {
  console.log(`\n📖 [${book.id}] ${book.title}`);
  console.log(`  Author: ${book.author}`);
  console.log(`  Current URL: ${book.epub.substring(0, 60)}...`);

  try {
    // Skip if already migrated
    if (isSupabaseStorageUrl(book.epub)) {
      console.log(`  ⏭️  Already migrated to Supabase Storage`);
      return {
        bookId: book.id,
        title: book.title,
        success: true,
        oldUrl: book.epub,
        newUrl: book.epub,
      };
    }

    // Skip if not from IPFS
    if (!isIpfsUrl(book.epub)) {
      console.log(`  ⚠️  Unknown URL format, skipping...`);
      return {
        bookId: book.id,
        title: book.title,
        success: false,
        oldUrl: book.epub,
        error: 'Unknown URL format',
      };
    }

    // Step 1: Download from IPFS
    const epubBuffer = await downloadEpubFromIpfs(book.epub, book.id);

    // Step 2: Upload to Supabase
    const newUrl = await uploadEpubToSupabase(book.id, epubBuffer);

    // Step 3: Update database
    await updateBookEpubUrl(book.id, newUrl);

    console.log(`  🎉 Migration completed!`);

    return {
      bookId: book.id,
      title: book.title,
      success: true,
      oldUrl: book.epub,
      newUrl: newUrl,
    };

  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);

    // Retry logic
    if (attempt < RETRY_ATTEMPTS) {
      console.log(`  🔄 Retrying (${attempt}/${RETRY_ATTEMPTS})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return migrateBook(book, attempt + 1);
    }

    return {
      bookId: book.id,
      title: book.title,
      success: false,
      oldUrl: book.epub,
      error: error.message,
    };
  }
}

/**
 * Process books in batches
 */
async function migrateBooksInBatches(books: Book[]): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(books.length / BATCH_SIZE)}`);
    console.log(`   Books ${i + 1}-${Math.min(i + BATCH_SIZE, books.length)} of ${books.length}`);

    const batchResults = await Promise.all(
      batch.map(book => migrateBook(book))
    );

    results.push(...batchResults);

    // Wait between batches to avoid rate limiting
    if (i + BATCH_SIZE < books.length) {
      console.log(`\n⏸️  Waiting 3 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  return results;
}

/**
 * Generate migration report
 */
function generateReport(results: MigrationResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION REPORT');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const alreadyMigrated = results.filter(r => r.success && r.oldUrl === r.newUrl);
  const newlyMigrated = results.filter(r => r.success && r.oldUrl !== r.newUrl);

  console.log(`\n✅ Total Successful: ${successful.length}`);
  console.log(`   - Already migrated: ${alreadyMigrated.length}`);
  console.log(`   - Newly migrated: ${newlyMigrated.length}`);

  console.log(`\n❌ Total Failed: ${failed.length}`);

  if (newlyMigrated.length > 0) {
    console.log(`\n📚 Newly Migrated Books:`);
    newlyMigrated.forEach(r => {
      console.log(`   - [${r.bookId}] ${r.title}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n⚠️  Failed Migrations:`);
    failed.forEach(r => {
      console.log(`   - [${r.bookId}] ${r.title}`);
      console.log(`     Error: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  // Save detailed report to file
  const reportPath = path.join(process.cwd(), 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 EPUB Migration: IPFS → Supabase Storage');
  console.log('='.repeat(80));
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket: ${EPUB_BUCKET}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log('='.repeat(80));

  try {
    // Fetch all books from database
    console.log('\n📚 Fetching books from database...');
    const { data: books, error } = await supabase
      .from('Book')
      .select('id, title, author, epub, metadataUri')
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }

    if (!books || books.length === 0) {
      console.log('⚠️  No books found in database');
      return;
    }

    console.log(`✅ Found ${books.length} books`);

    // Check which books need migration
    const ipfsBooks = books.filter(book => isIpfsUrl(book.epub));
    const supabaseBooks = books.filter(book => isSupabaseStorageUrl(book.epub));
    const otherBooks = books.filter(book => !isIpfsUrl(book.epub) && !isSupabaseStorageUrl(book.epub));

    console.log(`\n📊 Book Status:`);
    console.log(`   - IPFS (needs migration): ${ipfsBooks.length}`);
    console.log(`   - Supabase Storage (already migrated): ${supabaseBooks.length}`);
    console.log(`   - Other/Unknown: ${otherBooks.length}`);

    if (ipfsBooks.length === 0) {
      console.log('\n✅ All books already migrated! Nothing to do.');
      return;
    }

    // Confirm migration
    console.log(`\n⚡ Starting migration of ${ipfsBooks.length} books...`);

    // Migrate books
    const results = await migrateBooksInBatches(ipfsBooks);

    // Generate report
    generateReport(results);

    console.log('\n✅ Migration completed!\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
main();
