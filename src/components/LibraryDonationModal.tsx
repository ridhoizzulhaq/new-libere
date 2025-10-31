import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { BiDonateHeart } from 'react-icons/bi';
import { supabase } from '../libs/supabase';
import type { Library } from '../core/interfaces/library.interface';
import { isAddress } from 'viem';
import { USDC_DECIMALS } from '../usdc-token';

interface LibraryDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (libraryAddress: string, amount: number) => void;
  bookPrice?: string;
}

const LibraryDonationModal = ({ isOpen, onClose, onConfirm, bookPrice }: LibraryDonationModalProps) => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch libraries from Supabase
  useEffect(() => {
    if (isOpen) {
      fetchLibraries();
    }
  }, [isOpen]);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('libraries')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLibraries(data || []);
    } catch (err) {
      console.error('Failed to fetch libraries:', err);
      setError('Failed to load libraries. You can still enter a custom address.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!bookPrice) return '0';
    const priceInUSDC = Number(bookPrice) / Math.pow(10, USDC_DECIMALS);
    const total = priceInUSDC * amount;
    return total.toFixed(2);
  };

  // Validate and submit
  const handleConfirm = () => {
    setError('');

    // Get the address to use
    let addressToUse = '';

    if (selectedLibrary === 'custom') {
      addressToUse = customAddress.trim();
    } else if (selectedLibrary) {
      const library = libraries.find(lib => lib.address === selectedLibrary);
      if (library) {
        addressToUse = library.address;
      }
    }

    // Validate address
    if (!addressToUse) {
      setError('Please select a library or enter a custom address');
      return;
    }

    if (!isAddress(addressToUse)) {
      setError('Invalid Ethereum address. Must be a valid 0x... address');
      return;
    }

    // Validate amount
    if (amount < 1) {
      setError('Amount must be at least 1');
      return;
    }

    // All valid - proceed
    onConfirm(addressToUse, amount);
  };

  const handleLibraryChange = (value: string) => {
    setSelectedLibrary(value);
    setError('');

    // Clear custom address when switching to a registered library
    if (value !== 'custom') {
      setCustomAddress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <BiDonateHeart className="text-2xl text-zinc-900" />
            <h2 className="text-xl font-bold text-zinc-900">Donate to Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <MdClose className="text-xl text-zinc-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
          {/* Library Selection */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Select Library
            </label>
            {loading ? (
              <div className="w-full p-3 bg-zinc-100 rounded-lg animate-pulse">
                Loading libraries...
              </div>
            ) : (
              <select
                value={selectedLibrary}
                onChange={(e) => handleLibraryChange(e.target.value)}
                className="w-full p-3 border-2 border-zinc-300 rounded-lg focus:border-zinc-900 focus:outline-none transition-colors"
              >
                <option value="">-- Select a library --</option>
                {libraries.map((lib) => (
                  <option key={lib.id} value={lib.address}>
                    {lib.name}
                  </option>
                ))}
                <option value="custom">Custom Address</option>
              </select>
            )}
            {selectedLibrary && selectedLibrary !== 'custom' && (
              <p className="text-xs text-zinc-500 mt-2">
                {libraries.find(lib => lib.address === selectedLibrary)?.description}
              </p>
            )}
          </div>

          {/* Custom Address Input - Only show if "custom" is selected */}
          {selectedLibrary === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-zinc-900 mb-2">
                Library Contract Address
              </label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  setError('');
                }}
                placeholder="0x..."
                className="w-full p-3 border-2 border-zinc-300 rounded-lg focus:border-zinc-900 focus:outline-none transition-colors font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Enter the Ethereum address of the library contract
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Number of Books
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => {
                setAmount(parseInt(e.target.value) || 1);
                setError('');
              }}
              className="w-full p-3 border-2 border-zinc-300 rounded-lg focus:border-zinc-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Price Summary */}
          {bookPrice && (
            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">Price per book:</span>
                <span className="text-sm font-semibold text-zinc-900">
                  ${(Number(bookPrice) / Math.pow(10, USDC_DECIMALS)).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">Amount:</span>
                <span className="text-sm font-semibold text-zinc-900">
                  x{amount}
                </span>
              </div>
              <div className="border-t border-zinc-300 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-zinc-900">Total:</span>
                  <span className="text-base font-bold text-zinc-900">
                    ${calculateTotalPrice()} USDC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-zinc-300 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BiDonateHeart />
            <span>Donate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryDonationModal;
