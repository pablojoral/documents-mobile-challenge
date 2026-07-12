jest.mock('query/Documents/useDocuments');
jest.mock('hooks/useIsOnline');
jest.mock('features/CreateDocument/components/AddDocumentButton/AddDocumentButton', () => ({
  AddDocumentButton: jest.fn(() => null),
}));

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';

import { useDocuments } from 'query/Documents/useDocuments';
import { useIsOnline } from 'hooks/useIsOnline';
import { AddDocumentButton } from 'features/CreateDocument/components/AddDocumentButton/AddDocumentButton';
import { makeDocument, makeDocumentsPage } from 'test/fixtures';
import { renderWithQuery } from 'test/renderWithQuery';
import { Documents } from './Documents';

const mockUseDocuments = useDocuments as jest.Mock;
const mockUseIsOnline = useIsOnline as jest.Mock;
const refetch = jest.fn();
const fetchNextPage = jest.fn();

const withPages = (...documents: ReturnType<typeof makeDocument>[]) => ({
  pages: [makeDocumentsPage({ Data: documents })],
});

const setQuery = (overrides: Record<string, unknown> = {}) =>
  mockUseDocuments.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch,
    isRefetching: false,
    fetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    ...overrides,
  });

describe('Documents screen', () => {
  beforeEach(() => {
    refetch.mockReset();
    fetchNextPage.mockReset();
    mockUseIsOnline.mockReturnValue(true);
  });

  it('shows a spinner while loading', () => {
    setQuery({ isLoading: true });
    const { UNSAFE_getByType, queryByText } = renderWithQuery(<Documents />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('No documents yet')).toBeNull();
  });

  it('renders documents on success', () => {
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { getByText } = renderWithQuery(<Documents />);
    expect(getByText('Alpha')).toBeTruthy();
  });

  it('shows the empty state when there are no documents', () => {
    setQuery({ data: withPages() });
    const { getByText } = renderWithQuery(<Documents />);
    expect(getByText('No documents yet')).toBeTruthy();
  });

  it('shows the error state and retries', () => {
    setQuery({ isError: true });
    const { getByText } = renderWithQuery(<Documents />);
    expect(getByText('Something went wrong')).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps showing the list instead of the error state when a failed refetch still has cached documents', () => {
    setQuery({
      isError: true,
      data: withPages(makeDocument({ Title: 'Alpha' })),
    });
    const { getByText, queryByText } = renderWithQuery(<Documents />);
    expect(getByText('Alpha')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('updates the sort trigger when a new sort is chosen', () => {
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { getByText, getAllByText } = renderWithQuery(<Documents />);

    fireEvent.press(getAllByText('Newest first')[0]); // open sort sheet
    fireEvent.press(getByText('Oldest first'));

    // trigger now reflects the new selection
    expect(getByText('Oldest first')).toBeTruthy();
  });

  it('switches to grid view without losing the document', () => {
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { getByText, getByLabelText } = renderWithQuery(<Documents />);
    fireEvent.press(getByLabelText('Grid'));
    expect(getByText('Alpha')).toBeTruthy();
  });

  it('renders the add-document button', () => {
    setQuery({ data: withPages() });
    renderWithQuery(<Documents />);
    expect(jest.mocked(AddDocumentButton)).toHaveBeenCalled();
  });

  it('does not show the offline tag while online', () => {
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { queryByText } = renderWithQuery(<Documents />);
    expect(queryByText('Offline')).toBeNull();
    expect(jest.mocked(AddDocumentButton)).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: false }),
      undefined,
    );
  });

  it('shows the offline tag and disables sort/add-document controls while offline', () => {
    mockUseIsOnline.mockReturnValue(false);
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { getByText, queryByText, getAllByText } = renderWithQuery(
      <Documents />,
    );

    expect(getByText('Offline')).toBeTruthy();

    fireEvent.press(getAllByText('Newest first')[0]); // sort trigger, disabled
    expect(queryByText('Oldest first')).toBeNull(); // sheet never opens

    expect(jest.mocked(AddDocumentButton)).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: true }),
      undefined,
    );
  });

  it('resets the sort to created-desc when the add-document button reports a successful add', () => {
    setQuery({ data: withPages(makeDocument({ Title: 'Alpha' })) });
    const { getByText, getAllByText } = renderWithQuery(<Documents />);

    fireEvent.press(getAllByText('Newest first')[0]);
    fireEvent.press(getByText('Oldest first'));
    expect(getByText('Oldest first')).toBeTruthy();

    const { onDocumentAdded } = jest.mocked(AddDocumentButton).mock.calls[
      jest.mocked(AddDocumentButton).mock.calls.length - 1
    ][0];
    act(() => onDocumentAdded());

    expect(getByText('Newest first')).toBeTruthy();
  });
});
