import React, { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useDocuments } from 'query/Documents/useDocuments';
import { qk } from 'query/keys';
import type { Document } from 'models/models';

import type { DocumentSort, DocumentViewMode } from '../types';
import { DocumentListCard } from '../components/DocumentListCard/DocumentListCard';
import { DocumentGridCard } from '../components/DocumentGridCard/DocumentGridCard';

/**
 * All logic for the Documents screen: the paginated documents query, view-mode
 * and sort state, derived item list, and the stable `renderItem`/`keyExtractor`/
 * `handleEndReached` the FlatList consumes. Sorting and pagination are both
 * server-side — changing `sort` swaps the query key and refetches from page 1.
 */
export const useDocumentsScreen = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<DocumentViewMode>('list');
  const [sort, setSortState] = useState<DocumentSort>('created-desc');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDocuments(sort);

  const documents = useMemo(
    () => data?.pages.flatMap(page => page.Data) ?? [],
    [data],
  );

  const numColumns = viewMode === 'grid' ? 2 : 1;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // A sort can still have several pages cached from an earlier scroll (or,
  // once a document is added, ones whose offsets have shifted); dropping the
  // cached query instead of just switching the key guarantees the list
  // restarts at page 1 with fresh data every time the sort changes.
  const setSort = useCallback(
    (next: DocumentSort) => {
      queryClient.removeQueries({ queryKey: qk.documents.list(next) });
      setSortState(next);
    },
    [queryClient],
  );

  const handleDocumentAdded = useCallback(() => {
    setSort('created-desc');
  }, [setSort]);

  const keyExtractor = useCallback((document: Document) => document.ID, []);

  const renderItem = useCallback(
    ({ item }: { item: Document }) =>
      viewMode === 'grid' ? (
        <DocumentGridCard document={item} />
      ) : (
        <DocumentListCard document={item} />
      ),
    [viewMode],
  );

  return {
    documents,
    isLoading,
    isError,
    isRefreshing: isRefetching,
    isFetchingNextPage,
    viewMode,
    setViewMode,
    sort,
    setSort,
    numColumns,
    handleRefresh,
    handleRetry: handleRefresh,
    handleEndReached,
    handleDocumentAdded,
    renderItem,
    keyExtractor,
  };
};
