import React, { useCallback, useMemo, useState } from 'react';

import { useDocuments } from 'query/Documents/useDocuments';
import type { Document } from 'models/models';

import type { DocumentSort, DocumentViewMode } from '../types';
import { sortDocuments } from '../utils/sortDocuments';
import { DocumentListCard } from '../components/DocumentListCard/DocumentListCard';
import { DocumentGridCard } from '../components/DocumentGridCard/DocumentGridCard';

/**
 * All logic for the Documents screen: the documents query, view-mode and sort
 * state, derived/sorted item list, and the stable `renderItem`/`keyExtractor`
 * the FlatList consumes. `/documents` is a single unpaginated array, so the
 * whole list is fetched at once (pull-to-refresh reloads it).
 */
export const useDocumentsScreen = () => {
  const [viewMode, setViewMode] = useState<DocumentViewMode>('list');
  const [sort, setSort] = useState<DocumentSort>('created-desc');

  const { data, isLoading, isError, refetch, isRefetching } = useDocuments();

  const documents = useMemo(
    () => sortDocuments(data ?? [], sort),
    [data, sort],
  );

  const numColumns = viewMode === 'grid' ? 2 : 1;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
    viewMode,
    setViewMode,
    sort,
    setSort,
    numColumns,
    handleRefresh,
    handleRetry: handleRefresh,
    renderItem,
    keyExtractor,
  };
};
