import React from 'react';
import { render } from '@testing-library/react-native';

import { makeDocument } from 'test/fixtures';
import { DocumentGridCard } from './DocumentGridCard';

describe('DocumentGridCard', () => {
  it('renders the title and count labels', () => {
    const document = makeDocument({
      Title: 'Design Spec',
      Attachments: ['only-one'],
    });

    const { getByText } = render(<DocumentGridCard document={document} />);

    expect(getByText('Design Spec')).toBeTruthy();
    expect(getByText('1 attachment')).toBeTruthy();
  });
});
