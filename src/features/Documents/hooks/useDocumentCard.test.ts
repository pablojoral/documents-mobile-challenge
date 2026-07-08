import { renderHook } from '@testing-library/react-native';

import { makeDocument, makeUser } from 'test/fixtures';
import { useDocumentCard } from './useDocumentCard';

const cardFor = (document: ReturnType<typeof makeDocument>) =>
  renderHook(() => useDocumentCard(document)).result.current;

describe('useDocumentCard', () => {
  it('passes through the title and version', () => {
    const card = cardFor(makeDocument({ Title: 'Report', Version: '3.4.5' }));
    expect(card.title).toBe('Report');
    expect(card.versionLabel).toBe('v3.4.5');
  });

  it('summarizes contributors as "First +N" when there are several', () => {
    const card = cardFor(
      makeDocument({
        Contributors: [
          makeUser({ Name: 'Ada' }),
          makeUser({ Name: 'Bob' }),
          makeUser({ Name: 'Cy' }),
        ],
      }),
    );
    expect(card.contributorSummary).toBe('Ada +2');
    expect(card.contributorsLabel).toBe('3 contributors');
    expect(card.contributorCount).toBe(3);
  });

  it('shows just the name for a single contributor (no +N)', () => {
    const card = cardFor(
      makeDocument({ Contributors: [makeUser({ Name: 'Solo' })] }),
    );
    expect(card.contributorSummary).toBe('Solo');
  });

  it('handles zero contributors', () => {
    const card = cardFor(makeDocument({ Contributors: [] }));
    expect(card.contributorSummary).toBe('');
    expect(card.contributorsLabel).toBe('0 contributors');
  });

  it('reports the attachment count/label', () => {
    const card = cardFor(makeDocument({ Attachments: ['a', 'b'] }));
    expect(card.attachmentCount).toBe(2);
    expect(card.attachmentsLabel).toBe('2 attachments');
  });
});
