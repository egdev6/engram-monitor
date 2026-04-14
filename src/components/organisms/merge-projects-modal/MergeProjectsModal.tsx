import { INPUT_CLS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { ArrowRight, GitMerge, X } from 'lucide-react';
import { type FC, useEffect, useId, useState } from 'react';
import type { MergeProjectsModalProps } from './types';

const MergeProjectsModal: FC<MergeProjectsModalProps> = ({ projects, onMerge, isMerging, onClose }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const titleId = useId();
  const fromId = useId();
  const toId = useId();

  const targetOptions = projects.filter((p) => p !== from);
  const canMerge = Boolean(from && to && from !== to && !isMerging);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset target if it matches the new source
  useEffect(() => {
    if (to === from) setTo('');
  }, [from, to]);

  const handleMerge = () => {
    if (!canMerge) return;
    if (
      !window.confirm(
        `Merge all observations from "${from}" into "${to}"?\n\nThis action cannot be undone.`
      )
    )
      return;
    onMerge(from, to);
  };

  return (
    <>
      <button
        type='button'
        aria-label='Close dialog'
        tabIndex={-1}
        onClick={onClose}
        disabled={isMerging}
        className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm border-none cursor-default'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-md p-6 rounded-xl',
          'bg-background-light dark:bg-background-dark',
          'border border-gray-light-300 dark:border-gray-dark-700',
          'shadow-xl flex flex-col gap-5'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <GitMerge size={16} className='text-accent' />
            <h2 id={titleId} className='text-sm font-semibold text-text-light dark:text-text-dark'>
              Merge Projects
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            disabled={isMerging}
            aria-label='Close'
            className={cn(
              'text-gray-light-600 dark:text-gray-dark-300 hover:text-text-light dark:hover:text-text-dark transition-colors',
              isMerging && 'opacity-40 cursor-not-allowed'
            )}
          >
            <X size={16} />
          </button>
        </div>

        <p className='text-[12px] font-mono text-gray-light-600 dark:text-gray-dark-300 leading-relaxed'>
          Move all observations from one project into another. The source project will be empty after merging.
        </p>

        {/* Selectors */}
        <div className='flex items-center gap-3'>
          <div className='flex-1 flex flex-col gap-1'>
            <label
              htmlFor={fromId}
              className='text-[10px] font-mono uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300'
            >
              From
            </label>
            <select
              id={fromId}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={isMerging}
              className={cn(INPUT_CLS, 'py-2 w-full', isMerging && 'opacity-50')}
            >
              <option value=''>Select source…</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight size={16} className='text-gray-light-400 dark:text-gray-dark-300 mt-4 shrink-0' />

          <div className='flex-1 flex flex-col gap-1'>
            <label
              htmlFor={toId}
              className='text-[10px] font-mono uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300'
            >
              Into
            </label>
            <select
              id={toId}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={!from || isMerging}
              className={cn(INPUT_CLS, 'py-2 w-full', (!from || isMerging) && 'opacity-50')}
            >
              <option value=''>Select target…</option>
              {targetOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            disabled={isMerging}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[11px] font-mono',
              'border border-gray-light-400 dark:border-gray-dark-600',
              'text-text-light dark:text-text-dark',
              'hover:bg-gray-light-200 dark:hover:bg-gray-dark-800 transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleMerge}
            disabled={!canMerge}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono',
              'bg-accent/20 text-accent border border-accent/30',
              'hover:bg-accent/30 transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <GitMerge size={12} />
            {isMerging ? 'Merging…' : 'Merge'}
          </button>
        </div>
      </div>
    </>
  );
};

export default MergeProjectsModal;
