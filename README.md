# Documents Mobile Challenge

A React Native app that lists the most recent documents, notifies the user in real time when
another user creates a document, and lets the user create a new document.

> This repository is built incrementally — commit early, commit often. At this stage it contains
> the project setup and this document describing the intended approach. Sections below marked
> _(planned)_ describe where the code is heading, not what is already implemented.

## Features

**Required**
- Display the most recent documents as a **list** or **grid** view.
- Show a **real-time notification** when a new document is created by another user (via WebSocket).
- **Create** a new document.

**Optional (planned, in priority order)**
- Pull to refresh on the list / grid.
- Relative dates (e.g. "1 day ago").
- Native **share** button.
- Local notifications and basic offline support.

## Reasoning & approach _(planned)_

The goal is a structure that keeps features isolated and lets requirements change without ripple
effects. Guiding decisions:

- **Feature-based structure.** Each feature (`Documents`, `CreateDocument`, `Notifications`) owns
  its screens, components, hooks, and styles. Cross-cutting pieces live in shared `components/`,
  `services/`, and `theme/`.
- **Thin service layer over one HTTP client.** All REST calls go through a single Axios instance
  (`services/api`), wrapped by small service classes — one place for base URL, headers, and errors.
- **TanStack Query for server state.** Caching, background refetch, and request de-duplication for
  the documents feed come for free, and mutations (create document) invalidate the feed to keep the
  UI consistent.
- **WebSocket via a dedicated `ws` client.** Real-time notifications are consumed through a small
  `ws` client wrapper around the built-in `WebSocket` API, encapsulating connect, reconnect, and
  message parsing behind a single interface. New-document events invalidate/prepend to the cached
  feed. No database or ORM is used — the JSON API and the socket are consumed directly, as the
  challenge requires.
- **Styling through theme hooks**, one component per file, and logic kept in co-located hooks — see
  the conventions in [`.claude/rules/`](.claude/rules).

## Design system & theming

The base design system is in place: shared, themed primitives that screens compose from instead of
raw React Native components and ad-hoc style values.

- **Primitives** (`src/components/`) — `Text`, `Button`, and `ActivityIndicator`, each with a
  co-located `use<Name>Theme` hook and tests. Features build on these rather than importing RN
  primitives directly.
- **Design tokens** (`src/theme/tokens.ts`) — the single source of truth for spacing, colors,
  corner radii, typography, and border widths. Components never use raw numbers or hex values; token
  *names* are stable across light/dark and only the color *values* differ per scheme.
- **`useTheme` hook** (`src/theme/hooks/useTheme.ts`) — the one hook every `use<Name>Theme` reads
  from. It resolves the active color scheme (light/dark), exposes the semantic token maps
  (`surfaceColor`, `fontColor`, `borderColor`, …), and folds in the current safe-area insets as
  `topInset` / `bottomInset` — the only raw layout numbers the styling rules allow.

**Decision — no `ThemeProvider` / context.** Light vs dark is derived directly from the OS via
React Native's `useColorScheme()`, so there is no theme state to share and nothing to provide. A
context provider is the right call once the app lets the user *select* a theme (override the system
setting) — at that point the chosen theme becomes app state that many components must read. Since
we only ever follow the system appearance, a provider would add indirection with no benefit, so
`useTheme()` simply reads the system scheme on each render.

## Documents feed & data layer

The documents feed is wired end to end: a single HTTP client, a service layer, a TanStack Query
hook, client-side sorting, and a virtualized list/grid screen. The decisions that shaped it,
constrained by the challenge server's single unpaginated `GET /documents` endpoint:

- **Single Axios client behind service classes.** `services/api/apiClient.ts` is the one HTTP
  instance (base URL, timeout, JSON headers); every call goes through a `BaseService` subclass
  singleton (`services/api/services/DocumentsService.ts`) — never `axios` or `fetch` directly — so
  base URL, headers, auth, and error handling have a single home.
- **`useQuery`, not `useInfiniteQuery`.** `GET /documents` returns the entire array in one response
  (the server isn't paginated), so `query/Documents/useDocuments.ts` uses a single `useQuery`.
  Infinite-query cursor machinery would model pages that don't exist — revisit only if the API
  gains pagination.
- **Client-side sorting.** The server returns unordered data and exposes no sort params, and the
  full list is already in memory (see above), so `features/Documents/utils/sortDocuments.ts` orders
  it on the client (title A–Z, newest/oldest first) as a pure, non-mutating transform.
- **No serialization / DTO-mapping layer.** The types in `models/models.ts` mirror the server JSON
  verbatim (PascalCase `ID` / `CreatedAt`, RFC3339 date strings) and services return `res.data`
  as-is. A normalize/transform layer isn't worth the indirection at this project's size —
  components read the API shape directly.
- **`FlatList` + memoized cards.** The screen renders through `FlatList` (row virtualization,
  `numColumns` for the grid) rather than a mapped `ScrollView`. `DocumentListCard` and
  `DocumentGridCard` are `React.memo`-wrapped and fed stable `renderItem` / `keyExtractor`
  (`useCallback` in `features/Documents/hooks/useDocumentsScreen.tsx`), so only changed rows
  re-render as the list scrolls or the sort changes.

## Notifications (WebSocket)

Real-time new-document notifications are consumed through `src/services/ws/`:

- **`WebSocketClient<TMessage>`, not `BaseService`.** A socket is a long-lived, push-based
  connection, not a request/response call, so it gets its own small class wrapping the native
  `WebSocket` rather than extending `BaseService`. One instance per connection —
  `notificationsSocket` (`services/ws/notificationsSocket.ts`) is the singleton for `/notifications`.
  `TMessage` types whatever that connection sends (`NewDocumentNotification` today); if the same
  endpoint ever pushed a second event shape, `TMessage` would widen to a union rather than
  requiring another instance.
- **Auto-reconnect with exponential backoff built in** (`services/ws/config.ts`), so a dropped
  connection recovers without callers having to handle it.
- **Listener API, not a hook.** `onMessage` / `onStatusChange` / `onError` each return an
  unsubscribe function, keeping the client React-free.
- **Tested via a mock socket.** `src/test/mockWebSocket.ts` stands in for the global `WebSocket`,
  and `WebSocketClient.test.ts` covers connect/reconnect/parsing/listeners deterministically.
- **`zustand` store + a thin synchronizer hook.** `store/Notifications/useNotificationsStore.ts`
  holds the notification list (dedup by `DocumentID:Timestamp`, newest first, read/unread).
  `store/Notifications/useNotificationsSocketSync.ts` is the only piece that touches both the
  socket and the store: mounted once at the app root, it calls `notificationsSocket.connect()` and
  forwards every message into `addNotification`. This keeps the transport (`services/ws`) and the
  state (`store/Notifications`) decoupled — the store doesn't know a socket exists, and the client
  doesn't know about zustand.
  **Decision — `zustand` over Redux/Context.** Notification state is small, global, and
  read/written from places that aren't necessarily parent/child of each other (the sync hook writes,
  future badge/list UI reads), which rules out local `useState`/prop drilling. `zustand` gives that
  global store with far less boilerplate than Redux (no actions/reducers/providers — just a
  `create()` call and a selector hook), is widely adopted and battle-tested, and its selector-based
  subscriptions avoid the re-render cost of Context.

## Tech choices

The bias is to write the code myself; libraries are added only where they remove meaningful,
undifferentiated work. Each is justified here as it is introduced.

| Library | Why | Alternatives considered |
| --- | --- | --- |
| `@tanstack/react-query` | Server-state caching, background refetch, request de-duplication, and cache invalidation on mutation — the core of the documents feed. | RTK Query (heavier, Redux-coupled); hand-rolled fetching hooks (more boilerplate, easy to get caching/refetch wrong). |
| `axios` | Single configured client with interceptors for base URL and error shaping. | Native `fetch` — viable, but interceptors and defaults are more ergonomic with Axios. |
| `react-native-safe-area-context` | Correct safe-area insets across devices. | Manual inset math — brittle across notches/devices. |
| `ws` client (wrapper over native `WebSocket`) | Consume the real-time notifications feed with a basic primitive, wrapped for connect/reconnect and message parsing, per the challenge constraint. | `socket.io-client` — unnecessary and protocol-specific for a plain WS feed. |
| `zustand` | Global client state for notifications (pushed over the socket, read from anywhere in the tree): less boilerplate than Redux, widely adopted, simple to use, and fast. | Redux/RTK (more ceremony — actions, reducers, providers — for a single small slice of state); React Context — re-renders every consumer on any change, no built-in selectors. |
| `@testing-library/react-native` | Render and drive components/hooks by user-visible behavior (text/role/accessibility). | Bare `react-test-renderer` — no user-centric queries; discouraged for component tests. |

## Getting started

**Prerequisites**
- Node.js **≥ 22.11** (see `engines` in `package.json`)
- For iOS: Xcode + CocoaPods (via Ruby Bundler)
- For Android: JDK 17 and the Android SDK
- Follow React Native's [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide once.

**Install**
```sh
yarn install
```

**iOS native dependencies** (first clone and after native dep changes):
```sh
bundle install            # installs CocoaPods itself, first time only
bundle exec pod install   # from the ios/ setup; installs pods
```

## Running the app

Start Metro, then launch a platform in a second terminal:

```sh
yarn start          # Metro bundler

yarn ios            # build & run on the iOS Simulator
yarn android        # build & run on an Android emulator/device
```

## Server configuration

The app consumes two data sources from the challenge's testing server:
- the documents **JSON HTTP API**, and
- a **WebSocket** connection for real-time notifications.

Both the API base URL and the WebSocket URL are read from configuration (environment) rather than
hardcoded, so the same build can point at different servers. See `.env.example` _(added with the
integration work)_ for the exact variables.

## Testing

```sh
yarn test        # or: yarn jest
```

**Stack.** Jest with the `@react-native/jest-preset` preset, plus
[React Native Testing Library](https://callstack.github.io/react-native-testing-library/) (RNTL,
v13) for anything that renders. Config lives in `jest.config.js` + `jest.setup.ts`.

**In place today.** The harness, documents-feed, WebSocket-client, and notifications-store suites
are implemented — 22 test files run green across every layer below. Shared helpers live in
`src/test/`: `makeDocument` / `makeUser` / `makeNotification` fixtures (`fixtures.ts`),
`renderWithQuery` / `renderHookWithQuery`
(`renderWithQuery.tsx`), which wrap the unit in a fresh `QueryClient` (with `retry: false`) so
query-backed code settles deterministically, and `MockWebSocket` / `installMockWebSocket`
(`mockWebSocket.ts`), a controllable stand-in for the global `WebSocket`. `jest.setup.ts` globally
mocks `react-native-safe-area-context` with zeroed insets so components render without a native
provider.

**Principles** (see [`.claude/rules/testing.md`](.claude/rules/testing.md)):
- **Co-located** — `*.test.ts(x)` sits next to the unit it covers; only shared harness code
  (fixtures, render wrappers, the WebSocket mock) lives in `test/`.
- **Deterministic** — no real clock, network, or socket. Time is frozen with fake timers, HTTP is
  mocked at `apiClient`, and the socket is mocked via `installMockWebSocket()`.
- **Mock one seam below the unit** — a service test mocks `apiClient`; a query-hook test mocks the
  service; a screen test mocks the query hook — so the layer under test is exercised for real.
- **Behavior over implementation** — query by what the user sees (text/role/accessibility) and
  await settled async state with `waitFor`; no assertions on internal state or styles.

**Test layers**
- **Unit** — pure utilities: relative-date formatting (`formatRelativeDate`) and client-side
  `sortDocuments`.
- **Service** — `DocumentsService` with `apiClient` mocked (request path + response passthrough).
- **Hooks** — the `useDocuments` query hook with the service mocked, plus the screen/card logic and
  strings hooks (`useDocumentsScreen`, `useDocumentCard`, …). _(Create-document mutation: planned.)_
- **Component** — RNTL render tests for the shared primitives (`Text`, `Button`,
  `ActivityIndicator`), the list/grid cards, and the empty / error / toggle / sort states.
- **Transport** — `WebSocketClient` (connect/reconnect/parse/listeners) against a mock WebSocket.
- **State** — `useNotificationsStore` (add/dedup/read/clear/selector) and
  `useNotificationsSocketSync` (connects the socket and forwards messages into the store, stops on
  unmount) against a mock WebSocket.

Coverage targets logic-heavy modules (utils, hooks, services) toward full line/branch coverage;
thin presentational wrappers get a render smoke test.

> If `yarn test` reports a missing `@react-native/jest-preset`, run a clean `yarn install` first —
> the preset ships as a transitive dependency of `react-native` and must be present in
> `node_modules`.
