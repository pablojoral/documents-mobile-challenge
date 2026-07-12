module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // The RN preset already transforms react-native & friends; extend the
  // allow-list for any ESM-only deps that need Babel transformation in tests.
  transformIgnorePatterns: [
    'node_modules/(?!(?:jest-)?react-native|@react-native|@react-navigation|@tanstack|axios)',
  ],
  // .claude/worktrees/* are separate git worktrees with their own node_modules;
  // picking up their test files causes cross-copy module resolution errors
  // (e.g. duplicate React instances) unrelated to this working tree.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/worktrees/'],
};
