import type { components } from '@/generated/api/schema';
type S = components['schemas'];
export type AttendanceEntry = S['AttendanceEntryResult'];
export type Attendance = S['SessionAttendanceResult'];
export type Mark = Exclude<S['AttendanceStatus'], 'NotRecorded'>;
export const attendanceMarks: Mark[] = ['Present', 'Absent', 'Late', 'Excused'];
export type RowDraft = {
  base: Pick<
    AttendanceEntry,
    'enrollmentId' | 'learnerOrganizationPersonId' | 'attendanceId' | 'rowVersion' | 'status'
  >;
  status: Mark;
  reason: string;
  uncertain?: boolean;
};
export type AttendanceDraft = Record<string, RowDraft>;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const statuses: string[] = ['NotRecorded', ...attendanceMarks];
const version = (value: unknown) => value === null || (typeof value === 'string' && !!value.trim());
export function validAttendance(value: Attendance, id: string, status: S['SessionStatus']) {
  return (
    value.sessionId === id &&
    value.sessionStatus === status &&
    new Set(value.entries.map((entry) => entry.enrollmentId)).size === value.entries.length &&
    new Set(value.entries.flatMap((entry) => (entry.attendanceId ? [entry.attendanceId] : [])))
      .size === value.entries.filter((entry) => entry.attendanceId).length &&
    value.entries.every(
      (entry) =>
        uuid.test(entry.enrollmentId) &&
        uuid.test(entry.learnerOrganizationPersonId) &&
        statuses.includes(entry.status) &&
        version(entry.rowVersion) &&
        (entry.attendanceId
          ? uuid.test(entry.attendanceId) && !!entry.rowVersion
          : entry.status === 'NotRecorded' && entry.rowVersion === null),
    )
  );
}
export function parseAttendanceDraft(text: string): AttendanceDraft | undefined {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    for (const [key, draft] of Object.entries(value)) {
      if (
        !uuid.test(key) ||
        !draft ||
        typeof draft !== 'object' ||
        !draft.base ||
        draft.base.enrollmentId !== key ||
        !uuid.test(draft.base.learnerOrganizationPersonId) ||
        !statuses.includes(draft.base.status) ||
        !version(draft.base.rowVersion) ||
        !(draft.base.attendanceId === null || uuid.test(draft.base.attendanceId)) ||
        !(attendanceMarks as string[]).includes(draft.status) ||
        typeof draft.reason !== 'string' ||
        !(draft.uncertain === undefined || typeof draft.uncertain === 'boolean')
      )
        return;
    }
    return value as AttendanceDraft;
  } catch {
    return;
  }
}
export function sameAttendanceBase(entry: AttendanceEntry | undefined, draft: RowDraft) {
  return (
    !!entry &&
    (
      [
        'enrollmentId',
        'learnerOrganizationPersonId',
        'attendanceId',
        'rowVersion',
        'status',
      ] as const
    ).every((key) => entry[key] === draft.base[key])
  );
}
export function attendanceDraft(entry: AttendanceEntry, status: Mark, reason: string): RowDraft {
  return {
    base: {
      enrollmentId: entry.enrollmentId,
      learnerOrganizationPersonId: entry.learnerOrganizationPersonId,
      attendanceId: entry.attendanceId,
      rowVersion: entry.rowVersion,
      status: entry.status,
    },
    status,
    reason,
  };
}
export function validAttendanceAck(result: AttendanceEntry, draft: RowDraft) {
  return (
    !!result &&
    result.enrollmentId === draft.base.enrollmentId &&
    result.learnerOrganizationPersonId === draft.base.learnerOrganizationPersonId &&
    result.status === draft.status &&
    !!result.attendanceId &&
    uuid.test(result.attendanceId) &&
    !!result.rowVersion?.trim() &&
    (!draft.base.attendanceId ||
      (result.attendanceId === draft.base.attendanceId &&
        result.rowVersion !== draft.base.rowVersion))
  );
}
