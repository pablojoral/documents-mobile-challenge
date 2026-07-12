import React from 'react';
import { View } from 'react-native';

import { Button } from 'components/Button/Button';

import { CreateDocumentModal } from '../CreateDocumentModal/CreateDocumentModal';
import { useAddDocumentButton } from './hooks/useAddDocumentButton';
import { useAddDocumentButtonStrings } from './hooks/useAddDocumentButtonStrings';
import { useAddDocumentButtonTheme } from './theme/useAddDocumentButtonTheme';

export interface AddDocumentButtonProps {
  onDocumentAdded: () => void;
}

/** Fixed row at the bottom of the Documents screen that opens the create-document modal. */
export const AddDocumentButton = ({ onDocumentAdded }: AddDocumentButtonProps) => {
  const { isOpen, open, close } = useAddDocumentButton();
  const strings = useAddDocumentButtonStrings();
  const { styles } = useAddDocumentButtonTheme();

  return (
    <View style={styles.container}>
      <Button
        label={strings.addDocument}
        onPress={open}
        fullWidth
        icon="plus"
      />
      <CreateDocumentModal visible={isOpen} onClose={close} onSuccess={onDocumentAdded} />
    </View>
  );
};
