/**
 * Shared label builders for the document cards (list + grid). Kept in one hook
 * so both card variants render identical copy.
 */
export const useDocumentCardStrings = () => {
  return {
    attachments: (count: number) =>
      `${count} ${count === 1 ? 'attachment' : 'attachments'}`,
    version: (version: string) => `v${version}`,
    andOthers: (count: number) => `+${count}`,
    contributorsTitle: 'Contributors',
    attachmentsTitle: 'Attachments',
    shareLabel: (title: string) => `Share ${title}`,
    shareMessage: (title: string, versionLabel: string) =>
      `${title} (${versionLabel})`,
  };
};
