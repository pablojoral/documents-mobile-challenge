import React from 'react';
import Svg from 'react-native-svg';
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

  it('marks the active option with a check icon', () => {
    const { getAllByText, UNSAFE_getAllByType } = render(
      <SortSelector value="title-asc" onChange={jest.fn()} />,
    );
    // Only the trigger's chevron-down icon renders before the sheet opens.
    expect(UNSAFE_getAllByType(Svg)).toHaveLength(1);

    fireEvent.press(getAllByText('Title (A–Z)')[0]); // open
    // The trigger's chevron plus the active option's check icon.
    expect(UNSAFE_getAllByType(Svg)).toHaveLength(2);
  });

  it('does not open the sheet when disabled', () => {
    const onChange = jest.fn();
    const { getAllByText, queryByText } = render(
      <SortSelector value="created-desc" onChange={onChange} disabled />,
    );

    fireEvent.press(getAllByText('Newest first')[0]);

    expect(queryByText('Oldest first')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks the trigger as disabled for accessibility', () => {
    const { getByRole } = render(
      <SortSelector value="created-desc" onChange={jest.fn()} disabled />,
    );
    expect(getByRole('button').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });
});
