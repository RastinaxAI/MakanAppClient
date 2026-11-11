'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useContext, useId, useMemo, useRef, type ReactNode } from 'react';
import { Upload, FileText, FileImage, Clock3, Trash2, X } from 'lucide-react';
import { SceneMenuClose, useSceneMenuTools } from '@/components/v5/form-actions';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';
import type { TransferProgress } from '@/lib/api/file-transfer';
import { formatFileSize } from '../messaging/media-model';
import s from './lesson-attachments.module.css';
import type { EditorAttachment, PendingLessonAttachment } from './lesson-draft';
export type { EditorAttachment } from './lesson-draft';
export function LessonAttachmentEditor({
  assets,
  pending,
  uploading,
  disabled,
  progress,
  error,
  onPick,
  onRemove,
  onCancel,
  onCheck,
  onDismiss,
  readOnly = false,
  inMenu = false,
  menuControls,
  pickerLabel = uiText.v5Lessons.addAttachment,
  pickerHint = uiText.v5Lessons.fileHint,
  fileInputLabel = uiText.text_ab79179420ee,
  regionLabel = uiText.text_968ea718e159,
}: {
  assets: EditorAttachment[];
  pending?: PendingLessonAttachment;
  uploading?: boolean;
  disabled?: boolean;
  progress?: TransferProgress;
  error?: unknown;
  onPick?: (file: File) => void;
  onRemove?: (id: string) => void;
  onCancel?: () => void;
  onCheck?: () => void;
  onDismiss?: () => void;
  readOnly?: boolean;
  inMenu?: boolean;
  menuControls?: ReactNode;
  pickerLabel?: string;
  pickerHint?: string;
  fileInputLabel?: string;
  regionLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null),
    id = useId();
  const closeMenu = useContext(SceneMenuClose);
  const tools = useMemo(
    () => (
      <>
        {menuControls}
        {!readOnly && onPick && (
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading || !!pending}
            onClick={() => {
              input.current?.click();
              closeMenu?.();
            }}
          >
            {pickerLabel}
          </Button>
        )}
        {!readOnly &&
          onRemove &&
          assets.map((asset) => (
            <Button
              key={asset.id}
              type="button"
              variant="ghost"
              disabled={disabled || uploading}
              onClick={() => {
                onRemove(asset.id);
                closeMenu?.();
              }}
            >
              <Trash2 size={18} aria-hidden="true" />
              {uiText.text_d3f1f47d3218 + asset.name}
            </Button>
          ))}
      </>
    ),
    [
      menuControls,
      readOnly,
      onPick,
      onRemove,
      assets,
      disabled,
      uploading,
      pending,
      closeMenu,
      pickerLabel,
    ],
  );
  useSceneMenuTools(tools, inMenu && !readOnly);
  const percent = progress?.total
    ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
    : null;
  return (
    <section className={uiClass(s.panel)} aria-label={regionLabel} aria-busy={uploading}>
      {!readOnly && onPick && (!inMenu || !assets.length) && (
        <button
          type="button"
          className={uiClass(`upload ${s.picker}`)}
          aria-label={pickerLabel}
          aria-describedby={id}
          disabled={disabled || uploading || !!pending}
          onClick={() => input.current?.click()}
        >
          <Upload size={26} aria-hidden="true" />
          <b>{pickerLabel}</b>
          <span id={id} className={uiClass(s.hint)}>
            {pickerHint}
          </span>
        </button>
      )}
      {!readOnly && onPick && (
        <NativeInput
          ref={input}
          type="file"
          className={uiClass(s.fileInput)}
          tabIndex={-1}
          disabled={disabled || uploading || !!pending}
          aria-label={fileInputLabel}
          aria-describedby={id}
          onChange={(ev) => {
            const file = ev.target.files?.[0];
            ev.target.value = '';
            if (file) onPick?.(file);
          }}
        />
      )}
      {!!assets.length && (
        <ul className={uiClass(s.list)}>
          {assets.map((asset) => (
            <li key={asset.id} className={uiClass('file')}>
              <span className={uiClass(`doc-icon ${s.fileIcon}`)}>
                {asset.contentType?.startsWith('image/') ? (
                  <FileImage size={22} />
                ) : (
                  <FileText size={22} />
                )}
              </span>
              <div>
                <h4 dir="auto">{asset.name}</h4>
                <small>
                  {asset.sizeBytes === undefined
                    ? uiText.text_fbfd46e53247
                    : formatFileSize(asset.sizeBytes)}
                  {asset.status === 'Ready' ? uiText.text_1bf987f717ef : ''}
                </small>
              </div>
              {!readOnly && !inMenu && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || uploading}
                  aria-label={uiText.text_d3f1f47d3218 + asset.name}
                  onClick={() => onRemove(asset.id)}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {uploading && (
        <div className={uiClass(s.progress)} role="status">
          <div>
            <strong>
              {progress?.phase === 'processing'
                ? uiText.text_e06356df9cbf
                : uiText.text_b4ad4b31d4f7}
            </strong>
            <span>
              {percent === null ? '' : percent.toLocaleString('fa-IR') + uiText.text_a489ae36a167}
            </span>
          </div>
          <progress
            aria-label={uiText.text_b5aeb593a9f9}
            max={progress?.total ?? undefined}
            value={progress?.total ? progress.loaded : undefined}
          />
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X size={17} />
            {uiText.text_f5bcc4fdc106}
          </Button>
        </div>
      )}
      {pending && (
        <div className={uiClass(s.pending)}>
          <Clock3 size={21} />
          <div>
            <strong dir="auto">{pending.originalFileName}</strong>
            <p role="status">
              {pending.status === 'Pending' ? uiText.text_ab2b2b678ccc : uiText.text_c93466e60cc4}
            </p>
            <div className={uiClass(s.actions)}>
              {pending.status === 'Pending' && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || uploading}
                  onClick={onCheck}
                >
                  {uiText.text_64197e65a1c9}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                disabled={disabled || uploading}
                onClick={onDismiss}
              >
                {uiText.text_0cce97418be8}
              </Button>
            </div>
          </div>
        </div>
      )}
      {!!error && <ErrorState error={error} />}
    </section>
  );
}
