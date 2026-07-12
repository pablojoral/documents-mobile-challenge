jest.mock('services/api/services/DocumentsService', () => ({
  documentsService: { createDocument: jest.fn() },
}));

import { act, waitFor } from '@testing-library/react-native';

import { qk } from 'query/keys';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { makeDocument } from 'test/fixtures';
import { documentsService } from 'services/api/services/DocumentsService';

import { useAddDocument } from './useAddDocument';

const mockedCreateDocument = documentsService.createDocument as jest.Mock;

const validFile = { uri: 'file:///a.pdf', name: 'a.pdf', size: 1024, type: 'application/pdf' };

describe('useAddDocument', () => {
  beforeEach(() => {
    mockedCreateDocument.mockReset();
  });

  it('calls the service with the mapped payload', async () => {
    mockedCreateDocument.mockResolvedValue(makeDocument());
    const { result } = renderHookWithQuery(() => useAddDocument());

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedCreateDocument).toHaveBeenCalledWith({
      Title: 'Report',
      Version: '1.0.0',
      Attachments: ['a.pdf'],
      Contributors: [{ ID: 'local-user', Name: 'You' }],
    });
  });

  it('invalidates every cached documents query on success', async () => {
    mockedCreateDocument.mockResolvedValue(makeDocument());
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const invalidateQueries = jest.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: qk.documents.root });
  });

  it('maps every attached file to the Attachments array', async () => {
    mockedCreateDocument.mockResolvedValue(makeDocument());
    const secondFile = { uri: 'file:///b.pdf', name: 'b.pdf', size: 2048, type: 'application/pdf' };
    const { result } = renderHookWithQuery(() => useAddDocument());

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Report',
        version: '1.0.0',
        files: [validFile, secondFile],
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ Attachments: ['a.pdf', 'b.pdf'] }),
    );
  });

  it('propagates errors from the service and does not invalidate (no swallowing)', async () => {
    mockedCreateDocument.mockRejectedValue(new Error('boom'));
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const invalidateQueries = jest.spyOn(client, 'invalidateQueries');

    await act(async () => {
      await expect(
        result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] }),
      ).rejects.toThrow('boom');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
