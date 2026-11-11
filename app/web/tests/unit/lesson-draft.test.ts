import { describe, expect, it } from 'vitest';
import {
  lessonDisplayOrder,
  lessonDraftAssets,
  lessonDraftPending,
} from '@/features/personal/school/lesson-draft';
const file = {
  id: '00000000-0000-4000-8000-000000000abc',
  name: 'درس.pdf',
  status: 'Ready',
  sizeBytes: 128,
  contentType: 'application/pdf',
};
describe('restored lesson drafts', () => {
  it('keeps the identity and acknowledged state of an uploaded asset without restoring arbitrary properties', () => {
    expect(lessonDraftAssets(JSON.stringify([{ ...file, untrusted: { children: {} } }]))).toEqual([
      file,
    ]);
  });
  it('does not treat malformed or duplicate asset metadata as an empty successful selection', () => {
    for (const value of [
      '{',
      '{}',
      JSON.stringify([file, { ...file, id: file.id.toUpperCase() }]),
      JSON.stringify([{ ...file, id: '../another-file' }]),
      JSON.stringify([{ ...file, status: 'Success' }]),
    ])
      expect(lessonDraftAssets(value)).toBeNull();
  });
  it('restores Pending for explicit rechecking and rejects invented ready confirmation', () => {
    const pending = { id: file.id, originalFileName: file.name, status: 'Pending' };
    expect(lessonDraftPending(JSON.stringify(pending))).toEqual(pending);
    expect(lessonDraftPending(JSON.stringify({ ...pending, status: 'Ready' }))).toBeNull();
    expect(lessonDraftPending('')).toBeUndefined();
  });
  it('accepts Persian, Arabic and Latin integer digits while rejecting fractional, exponent and out-of-contract order values', () => {
    for (const value of ['۳', '٣', '3']) expect(lessonDisplayOrder(value)).toBe(3);
    expect(lessonDisplayOrder('0')).toBe(0);
    for (const value of ['', '1.5', '1e2', '-1', '2147483648'])
      expect(lessonDisplayOrder(value)).toBeNull();
  });
});
