import { IconButton } from '@atoms/icon-button';
import { TypeBadge } from '@atoms/type-badge';
import { INPUT_CLS, KNOWN_TYPES } from '@constants/engram-types';
import { cn } from '@helpers/utils';
import { useUpdateObservation } from '@hooks/use-engram';
import type { EngramObservationType, EngramScope } from '@models/engram';
import { Check, FolderOpen, Pencil, Shield, Tag, X } from 'lucide-react';
import { marked } from 'marked';
import { type FC, useEffect, useRef, useState } from 'react';
import type { MarkdownPanelProps } from './types';

const SCOPE_OPTIONS: EngramScope[] = ['project', 'personal', 'global'];

const MarkdownPanel: FC<MarkdownPanelProps> = ({ observation: obs, onClose, onUpdated }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(obs.title);
  const [content, setContent] = useState(obs.content);
  const [type, setType] = useState<EngramObservationType>(obs.type);
  const [scope, setScope] = useState<EngramScope>(obs.scope);
  const [topicKey, setTopicKey] = useState(obs.topic_key ?? '');

  const updateMutation = useUpdateObservation();

  // Sync local state when observation changes (e.g. polling update)
  useEffect(() => {
    if (!editing) {
      setTitle(obs.title);
      setContent(obs.content);
      setType(obs.type);
      setScope(obs.scope);
      setTopicKey(obs.topic_key ?? '');
    }
  }, [obs, editing]);

  useEffect(() => {
    if (contentRef.current && !editing) {
      contentRef.current.innerHTML = marked(obs.content, { async: false }) as string;
    }
  }, [obs.content, editing]);

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
  }, [onClose, editing]);

  const handleCancel = () => {
    setTitle(obs.title);
    setContent(obs.content);
    setType(obs.type);
    setScope(obs.scope);
    setTopicKey(obs.topic_key ?? '');
    setEditing(false);
  };

  const handleSave = () => {
    const data: Record<string, string | null | undefined> = {};
    if (title !== obs.title) data.title = title;
    if (content !== obs.content) data.content = content;
    if (type !== obs.type) data.type = type;
    if (scope !== obs.scope) data.scope = scope;
    const newTopicKey = topicKey.trim() || null;
    if (newTopicKey !== (obs.topic_key ?? null)) data.topic_key = newTopicKey;

    if (Object.keys(data).length === 0) {
      setEditing(false);
      return;
    }

    updateMutation.mutate(
      { id: obs.id, data },
      {
        onSuccess: (updated) => {
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
              <h2 className='text-sm font-semibold text-text-light dark:text-text-dark leading-snug'>{obs.title}</h2>
            )}

            <div className='flex items-center gap-2 flex-wrap'>
              {editing ? (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={cn(INPUT_CLS, 'py-1 text-[11px]')}
                >
                  {KNOWN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <TypeBadge type={obs.type} />
              )}
              {obs.project && !editing && (
                <span className='inline-flex items-center gap-1 text-[11px] font-mono text-gray-light-600 dark:text-gray-dark-300'>
                  <FolderOpen size={10} className='opacity-60 shrink-0' />
                  {obs.project}
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
                obs.topic_key && (
                  <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                    <Tag size={9} className='text-gray-light-400 dark:text-gray-dark-300 shrink-0' />
                    {obs.topic_key}
                  </span>
                )
              )}
              <span className='text-[11px] font-mono text-gray-light-500 dark:text-gray-dark-300'>
                {new Date(obs.created_at).toLocaleString()}
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
                  {SCOPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              obs.scope &&
              obs.scope !== 'project' && (
                <span className='inline-flex items-center gap-1 text-[10px] font-mono text-gray-light-400 dark:text-gray-dark-300'>
                  <Shield size={9} className='shrink-0' />
                  {obs.scope}
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
