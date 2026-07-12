import { qk } from './keys';
import { queryClient } from './client';

describe('queryClient', () => {
  it('pins documents queries out of garbage collection', () => {
    const defaults = queryClient.getQueryDefaults(
      qk.documents.list('created-desc'),
    );
    expect(defaults.gcTime).toBe(Infinity);
  });
});
