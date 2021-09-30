import React from 'react';
import Panel from './components/Panel';
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
      targetAsset: '',
      checkInterval: 60,
      contractExecDelay: 15,
      mnemonicIndex: 0,
      coinType: 330,
      gas: 0.15,
      lcdUrl: 'https://lcd.terra.dev',
    };
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    chrome.storage.local.get([ 'seedPhrase', 'targetAsset', 'checkInterval', 'contractExecDelay', 'mnemonicIndex', 'coinType', 'gasUsage', 'lcdUrl' ], (storage: MyState) => {
      this.setState(storage);
    })
  }

  changePage(page:string) {
    this.setState({ page: page });
  }

  render() {
    return (
      <div className='App'>
        <div id='header'>
          {/* icon */}
          <div className="small-icon"></div>
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
        <div className='content'>
          { this.state.page === 'setupPage' && <SetupPage 
            changePage={this.changePage}
          /> }
          { this.state.page === 'configPage' && <ConfigPage 
            onSeedUpdate={() => {}} 
            seedPhrase={this.state.seedPhrase} 
            targetAsset= {this.state.targetAsset} 
            checkInterval={this.state.checkInterval} 
            contractExecDelay={this.state.contractExecDelay}
            mnemonicIndex={this.state.mnemonicIndex}
            coinType={this.state.coinType}
            gas={this.state.gas}
            lcdUrl={this.state.lcdUrl}
          /> }
          { this.state.page === 'autostakerPage' && <AutostakerPage /> }
        </div>
        {/* <button onClick={() => { this.changePage('configPage') }}></button> */}
        <Panel />
      </div>
    );
  }
}

export default App;