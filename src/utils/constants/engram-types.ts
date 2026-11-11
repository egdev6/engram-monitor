export const TYPE_COLORS: Record<string, string> = {
  pattern: 'bg-blue/20 text-blue border-blue/30',
  decision: 'bg-purple/20 text-purple border-purple/30',
  discovery: 'bg-teal/20 text-teal border-teal/30',
  handoff: 'bg-orange/20 text-orange border-orange/30',
  summary: 'bg-green/20 text-green border-green/30',
  prompt: 'bg-pink/20 text-pink border-pink/30',
  bugfix: 'bg-red-400/20 text-red-400 border-red-400/30',
  architecture: 'bg-indigo/20 text-indigo border-indigo/30',
  config: 'bg-yellow/20 text-yellow border-yellow/30',
  learning: 'bg-teal/20 text-teal border-teal/30'
};

// Neutral badge for types without a dedicated color (session_summary, passive, preference, manual...)
export const FALLBACK_TYPE_COLOR = [
  'bg-gray-light-300 text-gray-light-800 border-gray-light-500/60',
  'dark:bg-gray-dark-400/30 dark:text-gray-dark-200 dark:border-gray-dark-500/30'
].join(' ');

export const PROJECT_COLORS = [
  'bg-blue/15 text-blue border-blue/30',
  'bg-purple/15 text-purple border-purple/30',
  'bg-teal/15 text-teal border-teal/30',
  'bg-orange/15 text-orange border-orange/30',
  'bg-indigo/15 text-indigo border-indigo/30',
  'bg-green/15 text-green border-green/30'
];

export const KNOWN_TYPES = [
  'pattern',
  'decision',
  'discovery',
  'handoff',
  'summary',
  'prompt',
  'bugfix',
  'architecture',
  'config',
  'learning'
] as const;

export const INPUT_CLS = [
  'px-3 py-2 rounded-lg text-sm',
  'bg-gray-light-100 dark:bg-gray-dark-800',
  'border border-gray-light-400 dark:border-gray-dark-400',
  'text-text-light dark:text-text-dark placeholder:text-gray-light-600 dark:placeholder:text-gray-dark-300',
  'focus:outline-none focus:border-accent/60 transition-colors'
].join(' ');

// Replaces the native arrow so it keeps the same inset as the text padding
export const SELECT_CLS = `${INPUT_CLS} select-chevron pr-9`;
