import React from 'react';
import { View } from 'react-native';

import { Button } from 'components/Button/Button';

import { CreateDocumentModal } from '../CreateDocumentModal/CreateDocumentModal';
import { useAddDocumentButton } from './hooks/useAddDocumentButton';
import { useAddDocumentButtonStrings } from './hooks/useAddDocumentButtonStrings';
import { useAddDocumentButtonTheme } from './theme/useAddDocumentButtonTheme';

/** Fixed row at the bottom of the Documents screen that opens the create-document modal. */
export const AddDocumentButton = () => {
  const { isOpen, open, close } = useAddDocumentButton();
  const strings = useAddDocumentButtonStrings();
  const { styles } = useAddDocumentButtonTheme();

  return (
    <View style={styles.container}>
      <Button label={strings.addDocument} onPress={open} fullWidth />
      <CreateDocumentModal visible={isOpen} onClose={close} />
    </View>
  );
};
