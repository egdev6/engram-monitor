import { IconButton } from '@atoms/icon-button';
import { TypeBadge } from '@atoms/type-badge';
import { INPUT_CLS, KNOWN_TYPES } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { useUpdateObservation } from '@hooks/use-engram';
import type { EngramObservation, EngramObservationUpdate, EngramObservationType, EngramScope } from '@models/engram';
import { Check, FolderOpen, Pencil, Shield, Tag, X } from 'lucide-react';
import { marked } from 'marked';
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MarkdownPanelProps } from './types';

const BASE_SCOPES: EngramScope[] = ['project', 'personal', 'global'];

const MarkdownPanel: FC<MarkdownPanelProps> = ({ observation: initialObs, onClose, onUpdated }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [currentObs, setCurrentObs] = useState<EngramObservation>(initialObs);

  const [title, setTitle] = useState(currentObs.title);
  const [content, setContent] = useState(currentObs.content);
  const [type, setType] = useState<EngramObservationType>(currentObs.type);
  const [scope, setScope] = useState<EngramScope>(currentObs.scope);
  const [topicKey, setTopicKey] = useState(currentObs.topic_key ?? '');

  const updateMutation = useUpdateObservation();

  // Build type options: KNOWN_TYPES + current type if custom
  const typeOptions = useMemo(() => {
    const types = [...KNOWN_TYPES] as string[];
    if (currentObs.type && !types.includes(currentObs.type)) {
      types.push(currentObs.type);
    }
    return types;
  }, [currentObs.type]);

  // Build scope options: BASE_SCOPES + current scope if custom
  const scopeOptions = useMemo(() => {
    const scopes = [...BASE_SCOPES];
    if (currentObs.scope && !scopes.includes(currentObs.scope)) {
      scopes.push(currentObs.scope);
    }
    return scopes;
  }, [currentObs.scope]);

  // Sync from polling when not editing
  useEffect(() => {
    if (!editing) {
      setCurrentObs(initialObs);
      setTitle(initialObs.title);
      setContent(initialObs.content);
      setType(initialObs.type);
      setScope(initialObs.scope);
      setTopicKey(initialObs.topic_key ?? '');
    }
  }, [initialObs, editing]);

  // Render markdown content
  useEffect(() => {
    if (contentRef.current && !editing) {
      const html = marked(currentObs.content, { async: false }) as string;
      contentRef.current.textContent = '';
      const template = document.createElement('template');
      template.innerHTML = html;
      contentRef.current.appendChild(template.content);
    }
  }, [currentObs.content, editing]);

  const handleCancel = useCallback(() => {
    setTitle(currentObs.title);
    setContent(currentObs.content);
    setType(currentObs.type);
    setScope(currentObs.scope);
    setTopicKey(currentObs.topic_key ?? '');
    setEditing(false);
  }, [currentObs]);

  // Esc key handler with proper deps
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) {
          handleCancel();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, editing, handleCancel]);

  const handleSave = () => {
    const data: EngramObservationUpdate = {};
    if (title !== currentObs.title) data.title = title;
    if (content !== currentObs.content) data.content = content;
    if (type !== currentObs.type) data.type = type;
    if (scope !== currentObs.scope) data.scope = scope;
    const newTopicKey = topicKey.trim() || null;
    if (newTopicKey !== (currentObs.topic_key ?? null)) data.topic_key = newTopicKey;

    if (Object.keys(data).length === 0) {
      setEditing(false);
      return;
    }

    updateMutation.mutate(
      { id: currentObs.id, data },
      {
        onSuccess: (updated) => {
          setCurrentObs(updated);
          setEditing(false);
          onUpdated?.(updated);
        }
      }
    );
  };

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
          <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
            {editing ? (
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(INPUT_CLS, 'text-sm font-semibold w-full')}
              />
            ) : (
              <h2 className='text-sm font-semibold text-text-light dark:text-text-dark leading-snug'>
                {currentObs.title}
              </h2>
            )}

            <div className='flex items-center gap-2 flex-wrap'>
              {editing ? (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={cn(INPUT_CLS, 'py-1 text-[11px]')}
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <TypeBadge type={currentObs.type} />
              )}
              {currentObs.project && !editing && (
                <span className='inline-flex items-center gap-1 text-[11px] font-mono text-gray-light-600 dark:text-gray-dark-300'>
                  <FolderOpen size={10} className='opacity-60 shrink-0' />
                  {currentObs.project}
                </span>
              )}
              {editing ? (
                <div className='flex items-center gap-1'>
                  <Tag size={9} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
                  <input
                    type='text'
                    value={topicKey}
                    onChange={(e) => setTopicKey(e.target.value)}
                    placeholder='topic_key'
                    className={cn(INPUT_CLS, 'py-1 text-[10px] w-40')}
                  />
                </div>
              ) : (
                currentObs.topic_key && (
                  <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                    <Tag size={9} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
                    {currentObs.topic_key}
                  </span>
                )
              )}
              <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                {new Date(currentObs.created_at).toLocaleString()}
              </span>
            </div>

            {editing ? (
              <div className='flex items-center gap-1'>
                <Shield size={9} className='shrink-0 text-gray-light-400 dark:text-gray-dark-300' />
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className={cn(INPUT_CLS, 'py-1 text-[10px]')}
                >
                  {scopeOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              currentObs.scope &&
              currentObs.scope !== 'project' && (
                <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-400 dark:text-gray-dark-300'>
                  <Shield size={9} className='shrink-0' />
                  {currentObs.scope}
                </span>
              )
            )}
          </div>

          <div className='flex items-center gap-2 mt-0.5'>
            {editing ? (
              <>
                <IconButton icon={X} size={16} label='Cancel' onClick={handleCancel} />
                <button
                  type='button'
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono',
                    'bg-green/20 text-green border border-green/30',
                    'hover:bg-green/30 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Check size={12} />
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <IconButton icon={Pencil} size={14} label='Edit' onClick={() => setEditing(true)} />
                <IconButton icon={X} size={16} label='Close' onClick={onClose} />
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          {editing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(INPUT_CLS, 'w-full h-full min-h-60 resize-none font-mono text-[13px] leading-relaxed')}
            />
          ) : (
            <div ref={contentRef} className='markdown-body text-[13px] text-text-light dark:text-text-dark' />
          )}
        </div>

        {/* Error feedback */}
        {updateMutation.isError && (
          <div className='px-6 py-3 border-t border-red-400/30 bg-red-400/10 text-red-400 text-[12px] font-mono'>
            Error: {updateMutation.error?.message ?? 'Failed to update observation'}
          </div>
        )}
      </div>
    </>
  );
};

export default MarkdownPanel;
