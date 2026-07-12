jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => store.set(key, value),
      remove: (key: string) => store.delete(key),
    })),
  };
});

import { queryPersister } from './persister';

const persistedClient = {
  buster: '',
  timestamp: 1,
  clientState: { queries: [], mutations: [] },
};

describe('queryPersister', () => {
  it('persists and restores a client through the MMKV-backed storage adapter', async () => {
    await queryPersister.persistClient(persistedClient);
    const restored = await queryPersister.restoreClient();
    expect(restored).toEqual(persistedClient);
  });

  it('removes the persisted client', async () => {
    await queryPersister.persistClient(persistedClient);
    await queryPersister.removeClient();
    const restored = await queryPersister.restoreClient();
    expect(restored).toBeUndefined();
  });
});
