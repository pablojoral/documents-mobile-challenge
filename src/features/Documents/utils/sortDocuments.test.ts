import { makeDocument } from 'test/fixtures';
import { sortDocuments } from './sortDocuments';

describe('sortDocuments', () => {
  const alpha = makeDocument({
    Title: 'Alpha',
    CreatedAt: '2020-01-01T00:00:00.000Z',
  });
  const middle = makeDocument({
    Title: 'Middle',
    CreatedAt: '2021-06-15T00:00:00.000Z',
  });
  const zeta = makeDocument({
    Title: 'Zeta',
    CreatedAt: '2022-12-31T00:00:00.000Z',
  });

  it('sorts by title A–Z', () => {
    const result = sortDocuments([zeta, alpha, middle], 'title-asc');
    expect(result.map(d => d.Title)).toEqual(['Alpha', 'Middle', 'Zeta']);
  });

  it('sorts by newest first (created-desc)', () => {
    const result = sortDocuments([alpha, zeta, middle], 'created-desc');
    expect(result.map(d => d.Title)).toEqual(['Zeta', 'Middle', 'Alpha']);
  });

  it('sorts by oldest first (created-asc)', () => {
    const result = sortDocuments([zeta, alpha, middle], 'created-asc');
    expect(result.map(d => d.Title)).toEqual(['Alpha', 'Middle', 'Zeta']);
  });

  it('does not mutate the input array', () => {
    const input = [zeta, alpha, middle];
    const snapshot = [...input];
    sortDocuments(input, 'title-asc');
    expect(input).toEqual(snapshot);
  });
});
