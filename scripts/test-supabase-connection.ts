/**
 * Test Supabase Connection & Storage Setup
 *
 * This script verifies:
 * 1. Environment variables are loaded
 * 2. Supabase client can connect
 * 3. Storage bucket exists
 * 4. Storage policies are setup
 * 5. Can upload/download test file
 *
 * Usage:
 *   tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const EPUB_BUCKET = 'libere-books';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection & Storage Setup\n');
  console.log('='.repeat(60));

  // Step 1: Check environment variables
  console.log('\n1️⃣  Checking Environment Variables...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('   Required:');
    console.error('   - VITE_SUPABASE_URL');
    console.error('   - VITE_SUPABASE_API_KEY');
    console.error('\n   Please check your .env file');
    process.exit(1);
  }

  console.log('✅ Environment variables found:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   API Key: ${supabaseKey.substring(0, 20)}...`);

  // Step 2: Initialize Supabase client
  console.log('\n2️⃣  Initializing Supabase Client...');

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');

  // Step 3: Test database connection
  console.log('\n3️⃣  Testing Database Connection...');

  try {
    const { data, error } = await supabase
      .from('Book')
      .select('id, title')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('   Check if table "Book" exists in Supabase');
      process.exit(1);
    }

    console.log('✅ Database connection successful');
    if (data && data.length > 0) {
      console.log(`   Sample book: [${data[0].id}] ${data[0].title}`);
    } else {
      console.log('   ⚠️  No books found in database (table is empty)');
    }
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }

  // Step 4: Check if storage bucket exists
  console.log('\n4️⃣  Checking Storage Bucket...');

  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError.message);
      process.exit(1);
    }

    console.log(`✅ Found ${buckets.length} storage bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    const epubBucket = buckets.find(b => b.name === EPUB_BUCKET);

    if (!epubBucket) {
      console.error(`\n❌ Bucket "${EPUB_BUCKET}" NOT FOUND!`);
      console.error('\n📋 Next Steps:');
      console.error('   1. Go to Supabase Dashboard → Storage');
      console.error('   2. Click "New bucket"');
      console.error(`   3. Name: ${EPUB_BUCKET}`);
      console.error('   4. UNCHECK "Public" (must be private)');
      console.error('   5. Click "Create bucket"');
      console.error('\n   Then run this test again.');
      process.exit(1);
    }

    console.log(`\n✅ Bucket "${EPUB_BUCKET}" exists!`);
    console.log(`   Type: ${epubBucket.public ? 'PUBLIC ⚠️' : 'PRIVATE ✅'}`);
    console.log(`   ID: ${epubBucket.id}`);

    if (epubBucket.public) {
      console.warn('\n⚠️  WARNING: Bucket is PUBLIC!');
      console.warn('   Recommended: Make bucket PRIVATE for authenticated access only');
    }

  } catch (error: any) {
    console.error('❌ Bucket check failed:', error.message);
    process.exit(1);
  }

  // Step 5: Test file upload
  console.log('\n5️⃣  Testing File Upload...');

  try {
    const testFileName = 'test/test-file.txt';
    const testContent = `Test upload at ${new Date().toISOString()}`;

    // Upload test file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(EPUB_BUCKET)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('\n📋 Possible causes:');
      console.error('   1. Storage policies not setup');
      console.error('   2. Authentication required but not provided');
      console.error('   3. Bucket permissions incorrect');
      console.error('\n📋 Next Steps:');
      console.error('   Setup storage policies in Supabase Dashboard → Storage → Policies:');
      console.error('   ');
      console.error('   CREATE POLICY "Allow authenticated upload"');
      console.error('   ON storage.objects FOR INSERT');
      console.error('   TO authenticated');
      console.error(`   WITH CHECK (bucket_id = '${EPUB_BUCKET}');`);
      console.error('   ');
      console.error('   Or temporarily allow public uploads for testing:');
      console.error('   ');
      console.error('   CREATE POLICY "Allow public upload"');
      console.error('   ON storage.objects FOR INSERT');
      console.error('   TO public');
      console.error(`   WITH CHECK (bucket_id = '${EPUB_BUCKET}');`);

      // Try to check existing policies
      console.error('\n🔍 Checking existing policies...');
      const { data: policies } = await supabase.rpc('get_storage_policies', {
        bucket_name: EPUB_BUCKET
      }).catch(() => ({ data: null }));

      if (policies) {
        console.log('   Existing policies:', policies);
      } else {
        console.log('   ⚠️  Could not fetch policies (might need admin access)');
      }

      process.exit(1);
    }

    console.log('✅ File upload successful!');
    console.log(`   Path: ${uploadData.path}`);

  } catch (error: any) {
    console.error('❌ Upload test failed:', error.message);
    process.exit(1);
  }

  // Step 6: Test file download
  console.log('\n6️⃣  Testing File Download...');

  try {
    const testFileName = 'test/test-file.txt';

    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(EPUB_BUCKET)
      .download(testFileName);

    if (downloadError) {
      console.error('❌ Download test failed:', downloadError.message);
      console.error('\n📋 Next Steps:');
      console.error('   Setup storage policy for SELECT:');
      console.error('   ');
      console.error('   CREATE POLICY "Allow authenticated read"');
      console.error('   ON storage.objects FOR SELECT');
      console.error('   TO authenticated');
      console.error(`   USING (bucket_id = '${EPUB_BUCKET}');`);
      process.exit(1);
    }

    console.log('✅ File download successful!');
    console.log(`   Size: ${downloadData.size} bytes`);

  } catch (error: any) {
    console.error('❌ Download test failed:', error.message);
    process.exit(1);
  }

  // Step 7: Test signed URL generation
  console.log('\n7️⃣  Testing Signed URL Generation...');

  try {
    const testFileName = 'test/test-file.txt';

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(EPUB_BUCKET)
      .createSignedUrl(testFileName, 60); // 60 seconds expiry

    if (signedUrlError) {
      console.error('❌ Signed URL generation failed:', signedUrlError.message);
      process.exit(1);
    }

    console.log('✅ Signed URL generated successfully!');
    console.log(`   URL: ${signedUrlData.signedUrl.substring(0, 80)}...`);
    console.log('   Expires in: 60 seconds');

  } catch (error: any) {
    console.error('❌ Signed URL test failed:', error.message);
    process.exit(1);
  }

  // Step 8: Cleanup test file
  console.log('\n8️⃣  Cleaning up test files...');

  try {
    const { error: deleteError } = await supabase.storage
      .from(EPUB_BUCKET)
      .remove(['test/test-file.txt']);

    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }
  } catch (error: any) {
    console.warn('⚠️  Cleanup failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS PASSED!');
  console.log('='.repeat(60));
  console.log('\n✨ Supabase Storage is ready for migration!');
  console.log(`   Bucket: ${EPUB_BUCKET}`);
  console.log('   Status: Ready ✅');
  console.log('\n📋 Next Steps:');
  console.log('   Run migration:');
  console.log('   npm run migrate:simple');
  console.log('');
}

// Run tests
testSupabaseConnection().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
