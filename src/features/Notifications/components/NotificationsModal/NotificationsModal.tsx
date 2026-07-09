import React from 'react';
import { FlatList } from 'react-native';

import { Modal } from 'components/Modal/Modal';

import { NotificationsEmptyState } from '../NotificationsEmptyState/NotificationsEmptyState';
import { useNotificationsModal } from './hooks/useNotificationsModal';
import { useNotificationsModalStrings } from './hooks/useNotificationsModalStrings';
import { useNotificationsModalTheme } from './theme/useNotificationsModalTheme';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Modal listing notifications; viewing it marks them all as read. */
export const NotificationsModal = ({ visible, onClose }: NotificationsModalProps) => {
  const { notifications, keyExtractor, renderItem } = useNotificationsModal(visible);
  const { title, close } = useNotificationsModalStrings();
  const { styles } = useNotificationsModalTheme();

  return (
    <Modal visible={visible} onClose={onClose} title={title} closeLabel={close}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={NotificationsEmptyState}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />
    </Modal>
  );
};
