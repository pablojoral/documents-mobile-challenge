jest.mock('services/api/apiClient', () => ({
  apiClient: { get: jest.fn() },
}));

import { apiClient } from 'services/api/apiClient';
import { makeDocument } from 'test/fixtures';
import { documentsService } from './DocumentsService';

const mockedGet = apiClient.get as jest.Mock;

describe('DocumentsService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('GETs /documents and returns the response array', async () => {
    const documents = [makeDocument(), makeDocument()];
    mockedGet.mockResolvedValue({ data: documents });

    const result = await documentsService.getDocuments();

    expect(mockedGet).toHaveBeenCalledWith('/documents');
    expect(result).toBe(documents);
  });

  it('propagates errors (no swallowing)', async () => {
    mockedGet.mockRejectedValue(new Error('boom'));
    await expect(documentsService.getDocuments()).rejects.toThrow('boom');
  });
});
