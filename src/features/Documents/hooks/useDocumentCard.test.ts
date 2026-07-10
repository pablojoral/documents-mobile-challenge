import { act, renderHook } from '@testing-library/react-native';
import { Share } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

import { makeDocument, makeUser } from 'test/fixtures';
import { useDocumentCard } from './useDocumentCard';

const shareSpy = jest
  .spyOn(Share, 'share')
  .mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));
const triggerMock = trigger as jest.Mock;

const cardFor = (document: ReturnType<typeof makeDocument>) =>
  renderHook(() => useDocumentCard(document)).result.current;

beforeEach(() => {
  shareSpy.mockClear();
  triggerMock.mockClear();
});

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
    expect(card.contributorNames).toEqual(['Ada', 'Bob', 'Cy']);
    expect(card.contributorCount).toBe(3);
  });

  it('shows just the name for a single contributor (no +N)', () => {
    const card = cardFor(
      makeDocument({ Contributors: [makeUser({ Name: 'Solo' })] }),
    );
    expect(card.contributorSummary).toBe('Solo');
    expect(card.contributorNames).toEqual(['Solo']);
  });

  it('handles zero contributors', () => {
    const card = cardFor(makeDocument({ Contributors: [] }));
    expect(card.contributorSummary).toBe('');
    expect(card.contributorNames).toEqual([]);
  });

  it('reports the attachment count/label and names', () => {
    const card = cardFor(makeDocument({ Attachments: ['a', 'b'] }));
    expect(card.attachmentCount).toBe(2);
    expect(card.attachmentsLabel).toBe('2 attachments');
    expect(card.attachmentNames).toEqual(['a', 'b']);
  });

  it('exposes the footer column titles', () => {
    const card = cardFor(makeDocument());
    expect(card.contributorsTitle).toBe('Contributors');
    expect(card.attachmentsTitle).toBe('Attachments');
  });

  it('exposes the share label for the document', () => {
    const card = cardFor(makeDocument({ Title: 'Report' }));
    expect(card.shareLabel).toBe('Share Report');
  });

  it('shares the title and version via the native share sheet', () => {
    const card = cardFor(makeDocument({ Title: 'Report', Version: '2.1.0' }));

    act(() => card.handleShare());

    expect(shareSpy).toHaveBeenCalledWith({
      title: 'Report',
      message: 'Report (v2.1.0)',
    });
  });

  it('triggers a haptic when sharing', () => {
    const card = cardFor(makeDocument());

    act(() => card.handleShare());

    expect(triggerMock).toHaveBeenCalledWith('impactHeavy');
  });
});
