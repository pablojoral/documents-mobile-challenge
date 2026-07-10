import { act, waitFor } from '@testing-library/react-native';

import { qk } from 'query/keys';
import { renderHookWithQuery } from 'test/renderWithQuery';
import { makeDocument } from 'test/fixtures';
import type { Document } from 'models/models';

import { useAddDocument } from './useAddDocument';

const validFile = { uri: 'file:///a.pdf', name: 'a.pdf', size: 1024, type: 'application/pdf' };

describe('useAddDocument', () => {
  it('resolves successfully', async () => {
    const { result } = renderHookWithQuery(() => useAddDocument());

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('builds a Document from the input and prepends it to an existing cache', async () => {
    const existing = makeDocument({ Title: 'Existing' });
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    // Nothing `useQuery`s this key in this test, so the default `gcTime: 0`
    // would otherwise evict it the moment it's written — pin it for the test.
    client.setQueryDefaults(qk.documents.list(), { gcTime: Infinity });
    client.setQueryData(qk.documents.list(), [existing]);

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.2.3', files: [validFile] });
    });

    const cached = client.getQueryData(qk.documents.list());
    expect(cached).toEqual([
      expect.objectContaining({
        Title: 'Report',
        Version: '1.2.3',
        Attachments: ['a.pdf'],
        Contributors: [{ ID: 'local-user', Name: 'You' }],
      }),
      existing,
    ]);
  });

  it('maps every attached file to the Attachments array', async () => {
    const secondFile = { uri: 'file:///b.pdf', name: 'b.pdf', size: 2048, type: 'application/pdf' };
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    client.setQueryDefaults(qk.documents.list(), { gcTime: Infinity });

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Report',
        version: '1.0.0',
        files: [validFile, secondFile],
      });
    });

    const [created] = client.getQueryData<Document[]>(qk.documents.list())!;
    expect(created.Attachments).toEqual(['a.pdf', 'b.pdf']);
  });

  it('creates the cache entry when none exists yet', async () => {
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    client.setQueryDefaults(qk.documents.list(), { gcTime: Infinity });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });

    const cached = client.getQueryData(qk.documents.list());
    expect(cached).toEqual([expect.objectContaining({ Title: 'Report' })]);
  });

  it('assigns a unique ID and matching CreatedAt/UpdatedAt timestamps', async () => {
    const { result, client } = renderHookWithQuery(() => useAddDocument());
    client.setQueryDefaults(qk.documents.list(), { gcTime: Infinity });

    await act(async () => {
      await result.current.mutateAsync({ name: 'Report', version: '1.0.0', files: [validFile] });
    });

    const [created] = client.getQueryData<Document[]>(qk.documents.list())!;
    expect(created.ID).toBeTruthy();
    expect(created.CreatedAt).toBe(created.UpdatedAt);
  });
});
