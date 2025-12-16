/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');

 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    // Handle module aliases (this will match the alias in your tsconfig.json)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,ts,tsx}',
    'components/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts,tsx}',
    'store/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{js,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);