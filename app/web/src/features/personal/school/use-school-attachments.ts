'use client';
import { useEffect, useRef, useState } from 'react';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import type { TransferProgress } from '@/lib/api/file-transfer';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import {
  lessonDraftAssets,
  lessonDraftPending,
  type EditorAttachment,
  type PendingLessonAttachment,
} from './lesson-draft';
type Asset = components['schemas']['FileAssetResult'];

/** Existing organization/class-scoped upload; only metadata enters a workflow draft. */
export function useSchoolAttachments({
  classId,
  assetsValue,
  pendingValue,
  onAssetsChange,
  onPendingChange,
  disabled = false,
}: {
  classId: string;
  assetsValue: string;
  pendingValue: string;
  onAssetsChange: (value: string) => void;
  onPendingChange: (value: string) => void;
  disabled?: boolean;
}) {
  const { transfer } = usePersonal();
  const restored = lessonDraftAssets(assetsValue),
    pending = lessonDraftPending(pendingValue);
  const assets = restored ?? [],
    corrupt = restored === null || pending === null;
  const [uploading, setUploading] = useState(false),
    [error, setError] = useState<unknown>();
  const [progress, setProgress] = useState<TransferProgress>();
  const abort = useRef<AbortController | null>(null),
    lock = useRef(false);
  useUnsavedChanges(uploading);
  useEffect(() => () => abort.current?.abort(), [classId]);
  function setAssets(
    value: EditorAttachment[] | ((old: EditorAttachment[]) => EditorAttachment[]),
  ) {
    onAssetsChange(JSON.stringify(typeof value === 'function' ? value(assets) : value));
  }
  function setPending(value?: PendingLessonAttachment) {
    onPendingChange(
      value
        ? JSON.stringify({
            id: value.id,
            originalFileName: value.originalFileName,
            status: value.status,
          })
        : '',
    );
  }
  function accept(asset: Asset) {
    if (asset.status !== 'Ready') {
      setPending(asset);
      return;
    }
    setAssets((old) =>
      old.some((item) => item.id === asset.id)
        ? old
        : [
            ...old,
            {
              id: asset.id,
              name: asset.originalFileName,
              sizeBytes: asset.sizeBytes,
              contentType: asset.contentType,
              status: asset.status,
            },
          ],
    );
    setPending(undefined);
  }
  async function upload(file?: File) {
    if (lock.current || disabled || corrupt) return;
    if (file && !file.size) {
      setError(new ApiError(400, { code: 'FILE_EMPTY' }));
      return;
    }
    lock.current = true;
    setUploading(true);
    setProgress(undefined);
    setError(undefined);
    const controller = new AbortController();
    abort.current = controller;
    try {
      let asset: Asset | undefined;
      if (file) {
        const form = new FormData();
        form.append('File', file);
        asset = await transfer<Asset>(`/api/client/school-files?classId=${classId}`, {
          method: 'POST',
          body: form,
          signal: controller.signal,
          onProgress: setProgress,
        });
      } else if (pending) {
        asset = await transfer<Asset>(`/api/client/school-files/${pending.id}?classId=${classId}`, {
          signal: controller.signal,
        });
      }
      controller.signal.throwIfAborted();
      if (asset) accept(asset);
    } catch (problem) {
      if (!(problem instanceof Error && problem.name === 'AbortError')) setError(problem);
    } finally {
      if (abort.current === controller) {
        lock.current = false;
        setUploading(false);
      }
    }
  }
  return {
    assets,
    pending,
    corrupt,
    uploading,
    error,
    setError,
    progress,
    setAssets,
    setPending,
    upload,
    cancel: () => abort.current?.abort(),
  };
}
