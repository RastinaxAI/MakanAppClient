// Operational route states, not atlas HTML. Less common transitions are captured by
// the real browser-test recorder. Pending product scenarios are tagged separately.
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const school = '/personal/education';
const group = '/personal/messages/' + id(950);
const independent = '/personal/extracurricular/classes/' + id(1800);
const row = (key, scenarios, route, role = 'Student', seed = 'design', options = {}) => ({
  key,
  scenarios,
  route,
  role,
  seed,
  ...options,
});
const org = (key, scenarios, route, role = 'Manager', seed = 'manager-case', options = {}) =>
  row(key, scenarios, school + route, role, seed, { school: true, ...options });
const chat = (key, scenarios, section, options = {}) =>
  row(key, scenarios, group + section, 'Student', 'rich-messaging', {
    seedData: { exactV5: true },
    ...options,
  });
const personalClass = (key, scenarios, section, options = {}) =>
  row(key, scenarios, independent + section, 'Personal', 'personal-class', options);
export const familyCases = [
  row('welcome', ['MK-01'], '/welcome', null, null),
  row(
    'class-request-details',
    ['MK-13'],
    '/personal/extracurricular/requests/new?step=details',
    'Personal',
    'personal-class',
    { prepare: 'class-request-details' },
  ),
  org('school-student', ['MK-04'], '', 'Student', 'design'),
  org('school-teacher', ['MK-07'], '', 'Teacher', 'design'),
  org('school-parent', ['MK-09'], '', 'Parent', 'parent-case', {
    prepare: 'parent-home-reference',
    seedData: { childName: 'نازنین احمدی' },
  }),
  org('parent-children', ['MK-116'], '?view=children', 'Parent', 'parent-case', {
    prepare: 'parent-children-reference',
  }),
  org('parent-program', ['MK-117'], '?view=program', 'Parent', 'parent-case', {
    prepare: 'parent-program-reference',
  }),
  org('parent-results', ['MK-118'], '/assignments', 'Parent', 'parent-case', {
    prepare: 'parent-results-reference',
  }),
  org('school-manager', ['MK-08'], '', 'Manager', 'manager-case', { seedData: { exactV5: true } }),
  row('workspaces', ['MK-83'], '/personal/workspaces'),
  org('student-classes', ['MK-86'], '/classes', 'Student', 'design'),
  org('teacher-classes', ['MK-87', 'MK-443'], '/classes', 'Teacher', 'design'),
  org('class-overview', ['MK-88'], '/classes/' + id(2), 'Student', 'design'),
  org('class-create', ['MK-92'], '/classes/new', 'Manager', 'manager-case', {
    seedData: { exactV5Catalog: true },
    prepare: 'class-create-reference',
  }),
  org(
    'class-settings-review',
    ['MK-96'],
    '/classes/' + id(2) + '?tab=settings',
    'Manager',
    'vnext',
    {
      seedData: { exactV5: true },
      prepare: 'capacity-review',
    },
  ),
  org('period-create', ['MK-90'], '/periods/new', 'Manager', 'manager-case', {
    prepare: 'period-create-reference',
    seedData: { exactV5: true },
  }),
  org('periods', ['MK-89'], '/periods'),
  org('courses', ['MK-91'], '/courses'),
  org('people', ['MK-104'], '/people'),
  org('person-create', ['MK-105'], '/people/new', 'Manager', 'manager-case', {
    prepare: 'person-create-reference',
  }),
  org('members', ['MK-107'], '/members', 'Manager', 'vnext'),
  org('guardians', ['MK-113'], '/guardians'),
  org('guardian-create', ['MK-114'], '/guardians/new'),
  org('class-members', ['MK-98'], '/classes/' + id(2) + '/members', 'Manager', 'manager-case', {
    seedData: { exactV5: true },
  }),
  org(
    'class-teachers',
    ['MK-101'],
    '/classes/' + id(2) + '/members?member=teachers',
    'Manager',
    'manager-case',
    { seedData: { exactV5: true, exactV5TeacherRoster: true } },
  ),
  org('teacher-assignment', ['MK-102'], '/classes/' + id(2) + '/teachers/new'),
  org('learner-enrollment', ['MK-99'], '/classes/' + id(2) + '/enrollments/new'),
  org('school-invitations', ['MK-110'], '/invitations', 'Manager', 'vnext'),
  org('student-schedule', ['MK-119'], '/schedule', 'Student', 'design'),
  org('teacher-schedule', [], '/schedule', 'Teacher', 'design'),
  org('session-create', ['MK-122'], '/classes/' + id(2) + '/sessions/new', 'Teacher', 'design', {
    prepare: 'session-create-reference',
  }),
  org('session-detail', ['MK-124'], '/sessions/' + id(6000), 'Student', 'design', {
    prepare: 'session-detail-reference',
  }),
  org('session-edit', ['MK-125'], '/sessions/' + id(6000) + '/edit', 'Teacher', 'design', {
    prepare: 'session-edit-reference',
  }),
  org(
    'attendance',
    ['MK-128'],
    '/sessions/' + id(6000) + '?view=attendance',
    'Teacher',
    'manager-case',
    {
      seedData: { exactV5: true, exactV5Attendance: true },
      prepare: 'attendance-reference',
    },
  ),
  org(
    'attendance-correct',
    ['MK-129'],
    '/sessions/' + id(6000) + '?view=attendance',
    'Teacher',
    'manager-case',
    {
      seedData: { exactV5: true, exactV5Attendance: true },
      prepare: 'attendance-correct-reference',
    },
  ),
  org('my-attendance', ['MK-130'], '/reports?kind=attendance', 'Student', 'manager-case', {
    seedData: { exactV5: true, exactV5Attendance: true },
    prepare: 'my-attendance-reference',
  }),
  org(
    'attendance-note-gap',
    ['MK-444'],
    '/sessions/' + id(6000) + '?view=attendance',
    'Teacher',
    'manager-case',
    {
      seedData: { exactV5: true, exactV5Attendance: true, attendanceRosterCount: 2 },
      prepare: 'attendance-note-reference',
    },
  ),
  org('session-cancel', ['MK-126'], '/sessions/' + id(6000) + '/edit', 'Teacher', 'design', {
    prepare: 'session-cancel-reference',
  }),
  org('session-complete', ['MK-127'], '/sessions/' + id(6000) + '/edit', 'Teacher', 'design', {
    prepare: 'session-complete-reference',
  }),
  org(
    'schedule-rule',
    ['MK-131'],
    '/classes/' + id(2) + '/schedule-rules/new',
    'Manager',
    'vnext',
    { prepare: 'schedule-rule-details' },
  ),
  org(
    'schedule-rule-range',
    ['MK-132'],
    '/classes/' + id(2) + '/schedule-rules/new',
    'Manager',
    'vnext',
    { prepare: 'schedule-rule-range' },
  ),
  org(
    'schedule-rule-change',
    ['MK-133'],
    '/classes/' + id(2) + '/schedule-rules/new',
    'Manager',
    'vnext',
    { prepare: 'schedule-rule-change' },
  ),
  org('lesson', ['MK-05', 'MK-138', 'MK-457'], '/lessons/' + id(5), 'Student', 'design'),
  org('lesson-create', ['MK-134'], '/classes/' + id(2) + '/lessons/new', 'Teacher', 'design', {
    prepare: 'lesson-create-reference',
  }),
  org('lesson-edit', ['MK-135'], '/classes/' + id(2) + '/lessons/new', 'Teacher', 'manager-case', {
    seedData: { exactV5: true, exactV5TeacherRoster: true, exactV5Lesson: true },
    prepare: 'lesson-edit-reference',
  }),
  org(
    'lesson-publish',
    ['MK-136'],
    '/classes/' + id(2) + '/lessons/new',
    'Teacher',
    'manager-case',
    {
      seedData: { exactV5: true, exactV5TeacherRoster: true, exactV5Lesson: true },
      prepare: 'lesson-publish-reference',
    },
  ),
  org('assignments', ['MK-140'], '/assignments', 'Teacher', undefined, {
    prepare: 'assignment-list',
  }),
  org(
    'assignment-create',
    ['MK-141'],
    '/classes/' + id(2) + '/assignments/new',
    'Teacher',
    'manager-case',
    {
      prepare: 'assignment-create-reference',
      seedData: { exactV5: true, exactV5TeacherRoster: true },
    },
  ),
  org(
    'assignment-rules',
    ['MK-142'],
    '/classes/' + id(2) + '/assignments/new',
    'Teacher',
    'manager-case',
    {
      prepare: 'assignment-rules-reference',
      seedData: { exactV5: true, exactV5TeacherRoster: true },
    },
  ),
  org(
    'assignment-answer',
    ['MK-06', 'MK-143'],
    '/assignments/' + id(3) + '/answer',
    'Student',
    undefined,
  ),
  org('exams', ['MK-149'], '/exams', 'Student', undefined),
  org('exam-create', ['MK-150'], '/classes/' + id(2) + '/exams/new', 'Teacher', 'vnext', {
    prepare: 'exam-create-reference',
    seedData: { exactV5: true },
  }),
  org('exam-rules', ['MK-151'], '/classes/' + id(2) + '/exams/new', 'Teacher', 'vnext', {
    prepare: 'exam-rules-reference',
    seedData: { exactV5: true },
  }),
  org(
    'exam-question-create',
    ['MK-152'],
    '/exams/' + id(7000) + '/questions/new',
    'Teacher',
    'vnext',
    {
      prepare: 'exam-question-create-reference',
      seedData: { exactV5: true },
    },
  ),
  org('exam-question-delete', ['MK-153'], '/exams/' + id(7000) + '/edit', 'Teacher', 'vnext', {
    prepare: 'exam-question-delete-reference',
    seedData: { exactV5: true },
  }),
  org('reports', ['MK-163', 'MK-467'], '/reports'),
  org('student-reports', ['MK-161'], '/reports', 'Student', 'design'),
  org('teacher-reports', ['MK-162'], '/reports', 'Teacher', 'design'),
  org('export-config', ['MK-164'], '/reports?kind=attendance', 'Manager', 'manager-case', {
    prepare: 'export-config',
  }),
  org('export-processing', ['MK-165'], '/reports?kind=attendance', 'Manager', 'manager-case', {
    prepare: 'export-processing',
  }),
  org('export-ready', ['MK-166'], '/reports?kind=attendance', 'Manager', 'manager-case', {
    prepare: 'export-ready',
  }),
  org('teacher-content', ['MK-169'], '/content', 'Teacher', 'vnext'),
  org('school-search', ['RX-002'], '/search', 'Teacher', 'design'),
  org('forbidden-manager', ['MK-425'], '/classes/new', 'Student', 'design', {
    expectedFailure: true,
  }),
  org('class-fetch-error', ['MK-426'], '/classes', 'Manager', 'manager-case', {
    prepare: 'class-fetch-error',
    expectedFailure: true,
  }),
  row('contacts', ['MK-176'], '/personal/contacts'),
  row('profile', ['MK-47'], '/personal/profile'),
  row('profile-edit', ['MK-335'], '/personal/profile/edit'),
  row('settings', ['MK-338'], '/personal/settings'),
  row('appearance', ['MK-339', 'RX-041'], '/personal/settings/appearance'),
  row('reading', ['MK-340'], '/personal/settings/reading'),
  row('privacy', ['MK-341'], '/personal/settings/privacy', 'Teacher', 'messaging-repair', {
    seedData: { privacy: { isExplicit: true } },
  }),
  row('privacy-direct', ['MK-342'], '/personal/settings/privacy', 'Teacher', 'messaging-repair', {
    seedData: { privacy: { isExplicit: true } },
    prepare: 'privacy-direct-reference',
  }),
  row('blocked', ['MK-343'], '/personal/settings/blocked', 'Teacher', 'messaging-repair', {
    seedData: { blocked: true },
  }),
  row('notifications', ['MK-344'], '/personal/notifications'),
  row('notification-settings', ['MK-345'], '/personal/settings/notifications'),
  row(
    'notification-device',
    ['MK-347'],
    '/personal/settings/notifications/device',
    'Student',
    'design',
    {
      prepare: 'notification-device-reference',
      seedData: { webPushConfigured: true },
      pushPermission: 'default',
    },
  ),
  row(
    'notification-devices',
    ['MK-348'],
    '/personal/settings/notifications/devices',
    'Student',
    'design',
    {
      prepare: 'notification-devices-reference',
      seedData: { webPushConfigured: true },
      pushPermission: 'granted',
    },
  ),
  row(
    'notification-device-delete',
    ['MK-349'],
    '/personal/settings/notifications/devices',
    'Student',
    'design',
    {
      prepare: 'notification-device-delete-reference',
      seedData: { webPushConfigured: true },
      pushPermission: 'granted',
    },
  ),
  row(
    'notification-device-denied',
    ['MK-435'],
    '/personal/settings/notifications/device',
    'Student',
    'design',
    {
      prepare: 'notification-device-denied-reference',
      seedData: { webPushConfigured: true },
      pushPermission: 'denied',
    },
  ),
  row(
    'notification-permission-preferences',
    ['RX-040'],
    '/personal/settings/notifications/device?view=preferences',
    'Student',
    'design',
    {
      prepare: 'notification-permission-preferences-reference',
      seedData: { webPushConfigured: true },
      pushPermission: 'denied',
    },
  ),
  row(
    'notification-assignments',
    ['MK-346'],
    '/personal/settings/notifications/Assignments',
    'Student',
    'design',
    { prepare: 'notification-category-reference', seedData: { webPushConfigured: true } },
  ),
  row('devices', ['MK-48', 'MK-350'], '/personal/settings/devices'),
  row('communication', ['MK-223', 'MK-353'], '/personal/settings/communication'),
  row('install', ['MK-354'], '/personal/settings/install'),
  row('help', ['MK-355'], '/personal/settings/help'),
  row('resources', ['MK-356'], '/personal/resources'),
  row('assistant', ['MK-38', 'MK-365'], '/personal/assistant', 'Student', 'design', {
    prepare: 'assistant-reference',
  }),
  row('source-detail', ['MK-357'], '/personal/resources/' + id(1500), 'Student', 'design', {
    prepare: 'source-detail-reference',
  }),
  row('subscription', ['MK-380'], '/personal/subscription'),
  row('messages', ['MK-170', 'MK-35'], '/personal/messages', 'Student', 'rich-messaging'),
  row('unread', ['MK-171'], '/personal/messages?filter=Unread', 'Student', 'rich-messaging'),
  row('archived', ['MK-172'], '/personal/messages?filter=Archived', 'Student', 'rich-messaging'),
  row('folders', ['MK-173'], '/personal/messages/folders', 'Student', 'rich-messaging'),
  row('received-invitations', ['MK-213'], '/personal/invitations', 'Student', 'rich-messaging'),
  row('join-conversation', ['MK-218'], '/personal/messages/join'),
  row('group-create', ['MK-188'], '/personal/messages/new?kind=groups', 'Student', 'design', {
    prepare: 'conversation-create-reference',
  }),
  row('channel-create', ['MK-191'], '/personal/messages/new?kind=channels', 'Student', 'design', {
    prepare: 'conversation-create-reference',
  }),
  chat('group-chat', ['MK-446'], ''),
  chat('group-info', ['MK-194'], '/info', {
    role: 'Teacher',
    seedData: {
      exactV5: true,
      adminCapabilities: {
        canEditInfo: true,
        canManageMembers: true,
        canManageInvites: true,
        canChangeSettings: true,
      },
    },
    prepare: 'conversation-info-reference',
  }),
  chat('group-edit', ['MK-195'], '/edit', {
    role: 'Teacher',
    seedData: { exactV5: true, editPending: true, adminCapabilities: { canEditInfo: true } },
    prepare: 'conversation-edit-reference',
  }),
  chat('channel-info', ['MK-197'], '/info', {
    seedData: { exactV5: true, type: 'Channel', readOnly: true },
    prepare: 'conversation-info-reference',
  }),
  chat('channel-edit', ['MK-198'], '/edit', {
    role: 'Teacher',
    seedData: {
      exactV5: true,
      type: 'Channel',
      editPending: true,
      adminCapabilities: { canEditInfo: true },
    },
    prepare: 'conversation-edit-reference',
  }),
  chat('group-settings', ['MK-200'], '/settings', {
    role: 'Teacher',
    seedData: { exactV5: true, adminCapabilities: { canChangeSettings: true } },
  }),
  chat('group-members', ['MK-206'], '/members', {
    role: 'Teacher',
    seedData: {
      exactV5: true,
      adminCapabilities: { canInviteMembers: true, canManageMembers: true },
    },
    prepare: 'conversation-members-reference',
  }),
  chat('group-media', ['MK-239'], '/media', { seedData: { exactV5: true, readOnly: true } }),
  chat('group-invites', ['MK-216'], '/invites', {
    role: 'Teacher',
    seedData: {
      exactV5: true,
      referenceInvites: true,
      adminCapabilities: { canManageInvites: true },
    },
    prepare: 'conversation-invites-reference',
  }),
  chat('group-topics', ['MK-224'], '/topics', { seedData: { exactV5: true, readOnly: true } }),
  chat('group-invite-new', ['MK-215'], '/invites?view=new', {
    role: 'Teacher',
    seedData: { exactV5: true, adminCapabilities: { canManageInvites: true } },
    prepare: 'invite-form-reference',
  }),
  chat('group-join-requests', ['MK-219'], '/invites?view=requests', {
    role: 'Teacher',
    seedData: {
      exactV5: true,
      referenceJoinRequests: true,
      adminCapabilities: { canManageInvites: true },
    },
    prepare: 'join-requests-reference',
  }),
  ...[
    ['poll', 'MK-242', '/poll-new'],
    ['quiz', 'MK-245', '/quiz-new'],
    ['checklist', 'MK-248', '/checklist-new'],
    ['scheduled', 'MK-252', '/scheduled'],
  ].map(([key, scenario, section]) =>
    chat(key, [scenario], section, {
      role: 'Teacher',
      seedData: {
        exactV5: true,
        adminCapabilities: { canPublish: true },
        ...(key === 'scheduled' ? { referenceScheduled: true } : {}),
      },
      prepare: 'rich-form-reference',
    }),
  ),
  row('extracurricular', ['MK-11'], '/personal/extracurricular', 'Personal', 'personal-class'),
  row(
    'formation-requests',
    ['MK-12', 'MK-272'],
    '/personal/extracurricular/requests',
    'Personal',
    'personal-class',
  ),
  row(
    'class-request-audience',
    ['MK-14'],
    '/personal/extracurricular/requests/new?step=audience',
    'Personal',
    'personal-class',
  ),
  row(
    'class-request-management',
    ['MK-15'],
    '/personal/extracurricular/requests/new?step=management',
    'Personal',
    'personal-class',
  ),
  personalClass('independent-overview', ['MK-24'], ''),
  personalClass('independent-settings', ['MK-293'], '/edit', {
    seedData: { exactV5Members: true },
    prepare: 'independent-settings',
  }),
  personalClass('independent-spaces', ['MK-292'], '/setup'),
  personalClass('independent-members', ['MK-305', 'MK-462'], '/members', {
    seedData: { exactV5Members: true },
  }),
  ...[
    ['roles', 'MK-306', 'roles'],
    ['permissions', 'MK-309', 'permissions'],
    ['end', 'MK-307', 'roles'],
    ['revoke', 'MK-310', 'permissions'],
    ['dual', 'RX-032', 'summary'],
    ['teacher-end', 'RX-033', 'teaching'],
  ].map(([key, scenario, view]) =>
    personalClass(
      'independent-member-' + key,
      [scenario],
      '/members/' + id(1808) + '?page=1&view=' + view,
      {
        seedData: { exactV5Members: true, exactV5MemberDetail: true },
        prepare: 'independent-member-' + key,
      },
    ),
  ),
  personalClass('independent-member-search', ['MK-54'], '/members', {
    seedData: { exactV5Members: true },
    prepare: 'independent-member-search',
  }),
  personalClass('independent-invite', ['MK-296'], '/invite'),
  personalClass('independent-requests', ['MK-303'], '/requests'),
  personalClass('independent-history', ['MK-318'], '/info'),
  row(
    'independent-invitations',
    ['MK-297'],
    '/personal/extracurricular/invitations',
    'Personal',
    'personal-class',
  ),
  row(
    'independent-join',
    ['MK-302'],
    '/personal/extracurricular/join/' + id(1800),
    'Personal',
    'personal-class',
  ),
];
