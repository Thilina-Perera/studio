// jest.config.js - uses @next/jest to respect next.config.js
const nextJest = require('@next/jest');

const createJestConfig = nextJest({
  dir: './'
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // If you have path aliases, map here. Example:
  // moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};

module.exports = createJestConfig(customJestConfig);
