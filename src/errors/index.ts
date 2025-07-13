/**
 * Custom Error Classes
 * Provides structured error handling throughout the application
 */

import { ERROR_CODES } from '../constants';

/**
 * Base error class for all application errors
 */
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly timestamp: number;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = Date.now();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ERROR_CODES.INVALID_CONFIG, context);
  }
}

/**
 * Validation error
 */
export class ValidationError extends BaseError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[], context?: Record<string, unknown>) {
    super(message, ERROR_CODES.INVALID_CONFIG, context);
    this.validationErrors = validationErrors;
  }
}

/**
 * Network error
 */
export class NetworkError extends BaseError {
  public readonly statusCode?: number;
  public readonly response?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    response?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, ERROR_CODES.NETWORK_ERROR, context);
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Transaction error
 */
export class TransactionError extends BaseError {
  public readonly txHash?: string;
  public readonly rawLog?: string;

  constructor(
    message: string,
    txHash?: string,
    rawLog?: string,
    context?: Record<string, unknown>
  ) {
    super(message, ERROR_CODES.TX_FAILED, context);
    this.txHash = txHash;
    this.rawLog = rawLog;
  }
}

/**
 * Staking process error
 */
export class StakingError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ERROR_CODES.STAKER_PROCESS_ERROR, context);
  }
}

/**
 * Storage error
 */
export class StorageError extends BaseError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ERROR_CODES.UNKNOWN_ERROR, context);
  }
}

/**
 * Check if an error is one of our custom errors
 */
export function isAppError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

/**
 * Generic application error
 */
export class ApplicationError extends BaseError {
  constructor(message: string, code: string = ERROR_CODES.UNKNOWN_ERROR, context?: Record<string, unknown>) {
    super(message, code, context);
  }
}

/**
 * Convert any error to our error format
 */
export function normalizeError(error: unknown): BaseError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApplicationError(error.message, ERROR_CODES.UNKNOWN_ERROR, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new ApplicationError(
    String(error),
    ERROR_CODES.UNKNOWN_ERROR,
    { originalError: error }
  );
} 