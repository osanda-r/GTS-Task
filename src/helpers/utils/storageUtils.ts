/**
 * Utility functions for localStorage and sessionStorage.
 */

type StorageType = 'local' | 'session';

const getStorage = (type: StorageType): Storage => {
  return type === 'local' ? localStorage : sessionStorage;
};

/**
 * Save data to storage (auto JSON.stringify)
 */
export function setItem<T = unknown>(key: string, value: T, type: StorageType = 'local'): void {
  const storage = getStorage(type);
  try {
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
  } catch (err) {
    console.error(`Failed to set ${key} in ${type}Storage:`, err);
  }
}

/**
 * Retrieve data from storage (auto JSON.parse)
 */
export function getItem<T = unknown>(key: string, type: StorageType = 'local'): T | null {
  const storage = getStorage(type);
  try {
    const item = storage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (err) {
    console.error(`Failed to parse ${key} from ${type}Storage:`, err);
    return null;
  }
}

/**
 * Remove an item from storage
 */
export function removeItem(key: string, type: StorageType = 'local'): void {
  const storage = getStorage(type);
  storage.removeItem(key);
}

/**
 * Clear all storage
 */
export function clearStorage(type: StorageType = 'local'): void {
  const storage = getStorage(type);
  storage.clear();
}

/**
 * Check if a key exists in storage
 */
export function hasItem(key: string, type: StorageType = 'local'): boolean {
  const storage = getStorage(type);
  return storage.getItem(key) !== null;
}
