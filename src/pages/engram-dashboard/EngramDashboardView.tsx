import { StatCard } from '@atoms/stat-card';
import { cn } from '@helpers/utils';
import { TabBar } from '@molecules/tab-bar';
import { EmptySessionsTab } from '@organisms/empty-sessions-tab';
import { MemoriesTab } from '@organisms/memories-tab';
import { PromptsTab } from '@organisms/prompts-tab';
import { SessionsTab } from '@organisms/sessions-tab';
import { TopicsTab } from '@organisms/topics-tab';
import { Download, Upload } from 'lucide-react';
import { type FC, useMemo, useRef, useState } from 'react';
import type { EngramDashboardViewProps } from './types';

type Tab = 'sessions' | 'memories' | 'topics' | 'prompts' | 'empty';

export const EngramDashboardView: FC<EngramDashboardViewProps> = ({
  observations,
  sessions,
  sessionSummaries,
  prompts,
  filters,
  onFiltersChange,
  isLoadingObs,
  isLoadingSessions,
  isLoadingPrompts,
  onReset: _onReset,
  isResetting: _isResetting,
  onDeleteSession,
  isDeletingSession,
  onDeletePrompt,
  isDeletingPrompt,
  onExport,
  isExporting,
  onImport,
  isImporting
}) => {
  const [tab, setTab] = useState<Tab>('sessions');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Stats derived from what the panel actually shows ──────────────────────
  const allObservations = useMemo(() => sessions.flatMap((s) => s.observations), [sessions]);

  const derivedStats = useMemo(() => {
    const totalObs = sessions.reduce((acc, s) => acc + s.observationCount, 0);
    const projects = Array.from(new Set(sessions.map((s) => s.project).filter(Boolean)));
    const emptySessions = sessionSummaries.filter((s) => s.observation_count === 0);
    const topicKeys = new Set(allObservations.filter((o) => o.topic_key).map((o) => o.topic_key));
    return {
      projects: projects.length,
      sessions: sessions.length,
      observations: totalObs,
      prompts: prompts.length,
      empty: emptySessions.length,
      topics: topicKeys.size,
      allProjects: projects
    };
  }, [sessions, sessionSummaries, prompts, allObservations]);

  const tabs = [
    { id: 'sessions' as Tab, label: 'Sessions', count: derivedStats.sessions },
    { id: 'memories' as Tab, label: 'Memories', count: derivedStats.observations },
    { id: 'topics' as Tab, label: 'Topics', count: derivedStats.topics },
    { id: 'prompts' as Tab, label: 'Prompts', count: derivedStats.prompts },
    { id: 'empty' as Tab, label: 'Empty', count: derivedStats.empty }
  ];

  return (
    <div className='w-full max-w-275 flex flex-col gap-5'>
      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
        <StatCard label='Projects' value={derivedStats.projects} loading={isLoadingSessions} />
        <StatCard label='Sessions' value={derivedStats.sessions} loading={isLoadingSessions} />
        <StatCard label='Observations' value={derivedStats.observations} loading={isLoadingSessions} accent={true} />
        <StatCard label='Prompts' value={derivedStats.prompts} loading={isLoadingPrompts} />
        <StatCard label='Empty' value={derivedStats.empty} loading={isLoadingSessions} />
      </div>

      {/* Export / Import */}
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={onExport}
          disabled={isExporting}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono',
            'bg-gray-light-100 dark:bg-gray-dark-800',
            'border border-gray-light-400 dark:border-gray-dark-600',
            'text-text-light dark:text-text-dark',
            'hover:border-accent/60 hover:bg-accent/10 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Download size={12} />
          {isExporting ? 'Exporting…' : 'Export JSON'}
        </button>
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono',
            'bg-gray-light-100 dark:bg-gray-dark-800',
            'border border-gray-light-400 dark:border-gray-dark-600',
            'text-text-light dark:text-text-dark',
            'hover:border-accent/60 hover:bg-accent/10 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Upload size={12} />
          {isImporting ? 'Importing…' : 'Import JSON'}
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='.json,application/json'
          disabled={isImporting}
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && !isImporting) {
              onImport(file);
              e.target.value = '';
            }
          }}
        />
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {/* Tab content */}
      {tab === 'sessions' && (
        <SessionsTab sessions={sessions} loading={isLoadingSessions} allProjects={derivedStats.allProjects} />
      )}
      {tab === 'memories' && (
        <MemoriesTab
          observations={observations}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoadingObs}
          projects={derivedStats.allProjects}
        />
      )}
      {tab === 'topics' && (
        <TopicsTab
          observations={allObservations}
          loading={isLoadingSessions}
          allProjects={derivedStats.allProjects}
        />
      )}
      {tab === 'prompts' && (
        <PromptsTab
          prompts={prompts}
          loading={isLoadingPrompts}
          onDelete={onDeletePrompt}
          isDeleting={isDeletingPrompt}
        />
      )}
      {tab === 'empty' && (
        <EmptySessionsTab
          sessionSummaries={sessionSummaries}
          loading={isLoadingSessions}
          onDelete={onDeleteSession}
          isDeleting={isDeletingSession}
        />
      )}
    </div>
  );
};
