/** How the documents list is arranged on screen. */
export type DocumentViewMode = 'list' | 'grid';

/** Sort orders for the documents list, applied server-side via the `sort` query param. */
export type { DocumentSort } from 'services/api/services/DocumentsService';
