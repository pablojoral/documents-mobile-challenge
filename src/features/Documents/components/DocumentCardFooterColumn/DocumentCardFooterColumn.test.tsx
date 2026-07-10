import React from 'react';
import { render } from '@testing-library/react-native';

import { DocumentCardFooterColumn } from './DocumentCardFooterColumn';

describe('DocumentCardFooterColumn', () => {
  it('renders the title and each item', () => {
    const { getByText } = render(
      <DocumentCardFooterColumn
        iconName="users"
        iconColor="font-brand"
        title="Contributors"
        titleColor="font-brand"
        items={['Ada', 'Bob']}
      />,
    );

    expect(getByText('Contributors')).toBeTruthy();
    expect(getByText('Ada')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
  });

  it('renders no items when the list is empty', () => {
    const { getByText, queryByText } = render(
      <DocumentCardFooterColumn
        iconName="paperclip"
        iconColor="font-secondary"
        title="Attachments"
        titleColor="font-secondary"
        items={[]}
      />,
    );

    expect(getByText('Attachments')).toBeTruthy();
    expect(queryByText('a.pdf')).toBeNull();
  });
});
