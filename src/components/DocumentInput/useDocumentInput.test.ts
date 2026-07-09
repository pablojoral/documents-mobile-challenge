import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  pick,
  isErrorWithCode,
  type DocumentPickerResponse,
  type NonEmptyArray,
} from '@react-native-documents/picker';

import { useDocumentInput } from './useDocumentInput';

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  isErrorWithCode: jest.fn(),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  types: { allFiles: 'public.item' },
}));

const mockPick = jest.mocked(pick);
const mockIsErrorWithCode = jest.mocked(isErrorWithCode);

const makeDocumentPickerResponse = (
  overrides: Partial<DocumentPickerResponse> = {},
): DocumentPickerResponse => ({
  uri: 'file:///a.pdf',
  name: 'a.pdf',
  size: 10,
  type: 'application/pdf',
  error: null,
  nativeType: null,
  isVirtual: null,
  convertibleToMimeTypes: null,
  hasRequestedType: true,
  ...overrides,
});

describe('useDocumentInput', () => {
  beforeEach(() => {
    mockPick.mockReset();
    mockIsErrorWithCode.mockReset();
  });

  it('calls onChange with the mapped file on success', async () => {
    mockPick.mockResolvedValue([makeDocumentPickerResponse()]);
    const onChange = jest.fn();
    const { result } = renderHook(() => useDocumentInput({ onChange }));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith({
      uri: 'file:///a.pdf',
      name: 'a.pdf',
      size: 10,
      type: 'application/pdf',
    });
  });

  it('falls back to deriving the name from the uri when name is null', async () => {
    mockPick.mockResolvedValue([
      makeDocumentPickerResponse({
        uri: 'file:///path/to/report.pdf',
        name: null,
        size: 20,
        type: null,
      }),
    ]);
    const onChange = jest.fn();
    const { result } = renderHook(() => useDocumentInput({ onChange }));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith({
      uri: 'file:///path/to/report.pdf',
      name: 'report.pdf',
      size: 20,
      type: null,
    });
  });

  it('swallows cancellation without calling onChange or onPickError', async () => {
    mockPick.mockRejectedValue({ code: 'OPERATION_CANCELED' });
    mockIsErrorWithCode.mockReturnValue(true);
    const onChange = jest.fn();
    const onPickError = jest.fn();
    const { result } = renderHook(() =>
      useDocumentInput({ onChange, onPickError }),
    );

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onPickError).not.toHaveBeenCalled();
  });

  it('calls onPickError for a non-cancellation failure', async () => {
    const failure = new Error('boom');
    mockPick.mockRejectedValue(failure);
    mockIsErrorWithCode.mockReturnValue(false);
    const onChange = jest.fn();
    const onPickError = jest.fn();
    const { result } = renderHook(() =>
      useDocumentInput({ onChange, onPickError }),
    );

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onPickError).toHaveBeenCalledWith(failure);
  });

  it('reflects isPicking true while pending and false after settling', async () => {
    let resolvePick: (value: NonEmptyArray<DocumentPickerResponse>) => void =
      () => {};
    mockPick.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePick = resolve;
        }),
    );
    const onChange = jest.fn();
    const { result } = renderHook(() => useDocumentInput({ onChange }));

    expect(result.current.isPicking).toBe(false);

    let pickPromise: Promise<void>;
    act(() => {
      pickPromise = result.current.handlePick();
    });

    await waitFor(() => expect(result.current.isPicking).toBe(true));

    await act(async () => {
      resolvePick([makeDocumentPickerResponse()]);
      await pickPromise;
    });

    expect(result.current.isPicking).toBe(false);
  });

  it('does not call pick when disabled', async () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useDocumentInput({ onChange, disabled: true }),
    );

    await act(async () => {
      await result.current.handlePick();
    });

    expect(mockPick).not.toHaveBeenCalled();
  });

  it('ignores a second pick call while one is already in flight', async () => {
    let resolvePick: (value: NonEmptyArray<DocumentPickerResponse>) => void =
      () => {};
    mockPick.mockImplementation(
      () =>
        new Promise(resolve => {
          resolvePick = resolve;
        }),
    );
    const onChange = jest.fn();
    const { result } = renderHook(() => useDocumentInput({ onChange }));

    let firstPick: Promise<void>;
    act(() => {
      firstPick = result.current.handlePick();
    });
    await waitFor(() => expect(result.current.isPicking).toBe(true));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(mockPick).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePick([makeDocumentPickerResponse()]);
      await firstPick;
    });
  });
});
