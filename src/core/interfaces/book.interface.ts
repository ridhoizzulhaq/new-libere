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
}