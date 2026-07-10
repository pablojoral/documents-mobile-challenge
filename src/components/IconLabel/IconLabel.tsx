import React from 'react';
import { View } from 'react-native';

import { Icon } from 'components/Icon/Icon';
import type { IconName } from 'components/Icon/icons';
import { Text } from 'components/Text/Text';
import type { FontColorToken, FontWeightToken } from 'theme/tokens';

import { useIconLabelTheme } from './theme/useIconLabelTheme';

interface IconLabelProps {
  iconName: IconName;
  iconColor: FontColorToken;
  label: string;
  labelColor: FontColorToken;
  labelWeight?: FontWeightToken;
  numberOfLines?: number;
}

/** A small icon paired with a label, e.g. a contributor or attachment row. */
export const IconLabel = ({
  iconName,
  iconColor,
  label,
  labelColor,
  labelWeight,
  numberOfLines,
}: IconLabelProps) => {
  const { styles } = useIconLabelTheme();

  return (
    <View style={styles.container}>
      <Icon name={iconName} size="icon-size-xs" color={iconColor} />
      <Text
        style={numberOfLines !== undefined ? styles.label : undefined}
        size="font-size-xs"
        color={labelColor}
        weight={labelWeight}
        numberOfLines={numberOfLines}
      >
        {label}
      </Text>
    </View>
  );
};
