jest.mock('services/api/services/DocumentsService', () => ({
  documentsService: { getDocuments: jest.fn() },
}));

import { act, waitFor } from '@testing-library/react-native';

import { documentsService } from 'services/api/services/DocumentsService';
import { makeDocumentsPage } from 'test/fixtures';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { useDocuments } from './useDocuments';

const mockedGetDocuments = documentsService.getDocuments as jest.Mock;

describe('useDocuments', () => {
  beforeEach(() => {
    mockedGetDocuments.mockReset();
  });

  it('fetches the first page for the given sort and exposes it in data.pages', async () => {
    const page = makeDocumentsPage();
    mockedGetDocuments.mockResolvedValue(page);

    const { result } = renderHookWithQuery(() =>
      useDocuments('created-desc'),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toEqual([page]);
    expect(mockedGetDocuments).toHaveBeenCalledWith(1, 20, 'created-desc');
  });

  it('fetches and appends the next page when HasMore is true', async () => {
    const firstPage = makeDocumentsPage({ Page: 1, HasMore: true });
    const secondPage = makeDocumentsPage({ Page: 2, HasMore: false });
    mockedGetDocuments
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    const { result } = renderHookWithQuery(() =>
      useDocuments('created-desc'),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(result.current.data?.pages).toEqual([firstPage, secondPage]),
    );
    expect(mockedGetDocuments).toHaveBeenNthCalledWith(
      2,
      2,
      20,
      'created-desc',
    );
  });

  it('stops paginating once HasMore is false', async () => {
    mockedGetDocuments.mockResolvedValue(
      makeDocumentsPage({ Page: 1, HasMore: false }),
    );

    const { result } = renderHookWithQuery(() =>
      useDocuments('created-desc'),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('surfaces the error state when the fetch fails', async () => {
    mockedGetDocuments.mockRejectedValue(new Error('network'));

    const { result } = renderHookWithQuery(() =>
      useDocuments('created-desc'),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
