import { useQuery } from '@tanstack/react-query';

import { qk } from 'query/keys';
import { documentsService } from 'services/api/services/DocumentsService';

export function useDocuments() {
  return useQuery({
    queryKey: qk.documents.list(),
    queryFn: () => documentsService.getDocuments(),
  });
}
