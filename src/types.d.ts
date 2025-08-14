interface Book {
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
}

interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  universityCard: string;
}

interface BookParams {
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  coverColor: string;
  description: string;
  totalCopies: number;
  videoUrl: string;
  summary: string;
}

interface BorrowBookParams {
  bookId: string;
  userId: string;
}
