import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useDocumentMetaRowTheme } from './theme/useDocumentMetaRowTheme';

interface DocumentMetaRowProps {
  dateLabel: string;
  versionLabel: string;
}

/** Date + version row shared by the list and grid document cards. */
export const DocumentMetaRow = ({
  dateLabel,
  versionLabel,
}: DocumentMetaRowProps) => {
  const { styles } = useDocumentMetaRowTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-xs" color="font-secondary">
        {dateLabel}
      </Text>
      <Text size="font-size-xs" color="font-secondary">
        {versionLabel}
      </Text>
    </View>
  );
};
