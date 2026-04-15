import { Button } from '@atoms/button';
import { cn } from '@helpers/utils';
import { Download, GitMerge, Settings, Upload, X } from 'lucide-react';
import { type FC, useEffect, useId } from 'react';
import type { SettingsModalProps } from './types';

const SettingsModal: FC<SettingsModalProps> = ({
  onClose,
  onExport,
  isExporting,
  onImport,
  isImporting,
  onMergeClick,
  showMerge,
  fileInputRef
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        type='button'
        aria-label='Close dialog'
        tabIndex={-1}
        onClick={onClose}
        className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm border-none cursor-default'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-auto max-w-[30%] p-6 rounded-xl',
          'bg-background-light dark:bg-background-dark',
          'border border-gray-light-300 dark:border-gray-dark-700',
          'shadow-xl flex flex-col gap-5'
        )}
      >
        {/* Header */}
        <div className='flex w-auto items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Settings size={16} className='text-accent' />
            <h2 id={titleId} className='text-sm font-semibold text-text-light dark:text-text-dark'>
              Settings
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close'
            className='text-gray-light-600 dark:text-gray-dark-300 hover:text-text-light dark:hover:text-text-dark transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <p className='text-[12px] text-gray-light-600 dark:text-gray-dark-300 leading-relaxed'>
          Manage your data exports, imports, and project merges.
        </p>

        {/* Actions */}
        <div className='flex flex-col gap-2'>
          <Button icon={Download} onClick={onExport} disabled={isExporting}>
            {isExporting ? 'Exporting…' : 'Export JSON'}
          </Button>

          <Button icon={Upload} onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? 'Importing…' : 'Import JSON'}
          </Button>

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

          {showMerge && (
            <Button icon={GitMerge} onClick={onMergeClick}>
              Merge Projects
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
