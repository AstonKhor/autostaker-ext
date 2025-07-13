/**
 * Application Constants
 * Centralized configuration values and magic strings
 */

// Network Configuration
export const NETWORK_CONFIG = {
  mainnet: {
    chainId: 'columbus-5',
    lcdUrl: 'https://lcd.terra.dev',
    name: 'Mainnet'
  },
  testnet: {
    chainId: 'bombay-12',
    lcdUrl: 'https://bombay-lcd.terra.dev',
    name: 'Testnet'
  },
  bombay: {
    chainId: 'bombay-12',
    lcdUrl: 'https://bombay-lcd.terra.dev',
    name: 'Bombay'
  },
  localterra: {
    chainId: 'localterra',
    lcdUrl: 'http://localhost:1317',
    name: 'LocalTerra'
  }
} as const;

// Validation Constraints
export const VALIDATION_CONSTRAINTS = {
  seedPhrase: {
    wordCount: 24,
    pattern: /^[a-z]+$/
  },
  checkInterval: {
    min: 1,        // 1 minute
    max: 1440,     // 24 hours
    default: 60    // 1 hour
  },
  gasPrice: {
    min: 0.01,
    max: 10,
    default: 0.30
  },
  contractExecDelay: {
    min: 5,        // 5 seconds
    max: 300,      // 5 minutes
    default: 15    // 15 seconds
  },
  mnemonicIndex: {
    min: 0,
    max: 2147483647,  // Max int32
    default: 0
  },
  coinType: {
    default: 330  // Terra coin type
  }
} as const;

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  gasLimit: 150_000,
  gasAmount: 57_000,
  pollingInterval: 3_000,    // 3 seconds
  maxPollingAttempts: 20,
  denominations: {
    ust: 'uusd',
    luna: 'uluna'
  },
  decimalPlaces: 6,
  microUnit: 1_000_000
} as const;

// UI Configuration
export const UI_CONFIG = {
  animation: {
    duration: {
      fast: 150,
      base: 200,
      slow: 300
    }
  },
  debounce: {
    input: 300,
    search: 500
  },
  polling: {
    rewards: 60_000  // 1 minute
  }
} as const;

// Error Codes
export const ERROR_CODES = {
  // Initialization Errors
  INIT_FAILED: 'INIT_FAILED',
  CONFIG_MISSING: 'CONFIG_MISSING',
  INVALID_CONFIG: 'INVALID_CONFIG',
  
  // Transaction Errors
  TX_FAILED: 'TX_FAILED',
  TX_TIMEOUT: 'TX_TIMEOUT',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // Staking Errors
  STAKER_PROCESS_ERROR: 'STAKER_PROCESS_ERROR',
  NO_REWARDS: 'NO_REWARDS',
  POOL_ERROR: 'POOL_ERROR',
  
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  LCD_ERROR: 'LCD_ERROR',
  
  // General Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  BACKGROUND_ERROR: 'BACKGROUND_ERROR'
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  seedWord: /^[a-z]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  config: 'autostakerConfig',
  runtime: 'autostakerRuntime',
  currentPage: 'currentPage',
  theme: 'theme'
} as const;

// External URLs
export const EXTERNAL_URLS = {
  documentation: 'https://docs.autostaker.com',
  github: 'https://github.com/autostaker/autostaker-ext',
  support: 'https://support.autostaker.com',
  teraDocs: 'https://docs.terra.money'
} as const; 