import { apiClient } from './apiClient';

/**
 * Base class every resource service extends.
 *
 * It exposes the shared `apiClient` as a protected member so subclasses issue
 * requests through `this.apiClient` without importing it themselves. Concrete
 * services define their endpoints, request, and response types and export a
 * singleton (e.g. `export const historyService = new HistoryService()`).
 */
export abstract class BaseService {
  protected readonly apiClient = apiClient;
}
