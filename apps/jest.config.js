const path = require('path');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '.*\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^@src(.*)$': '<rootDir>/src/$1',
    // '^@services(.*)$': `${path.join(__dirname, './src', 'services')}/$1`,
    '^@services(.*)$': '<rootDir>/src/$1',
    '^@util(.*)$': '<rootDir>/src/util/$1',
    '^@lib(.*)$': '<rootDir>/src/lib/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(t|j)s'],
  testPathIgnorePatterns: ['<rootDir>/build/*'],
  modulePathIgnorePatterns: ['<rootDir>/build/*'],
};
