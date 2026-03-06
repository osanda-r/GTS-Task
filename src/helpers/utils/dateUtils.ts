/**
 * Utility functions for date formatting, parsing, and manipulation.
 */

export type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD-MM-YYYY';

/**
 * Format a Date object into a string according to the given format.
 * @param date Date object to format
 * @param format Format string ('YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD-MM-YYYY')
 * @returns formatted date string
 */
export function formatDate(date: Date, format: DateFormat = 'YYYY-MM-DD'): string {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // Months start at 0!
  const dd = date.getDate().toString().padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`;
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Parse a date string into a Date object.
 * Accepts 'YYYY-MM-DD', 'MM/DD/YYYY', or 'DD-MM-YYYY' formats.
 * Returns null if invalid.
 * @param dateStr string date to parse
 * @param format expected format of the input string
 */
export function parseDate(dateStr: string, format: DateFormat = 'YYYY-MM-DD'): Date | null {
  let year: number, month: number, day: number;

  try {
    switch (format) {
      case 'YYYY-MM-DD': {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1; // 0-based
        day = parseInt(parts[2], 10);
        break;
      }
      case 'MM/DD/YYYY': {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
        break;
      }
      case 'DD-MM-YYYY': {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
        break;
      }
      default:
        return null;
    }

    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return null; // Invalid date
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Add days to a date
 * @param date Date object
 * @param days number of days to add (can be negative)
 * @returns new Date object with added days
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date Date object
 * @param months number of months to add (can be negative)
 * @returns new Date object with added months
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const d = result.getDate();
  result.setMonth(result.getMonth() + months);

  // Handle month overflow (e.g., adding 1 month to Jan 31 => Feb 28/29)
  if (result.getDate() < d) {
    result.setDate(0); // Last day of previous month
  }
  return result;
}

/**
 * Calculate the difference between two dates in days
 * @param date1 first Date
 * @param date2 second Date
 * @returns number of full days between date1 and date2
 */
export function diffInDays(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Check if two dates are equal (same day)
 * @param date1 first Date
 * @param date2 second Date
 * @returns boolean
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
