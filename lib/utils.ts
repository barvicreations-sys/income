import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD', lang: string = 'en-US') {
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
