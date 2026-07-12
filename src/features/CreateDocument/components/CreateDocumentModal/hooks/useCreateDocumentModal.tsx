import React, { useCallback, useEffect, useState } from 'react';
import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { TextInput } from 'components/TextInput/TextInput';
import { DocumentInput } from 'components/DocumentInput/DocumentInput';
import { useAddDocument } from 'query/Documents/useAddDocument';

import {
  createDocumentSchema,
  DOCUMENT_NAME_MAX_LENGTH,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  type CreateDocumentFormValues,
} from '../../../schema';
import { useCreateDocumentModalStrings } from './useCreateDocumentModalStrings';

const DEFAULT_VALUES: CreateDocumentFormValues = {
  name: '',
  version: '',
  files: [],
};

interface UseCreateDocumentModalParams {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const useCreateDocumentModal = ({
  visible,
  onClose,
  onSuccess,
}: UseCreateDocumentModalParams) => {
  const strings = useCreateDocumentModalStrings();
  const { mutateAsync, isPending } = useAddDocument();
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(null);
    }
  }, [visible, reset]);

  const onSubmit = useCallback(
    async (values: CreateDocumentFormValues) => {
      setSubmitError(null);
      try {
        await mutateAsync({
          name: values.name,
          version: values.version,
          files: values.files,
        });
        onSuccess();
        onClose();
      } catch {
        setSubmitError(strings.submitError);
      }
    },
    [mutateAsync, onClose, onSuccess, strings.submitError],
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
    ({ field }: { field: ControllerRenderProps<CreateDocumentFormValues, 'files'> }) => (
      <DocumentInput
        label={strings.fileLabel}
        pickLabel={strings.pickFileLabel}
        removeLabel={strings.removeFileLabel}
        tooLargeLabel={strings.tooLargeFileLabel}
        value={field.value}
        onChange={field.onChange}
        error={errors.files?.message}
        maxFiles={MAX_FILES}
        maxFileSize={MAX_FILE_SIZE_BYTES}
      />
    ),
    [
      strings.fileLabel,
      strings.pickFileLabel,
      strings.removeFileLabel,
      strings.tooLargeFileLabel,
      errors.files?.message,
    ],
  );

  return {
    control,
    handleFormSubmit,
    isSubmitting: isPending,
    submitError,
    renderNameField,
    renderVersionField,
    renderFileField,
  };
};
