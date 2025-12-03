/**
 * Document Type Detection Utilities
 * Detects file type from storage path or URL
 */

export type DocumentType = 'epub' | 'pdf' | 'unknown';

export interface DocumentInfo {
  type: DocumentType;
  extension: string;
  mimeType: string;
}

/**
 * Detect document type from file path or URL
 * Supports both Supabase storage paths and full URLs
 *
 * @param path - File path or URL (e.g., "libere-books/123/book.pdf" or full URL)
 * @returns DocumentInfo with type, extension, and mimeType
 *
 * @example
 * detectDocumentType("libere-books/123/book.pdf") // { type: 'pdf', extension: '.pdf', mimeType: 'application/pdf' }
 * detectDocumentType("libere-books/123/book.epub") // { type: 'epub', extension: '.epub', mimeType: 'application/epub+zip' }
 */
export function detectDocumentType(path: string): DocumentInfo {
  const lowerPath = path.toLowerCase();

  // Check for EPUB files
  if (lowerPath.includes('.epub') || lowerPath.endsWith('book.epub')) {
    return {
      type: 'epub',
      extension: '.epub',
      mimeType: 'application/epub+zip'
    };
  }

  // Check for PDF files
  if (lowerPath.includes('.pdf') || lowerPath.endsWith('book.pdf')) {
    return {
      type: 'pdf',
      extension: '.pdf',
      mimeType: 'application/pdf'
    };
  }

  // Unknown file type
  return {
    type: 'unknown',
    extension: '',
    mimeType: 'application/octet-stream'
  };
}

/**
 * Check if path is a PDF document
 * @param path - File path or URL
 * @returns true if PDF, false otherwise
 */
export function isPdfDocument(path: string): boolean {
  return detectDocumentType(path).type === 'pdf';
}

/**
 * Check if path is an EPUB document
 * @param path - File path or URL
 * @returns true if EPUB, false otherwise
 */
export function isEpubDocument(path: string): boolean {
  return detectDocumentType(path).type === 'epub';
}

/**
 * Get file extension for document type
 * @param type - Document type ('epub' | 'pdf' | 'unknown')
 * @returns File extension with dot (e.g., '.pdf', '.epub')
 */
export function getDocumentExtension(type: DocumentType): string {
  switch (type) {
    case 'epub': return '.epub';
    case 'pdf': return '.pdf';
    default: return '';
  }
}

/**
 * Get MIME type for document type
 * @param type - Document type ('epub' | 'pdf' | 'unknown')
 * @returns MIME type string
 */
export function getDocumentMimeType(type: DocumentType): string {
  switch (type) {
    case 'epub': return 'application/epub+zip';
    case 'pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}
