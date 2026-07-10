import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from 'components/Text/Text';
import { Button } from 'components/Button/Button';
import { Icon } from 'components/Icon/Icon';

import { useDocumentInput, type PickedFile } from './useDocumentInput';
import { useDocumentInputTheme } from './theme/useDocumentInputTheme';

export type { PickedFile } from './useDocumentInput';

export interface DocumentInputProps {
  label: string;
  pickLabel: string;
  removeLabel: string;
  error?: string;
  value: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  /**
   * Called for picker failures other than user cancellation. If omitted,
   * such failures are silently absorbed — wire this to surface feedback.
   */
  onPickError?: (error: unknown) => void;
  disabled?: boolean;
  allowedTypes?: string[];
  /** Caps how many files can be selected in total. */
  maxFiles?: number;
  /** Flags already-picked files whose size exceeds this, in bytes. */
  maxFileSize?: number;
  /** Caption shown next to a file's name once it exceeds `maxFileSize`. */
  tooLargeLabel?: string;
}

/**
 * The app's labelled file picker. Renders a label above, a button that opens
 * the native document picker (allowing multiple files up to `maxFiles`), the
 * list of selected files with a remove action each, and, when `error` is
 * set, a validation message below.
 */
export const DocumentInput = ({
  label,
  pickLabel,
  removeLabel,
  error,
  value,
  onChange,
  onPickError,
  disabled = false,
  allowedTypes,
  maxFiles,
  maxFileSize,
  tooLargeLabel,
}: DocumentInputProps) => {
  const { handlePick, handleRemove, isPicking, isAtMax, isFileTooLarge } = useDocumentInput({
    value,
    onChange,
    onPickError,
    disabled,
    allowedTypes,
    maxFiles,
    maxFileSize,
  });
  const { styles, boxStyle } = useDocumentInputTheme(!!error);

  return (
    <View style={styles.container}>
      <Text size="font-size-sm" weight="font-weight-medium" color="font-secondary">
        {label}
      </Text>
      <View style={boxStyle}>
        <Button
          label={pickLabel}
          onPress={handlePick}
          disabled={disabled || isAtMax}
          loading={isPicking}
        />
        {value.length > 0 ? (
          <View style={styles.fileList}>
            {value.map((file, index) => {
              const tooLarge = isFileTooLarge(file);
              return (
                <View
                  key={`${file.uri}-${index}`}
                  style={[styles.fileRow, tooLarge && styles.fileRowInvalid]}
                >
                  <View style={styles.fileInfo}>
                    <Text
                      style={styles.fileName}
                      numberOfLines={1}
                      color={tooLarge ? 'font-danger' : 'font-secondary'}
                    >
                      {file.name}
                    </Text>
                    {tooLarge && tooLargeLabel ? (
                      <Text size="font-size-xs" color="font-danger">
                        {tooLargeLabel}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleRemove(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`${removeLabel} ${file.name}`}
                  >
                    <Icon name="close" size="icon-size-sm" color="font-secondary" />
                  </Pressable>
                </View>
              );
            })}
          </View>
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
