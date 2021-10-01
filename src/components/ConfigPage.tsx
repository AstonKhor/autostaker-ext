import React from 'react';
import '../ConfigPage.css';

function ConfigPage(props:ConfigProps) {

  function validateInputs() {
    // let seedPhrase = document.querySelector()


  }

  return (
    <div id="config">
      <form id="config-form" onSubmit={validateInputs}>
        {/* by default mnemonic phrase is hidden till you temp toggle it */}
        <label className="config-label" htmlFor="seedPhrase">Mnuemonic Seed Phrase</label>
        <input className="config-input" type="text" name="seedPhrase" placeholder={props.seedPhrase}></input>
        <label className="config-label" htmlFor="targetAsset">Target Asset</label>
        <select className="config-input config-select" name="targetAsset" placeholder="mETH">
          <option value="MIR">MIR</option>
          <option value="mMSFT">mMSFT</option>
          <option value="mBTC">mBTC</option>
          <option value="mAAPL">mAAPL</option>
          <option value="mNFLX">mNFLX</option>
          <option value="mAMC">mAMC</option>
          <option value="mETH">mETH</option>
          <option value="mAMZN">mAMZN</option>
          <option value="mGOOGL">mGOOGL</option>
          <option value="mVIXY">mVIXY</option>
          <option value="mQQQ">mQQQ</option>
          <option value="mBABA">mBABA</option>
          <option value="mTSLA">mTSLA</option>
          <option value="mCOIN">mCOIN</option>
        </select>
        <label className="config-label" htmlFor="checkInterval">Check Interval (Minutes)</label>
        <input className="config-input" type="number" name="checkInterval" placeholder={props.checkInterval.toString()}></input>
        <label className="config-label" htmlFor="contractExecDelay">Contract Exec Delay (Seconds)</label>
        <input className="config-input" type="number" name="contractExecDelay" placeholder={props.contractExecDelay.toString()}></input>
        <label className="config-label" htmlFor="coinType">COIN TYPE</label>
        <input className="config-input" type="number" name="coinType" placeholder={props.coinType.toString()}></input>
        <label className="config-label" htmlFor="gas">Gas Usage (UST)</label>
        <input className="config-input" type="number" name="gas" placeholder={props.gas.toString()}></input>
        <label className="config-label" htmlFor="lcdUrl">LCD URL (UST)</label>
        <input className="config-input" type="text" name="lcdUrl" placeholder={props.lcdUrl}></input>
        <input className="config-save" type="submit" value="Save"></input>
      </form>
    </div>
  )
};

export default ConfigPage;