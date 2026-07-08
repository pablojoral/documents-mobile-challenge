jest.mock('query/Documents/useDocuments');

import { act, renderHook } from '@testing-library/react-native';

import { useDocuments } from 'query/Documents/useDocuments';
import { makeDocument } from 'test/fixtures';
import { DocumentListCard } from '../components/DocumentListCard/DocumentListCard';
import { DocumentGridCard } from '../components/DocumentGridCard/DocumentGridCard';
import { useDocumentsScreen } from './useDocumentsScreen';

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

const older = makeDocument({
  Title: 'Older',
  CreatedAt: '2019-01-01T00:00:00.000Z',
});
const newer = makeDocument({
  Title: 'Newer',
  CreatedAt: '2021-01-01T00:00:00.000Z',
});

describe('useDocumentsScreen', () => {
  beforeEach(() => {
    refetch.mockReset();
    setQuery({ data: [older, newer] });
  });

  it('sorts documents newest-first by default', () => {
    const { result } = renderHook(() => useDocumentsScreen());
    expect(result.current.documents.map(d => d.Title)).toEqual([
      'Newer',
      'Older',
    ]);
  });

  it('re-sorts when the sort changes', () => {
    const { result } = renderHook(() => useDocumentsScreen());
    act(() => result.current.setSort('created-asc'));
    expect(result.current.documents.map(d => d.Title)).toEqual([
      'Older',
      'Newer',
    ]);
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
});
