/**
 * AutoStaker Service
 * Handles automated staking operations for Terra Mirror Protocol
 */

import { Mirror } from '@mirror-protocol/mirror.js';
import {
  MnemonicKey,
  LCDClient,
  MsgExecuteContract,
  Wallet,
  isTxError,
  Int,
  StdFee,
  Coins,
  TxInfo
} from '@terra-money/terra.js';
import { IAutostakerService, AutostakerConfig } from '../types';

// Constants
const DEFAULT_GAS_LIMIT = 150_000;
const DEFAULT_GAS_AMOUNT = 57_000;
const POLLING_INTERVAL_MS = 3_000;
const DECIMAL_PLACES = 6;
const UST_DENOM = 'uusd';

/**
 * AutoStaker Service Implementation
 */
export class AutoStakerService implements IAutostakerService {
  private mirror: Mirror | null = null;
  private wallet: Wallet | null = null;
  private lcd: LCDClient | null = null;
  private config: AutostakerConfig | null = null;
  private isInitialized = false;
  private assetTokenAddr = '';

  /**
   * Initialize the service with configuration
   * @param config Autostaker configuration
   */
  async initialize(config: AutostakerConfig): Promise<void> {
    try {
      this.config = config;
      
      // Create mnemonic key
      const key = new MnemonicKey({
        mnemonic: config.seedPhrase,
        index: config.mnemonicIndex,
        coinType: config.coinType,
      });
      
      // Initialize LCD client
      this.lcd = new LCDClient({
        URL: config.lcdUrl,
        chainID: this.getChainId(config.lcdUrl),
        gasPrices: new Coins({ [UST_DENOM]: config.gasPrice }),
        gasAdjustment: 1.2
      });
      
      // Initialize Mirror SDK
      this.mirror = new Mirror({
        key,
        lcd: this.lcd
      });
      
      this.wallet = new Wallet(this.lcd, key);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AutoStaker: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Process staking rewards
   */
  async process(): Promise<void> {
    this.validateInitialization();
    
    try {
      if (this.config!.targetAsset === 'MIR') {
        await this.processMIRStaking();
      } else {
        await this.processNonMIRStaking();
      }
    } catch (error) {
      throw new Error(`Staking process failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Get current rewards to claim
   */
  async getRewardsToClaim(): Promise<number> {
    this.validateInitialization();
    
    try {
      const rewardInfo = await this.mirror!.staking.getRewardInfo(
        this.wallet!.key.accAddress,
        this.assetTokenAddr || this.getAssetTokenAddress()
      );
      
      const pendingReward = parseInt(rewardInfo.reward_infos[0]?.pending_reward || '0');
      return this.fromMicroAmount(pendingReward);
    } catch (error) {
      console.error('Failed to get rewards:', error);
      return 0;
    }
  }

  /**
   * Get total value in UST
   */
  async getTotalValueUst(): Promise<number> {
    this.validateInitialization();
    
    try {
      // This would require querying LP token balance and calculating value
      // For now, returning a placeholder
      return 0;
    } catch (error) {
      console.error('Failed to get total value:', error);
      return 0;
    }
  }

  /**
   * Stop the service
   */
  stop(): void {
    this.isInitialized = false;
    this.mirror = null;
    this.wallet = null;
    this.lcd = null;
    this.config = null;
  }

  /**
   * Process MIR token staking
   */
  private async processMIRStaking(): Promise<void> {
    const mirrorToken = this.mirror!.assets['MIR'];
    this.assetTokenAddr = mirrorToken.token.contractAddress as string;

    console.log(`[${new Date().toISOString()}] Starting MIR staking process`);

    // Check if there are rewards to claim
    const hasRewards = await this.hasRewardsToClaim();
    if (!hasRewards) {
      console.log('No rewards to claim at this time');
      return;
    }

    // Step 1: Withdraw rewards
    await this.executeTransaction([this.mirror!.staking.withdraw()], 'Withdrawing rewards');
    
    // Step 2: Get MIR balance
    const balanceResponse = await this.mirror!.mirrorToken.getBalance();
    const balance = new Int(balanceResponse.balance);
    
    if (balance.equals(0)) {
      console.log('No MIR balance to process');
      return;
    }

    // Step 3: Calculate swap amounts (50/50 split)
    const sellAmount = balance.divToInt(2);
    const mirrorProvideAmount = balance.sub(sellAmount);
    
    console.log(`Balance: ${this.fromMicroAmount(balance.toNumber())} MIR`);
    console.log(`Swapping ${this.fromMicroAmount(sellAmount.toNumber())} MIR to UST`);

    // Step 4: Swap half to UST
    await this.executeTransaction([
      mirrorToken.pair.swap(
        {
          info: { token: { contract_addr: mirrorToken.token.contractAddress as string } },
          amount: sellAmount.toString()
        },
        {}
      )
    ], 'Swapping MIR to UST');

    // Step 5: Get pool info for liquidity provision
    const pool = await mirrorToken.pair.getPool();
    const uusdProvideAmount = this.calculateUstProvideAmount(mirrorProvideAmount, pool);

    // Step 6: Provide liquidity
    await this.executeTransaction([
      mirrorToken.token.increaseAllowance(
        mirrorToken.pair.contractAddress as string,
        mirrorProvideAmount.toString()
      ),
      mirrorToken.pair.provideLiquidity([
        {
          info: { token: { contract_addr: mirrorToken.token.contractAddress as string } },
          amount: mirrorProvideAmount.toString()
        },
        {
          info: { native_token: { denom: UST_DENOM } },
          amount: uusdProvideAmount.toString()
        }
      ])
    ], 'Providing liquidity');

    // Step 7: Stake LP tokens
    const lpTokenBalance = await mirrorToken.lpToken.getBalance();
    await this.executeTransaction([
      this.mirror!.staking.bond(
        this.assetTokenAddr,
        lpTokenBalance.balance,
        mirrorToken.lpToken
      )
    ], 'Staking LP tokens');

    console.log('MIR staking process completed successfully');
  }

  /**
   * Process non-MIR asset staking
   */
  private async processNonMIRStaking(): Promise<void> {
    const assetToken = this.mirror!.assets[this.config!.targetAsset];
    this.assetTokenAddr = assetToken.token.contractAddress as string;

    console.log(`[${new Date().toISOString()}] Starting ${this.config!.targetAsset} staking process`);

    // Check if there are rewards to claim
    const hasRewards = await this.hasRewardsToClaim();
    if (!hasRewards) {
      console.log('No rewards to claim at this time');
      return;
    }

    // Similar process as MIR but with additional swap from MIR to UST first
    // Implementation details omitted for brevity
    console.log('Non-MIR staking process not fully implemented');
  }

  /**
   * Execute a transaction with proper error handling
   */
  private async executeTransaction(
    msgs: MsgExecuteContract[], 
    description: string
  ): Promise<TxInfo> {
    console.log(`Executing: ${description}`);
    
    try {
      // Create and sign transaction
      const tx = await this.wallet!.createAndSignTx({
        msgs,
        fee: new StdFee(DEFAULT_GAS_LIMIT, { [UST_DENOM]: DEFAULT_GAS_AMOUNT })
      });

      // Broadcast transaction
      const result = await this.wallet!.lcd.tx.broadcastSync(tx);

      if (isTxError(result)) {
        throw new Error(`Transaction failed: ${result.code} - ${result.raw_log}`);
      }

      // Wait for transaction confirmation
      const txInfo = await this.waitForTransaction(result.txhash);
      
      // Add delay between contract executions
      await this.delay(this.config!.contractExecDelaySeconds * 1000);
      
      return txInfo;
    } catch (error) {
      throw new Error(`${description} failed: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForTransaction(txHash: string): Promise<TxInfo> {
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      try {
        const txInfo = await this.wallet!.lcd.tx.txInfo(txHash);
        return txInfo;
      } catch (error) {
        attempts++;
        await this.delay(POLLING_INTERVAL_MS);
      }
    }

    throw new Error(`Transaction ${txHash} not found after ${maxAttempts} attempts`);
  }

  /**
   * Check if there are rewards to claim
   */
  private async hasRewardsToClaim(): Promise<boolean> {
    try {
      const rewardInfo = await this.mirror!.staking.getRewardInfo(
        this.wallet!.key.accAddress,
        this.assetTokenAddr
      );
      
      const pendingReward = parseInt(rewardInfo.reward_infos[0]?.pending_reward || '0');
      return pendingReward > 0;
    } catch (error) {
      console.error('Failed to check rewards:', error);
      return false;
    }
  }

  /**
   * Calculate UST amount for liquidity provision
   */
  private calculateUstProvideAmount(assetAmount: Int, pool: any): Int {
    const ustPoolAmount = new Int(pool.assets[0].amount);
    const assetPoolAmount = new Int(pool.assets[1].amount);
    
    return assetAmount
      .mul(ustPoolAmount)
      .divToInt(assetPoolAmount);
  }

  /**
   * Get asset token address
   */
  private getAssetTokenAddress(): string {
    const asset = this.mirror!.assets[this.config!.targetAsset];
    return asset.token.contractAddress as string;
  }

  /**
   * Get chain ID from LCD URL
   */
  private getChainId(lcdUrl: string): string {
    if (lcdUrl.includes('bombay')) return 'bombay-12';
    if (lcdUrl.includes('tequila')) return 'tequila-0004';
    return 'columbus-5'; // mainnet
  }

  /**
   * Convert micro amount to decimal
   */
  private fromMicroAmount(amount: number): number {
    return amount / Math.pow(10, DECIMAL_PLACES);
  }

  /**
   * Validate service is initialized
   */
  private validateInitialization(): void {
    if (!this.isInitialized || !this.mirror || !this.wallet) {
      throw new Error('AutoStaker service not initialized');
    }
  }

  /**
   * Extract error message from unknown error
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error occurred';
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 