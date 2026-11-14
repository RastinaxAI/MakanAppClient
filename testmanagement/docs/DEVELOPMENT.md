# توسعه و بررسی پنل

Node.js نسخه 22 یا جدیدتر و npm لازم‌اند. در نصب تازه `.env.example` را در `.env.local` کپی و کلید خصوصی تصادفی `SESSION_SECRET` را تنظیم کنید. فایل موجود را بازنویسی نکنید.

```powershell
npm ci
npm run dev
npm run typecheck
npm test
```

ورود محلی پیش‌فرض `http://127.0.0.1:3000/login` است؛ `APP_ORIGIN` باید با نشانی اجرا برابر باشد. برای پورت جدا، همان پورت را در `APP_ORIGIN` و `npm run dev -- --port 3111` تنظیم کنید. اجرای production محلی: `npm run build` و سپس `npm start`.

```powershell
$env:MAKAN_TEST_PORT='3110'
npx playwright test
# Docker روشن روی پورت 3101
$env:DOCKER_APP_URL='http://127.0.0.1:3101'
npx playwright test --config playwright.docker.config.ts
```

e2e با سرور مستقل fixture اجرا می‌شود؛ تست Docker به کانتینر روشن نیاز دارد. Chrome باید نصب باشد. آزمون داده‌های واقعی سرور با آزمون fixture یکسان نیست.

آزمون اسکریپت استقرار با Nginx و TLS واقعی در محیط جدا؛ دستورات سیستم و Docker در تست شبیه‌سازی می‌شوند و Docker socket به آن داده نمی‌شود:

```powershell
docker build -t makan-management-deploy-tests tests/deployment
docker run --rm --network none --mount "type=bind,source=$($PWD.Path),target=/work,readonly" makan-management-deploy-tests
```

خروجی تست‌ها در `maintenance/generated` است و وارد Git یا بستهٔ سرور نمی‌شود. PDF راهنمای تصویری جاری در `public/guides/makan-owner-guide.pdf` قرار دارد و نسخه قابل تحویل آن در `output/pdf/MakanApp_Admin_Visual_User_Guide_FA.pdf` تولید می‌شود. تصاویر و خروجی میانی راهنمای جدید در `tmp/pdfs/owner-handbook` هستند. اسکن Tailwind به سورس فعال محدود است و مستندات، تست‌ها و قراردادهای تولیدشده را بررسی نمی‌کند.

تست‌های تصویری به‌صورت پیش‌فرض تصاویر موقت را در `maintenance/generated/redesign-screenshots` می‌نویسند. تصاویر قدیمی `docs/screenshots/redesign-20261030` منبع راهنمای کامل جدید نیستند.

برای بازسازی راهنمای کامل، ابتدا پس از build یک سرور نمایشی ایزوله را در ترمینال جدا اجرا کنید. هیچ عکس یا داده‌ای از حساب واقعی دریافت نمی‌شود:

```powershell
node scripts/test-server.mjs --skip-build
```

سپس در ترمینال دوم:

```powershell
node scripts/capture-owner-handbook.mjs
node scripts/build-user-handbook.cjs
```

متن درس‌ها در `scripts/owner-handbook-content.cjs` است. سازنده، توضیح‌ها و فلش‌ها را داخل تصاویر قرار می‌دهد و چیدمان را قبل از تولید PDF کنترل می‌کند. خروجی باید با Poppler رندر و از نظر بصری بررسی شود؛ فایل نهایی در مسیر عمومی راهنمای داخل پنل نیز کپی می‌شود. پس از پایان، سرور نمایشی را ببندید.

برای تغییر قرارداد، snapshot را دریافت، اختلاف را مرور و سپس کد تولیدشده را بازسازی کنید:

```powershell
npm run api:update
npm run api:generate
npm run typecheck
npm test
```

نگاشت مجوزها از `contracts/platform-permissions.json` می‌آید. نقش مالک مجوز اضافی عملیات یا دسترسی به محتوای خصوصی ایجاد نمی‌کند.

گزارش جاری تطبیق با مستندات `e5bd3ea` و Swagger زنده در [INTEGRATION-e5bd3ea.md](INTEGRATION-e5bd3ea.md) است. آزمون‌های اختصاصی مالی، محدودیت مسیرهای پرداخت و وضعیت سرویس‌ها:

```powershell
npx playwright test tests/e2e/release-e5bd3ea.spec.ts tests/e2e/release-6f8edf8.spec.ts tests/e2e/official-spaces-boundary.spec.ts
```

این آزمون‌ها از مجوزهای واقعی و مستقل مالی، عملیات و اعلان‌ها در fixture استفاده می‌کنند؛ نگاشت عمومی `fixture.manage` جای آن‌ها را نمی‌گیرد. آزمون واحد `documented-permissions.test.ts` نیز نگاشت‌های صریح `x-platform-permissions` در snapshot جاری را با نگاشت پنل مقایسه می‌کند. [گزارش قبلی 6f8edf8](INTEGRATION-6f8edf8.md) برای پیگیری تاریخی نگه داشته شده است.

## آزمون زنده اتصال

پس از build، ابزار زیر یک نمونه موقت محلی پنل روی پورت 3112 اجرا می‌کند و آن را به بک‌اند تنظیم‌شده وصل می‌کند. هیچ توکن، شماره، کد ورود یا بدنه خصوصی در گزارش ذخیره نمی‌شود. مقدار متغیرها را فقط در نشست ترمینال وارد کنید و در فایل یا Git ننویسید:

```powershell
$env:MAKAN_LIVE_OWNER_PHONE='<شماره حساب مالک آزمایشی>'
$env:MAKAN_LIVE_OTP='<کد ورود معتبر محیط تست>'
# اختیاری: بررسی رد ورود حساب غیرمالک
$env:MAKAN_LIVE_NONOWNER_PHONE='<شماره حساب غیرمالک آزمایشی>'
node scripts/verify-live-integration.mjs
```

حالت پیش‌فرض، صفحه‌ها و APIهای خواندنی را بررسی می‌کند. آزمون تغییرات کتابخانه را فقط با `--library-lifecycle` و روی سرور تست `http://94.184.32.84:8090` اجرا کنید. این آزمون PDF راهنمای موجود را بارگذاری، یک منبع QA پنهان ایجاد و در پایان آن را بایگانی می‌کند. رکورد بایگانی‌شده برای پیگیری باقی می‌ماند؛ حذف منبع در قرارداد وجود ندارد. نتیجه در `maintenance/generated/integration-vnext/live-report.json` ذخیره می‌شود. نشست آزمایشی و سرویس موقت در پایان بسته می‌شوند.

تست مستقل کتابخانه: `npx playwright test tests/e2e/library.spec.ts`. گزارش HTML مجموعه مرورگر در `maintenance/generated/playwright-report/index.html` است. نتیجه این تست‌های fixture را با تأیید زنده عملیات واقعی یکی ندانید.

بررسی image مستقل Docker پس از تنظیم همان متغیرهای حساب آزمایشی:

```powershell
docker build -t makan-management:integration-vnext .
node scripts/verify-docker-integration.mjs
```

این ابزار فقط کانتینر موقت خودش را روی پورت 3113 ایجاد و در پایان حذف می‌کند؛ به volume نشست‌های نصب موجود وصل نمی‌شود و کلید نشست تصادفی آن در گزارش نوشته نمی‌شود. نتیجه در `maintenance/generated/integration-vnext/docker-report.json` ذخیره می‌شود.

ساخت بسته قابل ارسال از ریشه پروژه:

```powershell
npm run release:package
```

فقط فایل‌های مجاز اجرا بسته‌بندی می‌شوند و SHA256 و فهرست فایل‌ها کنار بسته قرار می‌گیرند. `node_modules`، `.next`، تاریخچه، گزارش‌ها، تست‌ها و env خصوصی وارد بسته نمی‌شوند.
