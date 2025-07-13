/**
 * Main Application Component
 * Manages the overall state and navigation of the Autostaker extension
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SetupPage, ConfigPage, AutostakerPage } from './components';
import { 
  AppState, 
  PageType, 
  TargetAsset, 
  Network, 
  MessageType, 
  ChromeMessage, 
  AutostakerConfig 
} from './types';
import { 
  StorageService, 
  getMessagingService, 
  logger 
} from './services';
import { useErrorBoundary } from './hooks';
import { STORAGE_KEYS } from './constants';
import './App.css';

// Default configuration values
const DEFAULT_CONFIG: AutostakerConfig = {
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

// Default runtime state
const DEFAULT_RUNTIME = {
  isStakerActive: false,
  rewardsToClaim: 0,
  totalValueUst: 0,
  lastCheckTime: null,
  nextCheckTime: null,
  error: null
};

// Initialize logger for this module
const log = logger.child('App');

/**
 * Main Application Component
 */
const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: PageType.SETUP,
    config: DEFAULT_CONFIG,
    runtime: DEFAULT_RUNTIME
  });

  const [isLoading, setIsLoading] = useState(true);
  const { error, resetError } = useErrorBoundary();

  const storageService = useMemo(() => new StorageService('local'), []);
  const messagingService = useMemo(() => getMessagingService(), []);

  /**
   * Load saved state from storage
   */
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        log.debug('Loading saved state from storage');
        
        const [savedConfig, savedRuntime, savedPage] = await Promise.all([
          storageService.get<AutostakerConfig>(STORAGE_KEYS.config),
          storageService.get<typeof DEFAULT_RUNTIME>(STORAGE_KEYS.runtime),
          storageService.get<PageType>(STORAGE_KEYS.currentPage)
        ]);

        setAppState((prevState: AppState) => {
          const newState = {
            ...prevState,
            config: savedConfig ? { ...DEFAULT_CONFIG, ...savedConfig } : DEFAULT_CONFIG,
            runtime: savedRuntime ? { ...DEFAULT_RUNTIME, ...savedRuntime } : DEFAULT_RUNTIME,
            currentPage: savedConfig?.seedPhrase ? (savedPage || PageType.AUTOSTAKER) : PageType.SETUP
          };
          
          log.info('State loaded successfully', { 
            hasConfig: !!savedConfig, 
            currentPage: newState.currentPage 
          });
          
          return newState;
        });
      } catch (error) {
        log.error('Failed to load saved state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedState();
  }, [storageService]);

  /**
   * Save state to storage whenever it changes
   */
  useEffect(() => {
    if (isLoading) return;

    const saveState = async () => {
      try {
        await Promise.all([
          storageService.set(STORAGE_KEYS.config, appState.config),
          storageService.set(STORAGE_KEYS.runtime, appState.runtime),
          storageService.set(STORAGE_KEYS.currentPage, appState.currentPage)
        ]);
        
        log.debug('State saved to storage');
      } catch (error) {
        log.error('Failed to save state', error);
      }
    };

    saveState();
  }, [appState, storageService, isLoading]);

  /**
   * Listen for messages from background script
   */
  useEffect(() => {
    const handleMessage = (message: ChromeMessage) => {
      log.debug('Received message from background', { type: message.type });
      
      switch (message.type) {
        case MessageType.UPDATE_REWARDS:
          if ('payload' in message && typeof message.payload === 'object') {
            const payload = message.payload as { rewardsToClaim: number; totalValueUst: number };
            setAppState((prev: AppState) => ({
              ...prev,
              runtime: {
                ...prev.runtime,
                rewardsToClaim: payload.rewardsToClaim,
                totalValueUst: payload.totalValueUst
              }
            }));
            
            log.info('Rewards updated', payload);
          }
          break;

        case MessageType.ERROR:
          if ('payload' in message) {
            const errorPayload = message.payload as any;
            setAppState((prev: AppState) => ({
              ...prev,
              runtime: {
                ...prev.runtime,
                error: errorPayload
              }
            }));
            
            log.error('Error received from background', errorPayload);
          }
          break;
          
        default:
          log.warn('Unknown message type received', { type: message.type });
      }
    };

    messagingService.onMessage(handleMessage);
    return () => messagingService.offMessage(handleMessage);
  }, [messagingService]);

  /**
   * Handle seed phrase setup completion
   */
  const handleSetupComplete = useCallback((seedPhrase: string) => {
    log.info('Setup completed');
    
    setAppState((prev: AppState) => ({
      ...prev,
      config: { ...prev.config, seedPhrase },
      currentPage: PageType.AUTOSTAKER
    }));
  }, []);

  /**
   * Handle configuration updates
   */
  const handleConfigUpdate = useCallback((updates: Partial<AutostakerConfig>) => {
    log.info('Configuration updated', updates);
    
    setAppState((prev: AppState) => ({
      ...prev,
      config: { ...prev.config, ...updates } as AutostakerConfig
    }));
  }, []);

  /**
   * Handle page navigation
   */
  const handleNavigate = useCallback((page: PageType) => {
    log.debug('Navigating to page', { page });
    
    setAppState((prev: AppState) => ({ ...prev, currentPage: page }));
    if (error) resetError();
  }, [error, resetError]);

  /**
   * Toggle autostaker on/off
   */
  const handleToggleStaker = useCallback(() => {
    const newState = !appState.runtime.isStakerActive;
    
    log.info(`Autostaker ${newState ? 'started' : 'stopped'}`);
    
    setAppState((prev: AppState) => ({
      ...prev,
      runtime: {
        ...prev.runtime,
        isStakerActive: newState,
        lastCheckTime: newState ? Date.now() : prev.runtime.lastCheckTime,
        nextCheckTime: newState 
          ? Date.now() + (prev.config.checkIntervalMinutes * 60 * 1000)
          : null
      }
    }));

    // Send message to background script
    messagingService.sendMessage({
      type: newState ? MessageType.AUTOSTAKER_ON : MessageType.AUTOSTAKER_OFF
    });
  }, [appState.runtime.isStakerActive, messagingService]);

  // Show loading state
  if (isLoading) {
    return (
      <div id="app" className="app app--loading">
        <div className="app__spinner" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div id="app" className="app app--error">
        <div className="app__error-container">
          <h2 className="app__error-title">Something went wrong</h2>
          <p className="app__error-message">{error.message}</p>
          <button className="app__error-button" onClick={resetError}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app" className="app">
      <Header 
        currentNetwork={appState.config.network}
        onNavigateHome={() => handleNavigate(PageType.AUTOSTAKER)}
      />
      
      <main className="app__content">
        {appState.currentPage === PageType.SETUP && (
          <SetupPage onComplete={handleSetupComplete} />
        )}
        
        {appState.currentPage === PageType.CONFIG && (
          <ConfigPage
            config={appState.config}
            onConfigUpdate={handleConfigUpdate}
            onNavigate={handleNavigate}
          />
        )}
        
        {appState.currentPage === PageType.AUTOSTAKER && (
          <AutostakerPage
            runtime={appState.runtime}
            config={{ targetAsset: appState.config.targetAsset }}
            onToggleStaker={handleToggleStaker}
            onNavigate={handleNavigate}
          />
        )}
      </main>
    </div>
  );
};

/**
 * Header Component
 */
interface HeaderProps {
  currentNetwork: Network;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentNetwork, onNavigateHome }) => {
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  const networkOptions = [
    { value: Network.MAINNET, label: 'Mainnet' },
    { value: Network.TESTNET, label: 'Testnet' },
    { value: Network.BOMBAY, label: 'Bombay' },
    { value: Network.LOCALTERRA, label: 'Localterra' }
  ];

  return (
    <header className="header">
      <div className="header__logo" onClick={onNavigateHome}>
        <div className="header__icon" />
      </div>
      
      <div className="header__network-selector">
        <span className="header__network-indicator" />
        <button 
          className="header__network-toggle"
          onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
          aria-label="Select network"
          aria-expanded={isNetworkDropdownOpen}
        >
          {networkOptions.find(n => n.value === currentNetwork)?.label || 'Select Network'}
        </button>
        
        {isNetworkDropdownOpen && (
          <div className="header__network-dropdown">
            {networkOptions.map(option => (
              <button
                key={option.value}
                className={`header__network-option ${
                  option.value === currentNetwork ? 'header__network-option--active' : ''
                }`}
                onClick={() => {
                  log.info('Network selection changed', { network: option.value });
                  // Network switching would be implemented here
                  setIsNetworkDropdownOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default App;