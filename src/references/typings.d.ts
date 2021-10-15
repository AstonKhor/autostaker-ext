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
  stakerOn: boolean,
  rewardsToClaim: number,
}

interface AppProps {}

interface SetupProps {
  changePage: Function,
  updateSeed: Function,
}

interface AutostakerProps {
  stakerOn: boolean,
  toggleStakerOn: Function,
  changePage: Function,
  rewardsToClaim: number,
}

interface ConfigProps {
  lcdUrl: string,
  targetAsset: string,
  seedPhrase: string,
  onSeedUpdate(event: React.FormEvent<HTMLFormElement>): void,
  checkInterval: number,
  contractExecDelay: number,
  mnemonicIndex: number,
  coinType: number,
  gas: number,
}

interface chromeMessage {
  type: string,
}