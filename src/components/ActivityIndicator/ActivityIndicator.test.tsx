import React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';
import { render } from '@testing-library/react-native';

import { ActivityIndicator } from './ActivityIndicator';

describe('ActivityIndicator', () => {
  it('renders the underlying RN ActivityIndicator', () => {
    const { UNSAFE_getByType } = render(<ActivityIndicator />);
    expect(UNSAFE_getByType(RNActivityIndicator)).toBeTruthy();
  });
});
