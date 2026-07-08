/** How the documents list is arranged on screen. */
export type DocumentViewMode = 'list' | 'grid';

/** Client-side sort orders for the documents list (the server does not sort). */
export type DocumentSort = 'title-asc' | 'created-desc' | 'created-asc';
