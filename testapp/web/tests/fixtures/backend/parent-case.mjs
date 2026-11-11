// Declared local fixture for the existing parent dashboard/report operations.
// It never proxies to a live service and does not grant organizational roles.
import { make, id, ids } from './state.mjs';
import { seedReferenceCase } from './design-case.mjs';
export function seedParentCase(state, options = {}) {
  seedReferenceCase(state);
  state.parentChildren = [
    [501, options.childName || 'نازنین موسوی'],
    [502, 'امیر موسوی'],
  ].map(([child, displayName]) =>
    make('AuthorizedChildResult', {
      learnerOrganizationPersonId: id(child),
      displayName,
      organizationId: ids.org,
      organizationName: 'آموزشگاه آفتاب',
      relationStatus: 'Active',
    }),
  );
  if (options.foreignChild)
    state.parentChildren.push(
      make('AuthorizedChildResult', {
        learnerOrganizationPersonId: id(503),
        displayName: 'فرزند آموزشگاه دیگر',
        organizationId: id(99),
        organizationName: 'آموزشگاه باران',
        relationStatus: 'Active',
      }),
    );
  state.parentCase = { options, startUtc: options.referenceTime || '2026-11-09T12:30:00.000Z' };
}
export function parentCaseRoute({ state, auth, url, req, send }) {
  if (!state.parentCase) return false;
  const path = url.pathname;
  const dashboard = path === '/api/v1/dashboards/parent';
  const reports = path.match(/^\/api\/v1\/reports\/parent\/(assignments|exams)$/);
  if (!dashboard && !reports) return false;
  if (req.method !== 'GET') return send({}, 405);
  if (auth.context.workspaceType !== 'Organization' || auth.context.activeRole !== 'Parent')
    return send({ code: 'FORBIDDEN' }, 403);
  const child = state.parentChildren.find(
    (row) =>
      row.organizationId === auth.context.organizationId &&
      row.learnerOrganizationPersonId === auth.context.subjectOrganizationPersonId &&
      row.relationStatus === 'Active',
  );
  if (!child) return send({ code: 'CHILD_NOT_AUTHORIZED' }, 403);
  const primary = child.learnerOrganizationPersonId === id(501);
  const start = state.parentCase.startUtc,
    end = new Date(Date.parse(start) + 3600000).toISOString();
  if (dashboard)
    return send(
      make('ParentDashboardDto', {
        organizationId: auth.context.organizationId,
        selectedLearner: {
          learnerOrganizationPersonId: child.learnerOrganizationPersonId,
          displayName: child.displayName,
        },
        upcomingSessions: [
          make('DashboardSessionItem2', {
            sessionId: id(7110),
            classId: ids.class,
            classTitle: 'ریاضی دهم',
            title: 'جلسه حل تمرین',
            startUtc: start,
            endUtc: end,
            timeZoneId: 'Asia/Tehran',
            status: 'Scheduled',
          }),
        ],
        assignments: [0, 1].map((index) =>
          make('DashboardAssignmentItem2', {
            assignmentId: index ? id(7112) : ids.assignment,
            assignmentVersionId: id(7120 + index),
            classId: ids.class,
            classTitle: 'ریاضی دهم',
            title: index ? 'مرور معادله' : 'تمرین فصل دوم',
            dueAtUtc: new Date(Date.parse(start) + (index + 1) * 86400000).toISOString(),
            status: 'NotStarted',
          }),
        ),
        attendanceSummary: make('DashboardAttendanceSummary', {
          eligibleSessionCount: 9,
          recordedCount: 9,
          presentCount: 8,
          absentCount: 1,
          lateCount: 0,
          excusedCount: 0,
          notRecordedCount: 0,
        }),
        releasedAssignmentResults: [
          make('ParentReleasedAssignmentItem', {
            submissionAttemptId: ids.attempt,
            assignmentId: ids.assignment,
            assignmentTitle: 'تمرین فصل دوم',
            score: 18,
            maximumScore: 20,
            guardianVisibleFeedback: 'راه‌حل منظم است.',
            releasedAtUtc: '2026-11-08T08:00:00.000Z',
          }),
        ],
        exams: [],
        attentionItemCount: 2,
      }),
    );
  const kind = reports[1];
  const rows =
    kind === 'assignments'
      ? [
          make('ParentAssignmentReportItem', {
            assignmentId: ids.assignment,
            assignmentVersionId: id(7120),
            classId: ids.class,
            classTitle: 'ریاضی دهم',
            title: primary ? 'تمرین فصل دوم' : 'تمرین امیر',
            assignmentStatus: 'Published',
            maximumScore: 20,
            submissionStatus: 'Submitted',
            submittedAtUtc: '2026-11-07T08:00:00.000Z',
            releasedScore: 18,
            guardianVisibleFeedback: 'راه‌حل منظم است.',
            releasedAtUtc: '2026-11-08T08:00:00.000Z',
          }),
          make('ParentAssignmentReportItem', {
            assignmentId: id(7112),
            assignmentVersionId: id(7121),
            classId: ids.class,
            classTitle: 'ریاضی دهم',
            title: 'مرور معادله',
            assignmentStatus: 'Published',
            maximumScore: 20,
            submissionStatus: 'Submitted',
            submittedAtUtc: '2026-11-08T08:00:00.000Z',
            releasedScore: null,
            guardianVisibleFeedback: null,
            releasedAtUtc: null,
          }),
        ]
      : [
          make('ParentExamReportItem', {
            examId: ids.exam,
            examVersionId: id(7130),
            classId: ids.class,
            classTitle: 'ریاضی دهم',
            title: primary ? 'آزمون فصل دوم' : 'آزمون امیر',
            durationMinutes: 30,
            maximumScore: 20,
            attemptCount: 1,
            latestAttemptStatus: 'Finalized',
            latestFinalizedAtUtc: '2026-11-07T08:00:00.000Z',
            releasedScore: 17.5,
            guardianVisibleFeedback: 'پاسخ‌ها بررسی شدند.',
            releasedAtUtc: '2026-11-08T08:00:00.000Z',
          }),
        ];
  const page = Math.max(1, Number(url.searchParams.get('PageNumber') || 1)),
    size = Math.max(1, Math.min(100, Number(url.searchParams.get('PageSize') || 30)));
  return send(
    make(
      kind === 'assignments'
        ? 'ReportPageOfParentAssignmentReportItem'
        : 'ReportPageOfParentExamReportItem',
      {
        pageNumber: page,
        pageSize: size,
        totalCount: rows.length,
        items: rows.slice((page - 1) * size, page * size),
      },
    ),
  );
}
