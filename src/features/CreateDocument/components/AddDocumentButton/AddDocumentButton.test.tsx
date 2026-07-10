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
  beforeEach(() => {
    CreateDocumentModal.mockClear();
  });

  it('renders the trigger button', () => {
    const { getByText } = render(<AddDocumentButton />);
    expect(getByText('Add document')).toBeTruthy();
  });

  it('renders the modal closed initially', () => {
    render(<AddDocumentButton />);
    expect(CreateDocumentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: false }),
      undefined,
    );
  });

  it('opens the modal when the button is pressed', () => {
    const { getByText } = render(<AddDocumentButton />);
    fireEvent.press(getByText('Add document'));
    expect(CreateDocumentModal).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: true }),
      undefined,
    );
  });

  it('closes the modal when onClose is called', () => {
    const { getByText } = render(<AddDocumentButton />);
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
});
