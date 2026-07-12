jest.mock('services/api/apiClient', () => ({
  apiClient: { get: jest.fn() },
}));

import { apiClient } from 'services/api/apiClient';
import { makeDocumentsPage } from 'test/fixtures';
import { documentsService } from './DocumentsService';

const mockedGet = apiClient.get as jest.Mock;

describe('DocumentsService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('GETs /documents with the given page/limit/sort and returns the paginated response', async () => {
    const page = makeDocumentsPage({ Page: 2, Limit: 10, Total: 100, HasMore: true });
    mockedGet.mockResolvedValue({ data: page });

    const result = await documentsService.getDocuments(2, 10, 'title-asc');

    expect(mockedGet).toHaveBeenCalledWith('/documents', {
      params: { page: 2, limit: 10, sort: 'title-asc' },
    });
    expect(result).toBe(page);
  });

  it('defaults to page 1, limit 20, sort created-desc', async () => {
    mockedGet.mockResolvedValue({ data: makeDocumentsPage() });

    await documentsService.getDocuments();

    expect(mockedGet).toHaveBeenCalledWith('/documents', {
      params: { page: 1, limit: 20, sort: 'created-desc' },
    });
  });

  it('propagates errors (no swallowing)', async () => {
    mockedGet.mockRejectedValue(new Error('boom'));
    await expect(documentsService.getDocuments()).rejects.toThrow('boom');
  });
});
