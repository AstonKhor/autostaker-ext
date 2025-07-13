/**
 * Prettier Configuration
 * Code formatting rules for the Autostaker extension
 */

module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'preserve'
      }
    }
  ]
}; 