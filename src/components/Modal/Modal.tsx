import React from 'react';
import { Modal as RNModal, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useModalTheme } from './theme/useModalTheme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  /** Wrap the sheet in a `KeyboardAvoidingView` so text inputs inside stay clear of the keyboard. */
  avoidsKeyboard?: boolean;
  children: React.ReactNode;
}

/** Bottom-sheet modal shell: backdrop + rounded sheet + title/close header. */
export const Modal = ({
  visible,
  onClose,
  title,
  closeLabel,
  avoidsKeyboard = false,
  children,
}: ModalProps) => {
  const { styles } = useModalTheme();

  const content = (
    <>
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
    </>
  );

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {avoidsKeyboard ? (
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.modalRoot}>{content}</View>
      )}
    </RNModal>
  );
};
