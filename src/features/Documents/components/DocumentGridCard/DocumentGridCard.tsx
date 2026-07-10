import React, { memo } from 'react';
import { View } from 'react-native';

import { Icon } from 'components/Icon/Icon';
import { Text } from 'components/Text/Text';
import type { Document } from 'models/models';

import { useDocumentCard } from '../../hooks/useDocumentCard';
import { useDocumentGridCardTheme } from './theme/useDocumentGridCardTheme';

interface DocumentGridCardProps {
  document: Document;
}

const DocumentGridCardComponent = ({ document }: DocumentGridCardProps) => {
  const { title, dateLabel, contributorsLabel, attachmentsLabel } =
    useDocumentCard(document);
  const { styles } = useDocumentGridCardTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-sm" weight="font-weight-semibold" numberOfLines={2}>
        {title}
      </Text>
      <Text size="font-size-xs" color="font-secondary">
        {dateLabel}
      </Text>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Icon name="users" size="icon-size-xs" color="font-brand" />
          <Text size="font-size-xs" color="font-brand" weight="font-weight-medium">
            {contributorsLabel}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="paperclip" size="icon-size-xs" color="font-secondary" />
          <Text size="font-size-xs" color="font-secondary">
            {attachmentsLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

/** Compact half-width tile used in the grid view. */
export const DocumentGridCard = memo(DocumentGridCardComponent);
