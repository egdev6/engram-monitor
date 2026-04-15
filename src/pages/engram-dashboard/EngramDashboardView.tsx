import { StatCard } from '@atoms/stat-card';
import { useSettingsStore } from '@hooks/use-settings';
import { TabBar } from '@molecules/tab-bar';
import { EmptySessionsTab } from '@organisms/empty-sessions-tab';
import { MemoriesTab } from '@organisms/memories-tab';
import { MergeProjectsModal } from '@organisms/merge-projects-modal';
import { PromptsTab } from '@organisms/prompts-tab';
import { SessionsTab } from '@organisms/sessions-tab';
import { SettingsModal } from '@organisms/settings-modal';
import { TimelineTab } from '@organisms/timeline-tab';
import { TopicsTab } from '@organisms/topics-tab';
import { type FC, useMemo, useRef, useState } from 'react';
import type { EngramDashboardViewProps } from './types';

type Tab = 'sessions' | 'memories' | 'topics' | 'timeline' | 'prompts' | 'empty';

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
  isImporting,
  onMergeProjects,
  isMergingProjects
}) => {
  const [tab, setTab] = useState<Tab>('sessions');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMerge, setShowMerge] = useState(false);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const closeSettings = useSettingsStore((state) => state.closeSettings);

  const allObservations = useMemo(() => sessions.flatMap((s) => s.observations), [sessions]);

  const derivedStats = useMemo(() => {
    const totalObs = sessions.reduce((acc, s) => acc + s.observationCount, 0);
    const projects = Array.from(new Set(sessions.map((s) => s.project).filter(Boolean)));
    const emptySessions = sessionSummaries.filter((s) => s.observation_count === 0);
    const topicKeys = new Set(allObservations.filter((o) => o.topic_key).map((o) => o.topic_key));
    return {
      projects: projects.length,
      sessions: sessions.length,
      memories: totalObs,
      prompts: prompts.length,
      empty: emptySessions.length,
      topics: topicKeys.size,
      allProjects: projects
    };
  }, [sessions, sessionSummaries, prompts, allObservations]);

  const tabs = [
    { id: 'sessions' as Tab, label: 'Sessions', count: derivedStats.sessions },
    { id: 'memories' as Tab, label: 'Memories', count: derivedStats.memories },
    { id: 'timeline' as Tab, label: 'Timeline', count: allObservations.length },
    { id: 'topics' as Tab, label: 'Topics', count: derivedStats.topics },
    { id: 'prompts' as Tab, label: 'Prompts', count: derivedStats.prompts },
    { id: 'empty' as Tab, label: 'Empty', count: derivedStats.empty }
  ];

  return (
    <div className='w-full max-w-275 flex flex-col gap-5'>
      {/* Hidden file input for import */}
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

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-6 gap-2'>
        <StatCard label='Projects' value={derivedStats.projects} loading={isLoadingSessions} />
        <StatCard
          label='Sessions'
          value={derivedStats.sessions}
          loading={isLoadingSessions}
          accent={tab === 'sessions'}
        />
        <StatCard
          label='Memories'
          value={derivedStats.memories}
          loading={isLoadingSessions}
          accent={tab === 'memories' || tab === 'timeline'}
        />
        <StatCard label='Topics' value={derivedStats.topics} loading={isLoadingSessions} accent={tab === 'topics'} />
        <StatCard label='Prompts' value={derivedStats.prompts} loading={isLoadingPrompts} accent={tab === 'prompts'} />
        <StatCard label='Empty' value={derivedStats.empty} loading={isLoadingSessions} accent={tab === 'empty'} />
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {/* Tab content */}
      {tab === 'memories' && (
        <MemoriesTab
          observations={observations}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoadingObs}
          projects={derivedStats.allProjects}
        />
      )}
      {tab === 'sessions' && (
        <SessionsTab sessions={sessions} loading={isLoadingSessions} allProjects={derivedStats.allProjects} />
      )}
      {tab === 'topics' && (
        <TopicsTab observations={allObservations} loading={isLoadingSessions} allProjects={derivedStats.allProjects} />
      )}
      {tab === 'timeline' && (
        <TimelineTab
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={closeSettings}
          onExport={onExport}
          isExporting={isExporting}
          onImport={onImport}
          isImporting={isImporting}
          onMergeClick={() => {
            closeSettings();
            setShowMerge(true);
          }}
          showMerge={derivedStats.allProjects.length > 1}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Merge Projects Modal */}
      {showMerge && (
        <MergeProjectsModal
          projects={derivedStats.allProjects}
          onMerge={(from, to) => {
            onMergeProjects(from, to, () => {
              setShowMerge(false);
            });
          }}
          isMerging={isMergingProjects}
          onClose={() => {
            if (!isMergingProjects) {
              setShowMerge(false);
            }
          }}
        />
      )}
    </div>
  );
};
