/**
 * Utility functions for array operations.
 */

/**
 * Remove duplicate values from an array.
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Flatten a nested array (1 level deep).
 */
export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((acc: T[], val) => acc.concat(val), []);
}

/**
 * Deep flatten a nested array of arbitrary depth.
 */
export function deepFlatten<T>(arr: T[][]): T[] {
  return arr.reduce(
    (acc: T[], val) =>
      Array.isArray(val) ? acc.concat(deepFlatten<T>(val)) : acc.concat(val),
    []
  );
}

/**
 * Split an array into chunks of a specified size.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Get the difference between two arrays.
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => !arr2.includes(item));
}

/**
 * Get the intersection of two arrays.
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Shuffle an array randomly (Fisher-Yates algorithm).
 */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Remove falsy values from an array (false, null, 0, "", undefined, NaN).
 */
export function compact<T>(arr: T[]): T[] {
  return arr.filter(Boolean);
}
