module.exports = {
  verbose: true,
  testEnvironment: 'node',
  roots: [
    '<rootDir>/api',
    '<rootDir>/website',
    '<rootDir>/automation'
  ],
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};
