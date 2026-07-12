import React from 'react';
import { FlatList, View } from 'react-native';

import { Modal } from 'components/Modal/Modal';

import { NotificationsEmptyState } from '../NotificationsEmptyState/NotificationsEmptyState';
import { NotificationsNewIndicator } from '../NotificationsNewIndicator/NotificationsNewIndicator';
import { useNotificationsModal } from './hooks/useNotificationsModal';
import { useNotificationsModalStrings } from './hooks/useNotificationsModalStrings';
import { useNotificationsModalTheme } from './theme/useNotificationsModalTheme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Modal listing notifications; each is marked read once it's actually been seen. */
export const NotificationsModal = ({ visible, onClose }: NotificationsModalProps) => {
  const {
    notifications,
    newNotificationsCount,
    listRef,
    scrollToTop,
    keyExtractor,
    renderItem,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useNotificationsModal(visible);
  const { title, close } = useNotificationsModalStrings();
  const { styles } = useNotificationsModalTheme();

  return (
    <Modal visible={visible} onClose={onClose} title={title} closeLabel={close}>
      <View style={styles.listContainer}>
        <FlatList
          ref={listRef}
          data={notifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={NotificationsEmptyState}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        <NotificationsNewIndicator count={newNotificationsCount} onPress={scrollToTop} />
      </View>
    </Modal>
  );
};
