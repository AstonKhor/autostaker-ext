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
  gas: 0.30,
  lcdUrl: 'https://lcd.terra.dev',
}
const state = {
  ready: false,
  autoStaker: undefined,
  currentStakerProcess: undefined,
  currentStakerProcessId: undefined,
}

async function init() {
  setupLocalState();
  await initAutostaker();
  setupStorageListeners();
  setupMessageListeners();
  state.ready = true;
}

function setupLocalState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (storage) => {
      for (let key in storage) {
        if (config[key]) config[key] = storage[key];
      }
      resolve(null);
    });
  });
}

function setupStorageListeners() {
  return new Promise((resolve) => {
    chrome.storage.onChanged.addListener(function (changes: Object) {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (config.hasOwnProperty(key)) {
          config[key] = newValue;
        }
      }
      resolve(null);
    });
  });
}

function setupMessageListeners() {
  chrome.runtime.onMessage.addListener(function (message: chromeMessage) {
    if (message.type === 'autostaker on') {
      console.log('Enable Staking Process');
      startAutoStakerProcess();
    } else if (message.type === 'autostaker off') {
      console.log('Disable Staking Process');
      clearAutoStakerProcess();
    }
  });
}

async function initAutostaker() {
  state.autoStaker = new AutoStaker(config);
  chrome.storage.local.set({ rewardsToClaim: await state.autoStaker.rewardsToClaim()});
}

// convert to web workers eventually
function startAutoStakerProcess() {
  if (state.currentStakerProcess) return;
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
