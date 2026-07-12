import React from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';

import { useOfflineTagStrings } from './hooks/useOfflineTagStrings';
import { useOfflineTagTheme } from './theme/useOfflineTagTheme';

/** Small pill the Documents screen shows below its controls row while offline. */
export const OfflineTag = () => {
  const { label } = useOfflineTagStrings();
  const { styles } = useOfflineTagTheme();

  return (
    <View style={styles.container}>
      <Text
        size="font-size-xs"
        weight="font-weight-medium"
        color="font-secondary">
        {label}
      </Text>
    </View>
  );
};
