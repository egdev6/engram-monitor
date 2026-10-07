import { PROJECT_COLORS } from '@constants/engram-types';

/**
 * Parses an Engram timestamp. Engram stores UTC as "YYYY-MM-DD HH:MM:SS[.fffffffff]" with no
 * zone designator, which `new Date()` reads as local time (and Safari rejects outright).
 */
export function parseEngramDate(value: string): Date {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d{1,3})?\d*$/);
  return match ? new Date(`${match[1]}T${match[2]}${match[3] ?? ''}Z`) : new Date(value);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - parseEngramDate(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Epoch ms at the start of the local calendar day for a `YYYY-MM-DD` filter input, offset by
 * `dayOffset` days. `new Date('YYYY-MM-DD')` parses date-only strings as UTC midnight, which
 * shifts the boundary by the viewer's offset; building the date from local components keeps the
 * filter on the viewer's calendar, and `dayOffset: 1` spans DST days of 23h or 25h instead of
 * assuming a fixed 24h.
 */
export function localDayBoundary(date: string, dayOffset = 0): number {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day + dayOffset).getTime();
}

/**
 * Whether an Engram timestamp falls inside the local date range: lower bound inclusive at local
 * midnight of `from`, upper bound exclusive at local midnight of the day after `to`. Empty bounds
 * are ignored. Comparisons are written positively so an unparseable timestamp or bound yields an
 * Invalid Date and is rejected whenever that bound is active (matching the previous `>=`/`<=`
 * filters), while leaving the range unfiltered when no bound is set.
 */
export function isWithinLocalDateRange(value: string, from: string, to: string): boolean {
  const time = parseEngramDate(value).getTime();
  if (from && !(time >= localDayBoundary(from))) {
    return false;
  }
  if (to && !(time < localDayBoundary(to, 1))) {
    return false;
  }
  return true;
}

export function projectColor(project: string, allProjects: string[]): string {
  const idx = allProjects.indexOf(project);
  return PROJECT_COLORS[idx % PROJECT_COLORS.length];
}
