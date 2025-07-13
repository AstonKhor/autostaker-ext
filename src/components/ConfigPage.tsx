/**
 * Configuration Page Component
 * Allows users to modify Autostaker settings
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ConfigPageProps, PageType, TargetAsset } from '../types';
import { validateConfig } from '../utils/validation';
import './ConfigPage.css';

const ConfigPage: React.FC<ConfigPageProps> = ({ config, onConfigUpdate, onNavigate }) => {
  const [formData, setFormData] = useState(config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  /**
   * Target asset options
   */
  const targetAssetOptions = useMemo(() => [
    { value: TargetAsset.MIR, label: 'MIR' },
    { value: TargetAsset.mMSFT, label: 'mMSFT' },
    { value: TargetAsset.mBTC, label: 'mBTC' },
    { value: TargetAsset.mAAPL, label: 'mAAPL' },
    { value: TargetAsset.mNFLX, label: 'mNFLX' },
    { value: TargetAsset.mAMC, label: 'mAMC' },
    { value: TargetAsset.mETH, label: 'mETH' },
    { value: TargetAsset.mAMZN, label: 'mAMZN' },
    { value: TargetAsset.mGOOGL, label: 'mGOOGL' },
    { value: TargetAsset.mVIXY, label: 'mVIXY' },
    { value: TargetAsset.mQQQ, label: 'mQQQ' },
    { value: TargetAsset.mBABA, label: 'mBABA' },
    { value: TargetAsset.mTSLA, label: 'mTSLA' },
    { value: TargetAsset.mCOIN, label: 'mCOIN' }
  ], []);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setErrors({});

    try {
      // Validate all fields
      const validation = validateConfig({
        seedPhrase: formData.seedPhrase,
        checkInterval: formData.checkIntervalMinutes,
        gasPrice: formData.gasPrice,
        lcdUrl: formData.lcdUrl,
        contractExecDelay: formData.contractExecDelaySeconds
      });

      if (!validation.isValid) {
        // Map errors to field names
        const fieldErrors: Record<string, string> = {};
        validation.errors.forEach(error => {
          if (error.includes('Seed phrase')) fieldErrors.seedPhrase = error;
          else if (error.includes('Check interval')) fieldErrors.checkIntervalMinutes = error;
          else if (error.includes('Gas price')) fieldErrors.gasPrice = error;
          else if (error.includes('LCD URL')) fieldErrors.lcdUrl = error;
          else if (error.includes('Contract execution')) fieldErrors.contractExecDelaySeconds = error;
        });
        
        setErrors(fieldErrors);
        return;
      }

      // Update configuration
      onConfigUpdate(formData);
      
      // Navigate back to main page
      onNavigate(PageType.AUTOSTAKER);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setErrors({ general: 'Failed to save configuration. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  }, [formData, onConfigUpdate, onNavigate]);

  /**
   * Reset form to original values
   */
  const handleReset = useCallback(() => {
    setFormData(config);
    setErrors({});
  }, [config]);

  return (
    <div className="config-page">
      <div className="config-page__header">
        <button 
          className="back-button"
          onClick={() => onNavigate(PageType.AUTOSTAKER)}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="page-title">Configuration</h1>
      </div>

      <form className="config-form" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="form-error-banner" role="alert">
            {errors.general}
          </div>
        )}

        <FormField
          label="Mnemonic Seed Phrase"
          error={errors.seedPhrase}
          required
        >
          <div className="input-with-toggle">
            <input
              type={showSeedPhrase ? 'text' : 'password'}
              value={formData.seedPhrase}
              onChange={(e) => handleInputChange('seedPhrase', e.target.value)}
              placeholder="Enter your 24-word seed phrase"
              className="form-input"
              autoComplete="off"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowSeedPhrase(!showSeedPhrase)}
              aria-label={showSeedPhrase ? 'Hide seed phrase' : 'Show seed phrase'}
            >
              {showSeedPhrase ? '🙈' : '👁️'}
            </button>
          </div>
        </FormField>

        <FormField
          label="Target Asset"
          error={errors.targetAsset}
          required
        >
          <select
            value={formData.targetAsset}
            onChange={(e) => handleInputChange('targetAsset', e.target.value as TargetAsset)}
            className="form-select"
          >
            {targetAssetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Check Interval (Minutes)"
          error={errors.checkIntervalMinutes}
          hint="How often to check for rewards (1-1440)"
          required
        >
          <input
            type="number"
            value={formData.checkIntervalMinutes}
            onChange={(e) => handleInputChange('checkIntervalMinutes', parseInt(e.target.value))}
            min="1"
            max="1440"
            className="form-input"
          />
        </FormField>

        <FormField
          label="Contract Execution Delay (Seconds)"
          error={errors.contractExecDelaySeconds}
          hint="Delay between contract executions (5-300)"
          required
        >
          <input
            type="number"
            value={formData.contractExecDelaySeconds}
            onChange={(e) => handleInputChange('contractExecDelaySeconds', parseInt(e.target.value))}
            min="5"
            max="300"
            className="form-input"
          />
        </FormField>

        <FormField
          label="Mnemonic Index"
          error={errors.mnemonicIndex}
        >
          <input
            type="number"
            value={formData.mnemonicIndex}
            onChange={(e) => handleInputChange('mnemonicIndex', parseInt(e.target.value))}
            min="0"
            className="form-input"
          />
        </FormField>

        <FormField
          label="Coin Type"
          error={errors.coinType}
        >
          <input
            type="number"
            value={formData.coinType}
            onChange={(e) => handleInputChange('coinType', parseInt(e.target.value))}
            className="form-input"
          />
        </FormField>

        <FormField
          label="Gas Price (UST)"
          error={errors.gasPrice}
          hint="Gas price per transaction (0.01-10)"
          required
        >
          <input
            type="number"
            value={formData.gasPrice}
            onChange={(e) => handleInputChange('gasPrice', parseFloat(e.target.value))}
            min="0.01"
            max="10"
            step="0.01"
            className="form-input"
          />
        </FormField>

        <FormField
          label="LCD URL"
          error={errors.lcdUrl}
          hint="Terra LCD endpoint URL"
          required
        >
          <input
            type="url"
            value={formData.lcdUrl}
            onChange={(e) => handleInputChange('lcdUrl', e.target.value)}
            placeholder="https://lcd.terra.dev"
            className="form-input"
          />
        </FormField>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="button button--secondary"
            disabled={isSaving}
          >
            Reset
          </button>
          
          <button
            type="submit"
            className="button button--primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Form Field Component
 */
interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  hint, 
  required = false, 
  children 
}) => {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label className="form-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <div className="form-hint">{hint}</div>
      )}
      
      {error && (
        <div className="form-error" role="alert">{error}</div>
      )}
    </div>
  );
};

export default ConfigPage;