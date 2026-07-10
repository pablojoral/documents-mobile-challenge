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
    contributorNames,
    attachmentNames,
    contributorsTitle,
    attachmentsTitle,
    versionLabel,
  } = useDocumentCard(document);
  const { styles } = useDocumentListCardTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text size="font-size-md" weight="font-weight-semibold" numberOfLines={1}>
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
      </View>
      <View style={styles.footerRow}>
        {contributorNames.length > 0 ? (
          <View style={styles.footerColumn}>
            <View style={styles.footerColumnHeader}>
              <Icon name="users" size="icon-size-xs" color="font-brand" />
              <Text size="font-size-xs" color="font-brand" weight="font-weight-medium">
                {contributorsTitle}
              </Text>
            </View>
            {contributorNames.map((name, index) => (
              <Text
                key={`${name}-${index}`}
                style={styles.footerItemLabel}
                size="font-size-xs"
                color="font-secondary"
                numberOfLines={1}
              >
                {name}
              </Text>
            ))}
          </View>
        ) : null}
        {attachmentNames.length > 0 ? (
          <View style={styles.footerColumn}>
            <View style={styles.footerColumnHeader}>
              <Icon name="paperclip" size="icon-size-xs" color="font-secondary" />
              <Text size="font-size-xs" color="font-secondary" weight="font-weight-medium">
                {attachmentsTitle}
              </Text>
            </View>
            {attachmentNames.map((name, index) => (
              <Text
                key={`${name}-${index}`}
                style={styles.footerItemLabel}
                size="font-size-xs"
                color="font-secondary"
                numberOfLines={1}
              >
                {name}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

/** Full-width row card used in the list view. */
export const DocumentListCard = memo(DocumentListCardComponent);
