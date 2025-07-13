/**
 * Background Script
 * Manages the autostaker service in the Chrome extension background
 */

import { 
  AutoStakerService, 
  StorageService, 
  getMessagingService, 
  createLogger 
} from './services';
import { 
  AutostakerConfig, 
  MessageType, 
  ChromeMessage, 
  RewardsUpdateMessage,
  ErrorMessage,
  Network,
  TargetAsset
} from './types';
import { STORAGE_KEYS } from './constants';
import { normalizeError } from './errors';

// Initialize logger
const logger = createLogger('Background');

// Service instances
const autoStakerService = new AutoStakerService();
const storageService = new StorageService('local');
const messagingService = getMessagingService();

// Background state
interface BackgroundState {
  isReady: boolean;
  config: AutostakerConfig | null;
  stakerIntervalId: number | null;
  isProcessing: boolean;
  lastError: Error | null;
  retryCount: number;
  maxRetries: number;
}

const state: BackgroundState = {
  isReady: false,
  config: null,
  stakerIntervalId: null,
  isProcessing: false,
  lastError: null,
  retryCount: 0,
  maxRetries: 3
};

/**
 * Initialize background script
 */
async function initialize(): Promise<void> {
  try {
    logger.info('Initializing background script');
    
    // Load saved configuration
    await loadConfiguration();
    
    // Setup listeners
    setupStorageListener();
    setupMessageListener();
    
    // Mark as ready
    state.isReady = true;
    logger.info('Background script initialized successfully');
    
    // Check if autostaker should be running
    const runtime = await storageService.get<{ isStakerActive: boolean }>(STORAGE_KEYS.runtime);
    if (runtime?.isStakerActive && state.config) {
      logger.info('Resuming autostaker from previous session');
      await startAutoStaker();
    }
  } catch (error) {
    logger.fatal('Failed to initialize background script', error);
    state.lastError = normalizeError(error);
  }
}

/**
 * Load configuration from storage
 */
async function loadConfiguration(): Promise<void> {
  try {
    const config = await storageService.get<AutostakerConfig>(STORAGE_KEYS.config);
    
    if (config) {
      state.config = config;
      logger.info('Configuration loaded from storage');
    } else {
      logger.warn('No configuration found in storage, using default');
    }
  } catch (error) {
    logger.error('Failed to load configuration from storage', error);
    throw error;
  }
}

/**
 * Setup storage change listener
 */
function setupStorageListener(): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    
    // Handle config changes
    if (changes[STORAGE_KEYS.config]) {
      const newConfig = changes[STORAGE_KEYS.config].newValue as AutostakerConfig;
      const oldConfig = changes[STORAGE_KEYS.config].oldValue as AutostakerConfig;
      
      // Update local config
      state.config = newConfig;
      
      // Restart autostaker if config changed while active
      if (state.stakerIntervalId !== null && oldConfig && newConfig) {
        logger.info('Configuration changed, restarting autostaker...');
        stopAutoStaker();
        startAutoStaker();
      }
    }
  });
}

/**
 * Setup message listener
 */
function setupMessageListener(): void {
  messagingService.onMessage(async (message: ChromeMessage) => {
    logger.debug(`Received message: ${message.type}`);
    
    try {
      switch (message.type) {
        case MessageType.AUTOSTAKER_ON:
          await handleStartAutoStaker();
          break;
          
        case MessageType.AUTOSTAKER_OFF:
          await handleStopAutoStaker();
          break;
          
        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling message', error);
      sendErrorMessage(error as Error);
    }
  });
}

/**
 * Handle start autostaker message
 */
async function handleStartAutoStaker(): Promise<void> {
  if (!state.config) {
    throw new Error('No configuration available');
  }
  
  if (state.stakerIntervalId !== null) {
    logger.info('Autostaker already running');
    return;
  }
  
  await startAutoStaker();
}

/**
 * Handle stop autostaker message
 */
async function handleStopAutoStaker(): Promise<void> {
  if (state.stakerIntervalId === null) {
    logger.info('Autostaker not running');
    return;
  }
  
  stopAutoStaker();
}

/**
 * Start the autostaker process
 */
async function startAutoStaker(): Promise<void> {
  if (!state.config) {
    throw new Error('Cannot start autostaker without configuration');
  }
  
  try {
    logger.info('Starting autostaker...');
    
    // Initialize the autostaker service
    await autoStakerService.initialize(state.config);
    
    // Run immediately
    await runStakerProcess();
    
    // Schedule periodic runs
    const intervalMs = state.config.checkIntervalMinutes * 60 * 1000;
    state.stakerIntervalId = setInterval(runStakerProcess, intervalMs) as unknown as number;
    
    logger.info(`Autostaker started (interval: ${state.config.checkIntervalMinutes} minutes)`);
  } catch (error) {
    logger.error('Failed to start autostaker', error);
    state.lastError = normalizeError(error);
    sendErrorMessage(error as Error);
    throw error;
  }
}

/**
 * Stop the autostaker process
 */
function stopAutoStaker(): void {
  logger.info('Stopping autostaker...');
  
  if (state.stakerIntervalId !== null) {
    clearInterval(state.stakerIntervalId);
    state.stakerIntervalId = null;
  }
  
  autoStakerService.stop();
  state.isProcessing = false;
  
  logger.info('Autostaker stopped');
}

/**
 * Run the staker process
 */
async function runStakerProcess(): Promise<void> {
  if (state.isProcessing) {
    logger.info('Staker process already running, skipping...');
    return;
  }
  
  state.isProcessing = true;
  
  try {
    logger.info('Running staker process...');
    
    // Get current rewards before processing
    const rewardsBefore = await autoStakerService.getRewardsToClaim();
    
    // Process staking
    await autoStakerService.process();
    
    // Get rewards after processing
    const rewardsAfter = await autoStakerService.getRewardsToClaim();
    const totalValue = await autoStakerService.getTotalValueUst();
    
    // Send update to popup
    sendRewardsUpdate(rewardsAfter, totalValue);
    
    // Update runtime state in storage
    await updateRuntimeState({
      lastCheckTime: Date.now(),
      nextCheckTime: Date.now() + (state.config!.checkIntervalMinutes * 60 * 1000),
      error: null
    });
    
    logger.info('Staker process completed successfully');
    logger.info(`Rewards: ${rewardsBefore} -> ${rewardsAfter}`);
  } catch (error) {
    logger.error('Staker process failed', error);
    state.lastError = normalizeError(error);
    
    // Send error to popup
    sendErrorMessage(error as Error);
    
    // Update runtime state with error
    await updateRuntimeState({
      error: {
        code: 'STAKER_PROCESS_ERROR',
        message: (error as Error).message,
        timestamp: Date.now(),
        details: error
      }
    });
  } finally {
    state.isProcessing = false;
  }
}

/**
 * Send rewards update message
 */
function sendRewardsUpdate(rewardsToClaim: number, totalValueUst: number): void {
  const message: RewardsUpdateMessage = {
    type: MessageType.UPDATE_REWARDS,
    payload: {
      rewardsToClaim,
      totalValueUst
    }
  };
  
  messagingService.sendMessage(message);
}

/**
 * Send error message
 */
function sendErrorMessage(error: Error): void {
  const message: ErrorMessage = {
    type: MessageType.ERROR,
    payload: {
      code: 'BACKGROUND_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: error
    }
  };
  
  messagingService.sendMessage(message);
}

/**
 * Update runtime state in storage
 */
async function updateRuntimeState(updates: Record<string, unknown>): Promise<void> {
  try {
    const currentRuntime = await storageService.get<Record<string, unknown>>(STORAGE_KEYS.runtime) || {};
    const newRuntime = { ...currentRuntime, ...updates };
    await storageService.set(STORAGE_KEYS.runtime, newRuntime);
  } catch (error) {
    logger.error('Failed to update runtime state', error);
  }
}

/**
 * Handle extension startup
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] Extension started');
  initialize();
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default configuration for new installation
    const defaultConfig: AutostakerConfig = {
      seedPhrase: '',
      targetAsset: TargetAsset.mETH,
      checkIntervalMinutes: 60,
      contractExecDelaySeconds: 15,
      mnemonicIndex: 0,
      coinType: 330,
      gasPrice: 0.30,
      lcdUrl: 'https://lcd.terra.dev',
      network: Network.MAINNET
    };
    
    storageService.set(STORAGE_KEYS.config, defaultConfig);
  }
  
  initialize();
});

// Initialize on script load
initialize();
