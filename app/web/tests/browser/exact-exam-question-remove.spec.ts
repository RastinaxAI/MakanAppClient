import { test, expect, fixture, login, ids, origin } from './test';
import type { BrowserContext } from '@playwright/test';
import type { components } from '../../src/generated/api/schema';
import * as copy from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
type Exam = components['schemas']['ExamEditorDto'];
const t = copy.v5ExamQuestion;
const api = '/api/v1/academic/exams/';
async function seed(context: BrowserContext, revision: string) {
  const headers = { Origin: origin, 'X-Makan-Context': revision };
  const response = await context.request.post(
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
  expect(response.status()).toBe(201);
  let exam: Exam = await response.json();
  for (const [i, prompt] of ['پرسش یک', 'پرسش دو', 'معادله را حل و مراحل را بنویسید.'].entries()) {
    const added = await context.request.post('/api/client/backend' + api + exam.id + '/questions', {
      headers,
      data: {
        order: i + 1,
        type: 'Descriptive',
        prompt,
        score: i === 2 ? 8 : 6,
        attachmentPolicy: null,
        options: null,
        expectedVersionRowVersion: exam.versionRowVersion,
      },
    });
    expect(added.ok()).toBeTruthy();
    exam = await added.json();
  }
  return { exam, headers };
}
test('question removal requires confirmation, traps and restores focus, retains a rejected request and accepts only the versioned server 204', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam } = await seed(context, session.revision);
  const question = exam.questions[2],
    path = api + exam.id + '/questions/' + question.id;
  await page.goto('/personal/education/exams/' + exam.id + '/edit');
  const trigger = page.getByRole('button', { name: t.remove + ' ۳', exact: true });
  const dialog = page.getByRole('dialog', { name: t.removeTitle, exact: true });
  await trigger.click();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  expect(
    state.requests.filter(
      (r: { path: string; method: string }) => r.path === path && r.method === 'DELETE',
    ),
  ).toHaveLength(0);
  await trigger.click();
  await captureExactState(
    page,
    ['MK-153'],
    'Actual organization draft question removal; metadata identifies the stored question, and cancel/Escape have made no DELETE request.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path, method: 'DELETE', status: 503 },
  });
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
  try {
    await dialog.getByRole('button', { name: t.remove, exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: copy.text_fc2867f048ea, exact: true }),
    ).toBeDisabled();
    expect(pending).toBe(1);
  } finally {
    release();
  }
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(
    page.locator('[data-exam-question-list]').getByText(question.prompt, { exact: true }),
  ).toBeVisible();
  await page.unroute('**/api/client/backend' + path);
  await dialog.getByRole('button', { name: t.remove, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveCount(0);
  await expect(page.locator('[data-exam-question-list]')).toBeFocused();
  await expect(
    page.locator('[data-exam-question-list]').getByText('پرسش یک', { exact: true }),
  ).toBeVisible();
  state = await (await request.get(fixture + '/__test__/state')).json();
  const writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'DELETE',
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
  expect(writes[1].body).toEqual({
    expectedVersionRowVersion: exam.versionRowVersion,
    expectedQuestionRowVersion: question.rowVersion,
  });
  expect(state.requests.filter((r: { path: string }) => r.path.endsWith('/publish'))).toHaveLength(
    0,
  );
});
test('a concurrent draft change rejects the frozen removal version; fetching the new version cannot silently delete the question', async ({
  page,
  context,
  request,
}) => {
  const session = await login(context, 'Teacher');
  const { exam, headers } = await seed(context, session.revision);
  const question = exam.questions[2],
    path = api + exam.id + '/questions/' + question.id;
  // Exercise an unseen server-side conflict, independently of polling timing.
  // The separate stale-snapshot checks cover a version the UI already knows.
  let holdReadModel = true;
  await page.route('**/api/client/backend' + api + exam.id + '/editor', async (route) => {
    if (!holdReadModel) return route.continue();
    await route.fulfill({ status: 200, json: exam });
  });
  await page.goto('/personal/education/exams/' + exam.id + '/edit');
  const trigger = page.getByRole('button', { name: t.remove + ' ۳', exact: true });
  await trigger.click();
  const remote = await context.request.delete(
    '/api/client/backend' + api + exam.id + '/questions/' + exam.questions[0].id,
    {
      headers,
      data: {
        expectedVersionRowVersion: exam.versionRowVersion,
        expectedQuestionRowVersion: exam.questions[0].rowVersion,
      },
    },
  );
  expect(remote.status()).toBe(204);
  const dialog = page.getByRole('dialog', { name: t.removeTitle, exact: true });
  await dialog.getByRole('button', { name: t.remove, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByText(question.prompt, { exact: false })).toBeVisible();
  holdReadModel = false;
  await dialog.getByRole('button', { name: t.latest, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeVisible();
  let state = await (await request.get(fixture + '/__test__/state')).json();
  let writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'DELETE',
  );
  expect(writes).toHaveLength(1);
  expect(writes[0].body.expectedVersionRowVersion).toBe(exam.versionRowVersion);
  await trigger.click();
  await dialog.getByRole('button', { name: t.remove, exact: true }).click();
  await expect(trigger).toHaveCount(0);
  state = await (await request.get(fixture + '/__test__/state')).json();
  writes = state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'DELETE',
  );
  expect(writes).toHaveLength(2);
  expect(writes[1].body.expectedVersionRowVersion).not.toBe(exam.versionRowVersion);
});
test('published exam questions expose no removal control', async ({ page, context }) => {
  const session = await login(context, 'Teacher');
  const { exam, headers } = await seed(context, session.revision);
  const published = await context.request.post('/api/client/backend' + api + exam.id + '/publish', {
    headers,
    data: {
      expectedExamRowVersion: exam.examRowVersion,
      expectedVersionRowVersion: exam.versionRowVersion,
    },
  });
  expect(published.ok()).toBeTruthy();
  await page.goto('/personal/education/exams/' + exam.id + '/edit');
  await expect(page.getByText(exam.questions[2].prompt, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^حذف پرسش/ })).toHaveCount(0);
});
for (const [name, mismatch] of [
  ['identity', { id: ids.exam }],
  ['organization', { organizationId: ids.exam }],
] as const)
  test('a foreign exam ' + name + ' cannot expose question removal', async ({ page, context }) => {
    const session = await login(context, 'Teacher');
    const { exam } = await seed(context, session.revision);
    await page.route('**/api/client/backend' + api + exam.id + '/editor', async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, json: { ...(await response.json()), ...mismatch } });
    });
    await page.goto('/personal/education/exams/' + exam.id + '/edit');
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: /^حذف پرسش/ })).toHaveCount(0);
    await page.unrouteAll({ behavior: 'wait' });
  });
for (const role of ['Student', 'Parent'] as const)
  test(
    role + ' cannot enter the author removal UI or delete a question',
    async ({ page, context }) => {
      const teacher = await login(context, 'Teacher');
      const { exam } = await seed(context, teacher.revision);
      const session = await login(context, role);
      await page.goto('/personal/education/exams/' + exam.id + '/edit');
      if (role === 'Parent')
        await expect(
          page.getByRole('heading', { name: copy.text_14130edb2ced, exact: true }),
        ).toBeVisible();
      else await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
      await expect(page.getByRole('button', { name: /^حذف پرسش/ })).toHaveCount(0);
      const response = await context.request.delete(
        '/api/client/backend' + api + exam.id + '/questions/' + exam.questions[0].id,
        {
          headers: { Origin: origin, 'X-Makan-Context': session.revision },
          data: {
            expectedVersionRowVersion: exam.versionRowVersion,
            expectedQuestionRowVersion: exam.questions[0].rowVersion,
          },
        },
      );
      expect(response.status()).toBe(403);
    },
  );
for (const status of [200, 202])
  test(
    'HTTP ' + status + ' cannot confirm question removal; only a subsequent real 204 removes it',
    async ({ page, context, request }) => {
      const session = await login(context, 'Teacher');
      const { exam } = await seed(context, session.revision);
      const path = api + exam.id + '/questions/' + exam.questions[2].id;
      await page.goto('/personal/education/exams/' + exam.id + '/edit');
      const trigger = page.getByRole('button', { name: t.remove + ' ۳', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: t.removeTitle, exact: true });
      await page.route('**/api/client/backend' + path, (route) =>
        route.fulfill(
          status === 200
            ? { status, contentType: 'application/json', body: JSON.stringify({ accepted: true }) }
            : { status, body: '' },
        ),
      );
      await dialog.getByRole('button', { name: t.remove, exact: true }).click();
      await expect(dialog.getByRole('alert')).toBeVisible();
      await expect(
        page
          .locator('[data-exam-question-list]')
          .getByText(exam.questions[2].prompt, { exact: true }),
      ).toBeVisible();
      const state = await (await request.get(fixture + '/__test__/state')).json();
      expect(
        state.requests.filter(
          (r: { path: string; method: string }) => r.path === path && r.method === 'DELETE',
        ),
      ).toHaveLength(0);
      await page.unroute('**/api/client/backend' + path);
      await dialog.getByRole('button', { name: t.remove, exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toHaveCount(0);
    },
  );
