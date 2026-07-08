import { BaseService } from '../BaseService';
import type { Document } from 'models/models';

/**
 * Documents API.
 *
 * The challenge server (`../frontend-challenge/server.go`) exposes a single
 * `GET /documents` endpoint that returns the full JSON array of documents in one
 * response — there is no pagination.
 */
class DocumentsService extends BaseService {
  async getDocuments(): Promise<Document[]> {
    const res = await this.apiClient.get<Document[]>('/documents');
    return res.data;
  }
}

export const documentsService = new DocumentsService();
