import { id, ids, make } from './state.mjs';

export function learningReportRoute({ auth, state, url, send }) {
  const learner = /^\/api\/v1\/reports\/teacher\/classes\/([^/]+)\/learners\/([^/]+)$/.exec(
    url.pathname,
  );
  if (learner) {
    if (auth.context.workspaceType !== 'Organization' || auth.context.activeRole !== 'Teacher')
      return send({ code: 'AUTH_FORBIDDEN' }, 403);
    if (learner[1] !== ids.class || learner[2] !== id(501)) return send({ code: 'NOT_FOUND' }, 404);
    return send(
      make('TeacherLearnerOverviewDto', {
        dataAsOfUtc: '2026-11-13T12:00:00Z',
        classId: ids.class,
        classTitle: 'ریاضی دهم',
        enrollmentId: id(500),
        learnerOrganizationPersonId: id(501),
        learnerDisplayName: 'سارا احمدی',
        eligibleSessionCount: 10,
        presentCount: 8,
        absentCount: 1,
        lateCount: 1,
        assignmentCount: 3,
        submittedAssignmentCount: 2,
        releasedAssignmentCount: 1,
        examCount: 2,
        finalizedExamAttemptCount: 1,
        releasedExamCount: 1,
      }),
    );
  }
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
    const from = url.searchParams.get('FromUtc'),
      to = url.searchParams.get('ToUtc'),
      selectedClass = url.searchParams.get('ClassId');
    const items = state.studentAttendance.items.filter(
      (row) =>
        (!selectedClass || row.classId === selectedClass) &&
        (!from || Date.parse(row.startUtc) >= Date.parse(from)) &&
        (!to || Date.parse(row.startUtc) <= Date.parse(to)),
    );
    const count = (status) => items.filter((row) => row.status === status).length;
    return send({
      ...state.studentAttendance,
      ...(from || to || selectedClass
        ? {
            summary: {
              eligibleCount: items.length,
              recordedCount: items.length - count('NotRecorded'),
              presentCount: count('Present'),
              absentCount: count('Absent'),
              lateCount: count('Late'),
              excusedCount: count('Excused'),
              notRecordedCount: count('NotRecorded'),
            },
          }
        : {}),
      pageNumber: page,
      pageSize: size,
      totalCount: items.length,
      items: items.slice((page - 1) * size, page * size),
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
