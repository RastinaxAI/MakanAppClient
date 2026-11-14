import { test, expect, login, fixture, ids, origin } from './test';
import type { BrowserContext, Page } from '@playwright/test';
import type { components } from '../../src/generated/api/schema';
import * as copy from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
type S = components['schemas'];
const t = copy.v5ExamQuestion;
const api = '/api/v1/academic/exams/';
test('a cached authorized question can open confirmation while its background snapshot refresh is pending', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision, true);
  let releaseReplay!: () => void, releaseRead!: () => void;
  const replayHeld = new Promise<void>((resolve) => {
      releaseReplay = resolve;
    }),
    readHeld = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
  await page.route('**/api/client/backend/api/v1/realtime/**', async (route) => {
    await replayHeld;
    await route.continue();
  });
  let reads = 0;
  await page.route('**/api/client/backend' + api + exam.id + '/editor', async (route) => {
    reads++;
    if (reads === 1) return route.continue();
    const response = await route.fetch();
    await readHeld;
    await route.fulfill({ response });
  });
  await page.goto(editPath(exam));
  const trigger = page.getByRole('button', { name: t.remove + ' ۱', exact: true });
  await expect(trigger).toBeVisible();
  const refreshing = page.waitForRequest(
    (r) => r.method() === 'GET' && r.url().endsWith(api + exam.id + '/editor'),
    { timeout: 15000 },
  );
  try {
    releaseReplay();
    await refreshing;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(trigger).toBeEnabled();
    await trigger.click();
    await expect(page.getByRole('dialog', { name: t.removeTitle, exact: true })).toBeVisible();
  } finally {
    releaseRead();
    releaseReplay();
    // Finish the deliberately held request before Playwright disposes its API response.
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(page.getByRole('dialog', { name: t.removeTitle, exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { method: string }) => r.method === 'DELETE')).toHaveLength(0);
});
test('a newer background question snapshot keeps confirmation open until the changed version is explicitly reviewed', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam, headers } = await seed(context, session.revision, true);
  const question = exam.questions[0],
    path = api + exam.id + '/questions/' + question.id;
  let releaseReplay!: () => void, releaseRead!: () => void;
  const replayHeld = new Promise<void>((resolve) => {
      releaseReplay = resolve;
    }),
    readHeld = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
  await page.route('**/api/client/backend/api/v1/realtime/**', async (route) => {
    await replayHeld;
    await route.continue();
  });
  let reads = 0;
  await page.route('**/api/client/backend' + api + exam.id + '/editor', async (route) => {
    reads++;
    if (reads > 1) await readHeld;
    await route.continue();
  });
  await page.goto(editPath(exam));
  const trigger = page.getByRole('button', { name: t.remove + ' ۱', exact: true }),
    dialog = page.getByRole('dialog', { name: t.removeTitle, exact: true });
  await expect(trigger).toBeVisible();
  const refreshing = page.waitForRequest(
    (r) => r.method() === 'GET' && r.url().endsWith(api + exam.id + '/editor'),
    { timeout: 15000 },
  );
  let fresh!: S['ExamEditorDto'];
  try {
    releaseReplay();
    await refreshing;
    await trigger.click();
    await expect(dialog).toBeVisible();
    const remote = await context.request.patch('/api/client/backend' + path, {
      headers,
      data: {
        order: question.order,
        type: question.type,
        prompt: 'صورت تازهٔ نیازمند بازبینی',
        score: question.score,
        options: null,
        attachmentPolicy: question.attachmentPolicy,
        expectedVersionRowVersion: exam.versionRowVersion,
        expectedQuestionRowVersion: question.rowVersion,
      },
    });
    expect(remote.ok()).toBeTruthy();
    fresh = await remote.json();
  } finally {
    releaseRead();
    releaseReplay();
  }
  await expect(dialog.getByText(t.changed, { exact: true })).toBeVisible();
  await expect(dialog.locator('[data-exam-question-remove-meta]')).toContainText(question.prompt);
  await expect(dialog.locator('[data-exam-question-remove-meta]')).not.toContainText(
    fresh.questions[0].prompt,
  );
  await expect(dialog.getByRole('button', { name: t.remove, exact: true })).toBeDisabled();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { method: string }) => r.method === 'DELETE')).toHaveLength(0);
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.locator('[data-exam-question-remove-meta]')).toContainText(
    fresh.questions[0].prompt,
  );
  await dialog.getByRole('button', { name: t.remove, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText(fresh.questions[0].prompt, { exact: true })).toHaveCount(0);
  state = await (await request.get(fixture + '/__test__/state')).json();
  const removed = state.requests.filter(
    (r: { method: string; path: string }) => r.method === 'DELETE' && r.path === path,
  );
  expect(removed).toHaveLength(1);
  expect(removed[0].body).toEqual({
    expectedVersionRowVersion: fresh.versionRowVersion,
    expectedQuestionRowVersion: fresh.questions[0].rowVersion,
  });
});
test('mixed Latin and Persian editing keeps the numeric caret inside the actual controlled value', async ({
  page,
  context,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision);
  await newForm(page, exam);
  const input = page.getByLabel(t.score, { exact: true });
  await input.fill('12345');
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 2));
  await input.pressSequentially('9');
  await expect(input).toHaveValue('۱۲۹۳۴۵');
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(3);
  await input.pressSequentially('۰');
  await expect(input).toHaveValue('۱۲۹۰۳۴۵');
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(4);
  await input.press('Backspace');
  await expect(input).toHaveValue('۱۲۹۳۴۵');
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(3);
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(1, 2));
  await input.pressSequentially('2');
  await expect(input).toHaveValue('۱۲۹۳۴۵');
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(2);
});
async function seed(
  context: BrowserContext,
  revision: string,
  withQuestion = false,
  bytes: number | null = null,
) {
  const headers = { Origin: origin, 'X-Makan-Context': revision };
  const created = await context.request.post(
    '/api/client/backend/api/v1/academic/classes/' + ids.class + '/exams',
    {
      headers,
      data: {
        title: 'مرور معادله',
        description: null,
        availableFromUtc: '2026-11-09T14:30:00Z',
        availableUntilUtc: '2026-11-09T16:30:00Z',
        durationMinutes: 15,
        maxAttempts: 1,
        maxScore: 20,
        randomizationPolicy: 'None',
      },
    },
  );
  expect(created.status()).toBe(201);
  let exam: S['ExamEditorDto'] = await created.json();
  if (withQuestion) {
    const added = await context.request.post('/api/client/backend' + api + exam.id + '/questions', {
      headers,
      data: {
        order: 1,
        type: 'Descriptive',
        prompt: 'معادله را حل و مراحل را بنویسید.',
        score: 8,
        options: null,
        expectedVersionRowVersion: exam.versionRowVersion,
        attachmentPolicy: {
          attachmentsAllowed: true,
          textRequired: true,
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maximumCount: null,
          maximumTotalBytes: bytes,
        },
      },
    });
    expect(added.ok()).toBeTruthy();
    exam = await added.json();
  }
  return { exam, headers };
}
const editPath = (exam: S['ExamEditorDto']) => '/personal/education/exams/' + exam.id + '/edit';
async function newForm(page: Page, exam: S['ExamEditorDto']) {
  await page.goto('/personal/education/exams/' + exam.id + '/questions/new');
  await page.getByLabel(t.prompt, { exact: true }).fill('معادله را حل و مراحل را بنویسید.');
  await page.getByLabel(t.score, { exact: true }).fill('۸');
}
async function menu(page: Page) {
  await page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: copy.v4_more, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function policy(page: Page) {
  await page.getByRole('switch', { name: t.files, exact: true }).check();
  await page.getByLabel(t.policy, { exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.policy, exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
test('native question creation retains its real policy and scoped draft through back, reload, responsive reflow and a rejected write without publishing', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision);
  await newForm(page, exam);
  const rules = await policy(page);
  await rules.getByRole('checkbox', { name: copy.text_aacb94b9f8cb, exact: true }).uncheck();
  await rules.getByLabel(copy.text_5b0f84fa02d1, { exact: true }).fill('۲');
  await rules.getByLabel(copy.text_93b036d10054, { exact: true }).fill('۰٫۵');
  await rules.getByRole('button', { name: t.done, exact: true }).click();
  await expect(page.getByLabel(t.policy, { exact: true })).toBeFocused();
  await captureExactState(
    page,
    ['MK-152'],
    'Native Teacher question draft with its real file policy; no sample HTML and no mutation yet.',
  );
  for (const width of [320, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1112 });
    await expect(page.getByLabel(t.score, { exact: true })).toHaveValue('۸');
  }
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(editPath(exam));
  await page.goto('/personal/education/exams/' + exam.id + '/questions/new');
  await page.reload();
  await expect(page.getByLabel(t.prompt, { exact: true })).toHaveValue(
    'معادله را حل و مراحل را بنویسید.',
  );
  const restored = await policy(page);
  await expect(restored.getByLabel(copy.text_93b036d10054, { exact: true })).toHaveValue('۰.۵');
  await expect(
    restored.getByRole('checkbox', { name: copy.text_aacb94b9f8cb, exact: true }),
  ).not.toBeChecked();
  await restored.getByRole('button', { name: t.done, exact: true }).click();
  const path = api + exam.id + '/questions';
  await request.post(fixture + '/__test__/fault', { data: { path, method: 'POST', status: 503 } });
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let pending = 0;
  await page.route('**/api/client/backend' + path, async (route) => {
    pending++;
    await held;
    await route.continue();
  });
  const save = page.locator('form[data-v5-scene="MK-152"] button[type="submit"]:visible');
  try {
    await save.click();
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await page.locator('form[data-v5-scene="MK-152"]').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(pending).toBe(1);
  } finally {
    release();
  }
  await expect(
    page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
  ).toBeVisible();
  await expect(page.getByLabel(t.score, { exact: true })).toHaveValue('۸');
  await page.unroute('**/api/client/backend' + path);
  await save.click();
  await expect(page).toHaveURL(new RegExp('/exams/' + exam.id + '/edit$'));
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toEqual({
    order: 1,
    type: 'Descriptive',
    prompt: 'معادله را حل و مراحل را بنویسید.',
    score: 8,
    options: null,
    expectedVersionRowVersion: exam.versionRowVersion,
    attachmentPolicy: {
      attachmentsAllowed: true,
      textRequired: false,
      allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maximumCount: 2,
      maximumTotalBytes: 524288,
    },
  });
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/publish'))).toHaveLength(
    0,
  );
});
test('the actual objective variant keeps four options, rejects duplicate or unreviewed answers and sends no descriptive attachment policy', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision);
  await newForm(page, exam);
  await page.getByRole('switch', { name: t.files, exact: true }).check();
  await (await menu(page))
    .getByLabel(copy.text_36f2e5cc8da2, { exact: true })
    .selectOption('ObjectiveSingleChoice');
  for (let i = 1; i <= 4; i++)
    await page
      .getByLabel(
        copy.text_92d381e9e27f + String(i).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]),
        { exact: true },
      )
      .fill(i === 2 ? 'گزینه یک' : 'گزینه ' + i);
  const save = page.getByRole('button', { name: t.save, exact: true });
  await expect(save).toBeDisabled();
  await page.getByLabel(copy.text_1ac128e79e40, { exact: true }).selectOption('3');
  await page.getByLabel(copy.text_92d381e9e27f + '۱', { exact: true }).fill('گزینه یک');
  await expect(save).toBeDisabled();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) =>
        r.path === api + exam.id + '/questions' && r.method === 'POST',
    ),
  ).toHaveLength(0);
  await page.getByLabel(copy.text_92d381e9e27f + '۲', { exact: true }).fill('گزینه دو');
  await save.click();
  await expect(page).toHaveURL(new RegExp('/exams/' + exam.id + '/edit$'));
  state = await (await request.get(fixture + '/__test__/state')).json();
  const command = state.requests.find(
    (r: { path: string; method: string }) =>
      r.path === api + exam.id + '/questions' && r.method === 'POST',
  ).body;
  expect(command.type).toBe('ObjectiveSingleChoice');
  expect(command.attachmentPolicy).toBeNull();
  expect(command.options).toHaveLength(4);
  expect(command.options.filter((o: { isCorrect: boolean }) => o.isCorrect)).toHaveLength(1);
  expect(command.options[2].isCorrect).toBe(true);
});
test('editing preserves one-byte limits exactly and retains a local draft until a newer question version is explicitly accepted', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam, headers } = await seed(context, session.revision, true, 1);
  const question = exam.questions[0],
    path = api + exam.id + '/questions/' + question.id;
  await page.goto(editPath(exam) + '?question=' + question.id);
  const limits = await policy(page);
  await expect(limits.getByLabel(copy.text_93b036d10054, { exact: true })).toHaveValue(
    '۰.۰۰۰۰۰۰۹۵۳۶۷۴۳۱۶۴۰۶۲۵',
  );
  await limits.getByRole('button', { name: t.done, exact: true }).click();
  await page.getByLabel(t.prompt, { exact: true }).fill('پیش‌نویس محلی حفظ شود');
  const remote = await context.request.patch('/api/client/backend' + path, {
    headers,
    data: {
      order: 1,
      type: 'Descriptive',
      prompt: 'صورت تازهٔ سرور',
      score: 8,
      options: null,
      attachmentPolicy: question.attachmentPolicy,
      expectedVersionRowVersion: exam.versionRowVersion,
      expectedQuestionRowVersion: question.rowVersion,
    },
  });
  expect(remote.ok()).toBeTruthy();
  const fresh: S['ExamEditorDto'] = await remote.json();
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page.getByText(copy.text_78d0088bdedd, { exact: true })).toBeVisible();
  await expect(page.getByLabel(t.prompt, { exact: true })).toHaveValue('پیش‌نویس محلی حفظ شود');
  await expect(page.getByRole('button', { name: t.save, exact: true })).toBeDisabled();
  await page.getByRole('button', { name: copy.text_363bc802fb51, exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: copy.text_c36e75eccc66, exact: true })
    .click();
  await expect(page.getByLabel(t.prompt, { exact: true })).toBeFocused();
  await expect(page.getByLabel(t.prompt, { exact: true })).toHaveValue('صورت تازهٔ سرور');
  await page.getByLabel(t.score, { exact: true }).fill('۸٫۵');
  await page.getByRole('button', { name: t.save, exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/exams/' + exam.id + '/edit$'));
  const state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'PATCH',
  );
  expect(writes).toHaveLength(3);
  expect(writes[2].body.expectedVersionRowVersion).toBe(fresh.versionRowVersion);
  expect(writes[2].body.expectedQuestionRowVersion).toBe(fresh.questions[0].rowVersion);
  expect(writes[2].body.attachmentPolicy.maximumTotalBytes).toBe(1);
  expect(writes[2].body.score).toBe(8.5);
});
test('question removal opens from its real form menu, preserves a cancelled draft and returns focus after the confirmed removal', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision, true);
  const question = exam.questions[0];
  await page.goto(editPath(exam));
  await page.getByRole('link', { name: t.edit + ' ۱', exact: true }).click();
  await (await menu(page)).getByRole('button', { name: t.remove, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.removeTitle, exact: true });
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('button', { name: t.save, exact: true })).toHaveCount(0);
  await captureExactState(
    page,
    ['MK-153'],
    'Native selected question backdrop, real stored prompt and file policy; the menu has closed before the confirmation opens.',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('banner').getByRole('button', { name: copy.v4_more, exact: true }),
  ).toBeFocused();
  await page.getByLabel(t.prompt, { exact: true }).fill('صورت ذخیره‌نشده');
  await (await menu(page)).getByRole('button', { name: t.remove, exact: true }).click();
  await expect(dialog.locator('[data-exam-question-remove-meta]')).toContainText(question.prompt);
  await expect(dialog.locator('[data-exam-question-remove-meta]')).not.toContainText(
    'صورت ذخیره‌نشده',
  );
  await dialog.getByRole('button', { name: copy.text_fa7af603d430, exact: true }).click();
  await expect(page.getByLabel(t.prompt, { exact: true })).toHaveValue('صورت ذخیره‌نشده');
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(state.requests.filter((r: { method: string }) => r.method === 'DELETE')).toHaveLength(0);
  await (await menu(page)).getByRole('button', { name: t.remove, exact: true }).click();
  await dialog.getByRole('button', { name: t.remove, exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/exams/' + exam.id + '/edit$'));
  await expect(page.locator('[data-exam-question-list]')).toBeFocused();
  await expect(page.getByText(question.prompt, { exact: true })).toHaveCount(0);
});
const mismatches: Array<[string, (row: S['ExamEditorDto']) => S['ExamEditorDto']]> = [
  ['identity', (row) => ({ ...row, id: ids.exam })],
  ['organization', (row) => ({ ...row, organizationId: ids.exam })],
  ['class', (row) => ({ ...row, classId: ids.exam })],
  ['version', (row) => ({ ...row, versionId: ids.exam })],
  [
    'policy',
    (row) => ({
      ...row,
      questions: row.questions.map((q) => ({
        ...q,
        attachmentPolicy: { ...q.attachmentPolicy!, maximumCount: 99 },
      })),
    }),
  ],
  [
    'options',
    (row) => ({
      ...row,
      questions: row.questions.map((q) => ({
        ...q,
        options: [{ id: ids.chat, order: 1, text: 'ناهمخوان', isCorrect: true }],
      })),
    }),
  ],
];
for (const [name, mismatch] of mismatches)
  test(
    'a mismatched question ' +
      name +
      ' acknowledgment cannot clear the draft or navigate as success',
    async ({ page, context }) => {
      const session = await login(context, 'Teacher');
      const { exam } = await seed(context, session.revision);
      await newForm(page, exam);
      await page.getByRole('switch', { name: t.files, exact: true }).check();
      await page.route('**/api/client/backend' + api + exam.id + '/questions', async (route) => {
        const response = await route.fetch();
        await route.fulfill({ response, json: mismatch(await response.json()) });
      });
      await page.getByRole('button', { name: t.save, exact: true }).click();
      await expect(
        page.getByRole('alert').and(page.locator(':not(#__next-route-announcer__)')),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/questions\/new$/);
      await expect(page.getByLabel(t.prompt, { exact: true })).toHaveValue(
        'معادله را حل و مراحل را بنویسید.',
      );
      await expect(page.getByText(copy.text_6afc863be80c, { exact: true })).toHaveCount(0);
    },
  );
test('a question from another exam cannot be selected through the local editor query', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const first = await seed(context, session.revision, true),
    second = await seed(context, session.revision, true);
  await page.goto(editPath(first.exam) + '?question=' + second.exam.questions[0].id);
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: t.save, exact: true })).toHaveCount(0);
  const state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter((r: { method: string }) => ['PATCH', 'DELETE'].includes(r.method)),
  ).toHaveLength(0);
});
for (const role of ['Student', 'Parent'] as const)
  test(
    role + ' cannot enter the native question author form',
    async ({ page, context, request }) => {
      const teacher = await login(context, 'Teacher');
      const { exam } = await seed(context, teacher.revision);
      await login(context, role);
      await page.goto('/personal/education/exams/' + exam.id + '/questions/new');
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(page.getByRole('button', { name: t.save, exact: true })).toHaveCount(0);
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (r: { path: string; method: string }) =>
            r.path === api + exam.id + '/questions' && r.method === 'POST',
        ),
      ).toHaveLength(0);
    },
  );
