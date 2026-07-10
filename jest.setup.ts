/* eslint-env jest */

// Provide deterministic safe-area insets (all zero) so components using
// useSafeAreaInsets render without a native provider.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// This native module has no TurboModule available under Jest. Tests that
// need to control picking behavior (DocumentInput, CreateDocumentModal, …)
// override this with their own `jest.mock('@react-native-documents/picker', …)`.
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  isErrorWithCode: jest.fn(() => false),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  types: { allFiles: '*/*' },
}));
