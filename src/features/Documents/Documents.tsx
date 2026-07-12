import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Text } from 'components/Text/Text';
import { ActivityIndicator } from 'components/ActivityIndicator/ActivityIndicator';

import { useDocumentsScreen } from './hooks/useDocumentsScreen';
import { useDocumentsStrings } from './hooks/useDocumentsStrings';
import { useDocumentsTheme } from './theme/useDocumentsTheme';
import { ViewModeToggle } from './components/ViewModeToggle/ViewModeToggle';
import { SortSelector } from './components/SortSelector/SortSelector';
import { DocumentsEmptyState } from './components/DocumentsEmptyState/DocumentsEmptyState';
import { DocumentsError } from './components/DocumentsError/DocumentsError';
import { DocumentsListFooter } from './components/DocumentsListFooter/DocumentsListFooter';
import { NotificationsButton } from 'features/Notifications/components/NotificationsButton/NotificationsButton';
import { AddDocumentButton } from 'features/CreateDocument/components/AddDocumentButton/AddDocumentButton';

/** Documents list screen: sortable, switchable between list and grid views. */
export const Documents = () => {
  const {
    documents,
    isLoading,
    isError,
    isRefreshing,
    isFetchingNextPage,
    viewMode,
    setViewMode,
    sort,
    setSort,
    numColumns,
    handleRefresh,
    handleRetry,
    handleEndReached,
    renderItem,
    keyExtractor,
  } = useDocumentsScreen();
  const { title } = useDocumentsStrings();
  const { styles, theme } = useDocumentsTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text size="font-size-xxl" weight="font-weight-bold">
            {title}
          </Text>
          <NotificationsButton />
        </View>
        <View style={styles.controlsRow}>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <SortSelector value={sort} onChange={setSort} />
        </View>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!isLoading && isError && <DocumentsError onRetry={handleRetry} />}

      {!isLoading && !isError && (
        <FlatList
          key={viewMode}
          data={documents}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={DocumentsEmptyState}
          ListFooterComponent={
            isFetchingNextPage ? DocumentsListFooter : undefined
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.fontColor['font-brand']}
            />
          }
        />
      )}

      <AddDocumentButton />
    </View>
  );
};
