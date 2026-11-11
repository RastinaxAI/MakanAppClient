import { reviewPath } from './review-output';
import { mkdir } from 'node:fs/promises';
import { test, expect, login, fixture, ids, origin } from './test';
import { aiIntegration as t } from '../../src/content/fa';
import { captureExactState } from './exact-state-capture';
import {
  assistantOptions,
  chooseAssistantPayer,
  assistantTools,
  returnToAssistantQuestion,
} from './assistant-controls';
const sourceId = '00000000-0000-4000-8000-000000001500';
async function enable(request: import('@playwright/test').APIRequestContext, options = {}) {
  expect((await request.post(fixture + '/__test__/ai-integration', { data: options })).ok()).toBe(
    true,
  );
}
async function requests(request: import('@playwright/test').APIRequestContext, path: string) {
  const state = await (await request.get(fixture + '/__test__/state')).json();
  return state.requests.filter(
    (r: { path: string; method: string }) => r.path === path && r.method === 'POST',
  );
}
test('personal chat requires an explicit payer and consumes no request on opening the page', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Personal', false);
  await page.goto('/personal/assistant');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش آزمایشی قرارداد');
  expect(await requests(request, '/api/v1/ai/chat')).toHaveLength(0);
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(t.payerRequired);
  await page.keyboard.press('Escape');
  expect(await requests(request, '/api/v1/ai/chat')).toHaveLength(0);
  await chooseAssistantPayer(page, 'Individual');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toContainText(
    'پاسخ واقعی قرارداد در محیط آزمون',
  );
  const calls = await requests(request, '/api/v1/ai/chat');
  expect(calls).toHaveLength(1);
  expect(calls[0].aiHeaders.payer).toBe('Individual');
  expect(calls[0].body.operationId).toBe(calls[0].aiHeaders.operationId);
  await captureExactState(
    page,
    ['MK-374'],
    'Acknowledged isolated Chat response in the actual Next assistant result view; no live provider or sample product renderer.',
  );
});
test('lost business-AI acknowledgment preserves question, payer, body and operation ID across reload', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { lostAck: true });
  await login(context, 'Personal', false);
  await page.goto('/personal/assistant');
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('همین پرسش پس از پاسخ گم‌شده');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('button', { name: t.retry, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue(
    'همین پرسش پس از پاسخ گم‌شده',
  );
  const options = await assistantOptions(page);
  await expect(options.getByLabel(t.payer, { exact: true })).toHaveValue('Individual');
  await options.getByRole('button', { name: t.done, exact: true }).click();
  expect(await requests(request, '/api/v1/ai/chat')).toHaveLength(1);
  await page.getByRole('button', { name: t.retry, exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  const calls = await requests(request, '/api/v1/ai/chat');
  expect(calls).toHaveLength(2);
  expect(calls[0].body).toEqual(calls[1].body);
  expect(calls[0].aiHeaders).toEqual(calls[1].aiHeaders);
});
test('quota refusal keeps the draft and never switches to another payer or calls AI', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { quotaAllowed: false });
  await login(context, 'Student');
  await page.goto('/personal/assistant');
  await chooseAssistantPayer(page, 'Organization');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('نوشتهٔ حفظ‌شده');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.quota);
  await captureExactState(
    page,
    ['MK-375'],
    'Explicit Organization payer denied by isolated preflight; no AI request or payer switch.',
  );
  await returnToAssistantQuestion(page);
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue('نوشتهٔ حفظ‌شده');
  const options = await assistantOptions(page);
  await expect(options.getByLabel(t.payer, { exact: true })).toHaveValue('Organization');
  await options.getByRole('button', { name: t.done, exact: true }).click();
  expect(await requests(request, '/api/v1/ai/chat')).toHaveLength(0);
});
async function chooseSource(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
) {
  await request.post(fixture + '/__test__/source-ai-ready', { data: { sourceId } });
  await page.getByRole('button', { name: 'انتخاب منابع', exact: true }).click();
  await page
    .getByRole('checkbox', { name: 'انتخاب منبع واقعی منبع شخصی آزمایشی', exact: true })
    .check();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /استفاده از/ })
    .click();
}
test('RAG pins the preflight version and renders only the authorized returned citations', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Student', false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/personal/assistant');
  await chooseSource(page, request);
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('سؤال از این منبع');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toContainText('پاسخ مستند آزمایشی');
  await expect(
    page.locator('[data-assistant-result]').getByRole('link', { name: /^منبع شخصی آزمایشی نسخه/ }),
  ).toHaveAttribute('href', '/personal/resources/' + sourceId);
  const calls = await requests(request, '/api/v1/ai/knowledge/rag/answer');
  expect(calls).toHaveLength(1);
  expect(calls[0].body.sources).toEqual([{ sourceId, version: 1 }]);
  expect(calls[0].aiHeaders).toEqual({});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await mkdir(reviewPath('output/review/integration-6f8edf8'), { recursive: true });
  await page.screenshot({ path: reviewPath('output/review/integration-6f8edf8/rag-mobile.png') });
});
test('foreign citations never appear as a successful answer', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { foreignCitation: ids.class });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant');
  await chooseSource(page, request);
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(t.citationInvalid);
  await captureExactState(
    page,
    ['MK-376'],
    'Untrusted source citation rejected; selected source and question remain available through Back.',
  );
  await expect(page.locator('[data-assistant-result]')).toHaveCount(0);
  await returnToAssistantQuestion(page);
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue('پرسش');
});
test('retrieval uses the registered knowledge route with the same exact source versions', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Student', false);
  await page.goto('/personal/assistant');
  await chooseSource(page, request);
  const options = await assistantOptions(page);
  await options.getByRole('combobox', { name: t.mode, exact: true }).selectOption('retrieve');
  await options.getByRole('button', { name: t.done, exact: true }).click();
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('جستجوی مرتبط');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.locator('[data-assistant-result]')).toContainText('محتوای مرتبط مجاز آزمایشی');
  expect(await requests(request, '/api/v1/ai/knowledge/retrieve')).toHaveLength(1);
  expect(await requests(request, '/api/v1/ai/knowledge/rag/answer')).toHaveLength(0);
});
for (const [role, kind, path] of [
  ['Student', 'analysis', '/api/v1/ai/students/analyze'],
  ['Student', 'plan', '/api/v1/ai/study-plan'],
  ['Student', 'homework', `/api/v1/ai/homeworks/${ids.assignment}/explain`],
  ['Student', 'exam', `/api/v1/ai/exams/${ids.exam}/prepare`],
  ['Teacher', 'teacherClass', `/api/v1/ai/teachers/classes/${ids.class}/summary`],
  ['Teacher', 'activities', `/api/v1/ai/teachers/classes/${ids.class}/activity-suggestions`],
  ['Manager', 'school', '/api/v1/ai/managers/school-summary'],
  ['Manager', 'managerClass', `/api/v1/ai/managers/classes/${ids.class}/insight`],
] as const)
  test(`${role} ${kind} uses the active workspace and the exact published AI operation`, async ({
    page,
    context,
    request,
  }) => {
    await enable(request);
    await login(context, role);
    await page.goto('/personal/assistant');
    await assistantTools(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox', { name: t.operation, exact: true }).selectOption(kind);
    if (['homework', 'teacherClass', 'activities', 'managerClass'].includes(kind))
      await dialog.getByRole('combobox', { name: t.class, exact: true }).selectOption(ids.class);
    if (kind === 'homework') {
      await dialog
        .getByRole('combobox', { name: t.assignment, exact: true })
        .selectOption(ids.assignment);
      await dialog.getByLabel(t.question, { exact: true }).fill('روش حل مسئله چیست؟');
    }
    if (kind === 'exam')
      await dialog.getByRole('combobox', { name: t.exam, exact: true }).selectOption(ids.exam);
    if (kind === 'plan')
      await dialog.getByLabel(t.goals, { exact: true }).fill('مرور درس\nحل تمرین');
    if (kind === 'activities')
      await dialog.getByLabel(t.objective, { exact: true }).fill('تمرین گروهی');
    await dialog.getByLabel(t.payer, { exact: true }).selectOption('Organization');
    await dialog.getByRole('button', { name: t.send, exact: true }).click();
    await expect(dialog.locator('[data-assistant-result]')).toBeVisible();
    const calls = await requests(request, path);
    expect(calls).toHaveLength(1);
    expect(calls[0].aiHeaders.operationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(calls[0].aiHeaders.payer).toBe('Organization');
  });
test('parent AI uses the acknowledged selected child and clears the earlier response on child change', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/parent-case', { data: {} });
  await enable(request);
  await login(context, 'Parent');
  await page.goto('/personal/assistant');
  await assistantTools(page);
  await page
    .getByRole('dialog')
    .getByLabel('انتخاب فرزند', { exact: true })
    .selectOption('00000000-0000-4000-8000-000000000501');
  // Selection remounts the workspace from the server-confirmed child context.
  await assistantTools(page);
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(t.payer, { exact: true }).selectOption('Organization');
  await dialog.getByRole('button', { name: t.send, exact: true }).click();
  await expect(dialog.locator('[data-assistant-result]')).toContainText(
    'خلاصهٔ مجاز فرزند انتخاب‌شده',
  );
  expect(await requests(request, '/api/v1/ai/parents/child-summary')).toHaveLength(1);
  await dialog
    .getByLabel('انتخاب فرزند', { exact: true })
    .selectOption('00000000-0000-4000-8000-000000000502');
  await expect(page.locator('[data-assistant-result]')).toHaveCount(0);
});
test('source lifecycle shows server status and only sends the selected version after explicit confirmation', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Student', false);
  await page.goto('/personal/resources/' + sourceId + '?view=knowledge');
  const region = page.getByRole('region', { name: t.knowledge, exact: true });
  await expect(region.getByRole('status')).toContainText('آماده‌سازی شروع نشده');
  const path = `/api/v1/sources/${sourceId}/versions/1/knowledge/ingest`;
  expect(await requests(request, path)).toHaveLength(0);
  await region.getByLabel(t.reason, { exact: true }).fill('آماده‌سازی منبع انتخابی');
  await region.getByLabel(t.payer, { exact: true }).selectOption('Individual');
  await region.getByRole('button', { name: t.ingest, exact: true }).click();
  expect(await requests(request, path)).toHaveLength(0);
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(region.getByRole('status').first()).toContainText('در صف آماده‌سازی');
  const calls = await requests(request, path);
  expect(calls).toHaveLength(1);
  expect(calls[0].body).toMatchObject({
    expectedVersion: 'opaque-source-0',
    reason: 'آماده‌سازی منبع انتخابی',
    payer: 'Individual',
  });
});
test('the bounded BFF keeps internal knowledge and owner APIs closed while accepting the new public contract', async ({
  context,
}) => {
  const state = await login(context, 'Personal', false);
  for (const path of ['/api/v1/knowledge/retrieve', '/api/admin/v1/ai/status']) {
    const r = await context.request.post(origin + '/api/client/backend' + path, {
      headers: { Origin: origin, 'X-Makan-Context': state.revision },
      data: {},
    });
    expect(r.status()).toBe(404);
  }
});

test('rate limiting honors Retry-After and sends no automatic AI retry', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Personal', false);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/ai/chat', method: 'POST', status: 429, retryAfter: 3 },
  });
  await page.goto('/personal/assistant');
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش محدودشده');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  const retry = page.getByRole('button', { name: t.retry, exact: true });
  await expect(retry).toBeDisabled();
  await expect(retry).toBeEnabled({ timeout: 8000 });
  expect(await requests(request, '/api/v1/ai/chat')).toHaveLength(1);
  await retry.click();
  await expect(page.locator('[data-assistant-result]')).toBeVisible();
  const calls = await requests(request, '/api/v1/ai/chat');
  expect(calls).toHaveLength(2);
  expect(calls[0].body).toEqual(calls[1].body);
});

test('a completed RAG replay remains a conflict after a lost answer and never becomes fabricated success', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { lostAck: true });
  await login(context, 'Student', false);
  await page.goto('/personal/assistant');
  await chooseSource(page, request);
  await chooseAssistantPayer(page, 'Individual');
  await page.getByLabel('سؤال از دستیار', { exact: true }).fill('پرسش مستند با پاسخ گم‌شده');
  await page.getByRole('button', { name: 'ارسال سؤال', exact: true }).click();
  await expect(page.getByRole('button', { name: t.retry, exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: t.retry, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.locator('[data-assistant-result]')).toHaveCount(0);
  await returnToAssistantQuestion(page);
  await expect(page.getByLabel('سؤال از دستیار', { exact: true })).toHaveValue(
    'پرسش مستند با پاسخ گم‌شده',
  );
  const calls = await requests(request, '/api/v1/ai/knowledge/rag/answer');
  expect(calls).toHaveLength(2);
  expect(calls[0].body).toEqual(calls[1].body);
});

for (const [action, state] of [
  ['reindex', 'ReindexRequired'],
  ['supersede', 'Ready'],
  ['delete', 'Ready'],
] as const)
  test(`source ${action} uses its registered lifecycle operation and preserves source files`, async ({
    page,
    context,
    request,
  }) => {
    await enable(request, { knowledgeState: state });
    await login(context, 'Student', false);
    await page.goto('/personal/resources/' + sourceId + '?view=knowledge');
    const region = page.getByRole('region', { name: t.knowledge, exact: true });
    await expect(region.getByRole('status')).toContainText(t.knowledgeStates[state]);
    await region.getByLabel(t.reason, { exact: true }).fill('بازبینی نسخهٔ انتخابی');
    await region.getByRole('button', { name: t[action], exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true }).click();
    const result =
      action === 'delete' ? 'Deleted' : action === 'supersede' ? 'Superseded' : 'Queued';
    await expect(region.getByRole('status').first()).toContainText(t.knowledgeStates[result]);
    expect(
      await requests(request, `/api/v1/sources/${sourceId}/versions/1/knowledge/${action}`),
    ).toHaveLength(1);
    const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
    expect(
      calls.some(
        (r: { path: string; method: string }) =>
          r.path.startsWith('/api/v1/files/') && r.method === 'DELETE',
      ),
    ).toBe(false);
  });

test('a read-only class source offers status without granting writer lifecycle controls', async ({
  page,
  context,
  request,
}) => {
  await enable(request, { knowledgeState: 'Ready' });
  await login(context, 'Student');
  await page.goto('/personal/resources/00000000-0000-4000-8000-000000001501?view=knowledge');
  const region = page.getByRole('region', { name: t.knowledge, exact: true });
  await expect(region.getByRole('status')).toContainText(t.knowledgeStates.Ready);
  await expect(region.getByRole('button', { name: t.ingest, exact: true })).toHaveCount(0);
  await expect(region.getByRole('button', { name: t.delete, exact: true })).toHaveCount(0);
});

test('source preparation respects Retry-After while preserving the exact versioned command', async ({
  page,
  context,
  request,
}) => {
  await enable(request);
  await login(context, 'Student', false);
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/knowledge/ingest', method: 'POST', status: 429, retryAfter: 3 },
  });
  await page.goto('/personal/resources/' + sourceId + '?view=knowledge');
  const region = page.getByRole('region', { name: t.knowledge, exact: true });
  await region.getByLabel(t.reason, { exact: true }).fill('پردازش با همان قصد');
  await region.getByRole('button', { name: t.ingest, exact: true }).click();
  const confirm = page.getByRole('dialog').getByRole('button', { name: 'تأیید', exact: true });
  const response = page.waitForResponse(
    (r) => r.url().endsWith('/knowledge/ingest') && r.status() === 429,
  );
  await confirm.click();
  await response;
  await expect(confirm).toBeDisabled();
  await expect(confirm).toBeEnabled({ timeout: 8000 });
  const path = `/api/v1/sources/${sourceId}/versions/1/knowledge/ingest`;
  expect(await requests(request, path)).toHaveLength(1);
  await confirm.click();
  await expect(region.getByRole('status').first()).toContainText(t.knowledgeStates.Queued);
  const calls = await requests(request, path);
  expect(calls).toHaveLength(2);
  expect(calls[0].body).toEqual(calls[1].body);
});
