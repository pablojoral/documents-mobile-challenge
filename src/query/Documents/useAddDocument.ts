import { useMutation, useQueryClient } from '@tanstack/react-query';

import { qk } from 'query/keys';
import type { Document, User } from 'models/models';
import type { PickedFile } from 'components/DocumentInput/useDocumentInput';

export interface AddDocumentInput {
  name: string;
  version: string;
  files: PickedFile[];
}

const CURRENT_USER: User = { ID: 'local-user', Name: 'You' };

const buildDocument = (input: AddDocumentInput): Document => {
  const now = new Date().toISOString();
  return {
    ID: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    CreatedAt: now,
    UpdatedAt: now,
    Title: input.name,
    Attachments: input.files.map(file => file.name),
    Contributors: [CURRENT_USER],
    Version: input.version,
  };
};

/**
 * Creates a document entirely client-side. The challenge server has no real
 * create endpoint — `GET /documents` returns freshly randomized fake data on
 * every call and nothing is ever persisted — so this never calls the network.
 * It builds the `Document` locally and writes it straight into the query
 * cache, and deliberately never invalidates `qk.documents.root`: a refetch
 * would replace the cache with new random documents and discard this one.
 */
export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDocumentInput) => buildDocument(input),
    onSuccess: document => {
      queryClient.setQueryData<Document[]>(qk.documents.list(), current => [
        document,
        ...(current ?? []),
      ]);
    },
  });
}
