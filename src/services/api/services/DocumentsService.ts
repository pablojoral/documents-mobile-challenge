import { BaseService } from '../BaseService';
import type { Document } from 'models/models';

/**
 * Documents API.
 *
 * The challenge server (`server/server.go`) seeds a stable set of 100
 * documents at startup and exposes them through `GET /documents`, paginated
 * via `page`/`limit` and ordered via `sort`.
 */
export type DocumentSort = 'title-asc' | 'created-desc' | 'created-asc';

export interface DocumentsPage {
  Data: Document[];
  Page: number;
  Limit: number;
  Total: number;
  HasMore: boolean;
}

class DocumentsService extends BaseService {
  async getDocuments(
    page = 1,
    limit = 20,
    sort: DocumentSort = 'created-desc',
  ): Promise<DocumentsPage> {
    const res = await this.apiClient.get<DocumentsPage>('/documents', {
      params: { page, limit, sort },
    });
    return res.data;
  }
}

export const documentsService = new DocumentsService();
