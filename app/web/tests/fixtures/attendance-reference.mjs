// Declared QA records for the real attendance components. Never imported by the app.
import { sessionReference } from './session-reference.mjs';
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const attendanceNames = ['نازنین موسوی', 'امیر نادری', 'مریم احمدی'];
export function attendanceReference({ count = 3, recorded = count } = {}) {
  const value = sessionReference({ count, recorded });
  value.attendance[0].entries.forEach((row, index) => {
    if (index < recorded) row.status = ['Present', 'Absent', 'Late'][index % 3];
  });
  value.studentAttendance = {
    dataAsOfUtc: '2026-11-05T14:00:00.000Z',
    pageNumber: 1,
    pageSize: 30,
    totalCount: 3,
    summary: {
      eligibleCount: 3,
      recordedCount: 3,
      presentCount: 2,
      absentCount: 1,
      lateCount: 0,
      excusedCount: 0,
      notRecordedCount: 0,
    },
    items: ['حل تمرین', 'معادله', 'مرور'].map((title, index) => ({
      sessionId: id(6000 + index),
      classId: id(2),
      classTitle: 'ریاضی دهم',
      courseTitle: 'ریاضی',
      sessionTitle: title,
      startUtc: `2026-11-0${5 - index * 2}T12:30:00.000Z`,
      endUtc: `2026-11-0${5 - index * 2}T13:30:00.000Z`,
      status: index < 2 ? 'Present' : 'Absent',
      recordedAtUtc: '2026-11-05T13:31:00.000Z',
    })),
  };
  return value;
}
