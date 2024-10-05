export default {
    transform: {
      '^.+\\.js$': 'babel-jest', // Transform JavaScript files using babel-jest
    },
    moduleFileExtensions: ['js', 'json'], // Supported file extensions
    transformIgnorePatterns: ['/node_modules/'], // Ignore node_modules transformations
  };
  