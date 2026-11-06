import fs from 'node:fs/promises';
const root = 'design/reference-v4';
const { screens } = JSON.parse(await fs.readFile(root + '/screens.json', 'utf8'));
const previous = JSON.parse(await fs.readFile('design/mk-reference.json', 'utf8')).screens;
const operations = JSON.parse(await fs.readFile('contracts/openapi.json', 'utf8')).paths;
const allowed = new Set(JSON.parse(await fs.readFile('contracts/client-surface.json', 'utf8')));
let comparisons = new Map();
try {
  const report = JSON.parse(
    await fs.readFile('output/review/mk-v4/reference/comparison.json', 'utf8'),
  );
  comparisons = new Map(report.screens.map((x) => [x.id, x]));
} catch {
  // A fresh checkout may generate the route map before recording screenshots.
}
const entries = new Map();
const education = '/personal/education',
  messages = '/personal/messages',
  extra = '/personal/extracurricular';
function map(ids, route, source, state = 'connected-flow-mapped') {
  for (const id of ids)
    entries.set('MK-' + String(id).padStart(2, '0'), {
      route,
      source: 'src/features/' + source + '.tsx',
      implementation: state,
    });
}
function range(a, b) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}
map([83, 84], '/personal/workspaces', 'personal/workspaces');
map([85], education + '/invitations', 'personal/school/invitations');
map([86, 87, 443, 455], education + '/classes', 'personal/school/manager-class-cards');
map([88], education + '/classes/{classId}', 'personal/school/class-detail');
map([89, 90, 91], education + '/courses', 'personal/school/catalog');
map([90], education + '/periods/new', 'personal/school/creation-pages');
map([92, 93, 94], education + '/classes/new', 'personal/school/creation-pages');
map([95, 96, 97], education + '/classes/{classId}', 'personal/school/class-settings');
map([98, 99, 100], education + '/classes/{classId}/members', 'personal/school/class-members');
map(
  [101, 102, 103],
  education + '/classes/{classId}/teachers/new',
  'personal/school/member-assignment',
);
map([104, 105, 106], education + '/people', 'personal/school/person-records');
map([105], education + '/people/new', 'personal/school/person-records');
map([107, 108, 109], education + '/members', 'personal/school/member-role-editor');
map([110, 111, 112], education + '/invitations', 'personal/school/sent-invitations');
map([113, 114, 115], education + '/guardians', 'personal/school/manager');
map([114], education + '/guardians/new', 'personal/school/onboarding');
map([116, 117, 118], education, 'personal/school/parent-daily');
map([119, 120, 121], education + '/schedule', 'personal/school/schedule');
map([122, 123], education + '/classes/{classId}/sessions/new', 'personal/school/creation-pages');
map([124, 125, 126, 127], education + '/sessions/{sessionId}', 'personal/school/session-page');
map([128, 129, 130, 444], education + '/schedule', 'personal/school/schedule');
map(
  [131, 132, 133],
  education + '/classes/{classId}/schedule-rules/new',
  'personal/school/schedule-rules',
  'new-connected-flow',
);
map([134, 135, 136], education + '/classes/{classId}/lessons/new', 'personal/school/lessons');
map([137, 138, 139, 445, 457], education + '/lessons/{lessonId}', 'personal/school/lessons');
map([140, 141, 142], education + '/assignments', 'personal/school/learning');
map(
  [143, 144, 145],
  education + '/assignments/{assignmentId}/answer',
  'personal/school/submission-flow',
);
map(
  [146, 147, 148, 458],
  education + '/submissions/{attemptId}/evaluate',
  'personal/school/assignment-evaluation',
);
map([149], education + '/exams', 'personal/school/exam-discovery');
map([150, 151, 152, 153, 154], education + '/exams/{examId}/edit', 'personal/school/exams');
map([155, 156, 157], education + '/exams/{examId}', 'personal/school/exam-taking');
map(
  [158, 159, 160, 459],
  education + '/exam-submissions/{attemptId}/grading',
  'personal/school/exam-grading',
);
map([161, 162, 163, 164, 165, 166, 467], education + '/reports', 'personal/school/manager-reports');
map([167], education + '/classes/{classId}', 'personal/school/official-spaces');
map([168], messages + '/{conversationId}', 'personal/messaging/academic-activity');
map([169], education + '/reports?kind=content-activities', 'personal/school/content-activities');
map([170, 171, 172, 460], messages, 'personal/messaging/messenger');
map([173, 174, 175], messages + '/folders', 'personal/messaging/folders', 'new-connected-flow');
map([176, 177, 178, 181], '/personal/contacts', 'personal/messaging/contacts');
map([179, 446], messages + '/{conversationId}', 'personal/messaging/conversation-room');
map([180], messages + '/{conversationId}/info', 'personal/messaging/conversation-pages');
map([182, 183, 184], messages + '?filter=Saved', 'personal/messaging/message-actions');
map([185, 186, 187], messages + '?q={query}', 'personal/messaging/messenger');
map([188, 189, 190], messages + '/new?kind=groups', 'personal/messaging/create');
map([191, 192, 193], messages + '/new?kind=channels', 'personal/messaging/create');
map([194, 197], messages + '/{conversationId}/info', 'personal/messaging/conversation-pages');
map(
  [195, 198, 200, 201, 202, 203, 204, 205, 447],
  messages + '/{conversationId}/settings',
  'personal/messaging/conversation-pages',
);
map([196], messages + '/{conversationId}/edit', 'personal/messaging/conversation-photo');
map(
  [199, 206, 207, 208, 209, 210, 211, 461],
  messages + '/{conversationId}/members',
  'personal/messaging/management',
);
map(
  [212, 215, 216, 217, 219, 220],
  messages + '/{conversationId}/invites',
  'personal/messaging/invite-links',
);
map([213, 214], messages, 'personal/messaging/received-invitations');
map([218], messages + '/join', 'personal/messaging/join');
map([221, 222], messages + '/join', 'personal/messaging/join');
map([223], '/personal/settings/communication', 'personal/account-help');
map([224, 225, 226], messages + '/{conversationId}/topics', 'personal/messaging/topics');
map(
  [227, 228, 229, 230, 231, 232, 233, 234, 235],
  messages + '/{conversationId}',
  'personal/messaging/message-actions',
);
map([236, 237, 238], messages + '/{conversationId}', 'personal/messaging/media');
map([239, 240, 241], messages + '/{conversationId}/media', 'personal/messaging/conversation-pages');
map(
  [242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253],
  messages + '/{conversationId}',
  'personal/messaging/rich-messages',
  'new-connected-flow',
);
map(
  [242],
  messages + '/{conversationId}/poll-new',
  'personal/messaging/rich-messages',
  'new-connected-flow',
);
map(
  [245],
  messages + '/{conversationId}/quiz-new',
  'personal/messaging/rich-messages',
  'new-connected-flow',
);
map(
  [248],
  messages + '/{conversationId}/checklist-new',
  'personal/messaging/rich-messages',
  'new-connected-flow',
);
map(
  [251, 252, 253],
  messages + '/{conversationId}/scheduled',
  'personal/messaging/rich-messages',
  'new-connected-flow',
);
map(
  [254, 255, 256, 448],
  messages + '/{conversationId}',
  'personal/messaging/conversation-actions',
);
map([257, 258], messages + '/{conversationId}/info', 'personal/messaging/conversation-controls');
map([259], '/personal/settings/privacy', 'personal/messaging/privacy');
map([260, 261, 262], messages + '/{conversationId}', 'personal/messaging/message-actions');
map([263, 264, 265], messages + '/{conversationId}/members', 'personal/messaging/management');
map(
  [266, 267, 268, 269, 270, 271],
  messages + '/{conversationId}',
  'personal/messaging/conversation-room',
);
map([272, 273, 274], extra + '/requests', 'extracurricular/connected');
map([275, 276, 277, 278, 279, 280, 281], extra + '/requests/new', 'extracurricular/connected');
map([282, 283], extra + '/requests/{requestId}/edit', 'extracurricular/connected');
map([289], extra + '/requests/{requestId}', 'extracurricular/connected');
map([290, 291, 292], extra + '/classes/{classId}/setup', 'extracurricular/class-management');
map([293, 294, 295], extra + '/classes/{classId}/edit', 'extracurricular/class-management');
map([296, 300], extra + '/classes/{classId}/invite', 'extracurricular/class-management');
map([297, 298, 299, 301], extra + '/invitations', 'extracurricular/class-management');
map([302], extra + '/join/{classId}', 'extracurricular/class-management');
map([303, 304], extra + '/classes/{classId}/requests', 'extracurricular/class-management');
map(
  [305, 306, 307, 308, 309, 310, 311, 312, 313, 449, 450, 451, 462],
  extra + '/classes/{classId}/members',
  'extracurricular/class-management',
);
map([317, 318, 319], extra + '/classes/{classId}/info', 'extracurricular/class-management');
map([320, 321, 322], extra + '/classes/{classId}/archive', 'extracurricular/class-management');
map([323, 324, 325], extra + '/classes/{classId}/learning', 'extracurricular/learning');
map(
  [326, 327, 328],
  extra + '/classes/{classId}/assignments/{assignmentId}',
  'extracurricular/learning',
);
map([329, 330, 331], extra + '/classes/{classId}/exams/{examId}', 'extracurricular/learning');
map([332, 333, 334], '/enter', 'auth/login');
map([335, 336, 337], '/personal/profile/edit', 'personal/profile-edit');
map([338], '/personal/settings', 'personal/settings');
map([339, 340], '/personal/settings/appearance', 'personal/settings');
map([341, 342], '/personal/settings/privacy', 'personal/messaging/privacy');
map([343], '/personal/settings/blocked', 'personal/messaging/privacy');
map(
  [344, 345, 346, 347, 348, 349],
  '/personal/settings/notifications',
  'personal/notification-settings',
);
map([350, 351, 352], '/personal/settings/devices', 'personal/security-devices');
map([353], '/personal/settings/communication', 'personal/account-help');
map([354], '/personal/settings/install', 'personal/account-help');
map([355], '/personal/settings/help', 'personal/account-help');
map(
  [356, 357, 358, 359, 360, 361, 362, 363, 364, 452, 465],
  '/personal/resources',
  'personal/sources/catalog',
);
map(range(365, 376).concat([453, 466]), '/personal/assistant', 'personal/assistant');
map(
  [377, 378, 379],
  '/personal/assistant/studio',
  'personal/assistant',
  'proposal-backend-pending',
);
map(range(380, 388).concat([454]), '/personal/subscription', 'personal/commerce');
map([419, 420, 421], education, 'reference/v4-preview', 'shared-loading-state');
map(range(422, 439), '/personal', 'reference/v4-preview', 'shared-state-mapped');
map([440], '/personal/settings/phone', 'personal/account-help', 'proposal-backend-pending');
map(
  [441],
  '/personal/settings/delete-account',
  'personal/account-help',
  'proposal-backend-pending',
);
map([442], '/personal/settings/support', 'personal/account-help', 'proposal-backend-pending');
map([456], education + '/schedule', 'personal/school/schedule');
const rows = [];
for (const view of screens) {
  const old = previous.find((x) => x.id === view.id);
  let record = entries.get(view.id);
  if (view.scope !== 'client')
    record = { route: null, source: null, implementation: 'separate-owner-application' };
  else if (!record && old)
    record = {
      route: old.route,
      source: 'src/features/reference/preview.tsx',
      implementation: 'retained-connected-flow',
    };
  if (!record) throw Error('Unmapped V4 view ' + view.id);
  if (record.source) await fs.access(record.source);
  const contractCandidates = [];
  for (const [p, ops] of Object.entries(operations))
    for (const [method, op] of Object.entries(ops))
      if (
        allowed.has(method.toUpperCase() + ' ' + p) &&
        op.tags?.some((t) => view.tags?.includes(t))
      )
        contractCandidates.push(method.toUpperCase() + ' ' + p);
  rows.push({
    id: view.id,
    title: view.title,
    page: view.page,
    role: view.role ?? old?.role,
    kind: view.variant,
    scope: view.scope,
    ...record,
    interaction: view.interaction ?? old?.interactionSummary,
    apiStatus: view.proposal
      ? 'No valid published contract; no production mutation'
      : contractCandidates.length
        ? 'Published client contracts; individual operation verification is separate'
        : 'See mapped connected component / BFF',
    contractCandidates,
    previewRoute: view.scope === 'client' ? '/preview/reference/' + view.id : null,
    visualStatus:
      view.scope !== 'client'
        ? 'excluded-separate-application'
        : comparisons.has(view.id)
          ? 'native-reference-render-compared; connected-state verification is separate'
          : 'awaiting-render-review',
    visualEvidence: comparisons.get(view.id) ?? null,
  });
}
const result = {
  reference: '4.0-blue',
  sourcePdfSha256: JSON.parse(await fs.readFile('design/reference-v4-archive.json', 'utf8'))
    .sourcePdfSha256,
  scope:
    '426 client views; 41 separate owner views. Mapping is not a claim that every distinct state is fully integrated or pixel-identical.',
  screens: rows,
};
await fs.writeFile('design/v4-traceability.json', JSON.stringify(result, null, 2) + '\n');
await fs.mkdir('docs/design', { recursive: true });
await fs.writeFile(
  'docs/design/V4_TRACEABILITY_FA.md',
  '# ردیابی طراحی V4\n\nاین جدول نگاشت نما، مسیر، حالت و خانوادهٔ قرارداد است؛ وجود ردیف به معنی تأیید اتصال زنده یا برابری پیکسلی نیست. جزئیات قراردادهای کاندید در `design/v4-traceability.json` ثبت می‌شوند. ۴۱ نمای مالک به برنامهٔ جداگانه تعلق دارند.\n\n| شناسه | صفحه PDF | نما | مسیر عملیاتی / زمینهٔ حالت | پیاده‌سازی |\n|---|---:|---|---|---|\n' +
    rows
      .map(
        (x) =>
          `| ${x.id} | ${x.page} | ${x.title} | ${x.route ?? 'برنامهٔ جداگانهٔ مالک'} | ${x.implementation} |`,
      )
      .join('\n') +
    '\n',
);
console.log(
  JSON.stringify({
    views: rows.length,
    client: rows.filter((x) => x.scope === 'client').length,
    excluded: rows.filter((x) => x.scope !== 'client').length,
  }),
);
