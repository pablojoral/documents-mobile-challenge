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
  const {
    title,
    dateLabel,
    contributorSummary,
    versionLabel,
    attachmentsLabel,
  } = useDocumentCard(document);
  const { styles } = useDocumentGridCardTheme();

  return (
    <View style={styles.container}>
      <Text size="font-size-sm" weight="font-weight-semibold" numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.metaRow}>
        <Text size="font-size-xs" color="font-secondary">
          {dateLabel}
        </Text>
        <Text size="font-size-xs" color="font-secondary">
          {versionLabel}
        </Text>
      </View>
      {contributorSummary ? (
        <View style={styles.footerItem}>
          <Icon name="users" size="icon-size-xs" color="font-brand" />
          <Text
            style={styles.footerItemLabel}
            size="font-size-xs"
            color="font-secondary"
            numberOfLines={1}
          >
            {contributorSummary}
          </Text>
        </View>
      ) : null}
      <View style={styles.footer}>
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
