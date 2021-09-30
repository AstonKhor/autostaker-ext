import React from 'react';

function SetupPage(props:SetupProps) {
  let seed = '';
  function updateSeed(e) {
    seed = e.target.value;
  }
  function checkSubmit() {
    if (seed.split(' ').length !== 20) {
      let warn = document.querySelector('.caveat');
      warn.id = 'caveat-warn';
      warn.textContent = 'invalid seed phrase';
      setTimeout(() => {
        warn.removeAttribute('id');
        warn.textContent = '*Seed phrase stored locally to sign transactions.';
      }, 3500);
      return;
    }
    // props.updateSeed();
    props.changePage('autostakerPage');
  }

  return (
    <div id="setup-page">
      <div id="unlock-page-image"></div>
      <div className="unlock-page-title">
        Welcome Back!
      </div>
      <div className="unlock-page-subtitle">
        Automated Yield Farming Awaits
      </div>
      <label className="unlock-page-form">
        <div className="form__group field">
          <input type="input" className="form__field" placeholder="Name" name="seed" id='seed' onChange={updateSeed}/>
          <label htmlFor="seed" className="form__label">Seed Phrase</label>
          <div className="caveat unlock-page-subtext">
            *Seed phrase stored locally to sign transactions.
          </div>
          <button type="submit" className="unlock-page-form-submit" onClick={checkSubmit}>UNLOCK</button>
        </div>
      </label>
      <div className="caveat">
      This project is <a href="https://www.astonk.com">open source</a>.
      </div>
      <div className="caveat unlock-page-subtext">
        Need help? Contact <a href="https://www.astonk.com">Autostaker Support</a>
      </div>
    </div>
  )
};

export default SetupPage;


