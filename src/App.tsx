import React from 'react';
import SetupPage from './components/SetupPage';
import ConfigPage from './components/ConfigPage';
import AutostakerPage from './components/AutostakerPage';
import "./App.css";

class App extends React.Component <{}, MyState>{

  constructor(props:AppProps) {
    super(props);
    this.state = {
      page: 'setupPage',
      seedPhrase: '',
      targetAsset: 'mETH',
      checkInterval: 60,
      contractExecDelay: 15,
      mnemonicIndex: 0,
      coinType: 330,
      gas: 0.30,
      lcdUrl: 'https://lcd.terra.dev',
      stakerOn: false,
      rewardsToClaim: 0,
    };
    this.changePage = this.changePage.bind(this);
    this.updateSeed = this.updateSeed.bind(this);
    this.toggleStakerOn = this.toggleStakerOn.bind(this);
  }

  componentDidMount() {
    chrome.storage.local.get([ 'seedPhrase', 'targetAsset', 'checkInterval', 'contractExecDelay', 'mnemonicIndex', 'coinType', 'gasUsage', 'lcdUrl', 'stakerOn', 'rewardsToClaim' ], (storage: MyState) => {
      if (typeof storage.seedPhrase === 'string' && storage.seedPhrase) storage.page = 'autostakerPage';
      this.setState(storage);
    });
  }

  async componentDidUpdate() {
    return new Promise((resolve) => {
      chrome.storage.local.set(this.state, () => {
        resolve(null);
      });
    });
  }

  updateSeed(seedPhrase) {
    this.setState({ seedPhrase }), () => {
      chrome.storage.local.set({ seedPhrase });
    };
  }
  
  toggleStakerOn() {
    this.setState({ stakerOn: !this.state.stakerOn }, () => {
      // send message to bg to start or stop autostaker
      if (this.state.stakerOn) {
        chrome.runtime.sendMessage({ type: 'autostaker on' });
      } else {
        chrome.runtime.sendMessage({ type: 'autostaker off' });
      }
    });
  }

  changePage(page:string) {
    this.setState({ page: page });
  }

  render() {
    return (
      <div id='app'>
        <div id='header'>
          {/* icon */}
          <div className="small-icon" onClick={() => { this.changePage('autostakerPage'); }}></div>
          <div>
            <span className="dot"></span>
            <select name="networks" id="networks">
              <option value="Mainnet">Mainnet</option>
              <option value="Testnet">Testnet</option>
              <option value="Bombay">Bombay</option>
              <option value="Localterra">Localterra</option>
              <option value="Add a network">Add a network</option>
            </select>

          </div>
          {/* settings hamburger */}
        </div>
        <div id='content'>
          { this.state.page === 'setupPage' && <SetupPage 
            changePage={this.changePage}
            updateSeed={this.updateSeed}
          /> }
          { this.state.page === 'configPage' && <ConfigPage 
            onSeedUpdate={this.updateSeed} 
            seedPhrase={this.state.seedPhrase} 
            targetAsset= {this.state.targetAsset} 
            checkInterval={this.state.checkInterval} 
            contractExecDelay={this.state.contractExecDelay}
            mnemonicIndex={this.state.mnemonicIndex}
            coinType={this.state.coinType}
            gas={this.state.gas}
            lcdUrl={this.state.lcdUrl}
          /> }
          { this.state.page === 'autostakerPage' && <AutostakerPage 
            changePage={this.changePage}
            toggleStakerOn={this.toggleStakerOn}
            stakerOn={this.state.stakerOn}
            rewardsToClaim={this.state.rewardsToClaim}
          /> }
        </div>
      </div>
    );
  }
}

export default App;