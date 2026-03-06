/**
 * Utility functions for number formatting and manipulation.
 */

/**
 * Format a number with commas as a thousand separators.
 * Example: 1234567.89 -> "1,234,567.89"
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a number as currency.
 * Example: 1234.56 -> "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency
  });
}

/**
 * Round a number to a specific number of decimal places.
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp a number between a min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random number between min and max (inclusive).
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if a value is a valid number.
 */
export function isNumeric(value: unknown): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Convert a number to a percentage string.
 * Example: 0.875 -> "87.5%"
 */
export function toPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Abbreviate large numbers (e.g. 1.5K, 2.3M).
 */
export function abbreviateNumber(value: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let i = 0;
  while (value >= 1000 && i < suffixes.length - 1) {
    value /= 1000;
    i++;
  }
  return `${value.toFixed(1)}${suffixes[i]}`;
}
