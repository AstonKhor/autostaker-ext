/**
 * Logger Service
 * Provides structured logging with different levels and environments
 */

import config from '../config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: unknown;
  error?: Error;
}

export class LoggerService {
  private static instance: LoggerService;
  private logHistory: LogEntry[] = [];
  private readonly maxHistorySize = 1000;
  private readonly context: string;

  private constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Get logger instance for a specific context
   */
  static getInstance(context = 'App'): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(context);
    }
    return LoggerService.instance;
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): LoggerService {
    return new LoggerService(`${this.context}:${context}`);
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, data?: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, data, errorObj);
  }

  /**
   * Fatal error logging
   */
  fatal(message: string, error?: Error | unknown, data?: unknown): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.FATAL, message, data, errorObj);
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: this.context,
      data,
      error,
    };

    // Add to history
    this.addToHistory(entry);

    // Skip debug logs in production unless explicitly enabled
    if (level === LogLevel.DEBUG && !config.features.enableDebugLogging) {
      return;
    }

    // Format and output log
    const formattedLog = this.formatLog(entry);
    
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedLog, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedLog, data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedLog, error || '', data || '');
        break;
    }

    // Send to error reporting service in production
    if (config.features.enableErrorReporting && level >= LogLevel.ERROR) {
      this.reportError(entry);
    }
  }

  /**
   * Format log entry for console output
   */
  private formatLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.context}]`;
    
    return `${prefix} ${entry.message}`;
  }

  /**
   * Add entry to history with size limit
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Report error to external service (placeholder)
   */
  private reportError(entry: LogEntry): void {
    // In a real application, this would send to Sentry, LogRocket, etc.
    // For now, we'll just store it in Chrome storage
    try {
      const errorReport = {
        ...entry,
        userAgent: navigator.userAgent,
        url: window.location.href,
        stackTrace: entry.error?.stack,
      };

      // Store last 100 errors
      chrome.storage.local.get(['errorReports'], (result) => {
        const reports = result.errorReports || [];
        reports.push(errorReport);
        
        if (reports.length > 100) {
          reports.shift();
        }

        chrome.storage.local.set({ errorReports: reports });
      });
    } catch (err) {
      // Fail silently to avoid recursive errors
    }
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();

// Export factory function for creating child loggers
export function createLogger(context: string): LoggerService {
  return LoggerService.getInstance().child(context);
} 