import React from 'react';
import { render } from '@testing-library/react-native';

import { DocumentMetaRow } from './DocumentMetaRow';

describe('DocumentMetaRow', () => {
  it('renders the date and version labels', () => {
    const { getByText } = render(
      <DocumentMetaRow dateLabel="2 days ago" versionLabel="v1.0.0" />,
    );

    expect(getByText('2 days ago')).toBeTruthy();
    expect(getByText('v1.0.0')).toBeTruthy();
  });
});
