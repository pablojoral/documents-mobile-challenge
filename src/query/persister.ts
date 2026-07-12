import { createMMKV } from 'react-native-mmkv';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const storage = createMMKV({ id: 'documents-query-cache' });

/** Adapts MMKV's synchronous key/value API to the storage shape `createAsyncStoragePersister` expects. */
const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const queryPersister = createAsyncStoragePersister({
  storage: mmkvStorage,
  key: 'DOCUMENTS_MOBILE_QUERY_CACHE',
});
