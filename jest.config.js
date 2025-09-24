/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',                      // Use ts-jest for TypeScript support
    testEnvironment: 'jsdom',               // Use jsdom for React component testing
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // Setup file for jest-dom
    reporters: ['default', 'jest-junit'],   // Default + Jenkins JUnit reporter
    collectCoverage: true,                  // Enable coverage collection
    coverageDirectory: 'coverage',          // Output coverage reports here
    moduleDirectories: ['node_modules', '<rootDir>/'], // Resolve modules from these paths
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',  // Transform TS/JSX using ts-jest
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',          // Optional: handle path aliases
    },
  };
  