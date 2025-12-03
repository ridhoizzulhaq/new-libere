import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllBooks() {
  console.log('📚 Fetching all books from database...\n');

  const { data: books, error } = await supabase
    .from('Book')
    .select('id, title, author')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!books || books.length === 0) {
    console.log('No books found');
    return;
  }

  console.log(`✅ Found ${books.length} book(s):\n`);
  books.forEach((book, index) => {
    console.log(`${index + 1}. [ID: ${book.id}] ${book.title}`);
    console.log(`   Author: ${book.author}\n`);
  });

  // Check for Metamorfosa
  const metamorfosa = books.find(b => b.title.toLowerCase().includes('metamorf'));
  if (metamorfosa) {
    console.log(`\n🎯 Found "Metamorfosa": ID ${metamorfosa.id}`);
  } else {
    console.log('\n⚠️  "Metamorfosa" not found in database');
  }
}

listAllBooks();
