/**
 * Autostaker Page Component
 * Main dashboard showing staking status and rewards information
 */

import React, { useMemo } from 'react';
import { AutostakerPageProps, PageType } from '../types';
import './AutostakerPage.css';

const AutostakerPage: React.FC<AutostakerPageProps> = ({ 
  runtime, 
  config, 
  onToggleStaker, 
  onNavigate 
}) => {
  /**
   * Format rewards display
   */
  const formattedRewards = useMemo(() => {
    const integerPart = Math.floor(runtime.rewardsToClaim);
    const decimalPart = (runtime.rewardsToClaim % 1).toFixed(6).substring(2);
    return { integerPart, decimalPart };
  }, [runtime.rewardsToClaim]);

  /**
   * Format total value display
   */
  const formattedTotalValue = useMemo(() => {
    const integerPart = Math.floor(runtime.totalValueUst);
    const decimalPart = (runtime.totalValueUst % 1).toFixed(2).substring(2);
    return { integerPart, decimalPart };
  }, [runtime.totalValueUst]);

  /**
   * Get status text
   */
  const statusText = useMemo(() => {
    if (runtime.error) {
      return `Error: ${runtime.error.message}`;
    }
    if (runtime.isStakerActive) {
      return runtime.nextCheckTime 
        ? `Next check: ${new Date(runtime.nextCheckTime).toLocaleTimeString()}`
        : 'Active';
    }
    return 'Inactive';
  }, [runtime.isStakerActive, runtime.nextCheckTime, runtime.error]);

  return (
    <div className="autostaker-page">
      <div className="autostaker-page__header">
        <h1 className="page-title">Staking Status</h1>
        
        <button
          className="settings-button"
          onClick={() => onNavigate(PageType.CONFIG)}
          aria-label="Open settings"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      <div className="autostaker-page__content">
        <div className="power-control">
          <label className="power-switch">
            <input 
              type="checkbox" 
              checked={runtime.isStakerActive} 
              onChange={onToggleStaker}
              aria-label={runtime.isStakerActive ? 'Turn off autostaker' : 'Turn on autostaker'}
            />
            <span className="power-switch__slider">
              <span className="power-switch__icon">
                {runtime.isStakerActive ? '🟢' : '🔴'}
              </span>
            </span>
          </label>
          
          <div className="status-text" role="status">
            {statusText}
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Claimable Rewards"
            value={formattedRewards.integerPart}
            decimal={formattedRewards.decimalPart}
            suffix={config.targetAsset}
            highlight={runtime.rewardsToClaim > 0}
          />
          
          <StatCard
            title="Total Value (UST)"
            value={formattedTotalValue.integerPart}
            decimal={formattedTotalValue.decimalPart}
            suffix="UST"
          />
        </div>

        {runtime.error && (
          <div className="error-banner" role="alert">
            <strong>Error:</strong> {runtime.error.message}
            <br />
            <small>
              {new Date(runtime.error.timestamp).toLocaleString()}
            </small>
          </div>
        )}

        {runtime.lastCheckTime && (
          <div className="last-check-info">
            Last checked: {new Date(runtime.lastCheckTime).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
interface StatCardProps {
  title: string;
  value: number;
  decimal: string;
  suffix: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  decimal, 
  suffix, 
  highlight = false 
}) => {
  return (
    <div className={`stat-card ${highlight ? 'stat-card--highlight' : ''}`}>
      <h3 className="stat-card__title">{title}</h3>
      <div className="stat-card__value">
        <span className="value-integer">{value.toLocaleString()}</span>
        {decimal && decimal !== '00' && (
          <span className="value-decimal">.{decimal}</span>
        )}
        <span className="value-suffix">{suffix}</span>
      </div>
    </div>
  );
};

export default AutostakerPage;


