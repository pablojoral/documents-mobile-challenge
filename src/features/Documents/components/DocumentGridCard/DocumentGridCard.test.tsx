import React from 'react';
import { render } from '@testing-library/react-native';

import { makeDocument, makeUser } from 'test/fixtures';
import { DocumentGridCard } from './DocumentGridCard';

describe('DocumentGridCard', () => {
  it('renders the title, contributor summary, meta row, and attachment count', () => {
    const document = makeDocument({
      Title: 'Design Spec',
      Attachments: ['only-one'],
      Contributors: [makeUser({ Name: 'Ada' }), makeUser({ Name: 'Bob' })],
      Version: '2.0.0',
    });

    const { getByText, queryByText } = render(
      <DocumentGridCard document={document} />,
    );

    expect(getByText('Design Spec')).toBeTruthy();
    expect(getByText('Ada +1')).toBeTruthy();
    expect(getByText('v2.0.0')).toBeTruthy();
    expect(getByText('1 attachment')).toBeTruthy();
    expect(queryByText('2 contributors')).toBeNull();
  });
});
