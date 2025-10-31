import { useState } from 'react';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import { MdLanguage, MdClose } from 'react-icons/md';

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selected: typeof CURRENCIES[0]) => {
    setCurrency(selected);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 z-40"
      >
        <MdLanguage className="text-xl" />
        <span className="font-semibold">{currency.flag} {currency.code}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Select Currency</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <MdClose className="text-xl text-zinc-600" />
              </button>
            </div>

            {/* Currency List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSelect(curr)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 ${
                    currency.code === curr.code ? 'bg-zinc-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{curr.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-zinc-900">{curr.code}</div>
                      <div className="text-sm text-zinc-500">{curr.name}</div>
                    </div>
                  </div>
                  {currency.code === curr.code && (
                    <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 text-xs text-zinc-500 text-center">
              Prices are converted from USD/USDC/ETH to {currency.code}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrencySelector;
