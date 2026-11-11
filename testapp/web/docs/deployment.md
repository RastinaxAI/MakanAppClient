# بستهٔ جاری با اصلاح موبایل

`/home/omidreza-bagheriyan/Desktop/MakanApp-cleanup-backup-2026-11-11/v52-mobile/MakanApp-V5.2-Mobile-Fix-Next-standalone-20261111.tar.gz`

اندازه `18,365,361`بایت؛ SHA256 `b670b15e62392bd9d2724a98f1766f47a1482e40261660997fbe0abb84872589`؛ build `c4VOPHvl04TmoDfeVB5F9`.۳۷بررسی runtime معمولی محلی موفق؛ Docker/سرور مقصد اجرا نشده‌اند. تنظیمات و secret/session volume موجود حفظ شوند. شیوهٔ اجرا پایین معتبر است؛ بستهٔ V5.2 پایین، تاریخچه و قبل از hotfix موبایل است. [رسید](quality/V52_MOBILE_FIX_20261111.json) · [preview](http://127.0.0.1:3130/enter)

<!-- MOBILE_DEPLOY_20261111 -->

# استقرار کلاینت V5.2 — ۱۱ نوامبر ۲۰۲۶

سورس فعال `web/` و launcher/Compose معتبر موجود حفظ‌اند. بستهٔ مستقل آمادهٔ انتقال:

`/home/omidreza-bagheriyan/Desktop/MakanApp-cleanup-backup-2026-11-11/v52/MakanApp-V5.2-Next-standalone-20261111.tar.gz`

اندازه `18,364,590`بایت؛ SHA256 `9dbebeced038483c5e69ac29c23b5aceefaf84d18d5ef66c6e8c22f633e5b858`؛ build `HbJq-WZ7L6o9XAYPK2OWv`. بسته شامل runtime، public/static و config عمومی شبکه است؛ env، اسرار، نشست محلی، مرجع و QA همراهش نیستند. Node۲۴.۲۱ محلی با37بررسی معمولی و backend ایزوله پاس شد؛ Docker/سرور مقصد اجرا نشده‌اند. previewمحلی build `Lj1XDtp0iyp3PfXaZS43s` از همان سورس است؛ دو build مستقل، شناسه‌های جدا دارند.

مسیر معتبر نصب موجود با `setup.sh --update` پایین است. برای اجرای مستقیم بسته، در پوشهٔ انتشار و با env معتبر `node docker-start.mjs` اجرا می‌شود. `SESSION_SECRET`،`APP_ORIGIN`،`COOKIE_SECURE` و`SESSION_DIRECTORY` باید با نصب موجود سازگار باشند؛ کلید و session volume را عوض نکنید. `PORT` و`HOSTNAME` متناسب سرویس باشند. مقدار غیرخالی `BACKEND_BASE_URL` بر پیش‌فرض config۸۰۹۰ تقدم دارد. `MAKAN_TEST_MODE` و`MAKAN_REFERENCE_PREVIEW` در محصول فعال نشوند. secret در فرمان یا گزارش چاپ نشود.

[گزارش رابط](ui-updates/v5.2/README.md) · [رسید/هش](quality/V52_HANDOFF_20261111.json) · [نتیجه و حدود تأیید](RELEASE_READINESS.md)

---

# استقرار نسخهٔ آبی V3 و قرارداد 80c2e61

راهنمای معتبر نصب موجود و نصب تازه در [readme.md ریشه](../../readme.md) است. فایل‌های `setup.sh` و `web/` را از بستهٔ جدید با هم منتقل کنید.

```bash
sudo bash setup.sh --check
sudo bash setup.sh --update
```

پروژهٔ Compose ثابت `makan-client`، سرویس منفرد `web` و volume `makan-client_sessions` حفظ می‌شوند. کلید و فایل خصوصی موجود بازنویسی نمی‌شوند. مقدار غیرخالی `BACKEND_BASE_URL` در env بر `config/network.json` تقدم دارد؛ مقدار خالی اکنون در شروع Docker هم درست پشتیبانی می‌شود. پیش‌فرض بسته بک‌اند تست۸۰۹۰ است؛ origin فرانت‌اند HTTPS دامنهٔ خود برنامه است.

Docker context شامل تنظیمات شبکه، prebuild برند، کاتالوگ متن، فونت‌ها، قرارداد تولیدشده و manifest لازم مرجع است. private env، session، node_modules میزبان و نتایج مرورگر وارد image نمی‌شوند. پردازهٔ واحد standalone با uid1000 و volume نشست پایدار اجرا می‌شود؛ چند replica با همین فایل‌سیستم محلی پشتیبانی‌شده نیستند. تاریخ‌ها در API UTC و ورودی/نمایش جلالی در رابط هستند.

قالب Nginx نصب تازه سقف۱۲MiB و proxy_read_timeout=120s دارد؛ حالت آپدیت Nginx قدیمی را تغییر نمی‌دهد. پیام سلامت فقط دربارهٔ HTTP برنامه است؛ DB/ACL، پرداخت، AI و Push نیازمند وضعیت معتبر بک‌اند هستند. پنل مالک و Vite بازنشسته وارد استقرار کلاینت نمی‌شوند.

شواهد اختصاصی و محدودیت Docker در [DEPLOYMENT_80C_CHECKS.json](quality/DEPLOYMENT_80C_CHECKS.json)، جزئیات برنامه در [گزارش اتصال](RELEASE_80C_INTEGRATION_FA.md) و تاریخچه در [PROGRESS.md](PROGRESS.md) است.
