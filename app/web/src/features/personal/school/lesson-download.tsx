'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useEffect, useRef, useState } from 'react';
import { Download, FileImage, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import type { TransferProgress } from '@/lib/api/file-transfer';
import { formatFileSize } from '../messaging/media-model';
import { usePersonal } from '../provider';
import s from './lesson-attachments.module.css';
type Asset = Omit<components['schemas']['LessonAttachmentResult'], 'downloadUrl'>;

/** Keep the existing authorized, size-checked download in reading and review views. */
export function LessonDownload({
  lessonId,
  assignmentId,
  asset,
  compact = false,
}: ({ lessonId: string; assignmentId?: never } | { assignmentId: string; lessonId?: never }) & {
  asset: Asset;
  compact?: boolean;
}) {
  const { transfer } = usePersonal();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [progress, setProgress] = useState<TransferProgress>();
  const abort = useRef<AbortController | null>(null),
    lock = useRef(false);
  useEffect(() => () => abort.current?.abort(), []);
  async function download() {
    if (lock.current || !asset.isAvailable || asset.status !== 'Ready') return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const blob = await transfer<Blob>(
        `/api/client/school-files/${asset.fileAssetId}/content?${assignmentId ? 'assignmentId=' + assignmentId : 'lessonId=' + lessonId}`,
        {
          signal: controller.signal,
          binary: true,
          expectedBytes: asset.sizeBytes,
          onProgress: setProgress,
        },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (problem) {
      if (!(problem instanceof Error && problem.name === 'AbortError')) setError(problem);
    } finally {
      if (abort.current === controller) {
        lock.current = false;
        if (!controller.signal.aborted) setBusy(false);
      }
    }
  }
  const available = asset.isAvailable && asset.status === 'Ready';
  const status = busy
    ? uiText.text_80516c4adbbe
    : available
      ? uiText.text_6a835b3d71f3
      : uiText.text_d26be2999a35;
  const extras = (
    <>
      {busy && (
        <>
          <progress
            max={progress?.total ?? undefined}
            value={progress?.total ? progress.loaded : undefined}
            aria-label={uiText.text_854cc29ee49a}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              abort.current?.abort();
              lock.current = false;
              setBusy(false);
            }}
          >
            {uiText.text_6373daa09bbc}
          </Button>
        </>
      )}
      {!!error && <ErrorState error={error} />}
    </>
  );
  if (compact)
    return (
      <div className={uiClass(s.compactDownload)}>
        <button
          type="button"
          className={uiClass(`file ${s.compactFile}`)}
          disabled={busy || !available}
          aria-busy={busy}
          aria-label={uiText.text_6a835b3d71f3 + ' ' + asset.fileName}
          onClick={() => void download()}
        >
          <span className={uiClass('doc-icon')} aria-hidden="true">
            {asset.contentType.startsWith('image/') ? (
              <FileImage size={20} />
            ) : (
              <FileText size={20} />
            )}
          </span>
          <span className={uiClass('grow')}>
            <span dir="auto" className={uiClass(`v5-file-name ${s.compactName}`)}>
              {asset.fileName}
            </span>
            <span className={uiClass(s.compactDescription)}>
              {available ? formatFileSize(asset.sizeBytes) : status}
            </span>
          </span>
        </button>
        {extras}
      </div>
    );
  return (
    <div className={uiClass(s.download)}>
      <span className={uiClass(s.fileIcon)}>
        <Paperclip size={22} />
      </span>
      <div>
        <strong dir="auto">{asset.fileName}</strong>
        <small>{formatFileSize(asset.sizeBytes)}</small>
      </div>
      <Button
        disabled={busy || !available}
        aria-label={status + ' ' + asset.fileName}
        onClick={() => void download()}
      >
        <Download size={16} />
        {status}
      </Button>
      {extras}
    </div>
  );
}
