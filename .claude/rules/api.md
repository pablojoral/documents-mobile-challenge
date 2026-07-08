---
description: API layer rules — client, services, query hooks, and query keys
---

# API Rules

## Architecture overview

```
component / screen hook
  └── src/query/<Resource>/use<Action><Resource>.ts   ← TanStack Query hook
        └── src/services/api/services/<Resource>Service.ts   ← service class
              └── src/services/api/apiClient.ts              ← single Axios instance
```

---

## 1. Always use `apiClient` — never instantiate HTTP clients directly

All HTTP calls must go through the shared Axios instance at `services/api/apiClient.ts`. It handles base URL, timeout, and Firebase ID token injection on every request.

```ts
// BAD
import axios from 'axios';
const res = await axios.get('/history');

// BAD
fetch(`${API_BASE_URL}/history`);

// GOOD
import { apiClient } from 'services/api/apiClient';
const res = await apiClient.get('/history');
```

---

## 2. All API calls go through a service class

Every resource has a dedicated service that extends `BaseService` and exports a singleton. No component, hook, or store may call `apiClient` directly.

```ts
// services/api/services/HistoryService.ts
import { BaseService } from '../BaseService';

class HistoryService extends BaseService {
  async getHistory(page = 1, limit = 20): Promise<HistoryPage> {
    const res = await this.apiClient.get<HistoryPage>('/history', { params: { page, limit } });
    return res.data;
  }
}

export const historyService = new HistoryService();
```

Rules for services:
- Class name: `<Resource>Service`
- File: `services/api/services/<Resource>Service.ts`
- Always extends `BaseService`
- Always exports a singleton: `export const <resource>Service = new <Resource>Service()`
- Response types and request types are defined in the **same file** as the service
- **No try/catch that only rethrows** — let errors propagate naturally; TanStack Query handles them

```ts
// BAD — pointless try/catch
async list(): Promise<Laundry[]> {
  try {
    const res = await this.apiClient.get<Laundry[]>('/laundries');
    return res.data;
  } catch (error) {
    throw error; // adds nothing
  }
}

// GOOD
async list(): Promise<Laundry[]> {
  const res = await this.apiClient.get<Laundry[]>('/laundries');
  return res.data;
}
```

---

## 3. All data fetching and mutations use TanStack Query

Never call a service method directly from a component hook, store, or component. All reads use `useQuery` / `useInfiniteQuery`; all writes use `useMutation`.

```ts
// BAD — calling service directly in a component hook
const [items, setItems] = useState([]);
useEffect(() => {
  historyService.getHistory().then(setItems);
}, []);

// GOOD
const { data, isLoading } = useHistory();
```

---

## 4. All query and mutation hooks live under `src/query/<Resource>/`

```
src/query/
  keys.ts
  client.ts
  provider.tsx
  History/
    useHistory.ts        ← useInfiniteQuery
    useHistoryStats.ts   ← useQuery
  MyLaundries/
    useMyLaundries.ts    ← useQuery
    useAddMyLaundry.ts   ← useMutation
    useRemoveMyLaundry.ts
```

Naming conventions:

| Type | Pattern | Example |
|---|---|---|
| Query (list) | `use<Resource>s.ts` | `useMyLaundries.ts` |
| Query (detail) | `use<Resource>.ts` | `useHistoryStats.ts` |
| Infinite query | `use<Resource>s.ts` | `useHistory.ts` |
| Mutation (create) | `useAdd<Resource>.ts` | `useAddMyLaundry.ts` |
| Mutation (update) | `useUpdate<Resource>.ts` | `useUpdateSettings.ts` |
| Mutation (delete) | `useRemove<Resource>.ts` | `useRemoveMyLaundry.ts` |
| Mutation (action) | `use<Verb><Resource>.ts` | `useSubmitReport.ts` |

---

## 5. All query keys come from `qk` in `src/query/keys.ts`

Never hardcode query key arrays inline. Every resource has an entry in `qk` with at minimum a `root` and named factory functions for each operation.

```ts
// BAD
useQuery({ queryKey: ['history', 'stats'], ... });

// GOOD
useQuery({ queryKey: qk.history.stats(), ... });
```

Structure for a new resource:

```ts
// src/query/keys.ts
export const qk = {
  // ...existing keys...
  history: {
    root:  ['history'] as const,
    list:  () => ['history', 'list'] as const,
    stats: () => ['history', 'stats'] as const,
  },
};
```

Rules:
- `root` is always a plain array — used for broad invalidation (`queryClient.invalidateQueries({ queryKey: qk.history.root })`)
- Parameterized keys include params as the last element: `(id: string) => ['resource', 'detail', id] as const`
- Always use `as const` on all key arrays

---

## 6. Mutations must invalidate affected queries on success

Any mutation that changes server state must call `queryClient.invalidateQueries` in `onSuccess` to keep the UI consistent. Prefer invalidating the `root` key to catch all related queries.

```ts
// GOOD
export function useAddMyLaundry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (laundryId: number) => myLaundriesService.add(laundryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myLaundries.root });
    },
  });
}
```

Use a more specific key only when a root invalidation would be unnecessarily expensive.

---

## 7. Response and request types are co-located in the service file

Types that describe the API contract belong in the service file, not in `models/`. Only domain model types that are shared across multiple services belong in `src/models/models.ts`.

```ts
// services/api/services/HistoryService.ts

// These types describe the API shape — they live here
export interface HistoryItem { ... }
export interface HistoryPage { ... }
export interface HistoryStats { ... }

class HistoryService extends BaseService { ... }
export const historyService = new HistoryService();
```

The query hook then re-exports or imports these types directly from the service:

```ts
import { historyService, HistoryPage } from 'services/api/services/HistoryService';
```

---

## 8. `staleTime` overrides belong in the query hook, not in `queryClient`

The global `queryClient` in `src/query/client.ts` defines the default `staleTime` (currently 30s). Override per-query only when the resource has meaningfully different freshness requirements.

```ts
// GOOD — stats only need to refresh every minute
export function useHistoryStats() {
  return useQuery<HistoryStats>({
    queryKey: qk.history.stats(),
    queryFn: () => historyService.getStats(),
    staleTime: 60 * 1000,
  });
}
```
