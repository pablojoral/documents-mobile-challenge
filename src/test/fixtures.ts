import type { Document, User } from 'models/models';

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
