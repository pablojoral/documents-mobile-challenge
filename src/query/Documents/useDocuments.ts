import { useInfiniteQuery } from '@tanstack/react-query';

import { qk } from 'query/keys';
import {
  documentsService,
  DocumentSort,
} from 'services/api/services/DocumentsService';

const PAGE_SIZE = 20;

export function useDocuments(sort: DocumentSort) {
  return useInfiniteQuery({
    queryKey: qk.documents.list(sort),
    queryFn: ({ pageParam }) =>
      documentsService.getDocuments(pageParam, PAGE_SIZE, sort),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.HasMore ? lastPage.Page + 1 : undefined,
  });
}
