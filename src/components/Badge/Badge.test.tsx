import React from 'react';
import { render } from '@testing-library/react-native';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the count', () => {
    const { getByText } = render(<Badge count={3} />);
    expect(getByText('3')).toBeTruthy();
  });

  it('renders nothing when count is zero', () => {
    const { queryByText, toJSON } = render(<Badge count={0} />);
    expect(queryByText('0')).toBeNull();
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when count is negative', () => {
    const { toJSON } = render(<Badge count={-1} />);
    expect(toJSON()).toBeNull();
  });

  it('caps the display at max, showing "max+"', () => {
    const { getByText } = render(<Badge count={150} max={99} />);
    expect(getByText('99+')).toBeTruthy();
  });

  it('shows the exact count when at or below the default max', () => {
    const { getByText } = render(<Badge count={99} />);
    expect(getByText('99')).toBeTruthy();
  });
});
