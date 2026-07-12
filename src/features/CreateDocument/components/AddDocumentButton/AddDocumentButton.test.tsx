import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

import { AddDocumentButton } from './AddDocumentButton';

jest.mock('../CreateDocumentModal/CreateDocumentModal', () => ({
  CreateDocumentModal: jest.fn(() => null),
}));

const { CreateDocumentModal } = jest.requireMock(
  '../CreateDocumentModal/CreateDocumentModal',
) as { CreateDocumentModal: jest.Mock };

describe('AddDocumentButton', () => {
  const onDocumentAdded = jest.fn();

  beforeEach(() => {
    CreateDocumentModal.mockClear();
    onDocumentAdded.mockReset();
  });

  it('renders the trigger button', () => {
    const { getByText } = render(<AddDocumentButton onDocumentAdded={onDocumentAdded} />);
    expect(getByText('Add document')).toBeTruthy();
  });

  it('renders the modal closed initially', () => {
    render(<AddDocumentButton onDocumentAdded={onDocumentAdded} />);
    expect(CreateDocumentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: false }),
      undefined,
    );
  });

  it('opens the modal when the button is pressed', () => {
    const { getByText } = render(<AddDocumentButton onDocumentAdded={onDocumentAdded} />);
    fireEvent.press(getByText('Add document'));
    expect(CreateDocumentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: true }),
      undefined,
    );
  });

  it('closes the modal when onClose is called', () => {
    const { getByText } = render(<AddDocumentButton onDocumentAdded={onDocumentAdded} />);
    fireEvent.press(getByText('Add document'));

    const { onClose } = CreateDocumentModal.mock.calls[
      CreateDocumentModal.mock.calls.length - 1
    ][0];
    act(() => onClose());

    expect(CreateDocumentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: false }),
      undefined,
    );
  });

  it('forwards onDocumentAdded as the modal onSuccess', () => {
    const { getByText } = render(<AddDocumentButton onDocumentAdded={onDocumentAdded} />);
    fireEvent.press(getByText('Add document'));

    const { onSuccess } = CreateDocumentModal.mock.calls[
      CreateDocumentModal.mock.calls.length - 1
    ][0];
    onSuccess();

    expect(onDocumentAdded).toHaveBeenCalledTimes(1);
  });
});
