import { StatCard } from '@atoms/stat-card';
import { TabBar } from '@molecules/tab-bar';
import { EmptySessionsTab } from '@organisms/empty-sessions-tab';
import { MemoriesTab } from '@organisms/memories-tab';
import { PromptsTab } from '@organisms/prompts-tab';
import { SessionsTab } from '@organisms/sessions-tab';
import { type FC, useMemo, useState } from 'react';
import type { EngramDashboardViewProps } from './types';

type Tab = 'sessions' | 'memories' | 'prompts' | 'empty';

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
  isDeletingPrompt
}) => {
  const [tab, setTab] = useState<Tab>('sessions');

  // ── Stats derived from what the panel actually shows ──────────────────────
  const derivedStats = useMemo(() => {
    const totalObs = sessions.reduce((acc, s) => acc + s.observationCount, 0);
    const projects = Array.from(new Set(sessions.map((s) => s.project).filter(Boolean)));
    const emptySessions = sessionSummaries.filter((s) => s.observation_count === 0);
    return {
      projects: projects.length,
      sessions: sessions.length,
      observations: totalObs,
      prompts: prompts.length,
      empty: emptySessions.length,
      allProjects: projects
    };
  }, [sessions, sessionSummaries, prompts]);

  const tabs = [
    { id: 'sessions' as Tab, label: 'Sessions', count: derivedStats.sessions },
    { id: 'memories' as Tab, label: 'Memories', count: derivedStats.observations },
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
