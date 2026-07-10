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

  it('calls onChange with the picked files appended to the existing value', async () => {
    mockPick.mockResolvedValue([makeDocumentPickerResponse()]);
    const onChange = jest.fn();
    const existing = { uri: 'file:///existing.pdf', name: 'existing.pdf', size: 5, type: 'application/pdf' };
    const { result } = renderHook(() => useDocumentInput({ value: [existing], onChange }));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith([
      existing,
      { uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' },
    ]);
  });

  it('appends multiple files picked in a single selection', async () => {
    mockPick.mockResolvedValue([
      makeDocumentPickerResponse({ uri: 'file:///a.pdf', name: 'a.pdf' }),
      makeDocumentPickerResponse({ uri: 'file:///b.pdf', name: 'b.pdf' }),
    ]);
    const onChange = jest.fn();
    const { result } = renderHook(() => useDocumentInput({ value: [], onChange }));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith([
      { uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' },
      { uri: 'file:///b.pdf', name: 'b.pdf', size: 10, type: 'application/pdf' },
    ]);
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
    const { result } = renderHook(() => useDocumentInput({ value: [], onChange }));

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith([
      { uri: 'file:///path/to/report.pdf', name: 'report.pdf', size: 20, type: null },
    ]);
  });

  it('swallows cancellation without calling onChange or onPickError', async () => {
    mockPick.mockRejectedValue({ code: 'OPERATION_CANCELED' });
    mockIsErrorWithCode.mockReturnValue(true);
    const onChange = jest.fn();
    const onPickError = jest.fn();
    const { result } = renderHook(() =>
      useDocumentInput({ value: [], onChange, onPickError }),
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
      useDocumentInput({ value: [], onChange, onPickError }),
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
    const { result } = renderHook(() => useDocumentInput({ value: [], onChange }));

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
      useDocumentInput({ value: [], onChange, disabled: true }),
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
    const { result } = renderHook(() => useDocumentInput({ value: [], onChange }));

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

  it('reports isAtMax once the value reaches maxFiles and blocks further picks', async () => {
    const onChange = jest.fn();
    const value = Array.from({ length: 3 }, (_, i) => ({
      uri: `file:///${i}.pdf`,
      name: `${i}.pdf`,
      size: 1,
      type: 'application/pdf',
    }));
    const { result } = renderHook(() => useDocumentInput({ value, onChange, maxFiles: 3 }));

    expect(result.current.isAtMax).toBe(true);

    await act(async () => {
      await result.current.handlePick();
    });

    expect(mockPick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('truncates a pick that would exceed maxFiles to the remaining slots', async () => {
    mockPick.mockResolvedValue([
      makeDocumentPickerResponse({ uri: 'file:///a.pdf', name: 'a.pdf' }),
      makeDocumentPickerResponse({ uri: 'file:///b.pdf', name: 'b.pdf' }),
      makeDocumentPickerResponse({ uri: 'file:///c.pdf', name: 'c.pdf' }),
    ]);
    const onChange = jest.fn();
    const existing = { uri: 'file:///existing.pdf', name: 'existing.pdf', size: 5, type: 'application/pdf' };
    const { result } = renderHook(() =>
      useDocumentInput({ value: [existing], onChange, maxFiles: 2 }),
    );

    await act(async () => {
      await result.current.handlePick();
    });

    expect(onChange).toHaveBeenCalledWith([
      existing,
      { uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' },
    ]);
  });

  it('removes a file at the given index', () => {
    const onChange = jest.fn();
    const value = [
      { uri: 'file:///a.pdf', name: 'a.pdf', size: 1, type: 'application/pdf' },
      { uri: 'file:///b.pdf', name: 'b.pdf', size: 2, type: 'application/pdf' },
    ];
    const { result } = renderHook(() => useDocumentInput({ value, onChange }));

    act(() => {
      result.current.handleRemove(0);
    });

    expect(onChange).toHaveBeenCalledWith([value[1]]);
  });

  describe('isFileTooLarge', () => {
    it('flags a file whose size exceeds maxFileSize', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useDocumentInput({ value: [], onChange, maxFileSize: 100 }));

      expect(
        result.current.isFileTooLarge({ uri: 'file:///a.pdf', name: 'a.pdf', size: 101, type: null }),
      ).toBe(true);
    });

    it('does not flag a file at or under maxFileSize', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useDocumentInput({ value: [], onChange, maxFileSize: 100 }));

      expect(
        result.current.isFileTooLarge({ uri: 'file:///a.pdf', name: 'a.pdf', size: 100, type: null }),
      ).toBe(false);
    });

    it('does not flag a file with an unknown (null) size', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useDocumentInput({ value: [], onChange, maxFileSize: 100 }));

      expect(
        result.current.isFileTooLarge({ uri: 'file:///a.pdf', name: 'a.pdf', size: null, type: null }),
      ).toBe(false);
    });

    it('never flags a file when maxFileSize is not set', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() => useDocumentInput({ value: [], onChange }));

      expect(
        result.current.isFileTooLarge({ uri: 'file:///a.pdf', name: 'a.pdf', size: Number.MAX_SAFE_INTEGER, type: null }),
      ).toBe(false);
    });
  });
});
