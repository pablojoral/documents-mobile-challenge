import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';
import { Button } from 'components/Button/Button';

import { useDocumentsErrorStrings } from './hooks/useDocumentsErrorStrings';
import { useDocumentsErrorTheme } from './theme/useDocumentsErrorTheme';

interface DocumentsErrorProps {
  onRetry: () => void;
}

/** Shown when the documents query fails; offers a retry. */
export const DocumentsError = ({ onRetry }: DocumentsErrorProps) => {
  const { title, subtitle, retry } = useDocumentsErrorStrings();
  const { styles } = useDocumentsErrorTheme();

  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text size="font-size-lg" weight="font-weight-semibold">
          {title}
        </Text>
        <Text color="font-secondary" align="center">
          {subtitle}
        </Text>
      </View>
      <View>
        <Button label={retry} variant="secondary" onPress={onRetry} />
      </View>
    </View>
  );
};
