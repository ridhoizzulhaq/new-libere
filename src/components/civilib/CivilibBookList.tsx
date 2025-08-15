import { createPublicClient, http } from "viem";
import CivilibBookCard from "./CivilibBookCard";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";

interface Props {
  books: Book[];
  isLoading: boolean;
}

const CivilibBookList = ({ books }: Props) => {
  const { client } = useSmartWallets();
  const clientPublic = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  return (
    <section className="w-full flex justify-center items-center">
      <div className="w-full">
        <h2 className="text-3xl font-bold">📕 Books</h2>

        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 xs:gap-10">
          {books.map((book) => (
            <CivilibBookCard
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

export default CivilibBookList;
