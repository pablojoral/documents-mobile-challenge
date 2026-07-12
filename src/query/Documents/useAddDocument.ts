import { useMutation, useQueryClient } from '@tanstack/react-query';

import { qk } from 'query/keys';
import type { User } from 'models/models';
import type { PickedFile } from 'components/DocumentInput/useDocumentInput';
import { documentsService } from 'services/api/services/DocumentsService';
import { generateRandomUser } from 'utils/generateRandomUser';

export interface AddDocumentInput {
  name: string;
  version: string;
  files: PickedFile[];
}

const CURRENT_USER: User = generateRandomUser();

/**
 * Creates a document via `POST /documents`, then invalidates every cached
 * documents query (one per sort order, matched via `qk.documents.root`). The
 * server persists the document, so a refetch reflects its real position for
 * whatever sort is active — a manual cache splice can only place it correctly
 * for the sort visible at creation time, leaving every other cached sort
 * variant with the new document pinned in the wrong spot until it happens to
 * be invalidated some other way. `useCreateDocumentModal` also resets the
 * active sort to `created-desc` on success, so the user immediately sees the
 * new document at the top of a freshly refetched, correctly-ordered list.
 */
export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddDocumentInput) =>
      documentsService.createDocument({
        Title: input.name,
        Version: input.version,
        Attachments: input.files.map(file => file.name),
        Contributors: [CURRENT_USER],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.documents.root });
    },
  });
}
