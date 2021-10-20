# Autostaker Browser Extension

Autostaker is a mirror protocol automatic re-staker chrome extension. Mirror protocol short pools typically require a manual collecting selling for 50/50 with UST and restaking. This extension simplifies all of those steps and lets you compound those gains with a single button!

The extension re-implements the standalone autostaker from [Autostaker by YunSuk Yeo](https://github.com/YunSuk-Yeo/autostaker) and makes it accesible to those whom don't know how to program.

## Screenshots

<img src="./docs/setupPage.png" width="250"/>
<img src="./docs/autostakerPageOn.png" width="250"/>
<img src="./docs/configPage.png" width="250"/>

## Running the Pre-built Extension

*The extension only runs on chrome/chromium/brave browsers
- Clone the repo (git clone https://github.com/AstonKhor/autostaker-ext)
- Go to [chrome://extensions](chrome://extensions)
- Toggle the "Developer mode" to On
- Click "Load unpacked"
- Navigate to and select the "extension" folder from the root of this repo
- Start compounding those gains!


## Building locally

- Install [Node.js](https://nodejs.org) version 14
    - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install dependencies: `npm install`
- Build the project to the `./dist/` folder with `npm run build`.

## Contributing

The project is completely open source. Feel free to contribute!
