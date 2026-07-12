import React, { useCallback, useMemo, useState } from 'react';

import { useDocuments } from 'query/Documents/useDocuments';
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
  const [viewMode, setViewMode] = useState<DocumentViewMode>('list');
  const [sort, setSort] = useState<DocumentSort>('created-desc');

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
    renderItem,
    keyExtractor,
  };
};
