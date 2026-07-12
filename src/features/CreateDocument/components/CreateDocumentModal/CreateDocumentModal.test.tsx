import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { pick } from '@react-native-documents/picker';

import { useAddDocument } from 'query/Documents/useAddDocument';
import { ActivityIndicator } from 'components/ActivityIndicator/ActivityIndicator';

import { CreateDocumentModal } from './CreateDocumentModal';

jest.mock('query/Documents/useAddDocument', () => ({
  useAddDocument: jest.fn(),
}));

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  isErrorWithCode: jest.fn(() => false),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  types: { allFiles: 'public.item' },
}));

const mockUseAddDocument = jest.mocked(useAddDocument);
const mockPick = jest.mocked(pick);

const makePickResponse = (overrides: Partial<{ uri: string; name: string | null; size: number | null; type: string | null }> = {}) => ({
  uri: 'file:///a.pdf',
  name: 'a.pdf',
  size: 1024,
  type: 'application/pdf',
  error: null,
  nativeType: null,
  isVirtual: null,
  convertibleToMimeTypes: null,
  hasRequestedType: true,
  ...overrides,
});

describe('CreateDocumentModal', () => {
  const mutateAsync = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    mutateAsync.mockReset().mockResolvedValue(undefined);
    mockPick.mockReset();
    onSuccess.mockReset();
    mockUseAddDocument.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useAddDocument>);
  });

  it('renders all three fields and the submit button', () => {
    const { getByText, getByLabelText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    expect(getByLabelText('Name')).toBeTruthy();
    expect(getByLabelText('Version')).toBeTruthy();
    expect(getByText('Attachments')).toBeTruthy();
    expect(getByText('Create document')).toBeTruthy();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const { getByText, findByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.press(getByText('Create document'));

    expect(await findByText('Name is required.')).toBeTruthy();
    expect(getByText('Version is required.')).toBeTruthy();
    expect(getByText('Select at least one file to attach.')).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('shows an error when the name exceeds the max length', async () => {
    const { getByLabelText, getByText, findByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.changeText(getByLabelText('Name'), 'a'.repeat(101));
    fireEvent.press(getByText('Create document'));

    expect(await findByText('Name must be 100 characters or fewer.')).toBeTruthy();
  });

  it('shows an error for an invalid version format', async () => {
    const { getByLabelText, getByText, findByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.changeText(getByLabelText('Name'), 'Report');
    fireEvent.changeText(getByLabelText('Version'), 'not-a-version');
    fireEvent.press(getByText('Create document'));

    expect(
      await findByText('Version must be in the form 0-99.0-99.0-99 (e.g. 1.0.0).'),
    ).toBeTruthy();
  });

  it('shows an error when the picked file is too large', async () => {
    mockPick.mockResolvedValue([makePickResponse({ size: 11 * 1024 * 1024 })]);
    const { getByLabelText, getByText, findByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.changeText(getByLabelText('Name'), 'Report');
    fireEvent.changeText(getByLabelText('Version'), '1.0.0');
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(mockPick).toHaveBeenCalledTimes(1));

    fireEvent.press(getByText('Create document'));

    expect(await findByText('Each file must be 10 MB or smaller.')).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('highlights only the oversized file among several picked files', async () => {
    mockPick.mockResolvedValue([
      makePickResponse({ uri: 'file:///small.pdf', name: 'small.pdf', size: 1024 }),
      makePickResponse({ uri: 'file:///big.pdf', name: 'big.pdf', size: 11 * 1024 * 1024 }),
    ]);
    const { getByText, getAllByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.press(getByText('Choose file'));

    await waitFor(() => expect(getByText('big.pdf')).toBeTruthy());
    expect(getByText('small.pdf')).toBeTruthy();
    // The caption is scoped to the oversized file, not repeated for the valid one.
    expect(getAllByText('Too large (max 10 MB)')).toHaveLength(1);
  });

  it('submits the form, calls onSuccess, and closes the modal on success', async () => {
    mockPick.mockResolvedValue([makePickResponse()]);
    const onClose = jest.fn();
    const { getByLabelText, getByText } = render(
      <CreateDocumentModal visible onClose={onClose} onSuccess={onSuccess} />,
    );

    fireEvent.changeText(getByLabelText('Name'), 'Report');
    fireEvent.changeText(getByLabelText('Version'), '1.0.0');
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(mockPick).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByText('a.pdf')).toBeTruthy());

    fireEvent.press(getByText('Create document'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'Report',
        version: '1.0.0',
        files: [expect.objectContaining({ name: 'a.pdf' })],
      }),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('accumulates files picked across multiple presses and submits all of them', async () => {
    mockPick
      .mockResolvedValueOnce([makePickResponse({ uri: 'file:///a.pdf', name: 'a.pdf' })])
      .mockResolvedValueOnce([makePickResponse({ uri: 'file:///b.pdf', name: 'b.pdf' })]);
    const { getByLabelText, getByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    fireEvent.changeText(getByLabelText('Name'), 'Report');
    fireEvent.changeText(getByLabelText('Version'), '1.0.0');
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(getByText('a.pdf')).toBeTruthy());
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(getByText('b.pdf')).toBeTruthy());

    fireEvent.press(getByText('Create document'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        name: 'Report',
        version: '1.0.0',
        files: [
          expect.objectContaining({ name: 'a.pdf' }),
          expect.objectContaining({ name: 'b.pdf' }),
        ],
      }),
    );
  });

  it('removes a picked file when its remove action is pressed', async () => {
    mockPick.mockResolvedValue([makePickResponse()]);
    const { getByText, getByLabelText, queryByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(getByText('a.pdf')).toBeTruthy());

    fireEvent.press(getByLabelText('Remove a.pdf'));

    expect(queryByText('a.pdf')).toBeNull();
  });

  it('caps a single selection at the 10-file maximum and disables further picking', async () => {
    const responses = Array.from({ length: 11 }, (_, i) =>
      makePickResponse({ uri: `file:///${i}.pdf`, name: `${i}.pdf` }),
    ) as unknown as Parameters<typeof mockPick.mockResolvedValue>[0];
    mockPick.mockResolvedValue(responses);
    const { getByText, queryByText } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(getByText('9.pdf')).toBeTruthy());
    expect(queryByText('10.pdf')).toBeNull();

    mockPick.mockClear();
    fireEvent.press(getByText('Choose file'));
    expect(mockPick).not.toHaveBeenCalled();
  });

  it('shows a submit error, does not call onSuccess, and keeps the modal open when the mutation fails', async () => {
    mutateAsync.mockReset().mockRejectedValue(new Error('boom'));
    mockPick.mockResolvedValue([makePickResponse()]);
    const onClose = jest.fn();
    const { getByLabelText, getByText, findByText } = render(
      <CreateDocumentModal visible onClose={onClose} onSuccess={onSuccess} />,
    );

    fireEvent.changeText(getByLabelText('Name'), 'Report');
    fireEvent.changeText(getByLabelText('Version'), '1.0.0');
    fireEvent.press(getByText('Choose file'));
    await waitFor(() => expect(getByText('a.pdf')).toBeTruthy());

    fireEvent.press(getByText('Create document'));

    expect(
      await findByText('Something went wrong creating the document. Try again.'),
    ).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a loading submit button while the mutation is pending', () => {
    mockUseAddDocument.mockReturnValue({
      mutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useAddDocument>);
    const { queryByText, UNSAFE_getAllByType } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );

    expect(queryByText('Create document')).toBeNull();
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('resets the form fields after the modal is closed and reopened', () => {
    const { getByLabelText, rerender } = render(
      <CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />,
    );
    fireEvent.changeText(getByLabelText('Name'), 'Report');
    expect(getByLabelText('Name').props.value).toBe('Report');

    rerender(<CreateDocumentModal visible={false} onClose={jest.fn()} onSuccess={onSuccess} />);
    rerender(<CreateDocumentModal visible onClose={jest.fn()} onSuccess={onSuccess} />);

    expect(getByLabelText('Name').props.value).toBe('');
  });
});
