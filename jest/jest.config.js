module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: ['node_modules', '/source/types/', '/source/constants/'],
  coveragePathIgnorePatterns: ['node_modules', '/source/types/', '/source/constants/', '/jest/'],
  setupFilesAfterEnv: ['@testing-library/react/cleanup-after-each', './jest/setup.js'],
  rootDir: '../',
};
