// Capture the actual owner UI against the isolated local demonstration backend.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = process.cwd();
const destination = path.join(root, 'tmp/pdfs/owner-handbook/screenshots');
const origin = process.env.MAKAN_GUIDE_ORIGIN ?? 'http://127.0.0.1:3100';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname))
  throw new Error('Handbook capture only supports an isolated local demonstration server.');
const id = '00000000-0000-4000-8000-000000000001';
const org = '00000000-0000-4000-8000-000000000002';
const member = '00000000-0000-4000-8000-000000000004';
const classId = '00000000-0000-4000-8000-000000000006';
const instant = '2026-11-11T08:30:00Z';
const { schemas } = JSON.parse(await fs.readFile('src/generated/api/contract.json', 'utf8'));
const manifestPath = path.join(destination, 'manifest.json');
const shots = JSON.parse(await fs.readFile(manifestPath, 'utf8').catch(() => '{}'));

function sample(input, depth = 0) {
  if (!input || depth > 15) return null;
  const schema = input.$ref ? schemas[input.$ref.split('/').pop()] : input;
  if (schema.nullable) return null;
  if (schema.enum) return schema.enum[0];
  if (schema.type === 'object')
    return Object.fromEntries(
      Object.entries(schema.properties ?? {})
        .filter(([key]) => schema.required?.includes(key))
        .map(([key, value]) => [key, sample(value, depth + 1)]),
    );
  if (schema.type === 'array') return [];
  if (schema.type === 'boolean') return true;
  if (schema.type === 'integer' || schema.type === 'number') return 1;
  if (schema.format === 'uuid') return id;
  if (schema.format === 'date-time') return instant;
  if (schema.format === 'date') return '2026-11-11';
  return 'نمونه آموزشی';
}
const named = (name, props = {}) => ({
  ...sample({ $ref: '#/components/schemas/' + name }),
  ...props,
});
const paged = (items) => ({ items, page: 1, pageSize: 30, totalCount: items.length });
const organization = { id: org, name: 'آموزشگاه نمونه سپهر' };
const fixtures = new Map();
const put = (route, value) => fixtures.set(route, value);
const membership = named('PlatformMembershipItem', {
  membershipId: member,
  userId: id,
  displayName: 'مدیر نمونه',
  activeRoles: ['Manager'],
  status: 'Active',
});
put(
  `/api/admin/v1/organizations/${org}`,
  named('PlatformOrganizationDetail', {
    id: org,
    name: organization.name,
    status: 'Active',
    activeMemberCount: 36,
    classes: { activeCount: 3, totalCapacity: 60 },
    managers: [{ userId: id, displayName: 'مدیر نمونه' }],
    activeRoles: ['Manager'],
    subscription: null,
    version: 'guide-org-v1',
  }),
);
put(`/api/admin/v1/organizations/${org}/memberships`, paged([membership]));
put(
  '/api/admin/v1/education/teachers',
  paged([
    named('PlatformTeacherAssignmentItem', {
      displayName: 'معلم نمونه',
      classId,
      classTitle: 'ریاضی هشتم',
      organization,
      status: 'Active',
    }),
  ]),
);
put(
  '/api/admin/v1/education/enrollments',
  paged([
    named('PlatformEnrollmentItem', {
      displayName: 'فراگیر نمونه',
      classId,
      classTitle: 'ریاضی هشتم',
      organization,
      userId: null,
      status: 'Active',
    }),
  ]),
);
put(
  '/api/admin/v1/education/assignments',
  paged([
    named('PlatformAssignmentItem', {
      currentTitle: 'تمرین فصل اول',
      classId,
      classTitle: 'ریاضی هشتم',
      organization,
      currentVersionNumber: 1,
      currentMaxScore: 20,
      status: 'Published',
    }),
  ]),
);
put(
  '/api/admin/v1/education/exams',
  paged([
    named('PlatformExamItem', {
      currentTitle: 'آزمون مرور فصل اول',
      classId,
      classTitle: 'ریاضی هشتم',
      organization,
      currentVersionNumber: 1,
      currentMaxScore: 20,
      status: 'Published',
    }),
  ]),
);
put(
  '/api/admin/v1/audit-logs',
  paged([
    named('AdminAuditLogItem', {
      action: 'OrganizationCreated',
      targetType: 'Organization',
      targetId: org,
      reason: 'راه‌اندازی آموزشگاه نمونه',
      result: 1,
    }),
  ]),
);
put(
  `/api/admin/v1/users/${id}`,
  named('PlatformUserDetail', {
    userId: id,
    displayName: 'کاربر نمونه',
    username: 'sample.user',
    maskedPhone: '0912***0000',
    accountStatus: 'Active',
    memberships: [membership],
    sessions: [
      named('PlatformUserSessionSummary', {
        sessionId: id,
        deviceName: 'مرورگر رایانه نمونه',
        isActive: true,
      }),
    ],
    platformRoles: [],
    administrativeHistory: [],
  }),
);
put('/api/admin/v1/roles', [
  named('PlatformRoleCatalogItem', {
    key: 'PlatformOwner',
    displayName: 'مالک پلتفرم',
    permissions: ['platform.access', 'platform.users.read', 'platform.organizations.read'],
  }),
  named('PlatformRoleCatalogItem', {
    roleId: org,
    key: 'Support',
    displayName: 'پشتیبانی',
    permissions: ['platform.users.read', 'platform.organizations.read', 'platform.sessions.manage'],
  }),
]);
put(
  '/api/admin/v1/role-assignments',
  paged([
    named('PlatformRoleAssignmentItem', {
      assignmentId: id,
      displayName: 'همکار نمونه',
      roleDisplayName: 'پشتیبانی',
      isActive: true,
    }),
  ]),
);
put(
  '/api/admin/v1/commerce/subscriptions',
  paged([
    named('PlatformSubscriptionItem', {
      organization,
      planCode: 'SAMPLE',
      status: 'Active',
      planVersionNumber: 1,
      startsAtUtc: instant,
      endsAtUtc: '2027-03-20T20:30:00Z',
    }),
  ]),
);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 880 },
  deviceScaleFactor: 1.5,
  locale: 'fa-IR',
  timezoneId: 'Asia/Tehran',
});
const page = await context.newPage();
const btn = (name) => page.getByRole('button', { name, exact: true });
const heading = (name) => page.getByRole('heading', { name, exact: true });
const dialog = () => page.getByRole('dialog').last();
const panel = (title) => page.locator('.panel').filter({ has: heading(title) });
const control = async (body) => {
  const response = await fetch('http://127.0.0.1:4100/__control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Documentation backend not available');
};
await fs.mkdir(destination, { recursive: true });
await control({ reset: true, pushConfigured: false });
await page.route('**/api/backend/**', async (route) => {
  const url = new URL(route.request().url());
  const key = url.pathname.replace(/^\/api\/backend/, '');
  if (route.request().method() === 'GET' && fixtures.has(key))
    return route.fulfill({ json: fixtures.get(key) });
  return route.continue();
});

async function ready() {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.skeleton-wrap')).toHaveCount(0, { timeout: 15000 });
  await page.waitForTimeout(180);
}
async function go(url) {
  await page.goto(origin + url);
  await ready();
}
async function closeDialog() {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function shot(key, targets = [], options = {}) {
  await ready();
  let clip;
  if (options.clip) {
    clip = options.clip;
  } else if (options.locator) {
    await options.locator.scrollIntoViewIfNeeded();
    const b = await options.locator.boundingBox();
    if (!b) throw new Error('Missing screenshot region: ' + key);
    clip = {
      x: Math.max(0, b.x),
      y: Math.max(0, b.y),
      width: b.width,
      height: Math.min(b.height, options.maxHeight ?? 840),
    };
  } else if (!options.full) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const b = await page.locator('main').boundingBox();
    clip = {
      x: Math.max(0, b.x + 15),
      y: Math.max(0, b.y),
      width: b.width - 30,
      height: Math.min(b.height, 600),
    };
  }
  const viewport = page.viewportSize();
  if (clip) clip.height = Math.min(clip.height, viewport.height - clip.y - 4);
  const bounds = clip ?? { x: 0, y: 0, width: viewport.width, height: viewport.height };
  const pins = [];
  for (const target of targets) {
    if ((await target.count()) === 0 || !(await target.first().isVisible())) continue;
    const b = await target.first().boundingBox();
    if (b && b.y >= bounds.y && b.y + 18 < bounds.y + bounds.height)
      pins.push({
        x: b.x - bounds.x,
        y: b.y - bounds.y,
        width: Math.min(b.width, bounds.width),
        height: Math.min(b.height, bounds.y + bounds.height - b.y),
      });
  }
  await page.screenshot({
    path: path.join(destination, key + '.png'),
    ...(clip ? { clip } : {}),
    animations: 'disabled',
  });
  shots[key] = {
    file: key + '.png',
    width: bounds.width,
    height: bounds.height,
    pins,
    mobile: viewport.width < 600,
  };
  await fs.writeFile(path.join(destination, 'manifest.json'), JSON.stringify(shots, null, 2));
  console.log('Captured ' + key);
}

try {
  await go('/login');
  await page.getByLabel('شماره همراه', { exact: true }).fill('09120000000');
  await shot('login', [page.getByLabel('شماره همراه', { exact: true }), btn('دریافت کد ورود')], {
    locator: page.locator('main'),
  });
  await btn('دریافت کد ورود').click();
  await expect(page.getByLabel('کد ورود', { exact: true })).toBeVisible();
  await shot('otp', [page.getByLabel('کد ورود', { exact: true }), btn('تأیید و ورود')], {
    locator: page.locator('main'),
  });
  await page.getByLabel('کد ورود', { exact: true }).fill('123456');
  await btn('تأیید و ورود').click();
  await expect(heading('نمای کلی')).toBeVisible();
  if (process.argv.includes('--grant-only')) {
    await go(`/admin/personal-classes/${classId}`);
    await btn('اعطای مجوز به عضویت').click();
    await dialog().getByLabel('انتخاب مدیر آزمایشی', { exact: true }).check();
    await dialog().evaluate((el) => {
      el.scrollTop = 0;
    });
    await ready();
    const managerBox = await dialog().boundingBox();
    const flagsBox = await dialog().locator('fieldset').last().boundingBox();
    await shot(
      'personal-grant-manager',
      [
        dialog().getByLabel('جست‌وجوی مدیر کلاس'),
        dialog().getByLabel('انتخاب مدیر آزمایشی', { exact: true }),
      ],
      {
        clip: {
          x: managerBox.x,
          y: managerBox.y,
          width: managerBox.width,
          height: flagsBox.y - managerBox.y - 10,
        },
      },
    );
    await dialog().getByLabel('ساخت تکلیف', { exact: true }).check();
    await dialog().getByLabel('ارزیابی و نمره‌دهی', { exact: true }).check();
    await dialog()
      .getByLabel('دلیل این اقدام', { exact: true })
      .fill('اختیارهای آموزشی نمونه برای مدیر همین کلاس');
    await dialog().evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await ready();
    const fieldBox = await dialog().locator('fieldset').last().boundingBox();
    const submit = dialog().getByRole('button', { name: 'اعطای مجوز به عضویت', exact: true });
    const submitBox = await submit.boundingBox();
    await shot(
      'personal-grant',
      [
        dialog().locator('fieldset').last(),
        dialog().getByLabel('دلیل این اقدام', { exact: true }),
        submit,
      ],
      {
        clip: {
          x: managerBox.x + 14,
          y: fieldBox.y - 8,
          width: managerBox.width - 28,
          height: submitBox.y + submitBox.height - fieldBox.y + 18,
        },
      },
    );
    await browser.close();
    process.exit(0);
  }
  await shot(
    'dashboard',
    [page.locator('.sidebar .nav-list'), page.locator('.metrics'), btn('تازه‌سازی')],
    { full: true },
  );
  await btn('جست‌وجوی سازمان یا کاربر').click();
  await page.getByLabel('عبارت جست‌وجوی سراسری').fill('کاربر');
  await expect(dialog().getByRole('link').first()).toBeVisible();
  await shot(
    'search',
    [page.getByLabel('عبارت جست‌وجوی سراسری'), dialog().locator('.global-search-results')],
    { locator: dialog() },
  );
  await closeDialog();
  await go('/admin/organizations');
  await shot('organizations', [
    page.locator('.filter-bar'),
    page.locator('tbody tr').first(),
    btn('راه‌اندازی سازمان'),
  ]);
  await go(`/admin/organizations/${org}`);
  await shot('organization', [page.locator('.tabs'), panel('چک‌لیست راه‌اندازی سازمان')]);
  await go(`/admin/organizations/${org}?tab=members`);
  await shot('org-members', [btn('دعوت عضو'), page.locator('tbody tr').first()]);
  await btn('دعوت عضو').click();
  await shot('org-invite', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await go(`/admin/organizations/${org}`);
  await btn('تعلیق سازمان').click();
  await shot(
    'org-suspend',
    [dialog().locator('.notice'), dialog().getByLabel('دلیل این اقدام', { exact: true })],
    { locator: dialog() },
  );
  await closeDialog();
  await go('/admin/organizations');
  await btn('راه‌اندازی سازمان').click();
  await dialog().getByLabel('نام سازمان', { exact: true }).fill('آموزشگاه نمونه سپهر');
  await dialog()
    .getByLabel('دلیل ایجاد', { exact: true })
    .fill('راه‌اندازی آموزشگاه نمونه برای آموزش کار با پنل');
  await shot(
    'provision-1',
    [
      dialog().getByLabel('نام سازمان', { exact: true }),
      dialog().getByLabel('دلیل ایجاد', { exact: true }),
      dialog().getByRole('button', { name: 'ادامه', exact: true }),
    ],
    { locator: dialog() },
  );
  await dialog().getByRole('button', { name: 'ادامه', exact: true }).click();
  await shot(
    'provision-2',
    [
      dialog().getByRole('button', { name: 'انتخاب مدیر اولیه', exact: true }),
      dialog().getByRole('button', { name: 'انتخاب پلن', exact: true }),
    ],
    { locator: dialog() },
  );
  await dialog().getByRole('button', { name: 'ادامه', exact: true }).click();
  await shot(
    'provision-3',
    [dialog().getByRole('button', { name: 'ثبت نهایی سازمان', exact: true })],
    { locator: dialog() },
  );
  await control({
    failPath: '/provisioning',
    failMethod: 'POST',
    status: 504,
    code: 'TIMEOUT',
    errorOnce: true,
  });
  await dialog().getByRole('button', { name: 'ثبت نهایی سازمان', exact: true }).click();
  await expect(dialog().getByRole('alert')).toBeVisible();
  await shot(
    'provision-recovery',
    [
      dialog().getByRole('alert'),
      dialog().getByRole('button', { name: 'بررسی نتیجه درخواست', exact: true }),
    ],
    { locator: dialog() },
  );
  await closeDialog();
  await control({ failPath: null, failMethod: null, status: 0, code: null });

  await go('/admin/users');
  await shot('users', [page.locator('.filter-bar'), page.locator('tbody tr').first()]);
  await btn('نمایش فیلترهای بیشتر').click();
  await shot('filters', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await go(`/admin/users/${id}`);
  await shot('user-profile', [page.locator('.tabs'), panel('اطلاعات مجاز حساب')]);
  await go(`/admin/users/${id}?tab=sessions`);
  await shot('user-sessions', [btn('ابطال همه نشست‌ها'), btn('ابطال این نشست')]);
  await go(`/admin/users/${id}?tab=security`);
  await shot('user-age', [btn('ثبت بررسی سن'), btn('حل تعارض اطلاعات سن')]);
  await go(`/admin/users/${id}?tab=history`);
  await shot('user-history', [page.locator('.tabs')]);

  for (const [tab, key] of [
    ['classes', 'education'],
    ['teachers', 'teachers'],
    ['enrollments', 'enrollments'],
    ['assignments', 'assignments'],
    ['exams', 'exams'],
  ]) {
    await go('/admin/education?tab=' + tab);
    await shot(key, [page.locator('.tabs'), page.locator('tbody tr').first()]);
  }
  await go(`/admin/education/${classId}`);
  await shot('class-detail', [page.locator('.tabs'), panel('فراگیران فعال در خلاصه پاسخ')]);
  await go('/admin/personal-classes');
  await shot('personal-queue', [page.locator('.filter-bar'), page.locator('tbody tr').first()]);
  await go(`/admin/personal-class-requests/${id}`);
  await shot('personal-request', [page.locator('.tabs'), btn('ثبت تصمیم بررسی')]);
  await btn('ثبت تصمیم بررسی').click();
  await dialog().getByLabel('تصمیم بررسی').selectOption('Approved');
  await dialog()
    .getByLabel('دلیل این اقدام', { exact: true })
    .fill('تأیید تشکیل پس از بررسی اطلاعات نمونه');
  await shot(
    'personal-review',
    [dialog().getByLabel('تصمیم بررسی'), dialog().getByLabel('دلیل این اقدام', { exact: true })],
    { locator: dialog() },
  );
  await closeDialog();
  await control({ personalStatus: 'Approved' });
  await go(`/admin/personal-class-requests/${id}`);
  await shot('personal-progress', [panel('پیشرفت آماده‌سازی')]);
  await go(`/admin/personal-class-requests/${id}?tab=history`);
  await shot('personal-decisions', [page.locator('.tabs')]);
  await go(`/admin/personal-classes/${classId}?tab=members`);
  await shot('personal-members', [page.locator('.tabs'), page.locator('tbody tr').first()]);
  await go(`/admin/personal-classes/${classId}`);
  await btn('اعطای مجوز به عضویت').click();
  await dialog().getByLabel('انتخاب مدیر آزمایشی', { exact: true }).check();
  await dialog().evaluate((el) => {
    el.scrollTop = 0;
  });
  await ready();
  const grantDialogBox = await dialog().boundingBox();
  const grantFlagsBox = await dialog().locator('fieldset').last().boundingBox();
  await shot(
    'personal-grant-manager',
    [
      dialog().getByLabel('جست‌وجوی مدیر کلاس'),
      dialog().getByLabel('انتخاب مدیر آزمایشی', { exact: true }),
    ],
    {
      clip: {
        x: grantDialogBox.x,
        y: grantDialogBox.y,
        width: grantDialogBox.width,
        height: grantFlagsBox.y - grantDialogBox.y - 10,
      },
    },
  );
  await dialog().getByLabel('ساخت تکلیف', { exact: true }).check();
  await dialog().getByLabel('ارزیابی و نمره‌دهی', { exact: true }).check();
  await dialog()
    .getByLabel('دلیل این اقدام', { exact: true })
    .fill('اختیارهای آموزشی نمونه برای مدیر همین کلاس');
  await dialog().evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await ready();
  const finalFlagsBox = await dialog().locator('fieldset').last().boundingBox();
  const grantSubmit = dialog().getByRole('button', { name: 'اعطای مجوز به عضویت', exact: true });
  const grantSubmitBox = await grantSubmit.boundingBox();
  await shot(
    'personal-grant',
    [
      dialog().locator('fieldset').last(),
      dialog().getByLabel('دلیل این اقدام', { exact: true }),
      grantSubmit,
    ],
    {
      clip: {
        x: grantDialogBox.x + 14,
        y: finalFlagsBox.y - 8,
        width: grantDialogBox.width - 28,
        height: grantSubmitBox.y + grantSubmitBox.height - finalFlagsBox.y + 18,
      },
    },
  );
  await closeDialog();
  await go(`/admin/personal-classes/${classId}?tab=history`);
  await shot('personal-history', [page.locator('.tabs'), page.locator('tbody tr').first()]);

  await go('/admin/library');
  await shot('library', [
    btn('افزودن منبع'),
    page.locator('.filter-bar'),
    page.locator('tbody tr').first(),
  ]);
  await btn('افزودن منبع').click();
  await dialog().getByLabel('عنوان منبع', { exact: true }).fill('راهنمای نمونه فصل اول');
  await shot(
    'library-new',
    [
      dialog().getByLabel('عنوان منبع', { exact: true }),
      dialog().getByLabel('فایل منبع', { exact: true }),
      dialog().getByLabel('دلیل این اقدام', { exact: true }),
    ],
    { locator: dialog() },
  );
  await closeDialog();
  await go(`/admin/library/${id}`);
  await shot('library-detail', [page.locator('.row-actions').first(), panel('مشخصات منبع')]);
  await shot('library-ai', [panel('آمادگی استفاده هوش مصنوعی')], {
    locator: panel('آمادگی استفاده هوش مصنوعی'),
  });
  await btn('انتشار منبع').click();
  await shot('library-publish', [dialog().getByLabel('دلیل این اقدام', { exact: true })], {
    locator: dialog(),
  });
  await closeDialog();
  await btn('تغییر نمایانی').click();
  await shot('library-visibility', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await btn('نسخه جدید منبع').click();
  await shot('library-version', [dialog().getByLabel('فایل منبع', { exact: true })], {
    locator: dialog(),
  });
  await closeDialog();

  await go('/admin/commerce');
  await shot('plans', [page.locator('.tabs'), page.locator('tbody tr').first(), btn('ایجاد پلن')]);
  await go(`/admin/commerce/${id}`);
  await shot('plan-detail', [btn('تنظیم فروش و تمدید'), btn('نسخه جدید پلن')]);
  await btn('ویرایش پیش‌نویس').click();
  await shot('plan-edit', [dialog().locator('form')], { locator: dialog() });
  await dialog().evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await shot('plan-edit-bottom', [dialog().locator('.form-actions')], { locator: dialog() });
  await closeDialog();
  await btn('انتشار نسخه').click();
  await shot(
    'plan-publish',
    [dialog().locator('.notice'), dialog().getByLabel('دلیل این اقدام', { exact: true })],
    { locator: dialog() },
  );
  await closeDialog();
  await go(`/admin/users/${id}?tab=commercial`);
  await shot('contracts', [btn('ثبت قرارداد تجاری'), panel('قرارداد تجاری کاربر نمونه')]);
  await shot('quotas', [panel('سهمیه‌ها و مصرف')], { locator: panel('سهمیه‌ها و مصرف') });
  await btn('ثبت قرارداد تجاری').click();
  await shot('contract-register', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await go('/admin/commerce?tab=subscriptions');
  await shot('subscriptions', [page.locator('.tabs'), page.locator('tbody tr').first()]);
  await go('/admin/commerce?tab=provisioning');
  await shot('provisions', [page.locator('.tabs'), page.locator('.filter-bar')]);

  const paid = {
    paymentId: id,
    paymentAttemptId: id,
    provider: 'Zibal',
    maskedProviderReference: '***1234',
    maskedSettlementReference: '***9876',
    amount: 250000,
    currency: 'Irr',
    paidAtUtc: instant,
    providerPaidAtUtc: instant,
  };
  await control({
    financeOrder: {
      orderId: id,
      purchaserUserId: id,
      organization: null,
      planVersionId: id,
      status: 'Paid',
      fulfillmentState: 'SubscriptionActivationPending',
      amount: 250000,
      currency: 'Irr',
      createdAtUtc: instant,
      paidAtUtc: instant,
      cancelledAtUtc: null,
      payment: paid,
      paymentAttempts: [
        {
          ...paid,
          status: 'Succeeded',
          createdAtUtc: instant,
          callbackReceivedAtUtc: instant,
          verifiedAtUtc: instant,
          completedAtUtc: instant,
          failureCode: null,
        },
      ],
    },
  });
  await go('/admin/finance');
  await shot('finance', [page.locator('tbody tr').first(), page.locator('.filter-bar')]);
  await go(`/admin/finance/${id}`);
  await shot('order', [page.locator('main .notice[role="status"]'), panel('پرداخت ثبت‌شده')]);
  await shot('attempts', [panel('تلاش‌های پرداخت')], { locator: panel('تلاش‌های پرداخت') });
  await go('/admin/roles');
  await shot('roles', [page.locator('.tabs'), btn('انتساب نقش')]);
  await go('/admin/roles?tab=assignments');
  await shot('role-assignments', [btn('انتساب نقش'), page.locator('tbody tr').first()]);
  await btn('انتساب نقش').click();
  await shot('role-grant', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await go('/admin/audit');
  await shot('audit', [page.locator('.filter-bar'), page.locator('tbody tr').first()]);
  await go('/admin/moderation');
  await shot('moderation', [page.locator('.filter-bar'), page.locator('tbody tr').first()]);
  await go(`/admin/moderation/${id}`);
  await shot('moderation-detail', [
    panel('اطلاعات و وضعیت پرونده'),
    page.locator('.row-actions').first(),
  ]);
  await btn('ثبت اقدام').click();
  await shot('moderation-action', [dialog().locator('form')], { locator: dialog() });
  await closeDialog();
  await go('/admin/messaging');
  await shot('messaging', [page.locator('main .notice'), page.locator('tbody tr').first()]);
  await control({
    jobOperations: {
      counts: [{ jobType: 'SourceProcessing', status: 'Pending', count: 2 }],
      oldestPendingAtUtc: instant,
      queues: [
        {
          jobType: 'SourceProcessing',
          pendingCount: 2,
          processingCount: 1,
          failedCount: 0,
          oldestPendingAtUtc: instant,
          oldestPendingAgeSeconds: 120,
        },
      ],
    },
  });
  for (const [tab, key] of [
    ['health', 'health'],
    ['notifications', 'notifications-ops'],
    ['jobs', 'jobs'],
  ]) {
    await go('/admin/operations?tab=' + tab);
    await shot(key, [page.locator('.tabs'), btn('تازه‌سازی وضعیت')]);
  }
  await go('/admin/account');
  await shot('account', [page.locator('.tabs'), btn('ویرایش پروفایل مجاز')]);
  await go('/admin/account?tab=sessions');
  await shot('sessions', [page.locator('tbody tr').first(), btn('ابطال نشست‌های دیگر')]);
  await go('/admin/account?tab=notifications');
  await shot('notifications', [panel('نصب پنل روی دستگاه'), panel('اعلان‌های این مرورگر')]);
  await go('/admin/account?tab=permissions');
  await shot('permissions', [page.locator('.tabs'), panel('مجوزهای جاری تأییدشده سرور')]);
  await go('/admin/users');
  await control({
    failPath: '/api/admin/v1/users',
    failMethod: 'GET',
    status: 503,
    code: 'UPSTREAM_UNAVAILABLE',
  });
  await btn('به‌روزرسانی فهرست').click();
  await expect(page.locator('main .error-state')).toBeVisible();
  await shot('error', [page.locator('main .error-state')]);
  await control({ failPath: null, failMethod: null, status: 0, code: null });
  await go(`/admin/library/${id}`);
  await btn('انتشار منبع').click();
  await dialog()
    .getByLabel('دلیل این اقدام', { exact: true })
    .fill('نمونه نمایش تعارض و دریافت نسخه تازه');
  await control({ sourceVersion: 'guide-new-source-version' });
  await dialog().getByRole('button', { name: 'انتشار منبع', exact: true }).click();
  await expect(dialog().locator('[role="alert"]')).toBeVisible();
  await shot(
    'conflict',
    [
      dialog().locator('[role="alert"]'),
      dialog().getByRole('button', { name: 'دریافت نسخه تازه و حفظ ورودی', exact: true }),
    ],
    { locator: dialog() },
  );
  await closeDialog();
  await page.setViewportSize({ width: 390, height: 844 });
  await go('/admin');
  await shot('mobile', [btn('باز کردن منو'), page.locator('.bottom-nav')], { full: true });
  await btn('باز کردن منو').click();
  await shot('mobile-menu', [page.getByRole('dialog').getByRole('navigation')], { full: true });
  await closeDialog();
  await go('/admin/users');
  await page.locator('.data-card').first().locator('summary').click();
  await shot('mobile-list', [page.locator('.data-card').first()], { full: true });
  await btn('نمایش فیلترهای بیشتر').click();
  await shot('mobile-filters', [dialog().locator('form')], { full: true });
  console.log(
    JSON.stringify({
      captured: Object.keys(shots).length,
      manifest: path.relative(root, path.join(destination, 'manifest.json')),
    }),
  );
} finally {
  await browser.close();
}
