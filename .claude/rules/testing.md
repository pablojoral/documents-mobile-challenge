# Testing Rules

## Stack

Tests run on **Jest** with the **`@react-native/jest-preset`** preset and
**React Native Testing Library (RNTL)** for anything that renders. Config lives in
`jest.config.js` + `jest.setup.ts`. Run with `yarn jest` (or `yarn test`).

- Use **RNTL** (`@testing-library/react-native`) to render components and hooks — never
  bare `react-test-renderer` for component tests.
- The pinned RNTL major (v13) is the one that pairs with `react-test-renderer`. Do not
  upgrade to a major that requires the separate `test-renderer` package without verifying
  it works with this RN version.

---

## 1. Co-locate test files as `*.test.ts(x)`

Each test sits next to the unit it covers; only cross-cutting harness code lives in `test/`.

```
src/features/History/utils/sortHistory.ts
src/features/History/utils/sortHistory.test.ts   ← beside its unit
test/                                            ← shared helpers only
  fixtures.ts  renderWithQuery.tsx  mockWebSocket.ts
```

---

## 2. Tests must be deterministic — no real time, network, or sockets

Every test controls its inputs. Nothing hits the OS clock, the network, or a real socket.

| Dependency | How to control it |
|---|---|
| `Date.now()` / relative dates | `jest.useFakeTimers().setSystemTime(fixedDate)` |
| HTTP (`apiClient`/axios) | `jest.mock('services/api/apiClient', …)` |
| Global `WebSocket` | `installMockWebSocket()` from `test/mockWebSocket` |
| Safe-area insets | already mocked globally in `jest.setup.ts` |

```ts
// BAD — depends on the wall clock; assertion drifts over time
expect(formatRelativeTime(iso)).toBe('2 days ago');

// GOOD — fix the clock first
jest.useFakeTimers().setSystemTime(new Date('2020-06-15T12:00:00Z'));
expect(formatRelativeTime(twoDaysBefore)).toBe('2 days ago');
```

---

## 3. Use the shared test helpers — don't hand-roll them

| Need | Use (from `test/`) |
|---|---|
| A domain fixture | `makeHistoryItem(overrides)` / `makeUser(overrides)` — `test/fixtures` |
| Render a component needing query + safe-area | `renderWithQuery(ui)` — `test/renderWithQuery` |
| Render a hook needing a QueryClient | `renderHookWithQuery(hook)` — `test/renderWithQuery` |
| A controllable `WebSocket` | `installMockWebSocket()` + `MockWebSocket` — `test/mockWebSocket` |

The query wrappers create a **fresh client with `retry: false`** so failing queries settle
immediately. Never build an ad-hoc `QueryClientProvider` or inline fixture objects.

```tsx
// BAD — bespoke wrapper + retries left on (hangs on error paths)
renderHook(() => useHistory(), {
  wrapper: ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  ),
});

// GOOD
const { result } = renderHookWithQuery(() => useHistory());
```

---

## 4. Mock at the seam directly below the unit under test

Test a layer for real; replace only the layer beneath it. Mocking accepts path aliases
(the `module-resolver` Babel plugin rewrites `jest.mock` specifiers).

| Unit under test | Mock this |
|---|---|
| A service (`HistoryService`) | `services/api/apiClient` |
| A query hook (`useHistory`) | the service (`services/api/services/HistoryService`) |
| A screen / component hook (`useHistoryScreen`, `History`) | the query hook (`query/History/useHistory`) |

```ts
// GOOD — query-hook test mocks the service, exercises real TanStack Query wiring
jest.mock('services/api/services/HistoryService', () => ({
  historyService: { getHistory: jest.fn() },
}));
```

Do **not** reach two layers down (e.g. mocking `apiClient` to test a screen) — mock the
immediate dependency so the intermediate layer is actually covered.

---

## 5. Test behavior, not implementation

Query by what the user sees (text, role, accessibility) and assert observable outcomes.
Never assert internal state, style objects, or private structure.

```tsx
// BAD — reaches into internals
expect(instance.state.isOpen).toBe(true);

// GOOD — drives the UI and asserts the effect
fireEvent.press(getByText('Archive'));
expect(onArchive).toHaveBeenCalledWith('item-1');
```

- Prefer the queries returned by `render` (`getByText`, `queryByText`, `getAllByText`).
- Use `queryBy*` to assert **absence** (returns `null`), `getBy*` when it must exist.
- Reserve `UNSAFE_getByType` for things with no accessible handle (e.g. a spinner).

---

## 6. Await async query/state with `waitFor`

Query hooks resolve asynchronously — assert their settled state via `waitFor`, never a bare
`setTimeout` or an immediate read.

```ts
const { result } = renderHookWithQuery(() => useHistory());
await waitFor(() => expect(result.current.isSuccess).toBe(true));
expect(result.current.data).toEqual(historyItems);
```

State transitions from `act`-triggering calls (setters returned by a hook) are wrapped in
`act(...)`:

```ts
act(() => result.current.setFilter('recent'));
```

---

## 7. Fixtures are deterministic factories with overrides

`test/fixtures` builds objects from a stable counter — no `Math.random`, no `Date.now`.
Pass only the fields a test cares about.

```ts
// GOOD — explicit, minimal, deterministic
const item = makeHistoryItem({ title: 'Alpha', contributors: [makeUser({ name: 'Ada' })] });
```

---

## 8. Coverage: logic ~100%, thin wrappers get a smoke test

Prioritize logic-heavy modules — pure utils, derivation hooks, services, query hooks, and
transport clients (e.g. the WebSocket client) — toward full line/branch coverage. Thin
presentational wrappers (`Text`, `ActivityIndicator`) need only a render/props smoke test.

---

## 9. Don't test these

Call it out rather than silently skipping, but do not write tests for:
- native module internals (RN/Reanimated/svg native behavior),
- the real backend contract (would need the live server or MSW),
- pixel/snapshot diffs — assert content and behavior instead.
