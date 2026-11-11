import type { components } from '../../src/generated/api/schema';
import { sessionReference } from './session-reference.mjs';
type S = components['schemas'];
export const attendanceNames: string[];
export function attendanceReference(options?: { count?: number; recorded?: number }): ReturnType<
  typeof sessionReference
> & {
  studentAttendance: S['AttendanceReportPageOfStudentAttendanceReportItem'];
};
