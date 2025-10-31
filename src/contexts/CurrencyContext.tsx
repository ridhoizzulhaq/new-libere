import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
];

// Country to currency mapping
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  ID: 'IDR',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  AU: 'AUD',
  CA: 'CAD',
  IN: 'INR',
  PH: 'PHP',
  VN: 'VND',
  GB: 'GBP',
  // EU countries
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: Record<string, number>;
  convertPrice: (usdPrice: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]); // Default USD
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Auto-detect user location and set currency
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Check localStorage first
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency) {
          const found = CURRENCIES.find(c => c.code === savedCurrency);
          if (found) {
            setCurrencyState(found);
            return;
          }
        }

        // Detect via IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;

        const currencyCode = COUNTRY_TO_CURRENCY[countryCode] || 'USD';
        const found = CURRENCIES.find(c => c.code === currencyCode);
        if (found) {
          setCurrencyState(found);
          localStorage.setItem('selectedCurrency', currencyCode);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
        // Default to USD
      }
    };

    detectLocation();
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        // Set default rates if fetch fails
        setExchangeRates({ USD: 1, IDR: 15000, EUR: 0.85, GBP: 0.73 });
        setIsLoading(false);
      }
    };

    fetchRates();
    // Refresh every hour
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency.code);
  };

  const convertPrice = (usdPrice: number): string => {
    const rate = exchangeRates[currency.code] || 1;
    const converted = usdPrice * rate;

    // Format based on currency
    if (currency.code === 'IDR' || currency.code === 'VND' || currency.code === 'KRW') {
      // No decimals for these currencies
      return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    } else if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
    } else {
      // 2 decimals for most currencies
      return `${currency.symbol}${converted.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, convertPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
