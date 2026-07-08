import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';

/** A fresh QueryClient with retries disabled so failed queries settle immediately. */
export const makeTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

const makeWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
};

/** `render` wrapped in SafeAreaProvider + a fresh QueryClientProvider. */
export const renderWithQuery = (ui: ReactElement) => {
  const client = makeTestQueryClient();
  return { client, ...render(ui, { wrapper: makeWrapper(client) }) };
};

/** `renderHook` wrapped in SafeAreaProvider + a fresh QueryClientProvider. */
export const renderHookWithQuery = <TResult,>(hook: () => TResult) => {
  const client = makeTestQueryClient();
  return { client, ...renderHook(hook, { wrapper: makeWrapper(client) }) };
};
