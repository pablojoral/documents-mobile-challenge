jest.mock('services/api/apiClient', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

import { apiClient } from 'services/api/apiClient';
import { makeDocument, makeDocumentsPage } from 'test/fixtures';
import { documentsService } from './DocumentsService';

const mockedGet = apiClient.get as jest.Mock;
const mockedPost = apiClient.post as jest.Mock;

describe('DocumentsService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedPost.mockReset();
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

  it('POSTs /documents with the given payload and returns the created document', async () => {
    const created = makeDocument({ Title: 'Report' });
    mockedPost.mockResolvedValue({ data: created });

    const payload = {
      Title: 'Report',
      Version: '1.0.0',
      Attachments: ['a.pdf'],
      Contributors: [{ ID: 'local-user', Name: 'You' }],
    };
    const result = await documentsService.createDocument(payload);

    expect(mockedPost).toHaveBeenCalledWith('/documents', payload);
    expect(result).toBe(created);
  });

  it('propagates create errors (no swallowing)', async () => {
    mockedPost.mockRejectedValue(new Error('boom'));
    await expect(
      documentsService.createDocument({
        Title: 'Report',
        Version: '1.0.0',
        Attachments: [],
        Contributors: [],
      }),
    ).rejects.toThrow('boom');
  });
});
