import React from 'react';
import { render } from '@testing-library/react-native';

import { makeDocument, makeUser } from 'test/fixtures';
import { DocumentListCard } from './DocumentListCard';

describe('DocumentListCard', () => {
  it('renders the title and contributor/attachment labels', () => {
    const document = makeDocument({
      Title: 'Quarterly Report',
      Attachments: ['a', 'b'],
      Contributors: [makeUser({ Name: 'Ada' }), makeUser({ Name: 'Bob' })],
      Version: '2.0.0',
    });

    const { getByText } = render(<DocumentListCard document={document} />);

    expect(getByText('Quarterly Report')).toBeTruthy();
    expect(getByText('Ada +1')).toBeTruthy();
    expect(getByText('2 contributors')).toBeTruthy();
    expect(getByText('2 attachments')).toBeTruthy();
    expect(getByText('v2.0.0')).toBeTruthy();
  });
});
