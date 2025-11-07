/**
 * Supabase Storage Utilities
 *
 * Helper functions for managing EPUB files in Supabase Storage.
 * EPUBs are stored in private bucket 'libere-books' with authenticated access only.
 */

import { supabase } from '../libs/supabase';

const EPUB_BUCKET = 'libere-books';
const SIGNED_URL_EXPIRY = 300; // 5 minutes in seconds (reduced from 1 hour for security)

/**
 * Generate a signed URL for accessing an EPUB file
 * Signed URLs are temporary (5 minutes) for security
 * URLs are automatically refreshed in reader for continued access
 *
 * @param bookId - The book ID
 * @returns Signed URL or null if error
 */
export async function getSignedEpubUrl(bookId: number): Promise<string | null> {
  try {
    const filePath = `${bookId}/book.epub`;

    const { data, error } = await supabase.storage
      .from(EPUB_BUCKET)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

    if (error) {
      console.error(`[SupabaseStorage] Failed to create signed URL for book ${bookId}:`, error);
      return null;
    }

    if (!data?.signedUrl) {
      console.error(`[SupabaseStorage] No signed URL returned for book ${bookId}`);
      return null;
    }

    console.log(`[SupabaseStorage] Generated signed URL for book ${bookId} (expires in ${SIGNED_URL_EXPIRY}s)`);
    return data.signedUrl;
  } catch (error) {
    console.error(`[SupabaseStorage] Error generating signed URL:`, error);
    return null;
  }
}

/**
 * Upload an EPUB file to Supabase Storage
 * Used by admin-publish tool
 *
 * @param bookId - The book ID
 * @param epubFile - The EPUB file (File or Blob)
 * @returns Public URL (not signed) or null if error
 */
export async function uploadEpub(bookId: number, epubFile: File | Blob): Promise<string | null> {
  try {
    const filePath = `${bookId}/book.epub`;

    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from(EPUB_BUCKET)
      .list(bookId.toString());

    const fileExists = existingFiles?.some(file => file.name === 'book.epub');

    if (fileExists) {
      console.warn(`[SupabaseStorage] EPUB already exists for book ${bookId}, will overwrite`);

      // Delete existing file
      await supabase.storage
        .from(EPUB_BUCKET)
        .remove([filePath]);
    }

    // Upload new file
    const { error } = await supabase.storage
      .from(EPUB_BUCKET)
      .upload(filePath, epubFile, {
        contentType: 'application/epub+zip',
        cacheControl: '3600', // Cache for 1 hour
        upsert: false,
      });

    if (error) {
      console.error(`[SupabaseStorage] Failed to upload EPUB for book ${bookId}:`, error);
      return null;
    }

    // Get public URL (note: will not work for private bucket, but stored in database)
    const { data: urlData } = supabase.storage
      .from(EPUB_BUCKET)
      .getPublicUrl(filePath);

    console.log(`[SupabaseStorage] Successfully uploaded EPUB for book ${bookId}`);
    return urlData.publicUrl; // This is the storage path, not an accessible URL
  } catch (error) {
    console.error(`[SupabaseStorage] Error uploading EPUB:`, error);
    return null;
  }
}

/**
 * Download an EPUB file as a Blob
 * Used for caching EPUBs offline
 *
 * @param bookId - The book ID
 * @returns EPUB file as Blob or null if error
 */
export async function downloadEpubBlob(bookId: number): Promise<Blob | null> {
  try {
    const filePath = `${bookId}/book.epub`;

    const { data, error } = await supabase.storage
      .from(EPUB_BUCKET)
      .download(filePath);

    if (error) {
      console.error(`[SupabaseStorage] Failed to download EPUB for book ${bookId}:`, error);
      return null;
    }

    if (!data) {
      console.error(`[SupabaseStorage] No data returned for book ${bookId}`);
      return null;
    }

    console.log(`[SupabaseStorage] Downloaded EPUB for book ${bookId} (${data.size} bytes)`);
    return data;
  } catch (error) {
    console.error(`[SupabaseStorage] Error downloading EPUB:`, error);
    return null;
  }
}

/**
 * Check if an EPUB file exists in storage
 *
 * @param bookId - The book ID
 * @returns true if exists, false otherwise
 */
export async function epubExists(bookId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(EPUB_BUCKET)
      .list(bookId.toString());

    if (error) {
      console.error(`[SupabaseStorage] Error checking EPUB existence:`, error);
      return false;
    }

    const exists = data?.some(file => file.name === 'book.epub') || false;
    console.log(`[SupabaseStorage] Book ${bookId} EPUB exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`[SupabaseStorage] Error checking EPUB existence:`, error);
    return false;
  }
}

/**
 * Delete an EPUB file from storage
 * Used for admin cleanup
 *
 * @param bookId - The book ID
 * @returns true if successful, false otherwise
 */
export async function deleteEpub(bookId: number): Promise<boolean> {
  try {
    const filePath = `${bookId}/book.epub`;

    const { error } = await supabase.storage
      .from(EPUB_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error(`[SupabaseStorage] Failed to delete EPUB for book ${bookId}:`, error);
      return false;
    }

    console.log(`[SupabaseStorage] Successfully deleted EPUB for book ${bookId}`);
    return true;
  } catch (error) {
    console.error(`[SupabaseStorage] Error deleting EPUB:`, error);
    return false;
  }
}

/**
 * Get storage URL for an EPUB (not accessible without signed URL)
 * This is the URL format stored in database 'epub' column
 *
 * @param bookId - The book ID
 * @returns Storage URL
 */
export function getEpubStorageUrl(bookId: number): string {
  const filePath = `${bookId}/book.epub`;
  const { data } = supabase.storage
    .from(EPUB_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Extract book ID from Supabase storage URL
 *
 * @param url - Supabase storage URL
 * @returns Book ID or null if invalid URL
 */
export function extractBookIdFromUrl(url: string): number | null {
  try {
    // URL format: https://[project].supabase.co/storage/v1/object/[type]/libere-books/123/book.epub
    const match = url.match(/libere-books\/(\d+)\/book\.epub/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  } catch (error) {
    console.error(`[SupabaseStorage] Error extracting book ID from URL:`, error);
    return null;
  }
}

/**
 * Check if a URL is a Supabase storage URL or path
 *
 * @param url - URL or storage path to check
 * @returns true if Supabase storage URL/path, false otherwise
 */
export function isSupabaseStorageUrl(url: string): boolean {
  console.log('🔍 [isSupabaseStorageUrl] Checking:', url);

  // Check for full Supabase Storage URL
  if (url.includes('.supabase.co/storage/') && url.includes('libere-books')) {
    console.log('✅ [isSupabaseStorageUrl] Detected as full Supabase URL');
    return true;
  }

  // Check for storage path format: libere-books/{bookId}/book.epub
  if (url.startsWith('libere-books/') && url.endsWith('/book.epub')) {
    console.log('✅ [isSupabaseStorageUrl] Detected as storage path');
    return true;
  }

  console.log('❌ [isSupabaseStorageUrl] Not recognized');
  return false;
}

/**
 * Check if a URL is an IPFS/Pinata URL
 *
 * @param url - URL to check
 * @returns true if IPFS URL, false otherwise
 */
export function isIpfsUrl(url: string): boolean {
  return url.includes('ipfs') || url.includes('pinata.cloud');
}

/**
 * Auto-refresh signed URL before expiry
 * Call this function to start background refresh (every 4 minutes for 5-minute URLs)
 *
 * @param bookId - The book ID
 * @param onRefresh - Callback when new URL is ready
 * @returns Cleanup function to stop auto-refresh
 */
export function setupSignedUrlAutoRefresh(
  bookId: number,
  onRefresh: (newUrl: string) => void
): () => void {
  console.log('🔄 [AutoRefresh] Setting up auto-refresh for book', bookId);

  // Refresh every 4 minutes (240 seconds) to stay ahead of 5-minute expiry
  const REFRESH_INTERVAL = 240000; // 4 minutes in milliseconds

  const intervalId = setInterval(async () => {
    console.log('🔄 [AutoRefresh] Refreshing signed URL...');

    try {
      const newSignedUrl = await getSignedEpubUrl(bookId);

      if (newSignedUrl) {
        console.log('✅ [AutoRefresh] New signed URL generated');
        onRefresh(newSignedUrl);
      } else {
        console.error('❌ [AutoRefresh] Failed to refresh signed URL');
      }
    } catch (error) {
      console.error('❌ [AutoRefresh] Error refreshing URL:', error);
    }
  }, REFRESH_INTERVAL);

  console.log('✅ [AutoRefresh] Auto-refresh started (every 4 minutes)');

  // Return cleanup function
  return () => {
    console.log('🧹 [AutoRefresh] Stopping auto-refresh');
    clearInterval(intervalId);
  };
}
