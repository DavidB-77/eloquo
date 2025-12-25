import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or object into a human-readable format
 */
export function formatDate(date: string | number | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formats a number as currency (USD)
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Truncates text to a specific length with ellipsis
 */
export function truncateText(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Calculates token savings percentage
 */
export function calculateTokenSavings(before: number, after: number) {
  if (before === 0) return 0;
  const savings = ((before - after) / before) * 100;
  return Math.round(savings);
}
