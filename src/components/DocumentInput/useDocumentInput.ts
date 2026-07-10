import { useCallback, useState } from 'react';
import {
  pick,
  isErrorWithCode,
  errorCodes,
  types,
} from '@react-native-documents/picker';

export interface PickedFile {
  uri: string;
  name: string;
  size: number | null;
  type: string | null;
}

interface UseDocumentInputParams {
  value: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  onPickError?: (error: unknown) => void;
  disabled?: boolean;
  allowedTypes?: string[];
  /** Caps how many files can be selected in total. Excess picks are dropped. */
  maxFiles?: number;
  /** Flags already-picked files whose size exceeds this, in bytes. */
  maxFileSize?: number;
}

export const useDocumentInput = ({
  value,
  onChange,
  onPickError,
  disabled = false,
  allowedTypes,
  maxFiles,
  maxFileSize,
}: UseDocumentInputParams) => {
  const [isPicking, setIsPicking] = useState(false);
  const isAtMax = maxFiles !== undefined && value.length >= maxFiles;

  const handlePick = useCallback(async () => {
    if (disabled || isPicking || isAtMax) {
      return;
    }

    setIsPicking(true);
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: allowedTypes ?? [types.allFiles],
      });
      const picked = results.map(result => ({
        uri: result.uri,
        name: result.name ?? result.uri.split('/').pop() ?? 'file',
        size: result.size,
        type: result.type,
      }));
      const remainingSlots = maxFiles !== undefined ? maxFiles - value.length : picked.length;
      onChange([...value, ...picked.slice(0, remainingSlots)]);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      onPickError?.(err);
    } finally {
      setIsPicking(false);
    }
  }, [disabled, isPicking, isAtMax, allowedTypes, value, maxFiles, onChange, onPickError]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const isFileTooLarge = useCallback(
    (file: PickedFile) =>
      maxFileSize !== undefined && file.size !== null && file.size > maxFileSize,
    [maxFileSize],
  );

  return { handlePick, handleRemove, isPicking, isAtMax, isFileTooLarge };
};
