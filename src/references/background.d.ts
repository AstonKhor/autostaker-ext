import AutoStaker from "../AutoStaker";

interface config {
  [index: string]: any,
  seedPhrase: string,
  targetAsset: string,
  checkInterval: number,
  contractExecDelay: number,
  mnemonicIndex: number,
  coinType: number,
  gas: number,
  lcdUrl: string,
}

interface state {
  autoStaker: AutoStaker | undefined,
  currentStakerProcess: Function | undefined,
  currentStakerProcessId: Object | undefined,
}