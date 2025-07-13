/**
 * Core type definitions for the Autostaker Chrome Extension
 */

// Enums for better type safety
export enum PageType {
  SETUP = 'setup',
  CONFIG = 'config',
  AUTOSTAKER = 'autostaker'
}

export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  BOMBAY = 'bombay',
  LOCALTERRA = 'localterra'
}

export enum TargetAsset {
  MIR = 'MIR',
  mMSFT = 'mMSFT',
  mBTC = 'mBTC',
  mAAPL = 'mAAPL',
  mNFLX = 'mNFLX',
  mAMC = 'mAMC',
  mETH = 'mETH',
  mAMZN = 'mAMZN',
  mGOOGL = 'mGOOGL',
  mVIXY = 'mVIXY',
  mQQQ = 'mQQQ',
  mBABA = 'mBABA',
  mTSLA = 'mTSLA',
  mCOIN = 'mCOIN'
}

export enum MessageType {
  AUTOSTAKER_ON = 'autostaker_on',
  AUTOSTAKER_OFF = 'autostaker_off',
  UPDATE_REWARDS = 'update_rewards',
  ERROR = 'error'
}

// Core application state
export interface AppState {
  currentPage: PageType;
  config: AutostakerConfig;
  runtime: RuntimeState;
}

export interface AutostakerConfig {
  seedPhrase: string; // TODO: Should be encrypted
  targetAsset: TargetAsset;
  checkIntervalMinutes: number;
  contractExecDelaySeconds: number;
  mnemonicIndex: number;
  coinType: number;
  gasPrice: number;
  lcdUrl: string;
  network: Network;
}

export interface RuntimeState {
  isStakerActive: boolean;
  rewardsToClaim: number;
  totalValueUst: number;
  lastCheckTime: number | null;
  nextCheckTime: number | null;
  error: ErrorInfo | null;
}

export interface ErrorInfo {
  code: string;
  message: string;
  timestamp: number;
  details?: unknown;
}

// Component Props with proper typing
export interface SetupPageProps {
  onComplete: (seedPhrase: string) => void;
}

export interface ConfigPageProps {
  config: AutostakerConfig;
  onConfigUpdate: (updates: Partial<AutostakerConfig>) => void;
  onNavigate: (page: PageType) => void;
}

export interface AutostakerPageProps {
  runtime: RuntimeState;
  config: Pick<AutostakerConfig, 'targetAsset'>;
  onToggleStaker: () => void;
  onNavigate: (page: PageType) => void;
}

// Chrome Extension Message Types
export interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}

export interface RewardsUpdateMessage extends ChromeMessage {
  type: MessageType.UPDATE_REWARDS;
  payload: {
    rewardsToClaim: number;
    totalValueUst: number;
  };
}

export interface ErrorMessage extends ChromeMessage {
  type: MessageType.ERROR;
  payload: ErrorInfo;
}

// Service interfaces
export interface IAutostakerService {
  initialize(config: AutostakerConfig): Promise<void>;
  process(): Promise<void>;
  getRewardsToClaim(): Promise<number>;
  getTotalValueUst(): Promise<number>;
  stop(): void;
}

export interface IStorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getAll(): Promise<Record<string, unknown>>;
}

export interface IMessagingService {
  sendMessage(message: ChromeMessage): void;
  onMessage(handler: (message: ChromeMessage) => void): void;
  offMessage(handler: (message: ChromeMessage) => void): void;
}

// Validation schemas
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConfigValidation {
  validateSeedPhrase(seedPhrase: string): ValidationResult;
  validateCheckInterval(minutes: number): ValidationResult;
  validateGasPrice(price: number): ValidationResult;
  validateLcdUrl(url: string): ValidationResult;
} 