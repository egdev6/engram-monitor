import { PROJECT_COLORS } from '@constants/engram-types';

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
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
