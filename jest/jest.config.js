module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: ['node_modules', '/source/types/', '/source/constants/'],
  coveragePathIgnorePatterns: ['node_modules', '/source/types/', '/source/constants/', '/jest/'],
  setupFilesAfterEnv: ['./jest/setup.js'],
  rootDir: '../',
};
