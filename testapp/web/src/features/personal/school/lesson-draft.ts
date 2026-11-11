import type { components } from '@/generated/api/schema';
import { isRecord } from '@/lib/api/errors';
import { latinDigits } from '@/lib/formatting';
type S = components['schemas'];
export type EditorAttachment = {
  id: string;
  name: string;
  sizeBytes?: number;
  contentType?: string;
  status?: S['FileAssetStatus'];
};
export type PendingLessonAttachment = Pick<
  S['FileAssetResult'],
  'id' | 'originalFileName' | 'status'
>;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses = new Set(['Pending', 'Ready', 'Rejected', 'Deleted']);
function decode(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
/** Restore metadata only. The server still validates file ownership and readiness. */
export function lessonDraftAssets(text: string): EditorAttachment[] | null {
  const value = decode(text);
  if (!Array.isArray(value)) return null;
  const ids = new Set<string>();
  for (const row of value) {
    if (
      !isRecord(row) ||
      typeof row.id !== 'string' ||
      !uuid.test(row.id) ||
      ids.has(row.id.toLowerCase()) ||
      typeof row.name !== 'string' ||
      !row.name.trim() ||
      (row.status !== undefined && (typeof row.status !== 'string' || !statuses.has(row.status))) ||
      (row.sizeBytes !== undefined &&
        (typeof row.sizeBytes !== 'number' ||
          !Number.isSafeInteger(row.sizeBytes) ||
          row.sizeBytes < 0)) ||
      (row.contentType !== undefined && typeof row.contentType !== 'string')
    )
      return null;
    ids.add(row.id.toLowerCase());
  }
  return value.map((row) => ({
    id: row.id,
    name: row.name,
    sizeBytes: row.sizeBytes,
    contentType: row.contentType,
    status: row.status,
  }));
}
export function lessonDraftPending(text: string): PendingLessonAttachment | null | undefined {
  if (!text) return undefined;
  const value = decode(text);
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !uuid.test(value.id) ||
    typeof value.originalFileName !== 'string' ||
    !value.originalFileName.trim() ||
    !['Pending', 'Rejected', 'Deleted'].includes(String(value.status))
  )
    return null;
  return {
    id: value.id,
    originalFileName: value.originalFileName,
    status: value.status as S['FileAssetStatus'],
  };
}
export function lessonDisplayOrder(value: string): number | null {
  const text = latinDigits(value).trim();
  const result = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(result) && result <= 2147483647 ? result : null;
}
