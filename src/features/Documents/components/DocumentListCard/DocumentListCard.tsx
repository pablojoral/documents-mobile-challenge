import React, { memo } from 'react';
import { View } from 'react-native';

import { Text } from 'components/Text/Text';
import type { Document } from 'models/models';

import { useDocumentCard } from '../../hooks/useDocumentCard';
import { DocumentCardFooterColumn } from '../DocumentCardFooterColumn/DocumentCardFooterColumn';
import { DocumentMetaRow } from '../DocumentMetaRow/DocumentMetaRow';
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
        <DocumentMetaRow dateLabel={dateLabel} versionLabel={versionLabel} />
      </View>
      <View style={styles.footerRow}>
        {contributorNames.length > 0 ? (
          <DocumentCardFooterColumn
            iconName="users"
            iconColor="font-brand"
            title={contributorsTitle}
            titleColor="font-brand"
            items={contributorNames}
          />
        ) : null}
        {attachmentNames.length > 0 ? (
          <DocumentCardFooterColumn
            iconName="paperclip"
            iconColor="font-secondary"
            title={attachmentsTitle}
            titleColor="font-secondary"
            items={attachmentNames}
          />
        ) : null}
      </View>
    </View>
  );
};

/** Full-width row card used in the list view. */
export const DocumentListCard = memo(DocumentListCardComponent);
