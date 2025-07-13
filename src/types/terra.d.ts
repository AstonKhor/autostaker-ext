/**
 * Type declarations for Terra.js and Mirror Protocol libraries
 * These are simplified type definitions to make the code compile
 */

declare module '@terra-money/terra.js' {
  export class MnemonicKey {
    constructor(options: {
      mnemonic: string;
      index?: number;
      coinType?: number;
    });
    accAddress: string;
  }

  export class LCDClient {
    constructor(config: {
      URL: string;
      chainID: string;
      gasPrices: Coins;
      gasAdjustment: number;
    });
    tx: {
      broadcastSync(tx: any): Promise<any>;
      txInfo(txHash: string): Promise<TxInfo>;
    };
    bank: {
      balance(address: string): Promise<any>;
    };
  }

  export class Wallet {
    constructor(lcd: LCDClient, key: MnemonicKey);
    key: MnemonicKey;
    lcd: LCDClient;
    createAndSignTx(options: {
      msgs: MsgExecuteContract[];
      fee: StdFee;
    }): Promise<any>;
  }

  export class MsgExecuteContract {
    constructor(sender: string, contract: string, execute_msg: any, coins?: Coins);
  }

  export class Int {
    constructor(value: string | number);
    toString(): string;
    toNumber(): number;
    equals(other: Int | number): boolean;
    mul(other: Int): Int;
    sub(other: Int): Int;
    divToInt(divisor: number | Int): Int;
  }

  export class Coin {
    constructor(denom: string, amount: Int | string);
    amount: Int;
    denom: string;
    div(divisor: number): Coin;
    toIntCoin(): Coin;
  }

  export class Coins {
    constructor(coins: { [denom: string]: string | number | Int });
    get(denom: string): Coin | undefined;
  }

  export class StdFee {
    constructor(gas: number, amount: { [denom: string]: number | string });
  }

  export interface TxInfo {
    txhash: string;
    raw_log: string;
    logs: any[];
  }

  export function isTxError(result: any): boolean;
}

declare module '@mirror-protocol/mirror.js' {
  import { MnemonicKey, LCDClient, MsgExecuteContract } from '@terra-money/terra.js';

  export class Mirror {
    constructor(options: {
      key: MnemonicKey;
      lcd: LCDClient;
    });
    
    assets: {
      [symbol: string]: {
        token: {
          contractAddress?: string;
          getBalance(): Promise<{ balance: string }>;
          increaseAllowance(spender: string, amount: string): MsgExecuteContract;
        };
        pair: {
          contractAddress?: string;
          swap(asset: any, swap_params: any): MsgExecuteContract;
          provideLiquidity(assets: any[]): MsgExecuteContract;
          getPool(): Promise<{
            assets: Array<{
              amount: string;
              info: any;
            }>;
          }>;
        };
        lpToken: {
          getBalance(): Promise<{ balance: string }>;
        };
      };
    };

    mirrorToken: {
      getBalance(): Promise<{ balance: string }>;
    };

    staking: {
      withdraw(): MsgExecuteContract;
      bond(asset: string, amount: string, lpToken: any): MsgExecuteContract;
      getRewardInfo(address: string, asset?: string): Promise<{
        reward_infos: Array<{
          pending_reward: string;
        }>;
      }>;
    };
  }
} 