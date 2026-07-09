import React from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useModalTheme } from './theme/useModalTheme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
}

/** Bottom-sheet modal shell: backdrop + rounded sheet + title/close header. */
export const Modal = ({ visible, onClose, title, closeLabel, children }: ModalProps) => {
  const { styles } = useModalTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text size="font-size-md" weight="font-weight-semibold">
              {title}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text color="font-brand" weight="font-weight-medium">
                {closeLabel}
              </Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
};
