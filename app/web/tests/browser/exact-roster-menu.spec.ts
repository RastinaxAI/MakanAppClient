import { test, expect, fixture, login, ids } from './test';
import { captureExactState } from './exact-state-capture';
import { v4_more } from '../../src/content/fa';

test('teacher roster keeps search in its menu and the native row confirms an authorized assignment end with retry and focus return', async ({
  page,
  context,
  request,
}) => {
  await request.post(fixture + '/__test__/manager-case', {
    data: { exactV5: true, exactV5TeacherRoster: true },
  });
  await login(context, 'Manager');
  await page.goto(`/personal/education/classes/${ids.class}/members?member=teachers`);
  const rows = page.locator('.v5-list');
  await expect(rows.getByRole('button')).toHaveCount(2);
  await expect(page.getByRole('main').getByRole('textbox')).toHaveCount(0);
  const more = page.getByRole('button', { name: v4_more, exact: true });
  await more.click();
  const menu = page.getByRole('dialog');
  const search = menu.getByRole('textbox', { name: 'جستجو در اعضای کلاس', exact: true });
  await search.fill('امیر');
  await menu.getByRole('button', { name: 'جستجو', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
  await expect(rows.getByRole('button')).toHaveCount(1);
  const member = rows.getByRole('button', { name: 'حذف از کلاس · امیر نظری', exact: true });
  await member.click();
  const confirm = page.getByRole('dialog', { name: 'حذف امیر نظری از کلاس', exact: true });
  await expect(confirm).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(member).toBeFocused();
  const before = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  expect(
    before.filter(
      (row: { method: string; path: string }) => row.method === 'POST' && row.path.endsWith('/end'),
    ),
  ).toHaveLength(0);
  await member.click();
  await request.post(fixture + '/__test__/fault', {
    data: { path: '/end', method: 'POST', status: 503 },
  });
  await confirm.getByRole('button', { name: 'حذف از این کلاس', exact: true }).click();
  await expect(confirm.getByRole('alert')).toBeVisible();
  await captureExactState(
    page,
    ['MK-103'],
    'The real teacher-assignment end remains pending after a failed service response.',
  );
  await confirm.getByRole('button', { name: 'حذف از این کلاس', exact: true }).click();
  await expect(confirm).toHaveCount(0);
  await expect(rows.getByRole('button')).toHaveCount(0);
  const after = (await (await request.get(fixture + '/__test__/state')).json()).requests;
  const writes = after.filter(
    (row: { method: string; path: string }) => row.method === 'POST' && row.path.endsWith('/end'),
  );
  expect(writes).toHaveLength(2);
  expect(writes[0].body).toEqual(writes[1].body);
});
