#!/usr/bin/env node

/**
 * Fix EPUB URLs in database
 * Convert from public URLs to storage paths for private bucket
 *
 * BEFORE: https://mbgbxpmgjrtmjibygpdc.supabase.co/storage/v1/object/public/libere-books/1761747515/book.epub
 * AFTER:  libere-books/1761747515/book.epub
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.fix
dotenv.config({ path: '.env.fix' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY');
  console.error('Create .env.fix file with service_role key for this operation');
  process.exit(1);
}

console.log('🔧 Fixing EPUB URLs in database...\n');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Using: Service Role Key (admin access)\n`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEpubUrls() {
  try {
    // Fetch all books
    console.log('📚 Fetching books from database...\n');

    const { data: books, error: fetchError } = await supabase
      .from('Book')
      .select('id, title, epub')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError);
      return;
    }

    if (!books || books.length === 0) {
      console.log('⚠️  No books found');
      return;
    }

    console.log(`Found ${books.length} books\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const book of books) {
      console.log(`📖 Book ID: ${book.id} - ${book.title}`);
      console.log(`   Current URL: ${book.epub}`);

      // Check if URL needs fixing
      if (book.epub.includes('/storage/v1/object/public/')) {
        // Extract storage path from public URL
        const match = book.epub.match(/\/public\/(libere-books\/\d+\/book\.epub)/);

        if (match && match[1]) {
          const storagePath = match[1];
          console.log(`   New path: ${storagePath}`);

          // Update database
          const { error: updateError } = await supabase
            .from('Book')
            .update({ epub: storagePath })
            .eq('id', book.id);

          if (updateError) {
            console.error(`   ❌ Update failed:`, updateError.message);
          } else {
            console.log(`   ✅ Updated successfully`);
            updatedCount++;
          }
        } else {
          console.log(`   ⚠️  Could not extract path from URL`);
          skippedCount++;
        }
      } else if (book.epub.startsWith('libere-books/')) {
        console.log(`   ℹ️  Already using storage path format`);
        skippedCount++;
      } else if (book.epub.includes('ipfs') || book.epub.includes('pinata')) {
        console.log(`   ℹ️  IPFS URL - skipping`);
        skippedCount++;
      } else {
        console.log(`   ⚠️  Unknown format - skipping`);
        skippedCount++;
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📚 Total: ${books.length}`);
    console.log('='.repeat(60));

    if (updatedCount > 0) {
      console.log('\n✨ Database URLs have been fixed!');
      console.log('📝 Books now use storage path format for private bucket access');
      console.log('🔐 Signed URLs will be generated on-demand by the app');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixEpubUrls();
