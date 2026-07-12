import { act, waitFor } from '@testing-library/react-native';
import type { InfiniteData } from '@tanstack/react-query';

import { qk } from 'query/keys';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { makeDocument } from 'test/fixtures';
import type { Document } from 'models/models';
import type { DocumentsPage } from 'services/api/services/DocumentsService';

import { useAddDocument } from './useAddDocument';

const validFile = { uri: 'file:///a.pdf', name: 'a.pdf', size: 1024, type: 'application/pdf' };

const makeCachedPages = (documents: Document[]): InfiniteData<DocumentsPage> => ({
  pages: [
    { Data: documents, Page: 1, Limit: 20, Total: documents.length, HasMore: false },
  ],
  pageParams: [1],
});

describe('useAddDocument', () => {
  it('resolves successfully', async () => {
    const { result } = renderHookWithQuery(() => useAddDocument());

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('prepends the created document into the cached page for the active sort', async () => {
    const existing = makeDocument({ Title: 'Existing' });
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const key = qk.documents.list('created-desc');
    // Nothing `useInfiniteQuery`s this key in this test, so the default
    // `gcTime: 0` would otherwise evict it the moment it's written — pin it.
    client.setQueryDefaults(key, { gcTime: Infinity });
    client.setQueryData(key, makeCachedPages([existing]));

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.2.3', files: [validFile] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = client.getQueryData<InfiniteData<DocumentsPage>>(key);
    expect(cached?.pages[0].Data).toEqual([
      expect.objectContaining({
        Title: 'Report',
        Version: '1.2.3',
        Attachments: ['a.pdf'],
        Contributors: [{ ID: 'local-user', Name: 'You' }],
      }),
      existing,
    ]);
    expect(cached?.pages[0].Total).toBe(2);
  });

  it('updates every cached sort variant, not just the active one', async () => {
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const descKey = qk.documents.list('created-desc');
    const titleKey = qk.documents.list('title-asc');
    client.setQueryDefaults(descKey, { gcTime: Infinity });
    client.setQueryDefaults(titleKey, { gcTime: Infinity });
    client.setQueryData(descKey, makeCachedPages([]));
    client.setQueryData(titleKey, makeCachedPages([]));

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      client.getQueryData<InfiniteData<DocumentsPage>>(descKey)?.pages[0].Data,
    ).toHaveLength(1);
    expect(
      client.getQueryData<InfiniteData<DocumentsPage>>(titleKey)?.pages[0].Data,
    ).toHaveLength(1);
  });

  it('leaves caches that do not exist yet untouched', async () => {
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const key = qk.documents.list('created-desc');

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(client.getQueryData(key)).toBeUndefined();
  });

  it('maps every attached file to the Attachments array', async () => {
    const secondFile = { uri: 'file:///b.pdf', name: 'b.pdf', size: 2048, type: 'application/pdf' };
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const key = qk.documents.list('created-desc');
    client.setQueryDefaults(key, { gcTime: Infinity });
    client.setQueryData(key, makeCachedPages([]));

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Report',
        version: '1.0.0',
        files: [validFile, secondFile],
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [created] = client.getQueryData<InfiniteData<DocumentsPage>>(key)!
      .pages[0].Data;
    expect(created.Attachments).toEqual(['a.pdf', 'b.pdf']);
  });

  it('assigns a unique ID and matching CreatedAt/UpdatedAt timestamps', async () => {
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    const key = qk.documents.list('created-desc');
    client.setQueryDefaults(key, { gcTime: Infinity });
    client.setQueryData(key, makeCachedPages([]));

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [created] = client.getQueryData<InfiniteData<DocumentsPage>>(key)!
      .pages[0].Data;
    expect(created.ID).toBeTruthy();
    expect(created.CreatedAt).toBe(created.UpdatedAt);
  });
});
