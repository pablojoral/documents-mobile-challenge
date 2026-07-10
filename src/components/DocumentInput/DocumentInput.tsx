import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';
import { Button } from 'components/Button/Button';

import { useDocumentInput, type PickedFile } from './useDocumentInput';
import { useDocumentInputTheme } from './theme/useDocumentInputTheme';

export type { PickedFile } from './useDocumentInput';

export interface DocumentInputProps {
  label: string;
  pickLabel: string;
  error?: string;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  /**
   * Called for picker failures other than user cancellation. If omitted,
   * such failures are silently absorbed — wire this to surface feedback.
   */
  onPickError?: (error: unknown) => void;
  disabled?: boolean;
  allowedTypes?: string[];
}

/**
 * The app's labelled file picker. Renders a label above, a button that opens
 * the native document picker, the selected file's name once picked, and,
 * when `error` is set, a validation message below.
 */
export const DocumentInput = ({
  label,
  pickLabel,
  error,
  value,
  onChange,
  onPickError,
  disabled = false,
  allowedTypes,
}: DocumentInputProps) => {
  const { handlePick, isPicking } = useDocumentInput({
    onChange,
    onPickError,
    disabled,
    allowedTypes,
  });
  const { styles, rowStyle } = useDocumentInputTheme(!!error);

  return (
    <View style={styles.container}>
      <Text size="font-size-sm" weight="font-weight-medium" color="font-secondary">
        {label}
      </Text>
      <View style={rowStyle}>
        <Button
          label={pickLabel}
          onPress={handlePick}
          disabled={disabled}
          loading={isPicking}
        />
        {value ? (
          <Text style={styles.fileName} numberOfLines={1} color="font-secondary">
            {value.name}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text size="font-size-xs" color="font-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
