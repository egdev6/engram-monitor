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

export function projectColor(project: string, allProjects: string[]): string {
  const idx = allProjects.indexOf(project);
  return PROJECT_COLORS[idx % PROJECT_COLORS.length];
}
