import React from 'react';
import { render } from '@testing-library/react-native';

import { DocumentsEmptyState } from './DocumentsEmptyState';

describe('DocumentsEmptyState', () => {
  it('renders the empty-state copy', () => {
    const { getByText } = render(<DocumentsEmptyState />);
    expect(getByText('No documents yet')).toBeTruthy();
  });
});
