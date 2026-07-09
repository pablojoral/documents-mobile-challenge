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
  onChange: (file: PickedFile | null) => void;
  onPickError?: (error: unknown) => void;
  disabled?: boolean;
  allowedTypes?: string[];
}

export const useDocumentInput = ({
  onChange,
  onPickError,
  disabled = false,
  allowedTypes,
}: UseDocumentInputParams) => {
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = useCallback(async () => {
    if (disabled || isPicking) {
      return;
    }

    setIsPicking(true);
    try {
      const [result] = await pick({
        allowMultiSelection: false,
        type: allowedTypes ?? [types.allFiles],
      });
      onChange({
        uri: result.uri,
        name: result.name ?? result.uri.split('/').pop() ?? 'file',
        size: result.size,
        type: result.type,
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      onPickError?.(err);
    } finally {
      setIsPicking(false);
    }
  }, [disabled, isPicking, allowedTypes, onChange, onPickError]);

  return { handlePick, isPicking };
};
