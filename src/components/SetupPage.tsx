/**
 * Setup Page Component
 * Handles initial seed phrase configuration for the Autostaker extension
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SetupPageProps } from '../types';
import { validateSeedPhrase } from '../utils/validation';
import './SetupPage.css';

const SetupPage: React.FC<SetupPageProps> = ({ onComplete }) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Handle seed phrase input change
   */
  const handleSeedPhraseChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSeedPhrase(value);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  }, [validationError]);

  /**
   * Validate and submit seed phrase
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate seed phrase
      const validation = validateSeedPhrase(seedPhrase);
      
      if (!validation.isValid) {
        setValidationError(validation.errors[0]);
        return;
      }

      // Simulate async validation (e.g., checking if seed phrase is valid on blockchain)
      await new Promise(resolve => setTimeout(resolve, 500));

      // If validation passes, complete setup
      onComplete(seedPhrase.trim());
    } catch (error) {
      setValidationError('An unexpected error occurred. Please try again.');
      console.error('Setup error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [seedPhrase, onComplete]);

  /**
   * Toggle seed phrase visibility
   */
  const toggleSeedPhraseVisibility = useCallback(() => {
    setShowSeedPhrase(prev => !prev);
  }, []);

  /**
   * Handle paste event to clean up seed phrase
   */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanedText = pastedText.trim().replace(/\s+/g, ' ');
    setSeedPhrase(cleanedText);
  }, []);

  return (
    <div className="setup-page">
      <div className="setup-page__content">
        <div className="setup-page__logo" />
        
        <h1 className="setup-page__title">
          Welcome to Autostaker
        </h1>
        
        <p className="setup-page__subtitle">
          Automated yield farming for Terra ecosystem
        </p>

        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="seed-phrase" className="form-label">
              Enter your seed phrase
            </label>
            
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                id="seed-phrase"
                className={`form-textarea ${validationError ? 'error' : ''}`}
                value={seedPhrase}
                onChange={handleSeedPhraseChange}
                onPaste={handlePaste}
                placeholder="Enter your 24-word seed phrase"
                rows={4}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={isValidating}
                style={{ 
                  fontFamily: 'monospace',
                  WebkitTextSecurity: showSeedPhrase ? 'none' : 'disc'
                } as React.CSSProperties}
              />
              
              <button
                type="button"
                className="visibility-toggle"
                onClick={toggleSeedPhraseVisibility}
                aria-label={showSeedPhrase ? 'Hide seed phrase' : 'Show seed phrase'}
              >
                {showSeedPhrase ? '🙈' : '👁️'}
              </button>
            </div>

            {validationError && (
              <div className="form-error" role="alert">
                {validationError}
              </div>
            )}

            <div className="form-hint">
              Your seed phrase is stored locally and used to sign transactions.
              It is never sent to any server.
            </div>
          </div>

          <button
            type="submit"
            className="form-submit"
            disabled={isValidating || !seedPhrase.trim()}
          >
            {isValidating ? (
              <>
                <span className="spinner" />
                Validating...
              </>
            ) : (
              'Unlock Wallet'
            )}
          </button>
        </form>

        <div className="setup-page__footer">
          <p className="footer-text">
            This project is{' '}
            <a 
              href="https://github.com/autostaker/autostaker-ext" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link"
            >
              open source
            </a>
          </p>
          
          <p className="footer-text">
            Need help?{' '}
            <a 
              href="https://docs.autostaker.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link"
            >
              View Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;


