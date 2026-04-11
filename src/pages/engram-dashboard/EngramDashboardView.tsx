import { StatCard } from '@atoms/stat-card';
import { TabBar } from '@molecules/tab-bar';
import { SessionsTab } from '@organisms/sessions-tab';
import { MemoriesTab } from '@organisms/memories-tab';
import { type FC, useState } from 'react';
import type { EngramDashboardViewProps } from './types';

type Tab = 'sessions' | 'memories';

export const EngramDashboardView: FC<EngramDashboardViewProps> = ({
  stats, observations, sessions, filters, onFiltersChange,
  isLoadingStats, isLoadingObs, isLoadingSessions,
}) => {
  const [tab, setTab] = useState<Tab>('sessions');
  const projects = stats?.projects ?? [];

  const tabs = [
    { id: 'sessions' as Tab, label: 'Sessions', count: stats?.total_sessions },
    { id: 'memories' as Tab, label: 'Memories', count: stats?.total_observations },
  ];

  return (
    <div className='w-full max-w-275 flex flex-col gap-5'>

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
        <StatCard label='Sessions'     value={stats?.total_sessions ?? 0}     loading={isLoadingStats} />
        <StatCard label='Observations' value={stats?.total_observations ?? 0} loading={isLoadingStats} accent />
        <StatCard label='Prompts'      value={stats?.total_prompts ?? 0}      loading={isLoadingStats} />
        <StatCard label='Projects'     value={stats?.projects?.length ?? 0}   loading={isLoadingStats} />
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} active={tab} onChange={(id) => setTab(id as Tab)} />

      {/* Tab content */}
      {tab === 'sessions'
        ? <SessionsTab sessions={sessions} loading={isLoadingSessions} allProjects={projects} />
        : (
          <MemoriesTab
            observations={observations}
            filters={filters}
            onFiltersChange={onFiltersChange}
            isLoading={isLoadingObs}
            projects={projects}
          />
        )
      }
    </div>
  );
};
