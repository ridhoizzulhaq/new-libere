#!/usr/bin/env node

/**
 * Test generating signed URLs for books
 * This will tell us if files exist and if anon key can access them
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing credentials in .env');
  process.exit(1);
}

console.log('🧪 Testing Signed URL Generation\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Using: Anon Key\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const bookIds = [1761747515, 1761866400, 1761866611, 1761866872];

async function testSignedUrls() {
  for (const bookId of bookIds) {
    const filePath = `${bookId}/book.epub`;

    console.log(`\n📖 Testing Book ID: ${bookId}`);
    console.log(`   File path: ${filePath}`);

    try {
      // Try to generate signed URL
      const { data, error } = await supabase.storage
        .from('libere-books')
        .createSignedUrl(filePath, 60); // 1 minute expiry for testing

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);

        // Try to check if file exists
        const { data: listData, error: listError } = await supabase.storage
          .from('libere-books')
          .list(`${bookId}`, { limit: 1 });

        if (listError) {
          console.log(`   ❌ Cannot list folder: ${listError.message}`);
        } else if (!listData || listData.length === 0) {
          console.log(`   ⚠️  Folder ${bookId}/ is empty or doesn't exist`);
        } else {
          console.log(`   ✅ Folder exists with files:`, listData.map(f => f.name));
        }
      } else if (data?.signedUrl) {
        console.log(`   ✅ Signed URL generated successfully!`);
        console.log(`   URL: ${data.signedUrl.substring(0, 80)}...`);
      }
    } catch (err) {
      console.log(`   ❌ Unexpected error:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 DIAGNOSIS:');
  console.log('='.repeat(60));
  console.log('If "Object not found": Files not uploaded or wrong path');
  console.log('If "Cannot list folder": RLS policy blocks anon key');
  console.log('If "Signed URL generated": Everything works! ✅');
  console.log('='.repeat(60));
}

testSignedUrls();
