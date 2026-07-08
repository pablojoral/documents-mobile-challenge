import { formatRelativeDate } from './formatRelativeDate';

const NOW = new Date('2020-06-15T12:00:00.000Z');
const ago = (seconds: number) =>
  new Date(NOW.getTime() - seconds * 1000).toISOString();
const ahead = (seconds: number) =>
  new Date(NOW.getTime() + seconds * 1000).toISOString();

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "just now" for very recent times', () => {
    expect(formatRelativeDate(ago(10))).toBe('just now');
  });

  it('formats minutes, hours, and days', () => {
    expect(formatRelativeDate(ago(5 * 60))).toBe('5 minutes ago');
    expect(formatRelativeDate(ago(2 * 3600))).toBe('2 hours ago');
    expect(formatRelativeDate(ago(3 * 86400))).toBe('3 days ago');
  });

  it('uses singular units for a value of 1', () => {
    expect(formatRelativeDate(ago(86400))).toBe('1 day ago');
  });

  it('formats weeks, months, and years', () => {
    expect(formatRelativeDate(ago(10 * 86400))).toBe('1 week ago');
    expect(formatRelativeDate(ago(40 * 86400))).toBe('1 month ago');
    expect(formatRelativeDate(ago(400 * 86400))).toBe('1 year ago');
  });

  it('formats future dates with "in"', () => {
    expect(formatRelativeDate(ahead(2 * 86400))).toBe('in 2 days');
  });

  it('returns an empty string for unparseable input', () => {
    expect(formatRelativeDate('not-a-date')).toBe('');
  });
});
