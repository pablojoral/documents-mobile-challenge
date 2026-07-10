import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  pick,
  isErrorWithCode,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';

import { DocumentInput } from './DocumentInput';

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

describe('DocumentInput', () => {
  beforeEach(() => {
    mockPick.mockReset();
    mockIsErrorWithCode.mockReset();
  });

  it('renders the label and pick button', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={jest.fn()}
      />,
    );
    expect(getByText('Attachments')).toBeTruthy();
    expect(getByText('Choose file')).toBeTruthy();
  });

  it('renders each selected file name when value is set', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[
          { uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' },
          { uri: 'file:///b.pdf', name: 'b.pdf', size: 20, type: 'application/pdf' },
        ]}
        onChange={jest.fn()}
      />,
    );
    expect(getByText('a.pdf')).toBeTruthy();
    expect(getByText('b.pdf')).toBeTruthy();
  });

  it('does not render a file name when value is empty', () => {
    const { queryByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={jest.fn()}
      />,
    );
    expect(queryByText('a.pdf')).toBeNull();
  });

  it('calls onChange with the picked file appended on success', async () => {
    mockPick.mockResolvedValue([makeDocumentPickerResponse()]);
    const onChange = jest.fn();
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByText('Choose file'));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        { uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' },
      ]),
    );
  });

  it('removes a file when its remove action is pressed', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[{ uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' }]}
        onChange={onChange}
      />,
    );
    fireEvent.press(getByLabelText('Remove a.pdf'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows the too-large caption next to a file exceeding maxFileSize', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[
          { uri: 'file:///a.pdf', name: 'a.pdf', size: 20, type: 'application/pdf' },
          { uri: 'file:///b.pdf', name: 'b.pdf', size: 5, type: 'application/pdf' },
        ]}
        onChange={jest.fn()}
        maxFileSize={10}
        tooLargeLabel="Too large"
      />,
    );
    expect(getByText('a.pdf')).toBeTruthy();
    expect(getByText('Too large')).toBeTruthy();
    expect(getByText('b.pdf')).toBeTruthy();
  });

  it('does not show the too-large caption for a file within maxFileSize', () => {
    const { queryByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[{ uri: 'file:///a.pdf', name: 'a.pdf', size: 5, type: 'application/pdf' }]}
        onChange={jest.fn()}
        maxFileSize={10}
        tooLargeLabel="Too large"
      />,
    );
    expect(queryByText('Too large')).toBeNull();
  });

  it('does not flag any file when maxFileSize is not set', () => {
    const { queryByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[{ uri: 'file:///a.pdf', name: 'a.pdf', size: 999_999_999, type: 'application/pdf' }]}
        onChange={jest.fn()}
        tooLargeLabel="Too large"
      />,
    );
    expect(queryByText('Too large')).toBeNull();
  });

  it('disables the pick button once maxFiles is reached', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[{ uri: 'file:///a.pdf', name: 'a.pdf', size: 10, type: 'application/pdf' }]}
        onChange={jest.fn()}
        maxFiles={1}
      />,
    );
    fireEvent.press(getByText('Choose file'));
    expect(mockPick).not.toHaveBeenCalled();
  });

  it('does not call onChange or onPickError on cancellation', async () => {
    mockPick.mockRejectedValue({ code: 'OPERATION_CANCELED' });
    mockIsErrorWithCode.mockReturnValue(true);
    const onChange = jest.fn();
    const onPickError = jest.fn();
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={onChange}
        onPickError={onPickError}
      />,
    );
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(mockPick).toHaveBeenCalledTimes(1));
    expect(onChange).not.toHaveBeenCalled();
    expect(onPickError).not.toHaveBeenCalled();
  });

  it('calls onPickError for a real failure', async () => {
    const failure = new Error('boom');
    mockPick.mockRejectedValue(failure);
    mockIsErrorWithCode.mockReturnValue(false);
    const onChange = jest.fn();
    const onPickError = jest.fn();
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={onChange}
        onPickError={onPickError}
      />,
    );
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(onPickError).toHaveBeenCalledWith(failure));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the error message when error is set', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={jest.fn()}
        error="An attachment is required"
      />,
    );
    expect(getByText('An attachment is required')).toBeTruthy();
  });

  it('does not open the picker when disabled', () => {
    const { getByText } = render(
      <DocumentInput
        label="Attachments"
        pickLabel="Choose file"
        removeLabel="Remove"
        value={[]}
        onChange={jest.fn()}
        disabled
      />,
    );
    fireEvent.press(getByText('Choose file'));
    expect(mockPick).not.toHaveBeenCalled();
  });
});
