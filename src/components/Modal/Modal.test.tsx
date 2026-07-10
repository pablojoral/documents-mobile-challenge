import React from 'react';
import { KeyboardAvoidingView, Text as RNText } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { Modal } from './Modal';

describe('Modal', () => {
  it('renders the title and children when visible', () => {
    const { getByText } = render(
      <Modal visible onClose={jest.fn()} title="Add document" closeLabel="Close">
        <RNText>Form body</RNText>
      </Modal>,
    );
    expect(getByText('Add document')).toBeTruthy();
    expect(getByText('Form body')).toBeTruthy();
  });

  it('renders nothing visible when not visible', () => {
    const { queryByText } = render(
      <Modal visible={false} onClose={jest.fn()} title="Add document" closeLabel="Close">
        <RNText>Form body</RNText>
      </Modal>,
    );
    expect(queryByText('Add document')).toBeNull();
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <Modal visible onClose={onClose} title="Add document" closeLabel="Close">
        <RNText>Form body</RNText>
      </Modal>,
    );
    fireEvent.press(getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <Modal visible onClose={onClose} title="Add document" closeLabel="Close">
        <RNText>Form body</RNText>
      </Modal>,
    );
    fireEvent.press(getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not wrap in a KeyboardAvoidingView by default', () => {
    const { UNSAFE_queryByType } = render(
      <Modal visible onClose={jest.fn()} title="Add document" closeLabel="Close">
        <RNText>Form body</RNText>
      </Modal>,
    );
    expect(UNSAFE_queryByType(KeyboardAvoidingView)).toBeNull();
  });

  it('wraps in a KeyboardAvoidingView when avoidsKeyboard is set', () => {
    const { UNSAFE_queryByType } = render(
      <Modal visible onClose={jest.fn()} title="Add document" closeLabel="Close" avoidsKeyboard>
        <RNText>Form body</RNText>
      </Modal>,
    );
    expect(UNSAFE_queryByType(KeyboardAvoidingView)).toBeTruthy();
  });
});
