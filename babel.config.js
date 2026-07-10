module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod v4's source uses `export * as x from '...'`, which Metro can't
    // transform without this plugin (unlike Jest's babel-jest transform,
    // which handles it via a different target).
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
