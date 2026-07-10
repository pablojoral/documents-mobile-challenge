import { useCallback } from 'react';
import { Share } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

import type { Document } from 'models/models';

import { formatRelativeDate } from 'utils/formatRelativeDate';
import { useDocumentCardStrings } from './useDocumentCardStrings';

/**
 * Derives the display fields shown by both the list and grid document cards
 * from a raw `Document` (formatted date, contributor summary/names, attachment
 * names/count, version) and the long-press share handler both cards trigger.
 */
export const useDocumentCard = (document: Document) => {
  const strings = useDocumentCardStrings();

  const contributorCount = document.Contributors.length;
  const attachmentCount = document.Attachments.length;
  const firstContributor = document.Contributors[0]?.Name ?? '';
  const extraContributors = Math.max(contributorCount - 1, 0);

  const contributorSummary =
    firstContributor && extraContributors > 0
      ? `${firstContributor} ${strings.andOthers(extraContributors)}`
      : firstContributor;

  const versionLabel = strings.version(document.Version);

  const handleShare = useCallback(() => {
    trigger('impactHeavy');
    Share.share({
      title: document.Title,
      message: strings.shareMessage(document.Title, versionLabel),
    });
  }, [document.Title, strings, versionLabel]);

  return {
    title: document.Title,
    dateLabel: formatRelativeDate(document.CreatedAt),
    contributorSummary,
    contributorNames: document.Contributors.map(user => user.Name),
    attachmentNames: document.Attachments,
    contributorsTitle: strings.contributorsTitle,
    attachmentsTitle: strings.attachmentsTitle,
    attachmentsLabel: strings.attachments(attachmentCount),
    versionLabel,
    contributorCount,
    attachmentCount,
    shareLabel: strings.shareLabel(document.Title),
    handleShare,
  };
};
