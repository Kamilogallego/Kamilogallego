module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.steps.js'],
  collectCoverageFrom: ['src/**/*.js'],
  clearMocks: true,
};
