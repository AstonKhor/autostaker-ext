interface MyState {
  page: string,
  seedPhrase: string,
  targetAsset: string,
  checkInterval: number,
  contractExecDelay: number,
  mnemonicIndex: number,
  coinType: number,
  gas: number,
  lcdUrl: string,
}

interface AppProps {}

interface SetupProps {
  changePage: Function;
}

interface AutostakerProps {
  // lcdUrl: string;
  // targetAsset: string;
  // seedPhrase: string;
  // onSeedUpdate(event: React.FormEvent<HTMLFormElement>): void;
  // checkInterval: number;
  // contractExecDelay: number;
  // mnemonicIndex: number;
  // coinType: number;
  // gas: number;
}

interface ConfigProps {
  lcdUrl: string;
  targetAsset: string;
  seedPhrase: string;
  onSeedUpdate(event: React.FormEvent<HTMLFormElement>): void;
  checkInterval: number;
  contractExecDelay: number;
  mnemonicIndex: number;
  coinType: number;
  gas: number;
}