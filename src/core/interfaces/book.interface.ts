export interface Book {
    id: number;
    title: string;
    description: string;
    author: string;
    publisher: string;
    metadataUri: string;
    epub: string;
    priceEth: string;
    royalty: number;
    addressReciepent: string;
    addressRoyaltyRecipient: string;
    quantity?: number; // Jumlah NFT yang dimiliki (optional, hanya ada di bookshelf)
    fileType?: 'epub' | 'pdf'; // File type: EPUB or PDF (optional, defaults to 'epub' for backward compatibility)
}