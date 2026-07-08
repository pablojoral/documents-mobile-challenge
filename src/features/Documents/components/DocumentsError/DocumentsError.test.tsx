import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { DocumentsError } from './DocumentsError';

describe('DocumentsError', () => {
  it('renders the error copy', () => {
    const { getByText } = render(<DocumentsError onRetry={jest.fn()} />);
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onRetry when the retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<DocumentsError onRetry={onRetry} />);
    fireEvent.press(getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
