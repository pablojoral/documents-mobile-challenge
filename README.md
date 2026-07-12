# Documents Mobile Challenge

A React Native app that lists the most recent documents, notifies the user in real time when
another user creates a document, and lets the user create a new document.

> This repository is built incrementally — commit early, commit often.

## Features

**Required**
- Display the most recent documents as a **list** or **grid** view.
- Show a **real-time notification** when a new document is created by another user (via WebSocket).
- **Create** a new document.

**Optional (in priority order)**
- Pull to refresh on the list / grid. — done
- Relative dates (e.g. "1 day ago"). — done
- Native **share** button. — done
- Basic offline support. — done, see [Offline support](#offline-support) below.
- Local notifications — not implemented.

## Reasoning & approach

The goal is a structure that keeps features isolated and lets requirements change without ripple
effects. Guiding decisions:

- **Feature-based structure.** Each feature (`Documents`, `CreateDocument`, `Notifications`) owns
  its screens, components, hooks, and styles. Cross-cutting pieces live in shared `components/`,
  `services/`, and `theme/`.
- **Thin service layer over one HTTP client.** All REST calls go through a single Axios instance
  (`services/api`), wrapped by small service classes — one place for base URL, headers, and errors.
- **TanStack Query for server state.** Caching, background refetch, and request de-duplication for
  the documents feed come for free. Creating a document is the one mutation that deliberately does
  *not* invalidate the feed — see the "Create document" decision below for why.
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

- **Primitives** (`src/components/`) — `Text`, `Button`, `ActivityIndicator`, `Modal`, `TextInput`,
  and `DocumentInput` (a labelled native file picker), each with a co-located `use<Name>Theme` hook
  and tests. Features build on these rather than importing RN primitives directly.
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
hook, server-side pagination and sorting, and a virtualized list/grid screen. The decisions that
shaped it:

- **Single Axios client behind service classes.** `services/api/apiClient.ts` is the one HTTP
  instance (base URL, timeout, JSON headers); every call goes through a `BaseService` subclass
  singleton (`services/api/services/DocumentsService.ts`) — never `axios` or `fetch` directly — so
  base URL, headers, auth, and error handling have a single home.
- **Decision — seed 100 documents at server start, and paginate/sort `GET /documents` server-side.**
  The original server returned a fresh random 1–21 documents per call, with no pagination or sort —
  not a stable set to page through. It now seeds 100 documents once at startup and accepts
  `page`/`limit`/`sort` params, returning `{ Data, Page, Limit, Total, HasMore }`.
- **`useInfiniteQuery`, not `useQuery`,** to match: `query/Documents/useDocuments.ts` pages through
  the results, and `useDocumentsScreen` calls `fetchNextPage` on `onEndReached` (skipped while
  offline — see [Offline support](#offline-support)).
- **Server-side sorting, not client-side.** The removed `sortDocuments.ts` transform is now the
  server's `sort` param — a paginated client only holds the pages it's scrolled through, so it can't
  sort the full set itself. Changing sort swaps the query key (`qk.documents.list(sort)`); TanStack
  Query serves any pages already cached for that sort instantly and refetches in the background if
  stale, rather than the screen forcing a drop-and-refetch itself.
- **No serialization / DTO-mapping layer.** The types in `models/models.ts` mirror the server JSON
  verbatim (PascalCase `ID` / `CreatedAt`, RFC3339 date strings) and services return `res.data`
  as-is. A normalize/transform layer isn't worth the indirection at this project's size —
  components read the API shape directly.
- **`FlatList` + memoized cards.** The screen renders through `FlatList` (row virtualization,
  `numColumns` for the grid) rather than a mapped `ScrollView`. `DocumentListCard` and
  `DocumentGridCard` are `React.memo`-wrapped and fed stable `renderItem` / `keyExtractor`
  (`useCallback` in `features/Documents/hooks/useDocumentsScreen.tsx`), so only changed rows
  re-render as the list scrolls or the sort changes.
- **Shared card sub-components over duplicated styles.** `DocumentListCard` and `DocumentGridCard`
  had duplicated meta-row and icon+label styles, extracted into `components/IconLabel` (generic) and
  `features/Documents/components/DocumentMetaRow` / `DocumentCardFooterColumn` (Documents-specific).

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
- **Decision — `maintainVisibleContentPosition` on the notifications list.** New notifications are
  unshifted to the front of the store's array (newest first), and the socket sync keeps writing to
  the store while the modal is open. Without anchoring, a `FlatList` shifts its on-screen content
  when items are inserted above the viewport — the rows a scrolled-down user is reading silently
  move. `NotificationsModal`'s `FlatList` sets `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}`
  so a user reading older notifications stays anchored in place when a new one arrives; a new
  notification never auto-scrolls the list, even if the user is already at the top.
- **Decision — read state is driven by on-screen visibility, not by the modal being open.**
  Because new notifications can now arrive off-screen above a scrolled reader (see the anchoring
  decision above), a blanket "mark everything as read whenever the modal is open" effect would mark
  notifications the user never actually saw. Instead, `NotificationsModal`'s `FlatList` uses
  `onViewableItemsChanged` + `viewabilityConfig` (`itemVisiblePercentThreshold: 75`,
  `minimumViewTime: 300`) to call the store's `markAsRead(ids)` only for notifications that were
  actually visible for a beat — a fast flick-scroll past a card doesn't count. A `NotificationsNewIndicator`
  pill, absolute-positioned over the list and driven by the existing `useUnreadNotificationsCount()`
  selector, tells the user unseen notifications are waiting whenever any remain unread; tapping it
  calls `FlatList.scrollToOffset({ offset: 0, animated: true })` via a ref owned by
  `useNotificationsModal`, jumping straight to the newest notifications.
- **Decision — `-fakeNotifications` flag on the Go server, defaulting to `false`.**
  `server/server.go`'s `/notifications` endpoint originally only emitted synthetic,
  fully random `gofakeit` data on a timer, disconnected from real activity. It now
  defaults to broadcasting a real notification exactly when a document is created via
  `POST /documents` — built from that document's `ID`/`Title` and its first
  contributor as `UserID`/`UserName` (falling back to `"unknown"` if the document has
  no contributors) — through a small per-client channel + writer-goroutine registry,
  since `gorilla/websocket` doesn't allow concurrent writes on one connection. Passing
  `-fakeNotifications=true` restores the original random-timer behavior, kept around
  for exercising the notifications UI without having to create real documents.

## Create document

An "Add document" button (with a leading plus icon) at the bottom of the Documents screen
(`features/CreateDocument/components/AddDocumentButton`) opens a bottom-sheet form
(`CreateDocumentModal`) built on the existing `Modal`, `TextInput`, and `DocumentInput` primitives.

- **`react-hook-form` + `zod`.** Fields are bound via RHF's `Controller` (needed since `TextInput`/
  `DocumentInput` are controlled components, not ref-based). A single `zod` schema
  (`features/CreateDocument/schema.ts`) drives all validation: name ≤100 chars, version matching
  `0-99.0-99.0-99`, at least one file attached, and each file ≤10 MB.
- **Multiple attachments, capped at 10 files.** Neither iOS's nor Android's document picker
  supports a "max N selections" option, so `DocumentInput`'s `maxFiles` enforces the cap app-side —
  disabling further picks at capacity and truncating any pick that would exceed it. Each file has
  its own remove action.
- **Oversized files are highlighted per file, not just via one form-level message** — the 10 MB
  limit applies per attachment (not combined), and `DocumentInput`'s `maxFileSize` flags each
  oversized file's name in red with a "Too large" caption as soon as it's picked.
- **Decision — `POST /documents` persists the new document server-side.** The challenge server
  originally had no create endpoint; `server/server.go` now exposes `POST /documents`, appending to
  the same in-memory, mutex-guarded `documents` slice `GET /documents` reads from (see the Documents
  feed decisions above), and returning the server-assigned `ID`/`CreatedAt`/`UpdatedAt`.
  `query/Documents/useAddDocument.ts` calls it via `DocumentsService.createDocument` and, on success,
  invalidates every cached documents query (`qk.documents.root`) rather than splicing the response
  into the cache — a manual splice can only place the new document correctly for the sort variant
  visible at creation time, leaving every other cached sort with it pinned in the wrong spot until
  invalidated some other way. `useCreateDocumentModal` also resets the active sort to `created-desc`
  on success, so the user immediately sees the new document at the top of a freshly refetched,
  correctly-ordered list.
- **No "current user" concept exists yet**, so new documents get a placeholder contributor
  (`{ ID: 'local-user', Name: 'You' }`) — revisit once/if auth is introduced.

## Share document

Long-pressing a `DocumentListCard` or `DocumentGridCard` opens the OS-native share sheet
(`Share.share` from `react-native`) with the document's title and version.

- **Long-press, not a visible button.** Both cards are already tappable-sized list/grid items with
  no free chrome for a persistent icon button without reflowing the layout; `onLongPress` reuses the
  existing touch target instead of adding one.
- **`Pressable`, not `TouchableOpacity`.** The only intended feedback is a haptic tick
  (`react-native-haptic-feedback`, fired in `handleShare`), not a visual opacity dim — `Pressable`
  adds no feedback of its own, unlike `TouchableOpacity`.
- **Logic lives in `useDocumentCard`**, the hook already shared by both card variants — `handleShare`
  and the `shareLabel` (used as the `accessibilityLabel`) are added there rather than duplicated per
  card, consistent with how the rest of the card's derived fields are centralized.

## Offline support

The documents feed stays usable offline: the last fetch is readable, pagination/refresh don't fire
doomed requests, and a failed background refetch never blanks out data still on screen.

- **`onlineManager` wired to NetInfo** (`query/onlineManager.ts`) — RN has no `window`/`navigator`
  events for TanStack Query's default online detection, so without this every offline query would
  just run straight into a network error instead of pausing.
- **Query cache persisted to MMKV** via `PersistQueryClientProvider` (`query/provider.tsx`,
  `query/persister.ts`), with documents queries pinned out of GC (`gcTime: Infinity` in `client.ts`)
  so an inactive sort variant can't be silently evicted from the persisted cache.
- **`useIsOnline`** (`hooks/useIsOnline.ts`, checks NetInfo's `isConnected` **and**
  `isInternetReachable`) gates pagination/pull-to-refresh, disables `SortSelector` and
  `AddDocumentButton`, and shows an `OfflineTag` pill below the controls row.
- **`useDocumentsScreen` falls back to cached data instead of the error screen** on a failed
  background refetch, and sort switching no longer force-drops its cache — both just let TanStack
  Query's normal cache-then-refetch-if-stale behavior handle freshness.

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
| `@react-native-documents/picker` | Native file picker backing `DocumentInput`'s "attach a file" flow, needed for the create-document feature. This is a bare RN 0.86 app with the New Architecture (Fabric/TurboModules) enabled, and this package is the actively maintained fork with first-class New Arch support. | `react-native-document-picker` — the older, more widely known package; only gained New Arch support in later 9.x releases, judged less safe for this app's RN version. `expo-document-picker` — Expo-only, not usable without pulling in Expo modules on a bare-RN project. |
| `react-hook-form` | Form state/validation for the create-document modal, driven through `Controller` since the form fields are controlled components, not native-ref inputs. | Hand-rolled `useState` + manual validation per field — more boilerplate and easy to let field state and error state drift apart; Formik — heavier, less idiomatic with controlled RN components. |
| `zod` | Single source of truth for the create-document validation rules (name length, version format, file size), parsed once instead of scattered `if` checks. | Yup — comparable, but `zod`'s TypeScript-first inference (`z.infer`) fits this codebase's type-first style better. Hand-rolled validators — more code, no static typing of the validated shape. |
| `@hookform/resolvers` | Adapter that feeds a `zod` schema into `react-hook-form`'s `resolver` option, so validation logic lives in one schema instead of being duplicated between the two libraries. | Writing a custom RHF resolver by hand — reinvents what this package already does. |
| `react-native-svg` | Rendering primitive backing the app's themed `Icon` component (`src/components/Icon`) — a handful of hand-authored Feather-style icons (list, grid, bell, chevron, check, close, plus) driven by the existing `theme.iconSize` / `theme.fontColor` tokens. Has first-class Fabric/New Architecture support. | An icon-font package (e.g. `@react-native-vector-icons/*`) — bundles an entire font family for the ~7 glyphs actually used, and community icon-font packages have historically lagged on New Architecture support. |
| `react-native-haptic-feedback` | Fires a Taptic Engine / vibration-motor tick on card long-press — no such primitive exists in RN core or `Pressable`. Actively maintained with New Architecture support. | RN core `Vibration.vibrate()` — no native dep, but reads as a buzz on iOS rather than a tap. `expo-haptics` — Expo-only, unusable in this bare-RN app. |
| `@react-native-community/netinfo` | Drives both the TanStack Query `onlineManager` and the `useIsOnline` UI hook — RN has no `navigator`/`window` connectivity events for the library's default detection to use. | Polling a health-check endpoint — extra network traffic and slower to detect a drop than a native connectivity listener. |
| `react-native-mmkv` (+ `react-native-nitro-modules` peer) | Synchronous, fast key/value storage backing the persisted query cache (`query/persister.ts`), adapted to the `AsyncStorage`-shaped interface `@tanstack/query-async-storage-persister` expects. Built on Nitro Modules with first-class New Architecture support. | `@react-native-async-storage/async-storage` — the more common pairing with TanStack's persister, but async and measurably slower than MMKV for this app's read/write pattern. |
| `@tanstack/query-async-storage-persister` + `@tanstack/react-query-persist-client` | Persist the query cache to storage and restore it on cold start (`PersistQueryClientProvider`), so the documents feed is readable offline. | Hand-rolled persistence (subscribe to the query cache, serialize on change, rehydrate on boot) — reinvents what these packages already do, including dehydration filtering and cache-busting. |

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

- **Decision — the test server's Go source lives here, at `server/`, not a separate repo.** Server
  changes (seeding, pagination, sort — see above) are then a normal commit in this repo, and
  `git clone` + `go run server/server.go` is all that's needed to get a matching backend running.

Both the API base URL and the WebSocket URL are read from configuration (environment) rather than
hardcoded, so the same build can point at different servers.

- **`react-native-dotenv`** loads `.env.dev` under the `@env` module (`babel.config.js`).
  `API_BASE_URL` / `WS_BASE_URL` are the only values sourced from env, since they're the only ones
  that vary per developer machine.
- Copy `.env.example` to `.env.dev` and fill in your machine's server address. `.env.dev` is
  gitignored — machine-specific, not a secret to share.

## Testing

```sh
yarn test        # or: yarn jest
```

**Stack.** Jest with the `@react-native/jest-preset` preset, plus
[React Native Testing Library](https://callstack.github.io/react-native-testing-library/) (RNTL,
v13) for anything that renders. Config lives in `jest.config.js` + `jest.setup.ts`.

**In place today.** The harness, documents-feed, WebSocket-client, notifications-store,
create-document, and offline-support suites are implemented — 46 test files run green across every
layer below. Shared helpers live in
`src/test/`: `makeDocument` / `makeUser` / `makeNotification` fixtures (`fixtures.ts`),
`renderWithQuery` / `renderHookWithQuery`
(`renderWithQuery.tsx`), which wrap the unit in a fresh `QueryClient` (with `retry: false`) so
query-backed code settles deterministically, and `MockWebSocket` / `installMockWebSocket`
(`mockWebSocket.ts`), a controllable stand-in for the global `WebSocket`. `jest.setup.ts` globally
mocks `react-native-safe-area-context` with zeroed insets, `@react-native-community/netinfo` with
its own shipped mock (defaults to connected), and `react-native-mmkv` (no TurboModule/Nitro binary
under Jest) — so components render without a native provider and offline-dependent code has a sane
default to override per test.

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
- **Unit** — pure utilities: relative-date formatting (`formatRelativeDate`).
- **Service** — `DocumentsService` with `apiClient` mocked (request path, page/limit/sort params,
  response passthrough).
- **Hooks** — the `useDocuments` infinite-query hook and the `useAddDocument` mutation, both with
  `DocumentsService` mocked (payload mapping, cache invalidation on success, error propagation),
  plus the screen/card logic and strings hooks (`useDocumentsScreen`, `useDocumentCard`, …).
- **Component** — RNTL render tests for the shared primitives (`Text`, `Button`,
  `ActivityIndicator`, `Modal`, `TextInput`, `DocumentInput`), the list/grid cards, the empty /
  error / toggle / sort states, and the create-document flow (`CreateDocumentModal` — validation,
  submission, and reset-on-close, with `useAddDocument` and the native picker mocked;
  `AddDocumentButton` — open/close wiring, with `CreateDocumentModal` mocked).
- **Transport** — `WebSocketClient` (connect/reconnect/parse/listeners) against a mock WebSocket.
- **State** — `useNotificationsStore` (add/dedup/read/clear/selector) and
  `useNotificationsSocketSync` (connects the socket and forwards messages into the store, stops on
  unmount) against a mock WebSocket.
- **Offline** — `useIsOnline` and `setupOnlineManager` against a mocked NetInfo, `queryPersister`
  against an in-memory MMKV stand-in, and `useDocumentsScreen`'s offline-gating and
  `showError`/`showList` derivation with `useIsOnline` mocked directly.

Coverage targets logic-heavy modules (utils, hooks, services) toward full line/branch coverage;
thin presentational wrappers get a render smoke test.

> If `yarn test` reports a missing `@react-native/jest-preset`, run a clean `yarn install` first —
> the preset ships as a transitive dependency of `react-native` and must be present in
> `node_modules`.
