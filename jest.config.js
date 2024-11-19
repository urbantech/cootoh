export default {
  transform: {
    '^.+\\.js$': 'babel-jest', // Transform JavaScript files using babel-jest
  },
  moduleFileExtensions: ['js', 'json'], // Supported file extensions
  transformIgnorePatterns: ['/node_modules/'], // Ignore node_modules transformations
  testEnvironment: 'node', // Specify the test environment
  testMatch: ['**/src/tests/**/*.[jt]s?(x)'], // Specify the test file pattern
};
