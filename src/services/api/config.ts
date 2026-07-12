import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

/**
 * API configuration.
 *
 * Centralizes the base URL and timeout so `apiClient` stays declarative.
 * `API_BASE_URL` is machine-specific (points at a local server on the
 * developer's LAN), so it's read from `.env.dev` rather than hardcoded —
 * see `.env.example` for the variable and host caveats below.
 *
 * Host caveats when running the app:
 *   - iOS simulator: `127.0.0.1` reaches the host machine.
 *   - Android emulator: use `http://10.0.2.2:8080` (the emulator's host alias).
 *   - Physical device: use the host machine's LAN IP, e.g. `http://192.168.x.x:8080`.
 */
export const API_BASE_URL = ENV_API_BASE_URL;

export const API_TIMEOUT_MS = 15000;
