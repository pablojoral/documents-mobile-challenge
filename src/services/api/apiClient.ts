import axios from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS } from './config';

/**
 * The single shared Axios instance for the whole app.
 *
 * Every HTTP call goes through this instance (via a service class) — never
 * through `axios` or `fetch` directly. It owns the base URL and timeout.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});
