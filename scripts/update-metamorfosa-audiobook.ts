import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMetamorfosaAudiobook() {
  console.log('🎵 Updating Metamorfosa book with audiobook URL...\n');

  // First, check if audiobook column exists
  const { data: columns, error: columnError } = await supabase
    .from('Book')
    .select('audiobook')
    .limit(1);

  if (columnError) {
    console.error('❌ Error checking audiobook column:', columnError.message);
    console.log('\n⚠️  The "audiobook" column might not exist yet.');
    console.log('📋 Please run this SQL in Supabase SQL Editor:');
    console.log('\n   ALTER TABLE "Book" ADD COLUMN audiobook TEXT;\n');
    return;
  }

  console.log('✅ Audiobook column exists');

  // Update Metamorfosa book
  const { data, error } = await supabase
    .from('Book')
    .update({ audiobook: '/audiobooks/metamorfosa-bab-1.mp3' })
    .eq('id', 1764747979)
    .select();

  if (error) {
    console.error('❌ Error updating book:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No book found with ID 1764747979');
    return;
  }

  console.log('✅ Successfully updated Metamorfosa book!');
  console.log('\n📚 Updated book:');
  console.log(`   ID: ${data[0].id}`);
  console.log(`   Title: ${data[0].title}`);
  console.log(`   Audiobook: ${data[0].audiobook}`);
  console.log('\n✨ Audiobook feature is now ready!');
}

updateMetamorfosaAudiobook();
