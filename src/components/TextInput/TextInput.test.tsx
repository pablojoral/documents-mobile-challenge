import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders the label', () => {
    const { getByText } = render(
      <TextInput label="Title" value="" onChangeText={jest.fn()} />,
    );
    expect(getByText('Title')).toBeTruthy();
  });

  it('renders the current value', () => {
    const { getByDisplayValue } = render(
      <TextInput label="Title" value="Hello" onChangeText={jest.fn()} />,
    );
    expect(getByDisplayValue('Hello')).toBeTruthy();
  });

  it('calls onChangeText when the input changes', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <TextInput label="Title" value="Hello" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByDisplayValue('Hello'), 'Hello world');
    expect(onChangeText).toHaveBeenCalledWith('Hello world');
  });

  it('renders the error message when error is set', () => {
    const { getByText } = render(
      <TextInput
        label="Title"
        value=""
        onChangeText={jest.fn()}
        error="Title is required"
      />,
    );
    expect(getByText('Title is required')).toBeTruthy();
  });

  it('does not render an error message when error is omitted', () => {
    const { queryByText } = render(
      <TextInput label="Title" value="" onChangeText={jest.fn()} />,
    );
    expect(queryByText('Title is required')).toBeNull();
  });

  it('is reachable via its accessibility label', () => {
    const { getByLabelText } = render(
      <TextInput label="Title" value="" onChangeText={jest.fn()} />,
    );
    expect(getByLabelText('Title')).toBeTruthy();
  });
});
