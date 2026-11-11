import { id, ids, make, classRow } from './state.mjs';
import { seedManagerCase } from './manager-case.mjs';
import { schoolRoute } from './school.mjs';
import { createECDH } from 'node:crypto';
const fixturePushPublicKey = createECDH('prime256v1').generateKeys().toString('base64url');
const version = (n) => Buffer.from(String(n).padStart(8, '0')).toString('base64');
const flag = (value, wanted) =>
  String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .includes(wanted);
const page = (schema, items, url, academic = false) => {
  const p = Number(url.searchParams.get('page') ?? 1),
    size = Number(url.searchParams.get('pageSize') ?? 30);
  return make(schema, {
    items: items.slice((p - 1) * size, p * size),
    page: p,
    pageSize: size,
    ...(academic ? { total: items.length } : { totalCount: items.length }),
  });
};
export function seedVnext(state, options = {}) {
  seedManagerCase(state);
  const m = state.managerCase;
  m.members.forEach((member, i) => {
    member.version = version(1);
    member.roleAssignments = member.activeRoles.map((role, j) =>
      make('SchoolRoleAssignmentResult', {
        roleAssignmentId: id(9100 + i * 10 + j),
        role,
        status: 'Active',
        version: version(1),
      }),
    );
  });
  m.members[0].activeRoles.push('Parent');
  m.members[0].roleAssignments.push(
    make('SchoolRoleAssignmentResult', {
      roleAssignmentId: id(9101),
      role: 'Parent',
      status: 'Active',
      version: version(1),
    }),
  );
  m.members.push(
    make('SchoolMemberResult', {
      userId: id(104),
      membershipId: id(304),
      displayName: 'مدیر فعلی',
      membershipStatus: 'Active',
      version: version(1),
      activeRoles: ['Manager'],
      roleAssignments: [
        make('SchoolRoleAssignmentResult', {
          roleAssignmentId: id(9199),
          role: 'Manager',
          status: 'Active',
          version: version(1),
        }),
      ],
    }),
  );
  m.classes = [{ ...classRow(), version: version(1) }];
  if (options.exactV5) {
    state.design = true;
    Object.assign(m.classes[0], { title: 'ریاضی دهم · گروه الف', capacity: 24 });
    m.learners = Array.from({ length: 24 }, (_, index) =>
      make('ClassLearnerResult', {
        classId: m.classes[0].id,
        enrollmentId: id(20100 + index),
        learnerOrganizationPersonId: id(20200 + index),
        displayName: 'دانش‌آموز آزمایشی ' + (index + 1),
        status: 'Active',
        version: version(1),
      }),
    );
  }
  m.relations[0].guardianDisplayName = 'والد امن سازمانی';
  m.relations[0].learnerDisplayName = 'فرزند امن سازمانی';
  const invitations = Array.from({ length: 33 }, (_, i) =>
    make('SchoolSentInvitationDto', {
      invitationId: id(9200 + i),
      organizationId: ids.org,
      invitationType: 'GuardianLink',
      targetDisplayName: 'دعوت والد ' + (i + 1),
      destinationUserId: id(103),
      learnerOrganizationPersonId: id(832),
      role: 'Parent',
      status: i === 32 ? 'Accepted' : 'Pending',
      expiresAtUtc: '2099-12-01T00:00:00Z',
      version: version(1),
      allowedActions: i === 32 ? [] : ['Revoke'],
    }),
  );
  state.vnext = {
    options,
    revision: 1,
    operations: new Map(),
    invitations,
    activities: [
      make('TeacherContentActivityDto', {
        eventId: id(9400),
        teacherUserId: m.members[0].userId,
        teacherDisplayName: m.members[0].displayName,
        classId: ids.class,
        classTitle: m.classes[0].title,
        kind: 'Lesson',
        title: 'جزوهٔ منتشرشدهٔ معلم',
        publishedAtUtc: '2026-11-05T10:00:00Z',
        sourceRevision: 2,
      }),
    ],
  };
}
export function vnextRoute(ctx) {
  const { state, auth, url, req, body, send } = ctx,
    p = url.pathname,
    x = state.vnext;
  const manager =
    auth.context.workspaceType === 'Organization' && auth.context.activeRole === 'Manager';
  const fail = (code, status = 409) => send({ code }, status);
  if (p === '/api/v1/notifications/devices/web-push/configuration')
    return send(
      make('WebPushClientConfiguration', {
        isConfigured: state.webPushConfigured === true,
        vapidPublicKey: state.webPushConfigured === true ? fixturePushPublicKey : null,
      }),
    );
  if (p === '/api/v1/organization/invitations') {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    let rows =
      x?.invitations ??
      (state.managerCase?.invitations ?? []).map((i) =>
        make('SchoolSentInvitationDto', {
          invitationId: i.id,
          invitationType: 'GuardianLink',
          organizationId: ids.org,
          destinationUserId: id(103),
          targetDisplayName: 'والد آزمایشی',
          targetUsername: 'test.Parent',
          learnerOrganizationPersonId: i.learnerOrganizationPersonId,
          role: 'Parent',
          status: i.status,
          createdAtUtc: '2026-11-05T10:00:00Z',
          expiresAtUtc: i.expiresAtUtc,
          version: i.version,
          allowedActions: i.status === 'Pending' ? ['Revoke'] : [],
        }),
      );
    if (url.searchParams.get('status'))
      rows = rows.filter((r) => r.status === url.searchParams.get('status'));
    if (url.searchParams.get('invitationType'))
      rows = rows.filter((r) => r.invitationType === url.searchParams.get('invitationType'));
    return send(page('SchoolPageOfSchoolSentInvitationDto', rows, url));
  }
  if (p === '/api/v1/organization/teacher-content-activities') {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    let rows = x?.activities ?? [];
    for (const key of ['classId', 'teacherUserId', 'kind'])
      if (url.searchParams.get(key))
        rows = rows.filter((r) => r[key] === url.searchParams.get(key));
    if (url.searchParams.get('fromUtc'))
      rows = rows.filter(
        (r) => Date.parse(r.publishedAtUtc) >= Date.parse(url.searchParams.get('fromUtc')),
      );
    if (url.searchParams.get('toUtc'))
      rows = rows.filter(
        (r) => Date.parse(r.publishedAtUtc) <= Date.parse(url.searchParams.get('toUtc')),
      );
    return send(page('SchoolPageOfTeacherContentActivityDto', rows, url));
  }
  if (p === '/api/v1/academic/exams/discovery') {
    if (!['Manager', 'Teacher'].includes(auth.context.activeRole))
      return fail('EXAM_NOT_ALLOWED', 403);
    let rows;
    schoolRoute({
      ...ctx,
      url: new URL('/api/v1/academic/exams', url),
      send: (value) => {
        rows = value;
        return true;
      },
    });
    rows = Array.isArray(rows) ? rows : [];
    if (x)
      rows = [
        ...rows,
        {
          ...rows[0],
          id: id(9500),
          versionId: id(9501),
          publicationState: 'Draft',
          title: 'پیش‌نویس آزمون قابل بازیابی',
        },
      ];
    for (const [key, field] of [
      ['classId', 'classId'],
      ['status', 'publicationState'],
    ])
      if (url.searchParams.get(key))
        rows = rows.filter((r) => r[field] === url.searchParams.get(key));
    if (url.searchParams.get('search'))
      rows = rows.filter((r) => r.title.includes(url.searchParams.get('search')));
    return send(page('AcademicPageOfStudentExamSummary', rows, url, true));
  }
  if (!x) return false;
  const m = state.managerCase;
  if (p === '/api/v1/academic/classes' && req.method === 'GET') return send(m.classes);
  if (p === '/api/v1/academic/classes' && req.method === 'POST') {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    const key = 'class:' + auth.user.id + body.clientOperationId,
      old = x.operations.get(key);
    if (old) {
      if (old.payload !== JSON.stringify(body)) return fail('CLASS_CREATION_CONFLICT');
      return send(old.value, 201);
    }
    const row = {
      ...classRow(),
      ...body,
      id: id(9600 + m.classes.length),
      version: version(++x.revision),
    };
    m.classes.push(row);
    x.operations.set(key, { payload: JSON.stringify(body), value: row });
    if (x.options.lostClassAck) {
      x.options.lostClassAck = false;
      return fail('UPSTREAM_UNAVAILABLE', 503);
    }
    return send(row, 201);
  }
  if (/^\/api\/v1\/academic\/classes\/[^/]+$/.test(p) && req.method === 'PATCH') {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    const row = m.classes.find((r) => r.id === p.split('/').at(-1));
    if (!row) return fail('CLASS_NOT_FOUND', 404);
    if (x.options.classConflict) {
      x.options.classConflict = false;
      row.version = version(++x.revision);
      return fail('CONCURRENCY_CONFLICT', 412);
    }
    if (body.expectedVersion !== row.version) return fail('CONCURRENCY_CONFLICT', 412);
    if (body.capacity < 5) return fail('CLASS_CAPACITY_EXCEEDED');
    Object.assign(row, {
      title: body.title,
      capacity: body.capacity,
      version: version(++x.revision),
    });
    return send(row);
  }
  const revoke = /^\/api\/v1\/organization\/guardian-invitations\/([^/]+)\/revoke$/.exec(p);
  if (revoke) {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    const row = x.invitations.find((r) => r.invitationId === revoke[1]);
    if (!row) return false;
    if (row.version !== body.expectedRowVersion) return fail('CONCURRENCY_CONFLICT', 412);
    row.status = 'Revoked';
    row.version = version(++x.revision);
    row.allowedActions = [];
    return send(
      make('SchoolGuardianInvitationResult', {
        id: row.invitationId,
        organizationId: ids.org,
        learnerOrganizationPersonId: row.learnerOrganizationPersonId,
        status: 'Revoked',
        version: row.version,
      }),
    );
  }
  const rolePath = /^\/api\/v1\/organization\/members\/([^/]+)(?:\/roles(?:\/([^/]+))?)?$/.exec(p);
  if (rolePath) {
    if (!manager) return fail('MANAGER_ROLE_REQUIRED', 403);
    const member = m.members.find((r) => r.membershipId === rolePath[1]);
    if (!member) return fail('SCHOOL_MEMBERSHIP_NOT_FOUND', 404);
    const key = p + ':' + req.method + ':' + body.clientOperationId,
      old = x.operations.get(key);
    if (old) {
      if (old.payload !== JSON.stringify(body)) return fail('SCHOOL_MEMBERSHIP_OPERATION_CONFLICT');
      return send({ ...old.value, replayed: true });
    }
    const role = member.roleAssignments.find((r) => r.roleAssignmentId === rolePath[2]);
    if (
      member.version !== (body.expectedVersion ?? body.expectedMembershipVersion) ||
      (rolePath[2] && (!role || role.version !== body.expectedRoleVersion))
    )
      return fail('CONCURRENCY_CONFLICT', 412);
    const endsManager =
      member.activeRoles.includes('Manager') &&
      (!p.includes('/roles') ||
        (role?.role === 'Manager' && (req.method === 'DELETE' || body.toRole !== 'Manager')));
    if (
      endsManager &&
      m.members.filter((r) => r.membershipStatus === 'Active' && r.activeRoles.includes('Manager'))
        .length === 1
    )
      return fail('ORGANIZATION_LAST_MANAGER_REQUIRED');
    if (!p.includes('/roles')) {
      member.membershipStatus = 'Ended';
      member.roleAssignments = [];
    } else if (req.method === 'POST') {
      if (member.activeRoles.includes(body.role)) return fail('SCHOOL_MEMBERSHIP_STATE_CONFLICT');
      member.roleAssignments.push(
        make('SchoolRoleAssignmentResult', {
          roleAssignmentId: id(9700 + x.revision),
          role: body.role,
          status: 'Active',
          version: version(++x.revision),
        }),
      );
    } else if (req.method === 'PUT') {
      role.role = body.toRole;
      role.version = version(++x.revision);
    } else
      member.roleAssignments = member.roleAssignments.filter(
        (r) => r.roleAssignmentId !== role.roleAssignmentId,
      );
    member.activeRoles = member.roleAssignments
      .filter((r) => r.status === 'Active')
      .map((r) => r.role);
    member.version = version(++x.revision);
    const result = make('SchoolMembershipMutationResult', {
      membershipId: member.membershipId,
      status: member.membershipStatus,
      membershipVersion: member.version,
      activeRoleAssignments: member.roleAssignments,
      resultRoleAssignmentId: role?.roleAssignmentId ?? null,
      clientOperationId: body.clientOperationId,
      operationCompletedAtUtc: new Date().toISOString(),
      replayed: false,
    });
    x.operations.set(key, { payload: JSON.stringify(body), value: result });
    return send(result);
  }
  return false;
}
