# مالکیت استایل و علت اختلاف‌های V6

Next16.4.2 و React موجود حفظ شدند. app از نو ساخته نشده و atlas وارد runtime نشده است. نام برخی componentهای v4/v5، نام سازگاری معماری فعلی است؛ منبع بصری این نوبت V6 است.

| لایه | مالک فعال | مسئولیت |
|---|---|---|
| رنگ/شعاع/اندازه | design/tokens.json → scripts/build-design.mjs → src/design/tokens.css | یک منبع توکن و تم روشن/تاریک؛ مرجع بسته با hash در design/v6-reference.json پین شده است. inventory V5 فقط سابقهٔ نگاشت است. |
| فونت/reset/bootstrap | src/app/globals.css،reset.css،layout.tsx | Vazirmatn محلی معتبر،RTL،انتخاب theme و اندازه۱۰۰/۱۵۰/۲۰۰٪ پیش از hydration. |
| کنترل‌ها | components/ui/button.module.css،field.module.css،dialog.module.css | متن ورودی۴۸،هدف تعاملی۴۴،رادیو۲۲ با label مناسب،Search افقی،Dialog با trap/Escape/restore. |
| ترکیب پوسته | components/v5/frame.module.css،scene.module.css و personal/shell.module.css | یک viewport؛ ریل۷۲/۲۰۸،محتوا۱۱۸۴،فرم۷۸۰،footer در چیدمان،ناوبری موبایل مجاز۳+۲ در۲۰۰٪. |
| صفحه/دامنه | CSS Modules هر feature | profile/chooser،chat/inbox،school/parent/manager،assistant،source،appearance و auth. CSS اختصاصی صفحه در root وارد نمی‌شود. |

root تنها reset/global/token،ماژول پایهٔ مشترک و date-picker معتبر را بار می‌کند. Tailwind/Preflight در package یا import فعال وجود ندارد؛ تغییر stack یا حذف وابستگی به نام Tailwind انجام نشده است. CVA و clsx در variant و uiClass مصرف دارند. چهار فایل عمومی متعارضِ پرامپت تاریخی، وضعیت فعلیِ import نیستند.

## اختلاف‌های مشاهده و اصلاح‌شده

- جنس DOM ورودی‌ها: قاعدهٔ text input به radio/checkbox می‌رسید. Input اکنون نوع کنترل را جدا می‌کند؛ انتقال CSS کارت به DOM رادیو انجام نمی‌شود.
- کشیدگی footer: قاعدهٔ flex عمومی، اقدام تبلت/دسکتاپ را تمام عرض می‌کرد. مالک footer به Scene منتقل شد: موبایل تمام‌عرض،بزرگ‌تر حداقل۱۸۰ در سمت آغاز RTL. هندسه از خود قاب داخلی V6 خوانده شد.
- root/section: kind و layout روی Scene واقعی مصرف می‌شوند؛ selector اطلس روی DOM دیگری کپی نشده است.
- متن۲۰۰٪/ارتفاع کم: قاعدهٔ short-height به AuthLayout فاقد rx-page-scroll-region هم می‌رسید و اسکرول document عنوان را از viewport خارج می‌کرد. selector فقط پوستهٔ دارای همان ظرف اسکرول را هدف می‌گیرد؛ Welcome مالک محتوای قابل پیمایش خودش است.
- پروفایل موبایل: media query عمومی editor،padding نسخهٔ compact را با۱۸ جایگزین می‌کرد. editor معمولی از compact تفکیک شد؛ عکس۷۶ و فاصله‌های compact مطابق مرجع بازسنجی شدند.
- پاراگراف کارت: selector قدیمی با .scope،رنگ variant صفحه را شکست می‌داد. specificity پایه با :where محدود شد تا رنگ صریح همان component مالک باشد؛ !important افزوده نشد.
- هدف لمس عنوان گفتگو: anchor فقط h1 با ارتفاع۲۸ بود. عنوان و زیرعنوان اکنون یک پیوند هویت با حداقل۴۴ هستند و رسم سربرگ جابه‌جا نمی‌شود.
- آزمون فعال: main معمولی و stage داخلی هم‌زمان مالک ارتفاع بودند؛ scroll parent شمارش‌گر را بالای viewport می‌برد. Shell و portal در حالت data-exam-room ارتفاع را به stage و scroll داخلی محتوا می‌دهند. زمان‌سنج و footer در چیدمان می‌مانند.
- cache/state: revision آموزشگاه کل زیر‌درخت حساب را remount می‌کرد. حساب/session از زمینه آموزشی جدا شد؛ BFF/server lock همچنان revision و مجوز را اعمال می‌کنند. nonce نامعلوم تا ACK معتبر باقی می‌ماند.

- مرز تبلت گفتگو: قاعدهٔ `@container workspace(min-width:700px)` ستون را در viewport۷۶۸با فضای مفید۶۹۶پنهان می‌کرد. نمایش ستون در همان مالک به breakpoint۷۶۸منتقل شد؛ عرض۲۸۰/۳۱۲و حفظ draft در آزمون مرزی کنترل می‌شوند.
- سربرگ تبلت: padding دسکتاپ و زیرعنوان۱۳به تبلت می‌رسید. Scene مالک۱۲×۲۴و متن۱۱با line-height۱٫۸۵شد؛ ارتفاع۷۶با قاب داخلی دوباره اندازه‌گیری می‌شود.
- فهرست و جستجو: root inbox سقف۱۱۸۴و مرکزچینی خودش را دارد؛ صفحهٔ نتایج جستجو padding فرم را حفظ می‌کند. toolbar ستون گفتگو۱۴است و با root فهرست یکی نشده است.
- نوار نوشتن دستیار: فهرست واقعی حساب از Messenger به‌صورت lazy و فقط در نمای بزرگ بازاستفاده می‌شود؛ ستون۲۸۰/۳۱۲، بدنهٔ قابل پیمایش و footer متعلق به همان ستون‌اند. حاشیه و padding footer تنها در assistant.module.css مالک دارند. تغییر عرض، component صاحب draft را remount نمی‌کند؛ بازشدن فهرست پیام خوانده‌شده یا درخواست AI تولید نمی‌کند.
- حباب گفتگو: min-width۹۰و فونت۱۴قبلی جای خود را به عرض ذاتی و فونت۱۳/line-height۱٫۹۵مرجع دادند. پس‌زمینهٔ تصویریِ بی‌اثر حذف شد؛ رنگ تم مالک پس‌زمینه است.
- wrapper آموزشگاه: selector فقط فرزند مستقیم main را می‌دید؛ Scope با display:contents میان main و Scene بود و فرم به عرض ذاتی حدود۵۰کوچک می‌شد. flatten کردن wrapperهای واقعاً حاوی Scene در همان Shell انجام شد؛ API و فرم کپی نشده‌اند.

- متن۲۰۰٪ در composer: textarea یک height۴۴و autosize وابسته به draft داشت؛ تغییر اندازهٔ متن،ارتفاع را به‌روز نمی‌کرد. min-height در همان messenger.module.css از line-height×scale+padding محاسبه شد تا مستقل از تغییر draft واکنش دهد؛ در۳۲۰اختلاف۲۳٫۵۹پیکسل رفع شد. logic ارسال و صف تغییر نکردند.
- سیاست ضبط مرورگر: مجوز `microphone=()` قبلی،ضبط جدید را در مرورگر واقعی می‌بست. next.config.ts فقط برای مسیر پیام‌ها override خودی دارد؛ صفحه‌های دیگر همچنان ممنوع‌اند. ترتیب override طبق راهنمای Next نصب‌شده و header/featurePolicy واقعی بررسی می‌شود؛ browser permission فقط با Start است.

شواهد DOM/computed style و مستطیل‌ها همراه تصاویر و buildId نگه‌داری می‌شوند. تفاوت داده،فونت مرورگر،نقش و قابلیت مجاز از اختلاف هندسه جداست. ابزار zoom/transform یا overflow:hidden تازه برای پنهان‌کردن ایراد اضافه نشده است؛ قاب و home indicator اطلس در محصول نیستند.
