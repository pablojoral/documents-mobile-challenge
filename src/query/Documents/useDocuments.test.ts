jest.mock('services/api/services/DocumentsService', () => ({
  documentsService: { getDocuments: jest.fn() },
}));

import { waitFor } from '@testing-library/react-native';

import { documentsService } from 'services/api/services/DocumentsService';
import { makeDocument } from 'test/fixtures';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { useDocuments } from './useDocuments';

const mockedGetDocuments = documentsService.getDocuments as jest.Mock;

describe('useDocuments', () => {
  beforeEach(() => {
    mockedGetDocuments.mockReset();
  });

  it('fetches documents and exposes them as data', async () => {
    const documents = [makeDocument(), makeDocument()];
    mockedGetDocuments.mockResolvedValue(documents);

    const { result } = renderHookWithQuery(() => useDocuments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(documents);
    expect(mockedGetDocuments).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error state when the fetch fails', async () => {
    mockedGetDocuments.mockRejectedValue(new Error('network'));

    const { result } = renderHookWithQuery(() => useDocuments());

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
