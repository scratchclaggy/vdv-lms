const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns a date `days` days in the past, with enough buffer that it stays
 * safely past the present even accounting for HTTP round-trip time.
 */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

/**
 * Returns a date `days` days in the future, with enough buffer that it stays
 * safely ahead of the present even accounting for HTTP round-trip time.
 */
export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}
