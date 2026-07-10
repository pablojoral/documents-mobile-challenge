import React from 'react';
import { render } from '@testing-library/react-native';

import { IconLabel } from './IconLabel';

describe('IconLabel', () => {
  it('renders the label', () => {
    const { getByText } = render(
      <IconLabel
        iconName="users"
        iconColor="font-brand"
        label="Ada, Bob"
        labelColor="font-secondary"
      />,
    );

    expect(getByText('Ada, Bob')).toBeTruthy();
  });

  it('renders the label when truncation is enabled', () => {
    const { getByText } = render(
      <IconLabel
        iconName="paperclip"
        iconColor="font-secondary"
        label="a.pdf"
        labelColor="font-secondary"
        numberOfLines={1}
      />,
    );

    expect(getByText('a.pdf')).toBeTruthy();
  });
});
