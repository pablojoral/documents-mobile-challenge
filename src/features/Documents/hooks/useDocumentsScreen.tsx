import React, { useCallback, useMemo, useState } from 'react';

import { useDocuments } from 'query/Documents/useDocuments';
import { useIsOnline } from 'hooks/useIsOnline';
import type { Document } from 'models/models';

import type { DocumentSort, DocumentViewMode } from '../types';
import { DocumentListCard } from '../components/DocumentListCard/DocumentListCard';
import { DocumentGridCard } from '../components/DocumentGridCard/DocumentGridCard';

/**
 * All logic for the Documents screen: the paginated documents query, view-mode
 * and sort state, derived item list, and the stable `renderItem`/`keyExtractor`/
 * `handleEndReached` the FlatList consumes. Sorting and pagination are both
 * server-side — changing `sort` swaps the query key, which serves cached
 * pages instantly if present and refetches in the background if stale.
 */
export const useDocumentsScreen = () => {
  const isOnline = useIsOnline();
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

  // A failed background refetch (a stale query, pull-to-refresh, or going
  // offline) still leaves earlier cached pages in `data` — only fall back to
  // the full error screen when there's nothing cached left to show instead.
  const showError = !isLoading && isError && documents.length === 0;
  const showList = !isLoading && !showError;

  const numColumns = viewMode === 'grid' ? 2 : 1;

  const handleRefresh = useCallback(() => {
    if (isOnline) {
      refetch();
    }
  }, [isOnline, refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && isOnline) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isOnline, fetchNextPage]);

  const handleDocumentAdded = useCallback(() => {
    setSort('created-desc');
  }, []);

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
    showError,
    showList,
    isOffline: !isOnline,
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
