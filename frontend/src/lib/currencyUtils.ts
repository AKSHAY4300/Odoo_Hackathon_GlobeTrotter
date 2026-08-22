import { CurrencyCode } from './types';

const CURRENCY_SYMBOLS: Record<CurrencyCode | string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  AED: 'AED ',
  SGD: 'S$',
  THB: '฿',
};

export function formatCurrency(
  amount: number, 
  currency: CurrencyCode | string = 'INR', 
  maximumFractionDigits: number = 0
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  
  const formattedNumber = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? maximumFractionDigits : 0,
  }).format(amount || 0);

  return `${symbol}${formattedNumber}`;
}

export function formatCostIndex(index: 1 | 2 | 3 | 4): string {
  switch (index) {
    case 1:
      return '₹';
    case 2:
      return '₹₹';
    case 3:
      return '₹₹₹';
    case 4:
      return '₹₹₹₹';
    default:
      return '₹₹';
  }
}

export function getCostTierLabel(index: 1 | 2 | 3 | 4): string {
  switch (index) {
    case 1:
      return 'Budget-Friendly';
    case 2:
      return 'Moderate Value';
    case 3:
      return 'Premium Comfort';
    case 4:
      return 'Luxury Experience';
    default:
      return 'Moderate Value';
  }
}
