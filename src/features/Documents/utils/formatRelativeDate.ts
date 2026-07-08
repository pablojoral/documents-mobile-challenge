interface RelativeUnit {
  /** Upper bound (exclusive) in seconds for which this unit applies. */
  max: number;
  /** Number of seconds in one of this unit. */
  seconds: number;
  name: string;
}

const UNITS: RelativeUnit[] = [
  { max: 60, seconds: 1, name: 'second' },
  { max: 3600, seconds: 60, name: 'minute' },
  { max: 86400, seconds: 3600, name: 'hour' },
  { max: 604800, seconds: 86400, name: 'day' },
  { max: 2629800, seconds: 604800, name: 'week' },
  { max: 31557600, seconds: 2629800, name: 'month' },
  { max: Infinity, seconds: 31557600, name: 'year' },
];

/**
 * Formats an RFC3339 date-time string (e.g. `Document.CreatedAt`) as relative
 * time, like `1 day ago`, `3 months ago`, or `in 2 years`. Returns `just now`
 * for very recent times and an empty string for unparseable input.
 *
 * Dependency-free (no `Intl.RelativeTimeFormat`) so it behaves consistently
 * across JS engines.
 */
export const formatRelativeDate = (isoDate: string): string => {
  const timestamp = Date.parse(isoDate);
  if (Number.isNaN(timestamp)) {
    return '';
  }

  const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
  const isPast = diffSeconds >= 0;
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) {
    return 'just now';
  }

  const unit = UNITS.find(u => absSeconds < u.max) ?? UNITS[UNITS.length - 1];
  const value = Math.max(1, Math.floor(absSeconds / unit.seconds));
  const label = `${value} ${unit.name}${value === 1 ? '' : 's'}`;

  return isPast ? `${label} ago` : `in ${label}`;
};
