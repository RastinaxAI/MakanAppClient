// Review geometry in native CSS pixels. This is not a pixel-parity score.
import fs from 'node:fs/promises';
const folder = 'output/review/exact-v1';
const currentFolder = process.env.EXACT_CURRENT_DIR || folder + '/after';
const referenceFolder = process.env.EXACT_REFERENCE_DIR || folder + '/reference';
for (const directory of [currentFolder, referenceFolder])
  if (!directory.startsWith(folder + '/') || directory.split('/').includes('..'))
    throw Error('Unexpected geometry evidence directory');
const current = JSON.parse(await fs.readFile(currentFolder + '/results.json', 'utf8'));
const reference = JSON.parse(await fs.readFile(referenceFolder + '/results.json', 'utf8'));
const references = JSON.parse(await fs.readFile(folder + '/reference-all/manifest.json', 'utf8'));
const label = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
// Explicit copy alias for one confirmed control; retain both source labels in evidence.
const controlLabel = (value, caseKey) => {
  const text = label(value);
  return caseKey === 'class-settings' && text === 'ظرفیت کلاس' ? 'ظرفیت' : text;
};
const sameControl = (actual, expected, caseKey) =>
  controlLabel(actual.accessibleLabel || actual.label, caseKey) ===
    controlLabel(expected.accessibleLabel || expected.label, caseKey) &&
  (actual.type === expected.type ||
    ([
      'text',
      'tel',
      'url',
      'email',
      'number',
      'time',
      'date',
      'datetime-local',
      'select',
      'picker',
    ].includes(actual.type) &&
      expected.type === 'text'));
const records = [];
const rejectedEvidence = current
  .filter(
    (row) =>
      row.status === 'captured' &&
      (row.stateVerified === false || row.pageErrors?.length || row.layout?.renderError),
  )
  .map((row) => ({
    key: row.key,
    width: row.width,
    theme: row.theme,
    buildId: row.productBuildId,
    reason:
      row.detail || 'Unverified state or renderer error; not a matching reference checkpoint.',
  }));
for (const row of current.filter(
  (row) =>
    row.status === 'captured' &&
    row.stateVerified !== false &&
    !row.pageErrors?.length &&
    !row.layout?.renderError,
)) {
  let ref = reference.find(
    (r) =>
      r.key === row.key &&
      r.width === row.width &&
      r.height === row.height &&
      r.theme === row.theme,
  );
  if (!ref && row.key === 'class-settings-review') {
    const image = references.find(
      (r) => r.scenario === 'MK-96' && r.width === row.width && r.theme === row.theme,
    );
    if (image) ref = { ...image, layout: { dialog: image.geometry.dialog } };
  }
  if (!ref?.layout || ref.status !== 'captured' || row.proposal) continue;
  const metrics = [];
  const rectangles = ['header', 'title', 'field', 'action', 'nav', 'context', 'dialog'];
  if (row.key === 'otp')
    rectangles.push('scenePolicy', 'authDigits', 'authCodeActions', 'authSecurity');
  if (['lesson-create', 'assignment-create'].includes(row.key)) rectangles.push('uploadTarget');
  if (row.key === 'assignment-rules') rectangles.push('listBounds', 'listFirstRow', 'parentNotice');
  if (['lesson-edit', 'lesson-publish'].includes(row.key))
    rectangles.push('lessonAttachment', 'lessonAttachmentIcon', 'lessonAttachmentTitle');
  if (
    [
      'schedule-rule-range',
      'schedule-rule-change',
      'lesson-publish',
      'assignment-rules',
      'session-complete',
    ].includes(row.key)
  )
    rectangles.push('reviewCheckline', 'reviewCheckmark');
  if (row.key === 'lesson-publish')
    rectangles.push(
      'dialogHeading',
      'dialogBody',
      'dialogHero',
      'dialogHeroTitle',
      'dialogSummary',
      'dialogActions',
      'dialogPrimary',
    );
  if (['exam-question-delete', 'session-cancel', 'session-complete'].includes(row.key))
    rectangles.push(
      'dialogHeading',
      'dialogBody',
      'dialogSummary',
      'dialogActions',
      'dialogPrimary',
      ...(row.key.startsWith('session-') ? ['dialogPolicy', 'dialogField'] : []),
    );
  if (row.key === 'schedule-rule-change')
    rectangles.push(
      'dialogHeading',
      'dialogBody',
      'dialogField',
      'dialogSummary',
      'dialogPolicy',
      'dialogActions',
      'dialogPrimary',
    );
  if (row.key === 'welcome')
    rectangles.push(
      'welcomeBrand',
      'welcomeBanner',
      'welcomeDescription',
      'welcomeTagline',
      'listBounds',
      'listFirstRow',
    );
  if (row.key === 'classes')
    rectangles.push(
      'classMetrics',
      'classHero',
      'classDetails',
      'classLinks',
      'classSearch',
      'classTableHeader',
    );
  if (row.key === 'resources')
    rectangles.push('resourceScopes', 'resourceSearch', 'resourceFirstRow');
  if (
    [
      'class-teachers',
      'class-members',
      'teacher-assignment',
      'learner-enrollment',
      'teacher-classes',
      'student-classes',
      'teacher-content',
      'reading',
      'independent-members',
      'group-info',
      'group-members',
      'channel-info',
      'channel-edit',
      'privacy',
      'blocked',
      'school-parent',
      'parent-children',
      'parent-program',
      'parent-results',
      'notification-assignments',
    ].includes(row.key)
  )
    rectangles.push('listBounds', 'listFirstRow', 'listAvatar', 'search');
  if (row.key === 'parent-results') rectangles.push('segmented');
  if (row.key === 'parent-program') rectangles.push('sceneHero');
  if (row.key === 'session-detail') rectangles.push('sceneHero', 'listBounds', 'listFirstRow');
  if (row.key.startsWith('notification-') && row.key !== 'notification-assignments')
    rectangles.push(
      'sceneHero',
      'sceneAlert',
      'scenePolicy',
      'listBounds',
      'listFirstRow',
      'listBadge',
      'firstSwitch',
    );
  if (row.key === 'notification-device-delete')
    rectangles.push(
      'dialogHeading',
      'dialogBody',
      'dialogSummary',
      'dialogPolicy',
      'dialogActions',
      'dialogPrimary',
    );
  if (
    ['attendance', 'attendance-correct', 'attendance-note-gap', 'my-attendance'].includes(row.key)
  )
    rectangles.push(
      'sceneHero',
      'search',
      'listBounds',
      'listFirstRow',
      'listAvatar',
      'listBadge',
      'classMetrics',
      'statFirst',
    );
  if (row.key === 'attendance-correct')
    rectangles.push(
      'dialogHeading',
      'dialogBody',
      'dialogField',
      'dialogChoices',
      'dialogChoiceFirst',
      'dialogChoiceText',
      'dialogActions',
      'dialogPrimary',
    );
  if (row.key === 'school-parent')
    rectangles.push('parentSelection', 'parentUpcoming', 'parentNotice');
  for (const control of row.layout.controls ?? []) {
    if (!control.label) continue;
    // Native inputs and the atlas's role-based boolean controls have different
    // hit nodes. Match their inventory below; compare checkline/paint geometry
    // through the dedicated rectangles rather than input-vs-entire-label bounds.
    if (['checkbox', 'switch', 'radio'].includes(control.type)) continue;
    const expected = ref.layout.controls?.find((other) => sameControl(control, other, row.key));
    if (!expected) continue;
    const metric = 'control:' + control.label;
    row.layout[metric] = control;
    ref.layout[metric] = expected;
    rectangles.push(metric);
  }
  const matchedControls = new Set();
  const unpairedControls = (ref.layout.controls ?? [])
    .filter((expected) => {
      if (!expected.label) return false;
      const index = (row.layout.controls ?? []).findIndex(
        (actual, index) => !matchedControls.has(index) && sameControl(actual, expected, row.key),
      );
      if (index < 0) return true;
      matchedControls.add(index);
      return false;
    })
    .map(({ label, type }) => ({
      label,
      type,
      ...(row.key === 'session-cancel' && label === 'دلیل لغو'
        ? {
            status: 'documented_contract_constraint',
            reason:
              'SessionVersionCommand has only expectedRowVersion in active/full recorded contracts. The reference reason textarea has no verified persistence field; existing cancellation remains usable without a fake saved reason. See session-native.json and matrix MK126.',
          }
        : {}),
    }));
  for (
    let index = 0;
    index < Math.min(row.layout.listAvatars?.length ?? 0, ref.layout.listAvatars?.length ?? 0);
    index++
  ) {
    const metric = 'avatar:' + (index + 1);
    row.layout[metric] = row.layout.listAvatars[index];
    ref.layout[metric] = ref.layout.listAvatars[index];
    rectangles.push(metric);
  }
  for (const key of rectangles) {
    const actual = row.layout[key],
      expected = ref.layout[key];
    if (!actual || !expected) continue;
    const a = key === 'title' ? actual.textBounds || actual : actual;
    const b = key === 'title' ? expected.textBounds || expected : expected;
    const delta = Object.fromEntries(
      ['x', 'y', 'width', 'height'].map((key) => [key, +(a[key] - b[key]).toFixed(3)]),
    );
    const significant = Object.values(delta).some((n) => Math.abs(n) >= 4);
    let exception;
    if (
      significant &&
      row.key === 'session-cancel' &&
      key.startsWith('dialog') &&
      unpairedControls.some((control) => control.label === 'دلیل لغو') &&
      ['x', 'width'].every((axis) => Math.abs(delta[axis]) < 4)
    )
      exception =
        'The reference reason textarea has no field in the registered cancel command. The dialog remains naturally shorter and vertically centered; empty padding or an unpersisted form is not added to force a false match. This is a visible partial-contract difference, not matched parity. The missing control stays unresolved in the inventory.';
    if (significant && key === 'title' && ['phone', 'otp'].includes(row.key))
      exception =
        'Approved product logo is retained beside the auth heading (the document header has no logo). Geometry of the field and primary action is compared independently.';
    if (significant && key === 'title' && ['parent-program', 'parent-results'].includes(row.key))
      exception =
        'AuthorizedChildResult exposes displayName only. The reference header uses the first name while its body uses the full name. The real header retains the complete authorized identity; a first-name field or heuristic split is not invented. Text widths differ with this documented data limitation; header height and panel geometry are compared independently.';
    if (significant && row.key === 'large-classes')
      exception =
        'RX-004 is a generic large-text demonstration with a different title and sample record. Actual class-management title/data are retained; line count is content-dependent. Navigation, reachability and overflow are tested separately. No pixel-parity claim.';
    if (significant && key === 'context' && row.key === 'class-request')
      exception =
        'Context reflects the current user draft and authorized personal workspace. Any sample-data difference is recorded; it does not prove visual parity.';
    if (significant && key === 'context' && row.key === 'resources')
      exception =
        'The reference selects Personal but depicts Personal/Class/Library sample rows together. The real Personal response contains one authorized source, so the context has one item rather than three. Authorized scope filtering is preserved; empty placeholder rows or inaccessible sources are not inserted. Individual search/scope/first-row geometry is compared separately.';
    if (
      significant &&
      key === 'context' &&
      ['messages', 'extracurricular'].includes(row.key) &&
      actual.text !== expected.text
    )
      exception =
        'The current account/workspace, returned rows and helper descriptions differ from the reference sample (both texts and images are retained). This content-dependent context-card height is an open data/state comparison, not equal visual parity or a proven CSS error. Row dimensions and the other shell rectangles are compared independently. Real account data is not replaced by atlas sample data.';
    if (
      significant &&
      key === 'listBounds' &&
      actual.rowCount !== undefined &&
      expected.rowCount !== undefined &&
      actual.rowCount !== expected.rowCount &&
      ['x', 'y', 'width'].every((axis) => Math.abs(delta[axis]) < 4)
    )
      exception = `The returned list has ${actual.rowCount} rows and the reference sample has ${expected.rowCount}. Their total height is not comparable with different data. The first-row geometry is measured independently; no rows or counts are fabricated to force equal height.`;
    metrics.push({
      key,
      actual,
      reference: expected,
      delta,
      significant,
      exception,
      review: significant
        ? exception
          ? 'documented_exception'
          : 'requires_visual_review'
        : 'below_4_css_px',
    });
  }
  records.push({
    key: row.key,
    scenarios: row.scenarios,
    width: row.width,
    height: row.height,
    theme: row.theme,
    buildId: row.productBuildId,
    actualImage: row.image,
    referenceImage: ref.image,
    focus: row.focus,
    metrics,
    unpairedControls,
  });
}
const result = {
  currentFolder,
  referenceFolder,
  method:
    'Native CSS viewport; title uses its text Range rather than the width of a block heading. Each rectangle is reviewed independently. Different data/focus/content must still be checked visually.',
  threshold: 4,
  rejectedEvidence,
  rejectedReferenceEvidence: reference
    .filter((row) => row.status !== 'captured' || !row.layout)
    .map((row) => ({
      key: row.key,
      width: row.width,
      theme: row.theme,
      reason: row.detail || row.status,
    })),
  records,
  unresolved: records.flatMap((row) => [
    ...row.metrics
      .filter((m) => m.review === 'requires_visual_review')
      .map((m) => ({
        key: row.key,
        width: row.width,
        theme: row.theme,
        metric: m.key,
        delta: m.delta,
      })),
    ...row.unpairedControls.map((control) => ({
      key: row.key,
      width: row.width,
      theme: row.theme,
      kind: 'unpaired_reference_control',
      metric: 'unpaired-control:' + control.label,
      expectedType: control.type,
      ...(control.reason ? { status: control.status, reason: control.reason } : {}),
    })),
  ]),
};
const reportName = process.env.EXACT_GEOMETRY_NAME || 'geometry-core';
if (!/^[a-z0-9_-]+$/.test(reportName)) throw Error('Unexpected geometry report name');
await fs.writeFile(
  'docs/design/exact-v1/' + reportName + '.json',
  JSON.stringify(result, null, 2) + '\n',
);
await fs.writeFile(
  currentFolder + '/' + reportName + '.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    configurations: records.length,
    unresolved: result.unresolved.length,
    rejectedEvidence: rejectedEvidence.length,
    unpairedControls: result.unresolved.filter((row) => row.kind === 'unpaired_reference_control')
      .length,
  }),
);
