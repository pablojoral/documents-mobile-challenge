jest.mock('query/Documents/useDocuments');
jest.mock('features/CreateDocument/components/AddDocumentButton/AddDocumentButton', () => ({
  AddDocumentButton: jest.fn(() => null),
}));

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { useDocuments } from 'query/Documents/useDocuments';
import { AddDocumentButton } from 'features/CreateDocument/components/AddDocumentButton/AddDocumentButton';
import { makeDocument } from 'test/fixtures';
import { Documents } from './Documents';

const mockUseDocuments = useDocuments as jest.Mock;
const refetch = jest.fn();

const setQuery = (overrides: Record<string, unknown> = {}) =>
  mockUseDocuments.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch,
    isRefetching: false,
    ...overrides,
  });

describe('Documents screen', () => {
  beforeEach(() => {
    refetch.mockReset();
  });

  it('shows a spinner while loading', () => {
    setQuery({ isLoading: true });
    const { UNSAFE_getByType, queryByText } = render(<Documents />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(queryByText('No documents yet')).toBeNull();
  });

  it('renders documents on success', () => {
    setQuery({ data: [makeDocument({ Title: 'Alpha' })] });
    const { getByText } = render(<Documents />);
    expect(getByText('Alpha')).toBeTruthy();
  });

  it('shows the empty state when there are no documents', () => {
    setQuery({ data: [] });
    const { getByText } = render(<Documents />);
    expect(getByText('No documents yet')).toBeTruthy();
  });

  it('shows the error state and retries', () => {
    setQuery({ isError: true });
    const { getByText } = render(<Documents />);
    expect(getByText('Something went wrong')).toBeTruthy();
    fireEvent.press(getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('updates the sort trigger when a new sort is chosen', () => {
    setQuery({ data: [makeDocument({ Title: 'Alpha' })] });
    const { getByText, getAllByText } = render(<Documents />);

    fireEvent.press(getAllByText('Newest first')[0]); // open sort sheet
    fireEvent.press(getByText('Oldest first'));

    // trigger now reflects the new selection
    expect(getByText('Oldest first')).toBeTruthy();
  });

  it('switches to grid view without losing the document', () => {
    setQuery({ data: [makeDocument({ Title: 'Alpha' })] });
    const { getByText, getByLabelText } = render(<Documents />);
    fireEvent.press(getByLabelText('Grid'));
    expect(getByText('Alpha')).toBeTruthy();
  });

  it('renders the add-document button', () => {
    setQuery({ data: [] });
    render(<Documents />);
    expect(jest.mocked(AddDocumentButton)).toHaveBeenCalled();
  });
});
