/// <reference path="references/chrome.d.ts"/>
/// <reference path="references/background.d.ts"/>
/// <reference path="references/typings.d.ts"/>
import AutoStaker from './AutoStaker';
import hotReload from './hotReload.js';
hotReload();

const config = {
  seedPhrase: 'fatigue impulse fish father twist toe quit heart alcohol fresh eternal orphan orphan yard private front wall lawn toss fame despair hollow pumpkin fiscal',
  targetAsset: 'MIR',
  checkInterval: 60,
  contractExecDelay: 15,
  mnemonicIndex: 0,
  coinType: 330,
  gas: 0.15,
  lcdUrl: 'https://lcd.terra.dev',
}
const state = {
  autoStaker: undefined,
  currentStakerProcess: undefined,
  currentStakerProcessId: undefined,
}

function init() {
  setupLocalState();
  setupStorageListeners();
  setupMessageListeners();
  // startAutoStakerProcess();
}

function setupLocalState() {
  chrome.storage.local.get(null, (storage) => {
    for (let key in storage) {
      if (config[key]) config[key] = storage[key];
    }
  });
}

function setupStorageListeners() {
  chrome.storage.onChanged.addListener(function (changes: Object) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (config.hasOwnProperty(key)) {
        config[key] = newValue;
      }
    }
  });
}

function setupMessageListeners() {
  chrome.runtime.onMessage.addListener(function (message: Object) {
    console.log(message);
  });
}

function startAutoStakerProcess() {
  if (state.currentStakerProcess) return;
  state.autoStaker = new AutoStaker(config);
  state.currentStakerProcess = () => {
    state.autoStaker.process();
  }
  state.currentStakerProcessId = setInterval(state.currentStakerProcess, config.checkInterval * 1000 * 60 );
  state.currentStakerProcess();
}

function clearAutoStakerProcess() {
  if (!state.currentStakerProcess) return;
  clearInterval(state.currentStakerProcessId);
  state.currentStakerProcess = undefined;
  state.currentStakerProcessId = undefined;
}

init();
