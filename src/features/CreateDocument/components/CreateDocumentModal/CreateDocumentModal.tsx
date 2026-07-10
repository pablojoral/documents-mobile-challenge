import React from 'react';
import { ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';

import { Modal } from 'components/Modal/Modal';
import { Button } from 'components/Button/Button';

import { useCreateDocumentModal } from './hooks/useCreateDocumentModal';
import { useCreateDocumentModalStrings } from './hooks/useCreateDocumentModalStrings';
import { useCreateDocumentModalTheme } from './theme/useCreateDocumentModalTheme';

export interface CreateDocumentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateDocumentModal = ({ visible, onClose }: CreateDocumentModalProps) => {
  const strings = useCreateDocumentModalStrings();
  const {
    control,
    handleFormSubmit,
    isSubmitting,
    renderNameField,
    renderVersionField,
    renderFileField,
  } = useCreateDocumentModal({ visible, onClose });
  const { styles } = useCreateDocumentModalTheme();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={strings.title}
      closeLabel={strings.close}
      avoidsKeyboard
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Controller control={control} name="name" render={renderNameField} />
        <Controller control={control} name="version" render={renderVersionField} />
        <Controller control={control} name="file" render={renderFileField} />
        <Button
          label={strings.submitLabel}
          onPress={handleFormSubmit}
          loading={isSubmitting}
          fullWidth
        />
      </ScrollView>
    </Modal>
  );
};
