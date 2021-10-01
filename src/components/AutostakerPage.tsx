import React from 'react';
import '../AutoStakerPage.css';

function AutostakerPage(props:AutostakerProps) {
  return (
    <div id="autostaker">
      <div id="autostaker-title">Staking Status</div>
      <div className="power-switch">
        <input type="checkbox" checked={props.stakerOn} onClick={() => {props.toggleStakerOn()}}/>
        <div className="button">
          <svg className="power-off">
            <use xlinkHref="#line" className="line" />
            <use xlinkHref="#circle" className="circle" />
          </svg>
          <svg className="power-on">
            <use xlinkHref="#line" className="line" />
            <use xlinkHref="#circle" className="circle" />
          </svg>
        </div>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" id="svgbox">
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" id="line">
          <line x1="75" y1="34" x2="75" y2="58"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" id="circle">
          <circle cx="75" cy="80" r="35"/>
        </symbol>
      </svg>

      <div  onClick={() => {props.changePage('configPage')}} className="settings"></div>
      <div id="stats">
        <div className="stat-block">
          <div className="stat-title">Claimable Rewards</div>
          <div>
            <span className="num-int">194.</span>
            <span className="num-dec">88489 MIR</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">Total Value(UST)</div>
          <div>
            <span className="num-int">224,898.</span>
            <span className="num-dec">61 MIR</span>
          </div>
        </div>
      </div>
    </div>
  )
};

export default AutostakerPage;


