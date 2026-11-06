# MakanClient

مخزن یکپارچهٔ پنج پروژهٔ ماکان و ابزار استقرار Docker روی سرور `89.46.217.168`.

| پوشه | نشانی | بک‌اند |
| --- | --- | --- |
| `landing` | `https://makanapp.org` | API و PostgreSQL اختصاصی داخل Docker |
| `app/web` | `https://app.makanapp.org` | `http://94.184.32.84` |
| `management` | `https://management.makanapp.org` | `http://94.184.32.84` |
| `testapp/web` | `https://testapp.makanapp.org` | `http://94.184.32.84:8090` |
| `testmanagement` | `https://testmanagement.makanapp.org` | `http://94.184.32.84:8090` |

سورس هر پنج پروژه مستقیماً در این مخزن نگهداری می‌شود؛ clone مخزن به submodule یا دریافت جداگانهٔ مخزن‌های قبلی نیاز ندارد.

## استقرار

[راهنمای کامل فارسی، پیش‌نیازها، انتقال نسخهٔ قبلی و پشتیبان‌گیری](DEPLOYMENT.fa.md) را بخوانید. پس از انتقال سورس به سرور، از ریشهٔ همین مخزن اجرا کنید:

```bash
sudo bash ./deploy.sh init && sudo bash ./deploy.sh check && sudo bash ./deploy.sh up
```

اجرای دوبارهٔ `init` فایل محیط موجود را حفظ می‌کند. پس از پیام موفقیت init به `check` و `up` ادامه دهید. بخش انتقال تنظیمات قدیمی فقط زمانی لازم است که فایل‌ها و داده‌های نصب production قبلی واقعاً موجود باشند؛ مسیرهای `/etc/makanapp/...` روی نصب تازه لازم نیستند.

اگر لندینگ production قبلی با داده‌های موجود دارید، ابتدا مراحل انتقال و واردکردن کلیدها و volumeهای قبلی در راهنما را انجام دهید.

HTTPS با ایمیل `rastinaxoffice@gmail.com` تنظیم شده است. فایل محیط واقعی، رمزها، نشست‌ها و پشتیبان‌ها محلی می‌مانند؛ فقط نمونه‌های بدون رمز در Git نگهداری می‌شوند.

## بررسی تنظیمات استقرار

```bash
python3 -m unittest discover -s deployment/tests -v
```

وضعیت build و محدودیت‌های اعتبارسنجی در بخش پایانی راهنمای استقرار ثبت شده‌اند.

دانلود وابستگی‌های Python لندینگ از mirror HTTPS و با همان نسخه‌ها و hashهای `uv.lock` انجام می‌شود. اگر سورس قبلی روی سرور در دانلود PyPI متوقف شده، بخش «خطای Failed to download nh3» در راهنمای استقرار، بسته و فرمان ادامهٔ نصب را توضیح می‌دهد.
