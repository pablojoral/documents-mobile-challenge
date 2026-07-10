import React from 'react';
import Svg from 'react-native-svg';
import { render, fireEvent } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    const { getByText } = render(<Button label="Save" onPress={jest.fn()} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Save" onPress={onPress} />);
    fireEvent.press(getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Save" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner instead of the label while loading, and blocks press', () => {
    const onPress = jest.fn();
    const { queryByText, getByRole } = render(
      <Button label="Save" onPress={onPress} loading />,
    );
    expect(queryByText('Save')).toBeNull();
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a leading icon when icon is set', () => {
    const { UNSAFE_queryByType } = render(
      <Button label="Add document" onPress={jest.fn()} icon="plus" />,
    );
    expect(UNSAFE_queryByType(Svg)).toBeTruthy();
  });

  it('renders no icon by default', () => {
    const { UNSAFE_queryByType } = render(
      <Button label="Save" onPress={jest.fn()} />,
    );
    expect(UNSAFE_queryByType(Svg)).toBeNull();
  });
});
