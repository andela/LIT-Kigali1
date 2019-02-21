module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coveragePathIgnorePatterns: [
    'node_modules',
    'middlewares',
    'index.js',
    'app.js',
    'database',
    '__tests__',
    'config',
    'ui'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
};
