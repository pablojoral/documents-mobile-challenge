import React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { queryClient } from './client';
import { queryPersister } from './persister';
import { setupOnlineManager } from './onlineManager';

setupOnlineManager();

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in the shared QueryClient. Mount once, near the root, inside
 * any providers it depends on (e.g. SafeAreaProvider). The client is
 * persisted to MMKV (`persister.ts`) so the last successful documents feed
 * is still readable offline, and online detection is wired to NetInfo
 * (`onlineManager.ts`) so queries pause instead of erroring while offline.
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister }}>
      {children}
    </PersistQueryClientProvider>
  );
};
