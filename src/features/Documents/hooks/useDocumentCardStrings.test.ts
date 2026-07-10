import { renderHook } from '@testing-library/react-native';

import { useDocumentCardStrings } from './useDocumentCardStrings';

describe('useDocumentCardStrings', () => {
  const strings = () => renderHook(() => useDocumentCardStrings()).result.current;

  it('pluralizes attachments', () => {
    expect(strings().attachments(1)).toBe('1 attachment');
    expect(strings().attachments(0)).toBe('0 attachments');
  });

  it('formats version and extra-contributor counts', () => {
    expect(strings().version('2.1.0')).toBe('v2.1.0');
    expect(strings().andOthers(4)).toBe('+4');
  });

  it('exposes the footer column titles', () => {
    expect(strings().contributorsTitle).toBe('Contributors');
    expect(strings().attachmentsTitle).toBe('Attachments');
  });

  it('builds the share label and message', () => {
    expect(strings().shareLabel('Report')).toBe('Share Report');
    expect(strings().shareMessage('Report', 'v2.1.0')).toBe('Report (v2.1.0)');
  });
});
