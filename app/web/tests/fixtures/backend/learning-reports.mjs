import { id, ids, make } from './state.mjs';

export function learningReportRoute({ auth, state, url, send }) {
  const match = url.pathname.match(
    /^\/api\/v1\/reports\/(student|teacher)(?:\/classes\/([^/]+))?\/(attendance|assignments|exams|grades)$/,
  );
  if (!match) return false;
  const [, scope, classId, kind] = match;
  if (
    auth.context.workspaceType !== 'Organization' ||
    auth.context.activeRole !== (scope === 'teacher' ? 'Teacher' : 'Student')
  )
    return send({ code: 'AUTH_FORBIDDEN' }, 403);
  if (
    scope === 'teacher' &&
    ![ids.class, ...(state.designClasses ?? []).map((c) => c.id)].includes(classId)
  )
    return send({ code: 'CLASS_NOT_FOUND' }, 404);
  if (scope === 'teacher' && kind === 'grades') return send({ code: 'NOT_FOUND' }, 404);
  if (scope === 'student' && kind === 'attendance' && state.studentAttendance) {
    const page = Number(url.searchParams.get('PageNumber') || 1);
    const size = Number(url.searchParams.get('PageSize') || 30);
    return send({
      ...state.studentAttendance,
      pageNumber: page,
      pageSize: size,
      totalCount: state.studentAttendance.items.length,
      items: state.studentAttendance.items.slice((page - 1) * size, page * size),
    });
  }
  const teacher = scope === 'teacher',
    prefix = teacher ? 'Teacher' : 'Student';
  const itemSchema =
    kind === 'grades'
      ? 'StudentReleasedGradeReportItem'
      : prefix +
        {
          attendance: 'AttendanceReportItem',
          assignments: 'AssignmentReportItem',
          exams: 'ExamReportItem',
        }[kind];
  const pageSchema =
    (kind === 'attendance' ? 'AttendanceReportPageOf' : 'ReportPageOf') + itemSchema;
  const item = make(itemSchema, {
    sessionId: id(300),
    classId: ids.class,
    classTitle: 'ریاضی دهم',
    courseTitle: 'ریاضی',
    sessionTitle: 'جلسهٔ تمرین',
    assignmentId: ids.assignment,
    assignmentVersionId: id(301),
    examId: ids.exam,
    examVersionId: id(302),
    kind: 'Assignment',
    assessmentId: ids.assignment,
    title: 'تمرین فصل دوم',
    enrollmentId: id(500),
    learnerOrganizationPersonId: id(501),
    learnerDisplayName: 'سارا احمدی',
    startUtc: '2026-11-07T08:00:00Z',
    endUtc: '2026-11-07T09:00:00Z',
    recordedAtUtc: '2026-11-07T08:00:00Z',
    dueAtUtc: '2026-11-08T08:00:00Z',
    availableFromUtc: '2026-11-07T08:00:00Z',
    availableUntilUtc: '2026-11-08T08:00:00Z',
    status: 'Present',
    assignmentStatus: 'Published',
    submissionStatus: 'Submitted',
    latestAttemptStatus: 'Submitted',
    attemptStatus: 'Submitted',
    score: 18,
    currentScore: teacher ? 18 : null,
    releasedScore: kind === 'grades' ? 18 : 19.25,
    maximumScore: 20,
    percentage: 90,
    evaluationStatus: 'Draft',
    gradeStatus: 'Draft',
    isReleased: false,
    releasedAtUtc: kind === 'grades' ? '2026-11-07T10:00:00Z' : null,
  });
  const items = teacher && classId !== ids.class ? [] : [item];
  return send(
    make(pageSchema, {
      items,
      totalCount: items.length,
      pageNumber: Number(url.searchParams.get('PageNumber') || 1),
      pageSize: 30,
      dataAsOfUtc: '2026-11-07T10:00:00Z',
      ...(kind === 'attendance'
        ? {
            summary: make('AttendanceReportSummary', {
              eligibleCount: items.length,
              recordedCount: items.length,
              presentCount: items.length,
            }),
          }
        : {}),
    }),
  );
}
