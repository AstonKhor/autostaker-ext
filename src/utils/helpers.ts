/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

import { TRANSACTION_CONFIG } from '../constants';

/**
 * Delays execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounces a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait) as unknown as number;
  };
}

/**
 * Throttles a function call
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Formats a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

/**
 * Formats a number with decimal places
 * @param value Value to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Converts micro amount to standard amount
 * @param microAmount Micro amount (e.g., uusd)
 * @returns Standard amount
 */
export function fromMicroAmount(microAmount: number | string): number {
  const amount = typeof microAmount === 'string' ? parseInt(microAmount, 10) : microAmount;
  return amount / TRANSACTION_CONFIG.microUnit;
}

/**
 * Converts standard amount to micro amount
 * @param amount Standard amount
 * @returns Micro amount
 */
export function toMicroAmount(amount: number): number {
  return Math.floor(amount * TRANSACTION_CONFIG.microUnit);
}

/**
 * Truncates text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param position Position to truncate ('end', 'middle', 'start')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  position: 'end' | 'middle' | 'start' = 'end'
): string {
  if (text.length <= maxLength) return text;

  const ellipsis = '...';
  const truncatedLength = maxLength - ellipsis.length;

  switch (position) {
    case 'start':
      return ellipsis + text.slice(-truncatedLength);
    
    case 'middle': {
      const startLength = Math.floor(truncatedLength / 2);
      const endLength = Math.ceil(truncatedLength / 2);
      return text.slice(0, startLength) + ellipsis + text.slice(-endLength);
    }
    
    case 'end':
    default:
      return text.slice(0, truncatedLength) + ellipsis;
  }
}

/**
 * Safely parses JSON with fallback
 * @param json JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Deep clones an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value Value to check
 * @returns True if empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Retries a function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Result of function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, i);
        await delay(delayTime);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Groups array items by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Grouped object
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Generates a unique ID
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateUniqueId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
} 