import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Share } from 'react-native';

import { makeDocument, makeUser } from 'test/fixtures';
import { DocumentGridCard } from './DocumentGridCard';

const shareSpy = jest
  .spyOn(Share, 'share')
  .mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

beforeEach(() => {
  shareSpy.mockClear();
});

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

  it('opens the native share sheet on long press', () => {
    const document = makeDocument({ Title: 'Design Spec', Version: '2.0.0' });

    const { getByLabelText } = render(<DocumentGridCard document={document} />);

    fireEvent(getByLabelText('Share Design Spec'), 'longPress');

    expect(shareSpy).toHaveBeenCalledWith({
      title: 'Design Spec',
      message: 'Design Spec (v2.0.0)',
    });
  });
});
