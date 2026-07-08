/* eslint-env jest */

// Provide deterministic safe-area insets (all zero) so components using
// useSafeAreaInsets render without a native provider.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
