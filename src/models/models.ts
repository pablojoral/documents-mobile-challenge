/**
 * Shared domain models.
 *
 * Only types that are shared across *multiple* services belong here. Types that
 * describe a single API contract (request/response shapes) live in that
 * resource's service file, not in this file (see api rules §7).
 *
 * These mirror the shapes returned by the documents server
 * (../frontend-challenge/server.go). The Go structs carry no JSON tags, so field
 * names serialize verbatim in PascalCase (`ID`, `CreatedAt`, …) and `time.Time`
 * values serialize as RFC3339 date-time strings — the field names/types below
 * match the fetched JSON exactly.
 */

/** A document contributor. Nested in `Document.Contributors`. */
export interface User {
  ID: string;
  Name: string;
}

/** A document as returned by `GET /documents`. */
export interface Document {
  ID: string;
  /** RFC3339 date-time string. */
  CreatedAt: string;
  /** RFC3339 date-time string. */
  UpdatedAt: string;
  Title: string;
  Attachments: string[];
  Contributors: User[];
  Version: string;
}

/** Pushed over the `/notifications` WebSocket when another user creates a document. */
export interface NewDocumentNotification {
  /** RFC3339 date-time string. */
  Timestamp: string;
  UserID: string;
  UserName: string;
  DocumentID: string;
  DocumentTitle: string;
}
