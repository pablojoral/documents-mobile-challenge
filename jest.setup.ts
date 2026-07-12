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

// This native module has no TurboModule available under Jest. Tests that
// need to assert a haptic was triggered (useDocumentCard, …) override this
// with their own `jest.mock('react-native-haptic-feedback', …)`.
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Ships its own Jest mock (defaults to a connected state). Tests that need
// to simulate offline/online transitions override the `useNetInfo` return
// value with their own `jest.mocked(useNetInfo).mockReturnValue(…)`.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);

// No TurboModule/Nitro binary available under Jest. Backs the persisted
// query cache (`query/persister.ts`); tests covering that adapter override
// this with an in-memory Map-backed implementation.
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));
