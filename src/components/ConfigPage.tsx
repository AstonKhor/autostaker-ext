import React from 'react';

function ConfigPage({ onSeedUpdate, seedPhrase, targetAsset, checkInterval, contractExecDelay, mnemonicIndex, coinType, gas, lcdUrl}:ConfigProps) {

  return (
    <div>
      <form onSubmit={onSeedUpdate}>
        {/* by default mnemonic phrase is hidden till you temp toggle it */}
        <label>
          Mnuemonic Seed Phrase
          <input type="text" name="seedPhrase" value={seedPhrase}></input>
        </label>
        <label>
          Target Asset
          <input type="text" name="targetAsset" value={targetAsset}></input>
        </label>
        <label>
          Check Interval (Minutes)
          <input type="text" name="checkInterval" value={checkInterval}></input>
        </label>
        <label>
          Contract Exec Delay (Seconds)
          <input type="text" name="contractExecDelay" value={contractExecDelay}></input>
        </label>
        <label>
          Mnemonic Index
          <input type="text" name="mnemonicIndex" value={mnemonicIndex}></input>
        </label>
        <label>
          COIN TYPE
          <input type="text" name="coinType" value={coinType}></input>
        </label>
        <label>
          Gas Usage (UST)
          <input type="text" name="gas" value={gas}></input>
        </label>
        <label>
          LCD URL (UST)
          <input type="text" name="lcdUrl" value={lcdUrl}></input>
        </label>
        <input type="submit" value="Save"></input>
      </form>
    </div>
  )
};

export default ConfigPage;


// MNEMONIC="forget cluster father know insect gospel firm spring anxiety capable struggle absent apart menu stand grass unknown deal cover key enough bottom mean outside"
// TARGET_ASSET="MIR"


// REWARD_CHECK_INTERVAL_MIN=10
// CONTRACT_EXEC_DELAY_SEC=15
// MNEMONIC_INDEX=0
// COIN_TYPE=330
// GAS_COST_USD=0.15
// LCD_URL="https://lcd.terra.dev"