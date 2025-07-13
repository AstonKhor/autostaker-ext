/**
 * Chrome Storage Service
 * Provides a typed, promise-based interface for Chrome's storage API
 */

import { IStorageService } from '../types';

export class StorageService implements IStorageService {
  private readonly storageArea: chrome.storage.StorageArea;

  constructor(area: 'local' | 'sync' = 'local') {
    this.storageArea = chrome.storage[area];
  }

  /**
   * Retrieves a value from storage
   * @param key The storage key
   * @returns The stored value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await new Promise<{ [key: string]: T }>((resolve, reject) => {
        this.storageArea.get(key, (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(items);
          }
        });
      });

      return result[key] ?? null;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      throw new Error(`Storage read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stores a value in storage
   * @param key The storage key
   * @param value The value to store
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.storageArea.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
      throw new Error(`Storage write error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a value from storage
   * @param key The storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.storageArea.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      throw new Error(`Storage remove error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves all values from storage
   * @returns All stored key-value pairs
   */
  async getAll(): Promise<Record<string, unknown>> {
    try {
      const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
        this.storageArea.get(null, (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(items);
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Failed to get all storage items:', error);
      throw new Error(`Storage read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clears all values from storage
   */
  async clear(): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.storageArea.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error(`Storage clear error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets multiple values from storage
   * @param keys Array of storage keys
   * @returns Object with requested key-value pairs
   */
  async getMultiple<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    try {
      const result = await new Promise<T>((resolve, reject) => {
        this.storageArea.get(keys, (items) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(items as T);
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Failed to get multiple storage keys:', error);
      throw new Error(`Storage read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sets multiple values in storage
   * @param items Object with key-value pairs to store
   */
  async setMultiple(items: Record<string, unknown>): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.storageArea.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Failed to set multiple storage items:', error);
      throw new Error(`Storage write error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 