import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import { IconLabel } from 'components/IconLabel/IconLabel';
import { Text } from 'components/Text/Text';
import type { Document } from 'models/models';

import { useDocumentCard } from '../../hooks/useDocumentCard';
import { DocumentMetaRow } from '../DocumentMetaRow/DocumentMetaRow';
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
    shareLabel,
    handleShare,
  } = useDocumentCard(document);
  const { styles } = useDocumentGridCardTheme();

  return (
    <Pressable
      style={styles.container}
      onLongPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel={shareLabel}
    >
      <Text size="font-size-sm" weight="font-weight-semibold" numberOfLines={2}>
        {title}
      </Text>
      <DocumentMetaRow dateLabel={dateLabel} versionLabel={versionLabel} />
      {contributorSummary ? (
        <IconLabel
          iconName="users"
          iconColor="font-brand"
          label={contributorSummary}
          labelColor="font-secondary"
          numberOfLines={1}
        />
      ) : null}
      <View style={styles.footer}>
        <IconLabel
          iconName="paperclip"
          iconColor="font-secondary"
          label={attachmentsLabel}
          labelColor="font-secondary"
        />
      </View>
    </Pressable>
  );
};

/** Compact half-width tile used in the grid view. */
export const DocumentGridCard = memo(DocumentGridCardComponent);
