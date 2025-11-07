import { FiBookOpen, FiUsers, FiLayers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface LibraryProfileCardProps {
  library: {
    id: number;
    name: string;
    address: string;
    description?: string;
    logo_url?: string;
    member_count?: number;
    book_count?: number;
    borrow_count?: number;
  };
}

const LibraryProfileCard = ({ library }: LibraryProfileCardProps) => {
  const navigate = useNavigate();

  // Truncate address for display (0x1234...5678)
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleVisitLibrary = () => {
    navigate(`/libraries/${library.id}`);
  };

  const handleJoinLibrary = () => {
    // TODO: Implement join library functionality
    console.log('Join library:', library.id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header Banner Image */}
      <div className="relative h-44 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50">
        {/* Library shelves background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=400&fit=crop')`,
          }}
        />

        {/* Logo - Circular, positioned at bottom left */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden">
            {library.logo_url ? (
              <img
                src={library.logo_url}
                alt={`${library.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <FiBookOpen className="text-white text-3xl" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-6 pb-6">
        {/* Library Name */}
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          {library.name}
        </h2>

        {/* Location (mock data) */}
        <div className="flex items-center gap-2 text-zinc-600 mb-3">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">Bandung, Indonesia</span>
        </div>

        {/* Description */}
        <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {library.description ||
            'Bandung Public Library serves the creative community of Bandung with a curated selection of digital books. From Indonesian literature to international bestsellers, our collection reflects the vibrant cultural scene of Kota Kembang.'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-around py-4 mb-6 bg-zinc-50 rounded-xl">
          {/* Books */}
          <div className="flex flex-col items-center">
            <FiBookOpen className="text-amber-600 text-2xl mb-1" />
            <div className="text-2xl font-bold text-zinc-900">
              {library.book_count || 0}
            </div>
            <div className="text-xs text-zinc-500">Buku</div>
          </div>

          {/* Members */}
          <div className="flex flex-col items-center">
            <FiUsers className="text-amber-600 text-2xl mb-1" />
            <div className="text-2xl font-bold text-zinc-900">
              {library.member_count || 0}
            </div>
            <div className="text-xs text-zinc-500">Anggota</div>
          </div>

          {/* Copies/Borrows */}
          <div className="flex flex-col items-center">
            <FiLayers className="text-amber-600 text-2xl mb-1" />
            <div className="text-2xl font-bold text-zinc-900">
              {library.borrow_count || 0}
            </div>
            <div className="text-xs text-zinc-500">Salinan</div>
          </div>
        </div>

        {/* Contract Address (small) */}
        <div className="mb-4 pb-4 border-b border-zinc-200">
          <div className="text-xs text-zinc-400 mb-1">Smart Contract</div>
          <div className="font-mono text-xs text-zinc-600 flex items-center gap-2">
            <span>{truncateAddress(library.address)}</span>
            <button
              onClick={() => navigator.clipboard.writeText(library.address)}
              className="text-amber-600 hover:text-amber-700"
              title="Copy address"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Visit Library Button */}
          <button
            onClick={handleVisitLibrary}
            className="flex-1 bg-white border-2 border-zinc-900 text-zinc-900 font-semibold py-3 px-6 rounded-xl hover:bg-zinc-900 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>Kunjungi Perpustakaan</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Join Library Button */}
          <button
            onClick={handleJoinLibrary}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
          >
            Join Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryProfileCard;
