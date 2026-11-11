# ماکان — کلاینت Next.js

تنها برنامهٔ اجرایی این پروژه داخل `web/` است: Next.js 16.4.2، React 19.3.1 و TypeScript. `src/app` از App Router استفاده می‌کند؛ BFF و نشست server-only در همین برنامه‌اند. ریشه فقط راه‌انداز npm و Compose است. پنل مالک در برنامهٔ مستقل MakanManagement قرار دارد.

## اجرا

Node.js 22 یا جدیدتر لازم است؛ نسخهٔ توسعه در `.nvmrc` ثبت شده است. از این پوشه اجرا کنید:

```sh
npm ci
npm run dev:design-review
```

[ورود محلی](http://127.0.0.1:3130/enter) به بک‌اند تستِ `config/network.json` وصل می‌شود. این فرمان دادهٔ نمونه یا پاسخ ساختگی دستیار را فعال نمی‌کند. کلید توسعه و نشست‌ها در `.makan-qa-sessions` با دسترسی محدود، خارج از Git نگه‌داری می‌شوند؛ کلید موجود بازنویسی نمی‌شود. برای تغییر پورت، `MAKAN_DEV_PORT` را تنظیم کنید.

```sh
npm run build
npm run preview:upgrade
```

برای استقرار از [راهنمای ریشه](../readme.md)، `Dockerfile` و Compose موجود استفاده کنید. فایل‌های خصوصی محیط و volume نشست را حفظ کنید. ورود واقعی به حساب تست و آمادگی سرویس AI جدا از موفقیت build بررسی می‌شوند.

## ساختار فعال

- `src/app`: مسیرها، layoutها، Route Handlerها و metadata Next.js.
- `src/features`: امکانات واقعی آموزشگاه، فوق‌برنامه، دستیار، منابع، پیام‌رسان و حساب.
- `src/components`: اجزای مشترک، ناوبری، فرم و پنجره‌ها.
- `src/lib/server`: نشست، احراز هویت و مرز مجاز ارتباط با بک‌اند؛ توکن در مرورگر افشا نمی‌شود.
- `contracts` و `src/generated`: snapshot ثبت‌شدهٔ OpenAPI، سطح مجاز کلاینت و SDK تولیدشده.
- `src/content/fa.ts`: متن ثابت رابط؛ `src/design` و `design/tokens.json`: تم و طراحی مشترک.
- `design/reference-v5`: تنها مرجع فعال طراحی. این پوشه ابزار/سند طراحی است و برنامهٔ اجرایی نیست.
- `tests`: آزمون‌های واحد و مرورگر با بک‌اند ایزوله؛ نتیجهٔ آن‌ها شاهد اجرای provider زنده نیست.

## دستیار و منابع

دستیار از APIهای Chat، Knowledge/RAG و ابزارهای مجاز نقش فعال استفاده می‌کند. انتخاب پرداخت‌کننده صریح است؛ intent پیش از ارسال حفظ می‌شود و پاسخ نامطمئن retry خودکار ندارد. منبع و نسخهٔ استناد با انتخاب و preflight معتبر تطبیق داده می‌شوند. مسیر قدیمی استودیوی نمایشی به دستیار واقعی هدایت می‌شود.

منابع، فهرست، جزئیات، محتوا، نسخه‌ها، نمایش و آماده‌سازی برای دستیار دارند. مجوزهای برگشتی سرور تعیین‌کننده‌اند. فایل، منبع و Knowledge سه وضعیت مجزا دارند؛ آپلود موفق به معنی آماده‌شدن پاسخ AI نیست. [گزارش قرارداد](docs/integration/6f8edf8-implementation.md) و [آزمون واقعی چهار حساب و پیش‌نیازهای باز](docs/integration/20261110-four-role-live.md) را ببینید.

## بررسی و نگه‌داری

```sh
npm run lint
npm run typecheck
npm test
npm run generated:check
npm run build
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

آزمون مرورگر production build لازم دارد و بک‌اند ایزولهٔ خودش را اجرا می‌کند. `npm run quality` همین مراحل را با بررسی قالب‌بندی اجرا می‌کند. دریافت snapshot تازهٔ بک‌اند از `npm run api:update` و بازتولید SDK از `npm run api:generate` انجام می‌شود؛ تغییر قرارداد نیاز به بررسی دارد. `npm run design:build` فقط توکن و فهرست مرجع V5 را تولید می‌کند، نه محصول جایگزین.

ممیزی وابستگی مسیرهای واقعی: `node scripts/audit-next-runtime.mjs --json`. نامزد بدون مصرف، به‌تنهایی مجوز حذف فایل نیست. پس از توقف سرور توسعه، `npm run clean:cache` کش ابزارها را پاک می‌کند و build production، secrets و نشست‌ها را حفظ می‌کند.

[پیشرفت و محدودیت‌های جاری](docs/PROGRESS.md) · [ماتریس ۵۲۸ موقعیت](docs/design/exact-v1/screen-route-matrix.csv) · [رسیدهای پاک‌سازی](docs/maintenance) · [راهنمای آزمون مرورگر](tests/browser/test.ts)

تطبیق کامل همهٔ حالت‌های PDF و آزمون حساب واقعی باید از رسید همان حالت خوانده شود؛ تصاویر اطلس یا پاس‌شدن build، شاهد تکمیل کل محصول نیستند.
