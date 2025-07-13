/**
 * Application Configuration
 * Centralized configuration management for different environments
 */

import { Network } from '../types';
import { NETWORK_CONFIG, VALIDATION_CONSTRAINTS } from '../constants';

export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
  defaultNetwork: Network;
  networks: typeof NETWORK_CONFIG;
  validation: typeof VALIDATION_CONSTRAINTS;
  features: {
    enableDebugLogging: boolean;
    enableErrorReporting: boolean;
    enableAnalytics: boolean;
  };
  api: {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const config: AppConfig = {
  isDevelopment,
  isProduction,
  version: process.env.VERSION || '1.0.0',
  defaultNetwork: Network.MAINNET,
  networks: NETWORK_CONFIG,
  validation: VALIDATION_CONSTRAINTS,
  features: {
    enableDebugLogging: isDevelopment,
    enableErrorReporting: isProduction,
    enableAnalytics: isProduction,
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};

export default config; 