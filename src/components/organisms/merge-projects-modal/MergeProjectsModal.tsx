import { Button } from '@atoms/button';
import { INPUT_CLS } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { AlertCircle, ArrowRight, Check, Copy, GitMerge, Terminal, X } from 'lucide-react';
import { type FC, useEffect, useId, useState } from 'react';
import type { MergeProjectsModalProps } from './types';

function isV2OrV3(version?: string): boolean {
  if (!version) {
    return true; // Default safe for current releases
  }
  const match = version.match(/v?(\d+)/);
  if (!match) {
    return true;
  }
  const major = Number.parseInt(match[1], 10);
  return major >= 2;
}

const MergeProjectsModal: FC<MergeProjectsModalProps> = ({ projects, onMerge, isMerging, onClose, serverVersion }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [copied, setCopied] = useState(false);
  const titleId = useId();
  const fromId = useId();
  const toId = useId();

  const isModernEngram = isV2OrV3(serverVersion);
  const targetOptions = projects.filter((p) => p !== from);
  const canMerge = Boolean(from && to && from !== to && !isMerging);

  const cliCommand = `engram projects merge --from "${from || '<source>'}" --to "${to || '<target>'}" --apply`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access blocked — ignore
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset target if it matches the new source
  useEffect(() => {
    if (to === from) {
      setTo('');
    }
  }, [from, to]);

  const handleMerge = () => {
    if (!canMerge) {
      return;
    }
    if (!window.confirm(`Merge all observations from "${from}" into "${to}"?\n\nThis action cannot be undone.`)) {
      return;
    }
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

        <p className='text-[12px] text-gray-light-600 dark:text-gray-dark-300 leading-relaxed'>
          Move all observations from one project into another. The source project will be empty after merging.
        </p>

        {isModernEngram && (
          <div className='flex flex-col gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed'>
            <div className='flex items-center gap-1.5 font-medium'>
              <AlertCircle size={14} className='shrink-0' />
              <span>Engram {serverVersion || 'v2/v3'}: HTTP project migration is deprecated</span>
            </div>
            <p className='text-[11px] opacity-90'>
              In modern Engram, merging projects is executed safely via the official CLI. Select projects below to
              generate the command:
            </p>
            <div className='flex items-center justify-between gap-2 p-2 rounded bg-black/10 dark:bg-black/30 font-mono text-[10px] break-all'>
              <span className='select-all'>{cliCommand}</span>
              <button
                type='button'
                onClick={handleCopyCommand}
                className='flex items-center gap-1 px-2 py-1 rounded bg-accent/20 hover:bg-accent/30 text-accent font-sans transition-colors shrink-0'
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Selectors */}
        <div className='flex items-center gap-3'>
          <div className='flex-1 flex flex-col gap-1'>
            <label
              htmlFor={fromId}
              className='text-[10px] uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300'
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
              className='text-[10px] uppercase tracking-widest text-gray-light-600 dark:text-gray-dark-300'
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
          <Button variant='ghost' size='sm' onClick={onClose} disabled={isMerging}>
            Close
          </Button>
          {!isModernEngram && (
            <Button variant='primary' size='sm' icon={GitMerge} onClick={handleMerge} disabled={!canMerge}>
              {isMerging ? 'Merging…' : 'Merge'}
            </Button>
          )}
          {isModernEngram && (
            <Button
              variant='primary'
              size='sm'
              icon={copied ? Check : Terminal}
              onClick={handleCopyCommand}
              disabled={!canMerge}
            >
              {copied ? 'Command Copied' : 'Copy CLI Command'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default MergeProjectsModal;
