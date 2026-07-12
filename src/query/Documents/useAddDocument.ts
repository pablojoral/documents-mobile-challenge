import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';

import { qk } from 'query/keys';
import type { Document, User } from 'models/models';
import type { PickedFile } from 'components/DocumentInput/useDocumentInput';
import type { DocumentsPage } from 'services/api/services/DocumentsService';

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
 * create endpoint — its seeded dataset never learns about this document — so
 * this never calls the network. It builds the `Document` locally and prepends
 * it into `pages[0].Data` of every cached documents page (one per sort order,
 * matched via `qk.documents.root`), and deliberately never invalidates: a
 * refetch would replace the cache with the server's dataset and silently drop
 * the locally-added document.
 */
export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDocumentInput) => buildDocument(input),
    onSuccess: document => {
      queryClient.setQueriesData<InfiniteData<DocumentsPage>>(
        { queryKey: qk.documents.root },
        current => {
          if (!current) {
            return current;
          }

          const [firstPage, ...restPages] = current.pages;

          return {
            ...current,
            pages: [
              {
                ...firstPage,
                Data: [document, ...firstPage.Data],
                Total: firstPage.Total + 1,
              },
              ...restPages,
            ],
          };
        },
      );
    },
  });
}
