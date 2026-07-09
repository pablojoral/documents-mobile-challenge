/**
 * WebSocket configuration.
 *
 * Parallels the HTTP `services/api/config.ts`. `WS_BASE_URL` is prepended to any
 * relative path passed to a `WebSocketClient` (absolute `ws(s)://` URLs are used
 * as-is).
 *
 * Same host caveats as `API_BASE_URL`: `127.0.0.1`/`192.168.x.x` for iOS
 * simulator/device, `10.0.2.2` for the Android emulator.
 */

export const WS_BASE_URL = 'ws://192.168.1.13:8080';

/** Base delay before the first reconnect attempt (exponential backoff). */
export const WS_RECONNECT_BASE_DELAY_MS = 1000;

/** Upper bound for the backoff delay between reconnect attempts. */
export const WS_RECONNECT_MAX_DELAY_MS = 30000;

/** Max reconnect attempts before giving up. `Infinity` = retry forever. */
export const WS_MAX_RECONNECT_ATTEMPTS = Infinity;
