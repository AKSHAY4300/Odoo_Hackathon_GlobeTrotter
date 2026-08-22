import { CurrencyCode } from './types';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  AUD: 'A$',
};

export function formatCurrency(
  amount: number, 
  currency: CurrencyCode = 'USD', 
  maximumFractionDigits: number = 0
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? maximumFractionDigits : 0,
  }).format(amount || 0);

  return `${symbol}${formattedNumber}`;
}

export function formatCostIndex(index: 1 | 2 | 3 | 4): string {
  switch (index) {
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return '$$';
  }
}

export function getCostTierLabel(index: 1 | 2 | 3 | 4): string {
  switch (index) {
    case 1:
      return 'Budget-Friendly';
    case 2:
      return 'Moderate';
    case 3:
      return 'Premium';
    case 4:
      return 'Luxury';
    default:
      return 'Moderate';
  }
}
