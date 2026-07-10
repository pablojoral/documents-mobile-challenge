import React, { memo } from 'react';
import { View } from 'react-native';

import { Icon } from 'components/Icon/Icon';
import { Text } from 'components/Text/Text';
import type { Document } from 'models/models';

import { useDocumentCard } from '../../hooks/useDocumentCard';
import { useDocumentListCardTheme } from './theme/useDocumentListCardTheme';

interface DocumentListCardProps {
  document: Document;
}

const DocumentListCardComponent = ({ document }: DocumentListCardProps) => {
  const {
    title,
    dateLabel,
    contributorSummary,
    contributorsLabel,
    attachmentsLabel,
    versionLabel,
  } = useDocumentCard(document);
  const { styles } = useDocumentListCardTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-md" weight="font-weight-semibold" numberOfLines={1}>
        {title}
      </Text>
      {contributorSummary ? (
        <Text size="font-size-sm" color="font-secondary" numberOfLines={1}>
          {contributorSummary}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        <Text size="font-size-xs" color="font-secondary">
          {dateLabel}
        </Text>
        <Text size="font-size-xs" color="font-secondary">
          {versionLabel}
        </Text>
      </View>
      <View style={styles.footerRow}>
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

/** Full-width row card used in the list view. */
export const DocumentListCard = memo(DocumentListCardComponent);
