import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from './client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app in the shared QueryClient. Mount once, near the root, inside
 * any providers it depends on (e.g. SafeAreaProvider).
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
