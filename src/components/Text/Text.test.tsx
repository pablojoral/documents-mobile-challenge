import React from 'react';
import { render } from '@testing-library/react-native';

import { Text } from './Text';

describe('Text', () => {
  it('renders its children', () => {
    const { getByText } = render(<Text>Hello</Text>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('passes through RN Text props like numberOfLines', () => {
    const { getByText } = render(
      <Text numberOfLines={1} color="font-secondary">
        Clamped
      </Text>,
    );
    expect(getByText('Clamped').props.numberOfLines).toBe(1);
  });
});
