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
- **TanStack Query for server state.** Caching, background refetch, and pagination for the documents
  feed come for free, and mutations (create document) invalidate the feed to keep the UI consistent.
- **WebSocket via a dedicated `ws` client.** Real-time notifications are consumed through a small
  `ws` client wrapper around the built-in `WebSocket` API, encapsulating connect, reconnect, and
  message parsing behind a single interface. New-document events invalidate/prepend to the cached
  feed. No database or ORM is used — the JSON API and the socket are consumed directly, as the
  challenge requires.
- **Styling through theme hooks**, one component per file, and logic kept in co-located hooks — see
  the conventions in [`.claude/rules/`](.claude/rules).

## Tech choices

The bias is to write the code myself; libraries are added only where they remove meaningful,
undifferentiated work. Each is justified here as it is introduced.

| Library | Why | Alternatives considered |
| --- | --- | --- |
| `@tanstack/react-query` _(planned)_ | Server-state caching, background refetch, pagination, and cache invalidation on mutation — the core of the documents feed. | RTK Query (heavier, Redux-coupled); hand-rolled fetching hooks (more boilerplate, easy to get caching/refetch wrong). |
| `axios` _(planned)_ | Single configured client with interceptors for base URL and error shaping. | Native `fetch` — viable, but interceptors and defaults are more ergonomic with Axios. |
| `react-native-safe-area-context` | Correct safe-area insets across devices. | Manual inset math — brittle across notches/devices. |
| `ws` client (wrapper over native `WebSocket`) _(planned)_ | Consume the real-time notifications feed with a basic primitive, wrapped for connect/reconnect and message parsing, per the challenge constraint. | `socket.io-client` — unnecessary and protocol-specific for a plain WS feed. |
| `@testing-library/react-native` _(planned)_ | Render and drive components/hooks by user-visible behavior (text/role/accessibility). | Bare `react-test-renderer` — no user-centric queries; discouraged for component tests. |

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

**Principles** (see [`.claude/rules/testing.md`](.claude/rules/testing.md)):
- **Co-located** — `*.test.ts(x)` sits next to the unit it covers; only shared harness code
  (fixtures, render wrappers, WebSocket mock) lives in `test/`.
- **Deterministic** — no real clock, network, or socket. Time is frozen with fake timers, HTTP is
  mocked at `apiClient`, and the global `WebSocket` is swapped for a controllable mock.
- **Mock one seam below the unit** — a service test mocks `apiClient`; a query-hook test mocks the
  service; a screen test mocks the query hook — so the layer under test is exercised for real.
- **Behavior over implementation** — query by what the user sees (text/role/accessibility) and
  await settled async state with `waitFor`; no assertions on internal state or styles.

**Test layers**
- **Unit** — pure utilities (e.g. relative-date formatting) and service request/response mapping.
- **Hooks** — query/mutation hooks (feed loading, create-document invalidation) with the service mocked.
- **Transport** — the `ws` client (connect/reconnect/parse) against the mock WebSocket.
- **Component** — RNTL render tests for the list/grid item and empty/loading/error states.

Coverage targets logic-heavy modules (utils, hooks, services, the WebSocket client) toward full
line/branch coverage; thin presentational wrappers get a render smoke test.

> If `yarn test` reports a missing `@react-native/jest-preset`, run a clean `yarn install` first —
> the preset ships as a transitive dependency of `react-native` and must be present in
> `node_modules`.
