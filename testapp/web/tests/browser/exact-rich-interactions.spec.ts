import { test, expect, fixture, login } from './test';
import { captureExactState } from './exact-state-capture';
import { v4Text as t, text_3ee0bcbbe619 } from '../../src/content/fa';

const id = '00000000-0000-4000-8000-000000000950';
const base = '/personal/messages/' + id;
const capabilities = { canPublish: true, canManageMessages: true };

async function more(page: import('@playwright/test').Page) {
  await page.getByRole('banner').getByRole('button', { name: t.more, exact: true }).click();
  return page.getByRole('dialog', { name: t.more, exact: true });
}

test('poll secondary controls preserve distinct options and native switches across resize, keyboard use and reload', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: capabilities },
  });
  await login(context, 'Teacher', false);
  await page.goto(base + '/poll-new');
  await page.getByLabel(t.question, { exact: true }).fill('زمان جلسه');
  await page.getByLabel(t.option + ' ۱', { exact: true }).fill('شنبه / یکشنبه');
  await page.getByLabel(t.option + ' ۲', { exact: true }).fill('دوشنبه');
  await (await more(page)).getByRole('button', { name: t.addOption, exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel(t.option + ' ۳', { exact: true }).fill('سه‌شنبه');
  await (await more(page))
    .getByRole('button', { name: t.remove + ' ' + t.option + ' ۲', exact: true })
    .click();
  await expect(page.getByLabel(t.option + ' ۲', { exact: true })).toHaveValue('سه‌شنبه');
  const multiple = page.getByRole('switch', { name: t.multiple, exact: true });
  await multiple.check();
  const anonymous = page.getByRole('switch', { name: t.anonymous, exact: true });
  await anonymous.focus();
  await anonymous.press('Space');
  await expect(anonymous).not.toBeChecked();
  await page.setViewportSize({ width: 320, height: 500 });
  await page.reload();
  await expect(multiple).toBeChecked();
  await expect(anonymous).not.toBeChecked();
  await expect(page.getByLabel(t.option + ' ۱', { exact: true })).toHaveValue('شنبه / یکشنبه');
  await page.getByRole('button', { name: t.publishPoll, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(id + '$'));
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const body = calls.find(
    (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/polls'),
  ).body;
  expect(body.options).toEqual(['شنبه / یکشنبه', 'سه‌شنبه']);
  expect(body.allowsMultipleAnswers).toBe(true);
  expect(body.isAnonymous).toBe(false);
});

test('quiz summary edits actual array values without parsing slashes, preserves its draft after failure, and a member answer and administrator close use acknowledged versions', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: capabilities },
  });
  await login(context, 'Teacher', false);
  await page.goto(base + '/quiz-new');
  await page.getByLabel(t.question, { exact: true }).fill('کدام روش درست است؟');
  const summary = page.getByRole('button', { name: t.options, exact: true });
  await summary.focus();
  await summary.press('Enter');
  const options = page.getByRole('dialog', { name: t.options, exact: true });
  await options.getByLabel(t.option + ' ۱', { exact: true }).fill('تجزیه / ضرب');
  await options.getByLabel(t.option + ' ۲', { exact: true }).fill('حذف جمله ثابت');
  await page.keyboard.press('Escape');
  await expect(summary).toBeFocused();
  await expect(summary).toHaveValue('تجزیه / ضرب / حذف جمله ثابت');
  await page.getByLabel(t.correctOption, { exact: true }).selectOption('1');
  await page.getByLabel(t.explanation, { exact: true }).fill('حاصل‌ضرب دو عبارت صفر است.');
  await captureExactState(
    page,
    ['MK-245'],
    'Admin creation; each option remains a separate array item, including literal slash characters.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/polls', method: 'POST', status: 503 },
  });
  await page.getByRole('button', { name: t.publishQuiz, exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.reload();
  await expect(summary).toHaveValue('تجزیه / ضرب / حذف جمله ثابت');
  await page.getByRole('button', { name: t.publishQuiz, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(id + '$'));
  let calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const posts = calls.filter(
    (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/polls'),
  );
  expect(posts).toHaveLength(2);
  expect(posts[0].body).toEqual(posts[1].body);
  expect(posts[1].body.options).toEqual(['تجزیه / ضرب', 'حذف جمله ثابت']);
  expect(posts[1].body.correctOptionNumber).toBe(1);
  expect(posts[1].body.isQuiz).toBe(true);
  await login(context, 'Manager', false);
  await page.goto(base);
  await page.getByRole('radio', { name: /^تجزیه \/ ضرب/ }).check();
  await page.getByRole('button', { name: t.vote, exact: true }).click();
  await expect(page.getByRole('radio', { name: /^تجزیه \/ ضرب/ })).toBeChecked();
  await captureExactState(
    page,
    ['MK-246'],
    'Active local Member after an acknowledged quiz vote; organizational Manager profile grants no conversation administration.',
  );
  await login(context, 'Teacher', false);
  await page.goto(base);
  await page.getByRole('button', { name: t.closePoll, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.closePoll, exact: true });
  await captureExactState(
    page,
    ['MK-247'],
    'Admin confirmation before the close command; no closed state is shown before the response.',
  );
  await dialog.getByRole('button', { name: 'تأیید', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: t.vote, exact: true })).toHaveCount(0);
});

test('checklist definition dialog keeps its version and draft after failure and renders the acknowledged definition response', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, adminCapabilities: capabilities },
  });
  await login(context, 'Teacher', false);
  await page.goto(base + '/checklist-new');
  await page.getByLabel(t.title, { exact: true }).fill('آماده‌سازی جلسه');
  await page.getByLabel(t.item + ' ۱', { exact: true }).fill('خواندن جزوه');
  await page.getByLabel(t.item + ' ۲', { exact: true }).fill('فرستادن پرسش‌ها');
  await (await more(page)).getByRole('button', { name: t.addItem, exact: true }).click();
  await page.getByLabel(t.item + ' ۳', { exact: true }).fill('مورد اضافه');
  await (await more(page))
    .getByRole('button', { name: t.remove + ' ' + t.item + ' ۳', exact: true })
    .click();
  await page.getByRole('button', { name: t.publishChecklist, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(id + '$'));
  await login(context, 'Manager', false);
  await page.goto(base);
  const checked = page.getByRole('checkbox', { name: 'خواندن جزوه', exact: true });
  await checked.click();
  await expect(checked).toBeChecked();
  await captureExactState(
    page,
    ['MK-249'],
    'Active local Member; only the acknowledged item state is checked.',
  );
  await login(context, 'Teacher', false);
  await page.goto(base);
  const edit = page.getByRole('button', { name: t.editChecklist, exact: true });
  await edit.click();
  const dialog = page.getByRole('dialog', { name: t.editChecklist, exact: true });
  await dialog.getByLabel(t.item + ' ۲', { exact: true }).fill('فرستادن پرسش تازه');
  await captureExactState(
    page,
    ['MK-250'],
    'Admin editing the definition with a captured baseline version; member item state is a separate command.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/checklist', method: 'PUT', status: 503 },
  });
  await dialog.getByRole('button', { name: text_3ee0bcbbe619, exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel(t.item + ' ۲', { exact: true })).toHaveValue('فرستادن پرسش تازه');
  await dialog.getByRole('button', { name: text_3ee0bcbbe619, exact: true }).click();
  await expect(dialog).toHaveCount(0);
  // The existing fixture resets checks in its definition response. The client must
  // render that response; this fixture behavior is not a claim about the live service.
  await expect(checked).not.toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'فرستادن پرسش تازه', exact: true }),
  ).toBeVisible();
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const edits = calls.filter(
    (r: { method: string; path: string }) => r.method === 'PUT' && r.path.endsWith('/checklist'),
  );
  expect(edits).toHaveLength(2);
  expect(edits[0].body).toEqual(edits[1].body);
  expect(
    edits[0].body.items.every(
      (item: object) => !Object.hasOwn(item, 'isChecked') && !Object.hasOwn(item, 'stateVersion'),
    ),
  ).toBe(true);
});

test('scheduled messages keep returned rows visible and cancel only after an explicit acknowledged command', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/rich-messaging', {
    data: { exactV5: true, referenceScheduled: true, adminCapabilities: capabilities },
  });
  await login(context, 'Teacher', false);
  await page.goto(base + '/scheduled');
  await expect(page.locator('.v5-list').getByText('جزوه هفته بعد', { exact: true })).toBeVisible();
  await expect(page.locator('.rx-bottom-actions')).toHaveCount(0);
  await captureExactState(
    page,
    ['MK-252'],
    'Admin; two actual ScheduledMessageResult records, without a fabricated published state.',
  );
  await (await more(page)).getByRole('button', { name: t.schedule, exact: true }).click();
  await page.getByLabel(t.text, { exact: true }).fill('یادآوری آزمون');
  const at = page.getByLabel(t.scheduleAt, { exact: true });
  await at.fill('۱۴۰۶/۰۱/۱۰ ۱۰:۳۰');
  await at.blur();
  await captureExactState(
    page,
    ['MK-251'],
    'Admin draft with a real Jalali input and local-time conversion; no schedule command yet.',
  );
  await page.getByRole('button', { name: t.scheduleSubmit, exact: true }).click();
  const row = page.locator('.v5-row').filter({ hasText: 'یادآوری آزمون' });
  await row.getByRole('button', { name: t.cancel, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: t.cancelSchedule, exact: true });
  await captureExactState(
    page,
    ['MK-253'],
    'Admin cancellation confirmation; the queued item has not yet been changed.',
  );
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/cancel', method: 'POST', status: 503 },
  });
  await dialog.getByRole('button', { name: t.cancel, exact: true }).last().click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: t.cancel, exact: true }).last().click();
  await expect(dialog).toHaveCount(0);
  await expect(row.getByRole('button', { name: t.cancel, exact: true })).toHaveCount(0);
  const calls = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const cancels = calls.filter(
    (r: { method: string; path: string }) => r.method === 'POST' && r.path.endsWith('/cancel'),
  );
  expect(cancels).toHaveLength(2);
  expect(cancels[0].body).toEqual(cancels[1].body);
});
