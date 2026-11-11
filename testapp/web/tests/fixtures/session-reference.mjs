// Explicit isolated QA data. Product components never import this module.
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const sessionReferenceId = id(6000);
export function sessionReference({ count = 24, recorded = 22 } = {}) {
  return {
    sessions: [
      {
        id: sessionReferenceId,
        organizationId: id(1),
        classId: id(2),
        classTitle: 'ریاضی دهم',
        scheduleRuleId: null,
        title: 'حل تمرین فصل دوم',
        startUtc: '2026-11-05T12:30:00.000Z',
        endUtc: '2026-11-05T13:30:00.000Z',
        timeZoneId: 'Asia/Tehran',
        meetingUrl: 'https://meet.example/class',
        status: 'Scheduled',
        cancelledAtUtc: null,
        completedAtUtc: null,
        rowVersion: '1',
      },
    ],
    attendance: [
      {
        sessionId: sessionReferenceId,
        entries: Array.from({ length: count }, (_, index) => ({
          enrollmentId: id(20000 + index),
          learnerOrganizationPersonId: id(22000 + index),
          attendanceId: index < recorded ? id(33000 + index) : null,
          status: index < recorded ? 'Present' : 'NotRecorded',
          recordedAtUtc: index < recorded ? '2026-11-05T12:31:00.000Z' : null,
          recordedByMembershipId: index < recorded ? id(820) : null,
          rowVersion: index < recorded ? '1' : null,
        })),
        revisions: [],
      },
    ],
  };
}
