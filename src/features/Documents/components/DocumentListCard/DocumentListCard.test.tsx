import React from 'react';
import { render } from '@testing-library/react-native';

import { makeDocument, makeUser } from 'test/fixtures';
import { DocumentListCard } from './DocumentListCard';

describe('DocumentListCard', () => {
  it('renders the title, meta row, and vertical contributor/attachment lists with titles', () => {
    const document = makeDocument({
      Title: 'Quarterly Report',
      Attachments: ['a', 'b'],
      Contributors: [makeUser({ Name: 'Ada' }), makeUser({ Name: 'Bob' })],
      Version: '2.0.0',
    });

    const { getByText, queryByText } = render(
      <DocumentListCard document={document} />,
    );

    expect(getByText('Quarterly Report')).toBeTruthy();
    expect(getByText('v2.0.0')).toBeTruthy();
    expect(getByText('Contributors')).toBeTruthy();
    expect(getByText('Ada')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Attachments')).toBeTruthy();
    expect(getByText('a')).toBeTruthy();
    expect(getByText('b')).toBeTruthy();
    expect(queryByText('Ada +1')).toBeNull();
    expect(queryByText('Ada, Bob')).toBeNull();
    expect(queryByText('2 contributors')).toBeNull();
    expect(queryByText('2 attachments')).toBeNull();
  });

  it('omits the contributor and attachment footer columns when both are empty', () => {
    const document = makeDocument({
      Title: 'Empty Footer Doc',
      Contributors: [],
      Attachments: [],
    });

    const { getByText, queryByText } = render(
      <DocumentListCard document={document} />,
    );

    expect(getByText('Empty Footer Doc')).toBeTruthy();
    expect(queryByText('Contributors')).toBeNull();
    expect(queryByText('Attachments')).toBeNull();
  });
});
