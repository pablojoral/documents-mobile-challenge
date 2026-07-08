import type { Document } from 'models/models';

import { formatRelativeDate } from '../utils/formatRelativeDate';
import { useDocumentCardStrings } from './useDocumentCardStrings';

/**
 * Derives the display fields shown by both the list and grid document cards
 * from a raw `Document` (formatted date, contributor summary, counts, version).
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

  return {
    title: document.Title,
    dateLabel: formatRelativeDate(document.CreatedAt),
    contributorSummary,
    contributorsLabel: strings.contributors(contributorCount),
    attachmentsLabel: strings.attachments(attachmentCount),
    versionLabel: strings.version(document.Version),
    contributorCount,
    attachmentCount,
  };
};
