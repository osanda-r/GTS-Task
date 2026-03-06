/**
 * Utility functions for string manipulation.
 */

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to camelCase.
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Convert string to kebab-case.
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case.
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Slugify a string (e.g. for URLs).
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')                           // Remove accents
    .replace(/[\u0300-\u036f]/g, '')           // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')               // Replace non-alphanumerics with hyphen
    .replace(/(^-+)|(-+$)/g, '');              // Trim leading/trailing hyphens, groups explicit
}

/**
 * Truncate a string to a specific length, optionally with ellipsis.
 */
export function truncate(str: string, maxLength: number, ellipsis = true): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + (ellipsis ? '...' : '');
}

/**
 * Capitalize every word in a string.
 */
export function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Check if string is empty or whitespace only.
 */
export function isBlank(str: string): boolean {
  return !str || /^\s*$/.test(str);
}
