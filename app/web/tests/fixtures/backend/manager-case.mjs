import { id, ids, make, classRow, paged } from './state.mjs';
import { seedReferenceCase } from './design-case.mjs';
export function seedManagerCase(state, options = {}) {
  if (options.exactV5Lesson) seedReferenceCase(state, { exactV5: true });
  state.exactV5Catalog = options.exactV5Catalog === true;
  const members = ['معلم اول', 'معلم دوم', 'دانش‌آموز اول', 'دانش‌آموز دوم', 'والد آزمایشی'].map(
    (displayName, i) =>
      make('SchoolMemberResult', {
        userId: id(810 + i),
        personId: id(840 + i),
        membershipId: id(820 + i),
        organizationPersonId: id(830 + i),
        displayName,
        membershipStatus: 'Active',
        activeRoles: [i < 2 ? 'Teacher' : i < 4 ? 'Student' : 'Parent'],
        version: '1',
        roleAssignments: [],
        profilePhoto: null,
      }),
  );
  state.managerCase = {
    members,
    classes: [classRow()],
    teachers: [],
    learners: [],
    relations: [
      make('SchoolGuardianRelationDto', {
        id: id(850),
        organizationId: ids.org,
        guardianUserId: id(814),
        learnerOrganizationPersonId: id(832),
        status: 'Active',
        rowVersion: '1',
      }),
    ],
    invitations: [],
  };
  // Explicit reference-data fixture; ordinary runtime never reads these values.
  if (options.exactV5) {
    state.design = true;
    const m = state.managerCase;
    m.classes = Array.from({ length: 12 }, (_, index) => ({
      ...classRow(),
      id: index ? id(18500 + index) : ids.class,
      title:
        index === 0
          ? 'ریاضی دهم · گروه الف'
          : index === 1
            ? 'زبان دهم'
            : 'علوم دهم · گروه ' + (index + 1),
      courseTitle: index === 0 ? 'ریاضی' : index === 1 ? 'زبان' : 'علوم',
      academicPeriodTitle: 'پاییز ۱۴۰۵',
      capacity: 30,
    }));
    m.members[0].displayName = 'مریم رضایی';
    m.members[1].displayName = 'علی کریمی';
    for (let index = 2; index < 18; index++)
      m.members.push(
        make('SchoolMemberResult', {
          userId: id(18700 + index),
          membershipId: id(18800 + index),
          organizationPersonId: id(18900 + index),
          displayName: 'مدرس آزمایشی ' + (index + 1),
          membershipStatus: 'Active',
          activeRoles: ['Teacher'],
          version: '1',
          roleAssignments: [],
        }),
      );
    m.learners = m.classes.flatMap((item, index) =>
      Array.from({ length: index < 2 ? 24 : 20 }, (_, learner) =>
        make('ClassLearnerResult', {
          classId: item.id,
          enrollmentId: id(20000 + index * 100 + learner),
          learnerOrganizationPersonId: id(22000 + index * 100 + learner),
          userId: id(24000 + index * 100 + learner),
          displayName: 'دانش‌آموز آزمایشی ' + (learner + 1),
          status: 'Active',
          version: '1',
        }),
      ),
    );
    const teacherMembers = m.members.filter((member) => member.activeRoles.includes('Teacher'));
    m.teachers = m.classes.map((item, index) =>
      make('ClassTeacherResult', {
        classId: item.id,
        teacherAssignmentId: id(27000 + index),
        teacherMembershipId: teacherMembers[index].membershipId,
        userId: teacherMembers[index].userId,
        personId: teacherMembers[index].personId,
        displayName: teacherMembers[index].displayName,
        status: 'Active',
        version: '1',
      }),
    );
    if (options.exactV5TeacherRoster) {
      m.classes[0].title = 'ریاضی دهم';
      m.teachers = m.teachers.filter((item) => item.classId !== ids.class);
      for (const [index, displayName, assignedAtUtc] of [
        [0, 'مریم رضایی', '2026-09-23T08:00:00Z'],
        [1, 'امیر نظری', '2026-09-27T08:00:00Z'],
      ])
        m.teachers.push(
          make('ClassTeacherResult', {
            classId: ids.class,
            teacherAssignmentId: id(27900 + index),
            teacherMembershipId: teacherMembers[index].membershipId,
            userId: teacherMembers[index].userId,
            personId: teacherMembers[index].personId,
            displayName,
            assignedAtUtc,
            status: 'Active',
            version: '1',
          }),
        );
    }
    if (options.exactV5Attendance) {
      const count = options.attendanceRosterCount ?? 3;
      if (!Number.isInteger(count) || count < 1 || count > 200)
        throw Error('Invalid attendance QA roster count');
      m.classes[0].title = 'ریاضی دهم';
      m.classes[0].capacity = Math.max(30, count);
      const names = ['نازنین موسوی', 'امیر نادری', 'مریم احمدی'];
      m.learners = m.learners.filter((row) => row.classId !== ids.class);
      for (let index = 0; index < count; index++)
        m.learners.push(
          make('ClassLearnerResult', {
            classId: ids.class,
            enrollmentId: id(20000 + index),
            learnerOrganizationPersonId: id(22000 + index),
            userId: id(24000 + index),
            displayName: names[index] ?? 'دانش‌آموز آزمایشی ' + (index + 1),
            status: 'Active',
            version: '1',
          }),
        );
    }
  }
}
export function managerRoute({ state, auth, url, req, body, send }) {
  const m = state.managerCase,
    p = url.pathname;
  if (!m) return false;
  const org =
    auth.context.workspaceType === 'Organization' && auth.context.organizationId === ids.org;
  const manager = org && auth.context.activeRole === 'Manager';
  const deny = () => send({ code: 'MANAGER_ROLE_REQUIRED' }, 403);
  if (p === '/api/v1/dashboards/manager')
    return manager
      ? send(
          make('ManagerDashboardDto', {
            organizationId: ids.org,
            operationalCounts: make('ManagerOperationalCounts', {
              activeClassCount: m.classes.length,
              enrolledLearnerCount: m.learners.filter((x) => x.status === 'Active').length,
              teacherCount: m.members.filter((x) => x.activeRoles.includes('Teacher')).length,
            }),
            pendingInvitationCount: m.invitations.filter((x) => x.status === 'Pending').length,
          }),
        )
      : deny();
  if (p === '/api/v1/invitations' && auth.role === 'Parent')
    return send(
      m.invitations.map((x) =>
        make('InvitationResult', {
          id: x.id,
          organizationId: ids.org,
          organizationName: 'آموزشگاه آزمایشی مدیر',
          invitedByUserId: id(104),
          role: 'Parent',
          status: x.status,
          expiresAtUtc: x.expiresAtUtc,
          guardianLearnerOrganizationPersonId: x.learnerOrganizationPersonId,
          guardianLearnerDisplayName: m.members.find(
            (y) => y.organizationPersonId === x.learnerOrganizationPersonId,
          )?.displayName,
          requiresGuardianConsent: true,
        }),
      ),
    );
  const accept = /^\/api\/v1\/invitations\/([^/]+)\/accept$/.exec(p);
  if (accept && auth.role === 'Parent') {
    const row = m.invitations.find((x) => x.id === accept[1]);
    if (!row || row.status !== 'Pending') return send({ code: 'INVITATION_NOT_PENDING' }, 409);
    if (!body.confirmGuardianRelation)
      return send({ code: 'GUARDIAN_INVITATION_CONSENT_REQUIRED' }, 400);
    row.status = 'Accepted';
    m.relations.push(
      make('SchoolGuardianRelationDto', {
        id: id(850 + m.relations.length),
        organizationId: ids.org,
        guardianUserId: auth.user.id,
        learnerOrganizationPersonId: row.learnerOrganizationPersonId,
        status: 'Active',
        rowVersion: '1',
      }),
    );
    return send(
      make('AcceptInvitationResult', {
        invitationId: row.id,
        organizationId: ids.org,
        organizationName: 'آموزشگاه آزمایشی مدیر',
        role: 'Parent',
      }),
    );
  }
  if (p === '/api/v1/organization/members') {
    if (!manager) return deny();
    const role = url.searchParams.get('Role'),
      search = url.searchParams.get('Search') ?? '';
    return send(
      paged(
        'SchoolPageOfSchoolMemberResult',
        m.members.filter(
          (x) =>
            (!role || x.activeRoles.includes(role)) &&
            x.displayName.includes(search) &&
            (!url.searchParams.get('Status') ||
              x.membershipStatus === url.searchParams.get('Status')),
        ),
        url,
      ),
    );
  }
  if (p === '/api/v1/organization/people') {
    if (!manager) return deny();
    return send(
      paged(
        'OrganizationPeoplePage',
        m.members
          .filter((x) => x.activeRoles.includes('Student'))
          .map((x) =>
            make('OrganizationPersonDto', {
              id: x.organizationPersonId,
              organizationId: ids.org,
              displayName: x.displayName,
              firstName: x.displayName,
              lastName: 'آزمایشی',
              status: 'Active',
              canEditNames: true,
              isAccountLinked: true,
              rowVersion: '1',
              personRowVersion: '1',
            }),
          ),
        url,
      ),
    );
  }
  if (/^\/api\/v1\/organization\/people\/[^/]+$/.test(p) && req.method === 'GET') {
    if (!manager) return deny();
    const x = m.members.find((x) => x.organizationPersonId === p.split('/').at(-1));
    return x
      ? send(
          make('OrganizationPersonDto', {
            id: x.organizationPersonId,
            organizationId: ids.org,
            displayName: x.displayName,
            firstName: x.firstName ?? x.displayName,
            lastName: x.lastName ?? 'آزمایشی',
            status: 'Active',
            canEditNames: x.canEditNames ?? true,
            isAccountLinked: x.isAccountLinked ?? true,
            rowVersion: '1',
            personRowVersion: '1',
          }),
        )
      : send({ code: 'NOT_FOUND' }, 404);
  }
  if (p === '/api/v1/academic/classes') {
    if (!org) return deny();
    if (req.method === 'GET') return send(m.classes);
    if (!manager) return deny();
    const row = { ...classRow(), ...body, id: id(860 + m.classes.length) };
    m.classes.push(row);
    return send(row, 201);
  }
  const roster =
    /^\/api\/v1\/academic\/classes\/([^/]+)\/(teachers|learners|enrollments)(?:\/([^/]+)\/end)?$/.exec(
      p,
    );
  if (roster) {
    const [, classId, kind, relationId] = roster;
    if (!m.classes.some((c) => c.id === classId) || !org)
      return send({ code: 'CLASS_NOT_FOUND' }, 404);
    if (req.method !== 'GET' && !manager) return deny();
    const teacher = kind === 'teachers',
      rows = teacher ? m.teachers : m.learners;
    const response = (x) =>
      make(teacher ? 'TeacherAssignmentResult' : 'EnrollmentResult', {
        ...x,
        id: teacher ? x.teacherAssignmentId : x.enrollmentId,
        organizationId: ids.org,
        classId,
      });
    if (req.method === 'GET') {
      const result = paged(
        teacher ? 'SchoolPageOfClassTeacherResult' : 'SchoolPageOfClassLearnerResult',
        rows.filter(
          (x) =>
            x.classId === classId &&
            (!url.searchParams.get('Search') ||
              [x.displayName, x.username ?? ''].some((text) =>
                text.includes(url.searchParams.get('Search')),
              )) &&
            (!url.searchParams.get('status') || x.status === url.searchParams.get('status')),
        ),
        url,
      );
      result.items = result.items.slice(
        (result.page - 1) * result.pageSize,
        result.page * result.pageSize,
      );
      return send(result);
    }
    if (relationId) {
      const row = rows.find(
        (x) =>
          (teacher ? x.teacherAssignmentId : x.enrollmentId) === relationId &&
          x.classId === classId,
      );
      if (!row) return send({ code: 'NOT_FOUND' }, 404);
      row.status = teacher ? 'Ended' : body.finalStatus;
      row.endedAtUtc = new Date().toISOString();
      return send(response(row));
    }
    const member = m.members.find((x) =>
      teacher
        ? x.membershipId === body.teacherMembershipId && x.activeRoles.includes('Teacher')
        : x.organizationPersonId === body.learnerOrganizationPersonId &&
          x.activeRoles.includes('Student'),
    );
    if (!member) return send({ code: 'MEMBER_NOT_FOUND' }, 404);
    if (
      rows.some((x) => x.classId === classId && x.userId === member.userId && x.status === 'Active')
    )
      return send({ code: 'ALREADY_ASSIGNED' }, 409);
    const row = make(teacher ? 'ClassTeacherResult' : 'ClassLearnerResult', {
      ...member,
      classId,
      status: 'Active',
      version: 'MDAwMDAwMDE=',
      ...(teacher
        ? { teacherAssignmentId: id(880 + rows.length), teacherMembershipId: member.membershipId }
        : {
            enrollmentId: id(890 + rows.length),
            learnerOrganizationPersonId: member.organizationPersonId,
          }),
    });
    rows.push(row);
    return send(response(row), 201);
  }
  if (p.startsWith('/api/v1/reports/manager/')) {
    if (!manager) return deny();
    if (p.includes('/classes/'))
      return send(
        make('ManagerClassPerformanceDto', {
          classId: p.split('/').at(-1),
          classTitle: 'کلاس ریاضی',
          activeLearnerCount: m.learners.filter((x) => x.status === 'Active').length,
          assignmentAveragePercentage: null,
          examAveragePercentage: null,
        }),
      );
    const kind = p.split('/').at(-1),
      names = {
        'teacher-workload': 'ManagerTeacherWorkloadReportItem',
        attendance: 'ManagerAttendanceReportItem',
        assessments: 'ManagerAssessmentReportItem',
        enrollments: 'ManagerEnrollmentReportItem',
      },
      name = names[kind];
    if (!name) return false;
    const rows =
      kind === 'teacher-workload'
        ? m.members
            .filter((x) => x.activeRoles.includes('Teacher'))
            .map((x) =>
              make(name, {
                teacherMembershipId: x.membershipId,
                teacherDisplayName: x.displayName,
                activeClassCount: m.teachers.filter(
                  (t) => t.teacherMembershipId === x.membershipId && t.status === 'Active',
                ).length,
                completedSessionCount: 3,
              }),
            )
        : [];
    return send({
      ...paged('ReportPageOf' + name, rows, url),
      pageNumber: Number(url.searchParams.get('PageNumber') ?? 1),
    });
  }
  if (p === '/api/v1/organization/guardian-relations')
    return manager ? send(paged('SchoolGuardianRelationsPage', m.relations, url)) : deny();
  const rel = /^\/api\/v1\/organization\/guardian-relations\/([^/]+)\/(activate|end|revoke)$/.exec(
    p,
  );
  if (rel) {
    if (!manager) return deny();
    const row = m.relations.find((x) => x.id === rel[1]);
    if (!row) return send({ code: 'NOT_FOUND' }, 404);
    if (row.rowVersion !== body.expectedRowVersion) return send({ code: 'VERSION_CONFLICT' }, 409);
    row.status = rel[2] === 'end' ? 'Ended' : rel[2] === 'revoke' ? 'Revoked' : 'Active';
    row.rowVersion = String(Number(row.rowVersion) + 1);
    return send(row);
  }
  const invite = /^\/api\/v1\/organization\/people\/([^/]+)\/guardian-invitations$/.exec(p);
  if (invite) {
    if (!manager) return deny();
    if (
      !m.members.some(
        (x) => x.organizationPersonId === invite[1] && x.activeRoles.includes('Student'),
      )
    )
      return send({ code: 'NOT_FOUND' }, 404);
    const old = m.invitations.find((x) => x.operation === body.clientOperationId);
    if (old) return send(old);
    const row = make('SchoolGuardianInvitationResult', {
      id: id(900 + m.invitations.length),
      organizationId: ids.org,
      learnerOrganizationPersonId: invite[1],
      status: 'Pending',
      expiresAtUtc: body.expiresAtUtc,
      version: '1',
      nextAction: 'AwaitGuardianConsent',
      operation: body.clientOperationId,
    });
    m.invitations.push(row);
    return send(row, 201);
  }
  const revoke = /^\/api\/v1\/organization\/guardian-invitations\/([^/]+)\/revoke$/.exec(p);
  if (revoke) {
    if (!manager) return deny();
    const row = m.invitations.find((x) => x.id === revoke[1]);
    if (!row) return send({ code: 'NOT_FOUND' }, 404);
    if (row.version !== body.expectedRowVersion) return send({ code: 'VERSION_CONFLICT' }, 409);
    row.status = 'Revoked';
    row.version = '2';
    return send(row);
  }
  return false;
}
