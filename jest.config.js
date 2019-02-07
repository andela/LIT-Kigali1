module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
  coveragePathIgnorePatterns: [
    'node_modules',
    'index.js',
    'spp.js',
    'database',
    '__tests__'
  ],
  coverageDirectory: 'coverage'
};
