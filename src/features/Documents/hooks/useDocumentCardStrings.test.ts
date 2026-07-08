import { renderHook } from '@testing-library/react-native';

import { useDocumentCardStrings } from './useDocumentCardStrings';

describe('useDocumentCardStrings', () => {
  const strings = () => renderHook(() => useDocumentCardStrings()).result.current;

  it('pluralizes contributors', () => {
    expect(strings().contributors(1)).toBe('1 contributor');
    expect(strings().contributors(3)).toBe('3 contributors');
  });

  it('pluralizes attachments', () => {
    expect(strings().attachments(1)).toBe('1 attachment');
    expect(strings().attachments(0)).toBe('0 attachments');
  });

  it('formats version and extra-contributor counts', () => {
    expect(strings().version('2.1.0')).toBe('v2.1.0');
    expect(strings().andOthers(4)).toBe('+4');
  });
});
