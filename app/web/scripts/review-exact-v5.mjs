// Screenshots of real routes against isolated fixture data. The atlas is only a reference.
// Start scripts/v4-review-server.mjs and a static reference server on :3161 first.
import fs from 'node:fs/promises';
import { captureReference } from './lib/v5-reference.mjs';
import { collectViewportGeometry } from './lib/v5-geometry.mjs';
import { chromium, expect } from '@playwright/test';
import { familyCases } from './exact-v5-cases.mjs';
import { observeConversationRoles } from './exact-conversation-evidence.mjs';
import { sessionReference } from '../tests/fixtures/session-reference.mjs';
import { attendanceReference } from '../tests/fixtures/attendance-reference.mjs';
import { mockPushBrowser } from '../tests/fixtures/push-browser.mjs';
const phase = process.argv[2] || 'after';
if (!['before', 'after', 'reference'].includes(phase)) throw Error('Unknown review phase');
const productBuildId =
  phase === 'reference' ? undefined : (await fs.readFile('.next/BUILD_ID', 'utf8')).trim();
const origin = process.env.EXACT_REVIEW_ORIGIN || 'http://127.0.0.1:3158';
const fixture = process.env.EXACT_REVIEW_FIXTURE || 'http://127.0.0.1:3458';
for (const address of [origin, fixture]) {
  const url = new URL(address);
  if (
    url.protocol !== 'http:' ||
    url.hostname !== '127.0.0.1' ||
    url.origin !== address ||
    !url.port
  )
    throw Error('Review endpoints must be explicit loopback HTTP origins.');
}
const reference = 'http://127.0.0.1:3161/MakanApp_Responsive_Design_FA_v5.html';
const out =
  process.env.EXACT_OUTPUT_DIR ||
  `output/review/exact-v1/${phase}${process.env.EXACT_SHORT ? (process.env.EXACT_LARGE ? '-short-large' : '-short') : process.env.EXACT_LARGE ? '-large' : process.env.EXACT_BOUNDARIES ? '-boundaries' : ''}`;
if (!out.startsWith('output/review/exact-v1/') || out.split('/').includes('..'))
  throw Error('Review output must remain inside the exact-v1 evidence directory.');
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const classPath = '/personal/education/classes/' + uuid(2);
const chatPath = '/personal/messages/' + uuid(9);
const independent = '/personal/extracurricular/classes/' + uuid(1800);
const coreCases = [
  { key: 'phone', scenarios: ['MK-02'], route: '/enter', prepare: 'phone' },
  { key: 'otp', scenarios: ['MK-03'], route: '/enter', prepare: 'otp' },
  {
    key: 'class-settings',
    scenarios: ['MK-95'],
    route: classPath + '?tab=settings',
    role: 'Manager',
    school: true,
    seed: 'vnext',
    seedData: { exactV5: true },
    prepare: 'class-settings',
  },
  {
    key: 'classes',
    scenarios: ['MK-455'],
    route: '/personal/education/classes',
    role: 'Manager',
    school: true,
    seed: 'manager-case',
    seedData: { exactV5: true },
  },
  {
    key: 'direct-chat',
    scenarios: ['MK-179'],
    route: chatPath,
    role: 'Student',
    seed: 'design',
    seedData: { exactV5: true },
  },
  {
    key: 'class-request',
    scenarios: ['MK-58'],
    route: '/personal/extracurricular/requests/new?step=details',
    role: 'Personal',
    seed: 'personal-class',
    prepare: 'class-request',
    focus: 'class-title',
  },
  {
    key: 'exam-editor',
    scenarios: [],
    proposal: 'MK-82',
    route: independent + '/exams/' + uuid(1806) + '/edit',
    role: 'Personal',
    seed: 'personal-class',
    seedData: { draft: true },
  },
  {
    key: 'large-classes',
    scenarios: ['RX-004'],
    route: '/personal/education/classes',
    role: 'Manager',
    school: true,
    seed: 'manager-case',
    large: true,
  },
];
const cases = process.env.EXACT_ALL_REFERENCES
  ? JSON.parse(await fs.readFile('design/responsive-reference.json', 'utf8'))
      .screens.filter((s) => s.scope === 'client')
      .map((s) => ({ key: s.scenario_id, scenarios: [s.scenario_id], route: s.route }))
  : process.env.EXACT_FAMILIES
    ? [...coreCases, ...familyCases]
    : coreCases;
const wanted = process.env.EXACT_CASES?.split(',');
const viewports = (
  process.env.EXACT_BOUNDARIES
    ? [320, 360, 390, 430, 768, 834, 1024, 1194, 1280, 1440, 1920].map((w) => [
        w,
        w < 768 ? 844 : w < 1200 ? 1112 : 1000,
        'light',
      ])
    : [
        [390, 844, 'light'],
        [834, 1112, 'light'],
        [1440, 1000, 'light'],
        [390, 844, 'dark'],
        [834, 1112, 'dark'],
        [1440, 1000, 'dark'],
      ]
).map(([width, height, theme]) => [width, process.env.EXACT_SHORT ? 400 : height, theme]);
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  headless: true,
});
const results = [];
const previous = wanted
  ? JSON.parse(await fs.readFile(out + '/results.json', 'utf8').catch(() => '[]'))
  : [];

async function seedAndLogin(context, item) {
  const reset = await context.request.post(fixture + '/__test__/reset');
  if (!reset.ok()) throw Error('Fixture reset failed');
  if (item.seed) {
    const response = await context.request.post(fixture + '/__test__/' + item.seed, {
      data: item.seedData || {},
    });
    if (!response.ok()) throw Error('Fixture seed failed: ' + item.seed);
  }
  if (item.pushPermission && phase !== 'before') {
    const response = await context.request.post(fixture + '/__test__/notification-devices', {
      data: {},
    });
    if (!response.ok()) throw Error('Notification-device fixture seed failed');
  }
  if (/^session-(detail|edit|cancel|complete)-reference$/.test(item.prepare ?? '')) {
    const response = await context.request.post(fixture + '/__test__/education-case', {
      data: sessionReference(),
    });
    if (!response.ok()) throw Error('Session reference fixture failed');
    const official = await context.request.post(fixture + '/__test__/official-spaces', {
      data: {},
    });
    if (!official.ok()) throw Error('Official session fixture failed');
  }
  if (
    [
      'attendance-reference',
      'attendance-correct-reference',
      'my-attendance-reference',
      'attendance-note-reference',
    ].includes(item.prepare)
  ) {
    const response = await context.request.post(fixture + '/__test__/education-case', {
      data: attendanceReference({ count: item.seedData?.attendanceRosterCount ?? 3 }),
    });
    if (!response.ok()) throw Error('Attendance reference fixture failed');
  }
  if (item.fault) {
    const fault = await context.request.post(fixture + '/__test__/fault', { data: item.fault });
    if (!fault.ok()) throw Error('Fixture fault configuration failed');
  }
  if (!item.role) return;
  const phoneNumber = {
    Student: '09120000101',
    Teacher: '09120000102',
    Parent: '09120000103',
    Manager: '09120000104',
    Personal: '09120000199',
  }[item.role];
  const headers = { Origin: origin };
  const challenge = await context.request.post(origin + '/api/client/auth/challenge', {
    headers,
    data: { phoneNumber },
  });
  if (challenge.status() !== 202) throw Error('Fixture OTP request failed');
  const verify = await context.request.post(origin + '/api/client/auth/verify', {
    headers,
    data: {
      phoneNumber,
      challengeId: (await challenge.json()).challengeId,
      code: '123456',
      deviceName: 'Isolated exact V5 review',
    },
  });
  if (!verify.ok()) throw Error('Fixture login failed');
  if (!item.school) return;
  const session = await (await context.request.get(origin + '/api/client/session')).json();
  const spaces = await (
    await context.request.get(origin + '/api/client/backend/api/v1/workspaces/me', {
      headers: { 'X-Makan-Context': session.revision },
    })
  ).json();
  const chosen = spaces.find((s) => s.role === item.role);
  if (!chosen) throw Error('Fixture role is missing');
  const selected = await context.request.post(
    origin + '/api/client/backend/api/v1/workspaces/select',
    {
      headers: { ...headers, 'X-Makan-Context': session.revision },
      data: { workspaceType: 'Organization', membershipId: chosen.membershipId, role: chosen.role },
    },
  );
  if (!selected.ok()) throw Error('Fixture workspace selection failed');
}

async function seedQuestionExam(page, count) {
  const session = await (await page.context().request.get(origin + '/api/client/session')).json();
  const headers = { Origin: origin, 'X-Makan-Context': session.revision };
  const response = await page
    .context()
    .request.post(origin + '/api/client/backend/api/v1/academic/classes/' + uuid(2) + '/exams', {
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
    });
  expect(response.status()).toBe(201);
  let exam = await response.json();
  expect(exam.versionNumber).toBe(1);
  for (const [i, prompt] of ['پرسش تستی یک', 'پرسش تستی دو', 'معادله را حل و مراحل را بنویسید.']
    .slice(0, count)
    .entries()) {
    const added = await page
      .context()
      .request.post(
        origin + '/api/client/backend/api/v1/academic/exams/' + exam.id + '/questions',
        {
          headers,
          data: {
            order: i + 1,
            type: 'Descriptive',
            prompt,
            score: i === 2 ? 8 : 6,
            attachmentPolicy:
              i === 2
                ? {
                    attachmentsAllowed: true,
                    textRequired: true,
                    allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
                    maximumCount: null,
                    maximumTotalBytes: null,
                  }
                : null,
            options: null,
            expectedVersionRowVersion: exam.versionRowVersion,
          },
        },
      );
    expect(added.ok()).toBeTruthy();
    exam = await added.json();
  }
  return exam;
}
async function prepare(page, item) {
  if (['assistant-reference', 'source-detail-reference'].includes(item.prepare)) {
    const response = await page.request.post(fixture + '/__test__/source-ai-ready', {
      data: { sourceId: uuid(1500), reference: true },
    });
    expect(response.ok()).toBeTruthy();
    if (item.prepare === 'assistant-reference') {
      const session = await (await page.request.get(origin + '/api/client/session')).json();
      await page.evaluate(
        ({ id, revision, sourceId }) => {
          sessionStorage.setItem(
            'makan:draft:view:' + id + ':' + revision + ':assistant:sources',
            JSON.stringify([{ id: sourceId, title: 'راهنمای داستان‌نویسی' }]),
          );
        },
        { id: session.user.id, revision: session.revision, sourceId: uuid(1500) },
      );
    }
    await page.reload();
    await page.getByText('راهنمای داستان‌نویسی', { exact: true }).first().waitFor();
    return {
      isolatedReferenceFixture: true,
      sourceId: uuid(1500),
      version: 2,
      title: 'راهنمای داستان‌نویسی',
    };
  }
  if (item.prepare === 'independent-member-search') {
    await page.getByTestId('membership-' + uuid(1808)).waitFor();
    await page.getByRole('textbox', { name: 'نام عضو', exact: true }).fill('شایان');
    await page.getByText('عضوی با این نام پیدا نشد', { exact: true }).waitFor();
  } else if (item.prepare?.startsWith('independent-member-')) {
    if (phase !== 'before' && item.prepare === 'independent-member-teacher-end')
      await page.getByText('مریم رضایی · مدرس همین کلاس', { exact: true }).waitFor();
    else await page.getByRole('heading', { name: /مریم/ }).first().waitFor();
    if (phase === 'before') return { memberView: 'existing combined editor; no native dialog' };
    if (['independent-member-roles', 'independent-member-end'].includes(item.prepare))
      await page.getByLabel('دلیل تغییر', { exact: true }).fill('مسئولیت آموزش در کارگاه');
    if (['independent-member-permissions', 'independent-member-revoke'].includes(item.prepare))
      await page.getByLabel('دلیل', { exact: true }).fill('مسئولیت بازخورد تکلیف‌ها');
    const command = {
      'independent-member-end': 'پایان عضویت',
      'independent-member-revoke': 'لغو اختیار ارزیابی',
      'independent-member-teacher-end': 'پایان مسئولیت مدرس',
    }[item.prepare];
    if (command) {
      await page.getByRole('button', { name: 'گزینه‌های بیشتر', exact: true }).click();
      await page.getByRole('button', { name: command, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await dialog
        .getByLabel('دلیل', { exact: true })
        .fill(
          item.prepare.endsWith('-revoke')
            ? 'پایان مسئولیت ارزیابی'
            : item.prepare.endsWith('-teacher-end')
              ? 'پایان مسئولیت تدریس به درخواست مدرس'
              : 'به درخواست خود عضو',
        );
    }
  }
  if (item.pushPermission) {
    if (phase === 'before')
      return {
        detail:
          'Compiled76: device routes have no native UI; existing category validation returns404. Baseline only, not a completed state.',
      };
    if (
      ['notification-devices-reference', 'notification-device-delete-reference'].includes(
        item.prepare,
      )
    ) {
      await page.goto(origin + '/personal/settings/notifications/device');
      const enable = page.getByRole('button', { name: 'فعال‌کردن اعلان دستگاه', exact: true });
      await expect(enable).toBeEnabled();
      await enable.click();
      await expect(
        page.getByText('ثبت اعلان همین مرورگر تأیید شد.', { exact: true }),
      ).toBeVisible();
      await page.goto(origin + '/personal/settings/notifications/devices');
      await page.getByRole('button', { name: 'مرورگر فعلی', exact: true }).waitFor();
      if (item.prepare === 'notification-device-delete-reference') {
        await page.getByRole('button', { name: 'دستگاه اندروید', exact: true }).click();
        await page.getByRole('dialog', { name: 'حذف مقصد اعلان؟', exact: true }).waitFor();
      }
    } else if (item.prepare === 'notification-device-reference') {
      await expect(
        page.getByRole('button', { name: 'فعال‌کردن اعلان دستگاه', exact: true }),
      ).toBeEnabled();
    } else if (item.prepare === 'notification-permission-preferences-reference') {
      await expect(page.getByRole('switch')).toHaveCount(2);
    } else await page.getByText('مرورگر اجازه اعلان نداده است.', { exact: true }).waitFor();
  }
  if (
    ['attendance-reference', 'attendance-correct-reference', 'attendance-note-reference'].includes(
      item.prepare,
    ) &&
    phase !== 'before'
  ) {
    const row = page.getByRole('button', { name: 'حضور نازنین موسوی', exact: true });
    await expect(row).toBeEnabled();
    if (item.prepare === 'attendance-correct-reference') {
      await row.click();
      const dialog = page.getByRole('dialog', { name: 'اصلاح حضور نازنین موسوی', exact: true });
      await dialog.getByLabel('توضیح اصلاح', { exact: true }).fill('ثبت اولیه نیاز به اصلاح داشت');
    }
  }
  if (item.prepare === 'my-attendance-reference' && phase !== 'before')
    await page.getByRole('heading', { name: 'حضور من', exact: true }).waitFor();
  if (/^session-(detail|edit|cancel|complete)-reference$/.test(item.prepare ?? '')) {
    const native = (await page.getByLabel('عنوان', { exact: true }).count()) > 0;
    if (item.prepare === 'session-detail-reference') {
      const detailNative = (await page.locator('.v5-hero').count()) > 0;
      if (phase !== 'before') expect(detailNative).toBeTruthy();
      return { native: detailNative, declaredFixture: true };
    }
    if (phase !== 'before') expect(native).toBeTruthy();
    if (native && phase !== 'before') {
      await page.getByLabel('عنوان', { exact: true }).fill('حل تمرین و رفع اشکال');
      await page.getByLabel('شروع تازه', { exact: true }).fill('1405/08/15 16:00');
      await page.getByLabel('پایان تازه', { exact: true }).fill('1405/08/15 17:00');
    } else {
      await page.getByLabel('عنوان جلسه', { exact: true }).fill('حل تمرین و رفع اشکال');
      await page.getByLabel('شروع جلسه', { exact: true }).fill('1405/08/15 16:00');
      await page.getByLabel('پایان جلسه', { exact: true }).fill('1405/08/15 17:00');
    }
    if (
      item.prepare === 'session-cancel-reference' ||
      item.prepare === 'session-complete-reference'
    ) {
      const complete = item.prepare === 'session-complete-reference';
      if (phase === 'before')
        await page.goto(origin + '/personal/education/sessions/' + uuid(6000));
      else
        await page
          .getByRole('banner')
          .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
          .click();
      await page
        .getByRole('button', { name: complete ? 'پایان جلسه' : 'لغو جلسه', exact: true })
        .click();
      const dialog = page.getByRole('dialog', {
        name: complete ? 'پایان جلسه' : 'لغو این جلسه؟',
        exact: true,
      });
      await dialog.waitFor();
      if (complete && phase !== 'before') {
        await dialog
          .getByRole('checkbox', { name: 'فهرست حضور را بازبینی کردم.', exact: true })
          .check();
        await expect(
          dialog.getByRole('button', { name: 'ثبت پایان جلسه', exact: true }),
        ).toBeEnabled();
      }
    }
    return {
      native,
      declaredFixture: true,
      backdrop: phase === 'before' ? 'legacy detail when modal' : 'bound native edit draft',
      knownDifferences: [
        'SessionVersionCommand has no cancellation reason; no unbound reason is claimed as persisted.',
      ],
    };
  }
  if (item.prepare === 'exam-question-create-reference') {
    const exam = await seedQuestionExam(page, 2);
    await page.goto(origin + '/personal/education/exams/' + exam.id + '/questions/new');
    await page
      .getByLabel('صورت سؤال', { exact: true })
      .or(page.getByLabel('متن پرسش', { exact: true }))
      .waitFor();
    const native = (await page.getByLabel('صورت سؤال', { exact: true }).count()) > 0;
    if (phase !== 'before') expect(native).toBeTruthy();
    await page
      .getByLabel(native ? 'صورت سؤال' : 'متن پرسش', { exact: true })
      .fill('معادله را حل و مراحل را بنویسید.');
    await page.getByLabel(native ? 'بارم' : 'نمرهٔ پرسش', { exact: true }).fill(native ? '۸' : '8');
    if (native) await page.getByRole('switch', { name: 'پیوست پاسخ', exact: true }).check();
    else await page.getByRole('checkbox', { name: 'اجازهٔ ارسال فایل', exact: true }).check();
  }
  if (item.prepare === 'exam-question-delete-reference') {
    const exam = await seedQuestionExam(page, 3);
    await page.goto(origin + '/personal/education/exams/' + exam.id + '/edit');
    await page.getByText('معادله را حل و مراحل را بنویسید.', { exact: true }).first().waitFor();
    const edit = page.getByRole('link', { name: 'ویرایش پرسش ۳', exact: true });
    const native = (await edit.count()) > 0;
    if (phase !== 'before') expect(native).toBeTruthy();
    if (native) {
      await edit.click();
      await page.getByLabel('صورت سؤال', { exact: true }).waitFor();
      await page
        .getByRole('banner')
        .getByRole('button', { name: 'گزینه‌های بیشتر', exact: true })
        .click();
      await page
        .getByRole('dialog', { name: 'گزینه‌های بیشتر', exact: true })
        .getByRole('button', { name: 'حذف پرسش', exact: true })
        .click();
    } else {
      const trigger = page.getByRole('button', { name: 'حذف پرسش ۳', exact: true });
      if (!(await trigger.count()))
        return {
          missingControl: true,
          detail: 'Historical editor has no removal control; not a matching MK153 modal.',
        };
      await trigger.click();
    }
    await page.getByRole('dialog', { name: 'حذف پرسش؟', exact: true }).waitFor();
    return {
      fixture: 'Question version1, exact typed file policy and sample prompt; loopback only.',
      nativeQuestionBackdrop: native,
      ...(native
        ? {}
        : {
            detail:
              'Connected build65 modal with fixture66 matching data; editor-list backdrop remains different from the reference question form.',
          }),
    };
  }
  if (item.prepare?.startsWith('parent-')) {
    const childName = item.seedData?.childName || 'نازنین موسوی';
    await page.goto(origin + '/personal/education');
    const select = page.getByRole('combobox', { name: 'انتخاب فرزند', exact: true });
    const childRow = page.getByTestId('child-' + uuid(501));
    const child = childRow.and(page.getByRole('button')).or(childRow.getByRole('button')).first();
    await select.or(child).first().waitFor();
    if (await select.isVisible()) await select.selectOption(uuid(501));
    else await child.click();
    await page.getByRole('heading', { name: childName, exact: true }).waitFor();
    await page.goto(origin + item.route);
    if (phase !== 'before') {
      await page.locator(`[data-v5-scene="${item.scenarios[0]}"]`).waitFor();
      if (item.key === 'school-parent') {
        const selectedRow = page
          .locator('[data-parent-active-child],.v5-row')
          .filter({ hasText: 'فرزند انتخاب‌شده' })
          .getByText(childName, { exact: true });
        const legacyIdentity = page
          .locator('[data-reference-columns]')
          .getByRole('heading', { name: childName, exact: true });
        await selectedRow.or(legacyIdentity).first().waitFor();
      }
      if (item.key === 'parent-children')
        await page
          .getByTestId('child-' + uuid(501))
          .getByRole('button', { pressed: true })
          .waitFor();
      if (item.key === 'parent-program')
        await page.getByRole('heading', { name: childName, exact: true }).waitFor();
      if (item.key === 'parent-results')
        await page.locator('.v5-row').filter({ hasText: 'تمرین فصل دوم' }).waitFor();
    }
  }
  if (item.prepare === 'invite-form-reference') {
    if (phase === 'before') {
      await page.getByRole('button', { name: 'لینک جدید', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('حداکثر تعداد استفاده', { exact: true }).fill('20');
      await dialog.getByRole('checkbox').check();
    } else {
      await page.locator('[data-v5-scene="MK-215"]').waitFor();
      await page.getByLabel('اعتبار تا', { exact: true }).fill('۱۴۰۵/۰۸/۲۰ ۲۳:۵۹');
      await page.getByLabel('حداکثر استفاده', { exact: true }).fill('20');
      await page.getByRole('switch', { name: 'نیاز به تأیید مدیر', exact: true }).check();
    }
  }
  if (item.prepare === 'notification-category-reference') {
    await page.getByLabel(phase === 'before' ? 'ساعت سکوت' : 'ساعات سکوت', { exact: true }).check();
    await page.getByLabel('شروع سکوت', { exact: true }).fill('22:00');
    await page.getByLabel('پایان سکوت', { exact: true }).fill('08:00');
    await page.getByLabel('منطقهٔ زمانی', { exact: true }).fill('Asia/Tehran');
  }
  if (item.prepare === 'lesson-create-reference') {
    await page
      .getByLabel(phase === 'before' ? 'عنوان درس و جزوه' : 'عنوان درس', { exact: true })
      .fill('حل معادله درجه دوم');
    await page
      .getByLabel('متن درس', { exact: true })
      .fill('برای حل معادله، ابتدا عبارت را تجزیه می‌کنیم…');
    await page.getByLabel('ترتیب نمایش', { exact: true }).fill('3');
  }
  if (['lesson-edit-reference', 'lesson-publish-reference'].includes(item.prepare)) {
    await page.getByLabel('عنوان درس', { exact: true }).fill('حل معادله درجه دوم');
    await page
      .getByLabel('متن درس', { exact: true })
      .fill('برای حل معادله، ابتدا عبارت را تجزیه می‌کنیم…');
    await page.getByLabel('ترتیب نمایش', { exact: true }).fill('3');
    await page.getByLabel('پیوست درس', { exact: true }).setInputFiles({
      name: 'جزوه فصل دوم.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\nIsolated reference-data fixture\n%%EOF'),
    });
    await page
      .getByRole('region', { name: 'پیوست‌های درس', exact: true })
      .getByText('جزوه فصل دوم.pdf', { exact: true })
      .waitFor();
    await page.getByRole('button', { name: 'ذخیره پیش‌نویس', exact: true }).click();
    await page.waitForURL(/\/lessons\/.+\/review$/);
    await page.getByRole('link', { name: 'ویرایش پیش‌نویس', exact: true }).click();
    await page
      .getByLabel('متن', { exact: true })
      .fill('دو روش تجزیه و فرمول را با مثال مقایسه می‌کنیم.');
    if (item.prepare === 'lesson-publish-reference') {
      await page.getByRole('button', { name: 'بازبینی انتشار', exact: true }).click();
      await page.waitForURL(/\/lessons\/.+\/review$/);
      await page.getByRole('button', { name: 'انتشار درس', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      if (phase !== 'before')
        await dialog
          .getByRole('checkbox', { name: 'متن و پیوست را بررسی کردم.', exact: true })
          .check();
    }
  }
  if (item.prepare?.startsWith('schedule-rule-')) {
    const before =
      phase === 'before' && (await page.getByLabel('زمان شروع', { exact: true }).count()) > 0;
    await page.getByLabel('روز هفته', { exact: true }).selectOption('Monday');
    await page.getByLabel(before ? 'زمان شروع' : 'شروع محلی', { exact: true }).fill('16:00');
    await page.getByLabel(before ? 'مدت جلسه (دقیقه)' : 'مدت', { exact: true }).fill('60');
    await page.getByLabel('عنوان جلسه', { exact: true }).fill('حل تمرین ریاضی');
    if (item.prepare !== 'schedule-rule-details') {
      if (!before)
        await page.getByRole('button', { name: 'ادامه بازه زمانی', exact: true }).click();
      await page.getByLabel('از تاریخ', { exact: true }).fill('۱۴۰۵/۰۷/۰۱');
      await page.getByLabel('از تاریخ', { exact: true }).blur();
      await page.getByLabel('تا تاریخ', { exact: true }).fill('۱۴۰۵/۰۹/۳۰');
      await page.getByLabel('تا تاریخ', { exact: true }).blur();
      if (before) await page.getByRole('button', { name: 'بازبینی برنامه', exact: true }).click();
      else
        await page
          .getByRole('checkbox', { name: 'بازه و روز هفته را بازبینی کردم.', exact: true })
          .check();
      if (item.prepare === 'schedule-rule-change') {
        await page
          .getByRole('button', { name: before ? 'ثبت برنامه' : 'ساخت قاعده برنامه', exact: true })
          .click();
        await page
          .getByRole('heading', { name: 'آخرین برنامه ثبت‌شده در این صفحه', exact: true })
          .waitFor();
        await page.getByRole('button', { name: 'ویرایش همین برنامه', exact: true }).click();
        await page.getByLabel(before ? 'زمان شروع' : 'شروع محلی', { exact: true }).fill('17:00');
        if (before) {
          await page.getByLabel('اعمال تغییر از چه روزی؟', { exact: true }).fill('۱۴۰۵/۰۸/۲۰');
          await page.getByLabel('اعمال تغییر از چه روزی؟', { exact: true }).blur();
          await page.getByRole('button', { name: 'بازبینی برنامه', exact: true }).click();
        } else {
          await page.getByRole('button', { name: 'ادامه بازه زمانی', exact: true }).click();
          await page
            .getByRole('checkbox', { name: 'بازه و روز هفته را بازبینی کردم.', exact: true })
            .check();
          await page.getByRole('button', { name: 'بررسی تغییر قاعده', exact: true }).click();
          await page
            .getByRole('dialog')
            .getByLabel('تاریخ اعمال', { exact: true })
            .fill('۱۴۰۵/۰۸/۲۰');
          await page.getByRole('dialog').getByLabel('تاریخ اعمال', { exact: true }).blur();
          const apply = page.getByRole('dialog').getByLabel('تاریخ اعمال', { exact: true });
          await expect(apply).toHaveValue(/^(۲۰ آبان ۱۴۰۵|1405\/08\/20)$/);
          await expect(apply).not.toHaveAttribute('aria-invalid', 'true');
        }
      }
    }
  }
  if (item.prepare === 'join-requests-reference') {
    await page.locator('[data-v5-scene="MK-219"]').waitFor();
    await page.locator('.v5-row').filter({ hasText: 'ریحانه زمانی' }).waitFor();
  }
  if (item.prepare === 'rich-form-reference') {
    if (item.key === 'poll') {
      await page.getByLabel('پرسش', { exact: true }).fill('برای جلسه بعد کدام زمان بهتر است؟');
      await page.getByLabel('گزینه ۱', { exact: true }).fill('شنبه ۱۶');
      await page.getByLabel('گزینه ۲', { exact: true }).fill('دوشنبه ۱۶');
    } else if (item.key === 'quiz') {
      await page.getByLabel('پرسش', { exact: true }).fill('کدام روش حل درست است؟');
      await page.getByRole('button', { name: 'گزینه‌ها', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'گزینه‌ها', exact: true });
      await dialog.getByLabel('گزینه ۱', { exact: true }).fill('تجزیه عبارت');
      await dialog.getByLabel('گزینه ۲', { exact: true }).fill('حذف جمله ثابت');
      await dialog.getByRole('button', { name: 'ثبت گزینه‌ها', exact: true }).click();
      await page.getByLabel('توضیح اختیاری', { exact: true }).fill('حاصل‌ضرب دو عبارت صفر است.');
    } else if (item.key === 'checklist') {
      await page.getByLabel('عنوان', { exact: true }).fill('آماده‌سازی جلسه');
      await page.getByLabel('مورد ۱', { exact: true }).fill('خواندن جزوه فصل دوم');
      await page.getByLabel('مورد ۲', { exact: true }).fill('فرستادن پرسش‌ها');
    } else if (item.key === 'scheduled') {
      await page.locator('.v5-list').getByText('جزوه هفته بعد', { exact: true }).waitFor();
    }
  }
  if (item.prepare === 'conversation-invites-reference')
    await page.getByRole('button', { name: 'لغو لینک', exact: true }).nth(1).waitFor();
  if (item.prepare === 'privacy-direct-reference') {
    await page
      .locator('[data-privacy-form]')
      .getByRole('button', { name: /^پیام مستقیم/ })
      .click();
    await page
      .getByRole('dialog', { name: 'چه کسی پیام بدهد؟', exact: true })
      .getByRole('radio', { name: 'همه', exact: true })
      .check();
  }
  if (item.prepare === 'conversation-info-reference') {
    await page
      .getByRole('heading', {
        name: item.key === 'channel-info' ? 'اطلاعات کانال' : 'اطلاعات گروه',
        exact: true,
      })
      .waitFor();
    if (item.key === 'channel-info')
      await page.getByRole('button', { name: /اعلان کانال/ }).waitFor();
  }
  if (item.prepare === 'conversation-members-reference')
    await page.locator('.v5-list .v5-row').filter({ hasText: 'امیر نادری' }).waitFor();
  if (item.prepare === 'conversation-edit-reference') {
    const channel = item.key === 'channel-edit';
    const name = page.getByLabel(channel ? 'عنوان کانال' : 'نام گروه', { exact: true });
    await name.fill(channel ? 'اطلاعیه‌های آفتاب' : 'باشگاه کتاب‌خوانی');
  }
  if (item.prepare === 'independent-settings')
    await page.getByLabel('دلیل اقدام', { exact: true }).fill('بازبینی ظرفیت و روش پذیرش');
  if (item.prepare === 'person-create-reference') {
    for (const [field, value] of [
      ['نام', 'ریحانه'],
      ['نام خانوادگی', 'زمانی'],
      ['نام نمایشی (اختیاری)', 'ریحانه زمانی'],
      ['دلیل ثبت یا تغییر پرونده', 'ثبت‌نام ترم پاییز'],
    ])
      await page.getByLabel(field, { exact: true }).fill(value);
  }
  if (item.key === 'independent-members')
    await page
      .getByTestId('membership-' + uuid(1809))
      .filter({ hasText: 'ریحانه زمانی' })
      .waitFor();
  if (item.prepare === 'class-create-reference') {
    for (const [field, value] of [
      ['دوره آموزشی', 'پاییز ۱۴۰۵'],
      ['درس کاتالوگ', 'ریاضی'],
    ]) {
      await page.getByLabel(field, { exact: true }).click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'انتخاب ' + value, exact: true })
        .click();
    }
    await page.getByLabel('عنوان کلاس', { exact: true }).fill('ریاضی دهم · گروه الف');
    await page.getByLabel('ظرفیت', { exact: true }).fill('30');
    await page.getByRole('checkbox', { name: 'پس از ساخت، کلاس فعال شود.', exact: true }).uncheck();
  }
  if (item.prepare === 'session-create-reference') {
    await page.getByLabel('عنوان جلسه', { exact: true }).fill('حل تمرین فصل دوم');
    const start = (await page.getByLabel('شروع', { exact: true }).count()) ? 'شروع' : 'شروع جلسه';
    const end = (await page.getByLabel('پایان', { exact: true }).count()) ? 'پایان' : 'پایان جلسه';
    await page.getByLabel(start, { exact: true }).fill('1405/08/14 16:00');
    await page.getByLabel(start, { exact: true }).blur();
    await page.getByLabel(end, { exact: true }).fill('1405/08/14 17:00');
    await page.getByLabel(end, { exact: true }).blur();
    await page.getByLabel('پیوند جلسه اختیاری', { exact: true }).fill('https://meet.example/class');
  }
  if (item.prepare === 'period-create-reference') {
    await page.getByLabel('عنوان دوره', { exact: true }).fill('پاییز ۱۴۰۵');
    const start = (await page.getByLabel('تاریخ شروع', { exact: true }).count())
      ? 'تاریخ شروع'
      : 'شروع دوره';
    const end = (await page.getByLabel('تاریخ پایان', { exact: true }).count())
      ? 'تاریخ پایان'
      : 'پایان دوره';
    await page.getByLabel(start, { exact: true }).fill('۱۴۰۵/۰۷/۰۱');
    await page.getByLabel(start, { exact: true }).blur();
    await page.getByLabel(end, { exact: true }).fill('۱۴۰۵/۰۹/۳۰');
    await page.getByLabel(end, { exact: true }).blur();
  }
  if (['exam-create-reference', 'exam-rules-reference'].includes(item.prepare)) {
    const native = (await page.getByLabel('عنوان', { exact: true }).count()) > 0;
    await page.getByLabel(native ? 'عنوان' : 'عنوان آزمون', { exact: true }).fill('مرور معادله');
    await page
      .getByLabel(native ? 'شرح اختیاری' : 'توضیحات آزمون', { exact: true })
      .fill('چهار پرسش تستی و یک پرسش تشریحی');
    await page
      .getByLabel(native ? 'شروع دسترسی' : 'آغاز دسترسی', { exact: true })
      .fill('۱۴۰۵/۰۸/۱۸ ۱۸:۰۰');
    await page.getByLabel(native ? 'شروع دسترسی' : 'آغاز دسترسی', { exact: true }).blur();
    await page.getByLabel('پایان دسترسی', { exact: true }).fill('۱۴۰۵/۰۸/۱۸ ۲۰:۰۰');
    await page.getByLabel('پایان دسترسی', { exact: true }).blur();
    if (item.prepare === 'exam-rules-reference') {
      if (native)
        await page.getByRole('button', { name: 'ادامه تنظیمات آزمون', exact: true }).click();
      await page
        .getByLabel(native ? 'مدت پاسخ' : 'مدت آزمون (دقیقه)', { exact: true })
        .fill(native ? '۱۵' : '15');
      await page
        .getByLabel(native ? 'حداکثر تلاش' : 'دفعات مجاز شرکت', { exact: true })
        .fill(native ? '۱' : '1');
      await page
        .getByLabel(native ? 'نمره کل' : 'نمرهٔ کل', { exact: true })
        .fill(native ? '۲۰' : '20');
    }
  }
  if (['assignment-create-reference', 'assignment-rules-reference'].includes(item.prepare)) {
    const native = (await page.getByLabel('عنوان', { exact: true }).count()) > 0;
    await page.getByLabel(native ? 'عنوان' : 'عنوان تکلیف', { exact: true }).fill('تمرین فصل دوم');
    await page
      .getByLabel(native ? 'شرح' : 'شرح تکلیف', { exact: true })
      .fill('پرسش‌های ۱ تا ۵ جزوه را با توضیح روش حل پاسخ دهید.');
    if (item.prepare === 'assignment-rules-reference') {
      if (native)
        await page.getByRole('button', { name: 'ادامه تنظیم قواعد', exact: true }).click();
      const due = page.getByLabel('مهلت تحویل', { exact: true });
      await due.fill('۱۴۰۵/۰۸/۲۰ ۲۳:۵۹');
      await due.blur();
      await page
        .getByLabel(native ? 'حداکثر تلاش' : 'حداکثر دفعات تحویل', { exact: true })
        .fill(native ? '۲' : '2');
      await page
        .getByLabel(native ? 'نمره کل' : 'نمرهٔ کل', { exact: true })
        .fill(native ? '۲۰' : '20');
      if (
        native &&
        (await page
          .getByRole('checkbox', { name: 'مخاطبان و صورت تکلیف آماده‌اند.', exact: true })
          .count())
      )
        await page
          .getByRole('checkbox', { name: 'مخاطبان و صورت تکلیف آماده‌اند.', exact: true })
          .check();
    }
  }
  if (item.prepare === 'conversation-create-reference') {
    const group = item.key === 'group-create';
    await page
      .getByLabel(group ? 'نام گروه' : 'نام کانال', { exact: true })
      .fill(group ? 'باشگاه کتاب‌خوانی' : 'یادداشت‌های مطالعه');
    await page
      .getByLabel(group ? 'توضیح اختیاری' : 'شرح اختیاری', { exact: true })
      .fill(group ? 'گفتگو درباره کتاب‌های این ماه' : 'نکته‌ها و منابع منتخب برای مطالعه');
  }
  if (item.prepare === 'class-fetch-error') {
    await page.locator('[data-class-summary][data-enrolled]').waitFor();
    await page.locator('nav a[href="/personal/profile"]:visible').first().click();
    await page.getByRole('heading', { name: 'پروفایل', exact: true }).waitFor();
    await page.waitForTimeout(16000);
    await page.context().request.post(fixture + '/__test__/fault', {
      data: { path: '/academic/classes', method: 'GET', status: 503, code: 'FIXTURE_UNAVAILABLE' },
    });
    await page.goBack();
    await page.locator('.v5-stale-notice').waitFor();
  }
  if (item.prepare === 'assignment-list') {
    await page.locator('select').selectOption(uuid(2));
    await page.getByRole('heading', { name: 'تکلیف آزمایشی', exact: true }).waitFor();
  }
  if (item.key === 'teacher-classes')
    await page.locator('[data-teacher-statistics][aria-busy="false"]').waitFor();
  if (item.key === 'teacher-content')
    await page.locator('[data-teacher-work-list] .row').first().waitFor();
  if (['classes', 'large-classes'].includes(item.key))
    await page.locator('[data-class-summary][data-enrolled]').waitFor();
  if (item.prepare === 'class-request' || item.prepare === 'class-request-details') {
    await page.getByLabel('نام کلاس', { exact: true }).fill('کارگاه داستان‌نویسی');
    await page
      .getByLabel('هدف و شرح کلاس', { exact: true })
      .fill(
        item.prepare === 'class-request-details'
          ? 'تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی. مناسب کسانی که می‌خواهند نوشتن را منظم دنبال کنند.'
          : 'این جمع قرار است چه چیزی یاد بگیرد؟',
      );
    await page.getByLabel('موضوع', { exact: true }).selectOption({ label: 'ادبیات و نویسندگی' });
  }
  if (item.prepare?.startsWith('export-')) {
    await page.getByRole('button', { name: 'تنظیم خروجی', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    if (item.prepare !== 'export-config') {
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'ساخت خروجی', exact: true })
        .click();
      await page.locator('[data-report-export-state="Queued"]').waitFor();
      if (item.prepare === 'export-ready') {
        await page
          .context()
          .request.post(fixture + '/__test__/report-exports', { data: { status: 'Completed' } });
        await page.getByRole('button', { name: 'بررسی وضعیت', exact: true }).click();
        await page.getByRole('heading', { name: 'خروجی آماده است', exact: true }).waitFor();
      }
    }
  }
  if (item.prepare === 'phone' || item.prepare === 'otp') {
    await page.locator('#phone-number').fill('09120000101');
    if (item.prepare === 'otp') {
      await page.getByRole('button', { name: 'دریافت کد تأیید', exact: true }).click();
      await page.locator('#otp-code').fill('4719');
    }
  }
  if (item.prepare === 'class-settings' || item.prepare === 'capacity-review') {
    const summary = page
      .locator('details > summary')
      .filter({ hasText: /تنظیمات کلاس|ویرایش مشخصات کلاس/ });
    if (await summary.count()) await summary.click();
    const reason = page.getByLabel('دلیل تغییر', { exact: true });
    if (await reason.isVisible()) await reason.fill('افزایش ظرفیت با تأمین فضای کلاس');
    const capacity = page.getByLabel('ظرفیت کلاس', { exact: true });
    if (await capacity.isVisible()) await capacity.fill('30');
    if (item.prepare === 'capacity-review') {
      await page.getByRole('button', { name: 'ذخیره تنظیمات', exact: true }).click();
      await page.getByRole('dialog', { name: 'ثبت تغییر ظرفیت', exact: true }).waitFor();
      await page.getByRole('dialog').getByText('ثبت‌نام فعال', { exact: true }).waitFor();
    }
  }
  if (item.focus === 'class-title') await page.getByLabel('نام کلاس', { exact: true }).focus();
  else
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
}

try {
  for (const raw of cases.filter(
    (c) =>
      (!wanted || wanted.includes(c.key)) &&
      (phase !== 'reference' || c.scenarios.length || c.proposal),
  )) {
    const item = process.env.EXACT_LARGE ? { ...raw, large: true } : raw;
    for (const [width, height, theme] of viewports) {
      const context = await browser.newContext({
        viewport: { width, height },
        locale: 'fa-IR',
        timezoneId: 'Asia/Tehran',
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      const row = {
        key: item.key,
        scenarios: item.scenarios,
        proposal: item.proposal,
        role: item.role ? (item.school ? item.role : 'Personal') : 'Public',
        accountProfile: item.role || 'Public',
        workspaceType: item.role ? (item.school ? 'Organization' : 'Personal') : 'Anonymous',
        route: item.route,
        width,
        height,
        theme,
        synthetic: true,
        productBuildId: phase === 'reference' ? undefined : productBuildId,
        dataProfile: item.seed || 'default-isolated-fixture',
        fixtureOptions: item.seedData || {},
        referenceDataPreparation: item.prepare || null,
        focus: item.focus || 'none',
        reading: item.large ? 'large' : 'normal',
        status: 'pending',
        pageErrors: [],
        apiFailures: [],
      };
      const roles = phase === 'reference' ? undefined : observeConversationRoles(context);
      try {
        await context.route('**/*', (route) =>
          ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
            ? route.continue()
            : route.abort('blockedbyclient'),
        );
        await context.addInitScript(
          ({ theme, large }) => {
            localStorage.setItem('makan-theme', theme);
            localStorage.setItem('makan-reading', large ? 'large' : 'standard');
            localStorage.setItem('makan:pwa-install-dismissed:v1', '1');
          },
          { theme, large: !!item.large },
        );
        if (item.pushPermission && phase !== 'reference')
          await mockPushBrowser(context, { permission: item.pushPermission });
        const page = await context.newPage();
        if (['school-student', 'school-teacher'].includes(item.key) && phase !== 'reference') {
          // These existing fixture sessions/deadlines are dated 29 October. Keep
          // their checked state stable without changing product time handling.
          await page.clock.setFixedTime(new Date('2026-10-29T08:00:00Z'));
          row.fixtureClock = '2026-10-29T08:00:00Z';
        }
        page.setDefaultTimeout(12000);
        page.on('pageerror', (e) => row.pageErrors.push(e.message));
        page.on('response', (r) => {
          if (r.url().includes('/api/client/') && r.status() >= 400)
            row.apiFailures.push({ path: new URL(r.url()).pathname, status: r.status() });
        });
        if (phase === 'reference')
          await captureReference(page, item, width, height, theme, reference);
        else {
          await seedAndLogin(context, item);
          await page.goto(origin + item.route);
          await page.locator('h1:visible,h2:visible').first().waitFor();
          await page
            .locator('.skeleton-wrap')
            .waitFor({ state: 'hidden', timeout: 8000 })
            .catch(() => {});
          row.preparation = await prepare(page, item);
          if (item.role) {
            const session = await (
              await context.request.get(origin + '/api/client/session')
            ).json();
            row.role = session.context?.activeRole || 'Personal';
            row.workspaceType = session.context?.workspaceType || 'Unknown';
            row.roleMatchesSession =
              row.role === (item.school ? item.role : 'Personal') &&
              row.workspaceType === (item.school ? 'Organization' : 'Personal');
            if (item.prepare?.startsWith('parent-'))
              row.parentSelectionVerified =
                session.context?.activeRole === 'Parent' &&
                session.context?.subjectOrganizationPersonId === uuid(501);
            const caption = await page
              .locator('.rx-head .grow > p')
              .evaluateAll((nodes) => nodes[0]?.textContent || '');
            row.conversationRole = {
              'مالک گفتگو': 'Owner',
              'مدیر گفتگو': 'Admin',
              'عضو گفتگو': 'Member',
            }[caption];
            const conversationId = new URL(origin + item.route).pathname.match(
              /^\/personal\/messages\/([a-f0-9-]{36})/i,
            )?.[1];
            const observedRole = conversationId
              ? await roles.role(conversationId, session.user.id, session.revision)
              : undefined;
            row.conversationRole = observedRole || row.conversationRole;
            row.conversationRoleEvidence = observedRole
              ? 'observed current-context ManagedConversationResult'
              : 'rendered participant caption, if available';
          }
        }
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        await page.mouse.move(0, 0);
        if (item.focus === 'class-title')
          await page.getByLabel('نام کلاس', { exact: true }).focus();
        else
          await page.evaluate(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        row.layout = await page.evaluate(collectViewportGeometry);
        row.image = `${out}/${item.key}-${width}-${theme}.png`;
        await page.screenshot({ path: row.image, animations: 'disabled' });
        row.status = 'captured';
        row.referencePrimaryMatchesRenderer =
          !row.layout.renderedScenarios?.length ||
          row.layout.renderedScenarios.includes(item.scenarios[0]);
        if (row.preparation?.detail) row.detail = row.preparation.detail;
        row.stateVerified =
          row.layout.fonts &&
          !row.preparation?.missingControl &&
          !row.layout.renderError &&
          row.roleMatchesSession !== false &&
          row.parentSelectionVerified !== false &&
          !row.pageErrors.length &&
          row.referencePrimaryMatchesRenderer &&
          (phase === 'reference' ||
            (item.expectedFailure ? row.layout.alerts.length > 0 : !row.layout.alerts.length));
      } catch (e) {
        row.status = 'blocked';
        row.reason = e.message.split('\n')[0];
      } finally {
        roles?.dispose();
        await context.close();
      }
      results.push(row);
      const merged = new Map(
        [...previous, ...results].map((record) => [
          [record.key, record.width, record.height, record.theme].join('|'),
          record,
        ]),
      );
      await fs.writeFile(
        out + '/results.partial.json',
        JSON.stringify([...merged.values()], null, 2) + '\n',
      );
      await fs.rename(out + '/results.partial.json', out + '/results.json');
    }
    console.log(
      JSON.stringify({
        phase,
        case: item.key,
        captured: results.filter((r) => r.status === 'captured').length,
        blocked: results.filter((r) => r.status === 'blocked').length,
      }),
    );
  }
} finally {
  await browser.close();
}
console.log(
  JSON.stringify({
    phase,
    total: results.length,
    captured: results.filter((r) => r.status === 'captured').length,
    blocked: results
      .filter((r) => r.status === 'blocked')
      .map((r) => ({ key: r.key, width: r.width, reason: r.reason })),
    overflow: results
      .filter((r) => r.layout?.documentOverflow || r.layout?.overflowing.length)
      .map((r) => ({ key: r.key, width: r.width, overflow: r.layout?.overflowing })),
  }),
);
