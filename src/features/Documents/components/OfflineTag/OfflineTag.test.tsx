import React from 'react';
import { render } from '@testing-library/react-native';

import { OfflineTag } from './OfflineTag';

describe('OfflineTag', () => {
  it('renders the offline label', () => {
    const { getByText } = render(<OfflineTag />);
    expect(getByText('Offline')).toBeTruthy();
  });
});
