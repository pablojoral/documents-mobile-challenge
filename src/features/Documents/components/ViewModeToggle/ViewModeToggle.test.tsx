import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ViewModeToggle } from './ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders both segments', () => {
    const { getByText } = render(
      <ViewModeToggle value="list" onChange={jest.fn()} />,
    );
    expect(getByText('List')).toBeTruthy();
    expect(getByText('Grid')).toBeTruthy();
  });

  it('calls onChange with the pressed mode', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ViewModeToggle value="list" onChange={onChange} />,
    );
    fireEvent.press(getByText('Grid'));
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
