import { IconButton } from '@atoms/icon-button';
import { TypeBadge } from '@atoms/type-badge';
import { cn } from '@helpers/utils';
import { FolderOpen, Shield, Tag, X } from 'lucide-react';
import { marked } from 'marked';
import { type FC, useEffect, useRef } from 'react';
import type { MarkdownPanelProps } from './types';

const MarkdownPanel: FC<MarkdownPanelProps> = ({ observation: obs, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = marked(obs.content, { async: false }) as string;
    }
  }, [obs.content]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      <div className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm' onClick={onClose} />
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-160',
          'bg-background-light dark:bg-background-dark',
          'border-l border-gray-light-300 dark:border-gray-dark-700',
          'flex flex-col shadow-xl overflow-hidden'
        )}
      >
        {/* Header */}
        <div className='flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-light-300 dark:border-gray-dark-700'>
          <div className='flex flex-col gap-1.5 min-w-0'>
            <h2 className='text-sm font-semibold text-text-light dark:text-text-dark leading-snug'>{obs.title}</h2>
            <div className='flex items-center gap-2 flex-wrap'>
              <TypeBadge type={obs.type} />
              {obs.project && (
                <span className='inline-flex items-center gap-1 text-[11px] font-mono text-gray-light-600 dark:text-gray-dark-300'>
                  <FolderOpen size={10} className='opacity-60 shrink-0' />
                  {obs.project}
                </span>
              )}
              {obs.topic_key && (
                <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                  <Tag size={9} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
                  {obs.topic_key}
                </span>
              )}
              <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                {new Date(obs.created_at).toLocaleString()}
              </span>
            </div>
            {obs.scope && obs.scope !== 'project' && (
              <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-400 dark:text-gray-dark-300'>
                <Shield size={9} className='shrink-0' />
                {obs.scope}
              </span>
            )}
          </div>
          <IconButton icon={X} size={16} label='Close' onClick={onClose} className='mt-0.5' />
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          <div ref={contentRef} className='markdown-body text-[13px] text-text-light dark:text-text-dark' />
        </div>
      </div>
    </>
  );
};

export default MarkdownPanel;
