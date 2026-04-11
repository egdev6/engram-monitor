import { useEngramSessions } from '@hooks/use-engram';
import { BackButton } from '@atoms/back-button';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SessionDetailView } from './SessionDetailView';

const SessionDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = useEngramSessions();

  const session = useMemo(
    () => sessions.find((s) => s.sessionId === sessionId),
    [sessions, sessionId],
  );

  const allProjects = useMemo(
    () => [...new Set(sessions.map((s) => s.project))].filter(Boolean).sort(),
    [sessions],
  );

  const handleBack = () => navigate('/');

  if (isLoading && !session) {
    return (
      <div className='flex flex-col gap-4 animate-pulse'>
        <div className='h-8 w-32 rounded-lg bg-gray-light-200 dark:bg-gray-dark-700' />
        <div className='h-28 rounded-lg bg-gray-light-200 dark:bg-gray-dark-700' />
        {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
          <div key={k} className='h-12 rounded-lg bg-gray-light-200 dark:bg-gray-dark-700' />
        ))}
      </div>
    );
  }

  if (!session) {
    return (
      <div className='flex flex-col items-center gap-4 py-20'>
        <p className='text-[13px] font-mono text-gray-light-600 dark:text-gray-dark-300'>
          Session not found
        </p>
        <BackButton label='Back to dashboard' onClick={handleBack} />
      </div>
    );
  }

  return (
    <SessionDetailView
      session={session}
      allProjects={allProjects}
      onBack={handleBack}
    />
  );
};

export default SessionDetailPage;
