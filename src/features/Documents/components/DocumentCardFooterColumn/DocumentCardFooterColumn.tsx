import React from 'react';
import { View } from 'react-native';

import type { IconName } from 'components/Icon/icons';
import { IconLabel } from 'components/IconLabel/IconLabel';
import { Text } from 'components/Text/Text';
import type { FontColorToken } from 'theme/tokens';

import { useDocumentCardFooterColumnTheme } from './theme/useDocumentCardFooterColumnTheme';

interface DocumentCardFooterColumnProps {
  iconName: IconName;
  iconColor: FontColorToken;
  title: string;
  titleColor: FontColorToken;
  items: string[];
}

/** A titled, vertical list of names shown in a document list card's footer. */
export const DocumentCardFooterColumn = ({
  iconName,
  iconColor,
  title,
  titleColor,
  items,
}: DocumentCardFooterColumnProps) => {
  const { styles } = useDocumentCardFooterColumnTheme();

  return (
    <View style={styles.container}>
      <IconLabel
        iconName={iconName}
        iconColor={iconColor}
        label={title}
        labelColor={titleColor}
        labelWeight="font-weight-medium"
      />
      {items.map((item, index) => (
        <Text
          key={`${item}-${index}`}
          style={styles.itemLabel}
          size="font-size-xs"
          color="font-secondary"
          numberOfLines={1}
        >
          {item}
        </Text>
      ))}
    </View>
  );
};
