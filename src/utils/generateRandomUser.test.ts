import { generateRandomUser } from './generateRandomUser';

describe('generateRandomUser', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds an ID and Name from the controlled random sequence', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.123456789) // id suffix
      .mockReturnValueOnce(0) // first name index -> first entry
      .mockReturnValueOnce(0.99); // last name index -> last entry

    const user = generateRandomUser();

    expect(user.ID).toBe(`local-user-${(0.123456789).toString(36).slice(2, 10)}`);
    expect(user.Name).toBe('Alex Larsen');
  });

  it('returns a different ID on each call', () => {
    const first = generateRandomUser();
    const second = generateRandomUser();

    expect(first.ID).not.toBe(second.ID);
  });

  it('always returns a non-empty ID and a two-word Name', () => {
    const user = generateRandomUser();

    expect(user.ID.length).toBeGreaterThan('local-user-'.length);
    expect(user.Name.split(' ')).toHaveLength(2);
  });
});
