/**
 * Validation utilities for Autostaker Extension
 */

import { ValidationResult, ConfigValidation } from '../types';

/**
 * Validates a mnemonic seed phrase
 * @param seedPhrase The seed phrase to validate
 * @returns Validation result
 */
export function validateSeedPhrase(seedPhrase: string): ValidationResult {
  const errors: string[] = [];

  if (!seedPhrase || seedPhrase.trim().length === 0) {
    errors.push('Seed phrase is required');
  } else {
    const words = seedPhrase.trim().split(/\s+/);
    
    if (words.length !== 24) {
      errors.push(`Seed phrase must contain exactly 24 words (found ${words.length})`);
    }

    // Check for basic word validity (alphanumeric characters only)
    const invalidWords = words.filter(word => !/^[a-z]+$/.test(word.toLowerCase()));
    if (invalidWords.length > 0) {
      errors.push('Seed phrase contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates check interval
 * @param minutes Check interval in minutes
 * @returns Validation result
 */
export function validateCheckInterval(minutes: number): ValidationResult {
  const errors: string[] = [];
  const MIN_INTERVAL = 1;
  const MAX_INTERVAL = 1440; // 24 hours

  if (!Number.isFinite(minutes)) {
    errors.push('Check interval must be a valid number');
  } else if (minutes < MIN_INTERVAL) {
    errors.push(`Check interval must be at least ${MIN_INTERVAL} minute`);
  } else if (minutes > MAX_INTERVAL) {
    errors.push(`Check interval cannot exceed ${MAX_INTERVAL} minutes (24 hours)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates gas price
 * @param price Gas price in UST
 * @returns Validation result
 */
export function validateGasPrice(price: number): ValidationResult {
  const errors: string[] = [];
  const MIN_GAS = 0.01;
  const MAX_GAS = 10;

  if (!Number.isFinite(price)) {
    errors.push('Gas price must be a valid number');
  } else if (price < MIN_GAS) {
    errors.push(`Gas price must be at least ${MIN_GAS} UST`);
  } else if (price > MAX_GAS) {
    errors.push(`Gas price cannot exceed ${MAX_GAS} UST`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates LCD URL
 * @param url LCD endpoint URL
 * @returns Validation result
 */
export function validateLcdUrl(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url || url.trim().length === 0) {
    errors.push('LCD URL is required');
  } else {
    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('LCD URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('LCD URL is not a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates contract execution delay
 * @param seconds Delay in seconds
 * @returns Validation result
 */
export function validateContractExecDelay(seconds: number): ValidationResult {
  const errors: string[] = [];
  const MIN_DELAY = 5;
  const MAX_DELAY = 300; // 5 minutes

  if (!Number.isFinite(seconds)) {
    errors.push('Contract execution delay must be a valid number');
  } else if (seconds < MIN_DELAY) {
    errors.push(`Contract execution delay must be at least ${MIN_DELAY} seconds`);
  } else if (seconds > MAX_DELAY) {
    errors.push(`Contract execution delay cannot exceed ${MAX_DELAY} seconds`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Config validation implementation
 */
export const configValidation: ConfigValidation = {
  validateSeedPhrase,
  validateCheckInterval,
  validateGasPrice,
  validateLcdUrl
};

/**
 * Validates all config fields at once
 * @param config Configuration object to validate
 * @returns Combined validation result
 */
export function validateConfig(config: {
  seedPhrase?: string;
  checkInterval?: number;
  gasPrice?: number;
  lcdUrl?: string;
  contractExecDelay?: number;
}): ValidationResult {
  const allErrors: string[] = [];

  if (config.seedPhrase !== undefined) {
    const result = validateSeedPhrase(config.seedPhrase);
    allErrors.push(...result.errors);
  }

  if (config.checkInterval !== undefined) {
    const result = validateCheckInterval(config.checkInterval);
    allErrors.push(...result.errors);
  }

  if (config.gasPrice !== undefined) {
    const result = validateGasPrice(config.gasPrice);
    allErrors.push(...result.errors);
  }

  if (config.lcdUrl !== undefined) {
    const result = validateLcdUrl(config.lcdUrl);
    allErrors.push(...result.errors);
  }

  if (config.contractExecDelay !== undefined) {
    const result = validateContractExecDelay(config.contractExecDelay);
    allErrors.push(...result.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
} 