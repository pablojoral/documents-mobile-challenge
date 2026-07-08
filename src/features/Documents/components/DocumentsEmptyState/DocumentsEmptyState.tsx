import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useDocumentsEmptyStateStrings } from './hooks/useDocumentsEmptyStateStrings';
import { useDocumentsEmptyStateTheme } from './theme/useDocumentsEmptyStateTheme';

/** Shown when the documents list has loaded but is empty. */
export const DocumentsEmptyState = () => {
  const { title, subtitle } = useDocumentsEmptyStateStrings();
  const { styles } = useDocumentsEmptyStateTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-lg" weight="font-weight-semibold">
        {title}
      </Text>
      <Text color="font-secondary" align="center">
        {subtitle}
      </Text>
    </View>
  );
};
