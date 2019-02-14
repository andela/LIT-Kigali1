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
    'config'
  ],
  coverageDirectory: 'coverage'
};
