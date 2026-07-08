/**
 * API configuration.
 *
 * Centralizes the base URL and timeout so `apiClient` stays declarative.
 * In a real setup these would be sourced from env / build config; kept as
 * simple constants here so the HTTP layer is self-contained.
 */

/**
 * Points at the local Go challenge server (`../frontend-challenge`, `go run server.go`).
 *
 * Uses the explicit IPv4 loopback `127.0.0.1` rather than `localhost`: the server
 * binds IPv4 only, but iOS resolves `localhost` to IPv6 `::1` first, which the
 * server never answers → "Network Error". `127.0.0.1` forces IPv4 and connects.
 *
 * Host caveats when running the app:
 *   - iOS simulator: `127.0.0.1` reaches the host machine.
 *   - Android emulator: use `http://10.0.2.2:8080` (the emulator's host alias).
 *   - Physical device: use the host machine's LAN IP, e.g. `http://192.168.x.x:8080`.
 */
export const API_BASE_URL = 'http://192.168.1.13:8080';

export const API_TIMEOUT_MS = 15000;
