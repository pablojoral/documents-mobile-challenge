module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // The RN preset already transforms react-native & friends; extend the
  // allow-list for any ESM-only deps that need Babel transformation in tests.
  transformIgnorePatterns: [
    'node_modules/(?!(?:jest-)?react-native|@react-native|@react-navigation|@tanstack|axios)',
  ],
};
