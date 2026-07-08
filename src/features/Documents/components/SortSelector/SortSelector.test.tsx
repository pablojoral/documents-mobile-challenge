import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { SortSelector } from './SortSelector';

describe('SortSelector', () => {
  it('shows the current selection on the trigger', () => {
    const { getAllByText } = render(
      <SortSelector value="created-desc" onChange={jest.fn()} />,
    );
    // "Newest first" appears on the trigger (and as the active option in the sheet).
    expect(getAllByText('Newest first').length).toBeGreaterThan(0);
  });

  it('opens the sheet and calls onChange with the chosen sort', () => {
    const onChange = jest.fn();
    const { getByText, getAllByText } = render(
      <SortSelector value="created-desc" onChange={onChange} />,
    );

    fireEvent.press(getAllByText('Newest first')[0]); // open
    fireEvent.press(getByText('Oldest first')); // choose a distinct option

    expect(onChange).toHaveBeenCalledWith('created-asc');
  });

  it('marks the active option with a check', () => {
    const { getAllByText, getByText } = render(
      <SortSelector value="title-asc" onChange={jest.fn()} />,
    );
    fireEvent.press(getAllByText('Title (A–Z)')[0]); // open
    expect(getByText('✓')).toBeTruthy();
  });
});
