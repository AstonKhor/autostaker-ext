# Autostaker Extension

A professional Chrome extension for automated yield farming on Terra's Mirror Protocol.

## Overview

The Autostaker Extension provides automated staking and reward management for Mirror Protocol assets on the Terra blockchain. Built with TypeScript, React, and modern web extension APIs, it offers a secure and user-friendly interface for DeFi automation.

## Features

- 🔐 **Secure Seed Phrase Management**: Local storage with encryption
- 🤖 **Automated Staking**: Configurable intervals for reward claiming and reinvestment
- 🎯 **Multi-Asset Support**: mETH, mGOOGL, mNFLX, mTWTR, mMSFT, mAMZN, mSPY, mVIXY
- 🌐 **Multi-Network Support**: Mainnet, Testnet, Bombay, LocalTerra
- 📊 **Real-time Monitoring**: Track rewards and portfolio value
- 🛡️ **Error Handling**: Comprehensive error recovery and logging
- 🎨 **Modern UI**: Clean, responsive interface with BEM styling

## Architecture

```
src/
├── components/       # React UI components
├── services/        # Business logic and external integrations
├── types/           # TypeScript type definitions
├── constants/       # Application constants
├── utils/           # Helper functions and utilities
├── styles/          # Global styles and design tokens
├── hooks/           # Custom React hooks
├── errors/          # Custom error classes
├── config/          # Configuration management
└── background.ts    # Background script for extension
```

## Technology Stack

- **Frontend**: React 17+ with TypeScript
- **Build Tool**: Webpack 5 with optimized configuration
- **State Management**: React hooks with service layer
- **Styling**: CSS with BEM methodology and CSS variables
- **Testing**: Jest with React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Logging**: Custom logger service with multiple levels
- **Error Handling**: Custom error classes with context

## Installation

### Prerequisites

- Node.js 16+ and npm 7+
- Chrome browser for extension testing

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/autostaker-ext.git
cd autostaker-ext
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` directory

## Development

### Available Scripts

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Code Style Guide

- **TypeScript**: Strict mode enabled with comprehensive type safety
- **React**: Functional components with hooks
- **Naming**: BEM for CSS, PascalCase for components, camelCase for functions
- **Imports**: Organized by type with barrel exports
- **Comments**: JSDoc for public APIs and complex logic

### Testing Strategy

- **Unit Tests**: Services, utilities, and hooks
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: Service interactions and state management
- **Coverage Goal**: 80% minimum for all metrics

## Configuration

### Environment Variables

Create a `.env` file for local development:

```env
NODE_ENV=development
VERSION=1.0.0
```

### Extension Configuration

The extension supports runtime configuration through the settings page:

- **Check Interval**: How often to check for rewards (minutes)
- **Contract Execution Delay**: Delay between transactions (seconds)
- **Gas Price**: Custom gas price for transactions
- **LCD URL**: Terra LCD endpoint

## Security

- **Seed Phrase**: Never transmitted, stored locally with Chrome storage API
- **Permissions**: Minimal required permissions in manifest.json
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Messages**: Sanitized to prevent information leakage

## Deployment

### Building for Production

1. Update version in `package.json` and `manifest.json`
2. Run production build:
```bash
npm run build:prod
```
3. Test the production build locally
4. Create a ZIP of the `extension/` directory
5. Upload to Chrome Web Store

### Release Checklist

- [ ] All tests passing
- [ ] Code coverage meets threshold
- [ ] No ESLint errors or warnings
- [ ] Version numbers updated
- [ ] CHANGELOG.md updated
- [ ] Security audit completed
- [ ] Performance benchmarks met

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Pull Request Guidelines

- Include tests for new functionality
- Update documentation as needed
- Follow existing code style
- Add entries to CHANGELOG.md
- Ensure CI/CD pipeline passes

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check console for errors, ensure manifest.json is valid
2. **Transactions failing**: Verify network connection and gas settings
3. **State not persisting**: Check Chrome storage permissions

### Debug Mode

Enable debug logging in development:
```javascript
// In src/config/index.ts
features: {
  enableDebugLogging: true
}
```

## License

[MIT License](LICENSE)

## Support

- **Documentation**: [Wiki](https://github.com/your-org/autostaker-ext/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/autostaker-ext/issues)
- **Discord**: [Community Server](https://discord.gg/your-server)

## Acknowledgments

- Terra Money for the blockchain infrastructure
- Mirror Protocol for the DeFi platform
- Chrome Extensions team for the APIs and documentation
