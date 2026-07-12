jest.mock('query/Documents/useDocuments');

import { act } from '@testing-library/react-native';

import { useDocuments } from 'query/Documents/useDocuments';
import { qk } from 'query/keys';
import { makeDocument, makeDocumentsPage } from 'test/fixtures';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { DocumentListCard } from '../components/DocumentListCard/DocumentListCard';
import { DocumentGridCard } from '../components/DocumentGridCard/DocumentGridCard';
import { useDocumentsScreen } from './useDocumentsScreen';

const mockUseDocuments = useDocuments as jest.Mock;
const refetch = jest.fn();
const fetchNextPage = jest.fn();

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

const older = makeDocument({ Title: 'Older' });
const newer = makeDocument({ Title: 'Newer' });

describe('useDocumentsScreen', () => {
  beforeEach(() => {
    refetch.mockReset();
    fetchNextPage.mockReset();
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
    });
  });

  it('flattens the query pages into a documents array', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());
    expect(result.current.documents.map(d => d.Title)).toEqual([
      'Newer',
      'Older',
    ]);
  });

  it('passes the current sort to useDocuments and re-queries from page 1 when it changes', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());
    expect(mockUseDocuments).toHaveBeenCalledWith('created-desc');

    act(() => result.current.setSort('created-asc'));

    expect(mockUseDocuments).toHaveBeenLastCalledWith('created-asc');
  });

  it('drops any cached pages for a sort when switching to it', () => {
    const { result, client } = renderHookWithQuery(() => useDocumentsScreen());
    const removeQueries = jest.spyOn(client, 'removeQueries');

    act(() => result.current.setSort('title-asc'));

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: qk.documents.list('title-asc'),
    });
  });

  it('derives numColumns and renderItem variant from the view mode', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());

    expect(result.current.numColumns).toBe(1);
    expect(result.current.renderItem({ item: newer }).type).toBe(
      DocumentListCard,
    );

    act(() => result.current.setViewMode('grid'));

    expect(result.current.numColumns).toBe(2);
    expect(result.current.renderItem({ item: newer }).type).toBe(
      DocumentGridCard,
    );
  });

  it('keys items by their ID', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());
    expect(result.current.keyExtractor(newer)).toBe(newer.ID);
  });

  it('refetches on refresh', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());
    act(() => result.current.handleRefresh());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('fetches the next page on end reached when more pages exist', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: true,
    });
    const { result } = renderHookWithQuery(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not fetch the next page when there is none left', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: false,
    });
    const { result } = renderHookWithQuery(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not fetch the next page while a page fetch is already in flight', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: true,
      isFetchingNextPage: true,
    });
    const { result } = renderHookWithQuery(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('resets the sort to created-desc when a document is added', () => {
    const { result } = renderHookWithQuery(() => useDocumentsScreen());
    act(() => result.current.setSort('title-asc'));
    expect(mockUseDocuments).toHaveBeenLastCalledWith('title-asc');

    act(() => result.current.handleDocumentAdded());

    expect(mockUseDocuments).toHaveBeenLastCalledWith('created-desc');
  });
});
