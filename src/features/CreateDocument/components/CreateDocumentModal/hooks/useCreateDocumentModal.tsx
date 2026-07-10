import React, { useCallback, useEffect } from 'react';
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { TextInput } from 'components/TextInput/TextInput';
import { DocumentInput } from 'components/DocumentInput/DocumentInput';
import { useAddDocument } from 'query/Documents/useAddDocument';

import { createDocumentSchema, DOCUMENT_NAME_MAX_LENGTH, type CreateDocumentFormValues } from '../../../schema';
import { useCreateDocumentModalStrings } from './useCreateDocumentModalStrings';

const DEFAULT_VALUES: CreateDocumentFormValues = {
  name: '',
  version: '',
  file: null,
};

interface UseCreateDocumentModalParams {
  visible: boolean;
  onClose: () => void;
}

export const useCreateDocumentModal = ({ visible, onClose }: UseCreateDocumentModalParams) => {
  const strings = useCreateDocumentModalStrings();
  const { mutateAsync, isPending } = useAddDocument();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!visible) {
      reset(DEFAULT_VALUES);
    }
  }, [visible, reset]);

  const onSubmit = useCallback(
    async (values: CreateDocumentFormValues) => {
      await mutateAsync({
        name: values.name,
        version: values.version,
        file: values.file!,
      });
      onClose();
    },
    [mutateAsync, onClose],
  );

  const handleFormSubmit = handleSubmit(onSubmit);

  const renderNameField = useCallback(
    ({ field }: { field: ControllerRenderProps<CreateDocumentFormValues, 'name'> }) => (
      <TextInput
        label={strings.nameLabel}
        value={field.value}
        onChangeText={field.onChange}
        error={errors.name?.message}
        maxLength={DOCUMENT_NAME_MAX_LENGTH}
      />
    ),
    [strings.nameLabel, errors.name?.message],
  );

  const renderVersionField = useCallback(
    ({ field }: { field: ControllerRenderProps<CreateDocumentFormValues, 'version'> }) => (
      <TextInput
        label={strings.versionLabel}
        value={field.value}
        onChangeText={field.onChange}
        error={errors.version?.message}
        placeholder={strings.versionPlaceholder}
        autoCapitalize="none"
      />
    ),
    [strings.versionLabel, strings.versionPlaceholder, errors.version?.message],
  );

  const renderFileField = useCallback(
    ({ field }: { field: ControllerRenderProps<CreateDocumentFormValues, 'file'> }) => (
      <DocumentInput
        label={strings.fileLabel}
        pickLabel={strings.pickFileLabel}
        value={field.value}
        onChange={field.onChange}
        error={errors.file?.message}
      />
    ),
    [strings.fileLabel, strings.pickFileLabel, errors.file?.message],
  );

  return {
    control,
    handleFormSubmit,
    isSubmitting: isPending,
    renderNameField,
    renderVersionField,
    renderFileField,
  };
};
