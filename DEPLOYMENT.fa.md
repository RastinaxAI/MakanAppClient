# استقرار یکپارچهٔ پنج سایت ماکان

از این پس ورودی استقرار پنج پوشه، فایل `deploy.sh` در همین پوشهٔ مادر است. این راه‌انداز imageهای Docker موجود در پروژه‌ها را می‌سازد و یک Caddy مشترک، مسیریابی و HTTPS همهٔ دامنه‌ها را انجام می‌دهد.

## شروع یا ادامهٔ نصب تازه

اگر Docker همین حالا نصب شده و پیام `Production credentials created with mode 600` را دیده‌اید، ساخت کلیدها موفق بوده است. فایل `.env.production` مخفی است؛ وجودش را با `ls -l /opt/makanapp/.env.production` بررسی کنید و محتوایش را منتشر نکنید.

در همان ترمینال سرور، از پوشهٔ مادر پروژه اجرا کنید:

```bash
cd /opt/makanapp
bash ./deploy.sh init && bash ./deploy.sh check && bash ./deploy.sh up
```

تکرار `init` کلید موجود را حفظ می‌کند. این زنجیره در اولین خطا متوقف می‌شود. پس از موفقیت:

```bash
bash ./deploy.sh verify
```

مسیرهای `/etc/makanapp/production.env` و `/etc/makanapp/compose.nginx.json` مربوط به **نصب قدیمی** هستند؛ این مسیرها دستور قابل اجرا نیستند. نبودنشان روی سرور تازه عادی است. برای نصب تازه آن‌ها را نسازید و `--import-landing-env` اجرا نکنید. اگر نصب قدیمیِ واقعی و داده‌های قبلی دارید، بخش ۴ را بخوانید؛ راه‌انداز وجود داده‌های قبلی بدون کلید را بررسی می‌کند.

| پوشهٔ سورس | دامنه | API پنل |
| --- | --- | --- |
| `app/web` | `https://app.makanapp.org` | `http://94.184.32.84` |
| `management` | `https://management.makanapp.org` | `http://94.184.32.84` |
| `testapp/web` | `https://testapp.makanapp.org` | `http://94.184.32.84:8090` |
| `testmanagement` | `https://testmanagement.makanapp.org` | `http://94.184.32.84:8090` |
| `landing` | `https://makanapp.org` | API اختصاصی لندینگ داخل Docker |

مسیر `/swagger/index.html` فقط برای مشاهدهٔ مستندات و بررسی اتصال است؛ آدرس پایهٔ تماس برنامه باید origin ستون آخر باشد. آدرس‌های دو محیط در Compose صریحاً جدا شده‌اند. مرورگر به API داخلی همان دامنهٔ HTTPS متصل می‌شود و سرور Next.js با بک‌اند HTTP تماس می‌گیرد؛ بنابراین درخواست HTTP مستقیم از مرورگر و خطای Mixed Content ایجاد نمی‌شود.

این فایل و اسکریپت روی سرور اجرا می‌شوند. آماده‌شدن فایل‌ها در کامپیوتر توسعه، به‌تنهایی تغییری در سرور یا DNS ایجاد نمی‌کند.

## ۱. پیش‌نیازها و DNS

سرور Ubuntu یا Debian با معماری پشتیبانی‌شدهٔ imageها و دسترسی اینترنت به registryها و مخازن npm/Python لازم است. برای ساخت ترتیبی این پروژه‌ها، ۸ گیگابایت RAM و حداقل ۲۰ گیگابایت فضای آزاد، نقطهٔ شروع پیشنهادی است؛ مصرف نهایی با بار واقعی سنجیده شود. نصب اولیه با root یا sudo انجام می‌شود.

طبق تصویر ارائه‌شده، IP سرور فرانت‌اند `89.46.217.168` است. این IP با IP سرور API، یعنی `94.184.32.84`، متفاوت است. رکوردهای زیر باید به **سرور فرانت‌اندی که اسکریپت روی آن اجرا می‌شود** اشاره کنند:

| نوع | نام | مقدار |
| --- | --- | --- |
| A | `@` | `89.46.217.168` |
| A | `www` | `89.46.217.168` |
| A | `app` | `89.46.217.168` |
| A | `management` | `89.46.217.168` |
| A | `testapp` | `89.46.217.168` |
| A | `testmanagement` | `89.46.217.168` |

اگر IP سرور عوض شده، رکوردها و `MAKAN_SERVER_IP` در فایل محیط را اصلاح کنید. رکورد wildcard برای این استقرار ضروری نیست. اگر IPv6 سرویس نمی‌دهید، رکوردهای AAAA این نام‌ها را حذف کنید؛ در صورت استفاده، آدرس درست را در `MAKAN_SERVER_IPV6` وارد کنید.

برای این راه‌انداز، رکوردها باید **DNS only** باشند؛ همین وضعیت در تصویر دیده می‌شود. اسکریپت انطباق DNS را قبل از ساخت بررسی می‌کند. فعال‌کردن پراکسی CDN بعداً به تنظیم درست HTTPS بین CDN و origin، عدم cache پاسخ‌های API/ورود و تنظیم IP واقعی کاربران نیاز دارد؛ تنظیم فعلی عمداً به هدرهای IP ارسال‌شده از اینترنت اعتماد نمی‌کند.

پورت‌های ورودی TCP `80` و `443` را در فایروال سرور و پنل ارائه‌دهنده باز کنید. دسترسی SSH را حفظ کنید. از سرور فرانت‌اند، خروجی TCP به `94.184.32.84:80` و `94.184.32.84:8090` نیز باید باز باشد. API، PostgreSQL و پورت‌های داخلی پنل‌ها روی IP عمومی منتشر نمی‌شوند.

صدور و تمدید گواهی با ایمیل `rastinaxoffice@gmail.com` و Let's Encrypt انجام می‌شود. Caddy مسیر اعتبارسنجی ACME را مدیریت می‌کند؛ Certbot یا cron تمدید جداگانه لازم نیست. برای صدور گواهی، DNS و دسترسی عمومی ۸۰/۴۴۳ باید درست باشند. [مستندات HTTPS خودکار Caddy](https://caddyserver.com/docs/automatic-https)

پراکسی از image رسمی Caddy نسخهٔ `2.11.9` با digest ثابت استفاده می‌کند. این نسخه در ۵ نوامبر ۲۰۲۶ منتشر شده و اصلاحات نگهداری و امنیتی دارد. [یادداشت انتشار رسمی](https://github.com/caddyserver/caddy/releases/tag/v2.11.9)

## ۲. انتقال سورس

پنج پوشه و فایل‌های جدید را با همین ساختار، مثلاً در `/opt/makanapp` قرار دهید:

```text
/opt/makanapp/
├── app/web/
├── testapp/web/
├── management/
├── testmanagement/
├── landing/
├── deployment/
├── compose.production.yaml
├── .env.production.example
├── deploy.sh
└── DEPLOYMENT.fa.md
```

نیازی به انتقال `node_modules`، `.next`، `.git`، فایل‌های session و رمزهای محیط توسعه نیست. همهٔ فایل‌های سورس، lockfileها، فایل‌های public و Dockerfileهای پروژه را نگه دارید. `.env.production.example` فایل ساختار تنظیمات است و باید منتقل شود؛ فایل محیط واقعی با آن متفاوت است.

نمونهٔ انتقال از پوشهٔ مادر روی کامپیوتر توسعه:

```bash
rsync -az --no-owner --no-group \
  --exclude=node_modules --exclude=.next --exclude='.next-*' \
  --exclude=.git --exclude=.venv --exclude=__pycache__ \
  --exclude=.deployment --exclude=.makan-sessions \
  --include=.env.production.example --exclude='.env*' \
  --exclude=test-results --exclude=playwright-report --exclude=output \
  ./ root@89.46.217.168:/opt/makanapp/
```

این دستور فایل‌های مقصد را حذف نمی‌کند و فایل محیط موجود سرور را جایگزین نمی‌کند. بعداً نیز همین روش را برای انتقال سورس به‌روز استفاده کنید.

## ۳. نصب تازه

اگر روی این سرور نسخهٔ production قبلی لندینگ ندارید:

```bash
cd /opt/makanapp
sudo bash ./deploy.sh
```

همین فرمان، وابستگی‌های لازم و در صورت نیاز Docker/Compose را نصب می‌کند، کلیدهای مستقل می‌سازد، DNS و APIها را بررسی می‌کند، imageها را **ترتیبی** می‌سازد، migration و ورود محتوای لندینگ را اجرا می‌کند، سرویس‌ها را بالا می‌آورد و HTTPS هر شش نام شامل `www` را آزمایش می‌کند. نصب Docker از مخزن رسمی انجام می‌شود؛ راه‌انداز داده‌های runtimeهای قبلی را حذف نمی‌کند. [نصب رسمی Ubuntu](https://docs.docker.com/engine/install/ubuntu/)، [نصب رسمی Debian](https://docs.docker.com/engine/install/debian/)

برای ساخت فایل محیط و بازبینی آن پیش از انتشار:

```bash
sudo bash ./deploy.sh init
sudoedit /opt/makanapp/.env.production
sudo bash ./deploy.sh check
sudo bash ./deploy.sh up
```

فایل `.env.production` با دسترسی `600` ساخته می‌شود و در اجراهای بعدی تغییر نمی‌کند. کلیدهای session چهار پنل و کلیدها/رمزهای لندینگ همگی مستقل‌اند. این فایل را در Git، فایل اشتراکی یا خروجی لاگ قرار ندهید و یک نسخهٔ خصوصی خارج از سرور نگه دارید. اگر volumeهای قبلی وجود داشته باشند ولی فایل کلیدها گم شده باشد، اسکریپت از تولید رمز جدید خودداری می‌کند.

برای نگهداری فایل محیط خارج از سورس، از اولین نصب مسیر ثابتی انتخاب کنید و در **همهٔ فرمان‌های بعدی** همان مسیر را بدهید:

```bash
sudo env MAKAN_ENV_FILE=/etc/makan-platform/production.env bash ./deploy.sh up
```

کلید `PlatformOwner` در دو پنل مدیریت از قبل مطابق تنظیم فعلی پروژه در نظر گرفته شده است. اگر بک‌اند اصلی یا تست کلید نقش دیگری دارد، فقط `MAKAN_MANAGEMENT_OWNER_ROLE_KEYS` یا `MAKAN_TESTMANAGEMENT_OWNER_ROLE_KEYS` را با آرایهٔ JSON دقیق همان بک‌اند تنظیم کنید؛ کنترل مجوزهای برنامه فعال می‌ماند.

## ۴. انتقال نسخهٔ production قبلی لندینگ

این بخش فقط برای نصب قدیمی با فایل تنظیمات و volumeهای موجود است و پس از نصب تازه اجرا نمی‌شود. اگر `init` موفق شده و فایل‌های قدیمی وجود ندارند، به فرمان‌های `check` و `up` در ابتدای راهنما ادامه دهید.

اگر قبلاً `landing/setup.sh` با Nginx اجرا شده و داده‌های production موجود دارید، **نصب تازه انجام ندهید**. این انتقال باید همان کلیدها، دیتابیس و رسانه‌ها را استفاده کند. پیش از اجرای فرمان‌های این بخش، وجود فایل‌های قدیمی در مسیر واقعی نصب قبلی را تأیید کنید؛ فایل خالی به‌جای تنظیمات قبلی نسازید.

ابتدا محل تنظیمات و نام volumeهای فعلی را ببینید؛ مقادیر رمزها را چاپ نکنید:

```bash
sudo docker --host unix:///var/run/docker.sock compose \
  -f /etc/makanapp/compose.nginx.json ps
sudo docker --host unix:///var/run/docker.sock volume ls \
  --filter label=com.docker.compose.project=makan-landing-prod
```

از نسخهٔ قبلی، فایل محیط، دیتابیس و رسانه‌ها را قبل از انتقال پشتیبان بگیرید. نمونهٔ dump از stack قبلی، در پوشهٔ خصوصی:

```bash
sudo install -d -m 700 /root/makan-before-unified
sudo bash -c 'umask 077; docker --host unix:///var/run/docker.sock compose -f /etc/makanapp/compose.nginx.json exec -T db sh -c '\''exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc'\'' > /root/makan-before-unified/landing-db.dump'
sudo cp --preserve=mode /etc/makanapp/production.env /root/makan-before-unified/production.env
```

برای آرشیو رسانه‌ها، از ابزار backup نسخهٔ قبلی یا volume `makan-landing-prod_media_data` استفاده کنید. dump دیتابیس به‌تنهایی شامل فایل‌های بارگذاری‌شده نیست.

کلیدها را وارد تنظیمات جدید کنید:

```bash
cd /opt/makanapp
sudo bash ./deploy.sh init \
  --import-landing-env /etc/makanapp/production.env \
  --landing-project makan-landing-prod
```

اگر مسیر قبلی `/etc/makan-landing/production.env` بوده، همان مسیر را بدهید. دستور import فقط پیش از ساخته‌شدن فایل محیط جدید مجاز است. نام‌های پیش‌فرض volumeهای قبلی عبارت‌اند از `makan-landing-prod_postgres_data`، `makan-landing-prod_media_data` و `makan-landing-prod_operations_data`. اگر نام واقعی متفاوت است، سه مقدار `MAKAN_LANDING_*_VOLUME` را در فایل جدید اصلاح کنید. volumeهای واردشده باید وجود داشته باشند؛ راه‌انداز به‌جای آن‌ها volume خالی نمی‌سازد.

در زمان انتقال، stack قبلی را کاملاً متوقف کنید تا دو PostgreSQL روی یک volume اجرا نشوند:

```bash
sudo docker --host unix:///var/run/docker.sock compose \
  -f /etc/makanapp/compose.nginx.json stop
sudo systemctl stop nginx
sudo bash ./deploy.sh up
```

توقف Nginx مربوط به سروری است که این سایت‌ها را سرو می‌کند؛ اگر میزبان سایت‌های دیگری نیز هست، ابتدا مسیریابی آن‌ها را در طرح انتقال لحاظ کنید. اسکریپت سرویس‌های ناشناس سرور را خودکار متوقف نمی‌کند. پس از موفقیت کامل HTTPS، می‌توانید Nginx قدیمی را غیرفعال کنید تا پس از reboot پورت‌ها را اشغال نکند:

```bash
sudo systemctl disable nginx
```

دیگر `setup.sh`های داخل پنج پوشه را برای این استقرار اجرا نکنید؛ راه‌اندازهای قدیمی می‌توانند با پورت‌ها و تنظیمات مشترک جدید تداخل داشته باشند. فایل‌های قبلی برای مراجعه و بازیابی باقی می‌مانند.

## ۵. وضعیت، لاگ و به‌روزرسانی

```bash
cd /opt/makanapp
sudo bash ./deploy.sh status
sudo bash ./deploy.sh logs edge
sudo bash ./deploy.sh logs app
sudo bash ./deploy.sh logs landing-api
sudo bash ./deploy.sh verify
```

پس از انتقال سورس جدید، دوباره `sudo bash ./deploy.sh up` را اجرا کنید. پیش از migration، از داده‌های موجود لندینگ نسخهٔ پشتیبان گرفته می‌شود. هنگام backup و migration، وب/API و نگهداری لندینگ موقتاً متوقف می‌شوند. چهار پنل تا مرحلهٔ جایگزینی کانتینرهای خودشان کار می‌کنند. این روش استقرار، زمان کوتاه توقف دارد.

اگر imageها همین حالا از **همین سورس** ساخته شده‌اند و فقط ادامهٔ مرحلهٔ ناموفق نصب لازم است:

```bash
sudo env MAKAN_SKIP_BUILD=1 bash ./deploy.sh up
```

بعد از تغییر سورس از این گزینه استفاده نکنید. اسکریپت قفل اجرای هم‌زمان دارد؛ migration و ورود محتوا هرکدام مهلت ۳۰۰ ثانیه دارند و خروجی زنده چاپ می‌شود. اگر خطای migration رخ دهد، ادامهٔ انتشار متوقف می‌شود و لازم است قبل از فعال‌کردن دوبارهٔ لندینگ، خطا بررسی شود.

شروع کانتینر به‌تنهایی به معنای آماده‌بودن برنامه نیست. Compose این استقرار منتظر healthcheckهای وابستگی‌ها می‌ماند؛ پس از آن، اسکریپت اتصال API را از داخل هر چهار پنل، گواهی معتبر HTTPS، ریدایرکت HTTP و هویت سرویس هر دامنه را بررسی می‌کند. [ترتیب راه‌اندازی و سلامت سرویس‌ها در Docker Compose](https://docs.docker.com/compose/how-tos/startup-order/)

## ۶. مدیریت لندینگ

صفحهٔ مدیریت لندینگ در `https://makanapp.org/admin` است و از دو پنل `management` و `testmanagement` مستقل است. محتوای نوشته‌شدهٔ پروژه وارد می‌شود؛ حساب مدیر یا رمز پیش‌فرض عمومی ساخته نمی‌شود.

اگر لندینگ نصب تازه است، برای ایجاد مالک با شمارهٔ تلفن و تنظیم سرویس پیامک، در ترمینال تعاملی سرور اجرا کنید:

```bash
sudo bash ./deploy.sh admin
sudo bash ./deploy.sh sms
```

اطلاعات سرویس پیامک در ورودی پنهان درخواست می‌شوند. اگر حساب و پیامک از نصب قبلی وارد شده‌اند، دوباره bootstrap نکنید. ایمیل TLS به‌خودی‌خود حساب مدیریت ایجاد نمی‌کند. OTP ثابت و ورود آزمایشی در تنظیمات production غیرفعال‌اند.

## ۷. پشتیبان‌گیری و بازیابی

```bash
sudo bash ./deploy.sh backup
```

مسیر پیش‌فرض `.deployment/backups/<UTC timestamp>` است. برای مقصد دیگری:

```bash
sudo env MAKAN_BACKUP_DIR=/srv/private-backups/makanapp bash ./deploy.sh backup
```

پشتیبان کامل این فرمان شامل فایل محیط، dump دیتابیس لندینگ، آرشیو رسانه‌های موجود، آرشیو گواهی‌های Caddy در صورت وجود و فایل `SHA256SUMS` است. فقط پوشه‌هایی که `.complete` دارند کامل محسوب می‌شوند. برای سازگاری دیتابیس و فایل‌ها، نویسنده‌های لندینگ در طول backup متوقف و سپس دوباره اجرا می‌شوند. پوشه‌ها `700` و فایل‌ها `600` هستند. این نسخه‌ها رمزگذاری‌شده نیستند؛ در مقصد خصوصی نگه دارید و از مسیر امن به خارج سرور منتقل کنید. اسکریپت backupها را خودکار حذف نمی‌کند و زمان‌بندی دوره‌ای نصب نمی‌کند.

sessionهای چهار پنل در volumeهای مستقل باقی می‌مانند ولی در این backup آرشیو نمی‌شوند؛ پس از بازیابی روی سرور تازه کاربران آن پنل‌ها دوباره وارد می‌شوند. اطلاعات اصلی چهار پنل روی بک‌اندهای `94.184.32.84` هستند و باید روی همان سرورها جداگانه پشتیبان‌گیری شوند.

برای بازیابی اضطراری، ابتدا در محیط جداگانه صحت آرشیوها را با `sha256sum -c SHA256SUMS` و یک restore آزمایشی بررسی کنید. سپس کلیدهای **همان backup** را با دسترسی ۶۰۰ برگردانید، تمام نویسنده‌های لندینگ را متوقف کنید، PostgreSQL را با همان رمزها اجرا کنید و dump را با `pg_restore` داخل دیتابیس خالی بازیابی کنید. `media/` داخل آرشیو باید به ریشهٔ volume رسانه برگردد؛ مالک فایل‌های API و Caddy باید `10001:10001` باشد. هنگام بازگرداندن dump، migrationهای نسخهٔ سورس انتخاب‌شده و نسخهٔ داده باید با هم سازگار باشند. بازیابی production، جایگزینی داده است و نباید روی دیتابیس در حال استفاده آزمایش شود.

توقف عادی سرویس‌ها و نگهداری داده‌ها:

```bash
sudo bash ./deploy.sh down
```

از `docker compose down -v`، `docker volume prune` یا حذف `.env.production` برای به‌روزرسانی استفاده نکنید.

## ۸. رفع خطا

- **پس از init موفق، فایل `/etc/makanapp/production.env` پیدا نمی‌شود:** نصب جدید از `/opt/makanapp/.env.production` استفاده می‌کند. اگر تنظیمات قدیمی ندارید، وارد بخش انتقال نشوید؛ `bash ./deploy.sh check` و سپس `bash ./deploy.sh up` را اجرا کنید. پیام `Existing platform credentials were preserved` یعنی کلیدهای ساخته‌شده بازنویسی نشده‌اند؛ فایل محیط فعلی را حذف نکنید.
- **پورت ۸۰ یا ۴۴۳ اشغال است:** با `sudo ss -ltnup` سرویس را پیدا کنید. Nginx/Apache/Caddy قدیمی یا Compose مستقل داخل پوشه‌ها نباید هم‌زمان این پورت‌ها را بگیرند. اگر نسخهٔ قبلی لندینگ دارید، بخش انتقال را انجام دهید.
- **خطای Docker Desktop یا Podman socket:** این راه‌انداز به‌طور صریح از `unix:///var/run/docker.sock` استفاده می‌کند و context ذخیره‌شدهٔ کاربر را تغییر نمی‌دهد. `sudo systemctl status docker` و `sudo docker --host unix:///var/run/docker.sock info` را بررسی کنید.
- **DNS یا AAAA اشتباه:** هر شش نام باید به IP فرانت‌اند برسند. انتشار DNS را کامل کنید و دوباره `check` بزنید؛ IP API را در این رکوردها قرار ندهید.
- **صدور گواهی ناموفق:** ابتدا DNS، فایروال عمومی، CAA مجاز برای `letsencrypt.org` و دسترسی خروجی HTTPS را بررسی کنید. لاگ `edge` علت ACME را نشان می‌دهد. volume گواهی‌ها را برای تلاش مجدد پاک نکنید. اگر `MAKAN_ACME_CA` را به staging عوض کرده‌اید، گواهی آزمایشی مورد اعتماد مرورگر نیست و `verify` عمداً موفق نمی‌شود؛ برای انتشار به URL production برگردانید.
- **ظاهر سایت بالا آمده ولی API کار نمی‌کند:** `verify` باید اتصال از داخل هر چهار کانتینر را تأیید کند. فایروال بک‌اند باید IP سرور فرانت‌اند را روی پورت درست بپذیرد. `management` و `app` از پورت ۸۰ و دو نسخهٔ تست از ۸۰۹۰ استفاده می‌کنند.
- **ورود مدیر پنل رد می‌شود:** کلید نقش مالک در فایل محیط باید با همان بک‌اند منطبق باشد. مجوز مالک را برای عبور از این خطا غیرفعال نکنید.
- **Build به registry نمی‌رسد:** دسترسی سرور به Docker Hub، GHCR، npm و منابع Python را اصلاح کنید. lockfileها و digestهای Dockerfile را بدون بررسی تغییر ندهید.

### خطای `apt-get update`، timeout یا `404` روی `deb.debian.org`

اگر مرحلهٔ Python کامل شد ولی `runtime` با کد ۱۰۰ متوقف شد، دریافت فهرست یا بسته‌های Debian شکست خورده است. Dockerfileهای **هر دو سرویس API و وب لندینگ** اکنون از `https://mirrors.aliyun.com` برای `debian` و `debian-security` استفاده می‌کنند. اسکریپت `configure_apt.sh` فقط میزبان دریافت را تغییر می‌دهد؛ suiteهای `trixie`، `trixie-updates` و `trixie-security`، مؤلفه‌ها و `Signed-By` اصلی حفظ می‌شوند. APT همچنان امضا و اعتبار metadata و TLS را بررسی می‌کند و در خطای دانلود متوقف می‌شود. [احراز اصالت مخازن در APT](https://manpages.debian.org/trixie/apt/apt-secure.8.en.html)، [mirror عمومی Aliyun](https://developer.aliyun.com/mirror/debian)

image پایهٔ Node slim، CA سیستم‌عامل ندارد. پیش از اولین اتصال HTTPS، [ریشه‌های عمومی تعبیه‌شده در Node](https://nodejs.org/api/tls.html#tlsrootcertificates) از همان image قفل‌شده به یک PEM نوشته و مسیر آن با `Acquire::https::CaInfo` صریحاً به APT داده می‌شود؛ سپس بستهٔ رسمی `ca-certificates` نصب می‌شود. مرحلهٔ به‌روزرسانی بسته‌های سیستم‌عامل در هر دو image اجرا می‌شود.

بستهٔ `makan-apt-fix.tar.gz` که در ادامه معرفی شده، اصلاح APT و PyPI را با هم دارد. آن را روی سورس موجود باز کنید و `up` بزنید؛ به اجرای دوبارهٔ `init` یا حذف cache نیاز نیست. فایل `.env.production` و داده‌ها در این بسته نیستند.

برای انتخاب منبع دیگر در زمان build، از یکی از میزبان‌های HTTPS پشتیبانی‌شده استفاده کنید: `https://deb.debian.org`، `https://mirrors.aliyun.com`، `https://mirrors.tuna.tsinghua.edu.cn` یا `https://mirrors.ustc.edu.cn`. نمونهٔ بازگشت به منبع رسمی روی HTTPS:

```bash
MAKAN_DEBIAN_MIRROR_URL=https://deb.debian.org bash ./deploy.sh up
```

این متغیر فقط هنگام build به هر دو سرویس لندینگ داده می‌شود؛ آن را به `.env.production` اضافه نکنید. در صورت نیاز می‌توان آن را همراه با `MAKAN_PYPI_MIRROR_URL` در همان فرمان تعیین کرد.

### خطای `Failed to download nh3` یا timeout روی `files.pythonhosted.org`

این خطا در مرحلهٔ دانلود وابستگی‌های Python است. خط `CANCELED` در مرحلهٔ موازی OS، به‌تنهایی خطای apt را نشان نمی‌دهد؛ Docker با شکست مرحلهٔ دانلود، کارهای موازی را لغو می‌کند.

Dockerfile API اکنون از mirror HTTPS عمومی `https://mirrors.aliyun.com/pypi` استفاده می‌کند. فایل `install_locked.py` فقط URL دریافت توزیع‌ها را در نسخهٔ داخل build تغییر می‌دهد؛ `uv sync --frozen` همان نسخه‌ها و hashهای `uv.lock` را بررسی می‌کند و در پایان، بایت‌های lockfile اصلی بازگردانده می‌شوند. TLS و بررسی hash فعال می‌مانند. نام، نسخه و گراف وابستگی‌ها تغییر نکرده‌اند.

برای سروری که سورس نسخهٔ قبلی را دارد، بستهٔ اصلاح دانلودهای APT و PyPI را از کامپیوتر توسعه بفرستید:

```bash
scp /home/omidreza-bagheriyan/Desktop/MakanApp/output/deployment/makan-apt-fix.tar.gz root@89.46.217.168:/root/
```

سپس در ترمینال root سرور:

```bash
cd /opt/makanapp
tar -xzf /root/makan-apt-fix.tar.gz -C /opt/makanapp
bash ./deploy.sh up
```

این بسته شامل فایل محیط یا داده نیست. فایل `.env.production`، volumeها و کش ساخت موجود حفظ می‌شوند. پس از این خطا از `MAKAN_SKIP_BUILD=1` استفاده نکنید؛ image API هنوز باید کامل ساخته شود.

برای انتخاب mirror HTTPS دیگری، فقط در خط فرمان مقدار اختیاری زیر را بدهید؛ آن را به `.env.production` اضافه نکنید:

```bash
MAKAN_PYPI_MIRROR_URL=https://pypi.tuna.tsinghua.edu.cn bash ./deploy.sh up
```

برای بازگشت صریح به PyPI اصلی، مقدار این متغیر را خالی قرار دهید. روی سرور تازه، `bash ./deploy.sh up` به‌صورت پیش‌فرض از mirror تنظیم‌شده در Dockerfile استفاده می‌کند. [تنظیم indexهای uv](https://docs.astral.sh/uv/concepts/indexes/)

## ۹. اعتبارسنجی این بسته — ۷ نوامبر ۲۰۲۶

بررسی نحو Bash و sh، مدل نهایی Compose و ۲۱ آزمون تنظیمات و دانلودها موفق بودند. این آزمون‌ها حفظ کلیدها، جلوگیری از حذف volume، واردکردن تنظیمات قدیمی، جداسازی محیط‌ها، نسخه‌ها و hashهای قفل‌شدهٔ Python، حفظ تنظیمات امضای Debian و نپذیرفتن mirror نامعتبر را بررسی می‌کنند. نبودن فایل قدیمی کلید جدید نمی‌سازد و کلید فعلی را تغییر نمی‌دهد. خطای CSS Modules موجود در `shell.module.css` هر دو کلاینت که build production را متوقف می‌کرد نیز اصلاح شده است.

پس از اصلاح mirror، مرحلهٔ واقعی Docker builder API، نصب ۳۵ وابستگی و ساخت پروژهٔ `makan-landing-api==0.10.0` موفق شد. `nh3==0.3.7` در محیط ساخته‌شده موجود است و SHA-256 فایل `uv.lock` داخل image با فایل اصلی برابر است. آزمون واقعی با uv نیز دریافت wheel معتبر را پذیرفت و همان دریافت را با hash قفل‌شدهٔ نادرست رد کرد.

پس از اصلاح APT، ساخت کامل imageهای اصلی `makan-platform-landing-api:local` و `makan-platform-landing-web:local` از Dockerfileهای تولید موفق شد. فهرست‌های امضاشدهٔ Debian روی HTTPS دریافت شدند، بستهٔ CA در وب نصب شد و ارتقای OS در API و وب کامل شد؛ هر دو image نسخهٔ `apt 3.0.4`، `liblzma5 5.8.1-1+deb13u2` و `ca-certificates 20250419+deb13u1` دارند و با کاربر `10001:10001` اجرا می‌شوند.

آزمون یکپارچهٔ جدید از imageهای اصلی تولید، بدون override یا حذف مرحلهٔ APT، استفاده کرد. هر ۹ سرویس در شبکه‌ها و volumeهای موقت و فقط روی پورت‌های loopback اجرا شدند. HTTPS با CA خصوصی آزمایشی، مسیریابی هر پنج سایت، ریدایرکت HTTP و `www`، اتصال هر چهار پنل به API درست، ورود دوبارهٔ بدون تکرار ۲۶ رکورد محتوا، dump/restore دیتابیس، آرشیو رسانه و گواهی‌ها با کاربر غیرریشه و حفظ داده پس از حذف و ساخت مجدد کانتینرها موفق بودند. منابع موقت آزمون پاک شدند و سرویس‌های قبلی کامپیوتر تغییر نکردند.

**محدودیت بررسی:** این اعتبارسنجی در محیط محلی انجام شد. استقرار روی `89.46.217.168` و صدور گواهی عمومی نیازمند اجرای `deploy.sh up` روی همان سرور است؛ آزمون محلی از CA خصوصی استفاده کرد. راه‌انداز تولید پس از ساخت و اجرا، اتصال بک‌اندها و HTTPS عمومی هر دامنه را بررسی می‌کند.

اجرای دوبارهٔ آزمون‌های تنظیمات:

```bash
python3 -m unittest discover -s deployment/tests -v
```

پس از ساخته‌شدن imageهای تولید، آزمون runtime محلی زیر از volumeهای تصادفی خودش استفاده می‌کند و به DNS یا گواهی عمومی دست نمی‌زند:

```bash
python3 deployment/tests/smoke.py
```
