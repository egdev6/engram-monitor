import { Button } from '@atoms/button';
import { cn } from '@helpers/utils';
import { type ImportRiskResult, parseImportFile, validateImportRisk } from '@services/import-validation';
import { Download, GitMerge, Settings, Upload, X } from 'lucide-react';
import { type FC, useEffect, useId, useRef, useState } from 'react';
import type { SettingsModalProps } from './types';

const SettingsModal: FC<SettingsModalProps> = ({
  onClose,
  onExport,
  isExporting,
  onImport,
  isImporting,
  onMergeClick,
  showMerge,
  allObservations,
  prompts
}) => {
  const titleId = useId();
  const warningTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [isPreflightChecking, setIsPreflightChecking] = useState(false);
  const [blockedRisk, setBlockedRisk] = useState<ImportRiskResult | null>(null);
  const [blockedFile, setBlockedFile] = useState<File | null>(null);
  const [blockedFileName, setBlockedFileName] = useState<string | null>(null);

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

  // Keep this local for import UX so we always gate backend call behind confirmation.
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const resetImportSelection = () => {
    setSelectedFile(null);
    setRiskAccepted(false);
    setBlockedRisk(null);
    setBlockedFile(null);
    setBlockedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!selectedFile || !riskAccepted || isImporting) {
      return;
    }

    setIsPreflightChecking(true);
    try {
      const parsed = await parseImportFile(selectedFile);
      const risk = validateImportRisk(parsed, allObservations, prompts);
      if (risk.blocked) {
        setBlockedFile(selectedFile);
        setSelectedFile(null);
        setRiskAccepted(false);
        setBlockedRisk(risk);
        setBlockedFileName(selectedFile.name);
        return;
      }

      onImport(selectedFile);
      resetImportSelection();
    } catch {
      setBlockedRisk({
        blocked: true,
        reasons: ['The selected file is not a valid Engram JSON export.'],
        internalObservationDuplicates: 0,
        internalPromptDuplicates: 0,
        existingObservationDuplicates: 0,
        existingPromptDuplicates: 0
      });
      setBlockedFile(selectedFile);
      setBlockedFileName(selectedFile.name);
    } finally {
      setIsPreflightChecking(false);
    }
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

        <p className='text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed'>
          Re-importing the same backup can duplicate memories and prompts.
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
                setSelectedFile(file);
                setRiskAccepted(false);
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

      {selectedFile && (
        <>
          <button
            type='button'
            aria-label='Close import warning dialog'
            tabIndex={-1}
            onClick={resetImportSelection}
            className='fixed inset-0 z-60 bg-black/55 backdrop-blur-sm border-none cursor-default'
          />
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby={warningTitleId}
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-70',
              'w-full max-w-[30%] p-6 rounded-xl',
              'bg-background-light dark:bg-background-dark',
              'border border-gray-light-300 dark:border-gray-dark-700',
              'shadow-xl flex flex-col gap-4'
            )}
          >
            <div className='flex items-center justify-between'>
              <h3 id={warningTitleId} className='text-sm font-semibold text-text-light dark:text-text-dark'>
                Confirm JSON Import
              </h3>
              <button
                type='button'
                onClick={resetImportSelection}
                disabled={isImporting}
                aria-label='Close import warning'
                className='text-gray-light-600 dark:text-gray-dark-300 hover:text-text-light dark:hover:text-text-dark transition-colors'
              >
                <X size={16} />
              </button>
            </div>

            <div className='text-[12px] text-gray-light-700 dark:text-gray-dark-200 leading-relaxed flex flex-col gap-2'>
              <p>Importing a backup more than once may duplicate observations and prompts.</p>
              <p>Duplicated data may inflate memory counts and make the dashboard harder to use.</p>
              <p>This action cannot be automatically undone from the import flow.</p>
            </div>

            <div className='rounded-lg border border-gray-light-300 dark:border-gray-dark-700 px-3 py-2 text-[12px]'>
              <p className='text-text-light dark:text-text-dark truncate'>
                <span className='font-medium'>File:</span> {selectedFile.name}
              </p>
              <p className='text-gray-light-600 dark:text-gray-dark-300'>
                <span className='font-medium'>Size:</span> {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <label className='flex items-start gap-2 text-[12px] text-text-light dark:text-text-dark'>
              <input
                type='checkbox'
                checked={riskAccepted}
                disabled={isImporting}
                onChange={(e) => setRiskAccepted(e.target.checked)}
                className='mt-0.5'
              />
              <span>I understand the risks and want to continue.</span>
            </label>

            <p className='text-[11px] text-gray-light-600 dark:text-gray-dark-300'>
              Long-term fix: duplicate prevention should be enforced by backend idempotent validation.
            </p>

            <div className='flex justify-end gap-2'>
              <Button variant='ghost' size='sm' onClick={resetImportSelection} disabled={isImporting}>
                Choose Another File
              </Button>
              <Button
                variant='primary'
                size='sm'
                onClick={confirmImport}
                disabled={!riskAccepted || isImporting || isPreflightChecking}
              >
                {isImporting ? 'Importing…' : isPreflightChecking ? 'Checking…' : 'Confirm Import'}
              </Button>
            </div>
          </div>
        </>
      )}

      {blockedRisk && blockedFileName && (
        <>
          <button
            type='button'
            aria-label='Close import blocked dialog'
            tabIndex={-1}
            onClick={() => {
              setBlockedRisk(null);
              setBlockedFile(null);
              setBlockedFileName(null);
            }}
            className='fixed inset-0 z-80 bg-black/65 backdrop-blur-sm border-none cursor-default'
          />
          <div
            role='dialog'
            aria-modal='true'
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-90',
              'w-full max-w-lg p-6 rounded-xl',
              'bg-background-light dark:bg-background-dark',
              'border border-red-300 dark:border-red-700',
              'shadow-xl flex flex-col gap-4'
            )}
          >
            <h3 className='text-sm font-semibold text-red-700 dark:text-red-300'>Import blocked</h3>
            <p className='text-[12px] text-gray-light-700 dark:text-gray-dark-200'>
              We detected duplicate risk during local preflight validation. This import was cancelled.
            </p>
            <div className='rounded-lg border border-gray-light-300 dark:border-gray-dark-700 px-3 py-2 text-[12px]'>
              <p className='text-text-light dark:text-text-dark truncate'>
                <span className='font-medium'>File:</span> {blockedFileName}
              </p>
              {blockedRisk.reasons.map((reason) => (
                <p key={reason} className='text-gray-light-600 dark:text-gray-dark-300'>
                  • {reason}
                </p>
              ))}
            </div>
            <div className='text-[12px] text-gray-light-700 dark:text-gray-dark-200'>
              <p>
                Internal duplicates: {blockedRisk.internalObservationDuplicates + blockedRisk.internalPromptDuplicates}
              </p>
              <p>
                Possible duplicates vs existing data:{' '}
                {blockedRisk.existingObservationDuplicates + blockedRisk.existingPromptDuplicates}
              </p>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSelectedFile(blockedFile);
                  setRiskAccepted(false);
                  setBlockedRisk(null);
                  setBlockedFile(null);
                }}
              >
                Review File
              </Button>
              <Button variant='primary' size='sm' onClick={resetImportSelection}>
                Choose Another File
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SettingsModal;
