import React from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from 'components/ActivityIndicator/ActivityIndicator';

import { useDocumentsListFooterTheme } from './theme/useDocumentsListFooterTheme';

/** Shown at the end of the documents list while the next page is loading. */
export const DocumentsListFooter = () => {
  const { styles } = useDocumentsListFooterTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" />
    </View>
  );
};
