jest.mock('query/Documents/useDocuments');

import { act, renderHook } from '@testing-library/react-native';

import { useDocuments } from 'query/Documents/useDocuments';
import { makeDocument, makeDocumentsPage } from 'test/fixtures';
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
    const { result } = renderHook(() => useDocumentsScreen());
    expect(result.current.documents.map(d => d.Title)).toEqual([
      'Newer',
      'Older',
    ]);
  });

  it('passes the current sort to useDocuments and re-queries from page 1 when it changes', () => {
    const { result } = renderHook(() => useDocumentsScreen());
    expect(mockUseDocuments).toHaveBeenCalledWith('created-desc');

    act(() => result.current.setSort('created-asc'));

    expect(mockUseDocuments).toHaveBeenLastCalledWith('created-asc');
  });

  it('derives numColumns and renderItem variant from the view mode', () => {
    const { result } = renderHook(() => useDocumentsScreen());

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
    const { result } = renderHook(() => useDocumentsScreen());
    expect(result.current.keyExtractor(newer)).toBe(newer.ID);
  });

  it('refetches on refresh', () => {
    const { result } = renderHook(() => useDocumentsScreen());
    act(() => result.current.handleRefresh());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('fetches the next page on end reached when more pages exist', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: true,
    });
    const { result } = renderHook(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not fetch the next page when there is none left', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: false,
    });
    const { result } = renderHook(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not fetch the next page while a page fetch is already in flight', () => {
    setQuery({
      data: { pages: [makeDocumentsPage({ Data: [newer, older] })] },
      hasNextPage: true,
      isFetchingNextPage: true,
    });
    const { result } = renderHook(() => useDocumentsScreen());

    act(() => result.current.handleEndReached());

    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
