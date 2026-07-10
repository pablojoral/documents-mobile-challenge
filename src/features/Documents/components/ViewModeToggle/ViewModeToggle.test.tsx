import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ViewModeToggle } from './ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders both segments', () => {
    const { getByLabelText } = render(
      <ViewModeToggle value="list" onChange={jest.fn()} />,
    );
    expect(getByLabelText('List')).toBeTruthy();
    expect(getByLabelText('Grid')).toBeTruthy();
  });

  it('calls onChange with the pressed mode', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <ViewModeToggle value="list" onChange={onChange} />,
    );
    fireEvent.press(getByLabelText('Grid'));
    expect(onChange).toHaveBeenCalledWith('grid');
  });
});
