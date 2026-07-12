import { BaseService } from '../BaseService';
import type { Document, User } from 'models/models';

/**
 * Documents API.
 *
 * The challenge server (`server/server.go`) seeds a stable set of 100
 * documents at startup and exposes them through `GET /documents`, paginated
 * via `page`/`limit` and ordered via `sort`. `POST /documents` appends a new
 * document to that same in-memory set and returns it with a server-assigned
 * `ID`/`CreatedAt`/`UpdatedAt`.
 */
export type DocumentSort = 'title-asc' | 'created-desc' | 'created-asc';

export interface DocumentsPage {
  Data: Document[];
  Page: number;
  Limit: number;
  Total: number;
  HasMore: boolean;
}

export interface CreateDocumentRequest {
  Title: string;
  Version: string;
  Attachments: string[];
  Contributors: User[];
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

  async createDocument(payload: CreateDocumentRequest): Promise<Document> {
    const res = await this.apiClient.post<Document>('/documents', payload);
    return res.data;
  }
}

export const documentsService = new DocumentsService();
