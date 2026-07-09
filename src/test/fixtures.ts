import type { Document, NewDocumentNotification, User } from 'models/models';

let seq = 0;

/** Builds a `User` fixture with overridable fields. */
export const makeUser = (overrides: Partial<User> = {}): User => {
  seq += 1;
  return {
    ID: `user-${seq}`,
    Name: `User ${seq}`,
    ...overrides,
  };
};

/** Builds a `Document` fixture with overridable fields. */
export const makeDocument = (overrides: Partial<Document> = {}): Document => {
  seq += 1;
  return {
    ID: `doc-${seq}`,
    CreatedAt: '2020-01-01T00:00:00.000Z',
    UpdatedAt: '2020-06-01T00:00:00.000Z',
    Title: `Document ${seq}`,
    Attachments: ['a.pdf'],
    Contributors: [makeUser()],
    Version: '1.0.0',
    ...overrides,
  };
};

/** Builds a `NewDocumentNotification` fixture with overridable fields. */
export const makeNotification = (
  overrides: Partial<NewDocumentNotification> = {},
): NewDocumentNotification => {
  seq += 1;
  return {
    Timestamp: '2020-08-12T07:30:08.280Z',
    UserID: `user-${seq}`,
    UserName: `User ${seq}`,
    DocumentID: `doc-${seq}`,
    DocumentTitle: `Document ${seq}`,
    ...overrides,
  };
};
