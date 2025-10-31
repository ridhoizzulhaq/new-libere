import { createPublicClient, http } from "viem";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import BookselfBookCard from "./BookselfBookCard";

interface Props {
  books: Book[];
  isLoading: boolean;
}

const BookselfBookList = ({ books }: Props) => {
  const { client } = useSmartWallets();
  const clientPublic = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  return (
    <section className="w-full flex justify-center items-center">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-zinc-900">📕 My Books</h2>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookselfBookCard
              key={book.title}
              book={book}
              client={client}
              clientPublic={clientPublic}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BookselfBookList;
