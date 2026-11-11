// Canonical Persian interface copy. Named exports keep unused text out of route bundles.
// Edit values here; keep identifiers stable. Parameters are inserted as text, never HTML.
export const v4_reviewLabel: string = 'پیش‌نمایش طراحی V4 · دادهٔ نمونه';
export const v4_reviewOnly: string =
  'این نما برای بررسی طراحی است. ثبت واقعی از بخش مربوط در برنامه انجام می‌شود.';
export const common_close: string = 'بستن';
export const dateInputDateTime = (date: string, time: string) => `${date}، ${time}`;
export const dateInputPickerHint: string =
  'برای بازکردن تقویم، این ورودی را لمس کنید یا کلید جهت پایین را بزنید.';
export const fileTypeList = (labels: string[]) => labels.join('، ');
export const v5SchoolForms = {
  newPeriod: 'دوره تازه',
  reviewPeriod: 'بازبینی دوره',
  periodTitle: 'عنوان دوره',
  startDate: 'تاریخ شروع',
  endDate: 'تاریخ پایان',
  sessionTitle: 'عنوان جلسه',
  start: 'شروع',
  end: 'پایان',
};
export const v5Assignments = {
  statement: 'صورت تکلیف',
  rules: 'قواعد تکلیف',
  title: 'عنوان',
  description: 'شرح',
  addFile: 'افزودن فایل صورت تکلیف',
  fileInput: 'انتخاب فایل صورت تکلیف',
  fileHint: 'فایل مجاز را از دستگاه انتخاب کنید.',
  files: 'پیوست صورت تکلیف',
  next: 'ادامه تنظیم قواعد',
  review: 'بازبینی انتشار',
  due: 'مهلت تحویل',
  attempts: 'حداکثر تلاش',
  score: 'نمره کل',
  late: 'تحویل با تأخیر',
  lateHint: 'طبق سیاست همین تکلیف',
  ready: 'مخاطبان و صورت تکلیف آماده‌اند.',
  invalidAttempts: 'تعداد تلاش باید یک عدد صحیحِ مثبت باشد.',
  invalidScore: 'نمرهٔ مثبت با حداکثر دو رقم اعشار وارد کنید.',
};
export const v5Exams = {
  statement: 'آزمون تازه',
  rules: 'قواعد آزمون',
  title: 'عنوان',
  description: 'شرح اختیاری',
  start: 'شروع دسترسی',
  end: 'پایان دسترسی',
  next: 'ادامه تنظیمات آزمون',
  create: 'ساخت پیش‌نویس',
  duration: 'مدت پاسخ',
  minute: 'دقیقه',
  attempts: 'حداکثر تلاش',
  score: 'نمره کل',
  order: 'ترتیب پرسش‌ها',
  fixed: 'ترتیب ثابت',
  random: 'ترتیب تصادفی',
  invalidDuration: 'مدت پاسخ باید یک عدد صحیحِ مثبت به دقیقه باشد.',
  invalidAttempts: 'تعداد تلاش باید یک عدد صحیحِ مثبت باشد.',
  invalidScore: 'نمرهٔ مثبت با حداکثر دو رقم اعشار وارد کنید.',
  invalidRange: 'پایان دسترسی باید پس از شروع آن باشد.',
};
export const v5ExamQuestion = {
  title: 'پرسش تشریحی',
  objectiveTitle: 'پرسش تستی',
  prompt: 'صورت سؤال',
  score: 'بارم',
  files: 'پیوست پاسخ',
  filesHint: 'طبق سیاست این پرسش',
  policy: 'سیاست فایل',
  allTypes: 'فایل PDF و تصویر مجاز',
  noTypes: 'نوع فایل مجاز را انتخاب کنید.',
  save: 'ذخیره پرسش',
  edit: 'ویرایش پرسش',
  order: 'ترتیب پرسش',
  invalidOrder: 'ترتیب پرسش باید عدد صحیحِ مثبت و تکرارنشده باشد.',
  invalidScore: 'بارم نامنفی با حداکثر دو رقم اعشار وارد کنید.',
  invalidLimits: 'محدودیت تعداد و حجم باید مقدار مثبت و معتبر داشته باشد.',
  invalidOptions: 'حداقل دو گزینه با متن‌های متفاوت و دقیقاً یک پاسخ درست لازم است.',
  done: 'انجام شد',
  remove: 'حذف پرسش',
  removeTitle: 'حذف پرسش؟',
  removeDescription:
    'پرسش از نسخه پیش‌نویس حذف می‌شود. بارم کل و ترتیب پرسش‌ها دوباره بررسی می‌شوند.',
  question: 'پرسش',
  version: 'نسخه',
  draft: 'پیش‌نویس',
  latest: 'دریافت نسخهٔ تازه',
  changed: 'اطلاعات پرسش تغییر کرده است. نسخهٔ تازه را بررسی کنید.',
};
export const v5Attendance = {
  save: 'ذخیره حضورها',
  search: 'نام دانش‌آموز',
  rowHint: 'وضعیت حضور جلسه',
  status: 'وضعیت حضور',
  statusHints: {
    Present: 'در جلسه حضور داشته',
    Absent: 'در جلسه حضور نداشته',
    Late: 'با تأخیر رسیده',
    Excused: 'غیبت با مجوز',
  },
  reason: 'توضیح اصلاح',
  stageCorrection: 'ثبت اصلاح حضور',
  stage: 'انتخاب وضعیت',
  correctTitle: (name: string) => `اصلاح حضور ${name}`,
  chooseTitle: (name: string) => `حضور ${name}`,
  rowLabel: (name: string) => `حضور ${name}`,
  sessionContext: (day: string, title: string) => `${day} · ${title}`,
  policy: 'ثبت گروهی پس از بازبینی همه ردیف‌ها انجام می‌شود.',
  pendingStatus: (previous: string, next: string) => `${previous} ← ${next} · هنوز ذخیره نشده`,
  pendingReason: (status: string) => `${status} · توضیح اصلاح هنوز ذخیره نشده`,
  pendingCount: (count: string) => `${count} تغییر آماده ثبت است.`,
  saved: 'حضورهای بازبینی‌شده ثبت شدند.',
  review: 'بازبینی حضورها',
  reviewHint: 'تغییرهای زیر را پیش از ثبت بررسی کنید.',
  reviewChanged:
    'وضعیت یک یا چند ردیف تغییر کرده است. از این پنجره خارج شوید و همان ردیف‌ها را مرور کنید؛ تغییرهای دیگر حفظ شده‌اند.',
  conflict: 'تعارض حضور یک نفر',
  conflictHint: 'ثبت تازه‌تری وجود دارد. ابتدا وضعیت جدید را مرور کنید.',
  uncertain: 'نتیجهٔ ثبت روشن نیست. پیش از تلاش دوباره، وضعیت تازه را مرور کنید.',
  alreadyCurrent:
    'وضعیت تازه با انتخاب شما یکسان است. ادامه، پیش‌نویس همین ردیف را کنار می‌گذارد و ثبت دوباره انجام نمی‌دهد.',
  member: 'عضو',
  memberUnavailable:
    'این ردیف دیگر در فهرست مجازِ دریافت‌شده نیست. فقط پیش‌نویس همین ردیف را می‌توانید کنار بگذارید.',
  missingRow: (index: string) => `ردیفِ در دسترس نبودۀ ${index}`,
  discardThis: 'کنارگذاشتن پیش‌نویس همین ردیف',
  yourChoice: 'انتخاب شما',
  latestStatus: 'ثبت تازه',
  latest: 'مرور ثبت تازه',
  acceptLatest: 'ادامه با ثبت مرورشده',
  unknownName: 'نام در دسترس نیست',
  namesUnavailable: 'برای ردیفی که نام آن در این دریافت مشخص نیست، وضعیت تازه انتخاب نکنید.',
  noMatch: 'دانش‌آموزی با این نام پیدا نشد.',
  empty: 'فهرست حضور این جلسه خالی است.',
  noHistory: 'حضور ثبت‌شده‌ای در این دریافت نیست.',
  recordedStatus: (status: string) => `${status} · ثبت‌شده`,
  otherCounts: (excused: string, pending: string) => `مرخصی: ${excused} · ثبت‌نشده: ${pending}`,
  discardInvalid: 'کنارگذاشتن پیش‌نویس خوانده‌نشده',
};

export const v5Sessions = {
  title: 'عنوان',
  start: 'شروع تازه',
  end: 'پایان تازه',
  link: 'پیوند اختیاری',
  save: 'ذخیره ویرایش',
  reviewHint: 'زمان و پیوند جلسه را پیش از ثبت بازبینی کنید.',
  resources: 'منابع جلسه',
  joinOnline: 'ورود به جلسه آنلاین',
  resourcesHint: 'فایل‌های مجاز کلاس',
  official: 'گفتگوی رسمی',
  officialHint: 'پرسش درباره همین جلسه',
  officialUnavailable: 'گفتگوی مجاز هنوز آماده نیست.',
  time: 'زمان',
  teacher: 'مدرس',
  timeRange: (day: string, start: string, end: string) => `${day}، ${start} تا ${end}`,
  timeBetween: (start: string, end: string) => `${start} تا ${end}`,
  session: 'جلسه',
  complete: 'پایان جلسه',
  completeAction: 'ثبت پایان جلسه',
  recorded: 'حضور ثبت‌شده',
  recordedCount: (count: string, total: string) => `${count} نفر از ${total} نفر`,
  reviewed: 'فهرست حضور را بازبینی کردم.',
  completePolicy: 'ثبت پایان، ایجاد یک جلسه جدید نیست.',
  cancelPolicy: 'جلسه با وضعیت لغوشده باقی می‌ماند؛ حضور تازه برای جلسه لغوشده ثبت نشود.',
  changed: 'اطلاعات جلسه تغییر کرده است. نسخهٔ تازه را بررسی کنید.',
  latest: 'دریافت نسخهٔ تازه',
  attendance: 'حضور جلسه',
  myAttendance: 'حضور من',
};
export const v4_more: string = 'گزینه‌های بیشتر';
export const v4Text = {
  weeklyRule: 'قاعده تکرار هفتگی',
  weeklyNew: 'برنامه هفتگی تازه',
  day: 'روز هفته',
  startTime: 'زمان شروع',
  duration: 'مدت جلسه (دقیقه)',
  range: 'بازه اجرا',
  startDate: 'از تاریخ',
  endDate: 'تا تاریخ',
  sessionTitle: 'عنوان جلسه',
  meetingLink: 'پیوند جلسه (اختیاری)',
  zone: 'منطقه زمانی: تهران',
  reviewRule: 'بازبینی برنامه',
  saveRule: 'ثبت برنامه',
  generatedSessions: 'جلسه ساخته‌شده',
  lastRule: 'آخرین برنامه ثبت‌شده در این صفحه',
  editRule: 'ویرایش همین برنامه',
  applyFrom: 'اعمال تغییر از چه روزی؟',
  ruleInvalid: 'روز، زمان، عنوان و بازه معتبر را وارد کنید.',
  sessionComplete: 'پایان جلسه',
  sessionCompleteHint: 'این جلسه پایان‌یافته ثبت می‌شود؛ وضعیت از پاسخ سرور دریافت خواهد شد.',
  weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  largerText: 'متن درشت‌تر',
  largerTextHint: 'متن‌های رابط با اندازهٔ بزرگ‌تر نمایش داده می‌شوند.',
  reduceMotion: 'حرکت کمتر',
  reduceMotionHint: 'پویانمایی‌های غیرضروری کاهش می‌یابند.',
  classes: 'کلاس‌ها',
  course: 'درس',
  period: 'ترم',
  capacity: 'ظرفیت',
  status: 'وضعیت',
  selectedClass: 'کلاس منتخب',
  activeClasses: 'کلاس فعال',
  totalCapacity: 'ظرفیت کلاس‌ها',
  periods: 'دوره آموزشی',
  classMembers: 'اعضا و مدرسان',
  sessions: 'جلسه‌ها',
  classResources: 'درس‌ها و منابع',
  reports: 'گزارش کلاس',
  selectClass: 'انتخاب کلاس',
  openClass: 'ورود به کلاس',
  noClass: 'هنوز کلاسی ندارید',
  classListHint: 'انتخاب ردیف، اطلاعات همان کلاس را کنار فهرست باز می‌کند.',
  folders: 'پوشه‌های من',
  newFolder: 'پوشه تازه',
  editFolder: 'ویرایش پوشه',
  folderName: 'نام پوشه',
  folderUnread: 'فقط خوانده‌نشده‌ها',
  folderRules: 'قواعد پوشه',
  folderTypes: 'نوع گفتگوها',
  folderTypePending:
    'انتخاب نوع گفتگو برای پوشه تازه هنوز در دسترس نیست. پوشه‌های موجود را می‌توانید ببینید و ویرایش کنید.',
  folderEmpty: 'پوشه‌ای ساخته نشده است',
  folderEmptyHint: 'همه گفتگوها از صندوق پیام‌ها در دسترس هستند.',
  deleteFolder: 'حذف پوشه؟',
  deleteFolderHint: 'فقط پوشه حذف می‌شود؛ گفتگوها باقی می‌مانند.',
  save: 'ذخیره تغییرات',
  create: 'ساختن',
  remove: 'حذف',
  cancel: 'انصراف',
  back: 'بازگشت',
  more: 'گزینه‌های بیشتر',
  poll: 'نظرسنجی',
  newPoll: 'نظرسنجی تازه',
  question: 'پرسش',
  option: 'گزینه',
  options: 'گزینه‌ها',
  configureOptions: 'گزینه‌ها را وارد کنید',
  applyOptions: 'ثبت گزینه‌ها',
  addOption: 'افزودن گزینه',
  multiple: 'چند پاسخ مجاز',
  anonymous: 'رأی ناشناس',
  multipleHint: 'امکان انتخاب بیش از یک گزینه',
  anonymousHint: 'مطابق سیاست معتبر نظرسنجی',
  quiz: 'پرسش کوتاه',
  isQuiz: 'پرسش با پاسخ درست',
  correctOption: 'گزینه صحیح',
  explanation: 'توضیح اختیاری',
  publishPoll: 'انتشار نظرسنجی',
  publishQuiz: 'انتشار پرسش کوتاه',
  vote: 'ثبت رأی',
  results: 'نتیجه‌ها',
  closePoll: 'بستن نظرسنجی؟',
  closePollHint: 'پس از بسته‌شدن، رأی تازه‌ای ثبت نمی‌شود.',
  totalVoters: 'تعداد رأی‌دهندگان',
  voters: 'رأی‌دهندگان',
  checklist: 'چک‌لیست',
  newChecklist: 'چک‌لیست تازه',
  editChecklist: 'ویرایش چک‌لیست',
  title: 'عنوان',
  item: 'مورد',
  addItem: 'افزودن مورد',
  mode: 'حالت',
  personal: 'شخصی',
  collaborative: 'مشارکتی',
  publishChecklist: 'انتشار چک‌لیست',
  completed: 'تکمیل‌شده',
  scheduled: 'پیام‌های زمان‌بندی',
  schedule: 'زمان‌بندی پیام',
  scheduleAt: 'زمان ارسال',
  text: 'متن',
  scheduleSubmit: 'ثبت زمان‌بندی',
  cancelSchedule: 'لغو ارسال زمان‌بندی؟',
  cancelScheduleHint: 'این پیام در زمان انتخاب‌شده فرستاده نمی‌شود.',
  scheduledEmpty: 'پیام زمان‌بندی‌شده‌ای ندارید',
  localTime: 'زمان با ساعت محلی همین دستگاه ثبت می‌شود.',
  invalidTime: 'زمان ارسال باید بعد از اکنون باشد.',
  validation: 'عنوان و دست‌کم دو گزینه یا یک مورد معتبر وارد کنید.',
  sent: 'ثبت شد',
  waiting: 'در حال ثبت…',
  loadMore: 'نمایش بیشتر',
  preview: 'پیش‌نمایش',
  unavailable: 'هنوز در دسترس نیست',
  phoneChange: 'تغییر شماره همراه',
  deleteAccount: 'حذف حساب',
  support: 'راهنما و پشتیبانی',
  supportTicket: 'تیکت پشتیبانی',
  proposalHint: 'این قابلیت هنوز فعال نشده است. اطلاعات شما در این صفحه تغییر نمی‌کند.',
  helpArticle: 'راهنمای موجود',
  helpDescription: 'پاسخ به پرسش‌های ورود، فضاها و گفتگو',
  helpIntro: 'یک حساب، چند فضای مجاز',
  helpBody:
    'از پروفایل، فضای شخصی یا نقش مجاز آموزشگاه را انتخاب کنید. پیام‌های فضای آموزشی با همان نقش و عضویت باز می‌شوند.',
  helpPrivacy: 'ارتباط و حریم خصوصی',
  helpPrivacyBody:
    'دریافت پیام و دعوت، به انتخاب شما در حریم خصوصی و مجوزهای گفتگو وابسته است. پس از تغییر، ذخیره را بزنید.',
  appearance: 'ظاهر و خوانایی',
  reading: 'خوانایی و نمایش',
  communication: 'وضعیت ارتباط',
  install: 'نصب روی دستگاه',
  noMessages: 'هنوز گفتگویی نیست',
  searchNoResult: 'نتیجه‌ای پیدا نشد',
  retry: 'تلاش دوباره',
  pending: 'در انتظار',
  versionConflict: 'نسخه تازه‌تری وجود دارد. تغییر شما حفظ شده است؛ اطلاعات تازه را بازبینی کنید.',
  refresh: 'بازبینی نسخه تازه',
  pollUnavailable: 'دریافت نظرسنجی انجام نشد',
  checklistUnavailable: 'دریافت چک‌لیست انجام نشد',
  backendDependency: 'وابستگی اتصال',
  conversationTools: 'ابزارهای گفتگو',
};
export const text_d16d0813e64f: string = 'ماکان | فضای شخصی';
export const text_b11c67f6d491: string = 'ماکان | ورود';
export const text_698302cf1af6: string = 'نمایش صفحه ممکن نشد';
export const text_9d597bedb5fd: string =
  'دوباره تلاش کنید. اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.';
export const text_be9b8b4f2b98: string = 'تلاش دوباره';
export const text_3ddc4fb260f2: string = 'ماکان | ارتباط و یادگیری';
export const text_9f26748fd7d4: string = '%s | ماکان';
export const text_5d42da0bfff2: string =
  'فضای شخصی و آموزشی ماکان برای فرد عادی، دانشجو، استاد، والدین و مدیر آموزشگاه';
export const brand_name: string = 'ماکان';
export const text_b2e9c858df63: string = 'محیط آزمون محلی · دادهٔ ساختگی';
export const text_e45237af4393: string = 'فضای شخصی، آموزشگاه و پیام‌رسان ماکان';
export const navigation_education: string = 'آموزشگاه';
export const navigation_messages: string = 'پیام‌ها';
export const text_34878975f201: string = 'صفحه در دسترس نیست';
export const text_cdbeb6525b01: string = 'بازگشت به ماکان';
export const text_1d5e00991372: string = 'بررسی طراحی ماکان';
export const text_2601aa49718e: string =
  'محیط پیش‌نمایش با دادهٔ آزمایشی؛ اقدام‌های این صفحه برای افراد واقعی ارسال نمی‌شوند.';
export const text_6901f60f571f: string = 'ورود به اجرای متصل';
export const text_618612770586: string = 'نمای دسکتاپ';
export const text_8731b85870ee: string = 'نمای موبایل و واکنش‌گرا';
export const text_afe183ddd169: string = 'تغییرات ذخیره نشده‌اند. از این صفحه خارج می‌شوید؟';
export const text_3e23e3fb6347: string = 'لوگوی ماکان';
export const text_df535a7ee41d: string = 'تأیید';
export const text_fa7af603d430: string = 'انصراف';
export const text_fc2867f048ea: string = 'در حال انجام…';
export const text_6c3f309202ba: string =
  'اتصال به‌روز نیست. اطلاعات قبلی نمایش داده می‌شود؛ تغییر تازه‌ای تأیید نشده است.';
export const text_e295c9d4fa1a: string =
  'اتصال برقرار نیست. برای دریافت اطلاعات تازه دوباره تلاش کنید.';
export const text_3e76fdc3cf0b: string = 'تلاش دوباره برای اتصال';
export const text_ace0c96e567d: string = 'یک مسئله، یک نگاه تازه';
export const text_f3b5ff1969c6: string = 'x²';
export const text_9e1d54350c17: string = '2x + 3 = 11';
export const text_5590d86b3dea: string = 'تاریخ شروع';
export const text_ff65d97ad1e0: string = 'تاریخ پایان';
export const text_ebce34bb1c4a: string = 'تاریخ تولد بررسی‌شده';
export const text_05f95b7e152f: string = 'رده سن ارتباطی';
export const text_53a6da0c6927: string = 'وضعیت بررسی';
export const text_0d5f82b11e8c: string = 'شروع جلسه';
export const text_0559b65628ea: string = 'پایان جلسه';
export const text_77fe79f8b1d7: string = 'منطقه زمانی';
export const text_b0dff0a118df: string = 'شروع اعتبار الگو';
export const text_0ae1c94970fd: string = 'پایان اعتبار الگو';
export const text_1931110c90ec: string = 'اعمال از تاریخ';
export const text_2fa08bbfc67b: string = 'مدت جلسه (دقیقه)';
export const text_9eebbbd0d478: string = 'زمان محلی شروع';
export const text_8ab1f725756d: string = 'روز هفته';
export const text_7a1808af5aca: string = 'وضعیت نهایی ثبت‌نام';
export const text_0182ac3cd11f: string = 'دلیل اصلاح حضور';
export const text_f520b8218622: string = 'ردیف‌های حضور';
export const text_8b30165d42c3: string = 'مدیران';
export const text_5947286b4663: string = 'عضویت‌ها';
export const text_993403330924: string = 'سوابق مدیریتی';
export const text_46b599145ed6: string = 'معلمان';
export const text_4071fd698a3b: string = 'اصلاحات حضور';
export const text_308c293e8b53: string = 'شناسه';
export const text_69c1e5b1fe20: string = 'نام';
export const text_5903c1c121cb: string = 'نام نمایشی';
export const text_74190f4bb095: string = 'عنوان';
export const text_68d7eb08efbc: string = 'وضعیت';
export const text_742e604e8e1b: string = 'تاریخ ایجاد';
export const text_a8f9b3f5cc46: string = 'آخرین تغییر';
export const text_3fe7ba4a2131: string = 'نام خانوادگی';
export const text_7e234e8e9904: string = 'شناسه سازمان';
export const text_4a795ccb62e4: string = 'شناسه حساب کاربری';
export const text_3bb5743bc2f0: string = 'شناسه شخص';
export const text_c3582a73bab4: string = 'شناسه پرونده سازمانی';
export const text_4ec1390ba9aa: string = 'شناسه عضویت';
export const text_bbcb51445ff6: string = 'شناسه ثبت‌نام';
export const text_5b23cc0c1f21: string = 'شناسه کلاس';
export const text_ac297f82c6e7: string = 'شناسه دوره';
export const text_c2a4e30c7788: string = 'شناسه درس';
export const text_e85db0fb2a48: string = 'کلاس فعال';
export const text_654c82264de7: string = 'فراگیر ثبت‌نام‌شده';
export const text_65ff4b748f76: string = 'تعداد معلم';
export const text_1e148080c7c2: string = 'عضو فعال';
export const text_f3afec354d34: string = 'مدیر فعال';
export const text_2a9c76274de8: string = 'تعداد کل';
export const text_8c70ab4fb230: string = 'تعداد فعال';
export const text_d9748d649211: string = 'ظرفیت کل';
export const text_48ba2fffd7f8: string = 'برنامه‌ریزی‌شده';
export const text_6cfe19c556aa: string = 'تکمیل‌شده';
export const text_7a56ac65be94: string = 'لغوشده';
export const text_e892623fb9be: string = 'مجموع';
export const text_40284b78e717: string = 'حاضر';
export const text_921c15ca4d6d: string = 'غایب';
export const text_5d5d32eb4327: string = 'دیرکرد';
export const text_85a79064a177: string = 'مرخصی';
export const text_e4420d10f87b: string = 'تعداد رکورد';
export const text_cd13e88ef404: string = 'کل تکالیف';
export const text_1e14155e407c: string = 'تکالیف منتشرشده';
export const text_222b356f3f35: string = 'کل آزمون‌ها';
export const text_1c38b8b982c9: string = 'آزمون‌های منتشرشده';
export const text_caac18ea6580: string = 'در انتظار';
export const text_68bfe264e2cf: string = 'در حال پردازش';
export const text_aecb7a8c912b: string = 'به تعویق افتاده';
export const text_bbd429973d6e: string = 'ناموفق';
export const text_d25fcdaecd72: string = 'عمر قدیمی‌ترین مورد در صف (ثانیه)';
export const text_9c9396f1a06b: string = 'وضعیت سرویس Push';
export const text_1b2b3ea6b82d: string = 'وضعیت سرویس پیامک';
export const text_a518bb98ae8c: string = 'خطاهای اخیر';
export const text_e7c31b41ea16: string = 'تعداد پردازش‌ها';
export const text_44eb8186c1b4: string = 'قدیمی‌ترین مورد در انتظار';
export const text_f0f59808ac85: string = 'وابستگی‌ها';
export const text_9f2a436a61f3: string = 'اعلان‌ها';
export const text_a84b9fb71dda: string = 'پردازش‌ها';
export const text_49f22b1f96ce: string = 'زمان مشاهده';
export const text_38ba5d1b15db: string = 'وضعیت اتصال AI';
export const text_90558504ae69: string = 'عضویت فعال';
export const text_18f98f08ce1c: string = 'اشتراک فعال';
export const text_3d4c3d92cfad: string = 'دعوت در انتظار';
export const text_db836ee463e1: string = 'درخواست ایجاد در انتظار';
export const text_8b848237295a: string = 'آخرین ایجاد عضویت';
export const text_bb4fb9f12d35: string = 'آخرین ایجاد کلاس';
export const text_e4b085a7ea07: string = 'آخرین اقدام مدیریتی';
export const text_d76325eba9c3: string = 'شناسه حساب سرپرست';
export const text_b8f84501bb7c: string = 'شناسه پرونده فراگیر';
export const text_9d8f5adfae13: string = 'شروع اعتبار';
export const text_57400196e6de: string = 'ظرفیت';
export const text_8c471f14ee5a: string = 'درس';
export const text_5f681ac52334: string = 'دوره آموزشی';
export const text_76e5a8315199: string = 'حساب متصل است';
export const text_60af73fe5d81: string = 'امکان ویرایش نام';
export const auth_phoneLabel: string = 'شماره همراه';
export const text_173fec6019a6: string = 'نام کاربری';
export const text_ce6eae278252: string = 'شماره تأییدشده';
export const text_1910a7860abd: string = 'وضعیت حساب';
export const text_86095dafad16: string = 'تاریخ تعلیق';
export const text_103613fd03b5: string = 'شروع';
export const text_3f05817a3011: string = 'پایان';
export const text_30de87b72026: string = 'مبلغ';
export const text_70d8318bc91d: string = 'واحد پول';
export const text_653511a083ed: string = 'شناسه سفارش';
export const text_0e36a5dfa8ee: string = 'شناسه نسخه پلن';
export const text_7054050077e9: string = 'شناسه خریدار';
export const text_7b9579b94f67: string = 'زمان پرداخت';
export const text_31d0bfe46078: string = 'زمان لغو';
export const text_c53d26c05fe0: string = 'تلاش‌های پرداخت';
export const text_2ecccfdf9f11: string = 'اطلاعات پرداخت';
export const text_7f34ceb3adea: string = 'کد';
export const text_2a09cd5be19f: string = 'کلید';
export const text_70fad032e576: string = 'مقدار';
export const text_7ce1cba4ec7f: string = 'سقف';
export const text_cf7022e3986a: string = 'مصرف فعلی';
export const text_1efbc9ce0237: string = 'عبور از سهمیه';
export const text_baf03394ac0e: string = 'مصرف';
export const text_6c39153fbad5: string = 'کد پلن';
export const text_fd1e40a5bdd8: string = 'نام پلن';
export const text_3f2157f7e54e: string = 'شناسه اشتراک';
export const text_95620197c174: string = 'شماره نسخه';
export const text_e1280ac99b7b: string = 'نسخه';
export const text_0ff68b6d8f6e: string = 'نسخه پرونده';
export const text_272c50142df4: string = 'نسخه شخص';
export const text_ecaf3518c67b: string = 'دلیل';
export const text_680750d60932: string = 'یادداشت داخلی';
export const text_d7fab0be6672: string = 'اقدام';
export const text_a02552f393fb: string = 'زمان رویداد';
export const text_def9c18e11d0: string = 'نتیجه';
export const text_23625d3dd421: string = 'نوع منبع';
export const text_2027e49d43d6: string = 'شناسه منبع';
export const text_7ca084f7ac14: string = 'خلاصه پیش از اقدام';
export const text_9f07f0f6780c: string = 'خلاصه پس از اقدام';
export const text_0bdac76e5955: string = 'شناسه پیگیری';
export const text_b07e2ff9dbeb: string = 'شناسه عامل';
export const text_3db261daa3a7: string = 'شناسه شخص عامل';
export const text_620a0e304a39: string = 'شناسه نشست عامل';
export const text_02739cab4997: string = 'شناسه نشست';
export const text_57a327e6fbb1: string = 'انقضا';
export const text_9e2c3acdab37: string = 'فعال است';
export const text_ed621a0238f4: string = 'ابطال';
export const text_f7c6ee7ceb27: string = 'دستگاه';
export const text_2f64cf5265fc: string = 'نشست جاری';
export const text_fde889f86d84: string = 'نقش‌های فعال';
export const text_628d512903fe: string = 'نقش';
export const text_02626023297b: string = 'کلید نقش';
export const text_5cff6c4ff277: string = 'شناسه نقش';
export const text_48dabbd6c038: string = 'عنوان نقش';
export const text_dfb434e36223: string = 'زمان انتساب';
export const text_006e40fe4688: string = 'عامل انتساب';
export const text_f165b59f91b4: string = 'عامل پایان';
export const text_d52bea756b32: string = 'شناسه انتساب';
export const text_b7556a00d773: string = 'عنوان کلاس';
export const text_ef621ef609a9: string = 'اولویت';
export const text_8a52f7bc3f5c: string = 'منبع';
export const text_60427fc5763e: string = 'شناسه پرونده';
export const text_ee23edf8ff48: string = 'شناسه گفتگو';
export const text_b55501074dc5: string = 'نوع';
export const text_0125c8b7a2e6: string = 'محدوده';
export const text_b7978697f77a: string = 'نمایانی';
export const text_005887ba201a: string = 'تعداد پرونده رسیدگی';
export const text_c8b0013b2c43: string = 'بررسی‌کننده';
export const text_95c451376fbf: string = 'شروع بررسی';
export const text_cc21d597a870: string = 'زمان رسیدگی';
export const text_1890bec4f76d: string = 'زمان رد';
export const text_a1796a7b71bd: string = 'شاهد محتوایی مجاز پرونده';
export const text_6b12f15e748d: string = 'توضیحات';
export const text_02aebeb902e8: string = 'نوع پیام';
export const text_798f6ffaf2c1: string = 'شناسه پیام';
export const text_873c6ff87053: string = 'حساب گزارش‌شده';
export const text_491a50e60976: string = 'گزارش‌دهنده';
export const text_01ddc3f9e885: string = 'شناسه گزارش';
export const text_5273e78543f3: string = 'شناسه رخداد';
export const text_cdbc42133852: string = 'تصمیم';
export const text_3a4b8be4d460: string = 'سطح ریسک';
export const text_e6e1c3de343b: string = 'کد سیاست';
export const text_17af7e2762dc: string = 'متن مجاز در محدوده پرونده';
export const text_4889997d4069: string = 'زمان ارسال';
export const text_9458ff04f996: string = 'شناسه فرستنده';
export const text_9a570ad9e59b: string = 'ترتیب';
export const text_79976c6e3e70: string = 'نام سازمان';
export const text_38e00c7ec49a: string = 'شناسه عملیات';
export const text_5752a5625ae1: string = 'کد خطا';
export const text_1f7b7903479e: string = 'پاسخ تکرار همان عملیات';
export const text_b362329dff90: string = 'سازمان';
export const text_339ffded192f: string = 'شناسه انتساب معلم';
export const text_d28d9124f395: string = 'معلم فعال';
export const text_90906f384f7e: string = 'فراگیر فعال';
export const text_aaf7c2e138a5: string = 'تاریخ ثبت‌نام';
export const text_1afe50e359f3: string = 'تاریخ انتساب';
export const text_ff0ac33fa30b: string = 'زمان انتشار';
export const text_d28d227a202d: string = 'عنوان جاری';
export const text_ac50640bdd8f: string = 'شماره نسخه جاری';
export const text_b0d05ff19b4c: string = 'نمره کل';
export const text_0f62c687cc01: string = 'امکانات پلن';
export const text_0419a14f7b35: string = 'سهمیه‌ها';
export const text_a3fa2a3ffcb9: string = 'فعال';
export const text_7db7c5d775dc: string = 'تعداد اشتراک';
export const text_bdf1e49e12f5: string = 'فهرست نسخه‌ها محدود شده';
export const text_a7e2256a2bb3: string = 'روابط سرپرستی';
export const text_217524cb04e9: string = 'روابط فراگیر';
export const text_8e6397a74fe1: string = 'زمان داده گزارش';
export const text_7697e2d3e5ed: string = 'شمارش عملیاتی';
export const text_01ddedeb35a3: string = 'جلسات آینده';
export const text_3f42a06dca7e: string = 'حضور ثبت‌نشده';
export const text_0a08e6588d38: string = 'صف ارزیابی تکلیف';
export const text_f89aaf7b0ba9: string = 'صف تصحیح آزمون';
export const text_5a23f9bc81ef: string = 'وضعیت راه‌اندازی';
export const text_674005a94547: string = 'پیوند جلسه';
export const text_70786012eed4: string = 'عنوان جلسه';
export const text_5f78cf2b8f06: string = 'وضعیت حضور';
export const text_300a5980d7c6: string = 'نام فراگیر';
export const text_6b42512b7cc4: string = 'نام معلم';
export const text_d57ba7ac55c7: string = 'تعداد جلسات';
export const text_49516bc7d218: string = 'تعداد حضور';
export const text_6b029cd67b61: string = 'تعداد فراگیر';
export const text_288df4810c4a: string = 'تعداد کلاس';
export const text_864d620a79a5: string = 'تعداد ارزیابی';
export const text_5a8bdfe42139: string = 'میانگین نمره';
export const text_8453cbdcb655: string = 'تعداد';
export const text_345cb60b5d2c: string = 'در دسترس';
export const text_56da3a96a644: string = 'سلامت';
export const text_149f9194eaaa: string = 'بخش';
export const text_4f7585cf0c64: string = 'توضیح';
export const text_bda050585a00: string = '—';
export const text_4d37bd3ee4fe: string = 'کپی شناسه';
export const text_13159f8c7432: string = 'بله';
export const text_5f5c4c72bddd: string = 'خیر';
export const text_8e5c8a3097a2: string = 'موردی ثبت نشده است';
export const text_f7c559a128a8: string = 'اطلاعاتی ثبت نشده است';
export const text_ac2d64a54b28: string = 'اطلاعات را بررسی و سپس تأیید کنید.';
export const text_313cbecb4dd3: string = 'بستن';
export const text_aa2e6cea4edd: string =
  'تاریخ و ساعت شمسی معتبر وارد کنید؛ مانند ۱۴۰۵/۰۸/۰۷ ۱۴:۳۰.';
export const text_9675d1e1f4e2: string = 'تاریخ شمسی معتبر وارد کنید؛ مانند ۱۴۰۵/۰۸/۰۷.';
export const text_e3211dce980c: string = 'انتخاب تاریخ و ساعت شمسی';
export const text_401b4bf7fd95: string = 'انتخاب تاریخ شمسی';
export const text_6f32eaf56515: string = 'انتخاب روز ';
export const text_0d20732d1cce: string = 'سال';
export const text_76abcc3c38cf: string = 'ماه';
export const text_11029c92c84b: string = ' بعد';
export const text_6fab8bd45895: string = ' قبل';
export const text_9f129764c164: string = 'سال شمسی';
export const text_46ad15777dc0: string = 'ماه شمسی';
export const text_fa95e25fd538: string = 'دقیقه';
export const text_74d72b104059: string = 'ساعت';
export const text_9699c34220a4: string = 'زمان';
export const text_7aa4140b0d61: string = '۱۴۰۵/۰۸/۰۷ ۱۴:۳۰';
export const text_1097f8d4306d: string = '۱۴۰۵/۰۸/۰۷';
export const text_2d85945743f6: string = 'بستن تقویم شمسی';
export const text_d220baef32d8: string = 'باز کردن تقویم شمسی';
export const text_91dd003a74aa: string =
  'تقویم باز نشد؛ تاریخ شمسی را در کادر وارد کنید یا دوباره دکمهٔ تقویم را بزنید.';
export const text_26d553849a89: string = 'بخش‌های صفحه';
export const text_d16616ab5bf1: string = 'در حال دریافت اطلاعات';
export const text_757df1f837e6: string = 'موردی پیدا نشد';
export const text_1ca6ac3cbcd2: string = 'فیلترها را تغییر دهید یا بعداً دوباره بررسی کنید.';
export const text_8c44f9f4897d: string = 'دسترسی محدود است';
export const text_90bcbe61d1bd: string = 'ورود مجدد لازم است';
export const text_b4d89ec3251c: string = 'اطلاعات دریافت نشد';
export const text_dc60f0f99394: string =
  'نگاشت مجوز این عملیات هنوز توسط تیم Backend تأیید نشده است.';
export const text_825e019cb09c: string = 'زمان انتظار: ';
export const text_fa629a79068a: string = ' ثانیه';
export const text_ee748e945c4c: string = 'شناسه پیگیری: ';
export const text_6d2ae6f38c3f: string = 'ورود به حساب';
export const text_47eab78b8d28: string = 'دریافت دوباره';
export const text_701d5d7a86f9: string = 'معلق';
export const text_4e67bd8e3482: string = 'غیرفعال';
export const text_996db6061aa9: string = 'پایان‌یافته';
export const text_479574e266a4: string = 'پذیرفته‌شده';
export const text_c7009e8ab420: string = 'ردشده';
export const text_bc6ca677cef7: string = 'انصراف از کلاس';
export const text_79c60749cb2d: string = 'نیازمند رسیدگی';
export const text_816e807fc9be: string = 'درخواست ثبت‌شده';
export const text_2d59208c2547: string = 'سازمان ساخته شد';
export const text_34b74ade8ade: string = 'اشتراک تخصیص یافت';
export const text_a594ddb6bc9c: string = 'دعوت مدیر ایجاد شد';
export const text_e4f1cf0d1e04: string = 'منتشرشده';
export const text_410c47c7f8b7: string = 'پیش‌نویس';
export const text_5b81f53beda1: string = 'تحویل‌شده';
export const text_66b7ccc12b86: string = 'در حال انجام';
export const text_7d22293a046b: string = 'ثبت نهایی‌شده';
export const text_c6bbfd166b33: string = 'بسته‌شده';
export const text_9defd77e1a5d: string = 'بایگانی‌شده';
export const text_65f21708171c: string = 'تشریحی';
export const text_8fc194cdb8aa: string = 'چهارگزینه‌ای';
export const text_7e138dc09ad6: string = 'منقضی';
export const text_8bcc64d644fd: string = 'در انتظار پرداخت';
export const text_337a6e199e8e: string = 'شروع نشده';
export const text_a7e7988e2ad3: string = 'در انتظار فعال‌سازی اشتراک';
export const text_8de717715873: string = 'اشتراک فعال شد';
export const text_95769beb657d: string = 'در انتظار ارائهٔ خدمت';
export const text_74a167bdd61a: string = 'پرداخت‌شده';
export const text_424a8f82124a: string = 'باز';
export const text_f71cd91dad22: string = 'در حال بررسی';
export const text_c4e27a602e9c: string = 'رسیدگی‌شده';
export const text_8957887c2b2f: string = 'شخصی';
export const text_546832e64b74: string = 'سازمانی';
export const text_bb8b8f5b8bfc: string = 'مستقیم';
export const text_774668d4acc7: string = 'گروه';
export const text_2db356b462dd: string = 'کانال';
export const text_f07a81a06253: string = 'نامشخص';
export const text_97c4b62c6c33: string = 'آخرین دریافت موفق: ';
export const text_330525bbfa1f: string = 'مدیر آموزشگاه';
export const text_2000c11f322c: string = 'مدرس';
export const text_fbd179d162db: string = 'دانش‌آموز';
export const text_dcc74caa0918: string = 'والد';
export const navigation_extracurricular: string = 'فوق‌برنامه';
export const navigation_assistant: string = 'دستیار';
export const navigation_profile: string = 'پروفایل';
export const text_4ba03a40a8d4: string = 'دربارهٔ ماکان';
export const text_f1f1352e3a44: string = 'یادگیری،';
export const text_f51cf6c76e5a: string = 'کنار آدم‌های شما.';
export const text_be6525cc039a: string =
  'آموزشگاه، کلاس‌های مستقل و گفتگوها؛ همه در یک فضای آشنا و یکپارچه.';
export const text_3b85559794f7: string = 'برنامه‌تان را پیدا کنید';
export const text_83762c213935: string = 'کلاس‌ها، تکلیف‌ها و کارهای نزدیک، در یک نگاه.';
export const text_973a4cd40e8c: string = 'کلاس خودتان را بسازید';
export const text_fc5cf6c16c2b: string =
  'برای تشکیل کلاس مستقل درخواست بدهید و کنار هم یاد بگیرید.';
export const text_2f8fb5d35b1a: string = 'در ارتباط بمانید';
export const text_f59e7370a798: string = 'پیام شخصی، گروه و کانال‌های مرتبط با کلاس‌ها.';
export const text_caafa211ea9f: string =
  ' یک حساب برای همهٔ فضاهای شما؛ دسترسی هر فضا با نقش و عضویت خودتان مشخص می‌شود.';
export const text_53e6fda46753: string = 'ورود به حساب ماکان';
export const text_7f02906d0bda: string = 'تأیید کد ورود';
export const text_a307da4d1ec4: string = 'ورود با شماره همراه';
export const common_back: string = 'بازگشت';
export const text_a0f446ea0a11: string = 'راهنمای ورود';
export const auth_codeTitle: string = 'کد تأیید را وارد کنید';
export const auth_phoneTitle: string = 'شماره همراه شما';
export const text_43de2faf100b: string = 'کد تأیید به شمارهٔ ';
export const text_bdb15bbda1e3: string = ' ارسال شد.';
export const text_5d9c3b2dee3e: string = 'برای ادامه، کد تأیید را به این شماره می‌فرستیم.';
export const text_8ec609305663: string = 'ویرایش شماره';
export const auth_codeLabel: string = 'کد ورود';
export const text_c7b877a28050: string = 'کد ۶ رقمی پیامک‌شده را وارد کنید.';
export const text_0ec3b647b2d7: string = 'شماره همراه خودتان را وارد کنید.';
export const text_ee2ee0a2117a: string = 'لطفاً صبر کنید…';
export const auth_verify: string = 'تأیید و ورود';
export const auth_requestCode: string = 'دریافت کد تأیید';
export const text_f0868fd5d933: string = ' ثانیه تا ارسال مجدد';
export const text_cbe0e1ea7c4c: string = 'ارسال دوباره کد';
export const text_7982e7b03d4c: string =
  'ادامه به معنی پذیرش شرایط استفاده و سیاست حریم خصوصی است.';
export const text_324357b2beef: string = 'کد پیگیری: ';
export const text_b55a7e83c439: string = 'ورود به ماکان';
export const text_a55bf6a5c36c: string =
  'شماره همراه خودتان را وارد کنید. کد پیامک‌شده را برای هیچ‌کس نفرستید. ادامهٔ ورود به معنی پذیرش شرایط استفاده و سیاست حریم خصوصی است.';
export const text_faa9d5e66033: string = 'به ماکان خوش آمدید';
export const text_317b183a732f: string = 'آموزشگاه، گفتگو و یادگیری؛ کنار هم.';
export const text_114d2152e9ac: string = 'برنامه و کارهای آموزشی';
export const text_5b016753fb76: string = 'کلاس‌ها و پیگیری‌های نزدیک را یکجا ببینید.';
export const text_90aba848be79: string = 'در جمع‌های کوچک یاد بگیرید.';
export const text_041d55caa270: string = 'گفتگوهای شما';
export const text_4c75444340d3: string = 'با آدم‌ها و گروه‌های مرتبط در ارتباط بمانید.';
export const text_f22fc41872c4: string = 'کجا ادامه می‌دهید؟';
export const text_f736bd2c5640: string = 'برای ورود، فضای موردنظرتان را انتخاب کنید.';
export const text_1e8321671f3f: string = 'فضایی برای ورود موجود نیست';
export const text_d034f3bcfe7f: string = 'حساب شخصی';
export const text_9336384b74e8: string = 'ارتباطات شما';
export const text_c7581e2c4ccf: string = 'در حال حاضر قابل ورود نیست';
export const text_d04bf8106c45: string = 'در حال ورود';
export const text_8b4cb595cd35: string = 'حساب من';
export const text_9b1651192a2c: string = 'اقدام صفحه';
export const text_739d6daf2013: string = 'گزینه‌های بیشتر';
export const text_ac7f20593202: string =
  'پیش‌نویس این حساب در همین مرورگر نگهداری می‌شود. تشکیل کلاس پس از فعال‌شدن ثبت درخواست و بررسی انجام خواهد شد.';
export const text_8ffd373a72b0: string =
  'این بخش هنوز برای استفادهٔ عمومی فعال نشده است. اطلاعات فعلی شما حفظ می‌شود.';
export const text_2224cd680a48: string = 'وضعیت این بخش';
export const text_b90ffe172b6d: string = 'متوجه شدم';
export const text_57716070bbf6: string = 'خواندن پیش‌نویس این مرورگر ممکن نشد.';
export const text_90b8655d7cce: string =
  'نوشته‌ها روی صفحه حفظ شده‌اند؛ ذخیرهٔ مرورگر در دسترس نیست.';
export const text_15270886eadd: string = 'همه';
export const text_740e6f513649: string = 'عضو هستم';
export const text_512b7d535f79: string = 'مدیریت می‌کنم';
export const text_74c3aeacf724: string = 'جستجو در کلاس‌های من';
export const text_80c38e90f3ff: string = 'فیلتر کلاس‌ها';
export const text_4a9ad5d23452: string = 'کلاسی با این نام پیدا نشد';
export const text_00d537cc94bc: string = 'کلاسی در این فیلتر نیست';
export const text_699f8b35061e: string = 'اولین کلاس خودتان را شروع کنید';
export const text_e33b10d290c6: string = 'عبارت جستجو را کوتاه‌تر کنید.';
export const text_556de397362b: string = 'برای درخواست تشکیل کلاس، عضویت در آموزشگاه لازم نیست.';
export const text_35c84a68f506: string = 'پاک‌کردن جستجو';
export const text_01d42f321cf0: string = 'کلاس مستقل · ';
export const text_d047c7316e02: string = 'مدیریت من';
export const text_763a7141dfea: string = 'امکانات آموزشی طبق دسترسی کلاس';
export const text_8a15f3eba711: string = 'اطلاعات و اعضای همین کلاس';
export const text_d77e2ea74d81: string = 'مشاهده کلاس ';
export const text_7c552fd97407: string = 'درخواست‌های تشکیل من';
export const text_d8fc6a9ac464: string = 'پیش‌نویس این دستگاه آمادهٔ ادامه است';
export const text_f025323df559: string = 'درخواست، پس از بررسی به کلاس تبدیل می‌شود.';
export const text_ae57af37bd8e: string = 'دعوت‌های دریافتی';
export const text_80516c4adbbe: string = 'در حال دریافت…';
export const text_9c0bec309b99: string = 'دریافت دعوت‌ها کامل نشد';
export const text_7c8abbb43e1e: string = 'پذیرش دعوت، از ثبت عضویت جداست.';
export const text_2d5123fde88c: string = 'درخواست تشکیل کلاس';
export const text_be28c45ff52d: string = 'بررسی چرخهٔ کامل با دادهٔ آزمایشی';
export const text_ef48d2bacaf5: string = 'سارا احمدی';
export const text_e5199f5b6d80: string = 'نام کلاس';
export const text_c64ac820d916: string = 'هدف و شرح کلاس';
export const text_88cbbb8ed56e: string = 'بدون';
export const text_dbd37af67228: string =
  'مدرس اختیاری است. معرفی حساب پیشنهادی پس از فعال‌شدن فرایند بررسی در دسترس خواهد بود؛ بدون مدرس می‌توانید ادامه دهید.';
export const text_3586930232f0: string = 'ادامه: مخاطبان';
export const text_130ae140b938: string = 'ادامه: مدیریت';
export const text_4f08edebcd83: string = 'ادامه: بازبینی';
export const text_7701570756c1: string = 'ویرایش اطلاعات';
export const text_15dd8091868c: string = 'ارسال برای بررسی';
export const text_6dac6f2cea5f: string =
  'ثبت درخواست تشکیل هنوز برای استفادهٔ عمومی فعال نشده است. پیش‌نویس شما در این دستگاه نگهداری شد؛ کلاسی ساخته نشده است.';
export const text_a55febb18a31: string =
  'ثبت درخواست در انتظار فعال‌سازی است؛ پیش‌نویس حفظ می‌شود و تشکیل فوری انجام نمی‌شود.';
export const text_e10b8496c624: string = 'ارسال برای بررسی · هنوز فعال نیست';
export const text_cd28da707b85: string = 'بررسی ارسال در محیط دادهٔ آزمایشی';
export const text_5b5353ab5636: string = 'مخاطب';
export const text_3a6f00dc84e1: string = 'ظرفیت پیشنهادی';
export const text_56bfaedd15bf: string = ' نفر';
export const text_005d2e7ec4f6: string = 'مدیر پیشنهادی';
export const text_6ccb9cac366e: string = '؛ خودم';
export const text_b7a54e700d6f: string = 'مدرس پیشنهادی';
export const text_1f47a215177a: string = 'فعلاً بدون مدرس';
export const text_e5e36e24f2b7: string = 'عضویت';
export const text_2f6da63d1098: string = 'دعوت و درخواست پیوستن';
export const text_f23409bbb176: string = 'ادامه:';
export const text_1868e63faf08: string = 'ادبیات و نویسندگی';
export const text_06db7e799b6e: string = 'ریاضیات';
export const text_23d18d9b76c5: string = 'علوم';
export const text_edd0aba98b4e: string = 'زبان';
export const text_f709f06f93c6: string = 'هنر';
export const text_fed0b556b58c: string = 'کارگاه داستان‌نویسی';
export const text_23b08487814d: string = 'موضوع انتخاب‌نشده';
export const text_9de05f2d93cf: string = 'سطح مقدماتی';
export const text_94ae36568e14: string = 'مخاطبان مشخص نشده';
export const text_0f008bc0b4c3: string = '۲۰ نفر';
export const text_c2e13662ab6a: string = 'تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی.';
export const text_3f66d1efa564: string = '۱۴۲ نویسه';
export const text_c3e146dab247: string = ' نویسه';
export const text_22e1884c93fc: string = 'فوق‌برنامه · حساب من';
export const text_a3424ca81e64: string =
  'ثبت و پیگیری درخواست‌های تشکیل هنوز برای استفادهٔ عمومی فعال نشده است. پیش‌نویس این دستگاه، رسید ثبت در سرویس نیست.';
export const text_e3df9753b698: string = 'پیش‌نویس این دستگاه';
export const text_777f6e641800: string = 'ادامهٔ پیش‌نویس';
export const text_d4aff2e375a1: string = 'هنوز پیش‌نویسی ندارید';
export const text_2e6ab4d181e4: string = 'ثبت درخواست با عضویت آموزشگاه و تشکیل کلاس فرق دارد.';
export const text_24be1847ebf9: string = 'درخواست تازه';
export const text_16c097e34333: string = 'بررسی درخواست و رسید با دادهٔ آزمایشی';
export const text_f1d396bfc001: string = 'کلاس مستقل';
export const text_b96f10b8974e: string =
  'اطلاعات گروه و کانال وابسته هنوز از سرویس این کلاس اعلام نشده است. گفتگو یا عضویت تازه‌ای از طرف شما ساخته نمی‌شود.';
export const text_2226ed46e579: string = 'گروه گفتگو';
export const text_9ca2016b57ad: string = 'هنوز اعلام نشده';
export const text_5011c7a1dedf: string = 'کانال کلاس';
export const text_a841a213ecf4: string = 'دعوت تازه‌ای ندارید';
export const text_d018b3e1c77e: string = 'دعوت‌های مجاز این حساب در اینجا نمایش داده می‌شوند.';
export const text_a0d568059d0c: string = 'در انتظار فعال‌سازی';
export const text_d896a143e687: string = 'این بخش هنوز برای استفادهٔ عمومی فعال نشده است.';
export const text_ac06972caa41: string = 'بازگشت به فوق‌برنامه';
export const text_ad6bbe672bda: string = 'بررسی همین مرحله با دادهٔ آزمایشی';
export const text_c2713e289a02: string = 'کدام جمله احساس را با «نشان دادن» منتقل می‌کند؟';
export const text_2dc8c7c23f8a: string = 'روایت یک اتفاق کوچک';
export const text_b621650a18c0: string =
  'یک اتفاق روزمره را در ۳۰۰ کلمه و از زاویه دید شخص دیگری روایت کنید.';
export const text_c8bdd789b959: string =
  'صدای چرخ چمدان روی سنگ‌فرش می‌پیچید. از پشت پنجره فقط دست تکان‌دادنش را دیدم…';
export const text_47e5d96a3e5d: string = 'روایت اول من.pdf';
export const text_d1061b5aa4b1: string =
  'جزئیات حسی خوب انتخاب شده‌اند. پایان داستان را کمی روشن‌تر کنید.';
export const text_115e1d08bea1: string = 'در تمرین بعد روی پایان‌بندی کار شود.';
export const text_affad8d9215a: string = 'مرور زاویه دید';
export const text_d77758aaa8d5: string = 'چهار سؤال تستی و یک سؤال تشریحی درباره روایت.';
export const text_b8f88f240683: string = 'تفاوت راوی اول‌شخص و سوم‌شخص را با مثال توضیح دهید.';
export const text_fed04080569d: string = 'مینا خوشحال بود.';
export const text_ef70f5a14bb4: string = 'مینا با لبخند تا در دوید.';
export const text_02ad5c3a8e98: string = 'مینا احساس خوبی داشت.';
export const text_9dd825987398: string =
  'راوی اول‌شخص فقط چیزهایی را می‌بیند که خودش تجربه کرده است…';
export const text_8bf12f329fad: string =
  'تشخیص راوی خوب است. در پاسخ تشریحی، تغییر زاویه دید را با مثال روشن‌تر توضیح دهید.';
export const text_9864adedd182: string = '۰۱۲۳۴۵۶۷۸۹';
export const text_252a75c3a0e3: string = '٠١٢٣٤٥٦٧٨٩';
export const text_682a2e9775e3: string = '٫';
export const text_111933baaec5: string = 'عضویت شما فعال نیست.';
export const text_258882cc0ddc: string = 'کلاس بایگانی است؛ ثبت فعالیت تازه بسته است.';
export const text_7c454393dfcf: string = 'اختیار طراحی آموزش در همین کلاس لازم است.';
export const text_097cdb8a6be1: string = 'اختیار ارزیابی در همین کلاس لازم است.';
export const text_3dad3e8394ac: string = 'عنوان و صورت تکلیف را کامل کنید.';
export const text_266d496a9f42: string = 'نمره و تعداد تلاش باید معتبر باشند.';
export const text_929b1d446a8e: string = 'مهلت تحویل معتبر نیست.';
export const text_b3f9c2ef676e: string = 'بازبینی عنوان، مهلت و فایل‌ها را تأیید کنید.';
export const text_b178997648da: string = 'این پاسخ قبلاً تحویل شده است.';
export const text_5188234a0049: string = 'بازبینی متن و فایل پاسخ را تأیید کنید.';
export const text_04ffd9c20a92: string = 'تکلیف هنوز منتشر نشده است.';
export const text_ad6851ab1af8: string = 'متن یا فایل پاسخ را وارد کنید.';
export const text_949406d5f661: string = 'مهلت این تکلیف تمام شده است.';
export const text_bd7b3fcfc512: string = 'عنوان و مدت معتبر برای آزمون وارد کنید.';
export const text_75bf476d57c9: string = 'صورت سؤال و بارم معتبر لازم است.';
export const text_0bac204b4770: string = 'گزینه‌ها و پاسخ صحیح را کامل کنید.';
export const text_bb0b733e9641: string = 'بازبینی صورت، بارم، زمان و مخاطبان را تأیید کنید.';
export const text_5582faf11763: string = 'حداقل یک سؤال لازم است.';
export const text_a6118e3805da: string = 'شرایط شروع آزمون را تأیید کنید.';
export const text_1e9760d3b4b8: string = 'آزمون هنوز منتشر نشده است.';
export const text_2398f7fd61c9: string = 'این تلاش قبلاً ثبت نهایی شده است.';
export const text_aea1cc1610e2: string = 'این تلاش برای پاسخ‌گویی باز نیست.';
export const text_64cb283a947a: string =
  'زمان پاسخ‌گویی تمام شده است؛ پاسخ تأییدنشده، تحویل‌شده محسوب نمی‌شود.';
export const text_6e364b74a778: string = 'آزمون را از صفحه شرایط شروع کنید.';
export const text_86d84f271049: string = 'پاسخ منتظر تأیید دارید؛ ابتدا اتصال را بررسی کنید.';
export const text_54535c5248b4: string = 'نمره باید بین صفر و بارم کل باشد.';
export const text_5e531489dc01: string = 'برای تغییر نتیجه منتشرشده، اصلاحیه ثبت کنید.';
export const text_412f21a35f7b: string = 'علت اصلاح و تأیید بازبینی لازم است.';
export const text_0893d87c938f: string = 'نمره اصلاح‌شده معتبر نیست.';
export const text_d2bf2d21c42a: string = 'ارسال‌شده';
export const text_952c0b87e7ca: string = 'نیاز به اصلاح';
export const text_10e8b9595ec0: string = 'تأییدشده';
export const text_99f45229feff: string = 'در حال آماده‌سازی';
export const text_ba1f3f7a99ea: string = 'آماده‌سازی کامل نشده';
export const text_f0e31d24a6c1: string = 'آمادهٔ شروع';
export const text_59b3401e2289: string = '۲۰';
export const text_f1187b8fb0df: string = 'نام کلاس باید بین ۳ تا ۱۲۰ نویسه باشد.';
export const text_d9aff55e47e0: string = 'هدف کلاس را با دست‌کم ۳۰ نویسه توضیح دهید.';
export const text_80f4d9ca1657: string = 'موضوع کلاس را انتخاب کنید.';
export const text_4f914334ef4d: string = 'ظرفیت باید یک عدد صحیح مثبت باشد.';
export const text_793067d287e1: string = 'سطح مخاطبان را مشخص کنید.';
export const text_31abf2eac258: string = 'شرایط پذیرش را بنویسید.';
export const text_688356a6c572: string = 'این جریان از دعوت و درخواست عضویت پشتیبانی می‌کند.';
export const text_6edbc574bccb: string = 'مدیر پیشنهادی مشخص نیست.';
export const text_89b07c876ce1: string = 'پیش از ارسال، قواعد را بخوانید و تأیید کنید.';
export const text_3f860a9bf2f2: string =
  'اطلاعات تغییر کرده است؛ نسخهٔ تازه را ببینید. نوشتهٔ شما حفظ شده است.';
export const text_f7469ed3b23b: string = 'برای این بخش عضویت فعال و مجوز لازم است.';
export const text_2aa5723f1ea1: string = 'این اقدام به مدیر پذیرفته‌شدهٔ همین کلاس نیاز دارد.';
export const text_f717d6b7605b: string = 'پذیرش عضو در وضعیت فعلی کلاس ممکن نیست.';
export const text_a63386a0bf02: string = 'ظرفیت کلاس تکمیل شده است. عضویت ثبت نشد.';
export const text_008586e08151: string =
  'تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی. مناسب کسانی که می‌خواهند نوشتن را منظم دنبال کنند.';
export const text_d2e507c244ab: string = 'علاقه‌مندان به داستان کوتاه؛ سطح مقدماتی';
export const text_d2ae39d74879: string = 'بازخورد محترمانه، رعایت حریم دیگران و تمرین هفتگی.';
export const text_9c3669598c7a: string = 'نازنین موسوی';
export const text_77f943ba162c: string = 'مریم رضایی';
export const text_602aeb223572: string = 'امیر نادری';
export const text_0c6c7aa47c3f: string = 'ریحانه زمانی';
export const text_0588ef74a16d: string = 'علی کریمی';
export const text_91ed8760e42c: string = 'نیما نوروزی';
export const text_118676445db4: string = 'سحر رضایی';
export const text_0eb36cac99c8: string = 'کیان نادری';
export const text_858b67b3d41d: string = 'آرمان محمودی';
export const text_6992655043e6: string = 'هانیه کاویانی';
export const text_d81d33db215b: string = 'زهرا امیری';
export const text_4798fc2480e7: string = 'علی محمدی';
export const text_642850f8c790: string = 'درخواست پیدا نشد.';
export const text_4c526956ac52: string = 'کلاس پیدا نشد.';
export const text_6c60533bd66d: string = 'این درخواست متعلق به حساب دیگری است.';
export const text_7295d5d91a51: string = 'شناسهٔ عملیات قبلاً برای اقدام دیگری استفاده شده است.';
export const text_58b9d41376ea: string = 'عضویت فعال این کلاس لازم است.';
export const text_975bebc1b00b: string = 'این نسخه برای ویرایش باز نیست.';
export const text_702d0a0818b6: string = 'درخواست قبلاً ارسال شده است.';
export const text_dc077954d844: string = 'اطلاعات درخواست کامل نیست.';
export const text_4f502a6ac1cd: string = 'لغو در وضعیت فعلی ممکن نیست.';
export const text_b754c5d5b5a0: string = 'بررسی درخواست فقط برای ناظر پیش‌نمایش مجاز است.';
export const text_c07f2df28da8: string = 'این نسخه دیگر قابل تصمیم‌گیری نیست.';
export const text_766e2c802360: string = 'دلیل قابل نمایش را بنویسید.';
export const text_d9eecc571186: string = 'مدیر نهایی را تعیین کنید.';
export const text_efea3936a78c: string = 'آماده‌سازی در این وضعیت قابل تکرار نیست.';
export const text_3184331b379e: string = 'این مسئولیت برای حساب دیگری است.';
export const text_6294aa425870: string = 'مدیر پذیرفته‌شده و هر دو فضای آماده لازم‌اند.';
export const text_212d8ef96e2c: string = 'پذیرش تازه برای این کلاس فعال نیست.';
export const text_32a587b8058d: string = 'یک حساب مجاز انتخاب کنید.';
export const text_4955ad38697f: string = 'اعتبار دعوت باید در آینده باشد.';
export const text_0ac77ca3f59b: string = 'دعوت پیدا نشد.';
export const text_d8c621c9973b: string = 'دعوت برای حساب دیگری است.';
export const text_1fc155b9fbc6: string = 'دعوت منقضی یا پایان‌یافته است.';
export const text_a8a7b00622d8: string = 'درخواست عضویت تازه برای این کلاس فعال نیست.';
export const text_5c619550e9eb: string = 'درخواست عضویت پیدا نشد.';
export const text_150ffec13b8f: string = 'درخواست متعلق به حساب دیگری است.';
export const text_66cdfc824858: string = 'درخواست قبلاً تعیین تکلیف شده است.';
export const text_485ceae81ed2: string = 'درخواست قبلاً بررسی شده است.';
export const text_114007a1ec32: string = 'عضو پیدا نشد.';
export const text_1fd86a67ae63: string =
  'پایان عضویت مدیر، به انتقال معتبر مسئولیت یا بایگانی نیاز دارد.';
export const text_f77fa626cc9e: string = 'دلیل پایان عضویت را بنویسید.';
export const text_8abff118d600: string = 'دلیل بایگانی را بنویسید.';
export const text_a96e8b4e8e3b: string =
  'درخواست تشکیل و هماهنگی گروه و کانال هنوز به قرارداد نهایی سرویس نیاز دارد. پیش‌نویس شما قابل نگهداری است؛ ارسال واقعی فعال نیست.';
export const text_1a892edc1838: string = 'ساختار و کار یاخته';
export const text_0adfcda5e4b9: string = 'متن آموزشی · نمونه';
export const text_f47db0e19977: string =
  'یاخته واحد ساختاری و عملکردی جانداران است. غشای یاخته ورود و خروج مواد را تنظیم می‌کند. هسته اطلاعات وراثتی را در خود نگه می‌دارد و فعالیت‌های یاخته را هماهنگ می‌کند.';
export const text_f2e9bbc90dc7: string = 'یادداشت‌های کلاس زیست';
export const text_e1cce87dadcb: string = 'یادداشت · نمونه';
export const text_54ff7685e1c1: string =
  'بخش بزرگی از فعالیت‌های یاخته در سیتوپلاسم انجام می‌شود. میتوکندری در فراهم‌کردن انرژی نقش دارد. ریبوزوم محل ساخت پروتئین است. ارتباط ساختار هر اندامک با کار آن، به فهم بهتر یاخته کمک می‌کند.';
export const text_7ed6fdbd51db: string = 'مرور نکته‌های فصل اول';
export const text_460a4047ff59: string = 'راهنمای مطالعه · نمونه';
export const text_c0bd763a2d58: string =
  'برای مرور فعال، نقش غشا، هسته، میتوکندری و ریبوزوم را با زبان خودتان توضیح دهید. پس از مطالعه، کتاب را ببندید و تفاوت نقش هر بخش را از حافظه بازگو کنید.';
export const text_6db905812233: string = 'خلاصهٔ هوشمند';
export const text_5ffcdcf1418f: string = 'مهم‌ترین نکته‌ها';
export const text_72536904ad94: string = 'فلش‌کارت';
export const text_5e6630dbb06e: string = 'مرور و یادآوری';
export const text_fd4cfc32a485: string = 'خودت را بسنج';
export const text_70d6ba9db6ab: string = 'پرسش و تمرین';
export const text_b1faa8fffe50: string = 'نقشهٔ مفهومی';
export const text_a6cfd50bbe46: string = 'ارتباط بین ایده‌ها';
export const text_4a5e94c41f2f: string = 'مرور شنیداری';
export const text_cfe0abc887ca: string = 'یادگیری با شنیدن';
export const text_c2f0032b35be: string = 'راهنمای مطالعه';
export const text_0e5acde2ffd7: string = 'مسیر قدم‌به‌قدم';
export const text_7e554f8878f0: string = 'منبع نمونه';
export const text_e3b5971a5cc0: string = 'این متن، محتوای نمونهٔ مستقل برای بررسی رابط است.';
export const text_38983ac5551d: string = 'استودیوی شما اینجا شکل می‌گیرد';
export const text_fc68119ba419: string =
  'ساخت خروجی واقعی پس از فعال‌شدن سرویس دستیار و مشخص‌شدن منابع و اعتبار مصرفی در دسترس خواهد بود.';
export const text_2d2a6bc9349c: string = 'مشاهدهٔ محیط نمونه';
export const text_f08a9801ceef: string = 'یاخته';
export const text_fc25f14c183d: string = 'غشا: تنظیم تبادل';
export const text_20376e24cc20: string = 'هسته: اطلاعات وراثتی';
export const text_e84e0fb134d4: string = 'میتوکندری: انرژی';
export const text_fd88424c55fd: string = 'ریبوزوم: ساخت پروتئین';
export const text_8af6997cd79d: string = 'طرح مرور شنیداری';
export const text_f33ab5c7b3dd: string =
  'پخش صدای واقعی در این نمونه فعال نیست. در نسخهٔ متصل، فایل صوتیِ آماده‌شده و وضعیت تولید آن اینجا نمایش داده می‌شود.';
export const text_0da122fa3614: string = 'از ساختار تا عملکرد';
export const text_afd7d663b964: string = 'یک مسیر کوتاه برای مرور';
export const text_fc6afe072fc3: string =
  '۱. ساختارهای اصلی را بخوانید. ۲. برای هر بخش یک کاربرد بنویسید. ۳. بدون نگاه به متن پاسخ فلش‌کارت‌ها را بدهید. ۴. به نکته‌هایی که فراموش کردید برگردید.';
export const text_96fdb70b6062: string = 'خروجی نمونه · تولید AI نیست';
export const text_7168b7bf2f42: string = 'دستیار ماکان';
export const text_9b37b15e9cb4: string = 'بخش‌های دستیار';
export const text_3b15ef5a6e60: string = 'منابع';
export const text_4172b29c8925: string = 'گفتگو';
export const text_2c38482cbb71: string = 'استودیو';
export const text_d10c65961f64: string = 'منابع دستیار';
export const text_9b5548a0482d: string = '۰';
export const text_1d488a965baa: string = 'افزودن منبع';
export const text_b3b6ab6c3b7f: string = 'مطالعه از منابع خودتان';
export const text_2daaecb60c15: string =
  'بارگذاری و مدیریت منبع واقعی در بخش «منابع من» فعال است. اجرای هوش مصنوعی روی منابع هنوز به فعال‌سازی بازیابی محتوا در سرور نیاز دارد.';
export const text_88e5ddd3c318: string = 'بررسی با منابع نمونه';
export const text_47350c3ef300: string = 'انتخاب همهٔ منابع';
export const text_89e9053371c8: string = 'انتخاب ';
export const text_ceb7a80a0b63: string =
  'منبعی را انتخاب کنید که می‌خواهید در گفتگوی نمونه بررسی شود.';
export const text_a3056b93b3de: string = 'هر فهم تازه، از یک منبع';
export const text_733d4da7dbb7: string = 'کتاب، جزوه و یادداشت‌های شما، نقطهٔ شروع یادگیری‌اند.';
export const text_b46673243f8e: string = 'دیدن منابع نمونه ';
export const text_92392a6f95ab: string = ' منبع نمونه انتخاب شده';
export const text_074439484fe9: string = 'هنوز منبعی انتخاب نشده';
export const text_dfac17a65e7a: string = 'گفتگو با دستیار';
export const text_a92a3df4a112: string = 'محیط نمونه';
export const text_f309d92e2d72: string = 'پیش‌نمایش';
export const text_a7a964d74a5f: string = 'با کنجکاوی شروع کنید';
export const text_66c6f479a6cb: string = 'از منبع،';
export const text_47867d703d42: string = 'تا فهمیدن.';
export const text_7e4e81d1931f: string =
  'بین ایده‌های یک فصل ارتباط پیدا کنید، نکته‌ها را مرور کنید و پرسش‌های تازه بسازید.';
export const text_e4d0e396c63c: string =
  'منابع خود را کنار هم بیاورید؛ بپرسید، کشف کنید و به زبان خودتان یاد بگیرید.';
export const text_6388a1ee7308: string = 'ایده‌های اصلی را خلاصه کن';
export const text_c84904d0e08b: string = 'این موضوع‌ها چه ارتباطی دارند؟';
export const text_147fe2c1e343: string = 'برای مرور، چند سؤال بساز';
export const text_da84fe1b1072: string = 'برای بررسی تعامل‌ها، «دیدن منابع نمونه» را انتخاب کنید.';
export const text_6866c8be836f: string = 'ماکان ';
export const text_7303ff111f09: string = 'پاسخ نمایشی';
export const text_23a7aa8d1e70: string =
  'این پاسخ نمونه برای بررسی رابط است. در نسخهٔ متصل، پرسش شما با منابع مجاز انتخاب‌شده بررسی خواهد شد. بخشی از منابع انتخاب‌شده در این نمونه:';
export const text_a44139def117: string = 'مشاهدهٔ استناد ';
export const text_ec84052031a5: string = 'افزودن به یادداشت‌های این نشست';
export const text_9cd586907a1f: string = 'پرسش از دستیار';
export const text_3a48a21e60d2: string = 'دربارهٔ منابع نمونه بپرسید…';
export const text_19d70e40664b: string = 'پرسش‌های شما از اینجا شروع می‌شوند…';
export const text_f78d14e6ce59: string = 'ارسال پرسش نمونه';
export const text_00a188a1a0ae: string = 'پاسخ نمایشی است؛ اعتباری مصرف نمی‌شود.';
export const text_a785deedc049: string = 'پیش‌نمایش دستیار؛ ارسال واقعی فعلاً فعال نیست.';
export const text_aceecadc2cd5: string = 'استودیوی دستیار';
export const text_8f45e8da411d: string = 'از دانستن، به ساختن';
export const text_1f9ae852e049: string = 'منابع را به ابزار یادگیری تبدیل کنید.';
export const text_700e0dc89890: string = 'یادداشت‌های این نشست';
export const text_854483bf1036: string = 'یادداشت این نشست';
export const text_b4935894c8ce: string = '…';
export const text_1440b0963cde: string = 'ایده‌ای که می‌خواهید نگه دارید، اینجا جای می‌گیرد.';
export const text_c1f6661907f4: string = 'یادداشت‌های نمونه با خروج از صفحه حفظ نمی‌شوند.';
export const text_edf8ab126e8a: string = 'پیش‌نمایش دستیار ماکان؛ دادهٔ نمونه';
export const text_c356c5795ec2: string = 'کدام بخش، تبادل مواد را تنظیم می‌کند؟';
export const text_77965539787c: string = 'غشای یاخته';
export const text_72d55d7f6343: string = 'کدام اندامک در فراهم‌کردن انرژی نقش دارد؟';
export const text_cdf8a680b26d: string = 'میتوکندری';
export const text_b79d6aa8e2be: string = 'محل ساخت پروتئین کجاست؟';
export const text_ae5ed820017c: string = 'ریبوزوم';
export const text_a624a1e41ffd: string = ' از ';
export const text_6c4bd5ff0464: string = 'نمایش یا پنهان‌کردن پاسخ فلش‌کارت';
export const text_41539e7b1611: string = 'برای دیدن سؤال بزنید';
export const text_22c7dc610a49: string = 'برای دیدن پاسخ بزنید';
export const text_37ac8a217a0d: string = 'کارت بعدی ';
export const text_e6a1b6a2b7c8: string = 'کدام بخش، اطلاعات وراثتی را در خود نگه می‌دارد؟';
export const text_9a26ac6c7cc9: string = 'غشا';
export const text_dc1f941e46e2: string = 'هسته';
export const text_bbbed45bce72: string = 'پاسخ نمونه درست است: هسته.';
export const text_fcbec29a8d08: string = 'در این مثال، پاسخ درست «هسته» است.';
export const text_f70724393adb: string = 'دانش‌آموزان فعال';
export const text_9d936eeca4e2: string = 'کلاس‌های فعال';
export const text_09e7817faae8: string = 'فضای ذخیره‌سازی';
export const text_7339f30732c3: string = 'خروجی گزارش';
export const text_63c6b878af2c: string = 'درخواست‌های هوش مصنوعی';
export const text_5bc9b434eaf1: string = 'حجم فایل تکلیف';
export const text_06899237ef70: string = 'بدون اشتراک';
export const text_24a352fc659b: string = 'نزدیک سقف مصرف';
export const text_68f93808bd2c: string = 'سهمیه تمام شده';
export const text_9a43cbcedd12: string = 'مهلت تمدید';
export const text_84999279bbdd: string = 'تغییر پلن برنامه‌ریزی‌شده';
export const text_4b48621f7c39: string = 'در انتظار تکمیل قرارداد قبلی';
export const text_5e6ee5eaa1fe: string = 'نامحدود';
export const text_257b66a50f43: string = 'هنوز گزارش نشده';
export const text_2ae205425d42: string = 'اشتراک آموزشگاه';
export const text_ab67aa4d93be: string = 'اشتراک و مصرف شخصی';
export const text_6ff6f7651ca5: string = 'مصرف و قرارداد آموزشگاه فعال';
export const text_7341b0ece9cc: string =
  'این اشتراک متعلق به حساب شماست و نقش آموزشی ایجاد نمی‌کند.';
export const text_d86b9666ec8d: string = 'اشتراک شخصی';
export const text_f596b5c9d314: string = 'وضعیت قرارداد';
export const text_7ed97f2495a5: string = 'دورهٔ فعلی';
export const text_7168a3799fbf: string = ' تا ';
export const text_c71eb9b208c8: string = 'هنوز دوره‌ای اعلام نشده است';
export const text_a92c3461295f: string = 'تغییر دورهٔ بعد';
export const text_82752778baed: string = 'ثبت شده است';
export const text_8731cd667f6e: string =
  'پرداخت هنوز تأیید نشده است؛ امکانات پولی از روی این وضعیت فعال نمی‌شوند.';
export const text_86a2d2d4def4: string = 'مصرف و سهمیه';
export const text_9abd6e4940e3: string = 'باقی‌مانده: ';
export const text_2f1247d5894e: string = 'مصرف:';
export const text_e2229ea0cb31: string = 'سقف مصرف این سهمیه تمام شده است.';
export const text_5de725f5f494: string = 'سهمیه‌ای برای نمایش گزارش نشده است.';
export const text_dc39ddb24c12: string = 'اطلاعات سرویس: ';
export const text_16d1d8fb88d8: string = 'پلن‌ها و برآورد هزینه';
export const text_13877f13269f: string = 'پلنی برای خرید عرضه نشده است';
export const text_d9772fd00176: string = 'پلن';
export const text_c47e8cf0803f: string = 'انتخاب پلن…';
export const text_588da4105320: string = ' · ';
export const text_a1dbc531a2cd: string = 'نوع درخواست';
export const text_06e54bf7afe6: string = 'خرید';
export const text_3225fab3cd96: string = 'تمدید';
export const text_a5ebe3e6fe5e: string = 'ارتقا';
export const text_d2160f8eb18d: string = 'دریافت برآورد هزینه';
export const text_bae7e088f1e1: string = 'اعتبار برآورد:';
export const text_2b1bf830baea: string = 'اعلام نشده';
export const text_9ae95d6b5b73: string = ' · آغاز دوره و دسترسی به تأیید معتبر سرویس وابسته است.';
export const text_194fed9c2345: string =
  'اعتبار این برآورد پایان یافته؛ دوباره هزینه را دریافت کنید.';
export const text_6ff723ebc69c: string = 'ساخت سفارش در انتظار پرداخت';
export const text_cdc6409eb6a5: string = 'ثبت سفارش شخصی';
export const text_2a70b317c5f5: string = 'ثبت سفارش به‌تنهایی پرداخت یا فعال‌شدن اشتراک نیست.';
export const text_0c2133fae476: string = 'ثبت سفارش';
export const text_4097df6f7123: string = 'دلیل تغییر پلن دورهٔ بعد';
export const text_bca8396dc77f: string = 'درخواست کاهش پلن دورهٔ بعد';
export const text_b15663c9902c: string = 'برنامه‌ریزی تغییر پلن';
export const text_353836470669: string =
  'تغییر، در صورت پذیرش سرویس برای دورهٔ بعد ثبت می‌شود؛ اطلاعات شخصی حذف نمی‌شوند.';
export const text_ed47f8b6e65c: string = 'سفارش ثبت شد';
export const text_2b18443f7114: string = 'وضعیت: ';
export const text_5adab0015a6e: string = ' · انجام خدمت: ';
export const text_f22a3f010537: string =
  'پرداخت آنلاین در انتشار فعلی فعال نیست. ثبت سفارش، مجوز یا نقش آموزشی ایجاد نمی‌کند.';
export const text_efb1be1f18cb: string = '۲۰ سفارش اخیر';
export const text_f0452fb92a5a: string = 'جزئیات سفارش';
export const text_f53c7f5829aa: string = 'سفارشی ثبت نشده است';
export const text_cb52f9e6dc45: string = 'وضعیت سفارش';
export const text_62b1f7b3faed: string = 'انجام خدمت';
export const text_3962cd7270f8: string = 'پرداخت تأییدشده';
export const text_d2793bd966f1: string = 'تأیید نشده است';
export const text_734d018ac4a2: string = 'اطلاعات این فعالیت در دسترس نیست.';
export const text_24bd7a24b162: string = 'جزوه و درس';
export const text_b9bdf50e5da3: string = 'تکلیف';
export const text_206d5b48e297: string = 'آزمون';
export const text_69450aad3cb7: string = 'جلسه';
export const text_2b89c5e7c77c: string = 'اعلان رسمی ';
export const text_dbc69e9ad1f5: string = 'جلسه زمان‌بندی‌شده';
export const text_e8d6542230fa: string = 'زمان جلسه تغییر کرد';
export const text_2c7adbf2d789: string = 'جلسه لغو شد';
export const text_fb55e9f21f27: string = 'جلسه برگزار شد';
export const text_51f78cd291fd: string = ' منتشرشده';
export const text_2b26e703adf2: string = 'مهلت تحویل';
export const text_8ea5a5c720cd: string = 'آغاز دسترسی';
export const text_5cff509ed1c9: string = 'پایان دسترسی';
export const text_ea1fc651da61: string = 'مشاهدهٔ ';
export const text_15f8a8202db0: string = 'این نسخه قابل استفاده نیست';
export const text_9097c960cf50: string = 'اطلاعات جاری فعالیت باید دوباره بررسی شود.';
export const text_25384e522776: string = 'در حال بررسی…';
export const text_382037f6b1a3: string = 'بررسی نسخهٔ جاری';
export const text_c69ebbd6ae2f: string = 'مخاطب در سرور ذخیره شد.';
export const text_8236f4ce3dac: string = 'مخاطبین شما';
export const text_1971055384f8: string = 'بخش‌های مخاطبین';
export const text_759044ca1d2d: string = 'مخاطبین';
export const text_5fde423d6a3f: string = 'مخاطب جدید';
export const text_6c705b7f7da2: string = 'جستجوی افراد';
export const text_a72edc3a1bd6: string = 'در حال بررسی وضعیت ارتباطی…';
export const text_1b9ffc2a9963: string =
  'گفت‌وگو با مخاطبانی که برای حساب شما مجاز هستند فعال است.';
export const text_3dad9471da0a: string = 'وضعیت ارتباطی حساب';
export const text_a86147563bca: string =
  'این وضعیت از تنظیمات فعلی حساب دریافت شده است؛ ذخیرهٔ مخاطب به‌تنهایی مجوز ارتباط ایجاد نمی‌کند.';
export const text_dc1e77f52af9: string = 'تکمیل پروفایل';
export const text_6242b7c1497d: string = 'اطلاعات مخاطب معتبر نیست.';
export const text_54c852331c9b: string = 'شمارهٔ همراه یا نام کاربری';
export const text_30d28a3021cd: string = 'شماره یا نام کاربری مخاطب';
export const text_cff9c0e723ac: string = '@username یا 09123456789';
export const text_43dad0d90fdf: string = 'پیدا کردن مخاطب';
export const text_0364864766f8: string = 'مخاطب قابل مشاهده‌ای پیدا نشد';
export const text_2dd3b2bb5816: string =
  'شماره یا نام کاربری را بررسی کنید. نتیجه تابع حریم خصوصی و وضعیت مجاز ارتباط حساب‌هاست.';
export const text_c3641f8544d7: string = '@';
export const text_c068733f39cf: string = 'این حساب خود شماست؛ مخاطب دیگری را پیدا کنید.';
export const text_07436f1f45ac: string = 'نام ذخیره‌شده (اختیاری)';
export const text_7290148d263c: string = 'ذخیرهٔ مخاطب';
export const text_2d995041bb4a: string = 'شروع گفت‌وگو';
export const text_b8440364bb81: string =
  'شروع گفت‌وگو با این حساب فعلاً مجاز نیست. وضعیت حساب خود را از «حساب من» بررسی کنید.';
export const text_88c808fdf7f4: string = 'جستجو در دفترچهٔ مخاطبین';
export const text_2562435815a8: string = 'جستجوی حساب‌های قابل مشاهده';
export const text_2c54ecc60e86: string = 'عبارت جستجوی مخاطب';
export const text_47c491561dd4: string = 'نام ذخیره‌شده یا نام کاربری…';
export const text_39abf906c29d: string = 'نام یا نام کاربری…';
export const text_2a93eb7f06ce: string = 'جستجو';
export const text_8e4123c40ba0: string = 'نام یا نام کاربری را جستجو کنید';
export const text_514b1fbad09d: string =
  'فقط اطلاعاتی نمایش داده می‌شود که مشاهدهٔ آن برای شما مجاز است.';
export const text_8d1b81ec1aa1: string = 'مخاطبی در این فهرست نیست';
export const text_9620a4294e2d: string = 'حساب قابل مشاهده‌ای پیدا نشد';
export const text_17f6af62f546: string =
  'از بخش مخاطب جدید، یک حساب را پیدا و به دفترچه اضافه کنید.';
export const text_dae5c09caaa2: string =
  'عبارت جستجو را تغییر دهید؛ نتیجه تابع حریم خصوصی و مجوزهای ارتباط است.';
export const text_99c891fdab48: string = 'گفت‌وگو';
export const text_8cfe257aece4: string = 'ذخیره';
export const text_a7009e9019ab: string = 'صفحهٔ قبلی مخاطبین';
export const text_2714496eef16: string = 'صفحهٔ ';
export const text_a0b6f49670b9: string = 'صفحهٔ بعدی مخاطبین';
export const text_aa46bc41d37e: string = 'مدیریت ';
export const text_dae770ce3334: string = 'مدیریت مخاطب';
export const text_796ebc9a8741: string = 'نام ذخیره‌شده';
export const text_c4749ec2c895: string = 'مخاطب برگزیده';
export const text_b5ef00b1806f: string = 'در حال ثبت…';
export const text_b7d4e6239152: string = 'ثبت تغییرات مخاطب';
export const text_d5499ef00124: string =
  'حذف از دفترچه و مسدودکردن ارتباط دو اقدام جدا هستند. تاریخچهٔ گفتگو با حذف مخاطب پاک نمی‌شود.';
export const text_b41fe8563d7d: string = 'بستن و بازخوانی مخاطب';
export const text_539f52498828: string = 'حذف از دفترچه';
export const text_24417444e3d1: string = 'مسدودکردن';
export const text_1e0263ee04dd: string = 'گزینه‌های گفتگو';
export const text_3a3510c0ba99: string = 'اطلاعات گفتگو';
export const text_563cba00d087: string = 'رسانه و فایل';
export const text_ad01ea1c94b6: string = 'تنظیمات گفتگو';
export const text_fadd8b25529b: string =
  'این گزینه هنوز فعال نشده است و تغییری در تنظیمات شما ایجاد نمی‌کند.';
export const text_db8eb8579dae: string = 'فعال‌کردن صدا';
export const text_16be3d3db4fc: string = 'بی‌صدا';
export const text_0ac642a80e31: string = 'اطلاعات';
export const text_102f79b3f87c: string = 'اعضا';
export const navigation_settings: string = 'تنظیمات';
export const text_9f3597ff2f66: string = 'پیام‌های ذخیره‌شده';
export const text_8f421b73047d: string = 'گفت‌وگوی مستقیم';
export const text_c982501f1e57: string = 'مشاهدهٔ کانال';
export const text_a5fc55f1f6ee: string = 'پیام';
export const text_6577ef461d82: string = 'رسانه‌ها';
export const text_32cd42113754: string = 'جزئیات گفتگو';
export const text_12512b4e3543: string = 'امکان مدیریت این گفتگو برای شما فعال نیست';
export const text_f82c6fe06a24: string = 'پیام‌های ذخیره‌شدهٔ شما';
export const text_e02d12375642: string = 'اطلاعات مخاطب';
export const text_6223ba2ea5ad: string = 'این گفتگو مستقل از عضویت آموزشی شماست.';
export const text_86b851ad9cd5: string = 'این گفتگو به آموزشگاه تعلق دارد.';
export const text_7f018872aab1: string = 'ویرایش گفتگو';
export const text_cc139334bedd: string = 'اطلاعات کانال';
export const text_52d7d84bf065: string = 'اطلاعات گروه';
export const text_4d3401e58f25: string = 'توضیحی ثبت نشده است.';
export const text_1b68cebe6d65: string = 'نوع کانال';
export const text_b9eed0dd74cd: string = 'نوع گروه';
export const text_526e310df41f: string = 'عمومی';
export const text_e205d3a7a33e: string = 'خصوصی';
export const text_88712bbe9ebc: string = 'تاریخچه برای عضو جدید';
export const text_c693180e811e: string = 'از زمان عضویت';
export const text_747182bc8309: string = 'تاریخچهٔ کامل';
export const text_e21033a53839: string = 'مشترکان کانال';
export const text_5de04c1ab9c6: string = 'اعضای گروه';
export const text_a5f9af4e336a: string = 'اعضا و مدیران';
export const text_0b9e68551045: string = 'تنظیمات کانال';
export const text_c72d0ff183f6: string = 'تنظیمات گروه';
export const text_0045a56d2e19: string = 'عضو گفتگو';
export const text_01793b42b2ba: string =
  'عضویت و مدیریت این فضای رسمی تابع دسترسی آموزشی معتبر است.';
export const text_9299c9dc14c6: string = 'ترک گفتگو';
export const text_c71a9ac02f77: string = 'ترک کانال';
export const text_25e26909e1ab: string = 'ترک گروه';
export const text_2b09c8612d26: string =
  'عضویت شما در این گفتگو پایان یابد؟ در صورت نیاز به انتقال مدیریت، سرویس اجازهٔ خروج را مشخص می‌کند.';
export const text_76c4dcda8d25: string = 'گزینه‌های مدیریت گفتگو';
export const text_93241310d77c: string = 'تاریخچهٔ گفتگو';
export const text_4e95f3ce6edd: string = 'کامل';
export const text_7d6bf52fbd3e: string = 'موضوعات';
export const text_30b5f221253e: string = 'اتصال یک گروه گفتگو به این کانال هنوز در دسترس نیست.';
export const text_10c263e49b58: string = 'لینک‌های دعوت';
export const text_6e0960982174: string = 'واکنش‌های مجاز';
export const text_659615a7e539: string =
  'انتخاب واکنش‌های مجاز برای کل گفتگو هنوز در دسترس نیست. واکنش به پیام با این تنظیم متفاوت است.';
export const text_b2c00b4bfc07: string = 'پیام خوشامد';
export const text_53c8f001930c: string = 'تنظیم پیام خودکار برای اعضای جدید هنوز در دسترس نیست.';
export const text_7ac728600e49: string = 'پخش زنده';
export const text_ab5201540315: string = 'گفتگوی تصویری';
export const text_7d03f42270a4: string = 'تماس و پخش زنده هنوز در این نسخه در دسترس نیست.';
export const text_6347d5e56150: string = 'اعضای گفتگو';
export const text_fe9630da3708: string = 'حذف‌شده';
export const text_568c1cd99f89: string = 'خارج‌شده';
export const text_6e01f78b9eb4: string = '· ';
export const text_2c34dd61a34f: string = 'عضوی برای نمایش وجود ندارد';
export const text_88e65319d694: string = 'صفحهٔ قبل';
export const text_12ca1a58c6ca: string = 'صفحهٔ بعد';
export const text_8b5bf435319d: string = 'رسانه‌ها و فایل‌ها';
export const text_745ae2a160df: string = 'نوع رسانه';
export const text_85a801ba9df1: string = 'همهٔ رسانه‌ها';
export const text_972d6b378a7b: string = 'عکس';
export const text_8a1583a102ac: string = 'ویدئو';
export const text_d099cfd756e0: string = 'فایل';
export const text_648cc23ae875: string = 'رسانه‌ای در این بخش نیست';
export const text_12e9b2eceeab: string = 'نمایش بیشتر';
export const text_8d780fc7d678: string =
  'دسترسی تغییر تنظیمات این گفتگو از طرف سرویس برای شما فعال نشده است.';
export const text_6d85705a8779: string = 'نمایان‌بودن';
export const text_cb504fe8648a: string = 'عضویت با دعوت یا لینک معتبر انجام می‌شود.';
export const text_6d2331f083cb: string = 'این گفتگو طبق مجوزهای سرویس قابل پیدا کردن و پیوستن است.';
export const text_364d7031b847: string = 'عضو جدید پیام‌های پس از پیوستن را می‌بیند.';
export const text_b0faa1b686ee: string = 'پیام‌های قبلی نیز مطابق دسترسی سرویس نمایش داده می‌شوند.';
export const text_0f50f4779d8f: string = 'ثبت تنظیمات گفتگو';
export const text_5a085de59e41: string = 'نسخهٔ تنظیمات تغییر کرده؛ انتخاب شما حفظ شده است.';
export const text_077b680f5a66: string = 'دریافت تنظیمات تازه';
export const text_360204aefeab: string = 'جایگزینی با نسخهٔ سرویس';
export const text_6b8cef37f4f4: string = 'تغییرات ثبت‌نشده با نسخهٔ تازهٔ سرویس جایگزین شوند؟';
export const text_b2764e825c30: string = 'تنظیمات گفتگو ثبت شد.';
export const text_863dece374bf: string = 'خروج از آرشیو';
export const text_5c846bae22ae: string = 'آرشیو گفتگو';
export const text_7961f47c1630: string = 'بازگرداندن به گفتگوها';
export const text_dc67b660687e: string = 'فقط جای این گفتگو در فهرست شما تغییر می‌کند.';
export const text_38ec5214a232: string = 'راهنمای مجوزهای گفتگو';
export const text_4ccd6c829701: string = ' · تابع رابطهٔ آموزشی معتبر';
export const text_a84fa232d06f: string = 'نمایش این راهنما مجوز تازه‌ای ایجاد نمی‌کند.';
export const text_b85242f37ccd: string = 'پیش‌نمایش عکس گفتگو';
export const text_143aeaee6b15: string = ' انتخاب تصویر جدید';
export const text_a7480130fc2b: string = 'انتخاب تصویر جدید';
export const text_5113d0e0e0e8: string = 'فقط عکس JPEG یا PNG انتخاب کنید.';
export const text_56ec52fa6f01: string = 'در حال ثبت عکس…';
export const text_13f81bac7421: string = 'بررسی و ثبت عکس';
export const text_51cb4266ea57: string = 'ثبت عکس گفتگو';
export const text_4712ca2231df: string = 'انصراف از عکس';
export const text_b2f86f358502: string = 'حذف عکس گفتگو';
export const text_72726ca1cd49: string = 'عکس فعلی از گروه یا کانال برداشته شود؟';
export const text_578786ff448b: string = 'شما';
export const text_6a022c87a2bf: string = 'گفتگو با ';
export const text_5d8f912f993a: string = 'بازگشت به فهرست گفتگوها';
export const text_c8d071ed9a9d: string = 'یادداشت‌های شخصی';
export const text_25d5b2def6af: string = 'فضای شخصی · مستقل از عضویت آموزشگاهی';
export const text_7298890ac877: string = 'فضای آموزشگاه';
export const text_d27b9667efd9: string = 'پیام‌های گفتگو';
export const text_14411b1e6c7b: string = 'پیام‌های قدیمی‌تر';
export const text_4ca85a23d967: string = 'شروع گفتگو';
export const text_f8b315b8d51e: string = 'پیام‌ها و فایل‌های خود را اینجا نگه دارید.';
export const text_95aa33dd2c6c: string = 'پیام‌ها و فایل‌های این گفتگو اینجا نمایش داده می‌شوند.';
export const text_ea3d101400ed: string = 'مشاهدهٔ اطلاعات';
export const text_9a8e4bfdd18e: string = 'امروز';
export const text_105c4ade8a0f: string = 'این پیام حذف شده است';
export const text_03049af97fa6: string = 'پیوست فایل';
export const text_dc81ca4bc376: string = 'نظرسنجی';
export const text_b769871263a6: string = 'فهرست کارها';
export const text_d1260a2bc5bc: string = ' · ویرایش‌شده';
export const text_bb4316d764c2: string = 'خوانده‌شدن مطابق وضعیت مجاز سرور';
export const text_53bf8bd91a86: string = 'در حال ارسال';
export const text_1ec80fd5a1e8: string = 'نتیجهٔ ارسال هنوز تأیید نشده است.';
export const text_c46b279861d2: string = 'تلاش دوباره با همین پیام';
export const text_bdf647a61e01: string = 'بررسی سابقه';
export const text_fbe57107fa7a: string = 'حذف از این دستگاه';
export const text_13071319d8cf: string = 'حذف پیام تأییدنشده از این دستگاه';
export const text_707149982ab3: string =
  'این کار فقط نسخهٔ در انتظار را پاک می‌کند. اگر سرور پیام را قبلاً دریافت کرده باشد، پیام ارسال‌شده حذف نمی‌شود.';
export const text_984e98b25e78: string = 'حذف نسخهٔ محلی';
export const text_917b9bf81a8b: string = 'بررسی دسترسی ارسال پیوست انجام نشد.';
export const text_41c9d368bbac: string = 'بررسی دوباره';
export const text_ee786ae11865: string = 'عملیات انجام نشد.';
export const text_0ac3a64e7697: string = 'خواندن هنوز تأیید نشده؛ تلاش دوباره';
export const text_690c0f7da867: string = 'پاسخ به ';
export const text_a6340bbd29bf: string = 'پاسخ به پیام';
export const text_1ca12aac9cb5: string = 'پیام در دسترس نیست';
export const text_a50a7cb6d955: string = 'پیام حذف شده';
export const text_9b48d3d38fcb: string = 'پیوست';
export const text_9a9aac0aea02: string = 'لغو پاسخ';
export const text_8b2fcc6817d9: string = 'متن پیام';
export const text_5be55bdb4435: string = 'پیامی بنویسید…';
export const text_51dd685556b8: string = 'ارسال پیام';
export const text_afacfaf1253c: string = 'ارسال با وضعیت فعلی این گفتگو در دسترس نیست.';
export const text_ab3c684df5df: string = 'فضای شخصی';
export const text_841155a2a14a: string = 'وضعیت گفتگو';
export const text_1c83101a8251: string = 'آرشیوشده';
export const text_c013d6520838: string = 'عضویت‌های فعال';
export const text_36ee8a4d404c: string = 'نوع گفتگو';
export const text_d2e8c7886801: string = 'نقش شما در گفتگو';
export const text_5749a86140fa: string = 'ثبت نشده';
export const text_18e4bfbdd46c: string = 'نتیجه اعضای اولیه';
export const text_5d9847e7a6c5: string =
  ' دعوت در انتظار پذیرش است؛ این افراد هنوز عضو فعال نیستند.';
export const text_5ab557da3fac: string = 'انقضای دعوت ';
export const text_e7ac0786668e: string = ':';
export const text_f08f6d214f82: string = ' نفر عضو شدند.';
export const text_dc08253feac0: string = 'افزودن ';
export const text_259d82026478: string = ' مخاطب در دسترس نبود.';
export const text_07379c3f080e: string = 'اطلاعات درخواست ذخیره‌شده قابل بررسی نیست.';
export const text_f00bc0f210dc: string = 'این درخواست به فضای شخصی تعلق ندارد.';
export const text_f43b73d65e75: string =
  'امکان نگهداری پیش‌نویس وجود ندارد. ذخیره‌سازی مرورگر را بررسی کنید.';
export const text_a62512b0c13b: string = 'مرحلهٔ ';
export const text_bc9c03bb975e: string = '۲';
export const text_62b67013987e: string = '۱';
export const text_f4f45f3f86f8: string = ' از ۲';
export const text_70c53f6a4727: string = 'ایجاد گروه';
export const text_21579cd85bef: string = 'ایجاد کانال';
export const text_043cba85cfbc: string = 'مخاطبین مورد نظر را برای عضویت اولیه انتخاب کنید.';
export const text_ccfdb4dc6298: string =
  'نام و توضیحات را وارد کنید؛ در مرحلهٔ بعد اعضا را انتخاب می‌کنید.';
export const text_3bd2ff842bd4: string = 'ساخت این فضا فعلاً مجاز نیست';
export const text_e0318aee0f47: string = 'بررسی وضعیت حساب';
export const text_e5abd525ad78: string = 'مراحل ایجاد گفتگو';
export const text_5b40aa409c80: string = 'اطلاعات ';
export const text_c476c232b8e6: string = 'انتخاب مخاطبین';
export const text_0e1567f71aa6: string = 'نام گروه';
export const text_e282736ca3cc: string = 'نام کانال';
export const text_75e45482aebb: string = 'توضیحات (اختیاری)';
export const text_d09e4c6a2b5a: string = 'دسترسی';
export const text_398ac1b17cdd: string = 'نوع دسترسی را انتخاب کنید';
export const text_20acc600bc80: string = 'این حساب در حال حاضر اجازهٔ ساخت گروه خصوصی دارد.';
export const text_d30d3aa840fa: string = 'تاریخچه برای عضو جدید (اختیاری)';
export const text_99f51b9ca3db: string = 'تنظیم پیش‌فرض سرویس';
export const text_079e2f4cd4d2: string = 'تاریخچهٔ مجاز کامل';
export const text_4339e868ff4c: string = 'مخاطب انتخاب شده';
export const text_d6aa12d559e9: string = 'ویرایش';
export const text_b462d2f2ea47: string = 'اعضای اولیه از مخاطبین';
export const text_78c43fe4c4d4: string = 'جستجوی مخاطبین برای دعوت';
export const text_671a1dcda1c2: string = 'جستجوی مخاطبین';
export const text_903259a26e2b: string =
  ' مخاطب انتخاب شده است. دعوت اعضا همچنان تابع حریم خصوصی آن‌هاست.';
export const text_185fb1725ae8: string = 'مخاطبی برای انتخاب در این صفحه نیست';
export const text_93792447ba47: string = 'می‌توانید بعداً اعضای مجاز را اضافه کنید.';
export const text_ca7549e86e0e: string =
  'نتیجهٔ این درخواست هنوز نهایی نشده است. برای پیگیری، همان مشخصات ذخیره‌شده دوباره ارسال می‌شود.';
export const text_9e8be562d436: string = 'انتخاب مخاطبین ';
export const text_6f96c570c24b: string = 'پیگیری همین درخواست';
export const text_9c8e4fa37d9f: string = 'ساخت گروه';
export const text_67f771b12e76: string = 'ساخت کانال';
export const text_33698387f1a0: string = 'شمارهٔ همراه معتبر وارد کنید.';
export const text_ed1379baea73: string = 'نام کاربری معتبر وارد کنید.';
export const text_db54be8c6231: string = 'مدیریت لینک‌های دعوت برای شما فعال نیست';
export const text_52fb3fc1116c: string = 'لینک جدید';
export const text_c82f98b3969b: string = 'دعوت جدید';
export const text_fbb4e2588109: string = 'لینک دعوت جدید';
export const text_d5019c056b53: string = 'لینک کپی شد.';
export const text_83a9db1ceb63: string = 'کپی خودکار ممکن نشد؛ لینک را انتخاب و کپی کنید.';
export const text_3b907474a390: string = 'کپی لینک';
export const text_069812fe4aca: string = 'لینک برای اشتراک‌گذاری کپی شد.';
export const text_664cd187c8b4: string = 'اشتراک‌گذاری انجام نشد؛ می‌توانید لینک را کپی کنید.';
export const text_075b83ebe614: string = 'اشتراک‌گذاری';
export const text_a0cb26a781b7: string =
  'لینک ثبت شده است، اما کد آن در پاسخ سرویس موجود نیست. لینک تازه‌ای بسازید.';
export const text_5317ef2d15be: string =
  'لینک تازه را همین حالا کپی کنید؛ سرویس آن را در فهرست بعدی برنمی‌گرداند.';
export const text_01ecef85ebd9: string = 'لینک دعوت';
export const text_7f81e6534834: string = 'منقضی‌شده';
export const text_4d36dcae4aa5: string = 'ظرفیت تکمیل‌شده';
export const text_5fd8e4601000: string = 'اعتبار تا ';
export const text_26f8def7f686: string = ' استفاده ·';
export const text_8828599b0d27: string = 'نیازمند تأیید مدیر';
export const text_db1beec49bc6: string = 'بدون تأیید مدیر';
export const text_3f33c72118c4: string = 'لغو لینک دعوت';
export const text_e1fd59fc4069: string = 'لغو لینک';
export const text_003b1c0a04e4: string = 'این لینک دیگر قابل استفاده نخواهد بود.';
export const text_8009dd2a1225: string = 'لینک دعوتی ساخته نشده است';
export const text_28d94a2716a9: string = 'قبلی';
export const text_a381bb5c90e2: string = 'بعدی';
export const text_7612c9fe1f3a: string =
  'زمان اعتبار، تعداد استفاده و تأیید اعضای جدید را مشخص کنید.';
export const text_7fb27240d29d: string = 'اعتبار لینک';
export const text_4cbac929c674: string = 'یک ساعت';
export const text_bc0743dbf6f7: string = 'یک روز';
export const text_8626eabab1ff: string = 'یک هفته';
export const text_d1b873e25f3a: string = 'حداکثر تعداد استفاده';
export const text_596e7a455ae9: string = 'تأیید اعضای جدید توسط مدیر';
export const text_5db8879fe0d3: string =
  'نتیجهٔ درخواست قبلی نامشخص است؛ تلاش مجدد با همان مشخصات انجام می‌شود.';
export const text_6b7a414cc01b: string = 'در حال ساخت…';
export const text_8ea79cd585d1: string = 'تلاش مجدد';
export const text_66844075e887: string = 'ساخت لینک دعوت';
export const text_49b752556153: string = 'درخواست‌های عضویت';
export const text_2abca77097a6: string = 'درخواست عضویت';
export const text_e81c80fd6d5f: string = 'در انتظار بررسی';
export const text_40d407fc5e46: string = 'تأیید عضویت';
export const text_cca763acd0d2: string = 'رد عضویت';
export const text_cc522e594117: string = 'رد';
export const text_c356dfccba3c: string = 'وضعیت این درخواست تغییر کند؟';
export const text_5e52f10bb784: string = 'درخواست عضویتی وجود ندارد.';
export const text_320b8978731f: string = 'درخواست‌های قبلی';
export const text_0d27a1d50d56: string = 'درخواست‌های بعدی';
export const text_769f4b226ba8: string = 'پیوستن با لینک دعوت';
export const text_7eb3656e5a7f: string = 'عضویت انجام نشد';
export const text_359af05980d7: string =
  'این درخواست رد، لغو یا منقضی شده است. برای دعوت تازه با مدیر گفتگو هماهنگ کنید.';
export const text_69e404d12a5d: string = 'درخواست عضویت ارسال شد';
export const text_e22edc26122a: string = 'پس از تأیید مدیر، گفتگو در دسترس خواهد بود.';
export const text_0f4cdfe13480: string = 'شما عضو این گفتگو هستید';
export const text_b1e513632610: string = 'عضویت شما تأیید شد';
export const text_f0e20f906599: string = 'ورود به گفتگو';
export const text_1be42c39e984: string = 'کد دعوت';
export const text_2f53ed20dec0: string =
  'با تأیید، درخواست پیوستن شما طبق تنظیمات دعوت برای سرویس ارسال می‌شود.';
export const text_ab3d1db5c4aa: string = 'پیوستن به گفتگو';
export const text_db45e600c458: string = 'امکان ویرایش اطلاعات این گفتگو برای شما فعال نیست';
export const text_692d5f61506b: string = 'ویرایش کانال';
export const text_b3fb229e6d10: string = 'ویرایش گروه';
export const text_6fa623053bf9: string = 'ذخیرهٔ اطلاعات';
export const text_b135dd6203d6: string = 'نام ';
export const text_a143258455bb: string = 'در حال ذخیره…';
export const text_cb06ae591439: string = 'اطلاعات گفتگو تغییر کرده است؛ پیش‌نویس شما حفظ شد.';
export const text_acbe68adf3ef: string = 'دریافت اطلاعات تازه';
export const text_aae95f355460: string = 'دریافت نسخهٔ تازه';
export const text_186123082d3d: string = 'تغییرات ثبت‌نشده با اطلاعات تازه جایگزین شود؟';
export const text_197e7ea6aea8: string = 'اطلاعات گفتگو ذخیره شد.';
export const text_5a817834209d: string = 'افزودن عضو';
export const text_1ac1bbc54827: string =
  'یک مخاطب را به گفتگو اضافه کنید. حریم خصوصی و اجازهٔ عضویت توسط سرویس بررسی می‌شود.';
export const text_a6c3837b1064: string = 'جستجوی عضو جدید';
export const text_d14da946f17b: string = 'نام مخاطب';
export const text_35167823835d: string = 'عضو است';
export const text_50c8d65df6bb: string = 'افزودن';
export const text_fc5b13da691b: string = 'مخاطبی پیدا نشد';
export const text_eb33997cc70e: string = 'نقش و عضویت فرد را در همین گفتگو مدیریت کنید.';
export const text_9d2a510784b3: string = 'حذف دسترسی مدیریت';
export const text_8c33d1a8641b: string = 'ارتقا به مدیر';
export const text_464460abd037: string = 'حذف از گفتگو';
export const text_6b845561eedd: string = 'عضویت این فرد در گفتگو پایان یابد؟';
export const text_a849795e6bcd: string = 'این فرد به مدیر گفتگو ارتقا یابد؟';
export const text_12513980880d: string = 'دسترسی مدیریت حذف و عضویت عادی حفظ شود؟';
export const text_21cd4c9cfde3: string = 'تأیید تغییر';
export const text_4f65338b34d1: string = ' مگابایت';
export const text_0429192e427e: string = ' کیلوبایت';
export const text_41b6f21037c8: string = ' بایت';
export const text_c9d95977a264: string = 'انتقال فایل انجام نشد.';
export const text_a489ae36a167: string = '٪';
export const text_89f52370cb8d: string =
  'فایل در سرور در حال آماده‌شدن است؛ برای بررسی دوباره، دکمهٔ ارسال را بزنید.';
export const text_417503843545: string =
  'این فایل برای ارسال در دسترس نیست. آن را از انتخاب‌ها بردارید.';
export const text_facb92f52d74: string = 'پیام هنوز در صف ارسال ثبت نشده است. دوباره تلاش کنید.';
export const text_fbc1848b434f: string =
  'انتقال متوقف شد؛ می‌توانید دوباره ادامهٔ کار را بررسی کنید.';
export const text_01eac8227680: string = 'افزودن پیوست';
export const text_00cd0fea581c: string = 'پیوست‌های انتخاب‌شده ';
export const text_4cab0b40565e: string = 'دوربین';
export const text_5c661ce3aa5f: string = 'عکس از گالری';
export const text_de0372679118: string = 'ویدئو از گالری';
export const text_9974dd3a9f4a: string = 'فایل از دستگاه';
export const text_15e11a432ae3: string = 'عکاسی با دوربین';
export const text_9105d8bdec0d: string = 'انتخاب عکس از گالری';
export const text_8815ba986d1a: string = 'انتخاب ویدئو از گالری';
export const text_02cc50e960a7: string = 'انتخاب فایل از دستگاه';
export const text_4314e718c6d3: string = 'ارسال پیوست';
export const text_43428a0f7e51: string =
  'پیش‌نمایش فایل‌ها را ببینید و در صورت نیاز توضیح اضافه کنید.';
export const text_066f81d641f6: string = 'در حال بررسی در سرور';
export const text_c16dbde9ad0a: string = 'در حال بارگذاری';
export const text_69791a3b81bf: string = 'آمادهٔ ارسال';
export const text_e14b064baee8: string = 'برای ارسال انتخاب شده';
export const text_6f5fc5cfc9f9: string = 'حذف از انتخاب‌ها: ';
export const text_eaca3b73fa59: string = 'توضیح پیوست (اختیاری)';
export const text_9c09cbe3bb04: string = 'چیزی دربارهٔ فایل بنویسید…';
export const text_a72404308ae9: string = 'توقف انتقال';
export const text_fe8b0330df51: string = 'بازگشت به گفتگو';
export const text_e735f9d9a2a5: string = 'در حال ثبت پیام…';
export const text_2096f4c8f035: string = 'در حال انتقال…';
export const text_85983403b43f: string = 'ارسال ';
export const text_46b99be686ec: string = ' پیوست';
export const text_876c53967879: string = 'دریافت متوقف شد.';
export const text_d7a06d9eaca7: string = 'نمایش عکس ';
export const text_6e159b54bc47: string = 'ذخیرهٔ ';
export const text_5f11ce92fa61: string =
  'نمایش این قالب در مرورگر ممکن نیست؛ می‌توانید فایل را ذخیره کنید.';
export const text_5aea7c460498: string = 'توقف دریافت ';
export const text_1e229eb338a6: string = 'دریافت ';
export const text_3ebc8cefd354: string = 'در حال دریافت';
export const text_9280b653c7c3: string = 'آزار و اذیت';
export const text_288545a91a27: string = 'هرزنامه';
export const text_e1f0ba14c9c6: string = 'تهدید';
export const text_837fdf021d1d: string = 'محتوای نامناسب';
export const text_b83773f3ef15: string = 'جعل هویت';
export const text_b30be26c1372: string = 'دلیل دیگر';
export const text_cd7b36e86428: string = 'نگرانی دربارهٔ امنیت کودک';
export const text_2b243f115b4a: string = 'گزارش برای بررسی ثبت شد.';
export const text_d73b0f4df8b9: string = 'پیام در گفتگوی ذخیره‌شدهٔ شما ثبت شد.';
export const text_1c7ed14dc0af: string = 'پیام بازفرستاده شد.';
export const text_984f13cff775: string = 'گزارش پیام';
export const text_479a5da6e735: string = 'ذخیره برای خودم';
export const text_5ed5cb08fd4e: string = 'بازفرستادن پیام';
export const text_8f3a096dfb87: string =
  'دلیل گزارش را انتخاب کنید؛ نتیجهٔ رسیدگی جداگانه بررسی می‌شود.';
export const text_e6db423fe932: string = 'مقصد و دسترسی شما پیش از ارسال بررسی می‌شوند.';
export const text_88d42df1139e: string = 'جستجوی گفتگو';
export const text_c082b661ba2e: string = 'گفتگویی با دسترسی مجاز برای این جستجو پیدا نشد';
export const text_4976b074ef45: string = 'مقصد برای ارسال مجاز است.';
export const text_82cc69363213: string = 'ارسال به این مقصد در دسترس شما نیست.';
export const text_e96d22a3d2dc: string = 'دلیل گزارش';
export const text_bfddea31e17d: string = 'انتخاب کنید';
export const text_c0d8a570e7ce: string = 'توضیح، اختیاری';
export const text_743f63e1ea92: string = 'توضیح گزارش';
export const text_c83a7d86b4fd: string = 'برای جلوگیری از ثبت تکراری، همین درخواست را پیگیری کنید.';
export const text_4f7060b4db38: string = 'ثبت گزارش';
export const text_f169ae784dd7: string = 'ذخیره پیام';
export const text_712d44364071: string = 'گزینه‌های پیام ';
export const text_78ddf2493e4e: string = 'گزینه‌های پیام';
export const text_97a497a7284d: string = 'کپی متن در این مرورگر در دسترس نیست.';
export const text_02a2175c0160: string = 'متن پیام کپی شد.';
export const text_e75b2f3a2657: string = 'اجازهٔ کپی متن داده نشد.';
export const text_fcc5b6fed863: string = 'کپی متن';
export const text_ab182e469ee4: string = 'بازفرستادن';
export const text_09d292dded16: string = ' گزارش پیام';
export const text_db4167d969dc: string = ' بستن';
export const text_197ebc70e3d9: string = 'گروه‌ها';
export const text_028b3c5809be: string = 'کانال‌ها';
export const text_b3e662eb0f81: string = 'نخوانده';
export const text_332d2faea0e2: string = 'آرشیو';
export const text_7d24bb2778c3: string = 'ذخیره‌شده';
export const text_bf3af9311de4: string = 'فهرست گفتگوها';
export const text_27e5b8a1c666: string = 'همهٔ گفتگوهای حساب شما';
export const text_449fa510fb42: string = 'ایجاد گفت‌وگو یا مخاطب';
export const text_114def302a70: string = 'گفتگوهای مستقیم';
export const text_feab3764e510: string = 'تنظیمات پیام‌رسان';
export const text_b5159abdeeb1: string = 'جستجوی گفتگوها';
export const text_1d1dfb27d455: string = 'جستجو در پیام‌ها';
export const text_3fb47eb71ac7: string = 'انجام جستجوی گفتگو';
export const text_6f9bc91900c3: string = 'نوع گفتگوها';
export const text_eaadb95c2b86: string = 'همهٔ گفتگوها';
export const text_c8acf4fa9c84: string = 'گفت‌وگویی پیدا نشد';
export const text_87fd15d4a2f2: string = 'این فهرست گفت‌وگویی ندارد';
export const text_eb844d50a629: string = 'عبارت جستجو یا نوع گفتگو را تغییر دهید.';
export const text_127d28904712: string = 'از دکمهٔ نوشتن بالای فهرست، گفت‌وگویی شروع کنید.';
export const text_8253c0eeba70: string = 'هنوز پیامی ثبت نشده';
export const text_a300d2d3e7cd: string = ' پیام خوانده‌نشده';
export const text_c52d80c47859: string = 'سنجاق‌شده';
export const text_1e8ff49623b1: string = 'گفتگوهای بیشتر';
export const text_a4770d022c38: string = 'دریافت اطلاعات انجام نشد';
export const text_41f38689a3ef: string = 'در حال تازه‌سازی…';
export const text_7d870c3eb207: string = 'ارتباط زنده برقرار است';
export const text_3b6b5e0a1c78: string = 'در حال برقراری ارتباط زنده…';
export const text_ce167312e237: string = 'به‌روزرسانی دوره‌ای فعال';
export const text_3c2b5b61158e: string = 'گفت‌وگو از همین‌جا شروع می‌شود';
export const text_6012e6a72455: string =
  'یک گفتگو را باز کنید یا از دفترچهٔ مخاطبین، ارتباط تازه‌ای بسازید.';
export const text_9e9f0195605b: string = 'مشاهدهٔ مخاطبین';
export const text_c130dae89f48: string = 'پیام حذف شده است';
export const text_ebe0eef2c257: string = 'مالک گفت‌وگو';
export const text_c420e4b83a1f: string = 'مدیر گفت‌وگو';
export const text_171874b82f6c: string = 'عضو';
export const text_5fd06a3c4c14: string =
  'ارسال پذیرفته نشد. وضعیت دسترسی یا متن پیام را بررسی کنید.';
export const text_80457c1dd4a2: string = 'ارسال موقتاً محدود شده است. تا زمان مجاز صبر کنید.';
export const text_27fa67add2f7: string =
  'نتیجهٔ ارسال هنوز تأیید نشده است. ابتدا پیام‌های گفتگو را بررسی کنید.';
export const text_7a962146b807: string = 'ذخیرهٔ پیام تأییدنشده در این مرورگر در دسترس نیست.';
export const text_7ea74f37862c: string = 'ذخیرهٔ پیام روی این دستگاه انجام نشد.';
export const text_3a9949fcd7d5: string = 'ذخیرهٔ پیام لغو شد.';
export const text_3393e0c3cb74: string = 'حساب‌های مسدودشده';
export const text_a636c65f53a1: string = 'مشاهده و رفع مسدودی حساب‌ها';
export const text_49475717c2c3: string = 'شرایط ارتباط';
export const text_9972b94c18ef: string = 'صلاحیت حساب و رابطه‌های مجاز';
export const text_a62bc2f40f0c: string = 'رابطه والد و فرزند';
export const text_0dfe1563bdb0: string = 'مشاهده و مدیریت رابطه معتبر';
export const text_aea007437dcd: string = 'دریافت پیام مستقیم';
export const text_2c200604a458: string = 'چه کسانی بتوانند برای شما پیام بفرستند؟';
export const text_ff36750eb49e: string = 'نمایش شمارهٔ همراه';
export const text_b6626668a7fb: string = 'چه کسانی شمارهٔ همراه شما را ببینند؟';
export const text_77fdd18e61ea: string = 'پیداشدن با شمارهٔ همراه';
export const text_b6a4e992aaf8: string = 'چه کسانی با واردکردن شماره، حساب شما را پیدا کنند؟';
export const text_d081756dcca9: string = 'دعوت به گروه';
export const text_0fefec72ebf9: string = 'چه کسانی بتوانند شما را به گروه دعوت کنند؟';
export const text_13d5a41bae50: string = 'نمایش آنلاین‌بودن';
export const text_9d3e90cf697f: string = 'چه کسانی وضعیت آنلاین شما را ببینند؟';
export const text_f69bd374c9b5: string = 'نمایش آخرین بازدید';
export const text_0a51d924c603: string = 'چه کسانی زمان آخرین حضور شما را ببینند؟';
export const text_d82b15f3fac3: string = 'کنترل ارتباطات شما';
export const text_be5f42fbe752: string = 'تغییرات پس از زدن «ثبت تنظیمات» اعمال می‌شوند.';
export const text_c1ca1e8b2d02: string = 'ارتباط و پیدا شدن';
export const text_fa03e1b8bb9e: string = 'تنظیم مؤثر گزارش نشده';
export const text_e7648aa5d077: string = 'مخاطبین من';
export const text_29dbbef63dce: string = 'هیچ‌کس';
export const text_b0806e32d30f: string = 'تنظیمات در سرور ثبت شد.';
export const text_00d4b98d0841: string = 'تغییرات ثبت‌نشده دارید.';
export const text_d37da57e6b25: string = 'تنظیمات با آخرین نسخهٔ دریافت‌شده یکسان است.';
export const text_1d615f338733: string = 'ثبت تنظیمات';
export const text_e00522c63330: string = 'تغییرات ثبت‌نشده کنار گذاشته شوند؟';
export const text_6390b19951fb: string = 'تنظیمات / پیام‌رسان';
export const text_a06763105959: string = 'مسدودکردن ارتباط با حذف مخاطب از دفترچه تفاوت دارد.';
export const text_8fa2b3ccd332: string = 'حساب مسدودشده‌ای ندارید';
export const text_92d06ba85662: string =
  'حساب‌هایی که مسدود می‌کنید، برای مدیریت در این بخش نمایش داده می‌شوند.';
export const text_304587745c01: string = 'رفع مسدودی';
export const text_0de00f83cacf: string = 'موضوع‌های گروه';
export const text_05a7e9536fa3: string = 'نام موضوع';
export const text_67a5065f267b: string = 'ایجاد موضوع';
export const text_eac5a12c8992: string = 'بسته';
export const text_65693f7108d5: string = 'بستن موضوع';
export const text_faf0783a4cef: string = 'بازکردن موضوع';
export const text_592c8cbd7fc9: string = 'بازکردن';
export const text_070e012967e4: string = 'وضعیت این موضوع تغییر کند؟';
export const text_5d148496581b: string = 'هنوز موضوعی ایجاد نشده است';
export const text_e8fed4d47d62: string = 'تکلیف‌ها';
export const text_aae3c4a0c257: string = 'نتایج و ارزیابی';
export const text_92797051c40c: string = 'جلسه‌ها';
export const text_5dc634b07b21: string = 'گزارش‌ها';
export const text_016c18389868: string = 'دعوت‌ها';
export const text_36e2e9a2e4a1: string = 'امنیت حساب';
export const text_161b7c8fcee3: string = 'تنظیمات اعلان‌ها';
export const text_cd1da22edb13: string = 'دریافت اعلان را برای همین دامنه تنظیم کنید.';
export const text_327a658aba96: string = 'دامنهٔ تنظیمات اعلان';
export const text_b05e4b9892e2: string = 'آموزشگاه فعال';
export const text_a1e394cdbcf2: string = 'تنظیمی برای این دسته گزارش نشده است';
export const text_b8451239c1bb: string = 'اعلان برنامه: ';
export const text_de7d3b6c7249: string = ' · اعلان دستگاه:';
export const text_86642a4557c6: string = ' · پیامک:';
export const text_fd171c24dcfc: string = 'دارای تنظیمات ضروری';
export const text_63693d28fdf3: string = 'تنظیمات اعلانی گزارش نشده است';
export const text_8c12a8350a0e: string = 'اعلان دستگاه';
export const text_c7362666bdce: string = 'پیامک';
export const text_d79df76cab90: string =
  'گزینه‌های ضروری مطابق سیاست سرویس قابل غیرفعال‌کردن نیستند. اعلان دستگاه به فعال‌بودن دریافت در همان دستگاه نیز وابسته است.';
export const text_238a2f74addc: string = 'ساعت سکوت';
export const text_631f359ae660: string = 'شروع سکوت';
export const text_988da0ee1c79: string = 'پایان سکوت';
export const text_9547b882b1cf: string = 'منطقهٔ زمانی';
export const text_083a0ab6b295: string = 'تنظیمات اعلان ثبت شد.';
export const text_921314c1d2ff: string = 'اعلان‌های من';
export const text_d2c4b63c4bf8: string = 'خبرهای مرتبط با حساب و فعالیت‌های مجاز شما';
export const text_49a3bb5d02f6: string = 'تنظیمات اعلان';
export const text_98328e62b409: string = 'فقط خوانده‌نشده‌ها';
export const text_78887da22764: string = ' ·';
export const text_04a0052037db: string = 'خوانده‌شده';
export const text_55bbc66fe277: string = 'خوانده‌نشده';
export const text_515ee981f4a0: string = 'مشاهدهٔ مورد مرتبط';
export const text_f707420decb3: string =
  'برای مشاهدهٔ منبع، ابتدا آموزشگاه مرتبط را از انتخابگر فضا انتخاب کنید.';
export const text_cb1e79eee77e: string = 'علامت‌گذاری به‌عنوان خوانده‌شده';
export const text_1999b6d24abb: string = 'اعلانی برای نمایش نیست';
export const text_58b634557905: string = 'پیام‌ها و مخاطبین';
export const text_be6ad26a2907: string = 'گفت‌وگوها و دفترچهٔ مخاطبین خود را ببینید.';
export const text_2cb3fe307efb: string = 'حساب و پروفایل';
export const text_bc5dba82dc68: string = 'اطلاعات فردی و وضعیت امکان ارتباط خود را بررسی کنید.';
export const text_8fa4122032f4: string = 'آموزشگاه‌های من';
export const text_38f053ad5286: string = 'عضویت‌ها و نقش‌های مجاز خود را انتخاب کنید.';
export const text_3a2a401438ce: string = 'منابع من';
export const text_cd91c90b6565: string = 'فضای منابع شخصی، مستقل از آموزشگاه.';
export const text_b929671ed22f: string = 'یادگیری با AI';
export const text_7efe1b3a70de: string = 'منابع و محل مصرف را پیش از شروع بشناسید.';
export const text_6b1ac4d74206: string = 'اشتراک و مصرف';
export const text_d4a1c2a050f1: string = 'حق استفاده و مصرف فردی را جدا از سازمان ببینید.';
export const format_3d34ebe177d6 = (value0: unknown) => `${value0}، خوش آمدید`;
export const text_b9c5b60f445c: string = 'گفت‌وگو و یادگیری شما، در یک فضای روشن.';
export const text_338907839d78: string = 'پروفایل شما نیاز به تکمیل دارد';
export const text_878db5df132b: string =
  'اطلاعات خواسته‌شده را بررسی کنید؛ وضعیت ارتباطات جداگانه مشخص می‌شود.';
export const text_97abd9bfcbc0: string =
  'هنوز عضو آموزشگاهی نیستید. حساب و امکانات شخصی مجاز شما برقرار است.';
export const text_4ee5ce4fd1a6: string = 'فضاهای آموزشگاهی شما از بخش «آموزشگاه» در دسترس‌اند.';
export const text_52fa408fc93a: string = 'مشاهده ';
export const text_774f1d6b2910: string = '←';
export const text_7b5ff0b44aec: string = ' تغییر عکس پروفایل';
export const text_d34d90474c92: string = 'حساب ماکان';
export const text_becb77371bdf: string = 'نام کاربری ثبت نشده';
export const text_109865fd7239: string = ' · نیازمند تکمیل اطلاعات';
export const text_7f941e8233a2: string = 'ویرایش پروفایل';
export const text_8aa6893911d9: string = 'حساب و ترجیحات';
export const text_61d235c5d463: string = 'مشخصات فردی';
export const text_2690bee9ac93: string = 'تاریخ تولد خوداظهاری';
export const text_d7429b08c9cf: string = 'شمارهٔ همراه';
export const text_7511feb9767e: string = 'وضعیت سنی';
export const text_f56cfcd67f9c: string = 'بررسی سن';
export const text_c97a6f291fe6: string = 'ردهٔ سنی';
export const text_96b3a0fde540: string = 'اقدام بعدی';
export const account_logout: string = 'خروج از حساب';
export const text_8b5aed7deee2: string = 'فضاهای من';
export const text_3b528d2db9f6: string = 'پیام‌ها و مخاطبین شما';
export const text_67978642ed7f: string = ' · فضای فعال';
export const text_89b515f684ce: string = 'شناسهٔ حساب';
export const text_72c0b5c79c22: string = 'کپی شناسهٔ حساب';
export const text_a0a416aef2e7: string = 'شناسه کپی شد.';
export const text_59a007742acf: string = 'کپی خودکار انجام نشد؛ شناسه را انتخاب و کپی کنید.';
export const text_dfa644fe2ec0: string =
  'مدیریت منابع شخصی و آماده‌سازی آن‌ها برای یادگیری هنوز در دسترس نیست.';
export const text_bf28dfb51c5d: string =
  'این خدمت در حال حاضر فعال نیست. انتخاب منابع، مدل و محل مصرف پیش از شروع مشخص خواهد شد.';
export const text_fb5f200e68b3: string =
  'اطلاعات اشتراک فردی و مسیر خرید آن هنوز در دسترس نیست. اشتراک آموزشگاه از حساب شخصی شما جداست.';
export const text_177460222287: string = 'این بخش هنوز آمادهٔ استفاده نیست';
export const text_85a8acadb0ae: string = 'کلاس‌های شخصی';
export const text_ac2dc499bebf: string =
  'این کلاس‌ها مستقل از آموزشگاه و نقش‌های سازمانی شما هستند.';
export const text_256911182e54: string = 'ایجاد کلاس شخصی';
export const text_3d196c2db0d9: string = 'میزبان کلاس';
export const text_fb4c8c6d1e7e: string = 'عضو کلاس';
export const text_c2fd54962a03: string = ' · بایگانی‌شده';
export const text_35fc8d0443cb: string = 'مشاهدهٔ کلاس شخصی';
export const text_5f25c1774e08: string = 'کلاس شخصی ندارید';
export const text_901a0833748c: string =
  'در صورت مجازبودن حساب، می‌توانید کلاس شخصی بسازید یا دعوتی را بپذیرید.';
export const text_486b2669b1ec: string = 'دعوت‌های کلاس شخصی';
export const text_77f620a3b627: string = 'دعوتی دریافت نشده است.';
export const text_2c331e5ca4ce: string = 'دعوت به کلاس شخصی';
export const text_480ed7c313e6: string = 'شناسهٔ کلاس و مهلت دعوت';
export const text_ceb37a7376be: string =
  'نام کلاس در اطلاعات این دعوت در دسترس نیست؛ شناسهٔ آن را با دعوت‌کننده تطبیق دهید.';
export const text_d659ae8f35a9: string = 'مهلت دعوت تمام شده';
export const text_e6b19e2c1935: string = 'پذیرش دعوت کلاس شخصی';
export const text_10e4dddca732: string = 'نام کلاس شخصی';
export const text_8c2549d015d8: string =
  'ساخت این کلاس، آموزشگاه یا نقش آموزشی رسمی ایجاد نمی‌کند. امکانات درسی مستقل این نوع کلاس هنوز ارائه نشده‌اند.';
export const text_46f20fac8405: string = 'بررسی دوبارهٔ ساخت همین کلاس';
export const text_d2fa39a58fdf: string = 'ثبت کلاس شخصی';
export const text_5bba5935b193: string = 'ویرایش نام پیش از درخواست تازه';
export const text_fa799b6ad568: string = 'کلاس بایگانی‌شده';
export const text_b5d3894a5230: string = 'شما میزبان این کلاس هستید';
export const text_27646ca6f7ba: string = 'عضویت در کلاس شخصی';
export const text_2927be7c5ee8: string = 'بایگانی کلاس';
export const text_f2f9a49275fb: string = 'بایگانی کلاس شخصی';
export const text_21a66f4f4475: string =
  'این کلاس بایگانی می‌شود؛ حساب و نقش‌های آموزشگاهی تغییر نمی‌کنند.';
export const text_29c02fa4bd09: string = 'اعضای کلاس';
export const text_052f63565706: string = 'عضو ';
export const text_9727cc8c703c: string = 'پایان عضویت ';
export const text_047a780267a6: string = 'پایان عضویت در کلاس شخصی';
export const text_8d169927938f: string =
  'عضویت این حساب در همین کلاس پایان می‌یابد؛ عضویت آموزشگاه او تغییر نمی‌کند.';
export const text_6a571285362b: string = 'عضوی در کلاس ثبت نشده است';
export const text_04825cc9442a: string = 'شماره یا نام کاربری';
export const text_b855dd109c8e: string = 'حساب قابل دعوت پیدا نشد.';
export const text_a6f1d8a9c45b: string = 'شماره یا نام کاربری معتبر وارد کنید.';
export const text_840b843fe1ff: string = 'پیدا کردن حساب';
export const text_5d15df0c5b9f: string =
  'دعوت ارسال شد؛ عضویت پس از پذیرش حساب مقصد برقرار می‌شود.';
export const text_cc6360828441: string = 'ارسال دعوت کلاس شخصی';
export const text_5ee39dc725d4: string =
  'امکانات تکلیف و آزمون مستقل برای کلاس شخصی در انتشار فعلی ارائه نشده است.';
export const text_6d5706853462: string = 'اطلاعات و تصویر حساب خود را به‌روز کنید.';
export const text_ec1ab14da9e6: string = 'تاریخ تولد';
export const text_7bc42d578dfb: string = 'تاریخ تولد (اختیاری)';
export const text_9329e1335db1: string = 'این تاریخ خوداظهاری است و جای تأیید سن را نمی‌گیرد.';
export const text_79778d4644fa: string = ' خالی‌گذاشتن این فیلد، تاریخ قبلی را حفظ می‌کند.';
export const text_9aeab8fa8092: string = 'ثبت تغییرات';
export const text_531e18f7acb8: string = 'تاریخ تولد معتبر وارد کنید.';
export const text_988ada1c5b97: string = 'م';
export const text_b3b3f1b6a329: string =
  'عکس هنوز در حال آماده‌سازی است؛ کمی بعد «بررسی و ثبت عکس» را بزنید.';
export const text_6d2f60a19929: string = 'این عکس آمادهٔ استفاده نیست. عکس دیگری انتخاب کنید.';
export const text_81387363cbf9: string = 'عکس پروفایل';
export const text_c54182000e02: string = 'پیش‌نمایش عکس انتخاب‌شده';
export const text_cb7c102e0609: string = 'عکس JPEG یا PNG انتخاب کنید.';
export const text_679d612cbfb1: string = ' انتخاب عکس';
export const text_6e3ddb3deb6e: string = 'انتخاب عکس پروفایل';
export const text_2295bdb30596: string = 'ثبت عکس';
export const text_8474776a5a95: string = ' حذف عکس پروفایل';
export const text_a8c3522a70b0: string =
  'برای تغییر عکس، ابتدا تغییرات اطلاعات پروفایل را ثبت کنید.';
export const text_1f91726d3ebc: string = 'در حال بارگذاری عکس';
export const text_43bcd5743f72: string = 'در حال آماده‌سازی و ثبت عکس';
export const format_8d561def130a = (value0: unknown) => ` · ${value0}٪`;
export const text_a0a04eb3df38: string = 'بارگذاری عکس';
export const text_15c9eafb834f: string = 'ثبت عکس انجام نشد؛ دوباره بررسی کنید.';
export const text_3d52727b693c: string = 'اطلاعات فضای کار';
export const text_d6541f139845: string = 'تغییر';
export const text_7cf2f4a3317a: string = 'راهنمای این صفحه';
export const text_2b09f11a29d1: string = 'برنامهٔ پیش رو';
export const text_183283ba6298: string =
  'اطلاعات را مرحله‌به‌مرحله وارد کنید و پیش از ثبت، آن‌ها را مرور کنید.';
export const text_ce21dcffb909: string = 'حریم خصوصی و دسترسی‌ها در هر نقش حفظ می‌شود.';
export const text_ffa8517fa9b7: string = 'ک';
export const text_3b913a3284fe: string = 'جلسهٔ پیش رویی ثبت نشده است.';
export const text_8803dcef8c66: string = 'مشاهده برنامه';
export const text_0b6d7d9d8cf2: string = 'راهنما · حریم خصوصی · شرایط استفاده';
export const text_efaf43eff1b4: string = 'ماکان — یادگیری، کنار هم';
export const text_ca3c4420b9b8: string = 'نمای کلی';
export const text_e7b1ccd0bda3: string = 'کلاس‌ها';
export const text_d61b3d58a5e7: string = 'والد و فرزند';
export const text_82ec67c14936: string = 'برنامه';
export const text_589d5004f227: string = 'بخش‌های آموزشگاه';
export const text_13e372aa992c: string =
  'آموزشگاه و نقش خود را انتخاب کنید؛ فعالیت آموزشی در همان فضای مجاز انجام می‌شود.';
export const text_0465a6813992: string = 'برنامهٔ کلاس‌ها';
export const text_0cff2209b91a: string = 'ورود به این آموزشگاه';
export const text_aa11114d1a2f: string = 'هنوز عضو آموزشگاهی نیستید';
export const text_d738b763f126: string =
  'پس از عضویت معتبر، آموزشگاه اینجا نمایش داده می‌شود. امکانات شخصی شما مستقل باقی می‌ماند.';
export const text_14130edb2ced: string = 'فرزندان من';
export const text_5a73fd9b2b49: string = 'تکلیف‌های فرزند';
export const text_960478099184: string = 'آزمون‌های فرزند';
export const text_77c36f68bc81: string =
  'اطلاعات فقط برای فرزند انتخاب‌شده و رابطهٔ معتبر نمایش داده می‌شود.';
export const text_813016dea0b5: string = 'وضعیت تکلیف‌های فرزند';
export const text_58bde8323225: string = 'وضعیت آزمون‌های فرزند';
export const text_2675dd46965d: string = 'تحویل نداده';
export const text_8b56533a0281: string = 'هنوز شرکت نکرده';
export const text_faeb420f283e: string = 'نمرهٔ منتشرشده:';
export const text_0765fd5b5dc0: string = 'هنوز منتشر نشده';
export const text_248322604318: string = 'موردی برای فرزند انتخاب‌شده موجود نیست';
export const text_f45e2124d2b3: string = 'اطلاع‌رسانی انتشار';
export const text_cbffec0216d9: string = 'اعلان انتشار را در گروه و کانال رسمی کلاس بررسی کنید.';
export const text_7e774d827d0c: string = 'فضاهای رسمی کلاس';
export const text_131283425e90: string = 'هنوز وضعیتی برای اعلان این نسخه دریافت نشده است';
export const text_50eee55c9937: string = 'گروه رسمی';
export const text_872445576c9b: string = 'کانال رسمی';
export const text_f6a1af6f6496: string = 'مقصد اعلان';
export const text_41483c9e8785: string = 'در انتظار درج اعلان';
export const text_cd8457762e8c: string = 'اعلان درج شده است';
export const text_74c4a12d53da: string = 'با نسخهٔ جدید جایگزین شده';
export const text_47d0719f27c1: string = 'تلاش‌های من در آزمون';
export const text_5592e226d3dc: string = 'پاسخ‌های قبلی من';
export const text_6fd4ea2ac138: string = 'پاسخ شمارهٔ ';
export const text_24e566f7905f: string = 'ادامهٔ پاسخ';
export const text_9ea506c7898d: string = 'نتیجهٔ منتشرشده';
export const text_28a910fd0f3f: string = 'هنوز پاسخی ثبت نکرده‌اید';
export const text_1447bc999cc2: string = 'تلاش ';
export const text_cb86a53fa7a6: string = 'ادامهٔ آزمون';
export const text_e82ba27cb37f: string = 'وضعیت نتیجه';
export const text_7dee19807d8f: string = 'هنوز در این آزمون شرکت نکرده‌اید';
export const text_e53e2ee5f402: string = 'نتیجهٔ آزمون';
export const text_321d09514a3f: string = 'نتیجهٔ تکلیف';
export const text_f3bcbf2e028e: string = 'ابتدا فرزند را انتخاب کنید';
export const text_8dc330a401b6: string = 'نتیجه در رابطهٔ معتبر همان فرزند قابل مشاهده است.';
export const text_993184c04686: string = 'نتیجه هنوز منتشر نشده است';
export const text_06cb849dea5b: string =
  'پس از انتشار معتبر، نمره و بازخورد مجاز همین‌جا نمایش داده می‌شود.';
export const text_4be8404a5b20: string = 'ارزیابی منتشرشده';
export const text_de1696e646ee: string = 'سقف نمره مشخص نیست';
export const text_928bdfd562d1: string = 'از ';
export const text_6310111c0383: string = 'بازخورد';
export const text_a592243bf557: string = 'بازخورد متنی ثبت نشده است.';
export const format_838449e97408 = (value0: unknown) => ` · نسخهٔ ${value0}`;
export const text_75b3b6a69681: string = 'بازبینی انتشار تکلیف';
export const text_1d3577cf9675: string = 'ویرایش پیش‌نویس تکلیف';
export const text_fea95daa2cd8: string = 'این تکلیف پیش‌نویس نیست';
export const text_fa2690fb6104: string = 'ویرایش این نسخه از مسیر پیش‌نویس مجاز نیست.';
export const text_187e46cf3b71: string = 'مشاهدهٔ تکلیف';
export const text_44e4555f21d7: string = 'تأیید و ذخیرهٔ پیش‌نویس';
export const text_dd322d284113: string = 'شرح';
export const text_fbf33464a790: string = 'مهلت';
export const text_25823dfdfd3f: string = 'نمرهٔ کل';
export const text_9f129855c90d: string = 'دفعات مجاز';
export const text_1acb0e529075: string = 'تحویل با تأخیر';
export const text_d70d2d795615: string = 'مجاز';
export const text_5c7f069cd852: string = 'غیرمجاز';
export const text_c864088e1061: string = 'عنوان تکلیف';
export const text_1d3c268468ff: string = 'شرح تکلیف';
export const text_0e469bc1ffab: string = 'حداکثر دفعات تحویل';
export const text_8dd151936022: string = 'تحویل با تأخیر مجاز باشد';
export const text_56c43e096bb9: string = 'کلاس';
export const text_b48aed6cd968: string = 'نمرهٔ کل و تعداد تلاش';
export const text_fcd548d11d3f: string = ' نمره ·';
export const text_c23a4b046c4e: string = ' بار';
export const text_250a7c7f7fe9: string = 'بازگشت و ویرایش';
export const text_e6701e88678e: string = 'انتشار تکلیف';
export const text_d165c340ec56: string = 'انتشار تکلیف برای کلاس';
export const text_2391d7b29480: string = 'تأیید انتشار تکلیف';
export const text_a6eef9f48911: string =
  'این نسخه با تنظیمات نمایش‌داده‌شده برای دانش‌آموزان مجاز کلاس منتشر شود؟';
export const text_31b5276a70f5: string = 'جزئیات تکلیف';
export const text_b718bc161b9e: string = 'ارزیابی تکلیف‌ها';
export const text_0731f9491612: string = 'وضعیت ارزیابی';
export const text_fa55e47f28bc: string = 'همهٔ وضعیت‌ها';
export const text_f125a09fb052: string = 'فقط تحویل با تأخیر';
export const text_96408ba3e64d: string = ' · با تأخیر';
export const text_d3da6e382b7b: string = 'پاسخی در این وضعیت نیست';
export const text_c4becb06f465: string = 'بازبینی و انتشار ارزیابی';
export const text_64ff9fb09fcd: string = 'ارزیابی پاسخ تکلیف';
export const text_699df53d9134: string = 'پاسخ متنی ثبت نشده است.';
export const text_b7504f07794e: string = 'پیوست‌های پاسخ';
export const text_b07222592c31: string = 'این پاسخ پیوست ندارد.';
export const text_685509581d12: string = 'آمادهٔ دریافت';
export const text_ab55214d3f76: string = 'هنوز آماده نیست';
export const text_6a835b3d71f3: string = 'دریافت فایل';
export const text_fddd72f44b1a: string = 'فایل آماده نیست';
export const text_6f83baa49c64: string = 'پیشرفت دریافت ';
export const text_6373daa09bbc: string = 'لغو دریافت';
export const text_0a907e4db7e6: string = 'این نسخه در این صفحه قابل ویرایش نیست.';
export const text_f74b92f4e375: string = 'مشاهدهٔ ارزیابی';
export const text_b6efac56c22b: string = 'ایجاد اصلاحیه';
export const text_93d697d4f295: string = 'اصلاح ارزیابی منتشرشده';
export const text_b258bdb17ed3: string = 'ثبت پیش‌نویس ارزیابی';
export const format_afd74191ca72 = (value0: unknown) => `نمره از ${value0}`;
export const text_3adafc73e1d2: string = 'بازخورد دانش‌آموز';
export const text_29b4c343a306: string = 'بازخورد قابل نمایش به والد';
export const text_bae472294345: string = ' یادداشت خصوصی ارزیاب';
export const text_65815ac74e0f: string = 'این یادداشت جزو بازخورد دانش‌آموز و والد نیست.';
export const text_941348bfcf12: string = 'یادداشت خصوصی';
export const text_5a351482a930: string = 'دلیل اصلاح';
export const text_443deeea74b8: string = 'ذخیره و بازبینی';
export const text_ae21f41e1594: string = 'ارزیابی هنوز ذخیره نشده است';
export const text_0d12062fab6e: string = 'شروع ارزیابی';
export const text_e66b52706c41: string = 'بازخورد قابل انتشار';
export const text_0a1a85c1271a: string = 'دانش‌آموز می‌بیند';
export const text_7b9c695e1e57: string = 'بازخوردی ثبت نشده است.';
export const text_32a672994436: string = 'والد مجاز می‌بیند';
export const text_5ea656f46842: string = 'یادداشت خصوصی در بازخورد منتشرشده قرار نمی‌گیرد. نسخهٔ';
export const text_9f5a7c3ec8cf: string = 'انتشار ارزیابی';
export const text_192eea1785f1: string =
  'نمره و بازخوردهای مشخص‌شده برای دانش‌آموز و والد مجاز منتشر شوند؟';
export const text_9bd14215e24e: string = 'انتشار نتیجه';
export const text_89f2f0361773: string = 'تاریخ برنامه معتبر نیست.';
export const format_6b7e4665ee37 = (value0: unknown, value1: unknown) => `${value0} تا ${value1}`;
export const format_d70df362599d = (
  value0: unknown,
  value1: unknown,
  value2: unknown,
  value3: unknown,
) => `${value0} تا ${value1} ${value2} ${value3}`;
export const text_c5dc986b8129: string = 'فرزند من';
export const text_7c4ad9f5aae7: string = 'در حال دریافت اطلاعات فرزند…';
export const text_86937d1bb9f1: string = 'فرزند موردنظر را برای مشاهدهٔ اطلاعاتش انتخاب کنید.';
export const text_3958c9bcedb4: string = 'انتخاب‌شده';
export const text_7d06b69aad65: string = '؟';
export const text_91082bc0cbdc: string = 'انتخاب فرزند';
export const text_665daedc1ba7: string = 'یک فرزند انتخاب کنید';
export const text_503b02cb8da5: string = ' · رابطه غیرفعال';
export const text_a27cb9baf762: string = 'رابطهٔ فعالی برای نمایش موجود نیست';
export const text_c02cc9f23833: string =
  'پس از تأیید رابطه با فرزند، اطلاعات مجاز او اینجا نمایش داده می‌شود.';
export const text_c75948a71a2d: string = 'جزوه و کتاب‌ها';
export const text_4f7293cf5780: string = 'آزمون‌ها';
export const text_3f6941f28393: string = 'بخش‌های کلاس';
export const text_951b90b58d3d: string = 'محتوای کلاس';
export const text_ad3bf2c81977: string = 'کلاس‌های فرزند';
export const text_2655b36aa32c: string = ' · کلاس‌های موجود در فعالیت‌های منتشرشده';
export const text_48743e694ff4: string = 'کلاسی در فعالیت‌های فرزند نمایش داده نشده است';
export const text_2a9b0d8ae50f: string = 'نمایش جزوه‌ها برای حساب والد فعلاً در دسترس نیست';
export const text_ca38497f0734: string = 'فعالیتی در این بخش نمایش داده نشده است';
export const text_e82efffd7b2d: string = 'ثبت‌نام دانش‌آموز';
export const text_0766ac45d984: string = 'انتساب معلم';
export const text_34aeac5f09b4: string = 'ایجاد کلاس';
export const text_946c6e906859: string = 'کلاس ایجاد شد';
export const text_f911d7c42a09: string = '۱. کلاس ثبت شد؛ معلمان را مشخص کنید.';
export const text_78535b54c92b: string = 'انتخاب معلمان کلاس';
export const text_29f48210ac93: string = '۲. دانش‌آموزان را به کلاس اضافه کنید.';
export const text_cc708e53902b: string = 'افزودن دانش‌آموزان';
export const text_e0c1b3a8ec7a: string = 'ورود به کلاس';
export const text_5fb4677a90df: string = 'نام کلاس، درس، دوره و ظرفیت معتبر را وارد کنید.';
export const text_eabfbd7982f4: string = 'وضعیت آغاز';
export const text_1227743339e4: string =
  'پس از ساخت کلاس، دانش‌آموزان و معلمان را جداگانه به آن اضافه کنید.';
export const text_23c14d587863: string = 'ظرفیت کلاس';
export const text_f742001e0e88: string = 'درس کلاس';
export const text_9f30c2048bc7: string = 'ایجاد درس جدید';
export const text_4abb03b122f4: string = 'دورهٔ آموزشی';
export const text_51add6a204d5: string = 'ایجاد دورهٔ جدید';
export const text_65b84c86f2b8: string = 'کلاس پس از ایجاد فعال باشد';
export const text_bc7837ca0bbb: string = 'ایجاد درس';
export const text_c19ede0cddae: string = 'ایجاد دورهٔ آموزشی';
export const text_a8e9400f558e: string = 'درس ثبت شد';
export const text_55dd273e4ada: string = 'دوره ثبت شد';
export const text_75454f626ebf: string = 'ادامهٔ ساخت کلاس';
export const text_e847e6618d02: string = 'عنوان و بازهٔ معتبر را کامل کنید.';
export const text_9398dccd15ef: string = 'عنوان درس';
export const text_8ce15ef5c0a9: string = 'عنوان دوره';
export const text_c2e6c9ca70e0: string = 'شروع دوره';
export const text_07659e16252d: string = 'پایان دوره';
export const text_8a8bca7672c8: string = 'ایجاد جلسه';
export const text_ea3eced42f9c: string = 'پیوند';
export const text_73b7befc5afa: string =
  'عنوان و بازهٔ معتبر جلسه را وارد کنید؛ پایان باید پس از شروع باشد.';
export const text_9d6b7140edeb: string = 'پیوند کلاس آنلاین (اختیاری)';
export const text_00f6d8e48e00: string = 'ایجاد آزمون';
export const text_3a48c2c3e3b8: string = 'مدت (دقیقه)';
export const text_0fe100cdea24: string = 'دفعات شرکت';
export const text_938008426aca: string = 'ایجاد پیش‌نویس آزمون';
export const text_a748d1afb9b2: string =
  'پس از ساخت پیش‌نویس، سؤال‌ها را اضافه و پیش از انتشار بازبینی کنید.';
export const text_8476a4fa8850: string = 'عنوان، بازه و مقادیر معتبر آزمون را کامل کنید.';
export const text_981230e1e35e: string = 'عنوان آزمون';
export const text_4a72e6b798a7: string = 'توضیحات آزمون';
export const text_2cced62fbe37: string = 'مدت آزمون (دقیقه)';
export const text_6c1546f241c8: string = 'دفعات مجاز شرکت';
export const text_61f1cd67e9a3: string = 'ترتیب پرسش‌ها تصادفی باشد';
export const text_c82d6822d030: string = 'دعوت والد برای فرزند';
export const text_78bf2b9b9225: string = 'افزودن پرسش آزمون';
export const text_e5b141057b67: string = 'مدیریت آموزشگاه';
export const text_11a6a5d76e76: string = 'پرونده‌های آموزشی';
export const text_34e7820beb9d: string = 'اعضای آموزشگاه';
export const text_86a659343e8f: string = 'اطلاعات فردی و وضعیت اتصال پرونده‌ها به حساب کاربران';
export const text_318c4a9036f3: string = 'معلمان، دانش‌آموزان و والدین آموزشگاه، در یک فهرست';
export const text_68c9cbc200a9: string = 'افزودن پرونده';
export const text_4f417e40c6d1: string = 'اعضا و پرونده‌ها';
export const text_1145531ebd7a: string = 'جستجوی معلم آموزشگاه';
export const text_e6598afab142: string = 'جستجوی دانش‌آموز آموزشگاه';
export const text_21bd12880c60: string = 'معلم آموزشگاه';
export const text_3419a22ae8f0: string = 'دانش‌آموز آموزشگاه';
export const text_b1f76db217bd: string = 'انتخاب کنید…';
export const text_4cdeeb638917: string = 'فهرست دانش‌آموزان کلاس';
export const text_a803103e88cf: string = 'فهرست معلمان کلاس';
export const text_bd48b6b60f08: string = 'جستجو در اعضای کلاس';
export const text_9d08b60ae631: string = 'عملیات';
export const text_454d4aebcf48: string = 'حذف ';
export const text_e09a66220579: string = ' از کلاس';
export const text_276cb596ac92: string = 'حذف از کلاس · ';
export const text_329f02ad417c: string = 'حذف از این کلاس';
export const text_7e52cd6c1407: string =
  'ثبت‌نام دانش‌آموز در همین کلاس پایان می‌یابد؛ حساب و سابقهٔ آموزشی حذف نمی‌شود.';
export const text_c1259e061304: string =
  'انتساب معلم به همین کلاس پایان می‌یابد. برای جایگزینی، معلم دیگری را جداگانه اضافه کنید.';
export const text_88ee345f182d: string = 'عضوی در این فهرست نیست';
export const text_7469916c83c5: string = 'جستجوی کاتالوگ درس‌ها';
export const text_65d3d3894fde: string = 'جستجوی دوره‌های آموزشی';
export const text_c7176bc1cb46: string = 'درس از کاتالوگ';
export const text_2fddb8bfbb56: string = 'دوره از کاتالوگ';
export const text_83def3e32c24: string = 'انتخاب کنید یا مورد تازه بسازید…';
export const text_f240dea8c236: string = 'مورد انتخاب‌شده';
export const text_fe4c80e49640: string = 'در انتظار ارزیابی';
export const text_866744ee20e1: string = 'در انتظار تصحیح';
export const text_7221d867e773: string = 'پیش‌نویس ارزیابی';
export const text_09e66baa1023: string = 'پیش‌نویس اصلاح';
export const text_c5cb7fbbb9a5: string = 'آمادهٔ انتشار';
export const text_6069a7cef83c: string = 'نسخهٔ جایگزین‌شده';
export const text_74061dd83395: string = 'در انتظار انتشار';
export const text_b439b4e56bb0: string = 'پیوست‌های پاسخ سؤال';
export const text_d50adbf6e0b9: string = 'پاسخ متنی الزامی است؛ فایل نیز می‌توانید اضافه کنید.';
export const text_b964b3c3580f: string = 'می‌توانید پاسخ را به‌صورت متن، فایل یا هر دو ارسال کنید.';
export const text_1cff2dd80daa: string = ' · حداکثر ';
export const text_8db870221ba1: string = ' فایل';
export const text_03708fe63973: string = ' · مجموع ';
export const text_e3ec7a8925bb: string = 'انتخاب پیوست پاسخ آزمون';
export const text_f8f86f78eba4: string = 'افزودن فایل پاسخ';
export const text_d3f1f47d3218: string = 'حذف پیوست ';
export const text_82ab4ab38d75: string = 'در حال انتقال یا ثبت پیوست…';
export const text_25e99a8def0a: string = 'پیشرفت پیوست آزمون';
export const text_f5bcc4fdc106: string = 'لغو بارگذاری';
export const text_99018e28b4f5: string =
  'این پیوست پذیرفته نشد؛ آن را کنار بگذارید و فایل مناسب انتخاب کنید.';
export const text_f403362f5b06: string = 'فایل در حال بررسی است؛ هنوز به پاسخ وصل نشده.';
export const text_47e46ddabacf: string = 'ثبت اتصال فایل به پاسخ هنوز تأیید نشده است.';
export const text_2a65835729e2: string = 'فایل قابل استفاده نیست.';
export const text_64197e65a1c9: string = 'بررسی وضعیت فایل';
export const text_d8fbdcdc1e91: string = 'بررسی و ثبت همین پیوست';
export const text_0cce97418be8: string = 'کنار گذاشتن فایل';
export const text_2b54916cf17a: string = 'دریافت نسخهٔ جدید پاسخ';
export const text_d5b9e3a11d42: string = 'بررسی دوبارهٔ همین تغییر پیوست';
export const text_46ca07730cdf: string = 'پاسخ‌های آزمون';
export const text_a6312a1b83ba: string = 'وضعیت تصحیح';
export const text_61f6dd684692: string = 'تصحیح پاسخ سؤال';
export const text_9fec0601e196: string = 'بازبینی و انتشار نتیجهٔ آزمون';
export const text_97ab3fa3cf71: string = 'ارزیابی پاسخ‌برگ آزمون';
export const text_67bfb548ca56: string = 'شروع تصحیح';
export const text_2f8cf11752bd: string =
  'با شروع تصحیح، نسخهٔ پیش‌نویس ارزیابی در سرویس ایجاد می‌شود.';
export const text_9a3574899319: string = 'شروع تصحیح پاسخ‌برگ';
export const text_a375a0ddd14d: string = 'پاسخ‌برگ و نمرهٔ هر سؤال';
export const text_a2c10c627424: string = 'سؤال ';
export const text_8d6ea6982b74: string = ' از';
export const text_86657c1093a3: string = 'بدون پاسخ';
export const text_967b4e9dca84: string = 'تصحیح خودکار';
export const text_54753d4394ba: string = 'بررسی‌شده';
export const text_9c641f40e0f6: string = 'نیازمند بررسی';
export const text_95612a20d459: string = 'تصحیح پاسخ';
export const text_69f2db252882: string = 'بازبینی نتیجه';
export const text_75712d983c36: string = 'سؤال';
export const text_f587875aa61f: string = 'پاسخ دانش‌آموز';
export const text_9dbf97d6d529: string = 'پاسخ به‌صورت پیوست ثبت شده است.';
export const text_7e1d8f3f9e76: string = 'پاسخ ثبت نشده است.';
export const text_7ceceddd5eb1: string = 'ارزیابی پاسخ';
export const text_f5603f353dad: string = 'یادداشت خصوصی ارزیاب';
export const text_f4ebeba6baa8: string = 'ذخیرهٔ تصحیح سؤال';
export const text_8e1f490a8728: string = 'جمع‌بندی ارزیابی';
export const text_c5b6e5e70c54: string = 'تکمیل و بازبینی نتیجه';
export const text_d0da8aff4010: string = 'ابتدا همهٔ پاسخ‌های تشریحی را بررسی کنید.';
export const text_7ab236ef6063: string = 'ثبت نشده است.';
export const text_1ea90ff0689b: string = 'بازخورد والد مجاز';
export const text_12b87e3b4db2: string =
  'یادداشت خصوصی ارزیاب در نتیجهٔ دانش‌آموز و والد نمایش داده نمی‌شود.';
export const text_878e832f0570: string = 'پاسخ‌برگ ارزیابی';
export const text_03b0d57113ee: string = 'انتشار نتیجهٔ آزمون';
export const text_daaf8ba1096e: string = 'تأیید انتشار';
export const text_ea8277d04c34: string = 'اصلاح نتیجهٔ منتشرشده';
export const text_47fc73d1bf35: string =
  'نتیجهٔ منتشرشده با ایجاد پیش‌نویس اصلاح، بی‌صدا جایگزین نمی‌شود. اصلاحیه پس از تصحیح و انتشار معتبر قابل مشاهده خواهد بود.';
export const text_17ae215bc380: string = 'ساخت پیش‌نویس اصلاحیه';
export const text_eddf3e7e605e: string = 'بازبینی و انتشار آزمون';
export const text_611e211b9254: string = 'مدت';
export const text_5e2c83ade19c: string = ' دقیقه';
export const text_12dfa243b33e: string = 'انتشار آزمون برای کلاس';
export const text_08aa67bbee2a: string = 'انتشار این نسخهٔ آزمون؟';
export const text_d5b25400556e: string =
  'شرایط و سؤال‌ها را بررسی کنید. انتشار نسخه، آن را در دسترس افراد مجاز کلاس قرار می‌دهد.';
export const text_e689b082a308: string = 'تأیید انتشار آزمون';
export const text_94f6599576df: string = 'این نسخهٔ آزمون منتشر شده است.';
export const text_db44a1fe2fd1: string = 'پرسش‌ها و پاسخ‌های ارزیابی';
export const text_abefd1a02a01: string =
  'این پیش‌نمایش مخصوص نویسنده است؛ پاسخ درست در پاسخ‌نامهٔ دانش‌آموز نمایش داده نمی‌شود.';
export const text_649c0357f354: string = 'پرسش ';
export const text_931d9d5a6b04: string = ' نمره';
export const text_149568c03aa5: string = ' — پاسخ درست';
export const text_f5bf0241c376: string = 'آزمون دانش‌آموز';
export const text_bdce5ddbe1d3: string = 'سابقهٔ تلاش‌ها و نتایج';
export const text_af5d165eb42a: string = ' دقیقه · حداکثر ';
export const text_2c2981408a00: string = ' بار ·';
export const text_f6d897a5e343: string = ' تا';
export const text_974bdfc23e33: string = 'شروع آزمون';
export const text_135af069de25: string = 'آزمون ثبت‌شده · نوبت ';
export const text_4ccea8691b55: string = 'مشاهدهٔ وضعیت نتیجه';
export const text_d6a19d2e814a: string = 'شروع: ';
export const text_95ff5b1021e8: string = 'مشاهدهٔ رسید ثبت آزمون';
export const text_5abb68cbb3ee: string = 'ثبت نهایی در ';
export const text_23d5cbc3c0e0: string = ' پاسخ از ';
export const text_5c2e40bca3fb: string = ' پرسش';
export const text_003f88cafd19: string = 'آزمون ثبت نهایی شد';
export const text_2a9639fad252: string = 'بازگشت به آزمون‌ها';
export const text_260462be74d1: string = 'زمان باقی‌ماندهٔ آزمون';
export const text_05323c282dc5: string = 'زمان باقی‌مانده';
export const text_b90491b0d105: string = 'مرور و تحویل آزمون';
export const format_63f311d97e40 = (value0: unknown, value1: unknown) =>
  `سؤال ${value0} از ${value1}`;
export const text_1dfb2d843a4b: string = ' پاسخ ذخیره‌شده';
export const text_1e55b02eb966: string =
  'زمان معتبر آزمون دریافت نشد. برای ادامه، وضعیت آزمون را دوباره دریافت کنید.';
export const text_b3bf53045bdc: string =
  'زمان پاسخ‌دهی به پایان رسیده است. وضعیت نهایی را از سرور بازخوانی کنید.';
export const text_eb7524c89b59: string =
  'برای پاسخ‌دادن، نوشتن در همین دستگاه باید فعال باشد. کنترل پاسخ‌دهی دستگاه دیگر خودکار منتقل نمی‌شود.';
export const text_0368f96b438f: string = 'فعال‌کردن پاسخ‌دهی در این دستگاه';
export const text_cb2f84efe820: string = 'وضعیت ذخیرهٔ پاسخ‌ها';
export const text_e4bc4f41bf23: string = 'پاسخ‌های ذخیره‌نشده با نسخهٔ سرور جایگزین شوند؟';
export const text_3c4e01e958ec: string = 'بازخوانی پاسخ‌های ثبت‌شده';
export const text_ada70c7f74e9: string =
  'پیوست آماده‌نشده یا متن الزامیِ ثبت‌نشده وجود دارد؛ پاسخ را اصلاح کنید.';
export const text_1fa88a22344c: string =
  'فقط پاسخ‌هایی که ذخیره شده‌اند ثبت نهایی می‌شوند. پس از ثبت نهایی امکان تغییر پاسخ وجود ندارد.';
export const text_c29fedbad608: string = ' پاسخ ذخیره شده';
export const text_e7fd700f0cb0: string = 'پاسخ‌های زیر نسخهٔ ثبت‌شده در سرویس هستند.';
export const text_7b83fe622ee7: string = 'مشاهدهٔ پرسش ';
export const text_64ebb8942651: string = 'پاسخ پیوست‌شده';
export const text_d1decdf85c3b: string = 'پاسخی ذخیره نشده است.';
export const text_c7936aa549f3: string = 'تغییر ذخیره‌نشده دارد.';
export const text_d0c32833d55f: string = 'پاسخ ذخیره‌نشده دارید؛ ابتدا آن‌ها را ذخیره کنید.';
export const text_887583bed820: string = 'تلاش مجدد برای ثبت نهایی';
export const text_9e3a00bd25d6: string = 'ثبت نهایی آزمون';
export const text_b000b2b3ef87: string = 'بررسی رسید نهایی';
export const text_37f16de1385c: string = 'پاسخ‌برگ آزمون';
export const text_cf2bfba20bfc: string = ' پاسخ ذخیره‌شده از';
export const text_17e99e000a84: string = 'ذخیره‌نشده';
export const text_431772a570a9: string = 'بی‌پاسخ';
export const format_21050785023d = (value0: unknown, value1: unknown) =>
  `رفتن به پرسش ${value0}؛ ${value1}`;
export const text_698330b28e93: string = 'پیش از تحویل';
export const text_ec6cacb8d486: string =
  'پاسخ هر پرسش را ذخیره کنید. در پایان، پاسخ‌ها را مرور و آزمون را ثبت نهایی کنید.';
export const text_7e8130682096: string = 'پایان مهلت: ';
export const text_3613801e807e: string = 'بازگشت به پاسخ‌ها';
export const text_906e0c72a3b4: string = 'سؤال بعد';
export const text_2dd10ba71f63: string = 'مرور پاسخ‌ها';
export const text_8904de0bfc67: string = 'سؤال قبل';
export const text_8b4c29b1f0f6: string = 'آخرین پاسخ ذخیره شد.';
export const text_31e133b70dc2: string = 'پاسخ پرسش ';
export const text_59ca5495819c: string = 'پاسخ خود را اینجا بنویسید…';
export const text_0861b9a398f9: string = 'یک گزینه انتخاب کنید';
export const text_16009dd36439: string = 'تلاش مجدد برای همین پاسخ';
export const text_7ed2fc6e7f87: string = 'ذخیرهٔ پاسخ ';
export const text_a54c150e64e9: string =
  'نتیجهٔ ذخیره تأیید نشد؛ همین درخواست را تکرار کنید یا پاسخ‌های ثبت‌شده را بازخوانی کنید.';
export const text_484e7e05f519: string = 'آزمون‌های منتشرشدهٔ کلاس‌های مجاز شما';
export const text_36167d33608a: string = 'کلاس آزمون';
export const text_e4f0b64f490d: string = 'انتخاب کلاس برای ساخت آزمون…';
export const text_1fb335d2caf7: string = ' دقیقه · ';
export const text_41b23f4e8fe0: string = 'مدیریت آزمون ';
export const text_14ec971a7899: string = 'مشاهده و شرکت در آزمون ';
export const text_dfe5265ec744: string = 'مدیریت آزمون';
export const text_f37ccc1e3278: string = 'مشاهده و شرکت در آزمون';
export const text_ccb46171db2d: string = 'آزمون منتشرشده‌ای موجود نیست';
export const text_5bdcd0107bdf: string =
  'پیش‌نویس جدید پس از ایجاد، مستقیماً در ویرایشگر باز می‌شود.';
export const text_b4e81abb82c3: string = 'پس از انتشار آزمون توسط معلم، آن را اینجا می‌بینید.';
export const text_8125ff1a95fa: string = ' · ویرایشگر آزمون';
export const text_a6fc13e9473b: string = 'پاسخ‌ها و ارزیابی آزمون';
export const text_e109aef32077: string = 'افزودن پرسش';
export const text_795a6fe29020: string = 'پرسش‌های آزمون';
export const text_46c49ce8a96c: string = ' · پاسخ درست';
export const text_a75c8aa4206a: string = 'هنوز پرسشی اضافه نشده است';
export const text_36f2e5cc8da2: string = 'نوع پرسش';
export const text_59612200f820: string = 'متن پرسش';
export const text_6672f1a95acb: string = 'نمرهٔ پرسش';
export const text_ed2595d209e5: string = 'پیوست پاسخ دانش‌آموز';
export const text_703606665166: string = 'اجازهٔ ارسال فایل';
export const text_aacb94b9f8cb: string = 'پاسخ متنی همراه فایل الزامی باشد';
export const text_3a731fae4981: string = 'نوع فایل‌های مجاز';
export const text_3ec90e9522ae: string = 'عکس JPEG';
export const text_bf8629a7be63: string = 'عکس PNG';
export const text_c1e5b4aacabd: string = 'حداقل یک نوع فایل را مجاز کنید.';
export const text_5b0f84fa02d1: string = 'حداکثر تعداد فایل (اختیاری)';
export const text_93b036d10054: string = 'حداکثر حجم مجموع فایل‌ها به مگابایت (اختیاری)';
export const text_92d381e9e27f: string = 'گزینهٔ ';
export const text_1ac128e79e40: string = 'گزینهٔ صحیح';
export const text_e974ebd76aac: string = 'انتخاب پاسخ صحیح…';
export const text_3366170495e9: string = 'ثبت پرسش';
export const text_2018071defea: string = 'دوست ماکانی';
export const text_48d43650690b: string = 'سلام ';
export const text_3c95ceca639d: string = 'تغییر فضا';
export const text_65cdaaabdabd: string = 'روزهای این هفته';
export const text_e30bd24d513b: string = 'جلسهٔ بعدی';
export const text_ca0f901fdf49: string = 'همه برنامه‌ها';
export const text_827cc8637f4d: string = 'جلسهٔ پیش رویی در این دریافت ثبت نشده است.';
export const text_15aa7009c6f2: string = 'مشاهده برنامهٔ کامل';
export const text_5ebf6333e4cd: string = 'حضور و غیاب';
export const text_7841d322609a: string = 'جزئیات جلسه';
export const text_f9aa47c30ce0: string = 'برای امروز';
export const text_1b5115f2f6fa: string = 'پیگیری‌های امروز';
export const text_d0c8b7c92026: string = 'مشاهده همه';
export const text_fbb3425cdeea: string = 'مهلت: ';
export const text_563c95d1f5ea: string = 'باقی مانده';
export const text_ad3c2573d0e2: string = 'پاسخ‌های تازه';
export const text_522e4acaf773: string = 'پاسخ‌های منتظر بررسی';
export const text_4f96bdc2ea91: string = 'درس‌ها و جزوه‌های کلاس';
export const text_aeef0973ce24: string = 'پیش‌نویس درس‌ها';
export const text_d59bfca8883f: string = 'مطالعهٔ درس‌های منتشرشدهٔ مجاز';
export const text_ded488406591: string = 'بازبینی و انتشار محتوای کلاس';
export const text_34e352a86527: string = 'هنوز دعوتی دریافت نکرده‌اید';
export const text_5c91e0906d2b: string = 'دعوتی در انتظار پاسخ ندارید';
export const text_522b5b16dc24: string = 'هنوز دعوتی را نپذیرفته‌اید';
export const text_112ea868a35b: string = 'دعوت ردشده‌ای ندارید';
export const text_9b8c54ad174a: string = 'دعوت‌های من';
export const text_e3198594c669: string =
  'دعوت‌های آموزشگاه و ارتباط با فرزندتان را اینجا پیگیری کنید.';
export const text_21c00a2ccfa2: string = 'دریافت دوبارهٔ دعوت‌ها';
export const text_d153e2c3035c: string = 'وضعیت دعوت';
export const text_d4b0fea5ef5e: string = 'همهٔ دعوت‌ها';
export const text_b3edaffbfcc7: string = ' دعوت';
export const text_59825af86252: string =
  'وقتی آموزشگاهی برای شما دعوت بفرستد، جزئیات و امکان پاسخ‌دادن همین‌جا نمایش داده می‌شود.';
export const text_95cc4b7c9c91: string =
  'برای دیدن دعوت‌ها با وضعیت‌های دیگر، به فهرست همهٔ دعوت‌ها برگردید.';
export const text_d8500c556282: string = 'نمایش همهٔ دعوت‌ها';
export const text_e287db188fec: string = 'دعوت ';
export const text_52b5719c93bf: string = 'دعوت به ';
export const text_d4add45dd348: string = 'رابطهٔ والد و فرزند';
export const text_fbf138fe1b5a: string = 'عضویت آموزشگاه';
export const text_7749ac890d07: string = 'نقش پیشنهادی: ';
export const text_36a9f930995b: string = 'اعتبار دعوت ';
export const text_9a8ff9e33a79: string = 'فرزند: ';
export const text_fe34977f1c1d: string = 'پروندهٔ آموزشی: ';
export const text_fc6edfd5cebe: string = 'جزئیات دعوت';
export const text_b4f08dbb3ac5: string = 'مهلت پاسخ';
export const text_55e6bc158c7d: string =
  'پذیرش این دعوت، پروندهٔ آموزشی نمایش‌داده‌شده را به حساب شما متصل می‌کند.';
export const text_7c074caf8735: string =
  'پذیرش این دعوت، رابطهٔ والد با فرزند مشخص‌شده را در همین آموزشگاه تأیید می‌کند.';
export const text_f187d8d6bfc6: string = 'اتصال این پروندهٔ آموزشی به حساب خودم را تأیید می‌کنم.';
export const text_0cd10f957b27: string =
  'رابطهٔ والد با فرزند مشخص‌شده در همین آموزشگاه را تأیید می‌کنم.';
export const text_89c9d5704210: string = 'پذیرش دعوت';
export const text_a403d91d1d93: string = 'این دعوت رد شود؟';
export const text_60b03c070e6f: string = 'رد دعوت';
export const text_1e4beb165475: string =
  'تکلیف هر کلاس را آماده و منتشر کنید؛ پاسخ‌های دانش‌آموزان را از داخل تکلیف بررسی کنید.';
export const text_12930efb22f3: string =
  'تکلیف را بخوانید، پاسخ را ذخیره کنید و در پایان تحویل دهید.';
export const text_66eea532efc0: string = 'ایجاد تکلیف';
export const text_c476f4996767: string = 'کلاس تکلیف';
export const text_64a80eb6ce5b: string = 'یک کلاس انتخاب کنید…';
export const text_3a93670cd3c7: string = 'مشاهدهٔ تکلیف و پاسخ‌ها ';
export const text_5588a43e9669: string = 'مشاهدهٔ تکلیف و پاسخ‌ها';
export const text_5cb8d6841586: string = 'تکلیفی در این کلاس موجود نیست';
export const text_6ddab36198ac: string = 'افزودن تکلیف';
export const text_f71501099cc4: string = 'تمرین را با هدف و مهلت مشخص بسازید.';
export const text_8dfc669046e4: string = 'تنظیمات تحویل';
export const text_6cac361a9d88: string = 'ذخیرهٔ پیش‌نویس تکلیف';
export const text_895fe6a2fd56: string = 'نمرهٔ کل: ';
export const text_4d420238b323: string = 'بازبینی و انتشار تکلیف';
export const text_3b74a41eb771: string = 'ارزیابی پاسخ‌ها';
export const text_6475ed5d6ade: string = 'پاسخ‌های دریافتی و ارزیابی';
export const text_185168f80806: string = 'پاسخ من';
export const text_2ea16ced02c4: string = 'مشاهده و پاسخ به تکلیف';
export const text_73b4dad6356e: string = 'پاسخ‌های قبلی و نتایج';
export const text_e443a9f2c748: string = 'پیگیری دانش‌آموزان';
export const text_5e21cda4898b: string = 'دانش‌آموزان فعال کلاس:';
export const text_1cab39a10925: string =
  'این فهرست، گزارش تکلیف‌های دانش‌آموزان است؛ دانش‌آموزی که هنوز تکلیفی برایش منتشر نشده ممکن است در گزارش نباشد.';
export const text_87479d632cb0: string = 'تحویل';
export const text_2b9d6b6b7916: string = 'نمرهٔ جاری';
export const text_ad09745dadec: string = 'هنوز نمره ندارد';
export const text_0f71dc23b496: string = 'فعالیتی در گزارش موجود نیست';
export const text_968ea718e159: string = 'پیوست‌های درس';
export const text_35b7da5aa84f: string =
  'فایل‌های آموزشی را انتخاب کنید؛ پس از آماده‌شدن همراه درس ذخیره می‌شوند.';
export const text_42c335b87f14: string = 'جزوه، تصویر یا فایل آموزشی';
export const text_1efc73ab12b4: string = 'هر فایل را انتخاب کنید و تا پایان بارگذاری منتظر بمانید.';
export const text_eef3e6a8a691: string = 'انتخاب فایل';
export const text_ab79179420ee: string = 'پیوست درس';
export const text_fbfd46e53247: string = 'فایل پیوست';
export const text_1bf987f717ef: string = ' · آمادهٔ ذخیره';
export const text_e06356df9cbf: string = 'در حال بررسی فایل…';
export const text_b4ad4b31d4f7: string = 'در حال بارگذاری…';
export const text_b5aeb593a9f9: string = 'پیشرفت بارگذاری جزوه';
export const text_ab2b2b678ccc: string = 'فایل در حال بررسی است؛ هنوز به پیوست‌های درس اضافه نشده.';
export const text_c93466e60cc4: string =
  'این فایل برای پیوست قابل استفاده نیست؛ فایل دیگری انتخاب کنید.';
export const text_596683be71f8: string = 'درس و جزوه';
export const text_2aea2dc372bf: string = 'کلاس را انتخاب کنید تا محتوای آموزشی مجاز آن را ببینید.';
export const text_b3d98309e169: string = 'کلاسی برای نمایش محتوا ندارید';
export const text_cd953dadaced: string = 'درس‌ها و جزوه‌های کلاس ';
export const text_1fe9a8f47a21: string = 'ایجاد درس و جزوه';
export const text_ab0182186a14: string = 'جستجوی درس و جزوه';
export const text_b2bae9b56399: string = 'محتوایی برای نمایش نیست';
export const text_4038de890cd2: string = 'درس را آماده کنید و پس از بازبینی منتشر کنید.';
export const text_b2e65fbf129d: string = 'محتوای منتشرشدهٔ این کلاس اینجا نمایش داده می‌شود.';
export const text_0f5761aef3d3: string = 'مشاهدهٔ درس ';
export const text_9b8c98558df1: string = 'مشاهدهٔ درس';
export const text_d14bfeb0a316: string = 'مطالعه درس';
export const text_2c00c0223035: string = 'منابع درس';
export const text_bc7a8f5bd5c0: string = 'پیوست‌های این درس با مجوز همین کلاس دریافت می‌شوند.';
export const text_a842a0ba8b1d: string = 'ویرایش پیش‌نویس';
export const text_631a55a22187: string = 'بازبینی و انتشار درس';
export const text_b360b6e6f8c4: string =
  'این درس برای دانش‌آموزان کلاس منتشر شود؟ پس از انتشار قابل ویرایش نیست.';
export const text_b49a025b4de1: string = 'انتشار درس';
export const text_3dd42711b07e: string =
  'این درس منتشر شده است و ویرایش آن در این نسخه امکان‌پذیر نیست.';
export const text_83834a388c5e: string = 'پیش‌نویس را کامل کنید.';
export const text_42a510e18e57: string = 'یک موضوع روشن، یک درس تازه.';
export const text_d26be2999a35: string = 'فایل هنوز آمادهٔ دریافت نیست';
export const text_854cc29ee49a: string = 'پیشرفت دریافت جزوه';
export const text_083a698e8bdd: string = 'پیش‌نویس ذخیره شد';
export const text_d01b8295b853: string = 'عنوان درس و جزوه';
export const text_101a6f1eac3a: string = 'متن درس';
export const text_f22a34db35c9: string = 'ترتیب نمایش';
export const text_31929c77bbbc: string = 'بررسی دوبارهٔ همان پیش‌نویس';
export const text_c7be60663550: string = 'ذخیرهٔ پیش‌نویس';
export const text_d1e71009180d: string = 'ویرایش اطلاعات پیش‌نویس';
export const text_9928a795474d: string = 'کلاسی با این مشخصات پیدا نشد';
export const text_010c3bbd979e: string = 'عبارت جستجو را تغییر دهید.';
export const text_1141507339bc: string = 'ظرفیت ';
export const text_ea1397131af1: string = 'مدیریت کلاس ';
export const text_8d178554791f: string = 'مدیریت اعضا';
export const text_8a4c6b93d372: string = 'عملکرد کلاس';
export const text_bbdeb1d752d0: string = 'معلمان و دانش‌آموزان';
export const text_8a36678b886f: string = 'جزوه‌ها';
export const text_3e76be8bc98c: string = 'تکلیف‌ها و آزمون‌ها';
export const format_3f95b308e154 = (
  value0: unknown,
  value1: unknown,
  value2: unknown,
  value3: unknown,
) => `${value0} · ${value1} · ظرفیت ${value2} نفر · ${value3}`;
export const text_51a19c9825e6: string = 'بخش‌های مدیریت کلاس';
export const text_67d6351483d1: string = 'فعالیت‌های کلاس';
export const text_63c576bd7637: string = 'نوع اعضای کلاس';
export const text_35e85a88a0fa: string = 'دانش‌آموزان';
export const text_95aaae7b36b0: string = 'افزودن معلم به کلاس';
export const text_e0b35522cbd0: string = 'افزودن دانش‌آموز به کلاس';
export const text_a4dd29fe7d67: string = 'نمای کلی آموزشگاه';
export const text_45db6dacb1d1: string = 'کلاس‌ها، اعضا و پیگیری‌های آموزشگاه در یک نگاه.';
export const text_413337c38036: string = 'افزودن کلاس آموزشگاه';
export const text_622d10d391a9: string = 'آمار آموزشگاه';
export const text_5419ed3bd524: string = 'نیازمند پیگیری';
export const text_2c55a75e6b60: string = 'دعوت‌های اعضا';
export const text_7330fa8e33d9: string = ' دعوت در انتظار پذیرش';
export const text_55e5cd56489f: string = 'برنامه این هفته';
export const text_3d7d49b37d72: string = 'جلسه‌های نزدیک و اطلاعات برنامه';
export const text_35d50af580db: string = 'گزارش آموزشگاه';
export const text_6c1681d6d4e1: string = 'حضور، ارزیابی و روند یادگیری';
export const text_6cdd6f97ebf5: string = 'رابطه‌های مجاز و پرونده‌های آموزشی';
export const text_5477ed00df38: string = 'همهٔ کلاس‌ها';
export const text_ab4d76d96a3a: string =
  'کلاس فوق‌برنامه از آموزشگاه مستقل است. درخواست آن از مقصد «فوق‌برنامه» انجام می‌شود.';
export const text_030eacc9e686: string = 'گروه‌ها و کانال‌های رسمی آموزشگاه';
export const text_7b586f9d7764: string = 'اطلاعات آموزشگاه: ';
export const text_141ab31cbb75: string = 'مدیریت دعوت‌های آموزشگاه';
export const text_69a24d13a391: string =
  'دعوت والد را برای فرزند مشخص ارسال کنید و پرونده‌های نیازمند اتصال حساب را بررسی کنید.';
export const text_e61d50d522fa: string = 'اقدام‌های دعوت و عضویت';
export const text_afeb96c95c63: string = 'دعوت والد برای دانش‌آموز';
export const text_8987b66cfbc9: string = 'پرونده‌ها و اتصال حساب';
export const text_48eb62b1b116: string = 'اعضای فعلی آموزشگاه';
export const text_6b70a58fe33b: string = 'دعوت‌های ارسالی آموزشگاه';
export const text_a458251385ff: string =
  'فهرست یکپارچهٔ دعوت‌های ارسالی هنوز در این بخش در دسترس نیست. پس از ارسال دعوت والد، وضعیت و امکان لغو همان دعوت در رسید آن نمایش داده می‌شود.';
export const text_c8522eec5d85: string = 'کارکرد معلمان';
export const text_6f5f2828fcf2: string = 'حضور کلاس‌ها';
export const text_dc5de3fc6954: string = 'ثبت‌نام‌ها';
export const text_2cbe62e265bd: string = 'گزارش‌های آموزشگاه';
export const text_ce15f1346b55: string =
  'کارکرد آموزشی، حضور، ارزیابی و ثبت‌نام را از گزارش‌های آموزشگاه پیگیری کنید.';
export const text_cbdfdaa8e710: string = 'نوع گزارش مدیر';
export const text_437fb367adf5: string = 'کلاس گزارش';
export const text_5314e6ad0a8f: string = 'همهٔ کلاس‌های آموزشگاه';
export const text_746a98fe61fd: string = 'گزارشی در این محدوده ثبت نشده است';
export const text_b68ff13bf161: string =
  'کلاس دیگری انتخاب کنید یا پس از ثبت فعالیت‌ها دوباره بررسی کنید.';
export const text_25ae6cfe3ea0: string = 'به‌روزرسانی گزارش: ';
export const text_46a81f723a28: string = 'معلم';
export const text_2e939b293219: string = 'جلسهٔ برگزارشده';
export const text_bc2ae0bd2843: string = 'تکلیف در انتظار ارزیابی';
export const text_0e85a9de7d6d: string = 'آزمون در انتظار ارزیابی';
export const text_fc40112dcc6b: string = 'ثبت‌شده';
export const text_ce9a296bdb67: string = 'تأخیر';
export const text_cbf88cdc3070: string = 'ثبت‌نشده';
export const text_b119e3358137: string = 'مخاطبان';
export const text_5392fc21c0d3: string = 'ارزیابی باقی‌مانده';
export const text_5c5f6e089f42: string = 'گزارش این کلاس قابل نمایش نیست';
export const text_599bb8087251: string = 'گزارش عملکرد کلاس';
export const text_8192485568dd: string = 'دانش‌آموز فعال';
export const text_ab3e7cbab1a8: string = 'نتیجهٔ تکلیف منتشرشده';
export const text_a1315a65ca38: string = 'میانگین تکلیف';
export const text_917a63d23e58: string = 'هنوز محاسبه نشده';
export const text_b84635985b83: string = 'نتیجهٔ آزمون منتشرشده';
export const text_2999be99037f: string = 'میانگین آزمون';
export const text_9ac2d07cb58e: string = 'داده‌های گزارش: ';
export const text_6d784fcb7c9a: string = 'کلاس‌های آموزشگاه';
export const text_aa9247a0d79f: string =
  'کلاس بسازید، دانش‌آموزان را تقسیم‌بندی کنید و معلمان کلاس را مشخص کنید.';
export const text_d5743b840e90: string =
  'کلاس‌های مجاز شما؛ برنامه، تکلیف و آزمون هر کلاس در یک جا.';
export const text_3fce236a7ccd: string = 'جستجوی کلاس، درس یا دوره';
export const text_535e99805ced: string = 'ورود به کلاس ';
export const text_5923c5cbace6: string = 'مدیریت کلاس';
export const text_aca867e37332: string = 'هنوز کلاسی وجود ندارد';
export const text_f2f08c07a3c0: string =
  'از «ایجاد کلاس» شروع کنید؛ سپس دانش‌آموز و معلم را به کلاس اضافه کنید.';
export const text_bc49db330f23: string =
  'کلاس‌های اختصاص‌یافته پس از ثبت آموزشگاه اینجا نمایش داده می‌شوند.';
export const text_b6f6538e49df: string = 'دانش‌آموزان این کلاس';
export const text_2f6b3c84f920: string = 'دانش‌آموزان ثبت‌نام‌شده';
export const text_763022dc000f: string = 'ثبت‌نامی وجود ندارد';
export const text_fb368cca5abe: string =
  'پس از ثبت‌نام در کلاس، دانش‌آموز اینجا نمایش داده می‌شود.';
export const text_836e8b88a455: string = 'والدین و دسترسی فرزندان';
export const text_a8f7d5d341fb: string =
  'دسترسی آموزشی والد فقط برای فرزند مشخص و رابطهٔ فعال برقرار می‌شود.';
export const text_4984b636db1a: string = 'افزودن رابطهٔ والد و فرزند';
export const text_4b50b911a4a4: string = 'رابطهٔ والد و فرزندی ثبت نشده است';
export const text_b9c23f90e92a: string = 'پروندهٔ فرزند';
export const text_c9c2548db6d8: string = 'حساب والد: ';
export const text_7d11b416e34f: string = 'فعال‌سازی رابطهٔ بررسی‌شده در آموزشگاه';
export const text_50591f0957ee: string = 'فعال‌سازی دسترسی والد';
export const text_94eb9f878b58: string = 'دلیل تغییر دسترسی والد';
export const text_5fc6fc050d06: string = 'پایان دسترسی والد به این فرزند';
export const text_67a07cf5da0e: string = 'پایان دسترسی والد';
export const text_e6a502d4ee2b: string = 'پایان رابطه';
export const text_129858da9abc: string =
  'فقط دسترسی آموزشی همین رابطه پایان می‌یابد؛ حساب والد و رابطه با فرزندان دیگر حفظ می‌شود.';
export const text_988a9f3a30f5: string = 'انتخاب معلمان';
export const text_e66b1190c86c: string = 'انتخاب دانش‌آموزان';
export const text_e00915ec36cf: string =
  'چند نفر را انتخاب کنید؛ انتخاب‌های شما هنگام جستجو و تغییر صفحه باقی می‌مانند.';
export const text_b4adb9469c50: string = 'روش انتخاب دانش‌آموز';
export const text_e896842afe7b: string = 'دانش‌آموزان عضو آموزشگاه';
export const text_e40bbfa529e7: string = 'از پرونده‌های آموزشی';
export const text_120de68a4876: string = 'جستجوی معلمان برای افزودن';
export const text_65ede2372929: string = 'جستجوی دانش‌آموزان برای افزودن';
export const text_b3d6c9493f41: string = 'پرونده یا عضویت فعال برای این انتخاب موجود نیست';
export const text_a7752b98a99b: string = 'فردی با این شرایط پیدا نشد';
export const text_e6abca191b09: string = 'انتخاب‌ها و نتیجهٔ افزودن';
export const text_cd049afa6984: string = ' نفر انتخاب‌شده';
export const text_2747228563a9: string =
  'افزودن هر نفر جدا انجام می‌شود؛ خطای یک نفر، موفقیت دیگران را برنمی‌گرداند.';
export const text_26906f613c15: string = 'به کلاس اضافه شد';
export const text_a9562ef9a9c5: string = 'ثبت تأیید نشد؛ وضعیت را بررسی کنید';
export const text_d8d6fdf5ca72: string = 'آمادهٔ افزودن';
export const text_b48606a1eeac: string = 'در حال افزودن…';
export const text_895f00b2273b: string = 'بررسی و تلاش دوباره';
export const text_a91a0317a5d6: string = ' نفر به کلاس';
export const text_b765b14a3118: string = 'همهٔ اعضا';
export const text_2d821b70695a: string = 'والدین';
export const text_894f57ecc265: string = 'جستجو و فیلتر اعضا';
export const text_40fbc1ab0d10: string = 'نقش اعضا';
export const text_a144dcd7df31: string = 'جستجوی اعضای آموزشگاه';
export const text_c8756c7737fc: string = 'وضعیت عضویت';
export const text_77db9fa6328b: string = 'فهرست اعضا';
export const text_028c8faf7935: string = ' نتیجه';
export const text_c48516c2d4d1: string = 'والد و فرزند ';
export const text_4108dae42908: string = 'عضو آموزشگاه';
export const text_5d33f6812cd4: string = 'پروندهٔ آموزشی';
export const text_18f6e427c723: string = 'نقش فعالی ندارد';
export const text_cefa283cd307: string = 'مشاهدهٔ پروندهٔ ';
export const text_895400e35aa6: string = 'مشاهدهٔ پرونده';
export const text_0ca10d7c79f2: string = 'پرونده متصل نیست';
export const text_5e616c8620d1: string = 'عضوی با این شرایط پیدا نشد';
export const text_3c1e3421fa35: string = 'نام یا فیلتر نقش و وضعیت را تغییر دهید.';
export const text_376e9c9561e2: string = 'آماده';
export const text_7038382709a2: string = 'نیازمند بررسی آموزشگاه';
export const text_42fb54edaf34: string = 'گروه و کانال رسمی کلاس';
export const text_cf55a848d0e2: string = 'گروه و کانال رسمی آموزشگاه';
export const text_75b5481cd1a2: string = 'دریافت دوبارهٔ فضاهای رسمی';
export const text_12bdeb2febff: string = 'وضعیت در دسترس نیست';
export const text_26261794dfe5: string = 'مشاهده و ارسال پیام';
export const text_2e9c466baa88: string = 'فقط مشاهده';
export const text_71d8ee4e0bc6: string = 'ورود به ';
export const text_8889e15c5832: string = 'دسترسی ندارید';
export const text_cf473a776359: string = 'در دسترس نیست';
export const text_de5049310272: string = 'دعوت در انتظار تأیید والد';
export const text_395ddde85cb3: string =
  'دسترسی فرزند پس از تأیید صریح حساب مقصد و معتبرشدن رابطه برقرار می‌شود.';
export const text_64ab8ca6f7d1: string = 'انقضا: ';
export const text_82f595491fa2: string = 'لغو دعوت والد';
export const text_e1eb98be1ea1: string = 'لغو دعوت';
export const text_0fec1a89d5a8: string = 'تأیید لغو دعوت';
export const text_20cd03b0aa71: string =
  'این دعوت پایان می‌یابد و از طریق آن دسترسی جدیدی به فرزند برقرار نمی‌شود.';
export const text_8e7fc76e5ae0: string = 'لغو دعوت از سوی مدیر آموزشگاه';
export const text_05259033e1e7: string =
  'دعوت را با نام کاربری دقیق یا شمارهٔ حساب موجود بفرستید. والد در حساب خودش، رابطه با همین فرزند را تأیید یا رد می‌کند.';
export const text_e989f79e0442: string = 'جستجوی پروندهٔ فرزند';
export const text_7c2cc959e773: string = 'انتخاب فرزند…';
export const text_bebe8d1190be: string = 'روش معرفی والد';
export const text_efca55591503: string = 'شمارهٔ همراه والد';
export const text_ac3aaa5781dc: string = 'نام کاربری والد';
export const text_41ffba3860cf: string = 'زمان انقضای دعوت';
export const text_1bab9e2567d6: string =
  'زمان انقضا را در آینده و حداکثر تا ۳۰ روز دیگر انتخاب کنید.';
export const text_fcd23a2b1bd3: string = 'دلیل دعوت والد';
export const text_4de9dc5e06a0: string = 'بررسی دوبارهٔ همان دعوت';
export const text_1f8d39cd6328: string = 'ارسال دعوت والد';
export const text_1c5c1a8b7321: string = 'ویرایش اطلاعات دعوت';
export const text_2cb4c38e97eb: string = 'همراه رشد او، با اطلاعات آموزشی روشن.';
export const text_ecd9b2fba4d5: string = 'حضور ثبت‌شده';
export const text_265cc9015b07: string = 'تکلیف در این نما';
export const text_4d9be597887f: string = 'اطلاعات آموزشیِ منتشرشدهٔ ';
export const text_47d16fe93a66: string = ' را اینجا دنبال کنید.';
export const text_3952b94c82be: string = 'آخرین فعالیت‌ها';
export const text_6a9b00bf691b: string = 'ت';
export const format_056cee574f72 = (value0: unknown, value1: unknown) =>
  `نمرهٔ منتشرشده: ${value0} از ${value1}`;
export const text_a94260ec452b: string = 'هنوز فعالیتی منتشر نشده است';
export const text_50cde0908b00: string = 'دیدن گزارش پیشرفت';
export const text_2808abe7f9bc: string = 'آزمون‌ها و نتایج فرزند';
export const text_e4b1c0f12b56: string = 'جستجوی پرونده‌های آموزشی';
export const text_e52c421dff2c: string = 'جستجوی پرونده‌ها';
export const text_2b7ab2fd590c: string = 'فهرست پرونده‌ها';
export const text_761e229676b7: string = 'پرونده‌های آموزشگاه';
export const text_5e535aba42de: string = 'نام فرد';
export const text_dd1b208f270b: string = 'وضعیت پرونده';
export const text_8ca78e1b4814: string = 'اتصال حساب';
export const text_35c2efc6a99d: string = 'جزئیات';
export const text_68d976ba9e81: string = 'پرونده';
export const text_c28daebcd3bf: string = 'حساب';
export const text_490a4c57bf7a: string = 'متصل';
export const text_33547bc78c38: string = 'متصل نشده';
export const text_c49da5be84b7: string = 'پرونده‌ای پیدا نشد';
export const text_d22a20b5f223: string = 'نام دیگری جستجو کنید یا پروندهٔ جدیدی ثبت کنید.';
export const text_5fe4a18d76e9: string = 'ویرایش پرونده';
export const text_09de2f309ec3: string = 'آموزشگاه / پرونده‌های آموزشی';
export const text_520b2ae78d67: string = 'جزئیات پرونده';
export const text_803b2a679970: string = 'پروندهٔ آموزشی در آموزشگاه فعال';
export const text_7ff9b551cfbc: string = 'حساب کاربری';
export const text_86c185646c12: string = 'حساب متصل نشده';
export const text_53437dbf427f: string =
  'این پرونده به یک حساب کاربری متصل است. نقش‌ها و ثبت‌نام کلاس جداگانه مدیریت می‌شوند.';
export const text_808e1b11e334: string =
  'این پرونده اطلاعات آموزشی فرد را نگه می‌دارد؛ ساخت آن به‌تنهایی حساب کاربری یا نقش آموزشی ایجاد نمی‌کند.';
export const text_678da4712ae9: string = 'نام این پرونده در وضعیت فعلی قابل ویرایش نیست.';
export const text_1a4e5a33c6e7: string = 'شناسه‌های پرونده';
export const text_9adbdd5ac00c: string = 'شناسهٔ پروندهٔ آموزشگاه';
export const text_53c9bf7c39f9: string = 'شناسهٔ شخص';
export const text_ac610f52cfdf: string = 'پروندهٔ سازمانی، حساب جدید یا نقش آموزشی ایجاد نمی‌کند.';
export const text_0c372fe12c90: string = 'نام نمایشی (اختیاری)';
export const text_97098199cc52: string = 'نامی که در آموزشگاه نمایش داده می‌شود';
export const text_2979f12cb485: string = 'توضیح ثبت';
export const text_d38f60c41090: string = 'دلیل ثبت یا اصلاح اطلاعات را کوتاه بنویسید.';
export const text_e3f9741e73bf: string = 'دلیل ثبت یا تغییر پرونده';
export const text_c02ab0f896b2: string = 'برای مثال: اصلاح نام ثبت‌شده در پرونده';
export const text_2b5b12046f6c: string = 'انتشار ویرایش ';
export const text_ee6d219bd20f: string = ' ثبت شد.';
export const text_be84e1c9d36f: string = 'اعلان در مقصد درج شده است.';
export const text_3a487c73c31b: string = 'درج اعلان در گروه و کانال هنوز در انتظار است.';
export const text_621141ef80a1: string = 'وضعیت درج اعلان را در فضای رسمی کلاس بررسی کنید.';
export const text_2fdcd8a1bdba: string = 'برنامهٔ هفتگی کلاس‌ها';
export const text_ba767b9a0d5e: string = 'جابه‌جایی هفته';
export const text_e32082a4e12f: string = 'هفتهٔ قبل';
export const text_fcd0612e300b: string = 'شنبه تا جمعه';
export const text_cf12b2fabd7e: string = 'هفتهٔ جاری';
export const text_4c6c8570d091: string = 'هفتهٔ بعد';
export const text_be58b9137dd7: string = 'برنامهٔ این فضای آموزشی قابل نمایش نیست.';
export const text_85454321f228: string = 'جلسه‌های هفته';
export const text_d61ca8f948c8: string = 'روز پایان جلسه';
export const text_32ebb1abcc1c: string = '(';
export const text_ba5ec51d07a4: string = ')';
export const text_b1fa64d456bf: string = 'ورود به جلسه';
export const text_0ebd449a5ce9: string = 'برای این هفته جلسه‌ای ثبت نشده است';
export const text_a2a9b91a28ef: string =
  'با دکمه‌های هفتهٔ قبل و هفتهٔ بعد، جلسه‌های دیگر را ببینید.';
export const text_65fe35f47116: string = 'ی';
export const text_c3f4bea9320d: string = 'تکلیف‌های ';
export const text_8e87c1832a1e: string = 'جستجو در آموزشگاه';
export const text_cd5cdd750175: string = 'جستجوی کلاس، تکلیف یا آزمون';
export const text_042fb068891a: string = 'نوع نتیجهٔ جستجو';
export const text_2b19287411ee: string = 'حداقل دو حرف وارد کنید.';
export const text_ecf4dfe1fb25: string = 'جستجو در اطلاعات نمای فرزند انتخاب‌شده انجام می‌شود.';
export const text_408dd141549d: string = 'بخشی از اطلاعات دریافت نشد: ';
export const text_11735aabd336: string = '، ';
export const text_a13e10143f9c: string = '. نتایج کامل نیستند.';
export const text_b548ad60076f: string = 'نتیجه‌ای پیدا نشد';
export const text_e984dd22d5e3: string = 'عبارت دیگری را جستجو کنید.';
export const text_04f471efe1c1: string = 'ویرایش جلسه';
export const text_e0d21ee48bbf: string = 'صفحهٔ کلاس';
export const text_7a68b6ab2d41: string = 'لغو جلسه';
export const text_0435469ff2ca: string = 'لغو این جلسه؟';
export const format_571b7a591c41 = (value0: unknown, value1: unknown) =>
  `${value0} در ${value1} لغو می‌شود. سوابق حذف نمی‌شوند.`;
export const text_98bfab836451: string = 'تأیید لغو جلسه';
export const text_b77dc949baa1: string =
  'نسخهٔ جلسه تغییر کرده است؛ پیش از ادامه، تغییرات خود را نگه دارید و اطلاعات را بازخوانی کنید.';
export const text_6afc863be80c: string = 'تغییرات ثبت شد.';
export const text_7506c95e2fd6: string = ' مورد';
export const text_0319845ca603: string = 'زمان معتبر وارد کنید.';
export const text_9778ed17625c: string =
  'فایل در حال بررسی است؛ پس از آماده‌شدن دوباره بررسی کنید.';
export const text_e6375898a5b5: string = 'این فایل برای پیوست قابل استفاده نیست.';
export const text_f1b5427c160c: string =
  'عملیات لغو شد؛ برای بررسی آخرین وضعیت، پاسخ را دوباره دریافت کنید.';
export const text_802918533a64: string = 'پیوست پاسخ';
export const text_bd9a4d172538: string = 'افزودن عکس یا PDF';
export const text_35cb5e51737d: string = 'افزودن عکس یا PDF به پاسخ';
export const text_ac916da78819: string = 'پیش از تغییر پیوست، پاسخ متنی را ذخیره کنید.';
export const text_4748e6b9891c: string = 'پیوستی ثبت نشده است.';
export const text_1126b74c039f: string = 'بایت';
export const text_324fedf3e688: string = 'کیلوبایت';
export const text_6bbd07a24946: string = 'افزودن فایل آماده‌شده';
export const text_f03f62ba4a5a: string = 'کنار گذاشتن فایل انتخاب‌شده';
export const text_1cf79c5c02d8: string = 'در حال دریافت فایل…';
export const text_07aba39257cf: string = 'در حال ثبت پیوست…';
export const text_9e8687e29590: string = 'پیشرفت انتقال پیوست پاسخ';
export const text_a6419190d700: string = 'لغو انتقال';
export const text_9e0ab9989a34: string = 'بازبینی پاسخ تکلیف';
export const text_9b6a410d2fd4: string = 'رسید تکلیف';
export const text_e9579f397088: string = 'پاسخ تکلیف';
export const text_b534c9378ec0: string = 'برای این تکلیف، پاسخ جدیدی شروع کنید.';
export const text_42c85a968ff2: string = 'شروع پاسخ جدید';
export const text_a92abd249599: string = 'رسید تحویل تکلیف';
export const text_db45f95e898b: string = 'تکلیف تحویل داده شد';
export const text_911bee269a92: string = 'شمارهٔ تلاش: ';
export const text_9160be1d11fd: string = 'زمان ثبت: ';
export const text_929f03ab605c: string = 'در انتظار ارزیابی استاد';
export const text_7b938dd0baa1: string = 'تحویل این پاسخ هنوز توسط سرویس تأیید نشده است.';
export const text_bd904ba4e9f5: string = 'پاسخ ثبت‌شده';
export const text_9560630f8636: string = 'مشاهدهٔ رسید';
export const text_d7be740f493d: string = 'آموزشگاه / تکالیف';
export const text_8936687a1593: string = 'پاسخ‌نامهٔ تکلیف';
export const text_fdda4c37fb68: string = 'پاسخ خود را آماده کنید، بازبینی کنید و سپس تحویل دهید.';
export const text_f863f1753616: string = 'مراحل تحویل تکلیف';
export const text_08ca6c6d28a0: string = 'نوشتن پاسخ';
export const text_8315dc440d8b: string = 'بازبینی';
export const text_db72fa383443: string = 'رسید تحویل';
export const text_303aed19e640: string = 'متن پاسخ شما';
export const text_de52acd1c81a: string = 'مرور پاسخ شما';
export const text_268a03f27704: string =
  'نسخهٔ سرور تغییر کرده است؛ پیش از ادامه، تغییرات خود را مقایسه کنید.';
export const text_384ce99126d0: string = 'تغییرات ذخیره‌نشده';
export const text_06746a73b060: string = 'همگام با پاسخ ذخیره‌شده';
export const text_3377c18a0960: string = 'ذخیرهٔ پاسخ';
export const text_2f5412466e47: string = 'بازبینی پاسخ';
export const text_9d50c961e634: string = 'تغییرات شما هنوز در سرویس ذخیره نشده‌اند.';
export const text_c40f664ec596: string = 'پاسخ ذخیره‌شده آمادهٔ بازبینی است.';
export const text_eb751dedb61d: string = 'پاسخ متنی بنویسید یا عکس و PDF پیوست کنید.';
export const text_c524c2bf4099: string = 'پاسخ متنی ندارد.';
export const text_6f26079ce668: string = 'پس از تحویل نهایی، این پاسخ دیگر پیش‌نویس نیست.';
export const text_765ece4bf409: string = 'بازگشت و ویرایش پاسخ';
export const text_1d97dfd8b2fc: string = 'در حال بررسی و تحویل…';
export const text_f6a1f07de0a0: string = 'تحویل نهایی تکلیف';
export const text_a386b4b3f356: string = 'اطلاعات تکلیف';
export const text_7b00ccc5488b: string = 'وضعیت پاسخ';
export const text_b65a1b4e036c: string = 'نوبت پاسخ';
export const text_71e6f07218a9: string = 'پیوست‌ها';
export const text_a432b50514c8: string =
  'ذخیرهٔ پاسخ، تحویل نهایی نیست. بعد از بازبینی، «تحویل نهایی تکلیف» را بزنید تا رسید بگیرید.';
export const text_7647e0a413cb: string = 'صورت تکلیف';
export const text_f5687ebf71ed: string =
  'نسخهٔ تکلیف تغییر کرده است؛ جزئیات نسخهٔ مربوط به پاسخ را از صفحهٔ تکلیف بررسی کنید.';
export const text_d35bc9b4b25d: string = 'نزدیک‌ترین جلسه';
export const text_611356e361a9: string = 'جلسهٔ نزدیکی در برنامه نیست';
export const text_d82ca42d9c0d: string = 'نزدیک‌ترین تکلیف';
export const text_291b5a9c5116: string = 'تکلیف نزدیکی در برنامه نیست';
export const text_5699366d499f: string = 'نزدیک‌ترین آزمون';
export const text_f8f7ac073471: string = 'آزمون نزدیکی در برنامه نیست';
export const text_d2c8a80d171e: string = 'مشاهده';
export const text_c4e5cf604afe: string = 'آموزشگاه / مدیریت فعالیت‌ها';
export const text_aee307f783b6: string = 'کلاس: ';
export const text_78d0088bdedd: string =
  'نسخهٔ اطلاعات در سرویس تغییر کرده است. متن شما حفظ شده؛ پیش از ادامه آن را بررسی و در صورت نیاز کپی کنید.';
export const text_35a1c9b683d8: string = 'جایگزینی پیش‌نویس';
export const text_363bc802fb51: string = 'استفاده از نسخهٔ سرویس';
export const text_c36e75eccc66: string = 'جایگزینی اطلاعات فرم';
export const text_883fc794a5da: string =
  'تغییرات ذخیره‌نشدهٔ این فرم با اطلاعات تازهٔ سرویس جایگزین شوند؟';
export const text_796a59104e57: string = 'تأیید و ثبت';
export const text_acf974d20dd2: string = 'مراحل ثبت';
export const text_16adf56a6387: string = 'تکمیل اطلاعات';
export const text_2fd8a3150ccd: string = 'بازبینی و ثبت';
export const text_4a9a328e6b5b: string = 'بازبینی اطلاعات';
export const text_5b1d3659c3d8: string = 'نشست‌های انتخاب‌شده پایان یافتند.';
export const text_bcdc391af4f9: string = 'جزئیات دستگاه';
export const text_c7645d8f947c: string = 'حساب شما، دستگاه‌های شما';
export const text_d03ca0340b3d: string =
  'اگر دستگاهی را نمی‌شناسید، نشست آن را پایان دهید. نشست فعلی مشخص شده است.';
export const text_012b8e7bb3b3: string = 'دستگاه بدون نام';
export const text_975d46ff5255: string = 'ورود: ';
export const text_ea0c56a7535c: string = 'دستگاه فعلی';
export const text_f307f4a9a432: string = 'جزئیات ';
export const text_1b292af7dfa0: string = 'آغاز نشست';
export const text_5856d67fad0a: string = 'اعتبار نشست';
export const text_ac852c2d9d64: string = 'پایان اعتبار نهایی';
export const text_989d2fe946b8: string = 'خروج از این دستگاه';
export const text_2ddbb4f12b8f: string = 'خروج از حساب؟';
export const text_d6e7c047c656: string =
  'برای ورود دوباره به این دستگاه به تأیید شماره نیاز دارید.';
export const text_1706ef5d00c1: string = 'پایان این نشست';
export const text_c074ded08bf3: string = 'پایان نشست دستگاه؟';
export const text_a7973bda076f: string = 'این دستگاه';
export const format_9ca356a23f7a = (value0: unknown) =>
  `${value0} برای دسترسی دوباره باید وارد حساب شود.`;
export const text_b1c8d490edb2: string = 'پایان نشست';
export const text_f2415eaf96f4: string = 'این نشست دیگر در فهرست شما نیست';
export const text_99bab8fc872f: string = 'نشست فعالی گزارش نشده است';
export const text_a2d7c2cecc5f: string = 'پایان همهٔ نشست‌های دیگر';
export const text_38e1bb39e307: string = 'خروج دستگاه‌های دیگر؟';
export const text_d555aaf8e0a0: string =
  'نشست همین دستگاه حفظ می‌شود؛ دستگاه‌های دیگر باید دوباره وارد شوند.';
export const text_a0fa8bc3a1ab: string = 'پایان نشست‌های دیگر';
export const text_f0840638365c: string = 'حریم خصوصی';
export const text_636ff38fb559: string = 'امنیت و دستگاه‌ها';
export const text_7298116df730: string = 'برنامه را متناسب با خودتان تنظیم کنید.';
export const text_054c843eeef5: string = 'بخش‌های تنظیمات';
export const text_6aaf2a576037: string = 'تنظیم دریافت اعلان و ساعت سکوت';
export const text_e4cf913f801a: string = 'بررسی نشست‌ها و پایان دسترسی دستگاه‌های دیگر';
export const text_5d3033724b66: string = 'پذیرش عضویت آموزشگاه و تأیید رابطهٔ والد و فرزند';
export const text_11a1d93d127f: string = 'ظاهر برنامه';
export const text_1a40ca7e417f: string = 'انتخاب حالت روشن یا تاریک';
export const text_6f68a5603b3d: string = 'پیام مستقیم، شمارهٔ همراه و آخرین بازدید';
export const text_4d67086f8777: string = 'ماکان را با سلیقه و نور محیط هماهنگ کنید.';
export const text_88619bd1891f: string = 'حالت نمایش';
export const text_be9fd3bd1ba1: string = 'روشن';
export const text_9a0be82749f7: string = 'تاریک';
export const text_c9b857c3a6b2: string = 'اطلاعات و نقش‌های حساب‌تان را از پروفایل مدیریت کنید.';
export const text_93affbaf8fcf: string = 'مشاهدهٔ پروفایل';
export const text_ceac199f616a: string = 'انتخاب شما روی همین مرورگر ذخیره می‌شود.';
export const text_a11180341c26: string = 'مطابق دستگاه';
export const text_dd307ff5e667: string = 'افزودن درس';
export const text_9aaef6f3e9c3: string = 'ویرایش درس';
export const text_33f4cefcfd71: string = 'پروفایل من';
export const text_7c61d113156b: string = 'کلاس‌های من';
export const text_049e4c61b067: string = 'ناوبری حساب شخصی';
export const text_05508133d927: string = 'رفتن به محتوای اصلی';
export const text_e357d20c5ae7: string = 'ماکان؛ انتخاب نقش و فضای کار';
export const text_4fdfc489ee16: string = 'فضای کار: ';
export const text_6eccd825a0c4: string = '، نقش: ';
export const text_1313fa70e766: string = 'فرد عادی';
export const text_52cdbbd87707: string = 'انتخاب فضای کار';
export const text_c16909b11f18: string = 'حساب شخصی شما با تغییر آموزشگاه باقی می‌ماند.';
export const text_b71318d920ee: string = 'در حال دریافت فضاهای مجاز…';
export const text_ea58c94d0d26: string = 'ماکان؛ تغییر نقش و فضای کار';
export const text_2a1922f9e184: string = 'منبع انتخاب‌شده';
export const text_a5a599a4d5ad: string = 'منابع متصل به سرور';
export const text_032399b8b323: string = 'جستجوی منبع';
export const text_1592fbd1126a: string = 'فضای منابع دستیار';
export const text_8dfd6e9f41b6: string = 'کتابخانه';
export const text_cfc8c7effeea: string = 'ابتدا فضای مجاز آموزشگاه را انتخاب کنید';
export const text_859153655434: string = 'انتخاب منابع این کلاس مستقل در این نسخه در دسترس نیست.';
export const text_f6eddb045e16: string = 'کلاس آموزشگاه';
export const text_28867895dae8: string = 'کلاس را انتخاب کنید';
export const text_4d31b36f9183: string =
  'کتابخانه فقط اطلاعات منابع را نشان می‌دهد؛ انتخاب برای دستیار در این انتشار مجاز نیست.';
export const text_76263ba743f2: string = 'منبعی پیدا نشد';
export const text_09fcb17b9340: string = 'هنوز منبعی در این فضا ندارید';
export const text_88d60d5cccab: string = 'آماده برای دستیار';
export const text_3fac9717ba13: string = 'استفاده در دستیار مجاز نیست';
export const text_5d73644e7bf2: string = 'هنوز برای دستیار آماده نیست';
export const text_d2aa095f1567: string = 'فایل: ';
export const text_db07d8f0bcb8: string = ' · منبع:';
export const text_9d02ca20e666: string = ' · دستیار:';
export const text_390a9cb6ef20: string = 'انتخاب منبع واقعی ';
export const text_aaa93351b89c: string =
  ' منبع انتخاب شده؛ مجوز و آمادگی در زمان استفاده دوباره بررسی می‌شوند.';
export const text_5cb53aa67331: string = 'بررسی دسترسی منابع';
export const text_bb441d2b8688: string = 'مدیریت و افزودن منابع واقعی';
export const text_c7ffe2197db2: string = 'جستجوی منابع';
export const text_8cc9dcd7a18e: string = 'جستجو در منابع من';
export const text_be51a88d392d: string = 'فضای منابع';
export const text_dab8b743e1f2: string = 'کلاس منبع';
export const text_5a1c9deed686: string =
  'کتابخانه فقط اطلاعات منابع عمومی منتشرشده را نشان می‌دهد؛ فایل و استفاده در دستیار در دسترس نیست.';
export const text_3043b5ecb0c3: string = 'فیلتر آمادگی منابع';
export const text_3b83b26abcf0: string = 'کلاس مجاز آموزشگاه را انتخاب کنید';
export const text_d00189e07062: string = 'منبعی در این صفحه با این فیلتر نیست';
export const text_638b8573191f: string = 'فضای ';
export const text_b0226c6cf2bd: string = 'فایل و آمادگی مطالعه';
export const text_530d0a0f20e9: string = '· ویرایش ';
export const text_45822f54a0d0: string = ': ';
export const text_f7b3cdaee0a4: string = 'آماده نیست';
export const text_b4ea75ad2e71: string = 'پیش‌نویس ثبت منبع معتبر نیست.';
export const text_1fa2b828a69e: string = 'فضای پیش‌نویس منبع تغییر کرده است.';
export const text_6b5fcc9a7cd5: string = 'نسخهٔ جدید منبع';
export const text_b7e453cfcea7: string =
  'بارگذاری فایل، منبع را خودکار منتشر یا برای هوش مصنوعی آماده نمی‌کند.';
export const text_e3a6d4896346: string = 'عنوان منبع';
export const text_5e89fc890d9e: string = 'توضیح منبع';
export const text_a69eb3885a5b: string = 'فایل منبع';
export const text_dc267e54e1df: string = 'دلیل ثبت';
export const text_db42134fccc6: string = 'وضعیت فایل:';
export const text_10312842c4e7: string = 'در انتظار آماده‌سازی';
export const text_9cf6d41e477e: string =
  'نسخهٔ منبع تغییر کرده است. ابتدا فایل و ویرایش فعلی را بررسی کنید؛ درخواست قبلی ممکن است ثبت شده باشد.';
export const text_e3963cf48bc3: string = 'ثبت نسخه پس از بازبینی';
export const text_1ae4d3eba9ba: string = 'بازبینی کردم؛ ادامهٔ نسخهٔ جدید';
export const text_9efe7df540e7: string =
  'فایل و نسخهٔ فعلی را بررسی کرده‌اید و می‌خواهید یک نسخهٔ جدید ثبت کنید؟';
export const text_3f86e11c3190: string = 'پیگیری ثبت منبع';
export const text_2ec5f09bb601: string = 'بررسی فایل و ثبت منبع';
export const text_6037c81e20c1: string = 'ثبت نسخهٔ جدید';
export const text_914c38333ec6: string = 'ثبت منبع';
export const text_a1b4ad75b5a1: string = 'اطلاعات منبع ثبت شد.';
export const text_c1a1a454512d: string = 'وضعیت بررسی فایل';
export const text_a94b0a08c898: string = 'فایل تأیید شده';
export const text_93865396d0f0: string = 'نیازمند بازبینی';
export const text_1d51178c62a6: string = 'رد شده';
export const text_5eb3967bfb0e: string = 'وضعیت پردازش';
export const text_b215b3cdccd3: string = 'پردازش درخواست نشده';
export const text_7f201a60b34b: string = 'در انتظار پردازش';
export const text_a7659ef6327d: string = 'ایجاد منبع';
export const text_63298350bfb1: string = 'نام فایل';
export const text_059af5880dc1: string = 'آماده‌سازی هوش مصنوعی هنوز تکمیل نشده است.';
export const text_195904575930: string = 'دریافت فایل منبع';
export const text_70050e6de11c: string = 'این صفحه فقط اطلاعات کتابخانه را نمایش می‌دهد.';
export const text_3ac20a5871e1: string = 'بررسی وضعیت منبع';
export const text_8d637ce68405: string = 'مدیریت منبع';
export const text_4aed2158ed57: string = 'عنوان پیش‌نویس';
export const text_3fb8ed5c09ec: string = 'توضیح پیش‌نویس';
export const text_3e94e3d48de6: string = 'دلیل تغییر';
export const text_8cd1e858041b: string =
  'نسخهٔ سرور تغییر کرده است؛ نوشتهٔ شما حفظ شده. پس از بازبینی، ادامهٔ ویرایش با نسخهٔ جدید را انتخاب کنید.';
export const text_85d9aa97ab20: string = 'نسخهٔ جدید برای ادامهٔ ویرایش انتخاب شد.';
export const text_3e6fbac4aaf0: string = 'ادامهٔ ویرایش با نسخهٔ جدید';
export const text_e91f86d68e00: string = 'انتشار منبع';
export const text_fe1f0c9b6301: string = 'نسخهٔ فعلی برای مخاطبان مجاز منتشر شود؟';
export const text_28962a621bca: string = 'بایگانی منبع';
export const text_e5a46d20e71d: string = 'منبع بایگانی شود؟';
export const text_25634673d188: string = 'پنهان‌کردن منبع';
export const text_113ab0e555a2: string = 'عمومی‌کردن منبع';
export const text_a1aa9c6ac26b: string = 'تغییر نمایش منبع';
export const text_7c12d530db7d: string = 'نمایش منبع طبق دسترسی تأییدشده تغییر کند؟';
export const text_5e10fc66488f: string = 'هوش مصنوعی';
export const text_86add7acc8b6: string = 'مجوز استفاده از منابع انتخاب‌شده تأیید نشد.';
export const text_c72e1757d1e6: string =
  'انتخاب منابع حفظ شده است. بازیابی محتوای منابع برای هوش مصنوعی هنوز روی سرور فعال نیست.';
export const text_a4a0809f295d: string =
  'مجوز و امکان بازیابی منابع تأیید شد. می‌توانید سؤال خود را از دستیار بپرسید.';
export const text_c4e5e84cee8d: string = 'تأیید نشده';
export const text_09d532dc89b6: string = 'تأیید شده';
export const text_4f7ffccf7e7d: string = 'نیازمند رفع مغایرت';
export const text_53e6049febad: string = 'هنوز مشخص نشده';
export const text_6061ba58845e: string = 'کم‌سن';
export const text_5b90087ef961: string = 'بزرگسال';
export const text_6f41c3160dce: string = 'اقدام دیگری لازم نیست';
export const text_712e7c54338d: string = 'تأیید سن ارتباطی لازم است';
export const text_42cad11a8844: string = 'پروفایل را تکمیل کنید';
export const text_25c400b0f133: string = 'مغایرت اطلاعات سن نیاز به بررسی دارد';
export const text_b7da574dc0b7: string = 'محدودیت ارتباطی حساب فعال است';
export const text_38adbb3eb81b: string = 'فضای شخصی را انتخاب کنید';
export const text_d1a91d934e1c: string =
  'ظاهر برای این صفحه تغییر کرد؛ ذخیرهٔ انتخاب در این مرورگر در دسترس نیست.';
export const text_2c65dfd06215: string =
  'وضعیت نمایش فضای شخصی هنوز مشخص نشده است. امکانات مجاز حساب شما از منوی اصلی در دسترس‌اند.';
export const text_634d86f0abd3: string = 'نصب برنامهٔ ماکان';
export const text_214e55f2c675: string = 'روش نصب به مرورگر و دستگاه شما بستگی دارد.';
export const text_df4631c953f0: string = 'Android و رایانه';
export const text_524bf92925b0: string =
  'منوی Chrome یا Edge را باز کنید و گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.';
export const text_da8675308c3f: string = 'iPhone و iPad';
export const text_921b0b990ebd: string =
  'نشانی امن ماکان را در Safari باز کنید. از Share، گزینه Add to Home Screen را بزنید؛ سپس برنامه را از آیکون صفحه اصلی باز کنید.';
export const text_8c7d9b94c4ce: string =
  'اگر گزینه نصب دیده نمی‌شود، مرورگر را به‌روز کنید و مطمئن شوید نشانی برنامه HTTPS است. برای کار با داده‌های ماکان، اینترنت لازم است.';
export const text_a26d8fb684dc: string = 'پنل به‌صورت برنامه روی این دستگاه باز شده است.';
export const text_59e64a5b7f77: string =
  'پنل ماکان را روی دستگاه نصب کنید تا از آیکون آن و در پنجره مستقل وارد شوید.';
export const text_25b10b0d03ba: string = 'نصب ماکان';
export const text_637e02c8cc87: string =
  'برای نصب، نشانی امن HTTPS پنل را باز کنید. نشانی محلی فقط روی همین رایانه قابل استفاده است.';
export const text_49a81da8ae60: string =
  'آماده‌سازی نصب کامل نشد. اتصال را بررسی و صفحه را تازه کنید.';
export const text_c2f894f9b8af: string = 'پیشنهاد نصب ماکان';
export const text_09772f118ff8: string = 'بستن پیشنهاد نصب ماکان';
export const text_45f7a9ae6e18: string = 'ماکان همیشه در دسترس شما';
export const text_63fb724daa3f: string = 'برنامه را نصب کنید و از آیکون آن روی دستگاه وارد شوید.';
export const text_1cc6e6f2da23: string = 'نصب آغاز نشد. دوباره تلاش کنید یا راهنمای نصب را ببینید.';
export const text_069a6fab0822: string = 'در حال آماده‌سازی…';
export const text_79e2c5a64efc: string = 'نصب ماکان';
export const text_1a92b2d7cdb7: string = 'پیش از ارسال، سؤال خود را بنویسید.';
export const text_6139467e7004: string =
  'انتخاب منابع حفظ شد. پاسخ‌گویی واقعی دستیار هنوز فعال نیست؛ پاسخ یا مصرف اعتبار ثبت نشد.';
export const text_66503f485eaf: string = 'از کجا شروع کنیم؟';
export const text_a6a7443500cb: string = 'یک سؤال روشن، یک پاسخ قابل پیگیری';
export const text_9d0fb0d433db: string = 'منابع انتخاب‌شده';
export const text_e1174ae8f3c8: string = 'انتخاب منابع';
export const text_df889c883c4e: string = 'بررسی دسترسی و آمادگی در انتخاب منابع';
export const text_9cd73d4302b4: string =
  'هنوز منبعی انتخاب نشده است. فقط منابع مجاز خودتان را انتخاب کنید.';
export const text_10d22840ab00: string = 'پیشنهاد برای شروع';
export const text_bdf39bdb81b6: string = 'نکته اصلی این منبع چیست؟';
export const text_e9c385cbd890: string = 'خلاصه‌ای با ارجاع به منبع';
export const text_2cd3e89872c5: string = 'با یک مثال توضیح بده';
export const text_f8031fc55c47: string = 'یک مفهوم را ساده‌تر بفهمید';
export const text_f601ed0900bc: string = 'برای مطالعه‌ام برنامه بده';
export const text_a9598b86b1bf: string = 'با زمان و هدفی که می‌گویید';
export const text_c3fd8e948061: string = 'سؤال از دستیار';
export const text_70c689cb669f: string = 'سؤالتان را بنویسید…';
export const text_a3dd80a69e93: string = 'ارسال سؤال';
export const text_26c05e2e974e: string = 'پاسخ دستیار را بررسی کنید؛ ممکن است خطا داشته باشد.';
export const text_2554cf297576: string = 'استودیو و ابزارهای نمونه';
export const text_821faf6af612: string = 'انتخاب منابع دستیار';
export const text_9bd9d24ad223: string = 'فقط منابعی که اجازهٔ دسترسی و انتخاب آن‌ها را دارید.';
export const text_370b22bdbc16: string = 'استفاده از ';
export const text_2413fa113cc0: string = ' منبع';
export const text_a6d0f49fd8fe: string = 'وضعیت دستیار';
export const text_8345a971afa5: string = 'بررسی پاسخ نمونه';
export const text_b58b562cefdb: string = 'فضاهای مجاز من';
export const text_e0c26a52135b: string = 'دربارهٔ شما';
export const text_e867b2170306: string = 'اطلاعات حساب و فضای فعلی شما در ماکان';
export const text_81ccc340065e: string = 'اطلاعات حساب';
export const text_c7bd7ba5d8c5: string = '، شما اکنون با نقش «';
export const text_3fc90e1d558e: string = '» در «';
export const text_c4992612c45a: string =
  '» فعالیت می‌کنید. گفتگوها، کلاس‌ها و دسترسی‌های شما بر اساس فضای انتخاب‌شده نمایش داده می‌شوند.';
export const text_d502ef7f6e83: string = 'نام و نام خانوادگی';
export const text_71f0be15159e: string = 'فضاها و نقش‌های من';
export const text_ad91fcc734f3: string = 'برای تغییر نقش، یکی از فضاهای مجازتان را انتخاب کنید.';
export const text_5111e892b919: string = 'تغییر نقش و فضای کار';
export const text_997df457da9a: string = ' · در دسترس نیست';
export const text_a50e86cb77a0: string = 'فضای قابل نمایشی برای این حساب دریافت نشد.';
export const text_6cf5c4f59e76: string = 'بخش‌های حساب';
export const text_07fe42e21aa0: string = 'کتاب، فایل و محتوای ذخیره‌شده';
export const text_55ed3d50b1e5: string = 'حریم خصوصی و امنیت';
export const text_ffe0dc421364: string = 'مدیریت دسترسی‌ها و دستگاه‌ها';
export const text_891a7f6ecdae: string = 'اعلان و ظاهر';
export const text_0a3e80141aa1: string = 'تنظیم تجربهٔ ماکان برای خودتان';
export const text_f40112f83ec9: string = 'نشست شما در این دستگاه پایان می‌یابد.';
export const text_e02cc8ce685e: string = 'نمره از ۲۰';
export const text_2fcd080bebd3: string = 'بازخورد قابل نمایش به عضو';
export const text_0a4195fe5ad4: string = 'نمره تشریحی از ۸';
export const text_d6732b5fe9fe: string = 'بازخورد قابل نمایش';
export const text_77c5794c5287: string = 'تعداد تلاش';
export const text_f50797500bdb: string = 'توضیح برای اعضا';
export const text_e14ec3060be7: string = 'مدت پاسخ';
export const text_7c2a05b3d364: string = 'صورت سؤال';
export const text_5d5e0005bb46: string = 'بارم';
export const text_68b3f07a4785: string = 'بارم این سؤال';
export const text_2a3c31e91c68: string = 'نوع سؤال';
export const text_16b1c6d84384: string = 'تستی تک‌گزینه‌ای';
export const text_1d841a8fd1ca: string = 'عملیات پیش‌نمایش کامل نشد.';
export const text_0bcc7208de82: string = 'متن پاسخ';
export const text_8b5cd36eb063: string = 'در این پیش‌نمایش PDF یا تصویر انتخاب کنید.';
export const text_83915b846d7f: string =
  'نام پیوست فقط در این مرورگر نگهداری شد؛ فایلی به سرور ارسال نشده است.';
export const text_37633df50279: string = 'پاسخ در شبیه‌ساز ذخیره شد.';
export const text_b5312bb583c9: string = 'پاسخ روی این دستگاه منتظر ارسال است.';
export const text_663cca42d122: string = 'اطلاعات و قواعد';
export const text_d06ede345521: string = 'تکلیف تازه';
export const text_7dabefaf145f: string = 'آزمون تازه';
export const text_e91ccbf5bfd5: string = 'بررسی پاسخ نازنین';
export const text_fcd463dc3c89: string = 'شرایط و شروع';
export const text_2e121310e13f: string = 'بازگشت به تکلیف‌ها';
export const text_0fd4b87e90b2: string = 'بازگشت به نمای کلاس';
export const text_36d9273115a0: string = 'توصیف';
export const text_cfea4dfbd384: string = 'شخصیت';
export const text_e9dd62f96636: string = 'نتیجه‌ها';
export const text_5679720a3e4d: string = 'پیش رو';
export const text_846e3092b049: string = 'منتظر بررسی · ۴';
export const text_b8915697a307: string = 'ارزیابی‌شده';
export const text_4c1f73ed8563: string = 'ادامه';
export const text_e1de3dede3f0: string = '۱۴ آبان، ۲۳:۵۹';
export const text_88aa24abe317: string = 'انتشار';
export const text_b819e3fc929e: string =
  'تکلیف برای اعضای نمونه منتشر شد؛ سرویس واقعی فراخوانی نشد.';
export const text_e85bd3d1815d: string = 'حذف پیوست';
export const text_ef1a5827932d: string = 'تحویل نهایی پاسخ';
export const text_92c764a5f0b0: string = 'بازبینی متن و فایل پاسختان را تأیید کنید.';
export const text_c23c4af7833f: string = 'بازبینی پاسخ نمونه';
export const text_301597724711: string = 'بدون پیوست';
export const text_43ac64d2338e: string = 'تأیید تحویل نمونه';
export const text_e79bae483df1: string =
  'ارزیابی در شبیه‌ساز ذخیره شد؛ هنوز برای عضو منتشر نشده است.';
export const text_c043e6249e9d: string = 'بازبینی انتشار نتیجه';
export const text_c175d95ab3ec: string = 'نمره: ';
export const text_af9e885bc552: string =
  'فقط نمره و بازخورد قابل نمایش منتشر می‌شود. یادداشت خصوصی در نمای عضو وجود ندارد.';
export const text_6337051ced5b: string = 'انتشار نتیجه نمونه';
export const text_289a78168f49: string = 'ذخیره سؤال';
export const text_384ed2e7a5d3: string = 'سؤال در نسخهٔ پیش‌نویس نمونه ذخیره شد.';
export const text_8f78599518cf: string = 'افزودن سؤال';
export const text_580961ea80cc: string =
  'یک سؤال تشریحی به نسخه پیش‌نویس نمونه اضافه می‌شود و سپس می‌توانید صورت و بارم آن را ویرایش کنید.';
export const text_2d2f82490e30: string = 'افزودن سؤال تشریحی';
export const text_940f3bf6347d: string = 'صورت سؤال تازه';
export const text_cb00238b0512: string = 'سؤال تازه اضافه شد.';
export const text_7661c944dc71: string = 'بازبینی انتشار';
export const text_edec234a5387: string = 'انتشار آزمون';
export const text_f05b48dd8b84: string = 'پیش‌نمایش عضو';
export const text_b25f7dd3504e: string = 'دیدن پیش‌نمایش';
export const text_ee30219a75cf: string = '○ ';
export const text_55a4c60d6645: string = 'سؤال بعدی';
export const text_48e82c70aae1: string = 'سؤال قبلی';
export const text_5d2fe4e754e4: string = 'برای آغاز تلاش از صفحهٔ شرایط آزمون وارد شوید.';
export const text_3c36b0fe899d: string = 'مرور همه پاسخ‌ها';
export const text_5e74d68b0cb2: string = 'ثبت نهایی';
export const text_90522d124187: string = 'ثبت نهایی پاسخ‌های نمونه';
export const text_ec5f7fc97149: string =
  'سؤال بی‌پاسخ است. پس از ثبت، پاسخ این تلاش ویرایش نمی‌شود.';
export const text_8fc8ae49094b: string = 'ثبت نهایی نمونه';
export const text_11203e136260: string = 'انتشار اصلاحیه';
export const text_b2b345228cd7: string = 'نمره اصلاح‌شده از ۲۰';
export const text_25a9f54e1371: string = 'علت قابل نمایش اصلاح';
export const text_7548f3907b57: string =
  'تغییرهای منتظر ارسال در شبیه‌ساز تأیید شدند؛ این تأیید سرور واقعی نیست.';
export const text_cfcf423c1a66: string = 'سابقه نتیجه';
export const text_9a45c4c0c591: string = 'سابقه';
export const text_0a00ca9a86cf: string = 'سابقه نتیجه نمونه';
export const text_414034443c02: string = 'نسخه ';
export const text_7e80472d468f: string = 'اصلاحیه‌ای در این اجرای نمونه ثبت نشده است.';
export const text_3b90dccc67d9: string = 'پاسخ';
export const text_5e29284308ae: string = 'رسید';
export const text_ad1f6ea76967: string = 'پاسخ ثبت‌شده نمونه';
export const text_7e224a5bbbbf: string = 'مرور روایت';
export const text_2fa23dc90f0f: string =
  'عضویت نمونه غیرفعال است. شروع، تحویل پاسخ و دریافت تازه فایل بسته می‌ماند.';
export const text_81dfaf6f67e4: string = 'اطلاعات این پیش‌نمایش';
export const text_1f6086865fec: string =
  'این نما با دادهٔ نمونه اجرا می‌شود. اتصال این قابلیت به سرویس مستقل، به قرارداد معتبر بک‌اند نیاز دارد.';
export const text_e873b8b4a504: string = 'در حال آماده‌سازی پیش‌نمایش…';
export const text_17ba8ad33751: string = 'اختیار آموزشی این کلاس برای این نقش فعال نیست.';
export const text_878e8ee003b3: string = 'از ۲۰';
export const text_7a4b3c8300f7: string = 'موردی با این فیلتر پیدا نشد.';
export const text_4a181c1b2123: string = 'زمان باقی‌ماندهٔ شبیه‌سازی';
export const text_2c9a24584df2: string = 'کدام جمله احساس';
export const text_68d25336ed88: string = 'پاسخ تشریحی';
export const text_db358e4e91fa: string = 'گزینه‌ها';
export const text_611f12db4095: string = 'سؤال‌ها';
export const text_fe906bfd1d45: string = ' سؤال';
export const text_29ce8189d270: string = 'تستی';
export const text_3ad6c9a535c7: string = 'پس از انتشار ارزیاب، نمره و بازخورد خودتان را می‌بینید.';
export const text_535062e13830: string = 'نسخه نتیجه';
export const text_11d03a8b42a8: string = 'نتیجه منتشرشده';
export const text_4b490ddec2c0: string = 'فقط نتیجه خودتان را می‌بینید.';
export const text_eb54241c660d: string = 'جزئیات حسی خوب';
export const text_f2a2e6b84f68: string = 'تشخیص راوی خوب';
export const text_79b4dd1f52fa: string = 'تکلیف ۰۳۸۴';
export const text_3daf367d274e: string = 'نمونه · تکلیف ۰۳۸۴';
export const text_78ed2cf2e5c5: string = 'آزمون ۰۱۲۸';
export const text_8cb0071cc206: string = 'نمونه · آزمون ۰۱۲۸';
export const text_913fe5913551: string = 'ویرایش سؤال ۳';
export const text_61592724878e: string = 'ویرایش سؤال ';
export const text_21afaeab809f: string = 'سؤال ۳ از ۵';
export const text_68681353de04: string = 'بستن اعلان';
export const text_8db71ed28b0f: string = '×';
export const text_d58d62c9bdd3: string = 'محیط پیش‌نمایش؛ نتیجه و رسید واقعی صادر نمی‌شود.';
export const text_45f2d7e2b942: string = 'تأیید نمونه';
export const text_948f45c79043: string = 'حساب و تنظیمات';
export const text_e3e34f26cc91: string = 'مخاطبان کلاس';
export const text_a15babf46309: string = 'شرایط پذیرش';
export const text_8b478db62f28: string = 'نام پیشنهادی کلاس';
export const text_8672a32afbd3: string = 'مریم رحیمی';
export const text_fd074e910b1a: string = 'امیر رضایی';
export const text_8147a634c05f: string = 'مدیر کلاس';
export const text_41d9e24090ab: string = 'هدف کلاس و شرایط پذیرش را روشن‌تر بنویسید.';
export const text_d4eb42ba5864: string = 'باشگاه کتاب‌خوانی';
export const text_85da2a98530c: string = 'دورهمی زبان انگلیسی';
export const text_36da0153744f: string = 'تمرین عکاسی';
export const text_5cc696912f59: string = 'عضو آموزشی';
export const text_1bcd4348116c: string = 'سارا احمدی؛ مدرس پیشنهادی';
export const text_cee30389ab2f: string = 'مدرس پیشنهادی درخواست';
export const text_845d1ff8c616: string = 'مدیر نهایی';
export const text_5b9f9420f7bb: string = 'مریم';
export const text_d0dbac5ab02b: string = 'سارا';
export const text_2d6bdf75139c: string = 'مدیریت';
export const text_e165f50197d6: string = 'مدیر';
export const text_950b03b98425: string = 'در بررسی';
export const text_386f881f20d5: string = 'راهنمای';
export const text_97d58681dead: string = 'یادداشت';
export const text_856c3fe1b88b: string = 'اعضای آموزشی';
export const text_df07a7e48e65: string = 'اقدام انجام نشد؛ دوباره تلاش کنید.';
export const text_29a84b4a6887: string = 'تأیید نهایی';
export const text_58370e07ac00: string = 'جستجوی حساب';
export const text_b5e5d5a53df4: string = 'فیلدهای مشخص‌شده را اصلاح کنید.';
export const text_496693194265: string = 'اطلاعات کامل نیست.';
export const text_908693ff0cba: string = 'بررسی درخواست';
export const text_2903d08bf9ed: string = 'اعتبار دعوت';
export const text_52707c485336: string = 'تاریخ پایان دعوت';
export const text_74e03945b745: string = 'تاریخ آینده را انتخاب کنید.';
export const text_5d287e2ca678: string = 'کپی پاسخ';
export const text_7306b3732b3f: string = 'متن پاسخ نمونه کپی شد.';
export const text_9aadf79d9911: string = 'اجازهٔ کپی متن در دسترس نیست.';
export const text_a5397936e6a5: string = 'پاسخ مفید بود';
export const text_b26114122a10: string = 'پاسخ مفید نبود';
export const text_450ac63d84ba: string = 'بازخورد «';
export const text_78f643400081: string = '» در همین پیش‌نمایش نگهداری شد.';
export const text_188f29c36f33: string = 'فایل نمونه';
export const text_656db61b9edb: string = 'نام فایل انتخاب شد؛ فایل برای مخاطب واقعی بارگذاری نشد.';
export const text_4d5f8ee3b0dd: string = 'فایل از پاسخ نمونه برداشته شود؟';
export const text_7fbb6bd07898: string = 'پیوست از پیش‌نویس نمونه برداشته شد.';
export const text_c2d9391c4882: string = 'برداشتن پیوست';
export const text_3f5f607ce17d: string = 'گزینه‌های ';
export const text_57a7edee4ab6: string = 'آفتاب';
export const text_b39af5968a34: string = 'آموزشگاه آفتاب · نقش این نما حفظ می‌شود.';
export const text_fda75c7fcbfd: string = 'ریاضی دهم · درس‌ها';
export const text_1f55b6fe9e80: string = 'تمرین فصل دوم · پاسخ تکلیف';
export const text_0ea5b13c7e30: string = 'گزینه‌های این صفحه';
export const text_bb901d4e7cf8: string = 'حساب آزمایشی فعال: ';
export const text_9ecb99fc4c1c: string = 'پیش‌نویس در همین پیش‌نمایش حفظ شد.';
export const text_07caec0791ec: string = 'نگهداری پیش‌نویس';
export const text_cf80869f96ed: string = 'درخواست‌های من';
export const text_2fe2190d8013: string = 'پایان فعالیت نمونه';
export const text_6e56c9cbe921: string =
  'نوشتن و پذیرش عضو تازه متوقف می‌شود. سوابق مجاز باقی می‌مانند.';
export const text_fc54123421eb: string = 'ویرایش اطلاعات کلاس';
export const text_80d8dab3abe6: string = 'لغو درخواست تشکیل';
export const text_e24ca11d2595: string = 'درخواست آزمایشی لغو شد. کلاس فعال ایجاد نشد.';
export const text_f9b69a2dc866: string = 'دریافت نتیجهٔ آماده‌سازی نمونه';
export const text_9594cb09133d: string = 'بررسی با نقش ناظر آزمایشی';
export const text_396b98c02bdc: string = 'بررسی حالت‌های تکمیلی';
export const text_a422d5b6b9b0: string = 'دعوت منقضی';
export const text_2a09e0db479e: string = 'دعوت لغوشده';
export const text_fcfaf8ccf8c2: string = 'ظرفیت پر';
export const text_76143a7eab5d: string = 'مدیر جایگزین';
export const text_f84e6a3fa4b4: string = 'درخواست ردشده';
export const text_908814aad59f: string = 'درخواست لغوشده';
export const text_b6614fc83c35: string = 'عضویت ردشده';
export const text_34072bc8ad16: string = 'عضویت منصرف‌شده';
export const text_fa101e1ad831: string = 'نبود مجوز';
export const text_610b53df0b74: string = 'نشست منقضی';
export const text_51bded068d4c: string = 'خطای دریافت';
export const text_fd16bfe160a5: string =
  'اکنون مسئولیت را با حساب آزمایشی مدیر جایگزین بررسی می‌کنید.';
export const text_3193fed58b5c: string = 'ورود با حساب آزمایشی مدیر جایگزین';
export const text_395338f44634: string = 'مسئولیت مدیر در پیش‌نمایش پذیرفته شد.';
export const text_250adf95a4ab: string = 'پذیرش مسئولیت پیشنهادی';
export const text_3bf406fbc43a: string = 'گفتگوی تازه';
export const text_b4058f1b5351: string = 'این بخش از دادهٔ آزمایشی استفاده می‌کند.';
export const text_e4898b116639: string = 'انتخاب مخاطب';
export const text_fdaebb3b9d21: string = 'مشاهده درخواست در حال بررسی';
export const text_c586ff3f1981: string =
  'برنامهٔ روز انتخاب‌شده: جلسهٔ تازه‌ای در دادهٔ نمونه ثبت نشده است.';
export const text_8fb4d0da9a42: string = 'در انتظار · ۳';
export const text_d9f42fd33f34: string = 'دریافت کد';
export const text_efdbc7968390: string = 'شماره همراه ۱۱ رقمی معتبر وارد کنید.';
export const text_21f35c8e09bf: string = 'کد شش‌رقمی را کامل وارد کنید.';
export const text_f910f3eee6bb: string = 'ارسال';
export const text_834b718ff95f: string = 'درخواست تشکیل';
export const text_da035ca05d49: string = 'اصلاح درخواست';
export const text_bae5e3be9b88: string = 'اصلاح و ارسال';
export const text_e0cbc2b21183: string = 'اطلاعات قبلی';
export const text_fb54b25f3f34: string = 'بازگشت به فوق';
export const text_f9feffa083c7: string = 'مشاهده جزئیات درخواست';
export const text_6ac36fca17a2: string = 'جزئیات درخواست تشکیل';
export const text_97b66c63c4b7: string = 'شمارهٔ ثابت درخواست: ';
export const text_e122efb49936: string = 'پس از تصمیم ناظر، نتیجه در همین درخواست ثبت می‌شود.';
export const text_4339b65f77f5: string = 'درخواست‌های تشکیل';
export const text_6cc35c20b549: string = 'درخواست‌ها';
export const text_a999d2a5f36d: string = 'بازگشت به درخواست';
export const text_11cc456c93be: string = 'دعوت عضو';
export const text_05720edd09fb: string = 'ارسال دعوت';
export const text_7efeea5e22a2: string = 'حساب مورد نظر را جستجو و انتخاب کنید.';
export const text_29accaf76dbd: string = 'ارسال دعوت کلاس';
export const text_d2c2b7c7f4c1: string = 'پیام دعوت';
export const text_9a182eb0b238: string = 'دعوت در انتظار پاسخ';
export const text_d957d424f8a2: string = 'دعوت برای «';
export const text_f9d82c6084b2: string = '» فقط در پیش‌نمایش ثبت شد. عضویت هنوز برقرار نشده است.';
export const text_dcead88c087c: string = 'بررسی با حساب آزمایشی دعوت‌شده';
export const text_049f94a440db: string = 'پذیرش';
export const text_c6bc7acce0ac: string = 'قواعد عضویت را بازبینی و تأیید کنید.';
export const text_0c55bf26c8f8: string = 'دعوت در پیش‌نمایش پذیرفته شد.';
export const text_3445ecae3d02: string = 'دعوت در پیش‌نمایش رد شد.';
export const text_3aceba34bd54: string = 'ارسال درخواست';
export const text_55b110e71f95: string = 'قواعد درخواست عضویت را تأیید کنید.';
export const text_ef5efcca20f2: string = 'درخواست عضویت در انتظار';
export const text_b3ea477f3365: string =
  'تا تصمیم مدیر، دسترسی به گروه، کانال و فایل‌ها برقرار نمی‌شود.';
export const text_559f305cf223: string = 'درخواست عضویت در پیش‌نمایش منصرف شد.';
export const text_3db45b046339: string = 'انصراف از درخواست';
export const text_17f7016ec3a0: string = 'رد درخواست';
export const text_eee8c44a7424: string = 'بررسی نمونه';
export const text_3041aa53b155: string = 'تصمیم عضویت در پیش‌نمایش ثبت شد.';
export const text_b4861537aac8: string = 'تأیید و آماده‌سازی';
export const text_a58310e67d4b: string = 'درخواست اصلاح';
export const text_67c2ebd31ebe: string = 'پیام قابل نمایش';
export const text_54cbdf185fe9: string = 'بازبینی نهایی تصمیم';
export const text_7877e4e7761f: string =
  'این تصمیم صرفاً در دادهٔ آزمایشی ثبت می‌شود. سرویس مالک این کلاینت نیست.';
export const text_7735e78fb13b: string = 'شروع مدیریت کلاس';
export const text_4439b16b9c90: string = 'پذیرش مسئولیت مدیریت';
export const text_8938550ea763: string =
  'مسئولیت در پیش‌نمایش پذیرفته شد؛ اکنون آمادهٔ شروع هستید.';
export const text_8d7e2bbd83fa: string = 'فقط حساب مدیر تعیین‌شده می‌تواند مسئولیت را بپذیرد.';
export const text_2a19e9b9963b: string = 'پیش از شروع، قواعد کلاس را بازبینی کنید.';
export const text_de297c4dbab1: string = 'هر دو فضای وابسته و مسئولیت مدیر را بازبینی کرده‌اید.';
export const text_0da1a8c67599: string = 'بازکردن گروه کلاس';
export const text_92270a0ed8ef: string = 'عضویت فعال این حساب برای ورود به گروه لازم است.';
export const text_9c4951dde39f: string = 'عضویت فعال این حساب برای ورود به کانال لازم است.';
export const text_8fa7aa90f55a: string = 'مشاهده اعضا';
export const text_912b977de5c5: string = 'قواعد کلاس';
export const text_619e2e1b60d3: string = 'قواعد و اطلاعات';
export const text_1973f701ecea: string = 'فضاهای همین';
export const text_a77ab70e230c: string = 'کارگاه';
export const text_3558e4dc3b32: string = 'ذخیره اطلاعات';
export const text_22c12e862be8: string =
  'اطلاعات محلی عضو در پیش‌نمایش ذخیره شد؛ هویت مرکزی تغییر نکرد.';
export const text_527d96731d9c: string = 'پایان عضویت';
export const text_4762b601ff6f: string = 'خروج از کلاس';
export const text_a99e23c0ede7: string = 'پایان عضویت نمونه';
export const text_fbf967f76a57: string = 'عضویت در پیش‌نمایش پایان یافت.';
export const text_834f101a5d46: string = 'پایان عضویت کلاس';
export const text_a60abb0f35cb: string =
  'دسترسی تازه به گروه، کانال و فایل‌های همین کلاس باید هم‌زمان پایان یابد.';
export const text_ec9d1edb4e75: string = 'اطلاعات حساب نمونه';
export const text_e4f52d9f9441: string = 'سارا احمدی · sara.ahmadi';
export const text_82412d223c0f: string = 'ویرایش هویت واقعی از پروفایل متصل انجام می‌شود.';
export const text_e0cf9df9d9b9: string = 'فضاها و نقش';
export const text_9258221d3011: string = 'آموزشگاه آفتاب · دانش‌آموز';
export const text_54ebe43679b6: string = 'کلاس مستقل · مدیر';
export const text_8152013c316a: string = 'حساب بدون آموزشگاه';
export const text_82816677af56: string = 'بازگشت به منابع';
export const text_343001b0489f: string = 'ظاهر و اعلان';
export const text_b3383e10a68d: string = 'ظاهر پیش‌نمایش تغییر کرد.';
export const text_7cf593010df3: string = 'امنیت و نشست‌ها';
export const text_b78a1a6a8451: string = 'نشست';
export const text_1fae3b3594a2: string = 'مرورگر رایانه';
export const text_57a589c9fcdc: string = 'گوشی قبلی';
export const text_6eb3421f995b: string = 'پایان نشست‌های نمونه';
export const text_128658239154: string =
  'نشست‌های انتخاب‌شده فقط در پیش‌نمایش پایان یافتند. نشست واقعی تغییر نکرد.';
export const text_dcf1e9a7abba: string = 'نشست فعلی فعال می‌ماند.';
export const text_d7ef164dd6b8: string = 'حساب‌های مسدود';
export const text_eae6e5195be0: string =
  'فهرست نمونه: حساب اول و حساب دوم. فهرست واقعی فقط از سرویس حساب دریافت می‌شود.';
export const text_5f65ccdf701b: string = 'ذخیره تنظیمات';
export const text_a2af9c4ab7db: string = 'ذخیره تغییرات';
export const text_6d4ada662964: string =
  'نسخهٔ تازه دریافت شده است؛ متن شما برای بازبینی حفظ شده است.';
export const text_c3452380ec9a: string = 'تنظیمات در همین پیش‌نمایش ذخیره شدند.';
export const text_2d5d767e34ab: string = 'استفاده از';
export const text_10cde02b2da4: string = 'دست‌کم یک منبع آماده انتخاب کنید.';
export const text_9acb7e5003e7: string = 'این منبع هنوز برای دستیار آماده نیست؛ انتخاب نشد.';
export const text_08b5244a1633: string = 'منابع ';
export const text_b91e0fdb4d20: string = ' در همین محدوده نمایش داده می‌شوند.';
export const text_d08330d29e1f: string = 'پیش از ارسال، متن بنویسید.';
export const text_dcba734f9836: string = 'پیام فقط در گفتگوی نمونه ثبت شد.';
export const text_dd7716f243c0: string = 'پاسخ به پیام انتخاب‌شده';
export const text_557e37b5eb3b: string = 'ممنون، فایل را دریافت کردم.';
export const text_fbe358fbc43d: string = 'متن کپی شد.';
export const text_d9e90113e5c6: string = 'دسترسی کپی در این مرورگر فراهم نیست.';
export const text_eb738f9c4868: string = 'انتخاب گفتگوی مقصد';
export const text_2b22adfc679e: string = 'بازفرستادن فقط در گفتگوی نمونه انجام شد.';
export const text_d3fb230de921: string = 'کارگاه داستان‌نویسی · نمونه';
export const text_0a6f0bcc8f7a: string = 'مریم رضایی · نمونه';
export const text_292e8d046820: string = ' فقط در دادهٔ آزمایشی ثبت شد.';
export const text_a9eaeafc1942: string =
  'این اقدام در گفتگوی نمونه انجام می‌شود؛ برای استفادهٔ واقعی، گفتگوی متصل را باز کنید.';
export const text_79021bcbc3e9: string = 'یادداشت‌های هفته دوم';
export const text_c33fc243e737: string = 'دیدن تغییرات تازه';
export const text_445fa1a87aa7: string = 'بازبینی تغییرات تازه';
export const text_26d21991a70b: string =
  'نسخهٔ تازه: هدف کلاس و شرایط پذیرش به‌روز شده‌اند. متن واردشدهٔ شما حفظ شده و پیش از ذخیره باید مقایسه شود.';
export const text_e7df3741466b: string = 'نام فعلی: ';
export const text_8b437a6e118d: string = ' · ظرفیت فعلی:';
export const text_347ff0c553c2: string = 'ادامه با نوشتهٔ حفظ‌شده';
export const text_19aa3b256f52: string = 'بازگشت به ویرایش';
export const text_f012657cc1b9: string = 'رفتن به فوق';
export const text_e5dbd74f8f72: string = 'پاسخ‌های منتظر ارزیابی';
export const text_26a454da5b8d: string = 'نتیجه‌های منتشرشده';
export const text_1bddb7967eab: string = 'رفتن به تکلیف';
export const text_affbc3022ea5: string = 'تمرین فصل';
export const text_6c1cc803e034: string = 'بازبینی و ارسال';
export const text_f7f0c2c5249c: string =
  'پاسخ فقط در دادهٔ آزمایشی ثبت شد. رسید واقعی سرویس ایجاد نشده است.';
export const text_ede7a5a64c4b: string = 'پیش از ثبت، متن پاسخ و فایل انتخاب‌شده را مرور کنید.';
export const text_26cd5413b68a: string = 'یک پاسخ انتخاب کنید.';
export const text_44c6965aa44f: string =
  'آزمون مستقل در دامنهٔ مصوب محصول است؛ این اجرا پیش‌نمایش است و نتیجهٔ واقعی صادر نشد.';
export const text_23a983d43570: string = 'گزینهٔ انتخاب‌شده حفظ شده است.';
export const text_92a933f37183: string = 'جزوه';
export const text_53bf8fef7c70: string = 'روایت';
export const text_5135a6addb95: string = 'دوشنبه ۱۱ آبان · معادلهٔ درجه دوم · ساعت ۱۶:۰۰';
export const text_04e1ff0aaf2d: string =
  'برنامهٔ هفته با زمینهٔ آموزشگاه انتخاب‌شده نمایش داده می‌شود.';
export const text_355328c613fa: string = 'مسئولیت مدیریت';
export const text_3c9ece5ae8bd: string = 'مدرس و مسئولیت مدیریت';
export const text_8d2741d1bcc7: string =
  'مدرس اختیاری است. انتقال مدیریت به پذیرش مسئولیت و قرارداد مصوب نیاز دارد.';
export const text_5127aa358283: string = 'مسئولیت مدیریت در پیش‌نمایش پذیرفته شد.';
export const text_bd076adea788: string = 'بازکردن فایل';
export const text_de32eb7bf53f: string = 'فایل‌های مشترک';
export const text_cb6d3ed3b868: string =
  'این فایل بخشی از دادهٔ نمایشی است. فایل واقعی، فقط پس از بررسی مجوز و دریافت معتبر سرویس باز می‌شود.';
export const text_9b2ba45fbd35: string = 'پیگیری';
export const text_7d7e2a7bf517: string = 'سوابق';
export const text_f0f1f9bfe08a: string = 'سابقهٔ مجاز';
export const text_e7e0f393d418: string = 'درخواست ارسال شد';
export const text_2078be43559b: string = 'همه نقش‌ها';
export const text_08902bd2fe52: string = 'فیلتر نقش اعضا';
export const text_8740f76bc170: string = 'امنیت';
export const text_02bf59a552aa: string =
  'اطلاعات این نما آزمایشی است. عملیات سرویس واقعی از مسیر متصل و با مجوز حساب انجام می‌شود.';
export const text_77a0998859ae: string = 'صف رسیدگی';
export const text_7986fabd302c: string = 'شماره یا عنوان درخواست';
export const text_0faa9b90eaaa: string = 'نتیجهٔ جستجو';
export const text_35870749f48e: string = 'حسابی پیدا نشد. نام یا شناسهٔ نمونه را تغییر دهید.';
export const text_3ad433adb9b3: string = 'عبارت یا فیلتر را تغییر دهید.';
export const text_a7950e65087d: string = 'پاک‌کردن جستجو و فیلتر';
export const text_84532713934e: string = 'درخواستی با این وضعیت نیست';
export const text_136ccbbd71bd: string = 'عضوی با این فیلتر نیست';
export const text_da0be651e135: string = 'منصرف‌شده';
export const text_fd3f49ffc9dc: string = 'پذیرش درخواست عضویت';
export const text_6f7511ffc62c: string = 'رد درخواست عضویت';
export const text_fd08411d8550: string = 'شرایط پذیرش تأیید نشد.';
export const text_b7846dc8654f: string =
  'درخواست در همین پیش‌نمایش ثبت شده و نتیجهٔ سرویس واقعی نیست.';
export const text_9155c5e6b769: string = 'شمارهٔ ثابت درخواست';
export const text_c269c060f0fe: string = 'دسترسی به این بخش مجاز نیست';
export const text_1f545b985edb: string =
  'عضویت و نقش همین کلاس لازم است. درخواست‌دهنده با تغییر مدیر، خودکار عضو نمی‌شود.';
export const text_56762f9181a4: string = 'بررسی درخواست به نقش ناظر مجاز نیاز دارد';
export const text_f5f09b132f2c: string = 'نشست شما پایان یافته است';
export const text_b5903289942f: string = 'در حال دریافت اطلاعات…';
export const text_386472a75f51: string = 'دریافت اطلاعات کامل نشد';
export const text_14a21f2cbbb9: string = 'نقش و عضویت همین کلاس بررسی می‌شود.';
export const text_ed38a7af81fd: string = 'پس از ورود، به همین مسیر برمی‌گردید.';
export const text_430cbe15c000: string = 'نوشته‌ها و انتخاب قبلی شما حفظ می‌شوند.';
export const text_bbb8499c21d0: string = 'ورود دوباره';
export const text_addbcaad4083: string = 'بازگشت به نمای مجاز';
export const text_726393748959: string = 'ثبت آزمایشی';
export const text_7f31a6d770e7: string = 'مریم رضایی؛ مدیر جایگزین';
export const text_a137380f1863: string = '۱ منبع انتخاب شده';
export const text_971dbc610645: string = ' منبع انتخاب شده';
export const text_83914de105c0: string = 'استفاده از ۱ منبع';
export const text_78c58d392054: string = 'پایان عضویت نازنین؟';
export const text_593bbf27498e: string = 'حساب انتخاب‌نشده';
export const text_f149482b996c: string = 'تا ۱۸ آبان';
export const text_858e81d8ef0c: string =
  'کلاس فعال بدون مدیر مسئول باقی نمی‌ماند؛ پایان این عضویت به انتقال مسئولیت معتبر نیاز دارد.';
export const text_415b2ead34f0: string = 'مهلت دعوت تمام شده است.';
export const text_41bc13de4e46: string = 'این دعوت لغو شده است.';
export const text_8ec748c11fb5: string = 'ظرفیت کلاس تکمیل شده است؛ عضویت تازه ثبت نمی‌شود.';
export const text_c8222959ba67: string =
  'مسئولیت مدیر جایگزین هنوز پذیرفته نشده است؛ حساب درخواست‌دهنده مجوز ورود ندارد.';
export const text_ec7914714ab8: string = 'درخواست عضویت رد شده است.';
export const text_70c3863d5d86: string = 'کاربر از درخواست عضویت منصرف شده است.';
export const text_d3a21a3fb53c: string = 'محیط پیش‌نمایش · اطلاعات و نتیجه‌ها آزمایشی‌اند.';
export const text_e89b98bf26d3: string = 'موضوع';
export const text_5da1817f268d: string = 'پیام شخصی';
export const text_82a7c2d66b3c: string = 'فقط مخاطبان';
export const text_1bd8c8b192af: string = 'دعوت به گفتگو';
export const text_2c5c76628714: string = 'مخاطبان من';
export const text_e80b72884577: string = 'با تأیید من';
export const text_a2877af27f5c: string = 'بازبینی اقدام';
export const text_b3686a576a60: string = 'پیام؛ گزینه‌ها با Shift+F10';
export const text_3a711b658e49: string = 'پیش‌نمایش · دادهٔ آزمایشی';
export const text_36172ff32759: string = 'اطلاعات واردشده معتبر نیست. فیلدها را بررسی کنید.';
export const text_d6873a3168c7: string = 'نشست شما پایان یافته است. دوباره وارد شوید.';
export const text_64e99494313b: string = 'اجازه انجام این کار را ندارید.';
export const text_14c150312619: string = 'این مورد در دسترس نیست.';
export const text_3caa4f5c26f5: string =
  'وضعیت تغییر کرده یا با این اقدام تعارض دارد. اطلاعات تازه را بررسی کنید.';
export const text_1e5a2b09970f: string = 'این دعوت یا منبع پایان یافته است.';
export const text_38dd8a208dd7: string =
  'اطلاعات توسط کاربر دیگری تغییر کرده است. نسخه تازه را بررسی کنید.';
export const text_f5d382890abb: string =
  'حجم فایل از حد مجاز سرویس بیشتر است. فایل کوچک‌تری انتخاب کنید.';
export const text_a68f5b3bd878: string = 'این نوع فایل توسط سرویس پذیرفته نمی‌شود.';
export const text_a3d642be9271: string = 'این اقدام با سیاست‌های سامانه سازگار نیست.';
export const text_0a8d14abd16d: string = 'درخواست‌ها بیش از حد مجاز است. کمی صبر کنید.';
export const text_8479f8b715fa: string = 'ارتباط با سرویس برقرار نشد.';
export const text_02ed709e8539: string = 'سرویس موقتاً در دسترس نیست.';
export const text_9f4ad9f85b6e: string =
  'زمان پاسخ‌گویی تمام شد. پیش از تکرار اقدام، نتیجه را بررسی کنید.';
export const text_f44e9116c700: string = 'دریافت فایل کامل نشد. دوباره تلاش کنید.';
export const text_38ffcfa94bb6: string =
  'انتقال فایل انجام نشد. اتصال را بررسی کنید و دوباره تلاش کنید.';
export const text_82e1bd88c000: string =
  'سرویس ارسال کد ورود موقتاً در دسترس نیست. کمی بعد دوباره «دریافت کد ورود» را بزنید.';
export const text_5eb66690dcf3: string =
  'پاسخ سرویس ارسال کد ورود طول کشید. اگر کدی دریافت نکردید، کمی بعد دوباره درخواست بدهید.';
export const text_ea981a3518df: string =
  'پاسخ سرویس ارسال کد ورود قابل پردازش نیست. کد پیگیری را برای پشتیبانی بفرستید.';
export const text_af6c1c6896ae: string =
  'پاسخ سرویس قابل پردازش نیست. کد پیگیری را برای پشتیبانی بفرستید.';
export const text_d5acb6312ff1: string =
  'ارتباط پنل با سرویس اصلی موقتاً قطع است. کمی بعد دوباره تلاش کنید.';
export const text_ad5229f8ee19: string =
  'ارتباط مرورگر با پنل قطع شده است. اتصال را بررسی و دوباره تلاش کنید.';
export const text_e072ddab3385: string = 'فایل هنوز آماده نیست؛ دوباره وضعیت آن را بررسی کنید.';
export const text_ba991e0be96f: string = 'عکس هنوز آماده نشده است. کمی بعد دوباره بررسی کنید.';
export const text_c15951f9823d: string =
  'استفاده از محتوای منابع در دستیار هنوز روی سرور فعال نشده است. منابع انتخاب‌شده حفظ شدند.';
export const text_dcb6f8b3c5b3: string = 'این پیام با سیاست ایمنی سازگار نیست و ارسال نشده است.';
export const text_c77ef153369e: string =
  'بررسی ایمنی پیام فعلاً در دسترس نیست؛ پیام ارسال‌شده محسوب نمی‌شود.';
export const text_aef30a79f03c: string = 'برای عکس گفتگو فقط JPEG یا PNG انتخاب کنید.';
export const text_aa05f1e891b4: string =
  'عضویت این مخاطب به دعوت و پذیرش او نیاز دارد؛ افزودن مستقیم انجام نشد. این مخاطب را از اعضای اولیه بردارید.';
export const text_1ac55254f9c7: string = 'فایل خالی است؛ فایل دیگری انتخاب کنید.';
export const text_104fba439e99: string =
  'این مخاطب در حال حاضر برای شروع گفت‌وگو در دسترس نیست. مخاطب دیگری را انتخاب کنید یا وضعیت ارتباطی حساب‌ها را از پشتیبانی پیگیری کنید.';
export const text_fe721ecda2f5: string =
  'این گفتگو در حساب یا فضای فعلی در دسترس نیست. به فهرست پیام‌ها برگردید و گفتگو را دوباره انتخاب کنید.';
export const text_139ca31a21fe: string = 'برای عکس پروفایل فقط فایل JPEG یا PNG انتخاب کنید.';
export const text_bb5e08a5ebf0: string =
  'اطلاعات پروفایل معتبر نیست. تاریخ تولد و فیلدهای مشخص‌شده را بررسی کنید.';
export const text_7766da227ecc: string =
  'برای این فعالیت، آموزشگاه و نقش آموزشی خود را از انتخاب فضای کار مشخص کنید.';
export const text_54346a917424: string =
  'این پیام برای ارسال به بررسی ایمنی نیاز دارد. برای پیگیری با پشتیبانی تماس بگیرید.';
export const text_2d40431bc2c6: string =
  'سرویس این قالب فایل را نمی‌پذیرد. فایل دیگری انتخاب کنید.';
export const text_0f076f363d5b: string = 'برای این پیوست، از انتخاب فضای کار به فضای شخصی بروید.';
export const text_2b19b226827a: string =
  'نشانی صفحه ورود با تنظیمات پنل یکسان نیست. صفحه را از نشانی اصلی پنل باز کنید.';
export const text_d10610563eab: string = 'دریافت اطلاعات با مشکل روبه‌رو شد.';
export const text_050985dab36b: string =
  'پاسخ سرویس ورود طول کشید. کمی بعد دوباره تلاش کنید؛ درخواست خودکار تکرار نشد.';
export const text_e0490943e820: string =
  'ورود فعلاً ممکن نیست. سرویس ورود در دسترس نیست؛ کمی بعد دوباره تلاش کنید.';
export const text_4a9646071ab5: string =
  'دریافت کد ورود فعلاً ممکن نیست. سرویس ورود در دسترس نیست؛ کمی بعد دوباره تلاش کنید.';
export const text_4d331365b93f: string =
  'ورود به‌دلیل خطای سرویس انجام نشد. کمی بعد دوباره تلاش کنید؛ اگر ادامه داشت، کد پیگیری را به پشتیبانی بدهید.';
export const text_586075f939b9: string =
  'سرویس دریافت کد ورود با خطا مواجه شد. کمی بعد دوباره تلاش کنید؛ اگر ادامه داشت، کد پیگیری را به پشتیبانی بدهید.';
export const text_5d42ae33c835: string = 'شماره همراه باید ۱۱ رقم باشد و با ۰۹ شروع شود.';
export const text_551172e4a77d: string = 'کد ورود باید دقیقاً ۶ رقم باشد.';
export const text_58959f75f51a: string = 'ارسال پیوست برای این سؤال مجاز نیست.';
export const text_cc3962f50c27: string = 'فایل خالی است.';
export const text_cc55eba1583f: string = 'این نوع فایل برای سؤال مجاز نیست.';
export const text_3526235fe98e: string = 'تعداد پیوست‌ها به سقف سؤال رسیده است.';
export const text_1212e6c5e2b8: string = 'حجم پیوست‌ها از سقف این سؤال بیشتر است.';
export const text_e4927b65d3f9: string = 'تاریخ نامعتبر';
export const text_e30d72bc4478: string = 'ریال';
export const text_cdc6e8cc2a3a: string = 'واحد نامشخص';
export const format_93ede2303df6 = (value0: unknown, value1: unknown) => `${value0} ${value1}`;
export const text_c1680ce3f338: string = 'تاریخ انتخاب‌شده پیش از شروع بازهٔ مجاز است.';
export const text_4ad57c605a1b: string = 'تاریخ انتخاب‌شده پس از پایان بازهٔ مجاز است.';
export const text_b7009556ce7f: string = 'عکس JPG، PNG، WebP یا فایل PDF انتخاب کنید.';
export const text_9ce0571cc385: string = 'شروع آشنا';
export const text_9757066529c9: string = 'ارزش محصول با سه کار واقعی؛ یک اقدام اصلی.';
export const text_e4edd014da62: string = 'آموزشگاه، کلاس‌های مستقل و گفتگوها؛ همه در ماکان.';
export const text_7ac74b79eaab: string = 'برنامه‌تان را پیدا کنیدکلاس و کارهای نزدیک، در یک نگاه';
export const text_9561aa5b11b0: string = 'کلاس و کارهای نزدیک، در یک نگاه';
export const text_f87ad37f0605: string = 'کلاس خودتان را بسازیددرخواست دهید و مدیریت کنید';
export const text_87721ba89db6: string = 'درخواست دهید و مدیریت کنید';
export const text_06e8cdd49013: string = 'در ارتباط بمانیدگروه، کانال و پیام‌های شخصی';
export const text_b76881edda77: string = 'گروه، کانال و پیام‌های شخصی';
export const text_ce6a15857208: string = 'ادامه با شماره همراه؛ اطلاعات شما عمومی نمی‌شود.';
export const text_b788f2ef91e8: string = 'ورود یا ساخت حساب';
export const text_58107c89b65e: string = 'برچسب ثابت، شماره قابل ویرایش و توضیح روشن.';
export const text_57d797a7d45f: string = 'ورود و ثبت‌نام';
export const text_b8a3345390e5: string = '۰۹۱۲ ۱۲۳ ۴۵۶۷';
export const text_92add93e0bb2: string =
  'ادامه به معنی پذیرش شرایط استفاده و سیاست حریم خصوصی است.';
export const text_9bb993591f2e: string = 'تأیید کد';
export const text_7cdf6884e6a9: string = 'پشتیبانی طراحی از تکمیل خودکار و چسباندن کد.';
export const text_fd5b12c48e55: string = 'کد تأیید را وارد کنید';
export const text_8bd648eb1b91: string = 'پیامک به ۰۹۱۲ ۱۲۳ ۴۵۶۷';
export const text_410f97c9aa4e: string = 'کد پیامک‌شده را وارد کنید.';
export const text_a870a5f1abac: string = '۴۷۱۹|';
export const text_d6897876788c: string = '۴';
export const text_6cb53cda3aea: string = '۷';
export const text_662756ac0f18: string = '۹';
export const text_c44c20acca46: string = 'ارسال دوباره تا ۰۰:۴۲';
export const text_edf1c5e3751f: string =
  'کد را برای هیچ‌کس ارسال نکنید. ماکان هرگز آن را در گفتگو نمی‌خواهد.';
export const text_64c1e85ec50d: string = 'امروز من';
export const text_2ec4fdbe4853: string = 'نمای دانش‌آموز با برنامه نزدیک و کارهای باقی‌مانده.';
export const text_861183a44bf3: string = 'س';
export const text_da039e69bcd8: string = 'دوشنبه، ۱۱ آبان';
export const text_7d5f12baabea: string = 'سلام سارا';
export const text_d7ad74eb16a4: string = 'آفتاب ';
export const text_05ba92c0a559: string = 'ش۹';
export const text_119c5451ad7c: string = 'ش';
export const text_fa3e2f674027: string = 'ی۱۰';
export const text_cd7adc0ba48e: string = '۱۰';
export const text_8ae5762d3466: string = 'د۱۱';
export const text_b15aa8e25edd: string = 'د';
export const text_0338a8fdd8c9: string = '۱۱';
export const text_0d66e326c322: string = 'س۱۲';
export const text_cff5fead8492: string = '۱۲';
export const text_a1ab46498cd3: string = 'چ۱۳';
export const text_154ec3b687a9: string = 'چ';
export const text_88a8f55cc26d: string = '۱۳';
export const text_453e2b049d45: string = 'پ۱۴';
export const text_7078edd9b178: string = 'پ';
export const text_047d4c7b62e7: string = '۱۴';
export const text_1cd21a4028f5: string = 'ج۱۵';
export const text_51c9a584ad13: string = 'ج';
export const text_60f4a02d3ff1: string = '۱۵';
export const text_cac0d89a3dd1: string = 'جلسه بعدی';
export const text_b3ce77aff65d: string = '۱۶:۰۰';
export const text_69de2a825bf1: string = '۶۰ دقیقه';
export const text_013233c34188: string = 'معادله‌های درجه دوم';
export const text_b5e8a7fe9b5c: string = 'ریاضی دهم · مریم رضایی';
export const text_d061318ae4d8: string = 'تمرین فصل دومتا امشب ساعت ۲۳:۵۹باقی مانده';
export const text_241b0749313a: string = 'تمرین فصل دوم';
export const text_6e3533d103f2: string = 'تا امشب ساعت ۲۳:۵۹';
export const text_5ef0a3e33ab7: string = 'جزوه جلسه چهارمبرای مطالعه در دسترس است';
export const text_06a72ba0528e: string = 'جزوه جلسه چهارم';
export const text_2f6b2b458df5: string = 'برای مطالعه در دسترس است';
export const text_34f21bf83d71: string = 'شما در ۲ کلاس فوق‌برنامه هم عضو هستید.';
export const text_c0d4475eb90c: string = 'ناوبری اصلی';
export const text_be0e0b2b86e0: string = 'مطالعه یک درس';
export const text_427c4f0bbbdf: string = 'متن خوانا، فرمول با جهت صحیح و پیوست مستقل.';
export const text_7a5a71c36785: string = 'معادله درجه دوم';
export const text_cd4134f96c39: string = 'ریاضی دهم · درس ۴';
export const text_db9ffbf8d966: string = 'منتشرشده · مریم رضایی';
export const text_641def48d239: string = 'از یک مسئله،';
export const text_ce397e1cc2ac: string = 'تا دو پاسخ ممکن';
export const text_630350583a6d: string =
  'در این درس یاد می‌گیریم معادله را به شکل استاندارد بنویسیم و با روش تجزیه حل کنیم.';
export const text_a5f99c05c4ec: string = 'دو عددی را پیدا کنید که جمعشان ۵ و حاصل‌ضربشان ۶ باشد.';
export const text_4f272456ac90: string = 'جزوه درس چهارم.pdfPDF · ۸ صفحه · ۱٫۲ مگابایت';
export const text_7731a5e96f82: string = 'جزوه درس چهارم.pdf';
export const text_695d39476122: string = 'PDF · ۸ صفحه · ۱٫۲ مگابایت';
export const text_7039150103b6: string = 'تمرین حل‌شده.pdfPDF · ۳ صفحه';
export const text_8b4bac1899ac: string = 'تمرین حل‌شده.pdf';
export const text_1c16f11f6d64: string = 'PDF · ۳ صفحه';
export const text_935f7ed25cc9: string = 'برای پرسیدن سؤال، وارد گروه همین کلاس شوید.';
export const text_8f4216de9bfb: string = 'رفتن به تکلیف این درس';
export const text_6e2352c8e75a: string = 'پاسخ به تکلیف';
export const text_27f609be3a80: string = 'بازبینی پاسخ و فایل قبل از ثبت؛ رسید بعد از ارسال.';
export const text_7f551eafe27c: string = 'ریاضی دهم · پاسخ من';
export const text_e85d771032db: string = 'تا امشب ۲۳:۵۹';
export const text_9f655ec949aa: string = 'حل ۵ مسئله از صفحه ۴۲';
export const text_e8c1e26ddd19: string =
  'راه‌حل کامل را بنویسید و تصویر یا فایل پاسخ را پیوست کنید.';
export const text_aff5aa942929: string = 'توضیح پاسخ';
export const text_a08e8ecc000a: string = 'مسئله‌های ۱ تا ۵ را با روش تجزیه حل کردم.';
export const text_810dfb9cb221: string = 'پاسخ تمرین سارا.pdfPDF · ۱٫۸ مگابایت';
export const text_4dad229a6bc2: string = 'پاسخ تمرین سارا.pdf';
export const text_8a8224a2aa36: string = 'PDF · ۱٫۸ مگابایت';
export const text_f490c064f0e8: string = 'افزودن فایل دیگرپیش از ارسال، فایل را بازبینی کنید.';
export const text_326eb92653b6: string = 'افزودن فایل دیگر';
export const text_fcdf50e5c686: string = 'پیش از ارسال، فایل را بازبینی کنید.';
export const text_07139597010f: string = 'پس از ارسال، رسید و زمان ثبت پاسخ را می‌بینید.';
export const text_694286d0f810: string = 'بازبینی و ارسال پاسخ';
export const text_4d79062fd97d: string = 'جلسه نزدیک، حضور و پاسخ‌های منتظر بررسی.';
export const text_36724bf58adc: string = 'آفتاب · مدرس';
export const text_327467fdf7c9: string = 'روز خوبی برای یاد دادن';
export const schoolOverview = {
  dailyNavigation: 'نمای آموزشگاه',
  freshAnswers: 'پاسخ‌های تازه',
  lessonDrafts: 'پیش‌نویس درس‌ها',
  lessonDraftHint: 'مرور و ادامهٔ ویرایش درس‌های کلاس',
  teacherSummary: '{sessions} جلسه و {pending} پاسخ در انتظار بررسی دارید.',
};
export const text_03481abc5855: string = '۲ جلسه و ۶ پاسخ در انتظار بررسی دارید.';
export const text_f97925e48f89: string = 'جلسه نزدیک';
export const text_1e4d7a80d73a: string = 'ریاضی دهم';
export const text_2975759f8b2b: string = '۲۴ دانش‌آموز · کلاس ۲';
export const text_af0ac235b65b: string = 'کارهای مدرس';
export const text_be526b3569c6: string = 'پاسخ‌های تازه۶ پاسخ از تمرین فصل دوم۶';
export const text_bf7840d54367: string = '۶ پاسخ از تمرین فصل دوم';
export const text_5b0a493e525f: string = '۶';
export const text_b3482f4c57be: string = 'پیش‌نویس درس‌ها۱ درس آماده بازبینی';
export const text_d1d4bfafcbb7: string = '۱ درس آماده بازبینی';
export const text_1c50c3e2b6ce: string = 'عملیات سازمانی و خط مرز با کلاس مستقل.';
export const text_a1bc716f4825: string = 'آفتاب · مدیر آموزشگاه';
export const text_48dd7579a827: string = '۲۴۸';
export const text_23009131b89a: string = '۱۸';
export const text_301ae66d93be: string = 'دعوت‌های اعضا۴ دعوت در انتظار پذیرش۴';
export const text_0941b78c8b98: string = '۴ دعوت در انتظار پذیرش';
export const text_876643997d73: string = 'برنامه این هفته۲ جلسه بدون مدرس جایگزین';
export const text_6307adc7927f: string = '۲ جلسه بدون مدرس جایگزین';
export const text_32845b15b030: string = 'گزارش آموزشگاهحضور، ارزیابی و روند یادگیری';
export const text_c787e38a1686: string =
  'این مدیریت فقط برای آموزشگاه آفتاب است. کلاس‌های مستقل در فوق‌برنامه قرار دارند.';
export const text_c5a27cb84af5: string = 'فرزند انتخاب‌شده و اطلاعات مجاز همان رابطه.';
export const text_aedab31a08e0: string = 'آفتاب · والد';
export const text_cb92a8b00c69: string = 'ن';
export const text_7d65c8500508: string = 'نازنین احمدی';
export const text_e5f0ac591d48: string = 'فرزند انتخاب‌شده';
export const text_5eaf300d9dba: string =
  'این نما مربوط به اطلاعات مجاز نازنین در آموزشگاه آفتاب است.';
export const text_4120094f24fc: string = 'برنامه نزدیک';
export const text_070e809f7a98: string = 'مدرس: مریم رضایی';
export const text_5ba7d93c1809: string = 'پیگیری آموزشی';
export const text_32a1779f120c: string = 'حضور در جلسات۸ حضور از ۹ جلسه';
export const text_7b13c5f2a0cd: string = 'حضور در جلسات';
export const text_f5304f1aee3b: string = '۸ حضور از ۹ جلسه';
export const text_e9ec32be0e5e: string = 'نتایج منتشرشدهآخرین آزمون: ریاضی';
export const text_a7db5e31f7cf: string = 'نتایج منتشرشده';
export const text_b05d1d28318d: string = 'آخرین آزمون: ریاضی';
export const text_fe8eeba5da47: string = 'دعوت و رابطه والدرابطه تأییدشده با نازنین';
export const text_fbf07c1d477e: string = 'دعوت و رابطه والد';
export const text_d2aa4ff628c9: string = 'رابطه تأییدشده با نازنین';
export const text_e9886629ae8e: string = 'اولین کلاس';
export const text_bc908e998476: string = 'حساب عادی هم می‌تواند شروع کند؛ آموزشگاه شرط نیست.';
export const text_002d6ac40486: string = 'فضای شخصی شما';
export const text_93e435d77c4b: string = 'کلاس بعدی از شما شروع می‌شود';
export const text_887a69fd5f56: string =
  'برای هر موضوعی که می‌خواهید با هم یاد بگیرید، درخواست تشکیل کلاس بدهید.';
export const text_1e96b80a1792: string = 'برای همه حساب‌ها';
export const text_946b6a7d51aa: string =
  'بدون نیاز به آموزشگاه یا نقش دانش‌آموز. درخواست شما را مالک یا ادمین ماکان بررسی می‌کند.';
export const text_616b70034616: string = 'لینک دعوت دارید؟';
export const text_a59623240707: string = 'آن را باز کنید و مشخصات کلاس را ببینید.';
export const text_b51c5dc36f6e: string = 'عضویت، مدیریت و دو میان‌بر ارتباطی.';
export const text_7d2d659799bd: string = 'کلاس‌های مستقل شما';
export const text_e266443f579c: string = 'کلاس مستقل · مدیریت من';
export const text_76746dbaa90d: string = 'تمرین نوشتن، خواندن و گفتگوی خلاق';
export const text_679029f8b54d: string = '۱۲ عضو از ۲۰ نفر';
export const text_2ffbceefc1e8: string = 'گروه گفتگو۱۲ عضو · مخصوص کلاس';
export const text_fc16ef2aa533: string = '۱۲ عضو · مخصوص کلاس';
export const text_543539512712: string = 'کانال کلاساطلاعیه‌های رسمی کلاس';
export const text_f256abfd23be: string = 'اطلاعیه‌های رسمی کلاس';
export const text_84dd3cee567c: string = 'درخواست‌های تشکیل من۱ درخواست در حال بررسی۱';
export const text_a5b3a7af12f5: string = '۱ درخواست در حال بررسی';
export const text_b56991e612b6: string = 'دعوت‌های دریافتیباشگاه کتاب‌خوانی منتظر پاسخ شماست۱';
export const text_105630316491: string = 'باشگاه کتاب‌خوانی منتظر پاسخ شماست';
export const text_df2bc376244b: string = 'پیش‌نویس، بررسی و اصلاح با شماره پیگیری ثابت.';
export const text_5968ac863334: string = 'تشکیل کلاس فوق‌برنامه';
export const text_dbc70c33ca28: string = 'امروز، ۱۰:۲۴';
export const text_9aea254ff50d: string = 'شماره درخواست: ۱۴۰۵–۰۲۸۴';
export const text_fc0eb632a320: string = 'خودم';
export const text_7785a5f355e1: string = 'دیروز';
export const text_4a45b938c740: string = 'مخاطبان و شرایط پذیرش را روشن‌تر کنید.';
export const text_1fc5071f9382: string = 'ادامه فرم از آخرین مرحله';
export const text_35b2a0287f44: string = '۱. مشخصات';
export const text_949dc19ccafa: string = 'نام روشن، هدف و شرح کاربردی.';
export const text_b7d0fb6fe6f8: string = 'مرحله ۱ از ۴';
export const text_5b74392d7253: string = 'مشخصات';
export const text_2e3bc8409224: string = '۳';
export const text_a5049ceb91b3: string = 'نام کوتاه و روشن انتخاب کنید.';
export const text_1486d7083b3a: string = '۱۲۴ نویسه';
export const text_f8e36cc99b26: string = 'ادبیات و نویسندگی ';
export const text_6f29437c6452: string =
  'کلاس مستقل از آموزشگاه است. ثبت فرم، هنوز به معنی تشکیل کلاس نیست.';
export const text_1fb4f17fbb93: string = 'پیش‌نویس هنگام پیشروی حفظ می‌شود.';
export const text_44dc6087cbc1: string = '۲. مخاطبان';
export const text_f45650f3602b: string = 'شرایط پذیرش و هر دو مسیر عضویت.';
export const text_e360f59c5392: string = 'مخاطبان و پذیرش';
export const text_114dfc040e9b: string = 'مرحله ۲ از ۴';
export const text_e9b5c7df5c1b: string = 'این کلاس برای چه کسانی است؟';
export const text_9473594af88b: string = 'سقف نهایی تابع سیاست مصوب کلاس است.';
export const text_619638fc003e: string = 'راه‌های عضویت';
export const text_c53dc8f79af7: string = 'دعوت مدیر و پذیرش فرد';
export const text_bb25afa35768: string = 'درخواست پیوستن و بررسی مدیر';
export const text_9f38e078ba9e: string = 'قواعد حضور';
export const text_781ba8d20c84: string = 'ادامه: مدیریت و مدرس';
export const text_5df0e5d3c617: string = '۳. مدیریت و مدرس';
export const text_a6ae50f32eef: string = 'درخواست‌دهنده مدیر پیش‌فرض؛ مدرس اختیاری.';
export const text_e9f532408133: string = 'مدیریت و مدرس';
export const text_ac32e0914f7a: string = 'مرحله ۳ از ۴';
export const text_834655fa49da: string = 'خودم · درخواست‌دهنده';
export const text_eb90052aa47b: string = 'پیش‌فرض';
export const text_5d7ad1213f28: string =
  'مالک یا ادمین ماکان می‌تواند هنگام بررسی، مدیر نهایی دیگری تعیین کند.';
export const text_7506d51272b6: string = 'مدرس اختیاری';
export const text_597579bc87b2: string = 'معرفی مدرس پیشنهادی';
export const text_75374857f47f: string =
  'نبود مدرس مانع تشکیل نیست. مدیر با اختیار آموزشی می‌تواند تکلیف و آزمون را اداره کند.';
export const text_5427d06ed372: string = 'ادامه: بازبینی درخواست';
export const text_64f30eb40eed: string = '۴. بازبینی و ارسال';
export const text_0d5fe12a57c0: string = 'فرصت ویرایش و پذیرش قواعد پیش از ثبت.';
export const text_170187e02a07: string = 'بازبینی درخواست';
export const text_2c2dbe1adf0c: string = 'مرحله ۴ از ۴';
export const text_649ae6847f99: string = 'تمرین داستان کوتاه با بازخورد گروهی';
export const text_2e233777ed33: string = 'سارا احمدی؛ خودم';
export const text_5b816941d22d: string = 'قواعد مدیریت کلاس و حریم اعضا را خواندم و می‌پذیرم.';
export const text_c5350da219c3: string =
  'پس از تأیید، گروه و کانال اختصاصی کلاس آماده می‌شوند. نتیجه در درخواست‌های من قابل پیگیری است.';
export const text_8e765e1f5051: string = 'رسید درخواست';
export const text_763a3c99f7fe: string = 'انتظار بررسی از تشکیل واقعی جداست.';
export const text_aaf9f680dac1: string = 'درخواست شما ثبت شد';
export const text_cc1caa8830aa: string = 'شماره ۱۴۰۵–۰۲۸۴';
export const text_d94f20525eb4: string = 'در انتظار بررسی ماکان';
export const text_69ba3794eea7: string = 'امروز، ساعت ۱۰:۲۴';
export const text_964f243f512a: string = 'بررسی مالک یا ادمین';
export const text_a5f179110fc4: string = 'نتیجه در همین صفحه اعلام می‌شود.';
export const text_2711ccd67adc: string = 'آماده‌سازی پس از تأیید';
export const text_4df0b315e5fd: string = 'گروه و کانال اختصاصی کلاس';
export const text_f36047b93997: string = 'تا پیش از تأیید، کلاسی تشکیل نشده و عضوی اضافه نمی‌شود.';
export const text_2753a0932e49: string = 'دلیل قابل فهم و ادامه با اطلاعات حفظ‌شده.';
export const text_b946c611892b: string = 'درخواست ۱۴۰۵–۰۲۸۴';
export const text_5cacc5bf6aa0: string = 'اصلاح و ارسال دوباره';
export const text_4d8487146bc8: string = 'بررسی‌شده توسط ناظر ماکان';
export const text_13e2a7d95269: string = 'پیام برای شما';
export const text_165b9f17244a: string =
  'لطفاً مخاطب کلاس و سطح مقدماتی آن را مشخص کنید و قواعد بازخورد دادن را تکمیل کنید.';
export const text_91707a8a2c3e: string = 'چه چیزی حفظ می‌شود؟';
export const text_c7808ac49c8d: string = 'اطلاعات قبلی درخواستهمه فیلدها برای ویرایش در دسترس‌اند';
export const text_3ecd7fb0b16b: string = 'اطلاعات قبلی درخواست';
export const text_dd2eb7d67404: string = 'همه فیلدها برای ویرایش در دسترس‌اند';
export const text_b3bc349426fc: string = 'سوابق تصمیم‌هااین درخواست با همان شماره ادامه می‌یابد';
export const text_4ea331ac4be9: string = 'سوابق تصمیم‌ها';
export const text_b448c83eb7b3: string = 'این درخواست با همان شماره ادامه می‌یابد';
export const text_efbcc8333044: string =
  'این پیام فقط دلیل قابل نمایش است؛ یادداشت داخلی بررسی‌کننده نمایش داده نمی‌شود.';
export const text_39608283da27: string = 'صف و جزئیات بررسی تشکیل کلاس';
export const text_6a27f754b563: string =
  'MK-19 · صف و بررسی تشکیل. پس از تأیید نهایی، کاربر به وضعیت آماده‌سازی همان کلاس هدایت می‌شود.';
export const text_45e92bb11904: string = 'مدیریت پلتفرم';
export const text_2d9d114f9edd: string = 'دسترسی ناظر مجاز';
export const text_2f3017a17064: string = 'پیام‌ها۳';
export const text_a931543d0251: string = 'بررسی درخواست‌ها';
export const text_54834f46e406: string = 'مشاهده پروفایل';
export const text_a22854c72f9a: string = 'بررسی درخواست‌های تشکیل';
export const text_e7dab07f39f5: string = 'مدیریت پلتفرم · فقط حساب دارای اختیار بررسی';
export const text_8dbb66c14ffb: string = '۵ درخواست در انتظار';
export const text_09f360198d8a: string = '۵';
export const text_e05e2bd2e16c: string =
  'کارگاه داستان‌نویسیسارا احمدی · امروز ۱۰:۲۴شماره ۱۴۰۵–۰۲۸۴در حال بررسی';
export const text_0f0ffa431964: string = 'سارا احمدی · امروز ۱۰:۲۴';
export const text_608c5f360f5a: string = 'باشگاه کتاب‌خوانیمریم رضایی · امروز ۰۹:۱۵تازه';
export const text_c35f6aab3c91: string = 'مریم رضایی · امروز ۰۹:۱۵';
export const text_360e602ab6a6: string = 'تازه';
export const text_b6ffb7038731: string = 'دورهمی زبان انگلیسیامیر نادری · دیروزاصلاح‌شده';
export const text_b4bd12fd81fd: string = 'امیر نادری · دیروز';
export const text_1fdc600631ae: string = 'اصلاح‌شده';
export const text_b1234c55c544: string = 'تمرین عکاسیریحانه زمانی · دیروزتازه';
export const text_f0dc6b19ded5: string = 'ریحانه زمانی · دیروز';
export const text_69d4424ecf8e: string = 'درخواست‌دهنده: سارا احمدی · اطلاعات ارسال‌شده در ۱۱ آبان';
export const text_00583e129e58: string =
  'تمرین نوشتن داستان کوتاه با خواندن و بازخورد گروهی؛ سطح مقدماتی.';
export const text_d2264eef5226: string = 'ظرفیت پیشنهادی: ۲۰ نفر · عضویت: دعوت و درخواست پیوستن';
export const text_9710a2fdb2aa: string = 'سارا احمدی؛ درخواست‌دهنده';
export const text_df8f89a0ffd8: string = 'سارا احمدی؛ درخواست‌دهنده ';
export const text_e3475b19530b: string = 'جایگزینی مدیر با اختیار پلتفرم ممکن است.';
export const text_4a76b91c319b: string = 'فعلاً بدون مدرس ';
export const text_a55bbffc5c37: string = 'اختیاری؛ مانع تأیید نیست.';
export const text_09be431e6fea: string = 'پیام قابل نمایش به درخواست‌دهنده';
export const text_351cf4f8b8b7: string = 'نتیجه یا موارد لازم برای اصلاح';
export const text_0617e4214e7a: string = 'یادداشت داخلی ناظر';
export const text_8d607064a8a3: string = 'فقط برای بررسی‌کنندگان مجاز';
export const text_02cb2284c642: string =
  'تأیید، یک کلاس مستقل و یک گروه و یک کانال اختصاصی آماده می‌کند. آموزشگاه جدید ساخته نمی‌شود.';
export const text_d608a842edd7: string =
  'پیش از ثبت، تصمیم و مدیر نهایی در مرحله تأیید نهایی مرور می‌شوند.';
export const text_f03565d59abe: string = 'کاربر می‌تواند خارج شود و بعداً پیگیری کند.';
export const text_0fc74b055fce: string = 'آماده‌سازی کلاس';
export const text_432a546307c3: string = 'درخواست تأیید شد';
export const text_0ea17e9bcad3: string = 'کلاس و فضاهای گفتگو در حال آماده‌شدن‌اند.';
export const text_f192629ac7b3: string = 'کلاس ثبت شد';
export const text_072f7249eace: string = 'مدیر: سارا احمدی';
export const text_707879911b3c: string = 'گروه کلاس آماده است';
export const text_4bacd3454e14: string = 'گفتگوی اعضای همین کلاس';
export const text_d4fd34fd2f0a: string = 'کانال در حال آماده‌سازی';
export const text_ad5d87df8980: string = 'اطلاعیه‌های کلاس';
export const text_cf5d37c22519: string =
  'می‌توانید از این صفحه خارج شوید. وضعیت از درخواست‌های من قابل پیگیری است.';
export const text_6a5391fe9a86: string = 'بازگشت به درخواست‌ها';
export const text_a9f8f840fe64: string = 'تکمیل‌نشدن کانال';
export const text_58baedd83069: string = 'تلاش دوباره ادامه همین فرایند است.';
export const text_88d06216b3b8: string = 'آماده‌سازی کامل نشد';
export const text_6956c80c366d: string =
  'کلاس شما محفوظ است. آماده‌شدن کانال به تلاش دوباره نیاز دارد.';
export const text_0fb6b4655b7d: string = 'نیازی به ساخت دوباره ندارد.';
export const text_f7ba936544c2: string = 'کانال هنوز آماده نیست';
export const text_aa41a2f64c5e: string = 'آخرین تلاش: امروز، ۱۰:۳۱';
export const text_a766f44b83e2: string = 'ادامه همین آماده‌سازی';
export const text_077b16c30e28: string = 'تلاش دوباره، کلاس یا گروه جدیدی نمی‌سازد.';
export const text_9d418c2dd7ca: string =
  'تا آماده‌شدن هر دو فضا، افزودن اعضا و شروع کلاس انجام نمی‌شود.';
export const text_849c2cb94c91: string = 'پیگیری از پشتیبانی';
export const text_7446fd19a945: string = 'بازبینی شروع';
export const text_d7b08a1998db: string = 'هر دو فضا آماده؛ مدرس خالی معتبر.';
export const text_050438b8a859: string = 'کلاس آماده است';
export const text_94f399a547f9: string = 'بازبینی پیش از شروع';
export const text_b215b059eda9: string = 'آماده شروع';
export const text_b0601d0e6024: string = 'ظرفیت ۲۰ نفر · هنوز عضوی دعوت نشده است.';
export const text_98ef76fc97fc: string = 'مدیر کلاسسارا احمدی؛ مسئولیت پذیرفته‌شده';
export const text_f242eab64bbc: string = 'سارا احمدی؛ مسئولیت پذیرفته‌شده';
export const text_b4a67020c584: string = 'گروه و کانالهر دو آماده و متصل به همین کلاس';
export const text_5cce1d839ea8: string = 'گروه و کانال';
export const text_4f44efcc4d05: string = 'هر دو آماده و متصل به همین کلاس';
export const text_399e4ced5fdc: string = 'مدرسفعلاً بدون مدرس؛ مجاز استاختیاری';
export const text_216a7c0524e3: string = 'فعلاً بدون مدرس؛ مجاز است';
export const text_e4c5bd1172eb: string = 'اختیاری';
export const text_91af416aa922: string = 'اختیار آموزشی مدیرطراحی و ارزیابی تکلیف و آزمونفعال';
export const text_05f286376b2d: string = 'اختیار آموزشی مدیر';
export const text_9b36c05fcb7f: string = 'طراحی و ارزیابی تکلیف و آزمون';
export const text_06edb2fbe315: string = 'قواعد و شرایط پذیرش کلاس را بازبینی کردم.';
export const text_5f502dd25a6c: string =
  'پس از شروع، می‌توانید افراد را دعوت کنید یا درخواست عضویت آنان را بررسی کنید.';
export const text_a928e59833b2: string = 'نمای عضو';
export const text_ef4c233ae7fa: string = 'فعالیت نزدیک، تکلیف، آزمون و دو فضای کلاس.';
export const text_dd20d058bfd7: string = 'کلاس مستقل · عضو آموزشی';
export const text_f9f3f460a300: string = 'عضو آموزشی · ۱۲ عضو';
export const text_94e2e414b928: string = 'هر هفته، یک داستان';
export const text_8867a42e7efd: string = 'تمرین، بازخورد و یادگیری در یک جمع کوچک';
export const text_e06f50f0f850: string = 'کارهای نزدیک شما';
export const text_d7e0f844321a: string = 'روایت یک اتفاق کوچکتکلیف · تا ۱۴ آبان، ۲۳:۵۹۲ روز مانده';
export const text_7461d3c955e3: string = 'تکلیف · تا ۱۴ آبان، ۲۳:۵۹';
export const text_e28e1d97390d: string = '۲ روز مانده';
export const text_9da2e6ec3216: string = 'مرور زاویه دیدآزمون · ۱۲ آبان، ساعت ۱۸آماده شروع';
export const text_3316e193e8d2: string = 'آزمون · ۱۲ آبان، ساعت ۱۸';
export const text_ebc7fbf2c70a: string = 'نقش شما';
export const text_6e20c46da1be: string = 'نمای مدیر';
export const text_015446001148: string = 'اعضا، طراحی فعالیت و ارزیابی با اختیار محلی.';
export const text_df325f518a58: string = 'کلاس مستقل · مدیر با اختیار آموزشی';
export const text_2bf05a28691e: string = 'پاسخ تازه';
export const text_e9dfc9566fd1: string = 'مدیریت آموزش';
export const text_1f3a575b6725: string = 'یادگیری را ادامه دهید';
export const text_fa7836744c25: string = 'تکلیف و آزمون بسازید یا پاسخ‌ها را بررسی کنید.';
export const text_5157c42b7bf4: string = 'پاسخ‌های منتظر ارزیابی۴ تکلیف و ۲ آزمون۶';
export const text_578595f7198b: string = '۴ تکلیف و ۲ آزمون';
export const text_dc2e2b4d4a72: string = 'اعضا و درخواست‌هادعوت، نقش و پذیرش اعضا';
export const text_d0758af1c6d6: string = 'اعضا و درخواست‌ها';
export const text_cadc1e0b10c5: string = 'دعوت، نقش و پذیرش اعضا';
export const text_6691aa34a2b7: string = 'مدرس و تنظیمات کلاسمدرس اختیاری · سابقه و بایگانی';
export const text_8ae9c7a61d69: string = 'مدرس و تنظیمات کلاس';
export const text_52cad35a5c8d: string = 'مدرس اختیاری · سابقه و بایگانی';
export const text_1518ddcf0cea: string = 'وضعیت خواندنی، سوابق مجاز و پیام روشن.';
export const text_6bafa7901b15: string = 'کلاس مستقل · بایگانی‌شده';
export const text_bc9a45246115: string = 'کلاس بایگانی است. شروع آزمون و تحویل تازه پاسخ بسته است.';
export const text_21cff382f518: string = 'داستان‌ها باقی می‌مانند';
export const text_774a00e1bdfb: string =
  'سوابق منتشرشده فقط در محدوده دسترسی شما نمایش داده می‌شوند.';
export const text_3269d1b67747: string = 'تاریخ';
export const text_649ec1e3544e: string = '۱۰ آبان ۱۴۰۵';
export const text_916c90a430f1: string = 'دلیل قابل نمایش';
export const text_4e58cd7a2c1c: string = 'پایان دوره کارگاه';
export const text_cf6cdb4d5e49: string = 'نتیجه‌های منتشرشده منمشاهده مطابق دسترسی جاری';
export const text_01f4e1ea61a5: string = 'نتیجه‌های منتشرشده من';
export const text_9874d80f8e6a: string = 'مشاهده مطابق دسترسی جاری';
export const text_ba1696fcfcd6: string = 'سوابق و قواعد کلاسفقط خواندنی';
export const text_1d816c82292d: string = 'سوابق و قواعد کلاس';
export const text_ee02550c8d47: string = 'فقط خواندنی';
export const text_7f70a2ace928: string = 'بایگانی، مجوز عضو حذف‌شده را برنمی‌گرداند.';
export const text_5f632b3d846f: string = 'دعوت توسط مدیر';
export const text_d89b307df648: string = 'حساب مجاز، نقش محلی، اعتبار و پیام.';
export const text_dc468fbf66b0: string = 'دعوت به کلاس';
export const text_e10066949622: string = 'نام کاربری یا شناسه مجاز';
export const text_d11b23e0a741: string = 'ننازنین موسوی@nazanin.m';
export const text_9b3dfff3473a: string = 'نقش در کلاس';
export const text_19f5b052b705: string = 'عضو آموزشی ';
export const text_371923cfc87c: string = 'عضویت به نقش دانش‌آموز در آموزشگاه وابسته نیست.';
export const text_0b46bc8c6081: string = 'تا ۱۵ آبان';
export const text_c184a30f7f1a: string = 'تا ۱۵ آبان ';
export const text_7142e6f046d7: string = 'خوشحال می‌شویم در تمرین‌های داستان‌نویسی همراه ما باشید.';
export const text_127e11956a4b: string =
  'دعوت با پذیرش فرد و بررسی نهایی ظرفیت به عضویت تبدیل می‌شود.';
export const text_bf384c673528: string = 'رضایت آگاهانه پیش از بازشدن محتوا.';
export const text_99bc021b327a: string = 'دعوت به یک کلاس';
export const text_b3531b24b26b: string = 'دعوت از طرف سارا احمدی';
export const text_e06cb1d3f74b: string = 'تمرین نوشتن، خواندن و بازخورد گروهی';
export const text_ab1c5ff39778: string = 'نقش پیشنهادی';
export const text_0302946518b1: string = 'قواعد کوتاه کلاس';
export const text_bf36b3420711: string =
  'بازخورد محترمانه، حفظ حریم دیگران و منتشرنکردن نوشته‌ها بدون اجازه.';
export const text_1c4e970016f1: string = 'قواعد کلاس را خواندم و با عضویت موافقم.';
export const text_7779246023da: string =
  'پس از پذیرش، فضاهای کلاس و فعالیت‌های آموزشی مجاز در دسترس شما قرار می‌گیرند.';
export const text_0cab583023cb: string = 'درخواست پیوستن';
export const text_a7646bb4632e: string = 'پیش‌نمایش مجاز و انتظار تصمیم مدیر.';
export const text_2b774cc6bf9d: string = 'پیوستن به کلاس';
export const text_b61174242b71: string = 'پیش‌نمایش مجاز از لینک کلاس';
export const text_3626dbf71374: string = 'سطح مقدماتی · مدیر: سارا احمدی';
export const text_83fef5e75fa0: string = 'پیش از درخواست';
export const text_9f1eab9e84d1: string =
  'متن کوتاه می‌نویسیم، با احترام بازخورد می‌دهیم و نوشته دیگران را بدون اجازه منتشر نمی‌کنیم.';
export const text_008218a5d627: string = 'پیام برای مدیر، اختیاری';
export const text_015a4fb10aa5: string = 'به داستان کوتاه علاقه دارم و می‌خواهم منظم‌تر بنویسم.';
export const text_01b589af2ec4: string = 'قواعد کلاس و بررسی درخواست توسط مدیر را می‌پذیرم.';
export const text_c04d9bd610ea: string =
  'تا پذیرفته‌شدن درخواست، پیام‌ها، فایل‌ها و فهرست خصوصی اعضا نمایش داده نمی‌شوند.';
export const text_972df1428597: string = 'ارسال درخواست عضویت';
export const text_f4274990fcf8: string = 'ظرفیت و پیام متقاضی قبل از تصمیم.';
export const text_74d28479983b: string = 'ظرفیت باقی‌مانده';
export const text_0254201d7f64: string = '۸ نفر';
export const text_eaffc45414a6: string = '۱۲ عضو فعال از ظرفیت ۲۰ نفر';
export const text_ffe985eef16e: string = 'امروز، ساعت ۱۰:۱۰';
export const text_be0fa08bb8f1: string = 'ا';
export const text_e503e1b83cb8: string = 'دیروز، ساعت ۱۸:۳۰';
export const text_b97f9e1a3a47: string = 'تازه شروع به نوشتن کرده‌ام.';
export const text_bfb4d1f062a6: string = 'نقش محلی و ادامه دریافت فهرست.';
export const text_887dc8f99472: string = '۱۲ عضو فعال · مدیر هستید';
export const text_7c343c26e4c7: string = 'سسارا احمدیمدیر کلاسمدیر';
export const text_0c48d676ae95: string = 'ننازنین موسویعضو آموزشی · از امروز';
export const text_94d3fed1d653: string = 'عضو آموزشی · از امروز';
export const text_19f6093fd4e4: string = 'ممریم رضاییعضو آموزشی · از ۴ آبان';
export const text_6e41e80f19b4: string = 'عضو آموزشی · از ۴ آبان';
export const text_c4625a07b4d8: string = 'اامیر نادریعضو آموزشی · از ۳ آبان';
export const text_e8f749f84cf9: string = 'عضو آموزشی · از ۳ آبان';
export const text_ae7dfdfa1d79: string = 'رریحانه زمانیعضو آموزشی · از ۲ آبان';
export const text_36a9d753b0bd: string = 'ر';
export const text_d059658135b8: string = 'عضو آموزشی · از ۲ آبان';
export const text_c488910f15e8: string = 'ععلی کریمیعضو آموزشی · از ۲ آبان';
export const text_a0f49047a7ff: string = 'ع';
export const text_3ff03a5b4df0: string = '۶ نفر از ۱۲ عضو';
export const text_942943e8853e: string = 'اطلاعات و پایان عضویت';
export const text_05fcd6e4069b: string = 'ویرایش محلی؛ تأیید اثر حذف از هر دو فضا.';
export const text_98451c55dd62: string = 'اطلاعات عضو';
export const text_05466c5a07be: string = 'محدوده همین کلاس';
export const text_e542d9373305: string = 'عضو فعال · از ۱۱ آبان ۱۴۰۵';
export const text_5f247bd45254: string = 'نام نمایشی در کلاس';
export const text_090ad70db94e: string = 'یادداشت مدیریتی';
export const text_fb22890aceed: string = 'پیگیری تمرین‌های هفتگی';
export const text_fa6ac5a958d3: string = 'تغییرات این صفحه، نام و نقش سراسری حساب را عوض نمی‌کند.';
export const text_857ffad94bd0: string =
  'دسترسی به گروه، کانال، فعالیت‌ها و دریافت تازه فایل بسته می‌شود. پاسخ پذیرفته‌شده و سابقه مجاز حفظ می‌شوند.';
export const text_ea12a863b208: string = 'دلیل پایان عضویت';
export const text_5ed838c1bf8b: string = 'به درخواست خود عضو';
export const text_c2e713c4052a: string = 'گروه کلاس';
export const text_03d1d24da426: string = 'پرسش، پاسخ، نقل‌قول و قواعد سنجاق‌شده.';
export const text_e76f5543feb9: string = 'گروه داستان‌نویسی';
export const text_3855bf152b2d: string = '۱۲ عضو · وابسته به کلاس';
export const text_5be6f7003ac6: string = 'قواعد بازخورد';
export const text_52ff9253df38: string = 'ابتدا یک نقطه قوت، سپس یک پیشنهاد روشن.';
export const text_db0ee24c7f68: string =
  'سارا · مدیر کلاسسلام به همه. این هفته از یک اتفاق روزمره، یک داستان کوتاه می‌نویسیم.۱۰:۲۵';
export const text_34de1b47700a: string = 'سارا · مدیر کلاس';
export const text_55b5348c5c9a: string =
  'سلام به همه. این هفته از یک اتفاق روزمره، یک داستان کوتاه می‌نویسیم.';
export const text_79967e1c9d98: string = '۱۰:۲۵';
export const text_b622d6337d48: string =
  'نازنینمی‌توانیم داستان را از زاویه دید یک شیء تعریف کنیم؟۱۰:۲۷';
export const text_095eb3d39918: string = 'نازنین';
export const text_d342e56818d7: string = 'می‌توانیم داستان را از زاویه دید یک شیء تعریف کنیم؟';
export const text_c45cff5441ca: string = '۱۰:۲۷';
export const text_a36ae4ba5935: string =
  'نازنیناز زاویه دید یک شیء؟بله، ایده خوبی است. روی جزئیاتی که آن شیء می‌بیند تمرکز کن.۱۰:۲۹';
export const text_bcc8ae7a0a47: string = 'از زاویه دید یک شیء؟';
export const text_dea1a3e8eb0c: string =
  'بله، ایده خوبی است. روی جزئیاتی که آن شیء می‌بیند تمرکز کن.';
export const text_68aefb198eff: string = '۱۰:۲۹';
export const text_b8c8879aa880: string = 'پیام بنویسید…';
export const text_6501eda7e94b: string = 'انتشار رسمی؛ مسیر گفتگو به گروه متصل.';
export const text_4d247be36fa8: string = 'کانال داستان‌نویسی';
export const text_338de3f3b26e: string = 'متصل به کارگاه داستان‌نویسی';
export const text_dc11832b57e5: string = 'گفتگو و پرسش در گروه کلاس';
export const text_1f3041084dc1: string = '۱۱ آبان';
export const text_a0e80b7cb6e4: string = 'از یک روز معمولی';
export const text_708578da1fc9: string = 'تمرین این هفته: یک اتفاق کوچک';
export const text_9c62d69ad51d: string =
  'یک لحظه از امروز را انتخاب کنید. در ۳۰۰ کلمه، آن را از نگاه کسی دیگر روایت کنید.';
export const text_75407a1eec87: string = 'راهنمای بازخورد.pdfPDF · ۲ صفحه';
export const text_a48e39162a45: string = 'راهنمای بازخورد.pdf';
export const text_bfb49e0b7b75: string = 'PDF · ۲ صفحه';
export const text_34211ca807f7: string = '۱۲ مشاهده · ۱۰:۲۴';
export const text_7c9a42e1f7d6: string = 'گفتگوی هفتگی';
export const text_b2e3ad8eed8f: string = 'سه‌شنبه ساعت ۱۸ در گروه، نوشته‌های یکدیگر را می‌خوانیم.';
export const text_2c545575713c: string = '۱۱ مشاهده · دیروز';
export const text_f242080d1c7a: string = 'اطلاعات فضای وابسته';
export const text_e3c4e122b96e: string = 'مدیریت اعضا از کلاس؛ بی‌صداکردن مستقل.';
export const text_d7ed74955c6e: string = 'گروه وابسته به کلاس';
export const text_439a694e2ef7: string = '۱۲ عضو · گروه اختصاصی کلاس';
export const text_19061ceda689: string = 'اعضا از کلاس مدیریت می‌شوند.';
export const text_f9af539edb78: string = 'بی‌صدا کردن';
export const text_3d0f00d15b92: string = 'فقط اعلان‌های این گفتگو';
export const text_9fdfd4c47e88: string = 'بی‌صدا کردنفقط اعلان‌های این گفتگو';
export const text_feadec63e380: string = 'فایل‌های مشترک۷ فایل مجاز در این کلاس';
export const text_c9cb2c38c05f: string = '۷ فایل مجاز در این کلاس';
export const text_9517c82fbbf1: string = 'مشاهده اعضای کلاساطلاعات مجاز اعضا';
export const text_cad0d333e71c: string = 'مشاهده اعضای کلاس';
export const text_42b9d7c016fe: string = 'اطلاعات مجاز اعضا';
export const text_3ba6fc0aff35: string = 'بازکردن کانال کلاساطلاعیه‌های رسمی';
export const text_81183b4ba107: string = 'بازکردن کانال کلاس';
export const text_e6a9df8bad64: string = 'اطلاعیه‌های رسمی';
export const text_2121974adb60: string =
  'خروج از این مجموعه، عضویت کلاس و دسترسی هر دو فضا را پایان می‌دهد.';
export const text_7ff09e41dc49: string = 'خروج از کلاس…';
export const text_4ae81b084e85: string = 'صندوق یکپارچه';
export const text_ab59b4568692: string = 'زمان، خلاصه، نخوانده و نشان وابستگی کلاس.';
export const text_c20adff0b11d: string = 'همه گفتگوهای حساب شما';
export const text_6f400812a631: string =
  'دکارگاه داستان‌نویسیسارا: این هفته از یک اتفاق روزمره…۱۰:۳۱۳';
export const text_57beb8d9872f: string = 'سارا: این هفته از یک اتفاق روزمره…';
export const text_9c03626c5222: string = '۱۰:۳۱';
export const text_cfea245a0dc1: string = 'ممریم رضاییممنون، فایل را دریافت کردم.۱۰:۲۸۱';
export const text_bc743322d315: string = '۱۰:۲۸';
export const text_8aa6eed63b2e: string = 'دکانال داستان‌نویسیتمرین این هفته: یک اتفاق کوچک۱۰:۲۴';
export const text_207cb22b3bff: string = '۱۰:۲۴';
export const text_03ed97df254b: string = 'رریاضی دهمعلی: راه‌حل مسئله پنجم را دیدید؟دیروز۲';
export const text_3140b2d23200: string = 'علی: راه‌حل مسئله پنجم را دیدید؟';
export const text_d5070fc1efbc: string = 'کباشگاه کتاب‌خوانیمریم: فصل سوم را با هم می‌خوانیم.دیروز';
export const text_236af9f9dbff: string = 'مریم: فصل سوم را با هم می‌خوانیم.';
export const text_6be3eacfded2: string = 'یک صندوق برای گفتگوهای شخصی و کلاس‌های شما';
export const text_69d53df59a57: string = 'گفتگوی شخصی';
export const text_0ae0ec53dc5d: string = 'سلسله‌مراتب ساده و فایل قابل تشخیص.';
export const text_3822a3f62dfc: string =
  'سلام سارا. برای تمرین امروز، راهنمای بازخورد را داری؟۱۰:۲۰';
export const text_2e9d216cdb1f: string = 'سلام سارا. برای تمرین امروز، راهنمای بازخورد را داری؟';
export const text_f6da2b5a6d24: string = '۱۰:۲۰';
export const text_8e48853aa390: string = 'سلام، بله. این نسخه کوتاه را ببین.۱۰:۲۲';
export const text_84c7e27a9d81: string = 'سلام، بله. این نسخه کوتاه را ببین.';
export const text_a28722c09794: string = '۱۰:۲۲';
export const text_c5550ae452fb: string = 'راهنمای بازخورد.pdfPDF · ۲ صفحه۱۰:۲۳';
export const text_7b5015f4971d: string = '۱۰:۲۳';
export const text_4bd951986ae2: string = 'ممنون، فایل را دریافت کردم.۱۰:۲۸';
export const text_e3922794020d: string = 'یک انتخاب کوتاه؛ بستن واضح و بدون مسیر گم‌شده.';
export const text_b0df0bfc7673: string = 'پیشنهاد کاربردی و انتخاب منابع در دسترس.';
export const text_e3ca4bcedb43: string = 'با منابعی که خودتان انتخاب می‌کنید';
export const text_37cf8e57df5f: string = 'راهنمای داستان‌نویسی';
export const text_678fb3f35784: string = 'آماده استفاده · فقط همین منبع';
export const text_4612ff5480c7: string = 'نکته اصلی این منبع چیست؟خلاصه‌ای با ارجاع به منبع';
export const text_e322dbdbd2d2: string = 'با یک مثال توضیح بدهیک مفهوم را ساده‌تر بفهمید';
export const text_1211e6c4cd1f: string = 'برای مطالعه‌ام برنامه بدهبا زمان و هدفی که می‌گویید';
export const text_41a33c9babf6: string = 'انتخاب منبع';
export const text_f37e3d16b262: string = 'منبع ناآماده قابل انتخاب نیست.';
export const text_6fcf54aff878: string = 'فقط منابع مجاز و آماده';
export const text_d09f3e70ed9c: string = 'آماده برای دستیار · ۸ صفحه';
export const text_a47727d3ab65: string = 'راهنمای داستان‌نویسیآماده برای دستیار · ۸ صفحه';
export const text_04c967e9e6cd: string = 'تمرین روایت';
export const text_d09f77352c9a: string = 'آماده برای دستیار · ۳ صفحه';
export const text_7c7b3f598b6e: string = 'تمرین روایتآماده برای دستیار · ۳ صفحه';
export const text_a21c7557d3ac: string =
  'یادداشت‌های هفته دومدر حال آماده‌سازی برای دستیارآماده نیست';
export const text_26c8af225e41: string = 'در حال آماده‌سازی برای دستیار';
export const text_d11e444c5e52: string =
  'منبع آماده‌نشده را نمی‌توان انتخاب کرد. فایل قابل مشاهده ممکن است هنوز برای دستیار آماده نباشد.';
export const text_f0630692f5c8: string =
  'پاسخ با همین انتخاب ساخته می‌شود. انتخاب کلاس، مجوز تازه‌ای ایجاد نمی‌کند.';
export const text_697196a9a189: string = 'پاسخ نمونه';
export const text_00d0d669e618: string = 'توضیح خوانا و مسیر بازگشت به منبع.';
export const text_5efb807525ba: string = 'راهنمای داستان‌نویسی · ۱ منبع';
export const text_0d5f099ed8bb: string =
  'فرق «گفتن» و «نشان دادن» در داستان را با مثال توضیح بده.۱۰:۴۰';
export const text_4d45d401cac1: string = 'فرق «گفتن» و «نشان دادن» در داستان را با مثال توضیح بده.';
export const text_9849e57fe30f: string = '۱۰:۴۰';
export const text_b795b2c354c6: string = 'اجازه بده خواننده خودش ببیند';
export const text_2063dc32f9c3: string =
  'در «گفتن»، احساس را نام می‌بریم. در «نشان دادن»، آن را با رفتار و جزئیات قابل مشاهده منتقل می‌کنیم.';
export const text_3c4f9c795355: string = 'گفتن:';
export const text_cfc82bdffe9a: string = ' نازنین مضطرب بود.';
export const text_dad2aff209aa: string = 'نشان دادن:';
export const text_49cf4d8f0a0b: string =
  ' نازنین بند کیفش را دور انگشت می‌پیچید و به در نگاه می‌کرد.';
export const text_26bf0c977b53: string =
  'هر دو روش کاربرد دارند؛ میزان جزئیات به ریتم داستان بستگی دارد.';
export const text_8b8b7fa9183d: string = 'راهنمای داستان‌نویسی · بخش ۲';
export const text_801c25e4b226: string = 'پاسخ را با منبع بررسی کنید.';
export const text_d33d848b5b23: string = 'سؤال بعدی…';
export const text_c99d21757758: string = 'کتابخانه من';
export const text_373cd402bae6: string = 'وضعیت‌های متنی و اقدام متناسب هر منبع.';
export const text_88896de72262: string = 'جستجو در منابع';
export const text_1aec955d72ec: string = 'راهنمای داستان‌نویسی.pdfPDF · ۸ صفحه · شخصی';
export const text_833e977b1d02: string = 'راهنمای داستان‌نویسی.pdf';
export const text_51e4d54971cc: string = 'PDF · ۸ صفحه · شخصی';
export const text_7562e4f59b3a: string = 'فایل آماده';
export const text_2e4105629e18: string = 'منبع آماده';
export const text_e9d09ad1b5ac: string = 'دستیار آماده';
export const text_4be291183caf: string = 'یادداشت‌های هفته دوم.pdfPDF · شخصی';
export const text_87d92b6f68fa: string = 'یادداشت‌های هفته دوم.pdf';
export const text_c334e8b102ec: string = 'PDF · شخصی';
export const text_38bc63f905b5: string = 'دستیار در انتظار';
export const text_e18c1f15b917: string = 'تصویر تخته.jpgJPG · شخصی';
export const text_30250dae87a7: string = 'تصویر تخته.jpg';
export const text_49b970c6476c: string = 'JPG · شخصی';
export const text_a932e1fc4241: string = 'نیاز به تلاش دوباره';
export const text_aa8fe7e5cbd5: string = 'فایل حفظ شده است؛ آماده‌سازی کامل نشد.';
export const text_45f9ec068401: string = 'بارگذاری';
export const text_73fd5335f915: string = 'پیشرفت و حفظ فایل؛ اقدام ثبت در حین ارسال بسته.';
export const text_3be22b2121fd: string = 'تمرین‌های زاویه دید در داستان کوتاه.';
export const text_1f15783cef5d: string = 'فایل انتخاب‌شده';
export const text_a9ee730f2230: string = 'یادداشت‌های هفته دوم.pdfPDF · ۱٫۸ مگابایت';
export const text_5c6a59b735a5: string = 'بارگذاری فایل';
export const text_e9d7f2b99dde: string = '۷۲٪';
export const text_3fd17ed5acf7: string = 'در حال ارسال…';
export const text_5cdd033071b4: string =
  'پس از بارگذاری، وضعیت مطالعه و آمادگی دستیار جداگانه نمایش داده می‌شود.';
export const text_18602fd82553: string = 'فایل آماده، دستیار در انتظار';
export const text_9286d70366ce: string = 'مطالعه ممکن است زودتر از استفاده در AI آماده شود.';
export const text_f5c836497867: string = 'منبع شخصی';
export const text_6d2813e008c3: string = 'فایل برای مطالعه آماده است';
export const text_5696ac7c9d8f: string = 'PDF · ۶ صفحه · بارگذاری امروز';
export const text_2754b55c3100: string = 'بارگذاری کامل شد';
export const text_ff085dcd53fd: string = 'فایل محفوظ است.';
export const text_1921ff927a75: string = 'منبع آماده مطالعه است';
export const text_9062f6b37236: string = 'می‌توانید فایل را باز کنید.';
export const text_648088524f50: string = 'آماده‌سازی برای دستیار';
export const text_0dedf6e33c3a: string = 'هنوز قابل انتخاب در گفتگو نیست.';
export const text_3e03d2938fc8: string = 'آماده‌شدن فایل با آماده‌شدن آن برای دستیار متفاوت است.';
export const text_6eac88da3f07: string = 'تکلیف‌های من';
export const text_6de70e0704b0: string = 'فهرست فعالیت‌های مجاز و نتیجه‌های منتشرشده.';
export const text_83ee6ecaf2fb: string = 'یادگیری در کارگاه';
export const text_c36b5e4532ad: string = 'کارگاه داستان‌نویسی · کلاس مستقل';
export const text_b939a4769d19: string = 'این هفته';
export const text_a11316da1388: string = 'یک تکلیف، یک فرصت تازه';
export const text_a3d77fe95c5c: string = 'از یک اتفاق کوچک، روایتی متفاوت بسازید.';
export const text_51deae018e1e: string = 'روایت یک اتفاق کوچکمهلت: ۱۴ آبان، ۲۳:۵۹باقی مانده';
export const text_52f6f26e8307: string = 'مهلت: ۱۴ آبان، ۲۳:۵۹';
export const text_de33180e0ac8: string = 'شخصیت در یک جملهپاسخ در ۱۰ آبان ثبت شد.در بررسی';
export const text_16e41bdb75bf: string = 'شخصیت در یک جمله';
export const text_e2c5b79cc6c8: string = 'پاسخ در ۱۰ آبان ثبت شد.';
export const text_126f6d0fa223: string = 'توصیف یک مکانبازخورد منتشر شده است.۱۸ از ۲۰';
export const text_7a8c40b46382: string = 'توصیف یک مکان';
export const text_48d2e2932123: string = 'بازخورد منتشر شده است.';
export const text_5fd27d43e5a1: string = '۱۸ از ۲۰';
export const text_ba1f1c9c6873: string = 'عضویت همین کلاس برای انجام فعالیت‌ها کافی است.';
export const text_6265e2a2b1ba: string = 'صورت و شرایط تکلیف';
export const text_13bd584da32e: string = 'مهلت، تلاش، نمره و فایل پیش از شروع.';
export const text_39dfe81bd2e0: string = 'تا ۱۴ آبان، ۲۳:۵۹';
export const text_531c9fe20fe1: string = 'تکلیف ۳ · نویسندگی مقدماتی';
export const text_257b757cfac5: string = 'داستانی در ۳۰۰ کلمه';
export const text_f77592e952a9: string =
  'یک اتفاق روزمره را از زاویه دید شخص دیگری روایت کنید. به دو جزئیات حسی توجه کنید.';
export const text_6678e5a59900: string = 'راهنمای تمرین.pdfPDF · ۲ صفحه';
export const text_5e0d7775d4fe: string = 'راهنمای تمرین.pdf';
export const text_114750c175e0: string = 'دریافت پیوست';
export const text_f02a70350822: string = 'نمره';
export const text_21248d2e7f05: string = '۱ از ۲';
export const text_da65469207b4: string = 'ارسال با تأخیر';
export const text_9c6c7b80cabe: string = 'مجاز نیست';
export const text_b7def38d53fb: string =
  'متن یا فایل پاسخ را وارد کنید؛ پیش از ثبت نهایی امکان بازبینی دارید.';
export const text_904b8ecec27f: string = 'متن و فایل پاسخ';
export const text_abf42d8313f8: string = 'پیش‌نویس، وضعیت فایل و بازبینی قبل از تحویل.';
export const text_dc4427357d5f: string = 'پیش‌نویس · هنوز تحویل نشده';
export const text_5912448dd545: string = 'فایل‌های پاسخ';
export const text_9025b8168874: string = 'روایت اول من.pdfآماده ارسال · ۱٫۲ مگابایت';
export const text_255c82111b9d: string = 'آماده ارسال · ۱٫۲ مگابایت';
export const text_381e90e50059: string = 'افزودن پیوستPDF یا تصویر · حداکثر ۱۰ مگابایت';
export const text_164efa525175: string = 'PDF یا تصویر · حداکثر ۱۰ مگابایت';
export const text_d394f8b8f686: string =
  'پیش‌نویس در ۱۰:۴۲ ذخیره شد؛ تحویل نهایی با دکمه پایین انجام می‌شود.';
export const text_ce2290f9b842: string = 'متن و فایل پاسخم را بازبینی کرده‌ام.';
export const text_23576c6957cc: string = 'هویت مرکزی، منابع و نقش‌های مجاز.';
export const text_684e49e5e394: string = 'حساب و ترجیحات شما';
export const text_101643147275: string = 'اطلاعات حسابنام، شناسه و اطلاعات تماس';
export const text_4d243307cfeb: string = 'نام، شناسه و اطلاعات تماس';
export const text_5746464ca860: string = 'فضاها و نقش‌های منآفتاب: دانش‌آموز · ۲ کلاس مستقل';
export const text_5b4c73e4b80c: string = 'آفتاب: دانش‌آموز · ۲ کلاس مستقل';
export const text_d1280f9190e9: string = 'منابع منفایل‌ها و آمادگی مطالعه';
export const text_ed7292b2a124: string = 'فایل‌ها و آمادگی مطالعه';
export const text_fe062dab9fc3: string = 'حریم خصوصی و امنیتارتباط، دستگاه‌ها و نشست‌ها';
export const text_54ffdb0ffaca: string = 'ارتباط، دستگاه‌ها و نشست‌ها';
export const text_ccb907e2fd34: string = 'اعلان و ظاهرروشن، تاریک یا مطابق دستگاه';
export const text_67ae30667a6d: string = 'روشن، تاریک یا مطابق دستگاه';
export const text_d5f7b06b5f06: string = 'دستگاه فعلی و پایان نشست‌های دیگر.';
export const text_57c9d4b05cac: string = 'دستگاه‌ها و نشست‌های فعال';
export const text_b0271cce7a0b: string = 'کنترل حساب با شماست';
export const text_f9256cc5b859: string = 'نشست‌های ناشناس را پایان دهید.';
export const text_ceebb65e804c: string = 'این دستگاهگوشی اندروید · اکنون فعالفعلی';
export const text_8088a8a78123: string = 'گوشی اندروید · اکنون فعال';
export const text_867f52f0af55: string = 'فعلی';
export const text_72096572f8af: string = 'مرورگر رایانهآخرین فعالیت: امروز، ۰۹:۱۰';
export const text_7aad77a62f47: string = 'آخرین فعالیت: امروز، ۰۹:۱۰';
export const text_8c4a2b2d0512: string = 'گوشی قبلیآخرین فعالیت: ۵ آبان';
export const text_f06af6b5e203: string = 'آخرین فعالیت: ۵ آبان';
export const text_47f63cbbb8d4: string = 'پایان یک نشست، شما را فقط از همان دستگاه خارج می‌کند.';
export const text_b56e5c5c8a4d: string = 'اگر دستگاهی را نمی‌شناسید';
export const text_3ce91278e771: string = 'ابتدا جزئیات نشست را ببینید و سپس آن را پایان دهید.';
export const text_8a895625b2bd: string = 'حریم ارتباط';
export const text_2a3baf75afca: string = 'تنظیم ارتباط از عضویت کلاس جداست.';
export const text_fa701fd3a138: string = 'چه کسی می‌تواند با شما ارتباط بگیرد؟';
export const text_7216d76aede3: string = 'اجازه پیام شخصی';
export const text_8525e4a10b8a: string = 'مخاطبان و ارتباط‌های مجاز';
export const text_f563ac5aa4a6: string = 'مخاطبان و ارتباط‌های مجاز ';
export const text_93970599fe59: string = 'طبق تنظیمات ارتباط من';
export const text_f8b2d3e508f8: string = 'طبق تنظیمات ارتباط من ';
export const text_19b8e1e688fb: string = 'حساب‌های مسدودشده۲ حساب';
export const text_7e1aecd3e641: string = '۲ حساب';
export const text_ff6602019ede: string = 'شرایط ارتباطصلاحیت حساب و رابطه‌های مجاز';
export const text_56ad88786655: string = 'رابطه والد و فرزندمشاهده و مدیریت رابطه معتبر';
export const text_d1980174c8ab: string = 'پیش‌نمایش اعلان پیام';
export const text_133c2cbafb82: string = 'متن پیام روی صفحه قفل نمایش داده شود.';
export const text_16bb7a02b995: string =
  'پیش‌نمایش اعلان پیاممتن پیام روی صفحه قفل نمایش داده شود.';
export const text_1c002e66c5ae: string =
  'عضویت در یک کلاس به‌تنهایی اجازه پیام خصوصی یا دسترسی والد به محتوای آن را ایجاد نمی‌کند.';
export const text_4eb7db9e8904: string = 'فوق‌برنامه تاریک';
export const text_2bd2050e3048: string = 'همان مدل اطلاعات و اقدام اصلی.';
export const text_6446953ee9e4: string = 'پیام‌ها تاریک';
export const text_74d1c9a20879: string = 'نخوانده، خلاصه و وابستگی کلاس خوانا می‌مانند.';
export const text_75f7bd9c0375: string = 'دستیار تاریک';
export const text_3b62a407a303: string = 'انتخاب منبع و شروع گفتگو در همان جای آشنا.';
export const text_d1de519e9c0c: string = 'قطع اتصال با داده قبلی';
export const text_cff21919ee0d: string = 'آخرین داده با هشدار واضح؛ تغییر حساس متوقف.';
export const text_ce769fa4e646: string =
  'اتصال برقرار نیست. آخرین اطلاعات ذخیره‌شده نمایش داده می‌شود.';
export const text_4f0e8f13013f: string = 'دریافت اطلاعات تازه ممکن نشد.';
export const text_970a025debd1: string =
  'تا اتصال دوباره، تغییر اعضا یا ثبت درخواست انجام نمی‌شود.';
export const text_100b1ae08aff: string = 'جستجوی بدون نتیجه';
export const text_746d04a87a6a: string = 'حالت خالی با علت و راه پاک‌کردن فیلتر.';
export const text_02a2fa47cdc4: string = 'شایان';
export const text_02e14258d502: string = 'عضوی با این نام پیدا نشد';
export const text_52e86b452aef: string = 'املای نام را بررسی کنید یا جستجو را پاک کنید.';
export const text_14964c662dcb: string = 'جستجو فقط در اعضای همین کلاس انجام می‌شود.';
export const text_6285de3b58ba: string = 'تعارض هنگام ویرایش';
export const text_5b23b5207ebf: string = 'متن حفظ می‌شود؛ تصمیم روی نسخه تازه.';
export const text_3c4420d8d1f2: string = 'ویرایش قواعد کلاس';
export const text_37b71a6b0eef: string = 'احترام به نوشته‌ها و بازخورد روشن و محترمانه.';
export const text_1cf982ef60d2: string = '۸';
export const text_dc2a967a6189: string = 'ظرفیت از ۱۲ عضو فعال کمتر است.';
export const text_5dee5b4e6d78: string =
  'اطلاعات تغییر کرده است. پیش از ذخیره، نسخه تازه را ببینید.';
export const text_7765bf2f4b66: string = 'اطلاعات تازه‌تری وجود دارد';
export const text_d810f488006f: string =
  'مدیر دیگری اطلاعات کلاس را تغییر داده است. متن شما حفظ شده؛ نسخه تازه را ببینید و دوباره تصمیم بگیرید.';
export const text_ab95ac03767e: string = 'مدیریت اعضای کلاس در دسکتاپ';
export const text_bb6b21f94c13: string =
  'MK-56 · مدیریت اعضای کلاس مستقل. دو فضای کلاس در حاشیه زمینه‌ای دیده می‌شوند؛ مدیریت گفتگو از عضویت کلاس جدا نمی‌شود.';
export const text_05c85e7054a4: string =
  'کلاس مستقل · مدیر هستید · آخرین دریافت اطلاعات: امروز ۱۰:۴۲';
export const text_4ef934f323d5: string = 'درخواست‌های عضویت · ۳';
export const text_c374f7ff9261: string = 'جستجوی نام اعضا';
export const text_f7546a426f3e: string = 'نام عضو';
export const text_59f45f17c1e6: string = 'تاریخ پیوستن';
export const text_cc56740dfe85: string = 'گزینه‌های ننازنین موسوی';
export const text_f678a4cf3b83: string = '۴ آبان';
export const text_657b1dc4fe16: string = 'گزینه‌های ممریم رضایی';
export const text_7a27c15d4784: string = '۳ آبان';
export const text_5ecc9a2a6601: string = 'گزینه‌های اامیر نادری';
export const text_b71217975599: string = '۲ آبان';
export const text_1c9a8a6edf7a: string = 'گزینه‌های سسارا احمدی';
export const text_4627c26331e3: string = 'نمایش ۴ نفر از ۱۲ عضو';
export const text_c35ae40ef538: string = '۳ درخواست تازه';
export const text_7f17709d0f51: string =
  'افراد قبل از پذیرش، به پیام‌ها و فایل‌های کلاس دسترسی ندارند.';
export const text_906a343e339c: string = 'فضاهای همین کلاس';
export const text_c2f5683965c7: string = 'گروه گفتگو۱۲ عضو · آماده';
export const text_60abba838aa4: string = '۱۲ عضو · آماده';
export const text_fab29fe11332: string = 'کانال کلاساطلاعیه‌ها · آماده';
export const text_8a5f469ef128: string = 'اطلاعیه‌ها · آماده';
export const text_1440016dff4d: string = 'فعلاً مدرسی تعیین نشده است.';
export const text_e2a74744ef83: string = 'متن درشت‌تر';
export const text_4b2928154e4e: string = 'نام بلند چندخطی می‌شود؛ ردیف ارتفاع می‌گیرد.';
export const text_d7e673051b8f: string = 'جستجوی اعضا';
export const text_be55812cfbf6: string = 'ننازنین موسوی احمدآبادیعضو آموزشی · از امروز';
export const text_8842304bda18: string = 'نازنین موسوی احمدآبادی';
export const text_613ebaad2302: string = 'ممریم رضاییمدیر کلاس';
export const text_085174a251de: string = 'اامیر نادریعضو آموزشی';
export const text_729857a0d958: string = 'تمرکز و برچسب ثابت';
export const text_b2ae3132c4b6: string = 'کادر تمرکز مستقل از رنگ و راهنمای زیر فیلد.';
export const text_17a96be728f5: string = 'نام کلاس، الزامی';
export const text_a0c1bafc70be: string = 'این جمع قرار است چه چیزی یاد بگیرد؟';
export const text_a50a7b15d696: string =
  'ثبت فرم، هنوز به معنی تشکیل کلاس نیست. نتیجه بررسی را در درخواست‌های من می‌بینید.';
export const text_2dca41bc1523: string = 'بدون آموزشگاه';
export const text_894aa12903bb: string = 'حالت مجاز و قابل استفاده، نه خطای دسترسی.';
export const text_20c131b8bbcb: string =
  'دعوت آموزشگاه را دریافت کنید یا کلاس مستقل خودتان را مدیریت کنید.';
export const text_3081b090b6e1: string = 'دعوتی دریافت کرده‌اید؟';
export const text_00eb5e23fa28: string = 'دعوت‌های آموزشگاه در همین بخش نمایش داده می‌شوند.';
export const text_b70ec4ed1525: string = 'بررسی دعوت‌ها';
export const text_d4b9164503d4: string = 'کلاس مستقل دارید';
export const text_22be7811a478: string = 'فوق‌برنامه به عضویت آموزشگاه نیاز ندارد.';
export const text_0674f35ca30c: string = 'رفتن به فوق‌برنامه';
export const text_13d850d1766d: string = 'ساخت تکلیف';
export const text_34f8682d0c2b: string = 'عنوان، صورت، مهلت، بارم و پیوست.';
export const text_b9d0c209d589: string = 'کلاس مستقل · مدیر مجاز آموزش';
export const text_090884b95f38: string = '۲ بار';
export const text_e6e611bb94a5: string = 'راهنمای تمرین.pdfپیوست صورت تکلیف';
export const text_fce70ebba891: string = 'پیوست صورت تکلیف';
export const text_4fd511daabad: string = 'مخاطبان و قواعد پیش از انتشار بازبینی می‌شوند.';
export const text_d5ed9be42658: string = 'ادامه: بازبینی انتشار';
export const text_c273a037526e: string = 'مخاطبان و قواعد پیش از ثبت نهایی دیده می‌شوند.';
export const text_64dedd5e71e6: string = 'بازبینی قبل از انتشار';
export const text_ad3584a6163c: string = 'تا ۱۴ آبان، ۲۳:۵۹ · نمره از ۲۰';
export const text_9fd2db3b5b3d: string = '۱۲ عضو مجاز فعلی';
export const text_df31ec136b67: string = 'تلاش و تأخیر';
export const text_75018c0c1f7a: string = '۲ تلاش · بدون تأخیر';
export const text_53e2eb645273: string = 'صورت و فایل';
export const text_54bb60d5d337: string = 'آماده انتشار';
export const text_822c7602d987: string = 'عنوان، مهلت و فایل‌ها را بازبینی کردم.';
export const text_60ffd397ec9f: string =
  'پس از انتشار، اعضای مجاز تکلیف را می‌بینند. تغییر مهم، نسخه تازه و اطلاع‌رسانی روشن می‌خواهد.';
export const text_596643f47d4c: string = 'اطلاع‌رسانی کلاس';
export const text_03f3682ca1bb: string =
  'اعلان شامل عنوان و پیوند تکلیف است؛ پاسخ و نمره خصوصی ارسال نمی‌شود.';
export const text_7bc62238175f: string = 'انتشار برای ۱۲ عضو';
export const text_7b1150661357: string = 'صف پاسخ‌ها';
export const text_421bf6077e09: string = 'وضعیت، عضو و تلاش قبل از ارزیابی روشن است.';
export const text_2a753e106c1b: string = 'پاسخ‌های تکلیف';
export const text_43dfd57542b6: string = 'روایت یک اتفاق کوچک · ارزیاب کلاس';
export const text_3159e38d5ce7: string = 'جستجوی نام عضو';
export const text_7f0434639e0a: string = '۹ تحویل از ۱۲ مخاطب · ۴ پاسخ منتظر بررسی';
export const text_9bb2a0753b8b: string = 'ننازنین موسویامروز ۱۰:۳۸ · تلاش اولتازه';
export const text_867126b3b469: string = 'امروز ۱۰:۳۸ · تلاش اول';
export const text_9864fbecdeae: string = 'ممریم رضاییامروز ۱۰:۱۲ · تلاش دومتازه';
export const text_d351baba2200: string = 'امروز ۱۰:۱۲ · تلاش دوم';
export const text_27338dc4b149: string = 'اامیر نادریدیروز ۲۱:۳۰ · تلاش اول';
export const text_b4afa44e5090: string = 'دیروز ۲۱:۳۰ · تلاش اول';
export const text_d8a5bb32fa37: string = 'رریحانه زمانیدیروز ۲۰:۱۰ · تلاش اول';
export const text_0e1bc5140a8c: string = 'دیروز ۲۰:۱۰ · تلاش اول';
export const text_4ab0cec97e39: string =
  'پاسخ و فایل فقط برای ارزیاب دارای اختیار همین کلاس باز می‌شود.';
export const text_e6b17d46496e: string = 'زمان و تلاش ثبت‌شده؛ بازیابی پس از قطع پاسخ شبکه.';
export const text_70248c0252f1: string = 'پاسخ شما تحویل شد';
export const text_ff60497e0486: string = 'با خیال راحت ادامه دهید';
export const text_bb3b94df6c9c: string = 'شماره رسید';
export const text_2c9a9bb4f54e: string = 'زمان ثبت';
export const text_c1dc05f648ff: string = '۱۲ آبان، ۱۰:۴۳';
export const text_2726836cff2a: string = 'تلاش';
export const text_4153c137cd5f: string = 'تحویل در مهلت';
export const text_45da2a7b5e9b: string = 'نتیجه پس از انتشار ارزیابی در همین صفحه در دسترس است.';
export const text_f9b5ca9aa190: string = 'مشاهده پاسخ ثبت‌شده';
export const text_482073af9cb8: string = 'نمره و بازخورد عضو از یادداشت خصوصی جداست.';
export const text_0cb34aad5e92: string = 'ارزیابی پاسخ نازنین';
export const text_9b7fc5479b0d: string = 'بخشی از پاسخ';
export const text_a3a742370fc5: string = 'صدای چرخ چمدان روی سنگ‌فرش می‌پیچید…';
export const text_da4efac531e7: string = 'روایت اول نازنین.pdfPDF · ۲ صفحه';
export const text_c615b420094d: string = 'روایت اول نازنین.pdf';
export const text_92e2730b04e7: string = 'یادداشت خصوصی با انتشار نتیجه نمایش داده نمی‌شود.';
export const text_bd99b8984c25: string = 'ذخیره ارزیابی';
export const text_413fa2934818: string = 'نتیجه عضو';
export const text_7e315f6278de: string = 'فقط نمره و بازخورد منتشرشده همین فرد.';
export const text_51c8d5f93650: string = 'نتیجه تکلیف من';
export const text_6d973a3bbc4b: string = 'بازخورد برای شما';
export const text_c51479e9b0f9: string = 'ارزیاب';
export const text_b4df84c67add: string = '۱۴ آبان، ۱۲:۲۰';
export const text_9e6d76c25d26: string = 'پاسخ و رسید منمتن و فایل ثبت‌شده';
export const text_cc8acf09d738: string = 'پاسخ و رسید من';
export const text_44781580034e: string = 'متن و فایل ثبت‌شده';
export const text_ccc7f6816069: string = 'سابقه نتیجهانتشار و اصلاح‌های مجاز';
export const text_d9a15717438e: string = 'انتشار و اصلاح‌های مجاز';
export const text_d274acfe4656: string = 'آزمون‌های کلاس';
export const text_33ec8365ae41: string = 'پیش رو، زمان بازشدن و نتیجه‌های منتشرشده.';
export const text_afa044bf5824: string = 'آزمون‌های کارگاه';
export const text_12a7573b6edf: string = 'آزمون امروز';
export const text_826fc257d80d: string = '۵ سؤال · ۱۵ دقیقه · نمره از ۲۰';
export const text_18cad73aee76: string = 'مرور شخصیت‌پردازیشروع: ۱۸ آبان، ساعت ۱۸هنوز باز نیست';
export const text_3f29075947be: string = 'مرور شخصیت‌پردازی';
export const text_62d96618d457: string = 'شروع: ۱۸ آبان، ساعت ۱۸';
export const text_31268f2f50bb: string = 'هنوز باز نیست';
export const text_75e68abd834a: string = 'مرور روایتنتیجه در ۹ آبان منتشر شده۱۷ از ۲۰';
export const text_51a5ce4e01fd: string = 'نتیجه در ۹ آبان منتشر شده';
export const text_e880e221ce3e: string = '۱۷ از ۲۰';
export const text_ce7490bcae28: string =
  'شروع، زمان آزمون را فعال می‌کند. پیش از آن شرایط را ببینید.';
export const text_67b4f9050543: string = 'شرایط شروع';
export const text_a511f452bf19: string = 'مدت، سؤال، تلاش و اثر قطع اتصال.';
export const text_91901552d2e3: string = 'شرایط آزمون';
export const text_fa885fde13b5: string = 'پیش از شروع آماده شوید';
export const text_f0285258e761: string = 'پاسخ‌ها در طول آزمون ذخیره و در پایان ثبت می‌شوند.';
export const text_44c91ffdeb8d: string = 'بازه دسترسی';
export const text_00c939ec356d: string = '۱۲ آبان، ۱۸ تا ۲۰';
export const text_637cb1ff3349: string = '۱۵ دقیقه از شروع';
export const text_05511efe59ae: string = 'پرسش‌ها';
export const text_d903756bdd3e: string = '۴ تستی و ۱ تشریحی';
export const text_355f47e6bb5e: string = '۱ بار';
export const text_40b6f0092b50: string = 'پس از انتشار ارزیاب';
export const text_f82d6634341d: string =
  'قطع اینترنت، زمان آزمون را متوقف نمی‌کند. وضعیت ذخیره هر پاسخ را می‌بینید.';
export const text_c3ecc04dc1c7: string = 'شرایط را خواندم و برای شروع آماده‌ام.';
export const text_eee5ff57e359: string = 'شروع آزمون ۱۵ دقیقه‌ای';
export const text_31616c60dde2: string = 'پاسخ به سؤال';
export const text_e3d98ab6ea0c: string = 'زمان باقی‌مانده و ذخیره تأییدشده از هم جدا هستند.';
export const text_c090d7c03357: string = 'آزمون کلاس مستقل · تلاش اول';
export const text_6260ec53e700: string = '۰۸:۴۲';
export const text_934d7cb3188e: string = 'پاسخ در ۱۸:۰۶ ذخیره شد.';
export const text_c07caa3410b7: string = 'مشخصات آزمون';
export const text_1bac50de990a: string = 'زمان، بازه، تلاش و سیاست نتیجه.';
export const text_7071eb7a0a9a: string = '۱۲ آبان، ساعت ۱۸ تا ۲۰';
export const text_28802c004c38: string = '۱۵ دقیقه';
export const text_a68bef18f152: string = 'نمایش نتیجه';
export const text_c60b87894c30: string = 'پس از انتشار توسط ارزیاب';
export const text_3872a925185b: string = 'پس از انتشار توسط ارزیاب ';
export const text_9bb0f70bde1f: string = 'نوع سؤال، بارم و پاسخ صحیح در مرحله بعد مشخص می‌شوند.';
export const text_1bad4ef60587: string =
  'ارقام و سیاست این پیش‌نمایش نمونه‌اند؛ قابل تثبیت برای محصول.';
export const text_6df6cc153673: string = 'ادامه: افزودن سؤال';
export const text_1a1139c129f0: string = 'ویرایش سؤال';
export const text_9bf63e01e8b8: string = 'نوع، گزینه و بارم؛ کلید فقط برای طراح.';
export const text_bd9db1a282fa: string = 'مرور زاویه دید · نسخه پیش‌نویس';
export const text_a2e761b61f18: string = 'مینا با لبخند تا در دوید.پاسخ صحیح';
export const text_cbc0e79ff5ff: string = 'پاسخ صحیح';
export const text_dc29193656f1: string = '۳ از مجموع ۲۰';
export const text_ea8cf063f897: string =
  'نشان پاسخ صحیح فقط برای طراح و ارزیاب مجاز نمایش داده می‌شود.';
export const text_62b2eae8445e: string = 'مخاطبان، مجموع بارم و پیش‌نمایش امن عضو.';
export const text_828b9c69f81e: string = 'بازبینی انتشار آزمون';
export const text_047abdd1a34f: string = '۱۲ مخاطب مجاز · کلاس مستقل';
export const text_1f957e275685: string = 'سؤال و نمره';
export const text_eb85ab7969cd: string = '۵ سؤال · ۲۰ نمره';
export const text_c1cbf2ddce78: string = 'زمان پاسخ';
export const text_ea91266e8172: string = 'پیش‌نمایش عضوبدون کلید پاسخ و یادداشت خصوصی';
export const text_9474c2bed6da: string = 'بدون کلید پاسخ و یادداشت خصوصی';
export const text_11bf4bbc39e6: string = 'قواعد و مخاطبانبازبینی پیش از انتشار';
export const text_89a39a6b9eb2: string = 'قواعد و مخاطبان';
export const text_9e74c3c2f6bd: string = 'بازبینی پیش از انتشار';
export const text_b3e7f85e4e13: string = 'صورت، بارم، زمان و مخاطبان را بازبینی کردم.';
export const text_ec513d66189f: string = 'تلاش‌های شروع‌شده به همین نسخه سؤال‌ها متصل می‌مانند.';
export const text_438eadb32837: string = 'بازگشت به سؤال بی‌پاسخ و تصمیم آگاهانه.';
export const text_2d29d2daea77: string = 'مرور پیش از ثبت';
export const text_b50d13f54dfe: string = '۰۲:۱۸';
export const text_0b3388645da1: string = '۴ پاسخ از ۵ سؤال';
export const text_1ac118dfe4e8: string = 'سؤال ۴ هنوز پاسخی ندارد.';
export const text_5b20f0ac6506: string = 'سؤال ۱گزینه ۲ · ذخیره‌شدهثبت شده';
export const text_617e1fc21952: string = 'سؤال ۱';
export const text_311af875402b: string = 'گزینه ۲ · ذخیره‌شده';
export const text_1ffe2feee879: string = 'ثبت شده';
export const text_26f8f9558605: string = 'سؤال ۲گزینه ۱ · ذخیره‌شدهثبت شده';
export const text_7fc16fbf8654: string = 'سؤال ۲';
export const text_0ce1c16788b4: string = 'گزینه ۱ · ذخیره‌شده';
export const text_fc887d863ff4: string = 'سؤال ۳گزینه ۲ · ذخیره‌شدهثبت شده';
export const text_d0a8a97779de: string = 'سؤال ۳';
export const text_0530ecd0e7c7: string = 'سؤال ۴هنوز پاسخی انتخاب نشدهبی‌پاسخ';
export const text_1a0360e77c9f: string = 'سؤال ۴';
export const text_bd340b62af51: string = 'هنوز پاسخی انتخاب نشده';
export const text_8f2831d3ee7c: string = 'سؤال ۵پاسخ تشریحی · ذخیره‌شدهثبت شده';
export const text_8276e7ab2b45: string = 'سؤال ۵';
export const text_a5583cfcb1d8: string = 'پاسخ تشریحی · ذخیره‌شده';
export const text_579ef776336e: string = 'پس از ثبت نهایی، پاسخ‌ها قابل ویرایش نیستند.';
export const text_8e0ddc2712d8: string = 'ثبت نهایی با یک سؤال بی‌پاسخ';
export const text_8f0021be2faf: string = 'رسید نهایی آزمون';
export const text_59ba1e932051: string = 'تعداد پاسخ پذیرفته‌شده و زمان معتبر پایان.';
export const text_aeb085852c72: string = 'پاسخ‌ها ثبت شدند';
export const text_45f55d8df0c1: string = 'مرور زاویه دید · تلاش اول';
export const text_a28d954344d9: string = 'زمان پایان';
export const text_b801e1bc3cf3: string = '۱۲ آبان، ۱۸:۱۳';
export const text_360696d9c505: string = 'پاسخ پذیرفته‌شده';
export const text_52a79b05b3e2: string = '۴ از ۵ سؤال';
export const text_b1d96d4d2584: string = 'نمره پس از انتشار ارزیاب نمایش داده می‌شود.';
export const text_12b05fb35545: string = 'مشاهده پاسخ‌های ثبت‌شده';
export const text_ff533899358d: string = 'نمره، بازخورد و سابقه نتیجه خود عضو.';
export const text_76bef33d5b3b: string = 'نتیجه آزمون من';
export const text_cb298a511cde: string = '۱۷';
export const text_4509c6d24efb: string = 'اول';
export const text_6f5ad4c422ce: string = '۱۳ آبان، ۱۲:۲۰';
export const text_fd6c0e472295: string = 'رسید و پاسخ مننسخه ثبت‌شده همین تلاش';
export const text_b8f4d420e9f5: string = 'رسید و پاسخ من';
export const text_0fd5971cde7e: string = 'نسخه ثبت‌شده همین تلاش';
export const text_c156d20243e0: string = 'سابقه نتیجهفقط رویدادهای مجاز';
export const text_da91ea7d7edf: string = 'فقط رویدادهای مجاز';
export const text_81c66601076d: string = 'تصحیح آزمون';
export const text_ddeaf4b32d5c: string = 'بخش خودکار، بخش تشریحی و نتیجه هنوز مخفی.';
export const text_c45520583dac: string = 'تصحیح آزمون نازنین';
export const text_ce97d0ad65a7: string = 'مرور زاویه دید · ارزیاب مجاز';
export const text_8acbabc41e30: string = 'پیش‌نویس تصحیح';
export const text_9dea144729fe: string = '۱۲ از ۱۲';
export const text_97716e64040f: string = '۴ سؤال تستی';
export const text_291179d9196e: string = 'سؤال ۵ · پاسخ عضو';
export const text_544e914675e8: string = 'تعریف روشن است؛ یک مثال کوتاه اضافه کنید.';
export const text_d2e2010132a6: string = 'جمع: ۱۷ از ۲۰';
export const text_f126135e6ee3: string = 'ذخیره تصحیح';
export const text_cacb907edd6e: string = 'اصلاح نتیجه';
export const text_d146a42655a1: string = 'دلیل و نسخه تازه؛ حفظ نتیجه قبلی در سابقه.';
export const text_435b54be27c2: string = 'اصلاح نتیجه منتشرشده';
export const text_664d88b69cc3: string = 'اصلاحیه · نسخه ۲';
export const text_0c110a732922: string = 'نتیجه قبلی';
export const text_2db3c23e1874: string = 'فعالیت';
export const text_284998e66e93: string = 'بارم بخش مثال دوباره بررسی و یک نمره افزوده شد.';
export const text_8da9a17ac3b8: string = 'نتیجه و علت اصلاح را بازبینی کردم.';
export const text_b1d6d64da3e9: string =
  'نتیجه قبلی در سابقه باقی می‌ماند. نسخه تازه و علت اصلاح برای عضو مجاز نمایش داده می‌شود.';
export const text_51e907073e65: string = 'نتیجه در تم تاریک';
export const text_138d34c36f1f: string = 'همان متن، وضعیت و دسترسی نمای روشن.';
export const text_2fc08ffe50bc: string = 'اتصال قطع در آزمون';
export const text_506443129a41: string = 'زمان ادامه دارد؛ پاسخ منتظر از ذخیره تأییدشده جداست.';
export const text_2507c948c1f2: string = 'اتصال قطع است؛ زمان آزمون ادامه دارد.';
export const text_942c4fe51e5a: string = '۰۸:۱۲';
export const text_aabb39b5ed45: string = '۱ تغییر منتظر ارسال است.';
export const text_3738ed1f5219: string = 'آخرین ذخیره تأییدشده';
export const text_378722d82f1c: string = 'سؤال‌های ۱ و ۲ · ساعت ۱۸:۰۵';
export const text_cc18784c4938: string =
  'پاسخ انتخاب‌شده روی این دستگاه حفظ شده؛ تا تأیید سرور، تحویل‌شده محسوب نمی‌شود.';
export const text_872407bb99b8: string = 'تغییر مجوز عضویت';
export const text_0b1fa6d3afba: string = 'توقف ارسال تازه و حفظ سابقه پذیرفته‌شده.';
export const text_1a42ed945d1d: string = 'دسترسی کلاس تغییر کرد';
export const text_b4f04ce02e44: string = 'عضویت شما فعال نیست';
export const text_a524087d5dbe: string = 'ارسال پاسخ، شروع آزمون و دریافت تازه فایل در دسترس نیست.';
export const text_8ebf66094b17: string = 'پاسخ قبلی چه می‌شود؟';
export const text_523cddf07cc6: string =
  'پاسخ‌های پذیرفته‌شده و رسیدها طبق سیاست کلاس نگهداری می‌شوند. دسترسی تازه‌ای ایجاد نمی‌شود.';
export const text_3cf8cdd24dc3: string = 'مشاهده وضعیت عضویت';
export const text_016efe39e086: string = 'هنوز فعالیتی نیست';
export const text_244d68acc3dd: string = 'صفحه خالی با علت، مسیر بازگشت و گفتگو.';
export const text_47127602b595: string = 'تکلیف‌های کلاس';
export const text_33613daaf4a9: string = 'جستجو در تکلیف‌ها';
export const text_34ef89e4ecee: string = 'هنوز تکلیفی منتشر نشده';
export const text_7ebac44cf8f6: string =
  'بعد از انتشار، تکلیف‌های مجاز همین کلاس اینجا نمایش داده می‌شوند.';
export const text_8ca1eb02c298: string = 'گفتگو همچنان در دسترس است';
export const text_047d29efa5c5: string = 'می‌توانید پرسش خود را در گروه همین کلاس مطرح کنید.';
export const text_11c093c0ad5d: string = 'میز کار تکلیف در کلاس مستقل';
export const text_df68f150a0b4: string =
  'MK-81 · میز کار تکلیف در کلاس مستقل؛ همه مقدارها نمونه‌اند.';
export const text_5ed6e9672cb5: string = 'کلاس مستقل · مدیر با اختیار آموزشی · ۱۲ عضو';
export const text_499cecb195bd: string = 'عنوان یا نام عضو';
export const text_4bc9c6cc6260: string = '۱۴ آبان';
export const text_485c4c27a329: string = '۹ از ۱۲';
export const text_0490da67672c: string = '۴ پاسخ تازه';
export const text_9824a4879775: string = '۱۰ آبان';
export const text_42a76b6b6694: string = '۷ آبان';
export const text_57573d1b2ca1: string = '۱۱ از ۱۲';
export const text_b3d8bfc01aff: string = 'پایان متفاوت';
export const text_84a1ffa02e9f: string = '۱۸ آبان';
export const text_76d9ba830181: string = 'نتیجه فقط پس از انتشار دیده می‌شود';
export const text_22137bf3491b: string = 'ذخیره ارزیابی و انتشار نتیجه، دو اقدام جدا هستند.';
export const text_61b458ecb110: string = '۴ پاسخ منتظر بررسی';
export const text_d68582831da1: string = 'پاسخ‌های اعضای همین کلاس را ارزیابی کنید.';
export const text_8531593b9ed8: string = 'نقش و زمینه';
export const text_add9d0105b7d: string = 'سارا احمدی · مدیر کلاس';
export const text_950bd5b1f597: string = 'اختیار طراحی و ارزیابی فعال است.';
export const text_4395f6ab77a8: string = 'مدرس هنوز تعیین نشده است.';
export const text_d5d11900494b: string = 'فضاهای کلاس';
export const text_0c32a25c959b: string = 'گروه گفتگوهمان گروه متصل کلاس';
export const text_cdb5549439b0: string = 'همان گروه متصل کلاس';
export const text_3512a39459aa: string = 'کانال کلاساعلان بدون نمره خصوصی';
export const text_67dc2a939c3d: string = 'اعلان بدون نمره خصوصی';
export const text_af674583d990: string = 'ویرایشگر آزمون مستقل در دسکتاپ';
export const text_7792612e6772: string =
  'MK-82 · ویرایشگر آزمون مستقل؛ کلید و ابزار انتشار در نمای عضو وجود ندارند.';
export const text_f4f31ad0b27f: string = 'کلاس مستقل · پیش‌نویس آزمون · نسخه ۱';
export const text_2ff334764384: string = '۵ سؤال';
export const text_e0adddb056a6: string = 'سؤال ۱تستی · ۳ نمره';
export const text_1b6a8fab9cba: string = 'تستی · ۳ نمره';
export const text_bec1e6442493: string = 'سؤال ۲تستی · ۳ نمره';
export const text_7577b8ccb413: string = 'سؤال ۳تستی · ۳ نمره';
export const text_5269cc697733: string = 'سؤال ۴تستی · ۳ نمره';
export const text_232aed89e0ee: string = 'سؤال ۵تشریحی · ۸ نمره';
export const text_52d36c226f35: string = 'تشریحی · ۸ نمره';
export const text_55a7d18593cd: string = 'کلید پاسخ فقط برای طراح و ارزیاب مجاز است.';
export const text_b338309e27f3: string = 'تنظیمات آزمون';
export const text_ef3f1829b567: string = '۱۲ عضو مجاز';
export const text_fcf09ee7ff58: string = 'پس از انتشار';
export const text_2477b8162171: string = 'نسخه بدون کلید و یادداشت خصوصی را بازبینی کنید.';
export const offline_pageTitle: string = 'ماکان؛ ارتباط قطع است';
export const offline_heading: string = 'ارتباط اینترنت برقرار نیست';
export const offline_description: string =
  'برای مشاهده اطلاعات به‌روز و انجام کارهای پنل، اتصال اینترنت لازم است. پس از اتصال دوباره تلاش کنید.';
export const offline_retry: string = 'تلاش دوباره';
export const notification_title: string = 'اعلان تازه در ماکان';
export const notification_description: string = 'برای مشاهده اعلان و جزئیات آن، پنل را باز کنید.';
export const integration80c = {
  chooseTeacher: 'انتخاب مدرس پیشنهادی',
  teacherProposal:
    'این انتخاب، پیشنهاد مدرس برای درخواست تشکیل است. نقش و اختیار آموزشی پس از تشکیل، جداگانه تعیین می‌شوند.',
  requests: 'درخواست‌های تشکیل کلاس',
  draft: 'ذخیرهٔ پیش‌نویس',
  submit: 'ارسال درخواست',
  saved: 'درخواست ثبت شد.',
  refresh: 'بازخوانی وضعیت',
  edit: 'ویرایش درخواست',
  cancel: 'لغو درخواست',
  purpose: 'هدف تشکیل کلاس',
  capacity: 'ظرفیت فراگیران',
  reason: 'دلیل اقدام',
  versionConflict:
    'اطلاعات تغییر کرده است. وضعیت تازه را بررسی و دوباره تأیید کنید؛ نوشتهٔ شما حفظ شده است.',
  retry: 'تلاش دوباره',
  created: 'کلاس تشکیل‌شده',
  noRequests: 'هنوز درخواستی ثبت نشده است.',
  states: {
    Draft: 'پیش‌نویس',
    Submitted: 'ارسال‌شده',
    UnderReview: 'در حال بررسی',
    NeedsChanges: 'نیازمند اصلاح',
    Approved: 'تأییدشده',
    Rejected: 'ردشده',
    Cancelled: 'لغوشده',
    Active: 'فعال',
    Suspended: 'تعلیق‌شده',
    Archived: 'بایگانی‌شده',
    Pending: 'در انتظار',
    Accepted: 'پذیرفته‌شده',
    Declined: 'ردشده',
    Expired: 'منقضی‌شده',
    Revoked: 'لغوشده',
    Provisioning: 'در حال آماده‌سازی',
    Ready: 'آماده',
    Failed: 'ناموفق',
    Unknown: 'وضعیت جدید',
  } as Record<string, string>,
  status: 'وضعیت',
  history: 'تاریخچه',
  members: 'اعضای کلاس',
  invite: 'دعوت عضو',
  invitations: 'دعوت‌های کلاس',
  accept: 'پذیرش',
  decline: 'رد دعوت',
  revoke: 'لغو دعوت',
  join: 'درخواست عضویت',
  joins: 'درخواست‌های عضویت',
  approve: 'تأیید عضویت',
  reject: 'رد درخواست',
  pendingMember: 'دعوت در انتظار پذیرش است؛ عضویت هنوز فعال نشده است.',
  spaces: 'گروه و کانال کلاس',
  group: 'گروه کلاس',
  channel: 'کانال کلاس',
  repair: 'درخواست آماده‌سازی دوباره',
  repairPending: 'درخواست آماده‌سازی دریافت شد؛ وضعیت از سرور پیگیری می‌شود.',
  settings: 'تنظیمات کلاس',
  accepting: 'پذیرش درخواست عضویت',
  save: 'ذخیرهٔ تغییرات',
  activate: 'فعال‌سازی کلاس',
  suspend: 'تعلیق کلاس',
  archive: 'بایگانی کلاس',
  roles: 'نقش‌های محلی',
  learner: 'فراگیر',
  teacher: 'مدرس',
  manager: 'مدیر کلاس',
  remove: 'پایان عضویت',
  grants: 'اختیار آموزشی',
  authorAssignments: 'طراحی تکلیف',
  authorExams: 'طراحی آزمون',
  grade: 'ارزیابی و نمره‌دهی',
  grantHint: 'نقش مدرس یا مدیر به‌تنهایی اختیار آموزشی ایجاد نمی‌کند.',
  transfer: 'انتقال مدیریت',
  transferTarget: 'عضو مقصد انتقال',
  transferAccept: 'پذیرش مدیریت',
  transferDecline: 'رد انتقال مدیریت',
  noItems: 'موردی برای نمایش وجود ندارد.',
  learning: 'آموزش کلاس',
  assignments: 'تکلیف‌ها',
  exams: 'آزمون‌ها',
  open: 'مشاهده',
  title: 'عنوان کلاس',
  description: 'شرح کلاس',
  target: 'شماره همراه یا نام کاربری مخاطب',
  viewRequest: 'مشاهدهٔ درخواست',
  formationHint: 'ارسال درخواست به معنی تأیید یا آماده‌بودن گروه و کانال نیست.',
  managerAccepted: 'پذیرش مدیریت',
  yes: 'بله',
  no: 'خیر',
  permissionsUnavailable: 'اختیار این اقدام در پاسخ فعلی سرور وجود ندارد.',
  action: 'تأیید اقدام',
  name: 'شناسهٔ عضو',
  changed: 'ذخیره شد.',
  localDraft: 'پیش‌نویس روی این دستگاه',
  incomplete: 'عنوان، هدف تشکیل و ظرفیت معتبر را وارد کنید.',
  expired: 'مهلت این دعوت گذشته است.',
  independent: 'کلاس مستقل',
  emptyBody: 'درخواست دریافت شد.',
  all: 'همه',
};
export const vnext = {
  activityKinds: { Lesson: 'جزوه', Assignment: 'تکلیف', Exam: 'آزمون', Session: 'جلسه' },
  sentInvitations: 'دعوت‌های ارسالی آموزشگاه',
  sentHint: 'دعوت‌های ارسال‌شده، وضعیت و انقضای آن‌ها از سرور بازیابی می‌شوند.',
  myInvitations: 'دعوت‌های من',
  invitationType: 'نوع دعوت',
  all: 'همه',
  status: 'وضعیت',
  Membership: 'عضویت آموزشگاه',
  PersonLink: 'اتصال پرونده',
  GuardianLink: 'رابطهٔ والد و فرزند',
  recipient: 'گیرنده',
  revoke: 'لغو دعوت',
  unavailableAction: 'برای این دعوت، عملیات لغو مجاز در دسترس نیست.',
  reason: 'دلیل تغییر',
  manageRoles: 'مدیریت نقش‌ها و عضویت',
  roleAction: 'نوع تغییر',
  grantRole: 'افزودن نقش',
  changeRole: 'تغییر یک نقش',
  endRole: 'پایان یک نقش',
  endMembership: 'پایان عضویت آموزشگاه',
  activeRole: 'نقش فعال مورد تغییر',
  newRole: 'نقش جدید',
  roleHint:
    'تغییر یک نقش با پایان کل عضویت فرق دارد. حساب و دارایی‌های شخصی حذف نمی‌شوند. آخرین مدیر فعال باید حفظ شود.',
  confirmMutation: 'تأیید تغییر',
  confirmRole:
    'تغییر نقش یا عضویت با دلیل و نسخهٔ فعلی انجام می‌شود. نتیجه را پس از تأیید سرور نمایش می‌دهیم.',
  refreshVersion: 'بازخوانی و پذیرش نسخهٔ تازه',
  refreshSettings: 'بازخوانی اطلاعات',
  saved: 'تغییر با تأیید سرور ثبت شد.',
  close: 'بستن',
  classSettings: 'ویرایش مشخصات کلاس',
  classSettingsTitle: 'تنظیمات کلاس',
  saveClassSettings: 'ذخیره تنظیمات',
  confirmCapacityTitle: 'ثبت تغییر ظرفیت',
  settingsConflictTitle: 'تنظیمات تازه‌تر است',
  previousCapacity: 'ظرفیت قبلی',
  nextCapacity: 'ظرفیت تازه',
  activeEnrollment: 'ثبت‌نام فعال',
  capacityPolicy: 'تغییر ظرفیت، فردی را خودکار ثبت‌نام یا حذف نمی‌کند.',
  confirmSettings: 'ثبت تغییر',
  reviewLatest: 'دیدن نسخه تازه',
  classSettingsHint: 'پیش از ذخیره، عنوان و ظرفیت کلاس را بررسی کنید.',
  title: 'عنوان کلاس',
  capacity: 'ظرفیت کلاس',
  save: 'ذخیرهٔ تغییرات',
  emptyVersion: 'امکان ذخیرهٔ تغییرات فعلاً فراهم نیست. اطلاعات کلاس را دوباره دریافت کنید.',
  contentActivities: 'فعالیت محتوایی معلمان',
  teacher: 'معلم',
  contentKind: 'نوع محتوا',
  from: 'از تاریخ',
  to: 'تا تاریخ',
  revision: 'ویرایش انتشار',
  publicationTime: 'زمان انتشار',
  empty: 'موردی برای نمایش وجود ندارد.',
  examDiscovery: 'آزمون‌ها و پیش‌نویس‌های مجاز',
  examDiscoveryHint:
    'فهرست و فیلتر وضعیت از سرور خوانده می‌شوند؛ پیش‌نویس فقط برای نویسندهٔ مجاز است.',
  searchExams: 'جستجوی عنوان آزمون',
  invitationFrom: 'دعوت‌کننده',
  guardian: 'والد',
  unnamedGuardian: 'نام والد در پاسخ سرور موجود نیست',
  delegatedHint:
    'فقط اختیار آموزشی مؤثر خودتان را می‌توانید به معلم فعال تفویض کنید. انتقال مدیریت، اختیار آموزشی را منتقل نمی‌کند.',
  noDelegation: 'اختیار آموزشی مؤثری برای تفویض در پاسخ فعلی ندارید.',
  paymentUnavailable:
    'پرداخت در این محیط آماده نیست؛ پیش‌فاکتور به معنی امکان پرداخت یا فعال‌شدن اشتراک نیست.',
  lastManager: 'آخرین مدیر فعال آموزشگاه قابل حذف یا پایان نیست؛ ابتدا مدیر مجاز دیگری تعیین کنید.',
  capacityConflict:
    'ظرفیت پیشنهادی با اعضای فعال کلاس سازگار نیست؛ نسخه و فهرست اعضا را بازبینی کنید.',
  delegationDenied: 'این اختیار خارج از مجوز مؤثر شماست یا دریافت‌کننده، معلم فعال مجاز نیست.',
  pushUnavailable:
    'دریافت اعلان در این مرورگر اکنون در دسترس نیست. ترجیح اعلان حساب شما جداگانه ذخیره می‌شود.',
};
export const messagingInvitations = {
  title: 'دعوت‌های پیام‌رسان',
  empty: 'دعوتی در انتظار پذیرش ندارید.',
  pending: 'دعوت به گروه یا کانال',
  explanation: 'تا پیش از پذیرش، عضو گفتگو نیستید و آن گفتگو در فهرست پیام‌ها نمایش داده نمی‌شود.',
  expires: 'مهلت پذیرش:',
  expired: 'مهلت این دعوت تمام شده است.',
  accept: 'پذیرش و ورود به گفتگو',
  decline: 'رد دعوت',
  busy: 'در حال ثبت پاسخ…',
  received: 'دعوت دریافتی',
  declined: 'دعوت رد شد.',
  refresh: 'بازخوانی دعوت‌ها',
  pendingCreatorExplanation:
    'عضویت این افراد پس از پذیرش از بخش «دعوت‌های پیام‌رسان» حساب خودشان فعال می‌شود.',
};
export const messagingPrivacyDefaults = {
  everyone: 'استفاده از پیش‌فرض «همه»',
  unsaved:
    'پیش‌فرض پیشنهادی «همه» است. برای اعمال آن روی حساب، «ثبت تنظیمات» را بزنید؛ تنظیم مؤثر سرور تا آن زمان تغییر نمی‌کند.',
};
export const messagingWorkspace = {
  title: 'انتخاب فضای آموزشگاه برای این گفتگو',
  explanation:
    'این گفتگو به آموزشگاه تعلق دارد. برای باز کردن آن، فضای مجاز همان آموزشگاه را انتخاب کنید. گفتگو در فهرست پیام‌ها باقی می‌ماند.',
  unresolvedTitle: 'گفتگو در فضای فعلی پیدا نشد',
  unresolvedExplanation:
    'اگر این گفتگو مربوط به آموزشگاه است، فضای مجاز آن را انتخاب کنید. نبودن گفتگو یا لغو دسترسی نیز می‌تواند همین خطا را ایجاد کند؛ انتخاب فضا به‌تنهایی دسترسی تازه‌ای نمی‌دهد.',
  select: 'انتخاب فضا و باز کردن گفتگو',
  changing: 'در حال تغییر فضا…',
  noMatchingWorkspace:
    'در حال حاضر فضای قابل ورودِ این آموزشگاه برای حساب شما موجود نیست. فضاها را بازخوانی کنید یا وضعیت عضویت را با مدیر آموزشگاه بررسی کنید.',
  noAlternativeWorkspace:
    'فضای مجاز دیگری برای انتخاب موجود نیست. ممکن است گفتگو حذف شده باشد یا دسترسی شما پایان یافته باشد.',
  back: 'بازگشت به پیام‌ها',
  refresh: 'بازخوانی فضاهای مجاز',
};
export const text_25c0dfd543f5: string = ' (@';
export const text_68d0d2d4295d: string = 'بررسی پلتفرم: اطلاعات و تصمیم کنار هم';
export const text_35314d58d337: string = 'دسکتاپ آموزش: یک کلاس، یک میز کار';
export const text_27f7df555ee6: string = 'دسکتاپ آزمون: سؤال، نسخه و تنظیمات کنار هم';
export const text_52a88a8355fe: string = 'دسکتاپ: ابزار مدیریت، با فضای کافی';
export const text_d57945ddd494: string =
  'ورود عمیق؛ بازگشت به جای قبلی. تأیید موفق پس از پاسخ معتبر؛ خطا در همان زمینه.';
export const text_330f8bea77af: string = 'فضای آموزشی شما';
export const text_1c85b5de6651: string = 'هر نقش فقط در همان آموزشگاه اعمال می‌شود.';
export const text_4073a5b5adb4: string = 'آموزشگاه آفتابدانش‌آموز · انتخاب فعلیفعال';
export const text_34a8113e2caa: string = 'آموزشگاه آفتاب';
export const text_2a49df12a3ac: string = 'دانش‌آموز · انتخاب فعلی';
export const text_fa45570da991: string = 'آموزشگاه بارانوالد · یک فرزند مجاز';
export const text_9908f8bf5766: string = 'آموزشگاه باران';
export const text_3b7636f61ba7: string = 'والد · یک فرزند مجاز';
export const text_5bf831321c95: string = 'دعوت‌های منیک دعوت برای بررسی۱';
export const text_7ea6c564a901: string = 'یک دعوت برای بررسی';
export const text_9c17e9d26f15: string = 'تغییر فضای فعال';
export const text_c9c794892952: string = 'آفتاب · دانش‌آموزکلاس‌ها و برنامه خودم';
export const text_3177228a871a: string = 'آفتاب · دانش‌آموز';
export const text_2cca8bdf1845: string = 'کلاس‌ها و برنامه خودم';
export const text_afcaaa456fef: string = 'باران · والدگزارش مجاز فرزندم';
export const text_01cbdb42a0c4: string = 'باران · والد';
export const text_946d31fabe30: string = 'گزارش مجاز فرزندم';
export const text_fa25be26ffc3: string = 'با تغییر فضا، گفتگوی شخصی و کلاس مستقل شما عوض نمی‌شود.';
export const text_ba1eca2da84f: string = 'انتخاب فضا';
export const text_8412aa045b10: string = 'دعوت آموزشگاه';
export const text_2f558752ce81: string = 'دعوت‌شونده';
export const text_855a02a8ab01: string = 'دعوت برای نقش دانش‌آموز';
export const text_362dbd435fff: string = 'فرستنده';
export const text_3245a3d612e9: string = 'اعتبار';
export const text_b24e3ca667e5: string = 'تا ۲۰ آبان';
export const text_02f06dbeed4c: string = 'در انتظار پاسخ';
export const text_03e7b22df22c: string = 'مشخصات و نقش پیشنهادی را بررسی کردم.';
export const text_5a675b9dd1d1: string = 'نمی‌پذیرم';
export const text_b14ec907eca3: string = 'دانش‌آموز · آفتاب';
export const text_d680f8158b80: string = 'نام کلاس یا درس';
export const text_adaefe90bf42: string = 'ریاضی دهمشنبه و دوشنبه · مریم رضاییفعال';
export const text_3f1de6cba35e: string = 'شنبه و دوشنبه · مریم رضایی';
export const text_800a2a4a81f8: string = 'فیزیک دهمسه‌شنبه · امیر نظری';
export const text_eb7c9eedad93: string = 'فیزیک دهم';
export const text_81e43f895741: string = 'سه‌شنبه · امیر نظری';
export const text_16ec3959636a: string = 'ادبیات فارسیچهارشنبه · لیلا موسوی';
export const text_c7f5edae586a: string = 'ادبیات فارسی';
export const text_be7a76300bda: string = 'چهارشنبه · لیلا موسوی';
export const text_98f2cb9cd47f: string = 'کلاس‌های تدریس';
export const text_7c72232851fd: string = 'مدرس · آفتاب';
export const text_f4044f423956: string = 'کارهای من';
export const text_9559da4ade6c: string = 'جلسه امروز';
export const text_9e67a401ae9f: string = 'ریاضی دهم۲۴ دانش‌آموز · ترم پاییز';
export const text_b6e25f19ea05: string = '۲۴ دانش‌آموز · ترم پاییز';
export const text_d983a3c09ac3: string = 'ریاضی نهم۱۸ دانش‌آموز · ترم پاییز';
export const text_9a9e09c9ab87: string = 'ریاضی نهم';
export const text_d751749551f7: string = '۱۸ دانش‌آموز · ترم پاییز';
export const text_075daf22deda: string = 'ترم پاییز · مدرس مریم رضایی';
export const text_0ab0253e0d25: string = 'جلسه‌ها و حضوربرنامه نزدیک و سوابق';
export const text_6f5ef960dd1c: string = 'جلسه‌ها و حضور';
export const text_025b6e030f0e: string = 'برنامه نزدیک و سوابق';
export const text_f326fadbd67a: string = 'درس‌ها و منابعمحتوای منتشرشده';
export const text_ecff8a668842: string = 'درس‌ها و منابع';
export const text_b722d46b2352: string = 'محتوای منتشرشده';
export const text_e38416e0132e: string = 'تکلیف و آزمونفعالیت‌های مجاز کلاس';
export const text_335e36cdca88: string = 'تکلیف و آزمون';
export const text_7fc46b169e99: string = 'فعالیت‌های مجاز کلاس';
export const text_5d1b0deb63f5: string = 'دوره‌های آموزشی';
export const text_b78e58d6146c: string = 'مدیر · آفتاب';
export const text_f24a1158f6f7: string = 'پاییز ۱۴۰۵۱ مهر تا ۳۰ آذرجاری';
export const text_64ed1cfcca99: string = 'پاییز ۱۴۰۵';
export const text_70ac8d4ef114: string = '۱ مهر تا ۳۰ آذر';
export const text_28e04ea47f3e: string = 'جاری';
export const text_6d89e60a79bb: string = 'تابستان ۱۴۰۵۱ تیر تا ۳۱ شهریورپایان‌یافته';
export const text_31e7ca03dec1: string = 'تابستان ۱۴۰۵';
export const text_b10c769224ca: string = '۱ تیر تا ۳۱ شهریور';
export const text_f78781b1df8f: string = 'کلاس جدید به دوره معتبر متصل می‌شود.';
export const text_762133af3731: string = 'دوره تازه';
export const text_96ce4cd47b6a: string = '۱ مهر ۱۴۰۵';
export const text_c5cd56daf1a0: string = '۳۰ آذر ۱۴۰۵';
export const text_e5f1e50238fb: string = 'پایان دوره باید پس از شروع آن باشد.';
export const text_1c81e739accd: string = 'ساخت دوره';
export const text_103df9119214: string = 'کاتالوگ درس‌ها';
export const text_2f33bff56fc8: string = 'ریاضیقابل انتخاب برای کلاس جدید';
export const text_cbb4a9c2ebe9: string = 'ریاضی';
export const text_6344051f0fb4: string = 'قابل انتخاب برای کلاس جدید';
export const text_da500a1bdaed: string = 'فیزیکقابل انتخاب برای کلاس جدید';
export const text_f28de2c671b7: string = 'فیزیک';
export const text_f6c7047081f7: string = 'ادبیات فارسیقابل انتخاب برای کلاس جدید';
export const text_437d4e5e4b03: string = 'عنوان درس تازه';
export const text_8388e7f15e75: string = 'هندسه';
export const text_fc6eddd72380: string = 'کلاس تازه';
export const text_d3c4d3ff976b: string = 'درس کاتالوگ';
export const text_e1f6106413dd: string = 'ریاضی دهم · گروه الف';
export const text_21fe1b34f7c9: string = '۳۰ نفر';
export const text_25b70da2c924: string = 'پس از ساخت، کلاس فعال شود.';
export const text_adc12f54cff9: string = 'بازبینی کلاس';
export const text_a517344f3199: string = 'انتخاب درس';
export const text_25d533af328c: string = 'ریاضیدرس موجود در کاتالوگ';
export const text_b09e06b8cc96: string = 'درس موجود در کاتالوگ';
export const text_498c37b1d5c4: string = 'هندسهدرس موجود در کاتالوگ';
export const text_f1dd3fe0422f: string = 'فیزیکدرس موجود در کاتالوگ';
export const text_dd5df1d20022: string = 'ساخت در آموزشگاه آفتاب';
export const text_c77f3c0b2aec: string = 'دوره';
export const text_c9502f1bfa92: string = 'فعال‌سازی';
export const text_cd6dc2b8aed2: string = 'پس از تکمیل اعضا';
export const text_9017ecea9931: string = 'انتساب مدرس و ثبت‌نام افراد در گام بعد انجام می‌شود.';
export const text_02189abdaf8b: string = 'ساخت کلاس';
export const text_d40c39a56325: string = 'تنظیمات کلاس';
export const text_3417a2be45d1: string = '۳۰';
export const text_9f37bdc5f473: string = 'افزایش ظرفیت با تأمین فضای کلاس';
export const text_cf4c2c8cb7c5: string = 'درخواست با نسخه فعلی تنظیمات ارسال می‌شود.';
export const text_6db4f493224f: string = 'ثبت تغییر ظرفیت';
export const text_4f298f9b30d2: string = 'ظرفیت قبلی';
export const text_2ee412c5ce5f: string = '۲۴ نفر';
export const text_c71f0a463d17: string = 'ظرفیت تازه';
export const text_de5183b3de82: string = 'ثبت‌نام فعال';
export const text_3f2dc59f17fb: string = 'تغییر ظرفیت، فردی را خودکار ثبت‌نام یا حذف نمی‌کند.';
export const text_10df121d0a98: string = 'ثبت تغییر';
export const text_f3baa67ee875: string = 'تنظیمات تازه‌تر است';
export const text_72fb9c60c9bb: string = 'مدیر دیگری این کلاس را تغییر داده است. متن شما حفظ شده.';
export const text_bfdf7606f3ba: string = 'ظرفیت روی سرویس';
export const text_f36b753ec364: string = '۲۸ نفر';
export const text_a89354548202: string = 'انتخاب شما';
export const text_ccb9060a62be: string = 'نسخه تازه را بازبینی کنید و دوباره تصمیم بگیرید.';
export const text_abb919288d6a: string = 'دیدن نسخه تازه';
export const text_d9bf5e6d5b86: string = 'دانش‌آموزان کلاس';
export const text_b25f8e74b6c7: string = 'نام دانش‌آموز';
export const text_f47892c41170: string = '۲۴';
export const text_bfb169b178aa: string = 'ظرفیت آزاد';
export const text_a2b7600681f6: string = 'ننازنین موسویثبت‌نام از ۱ مهرفعال';
export const text_68f512d392c5: string = 'ثبت‌نام از ۱ مهر';
export const text_158d64f62d26: string = 'اامیر نادریثبت‌نام از ۱ مهرفعال';
export const text_ea090272fb14: string = 'ممریم احمدیثبت‌نام از ۴ مهرفعال';
export const text_a70c67800867: string = 'مریم احمدی';
export const text_81bb4ca50935: string = 'ثبت‌نام از ۴ مهر';
export const text_6336c87f52e5: string = 'انتخاب دانش‌آموز';
export const text_a88364dbea04: string = 'افراد مجاز آموزشگاه';
export const text_0aa89e978d26: string = 'رریحانه زمانیپرونده متصل به حساب';
export const text_60005d49e5a4: string = 'پرونده متصل به حساب';
export const text_2557acf6c731: string = 'ععلی کریمیپرونده متصل به حساب';
export const text_6debbdce2c8e: string = '۶ نفر';
export const text_d7e56bcc7976: string =
  'انتخاب‌ها هنگام ثبت دوباره از نظر عضویت و ظرفیت بررسی می‌شوند.';
export const text_2f08a77cc65c: string = 'ثبت‌نام فرد منتخب';
export const text_c0ab0a37ead2: string = 'پایان ثبت‌نام؟';
export const text_0bcaac57e316: string =
  'دسترسی آموزشی نازنین به این کلاس پایان می‌یابد. سوابق مجاز حذف نمی‌شوند.';
export const text_016b0ebf603a: string = 'وضعیت نهایی';
export const text_def0c3556004: string = 'پایان ثبت‌نام';
export const text_702e417e8e48: string = 'مدرسان ریاضی دهم';
export const text_025842efe999: string = 'ممریم رضاییمدرس فعال · از ۱ مهرفعال';
export const text_c1cd653b098f: string = 'مدرس فعال · از ۱ مهر';
export const text_c2575a2632c5: string = 'اامیر نظریهمکار تدریس · از ۵ مهرفعال';
export const text_b45b35aeec90: string = 'امیر نظری';
export const text_7ccf5d5f3221: string = 'همکار تدریس · از ۵ مهر';
export const text_16f551b4efdb: string =
  'داشتن نقش مدرس آموزشگاه به‌تنهایی، انتساب به همه کلاس‌ها نیست.';
export const text_07e997f018ed: string = 'انتساب مدرس';
export const text_7607f178630f: string = 'مدرسان مجاز آموزشگاه';
export const text_b8392ecf93a6: string = 'لیلا موسویمدرس آموزشگاه آفتاب';
export const text_493ef833d9b9: string = 'لیلا موسوی';
export const text_2c16acc7a9a9: string = 'مدرس آموزشگاه آفتاب';
export const text_eeb9627ecfda: string = 'حسین احمدیمدرس آموزشگاه آفتاب';
export const text_6582880cba0c: string = 'حسین احمدی';
export const text_203b0ed83d9d: string = 'مدرس انتخاب‌شده به همین کلاس منتسب می‌شود.';
export const text_bad2c41f4e7d: string = 'انتساب به کلاس';
export const text_ddf086156c70: string = 'پایان انتساب مدرس؟';
export const text_6f70fd749bb3: string =
  'اختیار تدریس این کلاس پایان می‌یابد؛ نقش‌های دیگر حساب و سوابق ارزیابی حفظ می‌شوند.';
export const text_61540d85c401: string = 'پایان انتساب';
export const text_0fbf032a4337: string = 'افراد آموزشگاه';
export const text_093a693daf4d: string = 'نام یا شناسه پرونده';
export const text_08914752d2e0: string = 'در انتظار اتصال';
export const text_c30abd4aecb3: string = 'ننازنین موسویحساب متصل · پرونده ۱۰۲متصل';
export const text_a44e6168a580: string = 'حساب متصل · پرونده ۱۰۲';
export const text_d1f10ed30e77: string = 'اامیر نادریحساب متصل · پرونده ۱۰۳';
export const text_8eefbfea1223: string = 'حساب متصل · پرونده ۱۰۳';
export const text_94210fcd03b9: string = 'رریحانه زمانیدعوت ارسال‌شدهدر انتظار';
export const text_4b7e512db8a6: string = 'دعوت ارسال‌شده';
export const text_f63bfe447d61: string = 'پرونده تازه';
export const text_23930b0c34f7: string = 'ریحانه';
export const text_4527f573f122: string = 'زمانی';
export const text_7c3be04ef4c4: string = 'نام نمایشی اختیاری';
export const text_135520a46ad6: string = 'دلیل ایجاد';
export const text_3422f350492b: string = 'ثبت‌نام ترم پاییز';
export const text_098c7e615a9d: string = 'ایجاد پرونده';
export const text_32aaf360c36b: string = 'پرونده نازنین';
export const text_73d53676fa68: string = 'پرونده آموزشگاه آفتاب';
export const text_5a8310813477: string = 'وضعیت اتصال';
export const text_9c9434f626c1: string = 'حساب متصل';
export const text_208c5b60472d: string = 'والد مرتبط';
export const text_910626c1e65d: string = 'مریم موسوی';
export const text_ee043403f09e: string = 'ویرایش نام پروندهاطلاعات همان آموزشگاه';
export const text_4a7a26a70f1b: string = 'ویرایش نام پرونده';
export const text_cf8486924ef0: string = 'اطلاعات همان آموزشگاه';
export const text_c7b57343578f: string = 'دعوت اتصال حسابتاریخچه و اعتبار دعوت';
export const text_bdbbfb4ce502: string = 'دعوت اتصال حساب';
export const text_735ea409d66b: string = 'تاریخچه و اعتبار دعوت';
export const text_b50a8bed4613: string = 'رابطه والدمدیریت رابطه مجاز';
export const text_c1eb731024da: string = 'رابطه والد';
export const text_fbb6a20f3e08: string = 'مدیریت رابطه مجاز';
export const text_277520986aae: string = 'اعضا و نقش‌ها';
export const text_071cb4bd8626: string = 'سسارا احمدیمدیر · عضویت فعال';
export const text_c3329dbbc186: string = 'مدیر · عضویت فعال';
export const text_604f103e8b39: string = 'ممریم رضاییمدرس · عضویت فعال';
export const text_0b023ba65a5a: string = 'مدرس · عضویت فعال';
export const text_c3c99a35a449: string = 'ننازنین موسویدانش‌آموز · عضویت فعال';
export const text_d7ebba63c119: string = 'دانش‌آموز · عضویت فعال';
export const text_b0bb296fecc9: string = 'نقش آموزشگاه، اختیار پلتفرم یا کلاس مستقل ایجاد نمی‌کند.';
export const text_dcdd2fdfea8b: string = 'افزودن نقش';
export const text_1e0d73d2ac4c: string = 'عضویت آموزشگاه آفتاب';
export const text_5b9255929b5d: string = 'مدرستدریس در کلاس‌های منتسب';
export const text_cbd33100b3f5: string = 'تدریس در کلاس‌های منتسب';
export const text_d52fcd4383e6: string = 'مدیرمدیریت مجاز آموزشگاه';
export const text_e4ba0d1c4e12: string = 'مدیریت مجاز آموزشگاه';
export const text_d0a734372cb5: string = 'والدهمراه رابطه معتبر فرزند';
export const text_4343e3126cb2: string = 'همراه رابطه معتبر فرزند';
export const text_527d67e83b4e: string = 'مسئولیت آموزشی جدید';
export const text_f89094a5d768: string = 'اعطای نقش';
export const text_70c63d11a2d9: string = 'پایان نقش مدرس؟';
export const text_be6a3615de0d: string =
  'نقش مدرس این عضویت پایان می‌یابد. اثر انتساب‌های کلاس باید پیش از ثبت از سرویس روشن شود.';
export const text_aa0313b5ffc1: string = 'تغییر مسئولیت آموزشی';
export const text_97218571451a: string = 'پایان نقش';
export const text_1426bdf6aa23: string = 'دعوت‌های آموزشگاه';
export const text_d50c2122f632: string = 'منتظر';
export const text_638a867e917f: string = 'پذیرفته';
export const text_41e652d580f4: string = 'ریحانه زمانیاتصال پرونده · تا ۲۰ آبانمنتظر';
export const text_161e2218a326: string = 'اتصال پرونده · تا ۲۰ آبان';
export const text_00a67a50b23a: string = 'والد نازنیندعوت رابطه والدمنتظر';
export const text_4646e79e3c50: string = 'والد نازنین';
export const text_bb7d76729f17: string = 'دعوت رابطه والد';
export const text_051f74232286: string = 'امیر نادریپذیرفته‌شده در ۱۰ آبانپذیرفته';
export const text_bc97f85998b4: string = 'پذیرفته‌شده در ۱۰ آبان';
export const text_26601e1fa364: string = 'دعوت اتصال حساب به پرونده';
export const text_139c3424dc2c: string = '۱۴ آبان، ۱۰:۳۰';
export const text_05973f2b93cc: string = 'منتظر پذیرش';
export const text_98ac5e94b651: string = 'ارسال دوباره نباید دعوت معتبر قبلی را بی‌خبر تکثیر کند.';
export const text_21ba8fbd8358: string = 'لغو این دعوت';
export const text_2c7b6f74e6f3: string = 'لغو دعوت؟';
export const text_5b51e5c4db1e: string =
  'این دعوت دیگر قابل پذیرش نیست. پرونده فرد و اطلاعات ثبت‌شده باقی می‌مانند.';
export const text_27166d93eb11: string = 'دعوت به مقصد نادرست ارسال شده';
export const text_573a43435a07: string = 'والدهای مرتبط';
export const text_962723c6b1b9: string = 'نام دانش‌آموز یا والد';
export const text_05dbe700f1b9: string = 'نازنین موسویمریم موسوی · والد فعالفعال';
export const text_188e863acbef: string = 'مریم موسوی · والد فعال';
export const text_024d40c0ee2a: string = 'امیر نادریدعوت والد در انتظار پاسخمنتظر';
export const text_aa6feaa6aaac: string = 'دعوت والد در انتظار پاسخ';
export const text_8c6ed469c07f: string = 'رابطه تازه';
export const text_9034af519be2: string = 'دعوت والد';
export const text_b9ecfae01b5a: string = 'حساب والد';
export const text_148f04508232: string = 'برای همراهی با برنامه آموزشی نازنین دعوت شده‌اید.';
export const text_3fc327751013: string = 'پذیرش رابطه، محدوده گزارش آموزشی مجاز را باز می‌کند.';
export const text_3fee572835cc: string = 'پایان رابطه والد؟';
export const text_46f80b28d943: string = 'فرزند';
export const text_2ed15a4c8152: string =
  'دسترسی تازه به گزارش این رابطه پایان می‌یابد؛ سابقه مجاز قابل ممیزی می‌ماند.';
export const text_538e7e0c150e: string = 'اصلاح رابطه ثبت‌شده';
export const text_70c2449430f3: string = 'ننازنین موسویآفتاب · رابطه فعالانتخاب‌شده';
export const text_2112779e2ab6: string = 'آفتاب · رابطه فعال';
export const text_8cd9637d0e3b: string = 'اامیر موسویباران · رابطه فعال';
export const text_bb564b3cf5bb: string = 'امیر موسوی';
export const text_df7abfaab41b: string = 'باران · رابطه فعال';
export const text_014c30ef2125: string = 'بالای همه گزارش‌ها، نام فرزند و آموزشگاه دیده می‌شود.';
export const text_4a332b9ce39a: string = 'برنامه نازنین';
export const text_5b733feec5d6: string = 'والد · نازنین';
export const text_0daad2f1fd87: string = 'ریاضی دهم · امروز ۱۶جلسه حل تمرین';
export const text_6079d91fa462: string = 'ریاضی دهم · امروز ۱۶';
export const text_5c57f9a96d2b: string = 'جلسه حل تمرین';
export const text_f929bcb1cb47: string = 'حضور این ماه۸ حاضر از ۹ جلسه';
export const text_13883fb83bb0: string = 'حضور این ماه';
export const text_e0448c87f7b8: string = '۸ حاضر از ۹ جلسه';
export const text_ea20d2cd5300: string = 'تکلیف‌های منتشرشده۲ فعالیت در انتظار پاسخ';
export const text_b4ffbc19fc12: string = 'تکلیف‌های منتشرشده';
export const text_e047dc0a7638: string = '۲ فعالیت در انتظار پاسخ';
export const text_47fca8f604b5: string = 'نتایج نازنین';
export const text_ffc1e8306296: string = 'تمرین فصل دومنتیجه منتشرشده · ۱۸ از ۲۰';
export const text_84bd9b9fca9c: string = 'نتیجه منتشرشده · ۱۸ از ۲۰';
export const text_d6f26dd6c026: string = 'مرور معادلهنتیجه هنوز منتشر نشدهمنتظر';
export const text_9fd3db677df4: string = 'مرور معادله';
export const text_5cb1480462b7: string = 'نتیجه هنوز منتشر نشده';
export const text_79916b312c5d: string =
  'یادداشت خصوصی مدرس و نتیجه منتشرنشده نمایش داده نمی‌شوند.';
export const text_065e71f30404: string = 'برنامه هفتگی';
export const text_082dd4243ac7: string = 'هفته';
export const text_45432d376a2d: string = 'فهرست';
export const text_eb26db5dd426: string = '۱۰ تا ۱۶ آبان ۱۴۰۵';
export const text_81801e4da3fa: string = 'دوشنبه · ۱۶:۰۰ریاضی دهم · حل تمرین';
export const text_aca8aec98233: string = 'دوشنبه · ۱۶:۰۰';
export const text_e5d9dd4b30d1: string = 'ریاضی دهم · حل تمرین';
export const text_ae4c8068ee91: string = 'سه‌شنبه · ۱۰:۰۰فیزیک · آزمایش حرکت';
export const text_b0e775d553f9: string = 'سه‌شنبه · ۱۰:۰۰';
export const text_d77337794af2: string = 'فیزیک · آزمایش حرکت';
export const text_791d4890860d: string = 'چهارشنبه · ۱۲:۰۰ادبیات · تحلیل متن';
export const text_7f021dc280b8: string = 'چهارشنبه · ۱۲:۰۰';
export const text_a212a312696e: string = 'ادبیات · تحلیل متن';
export const text_ce4b4ab8c87b: string = 'فیلتر برنامه';
export const text_77962b507ece: string = 'همه کلاس‌های مجازبرنامه نقش فعلی';
export const text_f0386313659f: string = 'همه کلاس‌های مجاز';
export const text_2aa79aa60344: string = 'برنامه نقش فعلی';
export const text_a8d1bfdf3914: string = 'ریاضی دهمفقط همین کلاس';
export const text_6e0e6da44204: string = 'فقط همین کلاس';
export const text_331faeb2aebd: string = 'جلسه‌های لغوشده';
export const text_bf68e9807e74: string = 'با برچسب وضعیت نمایش داده شوند';
export const text_02a0516edaba: string = 'جلسه‌های لغوشدهبا برچسب وضعیت نمایش داده شوند';
export const text_10d91a6887b1: string = 'اعمال فیلتر';
export const text_d7081c5f4151: string = 'انتخاب تاریخ';
export const text_95f983a3c028: string = 'آبان ۱۴۰۵';
export const text_4a59a742eb1f: string = '۱۶';
export const text_593a298ac8e5: string = '۱۹';
export const text_1e01e72327a4: string = '۲۱';
export const text_d8f656aefa69: string = '۲۲';
export const text_a70a0c911576: string = '۲۳';
export const text_42f62f5e0ad8: string = '۲۵';
export const text_2d206205221e: string = '۲۶';
export const text_1decf4d37208: string = '۲۷';
export const text_f86c80ad20c4: string = '۲۸';
export const text_05a9c2603a86: string = '۲۹';
export const text_279cc2f09ede: string =
  'تاریخ محلی برای نمایش است؛ زمان ثبت‌شده با منطقه زمانی معتبر تبدیل می‌شود.';
export const text_d8c22306e87c: string = 'انتخاب ۱۴ آبان';
export const text_1ff6faf8a55e: string = 'جلسه تازه';
export const text_4076b78221d3: string = 'حل تمرین فصل دوم';
export const text_7b6b08b6be6a: string = '۱۴ آبان، ۱۶:۰۰';
export const text_e0fb9e76ed89: string = '۱۴ آبان، ۱۷:۰۰';
export const text_cdb566689830: string = 'تهران';
export const text_4834bbebf706: string = 'پیوند جلسه اختیاری';
export const text_aff11c8a30c1: string = 'بازبینی جلسه';
export const text_d02b3454e316: string = 'ریاضی دهم · آفتاب';
export const text_5035be5f33d8: string = 'جلسه آنلاین';
export const text_1fc2c4606f0b: string = 'پیوند وارد شده';
export const text_731fb14ee3bc: string =
  'نشانی جلسه پیش از ذخیره بازبینی می‌شود؛ مجوز دیدن آن از کلاس می‌آید.';
export const text_a72d94ec5735: string = 'ساخت جلسه';
export const text_cdd38b93fe26: string = '۱۴ آبان، ۱۶ تا ۱۷';
export const text_693a27a5987d: string = 'منابع جلسهفایل‌های مجاز کلاس';
export const text_49371f3ce13d: string = 'منابع جلسه';
export const text_ff24e2d381f4: string = 'فایل‌های مجاز کلاس';
export const text_f0b721d4aeb2: string = 'گفتگوی رسمیپرسش درباره همین جلسه';
export const text_7806a69e15ba: string = 'گفتگوی رسمی';
export const text_7fff8a2ebfcf: string = 'پرسش درباره همین جلسه';
export const text_fdbf831bb9cd: string = 'ورود به جلسه آنلاین';
export const text_eabd5e6ac2da: string = 'حل تمرین و رفع اشکال';
export const text_e4c71fdeed8b: string = 'شروع تازه';
export const text_4cbd136b05c8: string = '۱۵ آبان، ۱۶:۰۰';
export const text_693a86b8f3ca: string = 'پایان تازه';
export const text_3b0914886cde: string = '۱۵ آبان، ۱۷:۰۰';
export const text_deebda71bb2b: string = 'پیوند اختیاری';
export const text_a7bc5a1e31f2: string = 'اثر تغییر زمان بر اطلاع‌رسانی، در بازبینی روشن می‌شود.';
export const text_71ee42bb52ee: string = 'ذخیره ویرایش';
export const text_6bc8fc05c7ab: string = 'دلیل لغو';
export const text_f0242ae90c58: string = 'تعطیلی آموزشگاه';
export const text_990d3c84b38d: string =
  'جلسه با وضعیت لغوشده باقی می‌ماند؛ حضور تازه برای جلسه لغوشده ثبت نشود.';
export const text_152fdc9fbe3e: string = '۲۲ نفر از ۲۴ نفر';
export const text_7aa71f016d65: string = 'فهرست حضور را بازبینی کردم.';
export const text_b6802fe78196: string = 'ثبت پایان، ایجاد یک جلسه جدید نیست.';
export const text_dd58bb2a0719: string = 'ثبت پایان جلسه';
export const text_2411df32bb55: string = 'حضور جلسه';
export const text_ea29fda96338: string = '۱۴ آبان · ریاضی دهم';
export const text_b1807de24e91: string = 'ننازنین موسویوضعیت حضور جلسهحاضر';
export const text_b63d816dc177: string = 'وضعیت حضور جلسه';
export const text_4040e0fc5765: string = 'اامیر نادریوضعیت حضور جلسهغایب';
export const text_13b625a031dc: string = 'ممریم احمدیوضعیت حضور جلسهدیرکرد';
export const text_568f94237e2b: string = 'دیرکرد';
export const text_5dbe97b07a04: string = 'ثبت گروهی پس از بازبینی همه ردیف‌ها انجام می‌شود.';
export const text_39a41a9a1bb5: string = 'ذخیره حضورها';
export const text_60b5d37a0353: string = 'اصلاح حضور نازنین';
export const text_903ef2296791: string = 'حاضردر جلسه حضور داشته';
export const text_48737565b97e: string = 'در جلسه حضور داشته';
export const text_63741c59a1b1: string = 'غایبدر جلسه حضور نداشته';
export const text_5ac76fe55e48: string = 'در جلسه حضور نداشته';
export const text_44650fb86282: string = 'دیرکردبا تأخیر رسیده';
export const text_8cb3b50d509f: string = 'با تأخیر رسیده';
export const text_cd430bd22bff: string = 'توضیح اصلاح';
export const text_debd8c66b390: string = 'ثبت اولیه نیاز به اصلاح داشت';
export const text_adce596f0d28: string = 'ثبت اصلاح حضور';
export const text_3aac48e227c6: string = 'حضور من';
export const text_4f7108c2a318: string = '۱۴ آبان · حل تمرینحاضر · ثبت مدرس';
export const text_39d879180bca: string = '۱۴ آبان · حل تمرین';
export const text_64aceaac4eb2: string = 'حاضر · ثبت مدرس';
export const text_9a2b2c005968: string = '۱۲ آبان · معادلهحاضر · ثبت مدرس';
export const text_81e55376ca57: string = '۱۲ آبان · معادله';
export const text_397b154c8168: string = '۱۰ آبان · مرورغایب · گزارش منتشرشده';
export const text_23e2968af609: string = '۱۰ آبان · مرور';
export const text_5893bf5ded55: string = 'غایب · گزارش منتشرشده';
export const text_050050fc1ad7: string = 'قاعده برنامه';
export const text_cd9be78f656d: string = 'دوشنبه';
export const text_d79ff1f81518: string = 'شروع محلی';
export const text_af7b10e59207: string = 'حل تمرین ریاضی';
export const text_e8c522821388: string = 'ادامه بازه زمانی';
export const text_ac05c37686c2: string = 'بازه اجرای برنامه';
export const text_1db41055f5f2: string = 'از تاریخ';
export const text_f421149b2aed: string = 'تا تاریخ';
export const text_d8212a6499ae: string = 'جلسه حضوری';
export const text_4243e809b177: string = 'قاعده، زمان محلی و منطقه زمانی را با هم نگه می‌دارد.';
export const text_a3e076b81776: string = 'بازه و روز هفته را بازبینی کردم.';
export const text_50d4996a19f3: string = 'ساخت قاعده برنامه';
export const text_689cdc6ddac9: string = 'اعمال تغییر از چه روزی؟';
export const text_0045ef9251ca: string = 'تاریخ اعمال';
export const text_0cb1079fb1e7: string = '۲۰ آبان ۱۴۰۵';
export const text_7d38dee9f3f4: string = 'شروع قبلی';
export const text_cf22c0600c02: string = '۱۷:۰۰';
export const text_edda4b95dbfb: string =
  'اثر تغییر بر جلسه‌های موجود باید از نتیجه عملیات روشن شود؛ سوابق گذشته بی‌خبر بازنویسی نشوند.';
export const text_628d7b69f9aa: string = 'ثبت تغییر قاعده';
export const text_58337e82d8ae: string = 'درس تازه';
export const text_65ce0847c9ef: string = 'حل معادله درجه دوم';
export const text_9548b863ba0f: string = 'برای حل معادله، ابتدا عبارت را تجزیه می‌کنیم…';
export const text_78ca2d0a6f52: string =
  'افزودن پیوست درسنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_8e6d08089d49: string = 'افزودن پیوست درس';
export const text_305e230902fe: string = 'نوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_05c574194525: string = 'ذخیره پیش‌نویس';
export const text_0f4147fe60af: string = 'متن';
export const text_198a47fb0a28: string = 'دو روش تجزیه و فرمول را با مثال مقایسه می‌کنیم.';
export const text_02e7fbaa38e8: string = 'جزوه فصل دوم.pdfPDF · فایل آماده';
export const text_9c8a52bfb159: string = 'جزوه فصل دوم.pdf';
export const text_d72b37e9d63f: string = 'PDF · فایل آماده';
export const text_1a87515ba557: string = 'پیش‌نویس برای دانش‌آموز قابل مشاهده نیست.';
export const text_2ee705d447ce: string = 'انتشار درس؟';
export const text_16a32c06eab3: string = 'ریاضی دهم · ۲۴ عضو مجاز';
export const text_9e77137fe7a0: string = 'درس ۳';
export const text_362c3a09b7f0: string = 'جزوه آماده';
export const text_44b6d7505cb7: string = 'متن و پیوست را بررسی کردم.';
export const text_e1116e206117: string = 'درس‌های ریاضی';
export const text_60cf72768553: string = '۱. مفهوم معادلهمنتشرشده · ۱ پیوست';
export const text_7755c74cf1e7: string = '۱. مفهوم معادله';
export const text_55604a82011c: string = 'منتشرشده · ۱ پیوست';
export const text_17c930ef9020: string = '۲. تجزیه عبارتمنتشرشده · ۲ پیوست';
export const text_f5150b71f2a8: string = '۲. تجزیه عبارت';
export const text_60e3107015b5: string = 'منتشرشده · ۲ پیوست';
export const text_28d633c4a8bf: string = '۳. معادله درجه دوممنتشرشده · جزوه تازهتازه';
export const text_e5b703cf7745: string = '۳. معادله درجه دوم';
export const text_01450798cd73: string = 'منتشرشده · جزوه تازه';
export const text_1d86bc6f1fb7: string = 'از تجزیه تا دو ریشه';
export const text_d6a40592c31d: string = 'درس سوم · مریم رضایی';
export const text_e4e70a2eb570: string =
  'اگر حاصل‌ضرب دو عبارت صفر باشد، دست‌کم یکی از آن دو صفر است.';
export const text_5aeaa96928b3: string = 'جزوه فصل دوم.pdfPDF · ۴ صفحه';
export const text_127c734a2855: string = 'PDF · ۴ صفحه';
export const text_28ba1c942b42: string = 'پرسش درباره درس را در گروه رسمی همین کلاس بپرسید.';
export const text_24b922ae8cf0: string = 'بازکردن جزوه';
export const text_5a82d3aee39c: string = 'فایل دریافت نشد';
export const text_5fbed52a4032: string =
  'دریافت جزوه کامل نشد. اتصال و دسترسی جاری دوباره بررسی می‌شوند.';
export const text_5a2f01c7d088: string = 'بازگشت به درس، محل مطالعه را حفظ می‌کند.';
export const text_67d6f6b3ed71: string = 'تکلیف‌های ریاضی';
export const text_b072371e21a0: string = 'تمرین فصل دومتا ۲۰ آبان · ۲۴ مخاطبمنتشرشده';
export const text_427619ca43da: string = 'تا ۲۰ آبان · ۲۴ مخاطب';
export const text_1d88bf02bacc: string = 'حل مسئله کاربردیمتن هنوز کامل نشدهپیش‌نویس';
export const text_9b9ac4d378e2: string = 'حل مسئله کاربردی';
export const text_610172fd9d9d: string = 'متن هنوز کامل نشده';
export const text_ba9aabac5d77: string = 'پرسش‌های ۱ تا ۵ جزوه را با توضیح روش حل پاسخ دهید.';
export const text_d4ccd94baf6d: string =
  'افزودن فایل صورت تکلیفنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_83aff1efd3ac: string = 'افزودن فایل صورت تکلیف';
export const text_a52f9930af27: string = 'ادامه تنظیم قواعد';
export const text_f16c7eb04e27: string = 'قواعد تکلیف';
export const text_263dce22bd9d: string = '۲۰ آبان، ۲۳:۵۹';
export const text_d344a502a3d0: string = 'حداکثر تلاش';
export const text_197788ade176: string = 'طبق سیاست همین تکلیف';
export const text_4a025e3d816f: string = 'تحویل با تأخیرطبق سیاست همین تکلیف';
export const text_8c93b5c458bd: string = 'مخاطبان و صورت تکلیف آماده‌اند.';
export const text_6e6f092caa54: string = 'پاسخ تمرین';
export const text_a3c95f94ce53: string = 'ابتدا معادله را به حاصل‌ضرب دو عبارت تبدیل کردم…';
export const text_02f109a3ee15: string = 'پاسخ تمرین.pdfفایل آماده · ۱٫۲ مگابایت';
export const text_2306db587a58: string = 'پاسخ تمرین.pdf';
export const text_508777a446dc: string = 'فایل آماده · ۱٫۲ مگابایت';
export const text_421bc6d9f374: string =
  'افزودن پیوست دیگرنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_48d054d37580: string = 'افزودن پیوست دیگر';
export const text_e1a618df1c1b: string = 'پیش‌نویس ذخیره می‌شود؛ تحویل نهایی اقدام جدا دارد.';
export const text_fe986eddf585: string = 'بازبینی تحویل';
export const text_1b5144e8f534: string = 'تلاش‌های من';
export const text_8f2e07c930e2: string = 'حداکثر ۲ تلاش طبق قواعد تکلیف';
export const text_fadf05041a04: string = 'تلاش دومپیش‌نویس · آخرین ذخیره ۱۰:۳۲در حال ویرایش';
export const text_1f298dd0980c: string = 'تلاش دوم';
export const text_f9be68431f57: string = 'پیش‌نویس · آخرین ذخیره ۱۰:۳۲';
export const text_cd194040fade: string = 'در حال ویرایش';
export const text_51785b1886aa: string = 'تلاش اولتحویل ۱۸ آبان، ۱۰:۲۰تحویل‌شده';
export const text_75d1ea8c238b: string = 'تلاش اول';
export const text_5856f6a47831: string = 'تحویل ۱۸ آبان، ۱۰:۲۰';
export const text_26d778c181fe: string = 'نسخه تحویل‌شده با ویرایش پیش‌نویس تازه جایگزین نمی‌شود.';
export const text_aa7fe203c514: string = 'پاسخ ثبت شد';
export const text_e4375c719867: string = '۱۸ آبان، ۱۰:۴۳';
export const text_51f8837a746b: string = '۲ از ۲';
export const text_e994e9f0251b: string = 'در مهلت';
export const text_61e89ac0ee11: string = 'بازگشت به تکلیف';
export const text_d818e152c7c6: string = 'صف ارزیابی';
export const text_a3dd4ad5df28: string = 'کلاس یا نام عضو';
export const text_12e3f65e04df: string = 'ننازنین موسویتمرین فصل دوم · تلاش ۱تازه';
export const text_0a30d57bdd52: string = 'تمرین فصل دوم · تلاش ۱';
export const text_7155f3af526d: string = 'اامیر نادریتمرین فصل دوم · تلاش ۲';
export const text_a9ea831e0de1: string = 'تمرین فصل دوم · تلاش ۲';
export const text_2a2046ff6734: string = 'رریحانه زمانیتمرین فصل اول · تلاش ۱';
export const text_33781e073b1d: string = 'تمرین فصل اول · تلاش ۱';
export const text_fa7631a2f5fa: string = 'ارزیابی نازنین';
export const text_3dd1c5421d39: string = 'پاسخ نازنین.pdfپاسخ تحویل‌شده';
export const text_3fc99048ee9b: string = 'پاسخ نازنین.pdf';
export const text_68307415e33f: string = 'پاسخ تحویل‌شده';
export const text_e3ef327e48ad: string = 'روش درست است؛ مرحله آخر را روشن‌تر توضیح دهید.';
export const text_64f05a7c5edc: string = 'برای تمرین بعد مرور شود.';
export const text_a8ef51a9d68d: string = 'انتشار نتیجه تکلیف';
export const text_38824643a4ce: string =
  'عضو، نمره و بازخورد قابل نمایش را می‌بیند؛ یادداشت خصوصی منتشر نمی‌شود.';
export const text_0c76f614cb35: string = 'نمره و بازخورد را بازبینی کردم.';
export const text_6759dcd4b29e: string = 'آزمون‌های من';
export const text_4267fa473979: string = 'قابل شروع';
export const text_643a35ab370c: string = 'مرور معادلهامروز ۱۸ تا ۲۰ · ۱۵ دقیقهقابل شروع';
export const text_0fb2f2b7dc21: string = 'امروز ۱۸ تا ۲۰ · ۱۵ دقیقه';
export const text_b38e99faa5d3: string = 'هندسه مقدماتی۲۰ آبان · هنوز باز نیستپیش رو';
export const text_d3f38a00facc: string = 'هندسه مقدماتی';
export const text_3dd2e85c57a4: string = '۲۰ آبان · هنوز باز نیست';
export const text_c68fcdd01a80: string = 'شرح اختیاری';
export const text_d0cf16a253d5: string = 'چهار پرسش تستی و یک پرسش تشریحی';
export const text_20775625e72d: string = 'شروع دسترسی';
export const text_b1f95c7ed1bf: string = '۱۸ آبان، ۱۸:۰۰';
export const text_60106731ba15: string = '۱۸ آبان، ۲۰:۰۰';
export const text_e2daf0b71e19: string = 'ادامه تنظیمات آزمون';
export const text_74f1dbc9f376: string = 'قواعد آزمون';
export const text_9d2a54130692: string = 'سیاست تصادفی‌سازی باید با enum قرارداد سازگار باشد.';
export const text_7a174f18ba6a: string = 'ترتیب پرسش‌ها';
export const text_1fe5ba03905e: string = 'مطابق تنظیم معتبر';
export const text_144ae14e576f: string = 'ساخت پیش‌نویس';
export const text_3f9953b11e6f: string = 'پرسش تشریحی';
export const text_d028aaad3bdf: string = 'معادله را حل و مراحل را بنویسید.';
export const text_bf7cd109d5f8: string = 'طبق سیاست این پرسش';
export const text_ccddd120d386: string = 'پیوست پاسخطبق سیاست این پرسش';
export const text_2702e387e083: string = 'سیاست فایل';
export const text_10d417c20502: string = 'فایل PDF و تصویر مجاز';
export const text_ead84c3e944b: string = 'ذخیره پرسش';
export const text_1b38991101c1: string = 'حذف پرسش؟';
export const text_deb7c9b5c28f: string =
  'پرسش از نسخه پیش‌نویس حذف می‌شود. بارم کل و ترتیب پرسش‌ها دوباره بررسی می‌شوند.';
export const text_7f688ffcbe21: string = 'پرسش';
export const text_b5de4fe7ad61: string = '۳ · حل معادله';
export const text_efa35f9d3317: string = 'پیش‌نویس ۱';
export const text_a0ffc9da1ce2: string = 'حذف پرسش';
export const text_ea3bfbeab0d0: string = 'پیش‌نمایش مدرس';
export const text_c8af6f01fbfe: string = 'فقط برای مدرس';
export const text_0bd564e0b232: string = 'پرسش ۳ از ۵';
export const text_cfd7a9306fa7: string = 'معادله را حل کنید.';
export const text_f0f3393fc787: string = 'گزینه اولپاسخ نادرست';
export const text_e8bd48a9fc1e: string = 'گزینه اول';
export const text_729e7f650b49: string = 'پاسخ نادرست';
export const text_7ae418839828: string = 'گزینه دومپاسخ صحیح · فقط مدرس';
export const text_3d3260f2dcb2: string = 'گزینه دوم';
export const text_e53d7c916759: string = 'پاسخ صحیح · فقط مدرس';
export const text_8c3fa2a55808: string =
  'نمای دانش‌آموز، کلید پاسخ و یادداشت خصوصی را دریافت نمی‌کند.';
export const text_7329a5d1dabb: string = 'آزمون ناتمام';
export const text_1f63aa9aad64: string = 'تلاش معتبر قبلی پیدا شد';
export const text_48b1257050a4: string = 'پاسخ ذخیره‌شده';
export const text_1c772ae2dfb8: string = '۳ از ۵';
export const text_46c51739b86e: string = 'بر پایه زمان معتبر سرویس';
export const text_cd1aedb6bff6: string = 'بازکردن دوباره، تلاش تازه ایجاد نمی‌کند.';
export const text_00dcac14604d: string = 'ادامه همان تلاش';
export const text_7bfd1ab80014: string = 'ادامه روی این دستگاه؟';
export const text_6a9aba25ef0a: string = 'ویرایش پاسخ‌ها روی دستگاه دیگری فعال است.';
export const text_e43793ce0f31: string =
  'با انتقال مجوز نوشتن، دستگاه قبلی امکان ذخیره پاسخ تازه را از دست می‌دهد.';
export const text_c3ff12c3b813: string = 'می‌خواهم روی همین دستگاه ادامه بدهم.';
export const text_45b03186b669: string = 'انتقال و ادامه';
export const text_3e1d5a5db3e7: string = 'زمان پاسخ تمام شد';
export const text_989a905a6536: string =
  'ویرایش پاسخ بسته است؛ نتیجه ثبت نهایی از سرویس دریافت می‌شود.';
export const text_d802a113057e: string = 'پاسخ تأییدشده';
export const text_2f2eae3099c0: string = '۴ از ۵';
export const text_10eb0011e226: string = 'پاسخ محلیِ تأییدنشده، رسید ثبت نهایی محسوب نمی‌شود.';
export const text_51f0f6856519: string = '۲۴ مخاطب · ۲۰ پاسخ ثبت‌شده';
export const text_a2a2a4b97b89: string = 'ننازنین موسویبخش تستی آماده · تشریحی منتظردر بررسی';
export const text_0927f7378f2e: string = 'بخش تستی آماده · تشریحی منتظر';
export const text_8e87f47cac8b: string = 'اامیر نادریتصحیح کامل · هنوز منتشر نشده';
export const text_54d81412915d: string = 'تصحیح کامل · هنوز منتشر نشده';
export const text_7bc6f0be70be: string = 'تکمیل ارزیابی آزمون';
export const text_12bdce5ae591: string = '۵ از ۸';
export const text_d7fedefc4459: string = 'جمع';
export const text_56e1c8b8b82c: string =
  'تکمیل ارزیابی، انتشار نتیجه نیست؛ نتیجه تا اقدام انتشار خصوصی می‌ماند.';
export const text_b184bc93b89f: string = 'تکمیل ارزیابی';
export const text_1acbc43c4d9a: string = 'اصلاح نتیجه آزمون';
export const text_9dc38725d428: string = 'نمره قبلی';
export const text_bd84aa3b3a4d: string = '۱ · منتشرشده';
export const text_13d724c63012: string = 'نمره اصلاحی';
export const text_62ca713963d7: string = 'علت قابل نمایش';
export const text_c0f4e77f85b2: string = 'یک بخش از بارم دوباره بررسی شد.';
export const text_3bcaab5fb1a2: string = 'علت و نمره تازه را بازبینی کردم.';
export const text_82cce2cafef2: string = 'پیشرفت من';
export const text_d3c3d9804fef: string = 'بازه';
export const text_aa97dfe6095e: string = '۸۶٪';
export const text_a385f4864a15: string = 'حضور';
export const text_43e588422fdc: string = 'میانگین نمونه';
export const text_4666cd29ad0a: string = 'پیشرفت';
export const text_2bd8e4bca091: string = '۶۸٪';
export const text_d6ea18ea0cf9: string = 'تکلیف‌ها و نتیجه‌هافقط نتیجه‌های منتشرشده';
export const text_5b4beefa64a2: string = 'تکلیف‌ها و نتیجه‌ها';
export const text_25cb402886b6: string = 'فقط نتیجه‌های منتشرشده';
export const text_d7797125432b: string = 'گزارش ریاضی دهم';
export const text_07426bfe6250: string = 'بازه گزارش';
export const text_f9c52a288ac5: string = 'تحویل آزمون';
export const text_e7e778462759: string = 'تحویل تکلیف';
export const text_ae9887f9632d: string = '۷۵٪';
export const text_8d2f120226ef: string = '۶۰٪';
export const text_5fa8e6ccaf4e: string = 'گزارش فردی نازنینجزئیات مجاز همین کلاس';
export const text_6e4736658ea8: string = 'گزارش فردی نازنین';
export const text_a6973f9b64b9: string = 'جزئیات مجاز همین کلاس';
export const text_3f1eae136913: string = 'ارزیابی';
export const text_e61dc7f0c9d8: string = 'ثبت‌نام';
export const text_0021b7662fdf: string = 'ریاضی دهمحضور و ارزیابی در یک نگاه';
export const text_afea65352f96: string = 'حضور و ارزیابی در یک نگاه';
export const text_becc69c9d177: string = 'کارکرد مدرسانگزارش مجاز آموزشگاه';
export const text_823d59e6cdfd: string = 'کارکرد مدرسان';
export const text_85ee6e0bed63: string = 'گزارش مجاز آموزشگاه';
export const text_de3925469038: string = 'درخواست خروجی';
export const text_471176959f25: string = 'تنظیم خروجی';
export const text_305c8a7e46d1: string = 'خروجی در حال ساخت';
export const text_2eac88c1d606: string = 'گزارش حضور آبان';
export const text_fbd2e7071219: string = 'درخواست خروجی ثبت شده';
export const text_086a06b9baf7: string = 'گزارش ۰۱۲۸';
export const text_9590d98dcaec: string =
  'می‌توانید از صفحه خارج شوید و بعد وضعیت همین درخواست را ببینید.';
export const text_2735cf11a58f: string = 'نوع گزارش';
export const text_3a8d3d42d286: string = 'حضور آموزشگاه';
export const text_809e18bede80: string = '۱ تا ۳۰ آبان';
export const text_c6bfa98e29cf: string = 'قالب';
export const text_471c9f09af45: string = 'قالب قابل انتخاب گزارش';
export const text_56b8cd94f1cc: string = 'فقط داده مجاز این آموزشگاه صادر شود.';
export const text_9342c2cf4a86: string = 'ساخت خروجی';
export const text_894d142bbd13: string = 'بررسی وضعیت';
export const text_2c3deddc521f: string = 'خروجی آماده است';
export const text_07c5a0dcf704: string = 'فایل گزارش آماده شد';
export const text_5638851c7e46: string = 'گزارش';
export const text_4eba05e4c4fc: string = 'حضور آبان';
export const text_7c7809be63fb: string = 'زمان آماده‌شدن';
export const text_9e06a121387c: string = '۱۴ آبان، ۱۱:۲۰';
export const text_29091f55af43: string = 'گزارش حضور آباننوع فایل مطابق نتیجه سرویس';
export const text_68f7ae024418: string = 'نوع فایل مطابق نتیجه سرویس';
export const text_394bc0bdab28: string =
  'دریافت فایل، مجوز جاری همان گزارش را دوباره بررسی می‌کند.';
export const text_96b12ad79871: string = 'دریافت فایل گزارش';
export const text_8bf189076ea4: string = 'فضاهای رسمی';
export const text_965e4cd2fffd: string = 'گروه و کانال متصل به همین کلاس';
export const text_c9e1693f1e07: string = 'گروه گفتگوی کلاسپرسش و پاسخ مجازآماده';
export const text_bfa7799f0da0: string = 'گروه گفتگوی کلاس';
export const text_ee29210954b7: string = 'پرسش و پاسخ مجاز';
export const text_bc3ae47733e5: string = 'کانال اطلاعیهانتشار رسمی فعالیت‌هاآماده';
export const text_fced23b30f38: string = 'کانال اطلاعیه';
export const text_c617e468294c: string = 'انتشار رسمی فعالیت‌ها';
export const text_2d026709a219: string = 'فعالیت‌های متصلدرس، تکلیف و جلسه';
export const text_14856226cf75: string = 'فعالیت‌های متصل';
export const text_4329f06bf1ba: string = 'درس، تکلیف و جلسه';
export const text_811f0d96d681: string = 'فعالیت در گفتگو';
export const text_97d1863de2a7: string = 'تکلیف تازه منتشر شد';
export const text_fa9f222cc702: string = 'تمرین فصل دوم · ریاضی دهم';
export const text_d5fee35ed841: string = 'اعضای مجاز کلاس';
export const text_b177e22d76f7: string =
  'بازکردن کارت، صفحه همان فعالیت را باز می‌کند؛ نسخه دیگری از تکلیف ساخته نمی‌شود.';
export const text_242ba79320fe: string = 'بازکردن تکلیف';
export const text_9ecce3666c60: string = 'کارهای محتوایی مدرس';
export const text_8ee10da92682: string = 'تمرین فصل دوممنتشرشده · ۶ پاسخ تازه';
export const text_ed21b3555dba: string = 'منتشرشده · ۶ پاسخ تازه';
export const text_2d6f33be6bba: string = 'مرور معادلهپیش‌نویس آزمون';
export const text_7d21410a45f7: string = 'پیش‌نویس آزمون';
export const text_0b3a38ae7702: string = 'روش تجزیهدرس منتشرشده';
export const text_d61668e88264: string = 'روش تجزیه';
export const text_b3a1cc01c0fb: string = 'درس منتشرشده';
export const text_fa39fe6f380f: string = 'حساب شخصی · سارا';
export const text_c7a207c099cd: string = 'رریاضی دهممریم: جلسه فردا ساعت ۱۶ است.۳';
export const text_412ecc8a8c98: string = 'مریم: جلسه فردا ساعت ۱۶ است.';
export const text_08f5a6f99bde: string = 'دکارگاه داستانپاسخ تمرین تازه منتشر شد.۱';
export const text_46e4126e36ad: string = 'کارگاه داستان';
export const text_1a187c7dbdeb: string = 'پاسخ تمرین تازه منتشر شد.';
export const text_7b6814970678: string = 'ممریم رضاییفایل را دریافت کردم.';
export const text_a7f7a4252b99: string = 'فایل را دریافت کردم.';
export const text_d3794f5e0f70: string = 'خوانده‌نشده‌ها';
export const text_ba7cde4b1018: string = 'جستجو در همین فهرست';
export const text_7456c6eb8eb4: string = 'رریاضی دهم۳ پیام تازه۳';
export const text_bf2fa69713cc: string = '۳ پیام تازه';
export const text_f0db73cc7d53: string = 'کانال آفتابیک اطلاعیه تازه۱';
export const text_570aeb6d8633: string = 'کانال آفتاب';
export const text_5054e0295bb4: string = 'یک اطلاعیه تازه';
export const text_4b3785965ae5: string = 'بازگشت از گفتگو، جای قبلی همین فهرست را حفظ می‌کند.';
export const text_6a3842e1159d: string = 'بایگانی گفتگوها';
export const text_c69d12c7104e: string = 'کباشگاه کتاب‌خوانیبایگانی شخصی · عضویت برقرار';
export const text_084b3b5ca0cf: string = 'بایگانی شخصی · عضویت برقرار';
export const text_0e978e035754: string = 'کانال تابستاناعلان مطابق تنظیم شخصی';
export const text_c49596dad238: string = 'کانال تابستان';
export const text_3cc3d07f660a: string = 'اعلان مطابق تنظیم شخصی';
export const text_75d59ed0aeda: string = 'بایگانی صندوق، خروج از گفتگو یا بایگانی کلاس نیست.';
export const text_f3d49c618007: string = 'پوشه‌های من';
export const text_8245689aceb3: string = 'همه گفتگوهاپوشه پایه';
export const text_16dcad17c79c: string = 'همه گفتگوها';
export const text_2592d41e10b8: string = 'پوشه پایه';
export const text_834abb05fb8a: string = 'آموزشگاهگروه‌ها و کانال‌های منتخب';
export const text_f2f0753502cc: string = 'گروه‌ها و کانال‌های منتخب';
export const text_31393624b9b8: string = 'شخصیگفتگوهای مستقیم منتخب';
export const text_0e818d43268f: string = 'گفتگوهای مستقیم منتخب';
export const text_d4e5743be727: string = 'پوشه تازه';
export const text_b75f074268d4: string = 'ویرایش پوشه';
export const text_e0a368655aaf: string = 'نام پوشه';
export const text_916d2a5210a4: string = 'در این پوشه باشند';
export const text_711b0a9281c8: string = 'گروه‌هادر این پوشه باشند';
export const text_6d14c381523c: string = 'کانال‌هادر این پوشه باشند';
export const text_034f19e1faea: string = 'فقط نخوانده‌ها';
export const text_bff458dbe457: string = 'گفتگوهای خوانده‌شده پنهان شوند';
export const text_84a109600d09: string = 'فقط نخوانده‌هاگفتگوهای خوانده‌شده پنهان شوند';
export const text_3871a27c75a9: string = 'انتخاب گفتگوهای خاصاستثناهای افزودن یا حذف';
export const text_3a7ff7db3cda: string = 'انتخاب گفتگوهای خاص';
export const text_dfd896210445: string = 'استثناهای افزودن یا حذف';
export const text_e27d98ed3c7a: string = 'ذخیره پوشه';
export const text_38553110adc2: string = 'حذف پوشه؟';
export const text_ad0ed33042ba: string =
  'پوشه «کلاس‌های من» حذف می‌شود. گفتگوها، پیام‌ها و عضویت‌ها باقی می‌مانند.';
export const text_dec6f5be613a: string = 'حذف پوشه';
export const text_6681bb5f640f: string = 'ممریم رضاییشناسه مجاز: maryam.r';
export const text_cf848d0e9e04: string = 'شناسه مجاز: maryam.r';
export const text_71afc3470505: string = 'اامیر نادریشناسه مجاز: amir.n';
export const text_095786cf8923: string = 'شناسه مجاز: amir.n';
export const text_92ace7964658: string = 'رریحانه زمانیشناسه مجاز: reyhaneh.z';
export const text_7a4788de735a: string = 'شناسه مجاز: reyhaneh.z';
export const text_6a05ebe485ea: string = 'افزودن مخاطب';
export const text_9e9ed659c59d: string = 'مخاطب تازه';
export const text_d14e2425b833: string = 'شناسه یا حساب مجاز';
export const text_ca399e9d113b: string = 'حساب پیدا شده مطابق حریم ارتباط';
export const text_e09ca2f7a9ee: string = 'نام ذخیره‌شده نزد من';
export const text_69149a305ea9: string = 'خانم رضایی';
export const text_a08043fa243d: string =
  'افزودن مخاطب، شماره خصوصی یا دسترسی آموزشی تازه آشکار نمی‌کند.';
export const text_195158758e69: string = 'ذخیره مخاطب';
export const text_a612facdd48b: string = 'ویرایش مخاطب';
export const text_0e183b72aa82: string = 'اطلاعات مرکزی حساب فقط خواندنی است.';
export const text_ef1252bec384: string = 'نام نزد من';
export const text_9ac39df2ca1d: string = 'مدرس ریاضی';
export const text_bf646cedd6ee: string = 'گفتگوی شخصیبازکردن همان گفتگو';
export const text_91df9b1e169d: string = 'بازکردن همان گفتگو';
export const text_74876844aa95: string = 'حذف از مخاطبینپیام‌ها حذف نمی‌شوند';
export const text_97eb5829fb6f: string = 'حذف از مخاطبین';
export const text_911bfa280623: string = 'پیام‌ها حذف نمی‌شوند';
export const text_ab1b7d69d944: string = 'ذخیره نام مخاطب';
export const text_2b9d859d5148: string =
  'مریم رضاییبرای تمرین فردا، سؤال دوم را هم بررسی کنید.۱۰:۴۲';
export const text_4cd3d8dc4b91: string = 'برای تمرین فردا، سؤال دوم را هم بررسی کنید.';
export const text_53ed44c0fbe9: string = '۱۰:۴۲';
export const text_eb657abfac61: string = 'پاسخم را در بخش تکلیف کلاس تحویل دادم.۱۰:۴۲';
export const text_64052fa2c468: string = 'پاسخم را در بخش تکلیف کلاس تحویل دادم.';
export const text_b77bd093000e: string = 'تمرین فصل دوم.pdfPDF · ۲ صفحه';
export const text_aee08b70d12f: string = 'تمرین فصل دوم.pdf';
export const text_808ce7b55daf: string =
  'پیام‌ها در حساب شخصی شما دیده می‌شوند؛ نقش آموزشگاه صندوق دیگری نمی‌سازد.';
export const text_ab803f5284d7: string = 'نوشتن پیام';
export const text_3820ef114d81: string = 'اطلاعات مریم';
export const text_39e288c8cacb: string = 'شناسه: maryam.r';
export const text_71c8b878a970: string = 'مطابق حریم شخص';
export const text_50cd076c8f9c: string = 'نمایش داده نمی‌شود';
export const text_b40a402f0ccb: string = 'رسانه و فایلفقط فایل‌های همین گفتگو';
export const text_f05edb037b87: string = 'فقط فایل‌های همین گفتگو';
export const text_d2a87a498fe5: string = 'اعلان گفتگوتنظیم شخصی';
export const text_1ef959af393f: string = 'اعلان گفتگو';
export const text_00708ee8fe16: string = 'تنظیم شخصی';
export const text_52ce3570062e: string = 'گزارش یا مسدودیایمنی ارتباط';
export const text_ab3e3cce4967: string = 'گزارش یا مسدودی';
export const text_14fa173f9c4d: string = 'ایمنی ارتباط';
export const text_0df3c630284a: string = 'نام یا شناسه مجاز';
export const text_012421ebc8ea: string = 'ممریم رضاییمخاطب شما';
export const text_103701225dd8: string = 'مخاطب شما';
export const text_5396bec892fa: string = 'اامیر نادریحساب مجاز برای ارتباط';
export const text_e1426fcea6ab: string = 'حساب مجاز برای ارتباط';
export const text_ac6d1597d890: string =
  'اگر ارتباط مجاز نباشد، علت عمومی و راه بازگشت نمایش داده می‌شود.';
export const text_0285593b36b9: string = 'ذخیره‌شده‌ها';
export const text_188fb4c3c7c0: string = 'متن یا نام فایل';
export const text_846e301d323c: string = 'فایل‌ها';
export const text_8c5a1b1ddc3d: string = 'راهنمای بازخوردبرچسب: یادگیری';
export const text_aeed027c8406: string = 'راهنمای بازخورد';
export const text_f6bf0608fba0: string = 'برچسب: یادگیری';
export const text_cfdbb0149f05: string = 'ایده داستان کوتاهبرچسب: یادداشت';
export const text_b7f297bf17bc: string = 'ایده داستان کوتاه';
export const text_3d292d5ecaa1: string = 'برچسب: یادداشت';
export const text_363c6b4c3afb: string = 'زمان جلسه بعدبرچسب: برنامه';
export const text_425fe324c74a: string = 'زمان جلسه بعد';
export const text_1b1b6847fb9c: string = 'برچسب: برنامه';
export const text_d0159b6e2878: string = 'برچسب‌های پیام';
export const text_eb6201c428b6: string = 'یادگیری';
export const text_dcf8a3a09017: string = 'برچسب تازه';
export const text_87a8fc32d223: string = 'ایده‌ها';
export const text_25c909b8cd86: string = 'ذخیره برچسب‌ها';
export const text_fd223e994737: string = 'یادداشت شخصی';
export const text_8f7385aebdc3: string = 'فقط برای خودتان';
export const text_387ab99f496c: string = 'گفتگوی ذخیره‌شده حساب';
export const text_5facf0ff5ab7: string = 'متن یادداشت';
export const text_0f15e94be7db: string = 'برای جلسه بعد، مثال تازه‌ای درباره روایت آماده کنم.';
export const text_6a24bc5078bf: string = 'ایده‌ها.pdfپیوست انتخاب‌شده';
export const text_26079528fd05: string = 'ایده‌ها.pdf';
export const text_46f115e4c06c: string = 'پیوست انتخاب‌شده';
export const text_e9e0705dad33: string = 'ذخیره یادداشت';
export const text_29281b092b37: string = 'جستجوی پیام‌ها';
export const text_be6d231c9c42: string = 'جلسه فردا';
export const text_788d3aa05180: string = 'همین گفتگو';
export const text_8b13b4a18bb0: string = 'ریاضی دهمجلسه فردا ساعت ۱۶ برگزار می‌شود.';
export const text_40a9c4b43b36: string = 'جلسه فردا ساعت ۱۶ برگزار می‌شود.';
export const text_6394abdeef82: string = 'کانال آفتاببرنامه جلسه فردا منتشر شد.';
export const text_86162cd81ade: string = 'برنامه جلسه فردا منتشر شد.';
export const text_3192a1638f41: string = 'فقط گفتگوهای مجاز حساب در نتیجه می‌آیند.';
export const text_0af8e21391e1: string = 'فیلتر جستجو';
export const text_a05526b12b60: string = 'همه اعضای مجاز';
export const text_08047cb3b52f: string = 'بازه زمانی';
export const text_7d9f7a60b31f: string = 'نوع نتیجه';
export const text_a976392b283b: string = 'متن و فایل';
export const text_738fab0bd774: string = 'نتیجه در گفتگو';
export const text_eaf13179bffa: string = 'نتیجه ۲ از ۵';
export const text_ce5e91637876: string =
  'پیام هدف برجسته می‌شود؛ بازگشت، عبارت و فیلتر جستجو را حفظ می‌کند.';
export const text_650d3a624d25: string = 'بازگشت به نتیجه‌ها';
export const text_321812eb0943: string = 'توضیح اختیاری';
export const text_d8b63b608638: string = 'گفتگو درباره کتاب‌های این ماه';
export const text_329c568ab406: string = 'زمینه';
export const text_588d689fc82c: string = 'نمایش';
export const text_7efdd8266fda: string = 'انتخاب افراد';
export const text_776ef8e50d43: string = 'افراد اولیه';
export const text_838e8d2dcc14: string = 'مخاطب یا حساب مجاز';
export const text_43153e4c2d47: string =
  'افزودن اولیه ممکن است مطابق حریم فرد به دعوت منتظر تبدیل شود.';
export const text_13e231362f93: string = 'بازبینی ساخت گروه';
export const text_f3c19ef6a242: string = 'گروه ساخته شد';
export const text_7cca2b21cb9f: string = 'مالک گفتگو';
export const text_7b6f7441f517: string = 'باشگاه کتاب‌خوانی آماده است';
export const text_e2a36a52bfa7: string = 'اعضای پذیرفته';
export const text_c3ffeb92da84: string = '۲ نفر';
export const text_8b45ae7c67a5: string = 'دعوت منتظر';
export const text_b571ca29acc4: string = '۱ نفر';
export const text_78be11618248: string =
  'نتیجه هر فرد جدا دیده می‌شود؛ انتظار دعوت، عضویت قطعی نیست.';
export const text_244216163b16: string = 'بازکردن گروه';
export const text_64213ab7d572: string = 'یادداشت‌های مطالعه';
export const text_8dc17980bcb9: string = 'نکته‌ها و منابع منتخب برای مطالعه';
export const text_f04534b60ed3: string = 'ادامه انتخاب مخاطب';
export const text_9f952632545f: string = 'بازبینی کانال';
export const text_9f4cef88b0fe: string = 'انتشار توسط مدیران مجاز';
export const text_e76f5d9b87f2: string = 'دعوت اولیه';
export const text_04f3305dfcff: string = '۲ حساب منتخب';
export const text_6f8443abae1e: string = 'نام و شرایط کانال را بازبینی کردم.';
export const text_ad1d3d855e4f: string = 'اولین مطلب را منتشر کنید';
export const text_dc76a0603c7c: string = 'نوشتن فقط برای نقش مجاز کانال';
export const text_48bfc8c04041: string = 'متن مطلب';
export const text_a458f372eabd: string = 'به کانال یادداشت‌های مطالعه خوش آمدید.';
export const text_dd629981a1fe: string = 'پیوست اختیارینوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_687c3df75734: string = 'پیوست اختیاری';
export const text_68ef353aedac: string = 'مدیر گفتگو';
export const text_3c312bf71a83: string = '۱۲ عضو · گروه خصوصی';
export const text_bc91aa896abd: string = 'اعضا و مدیراننقش‌ها و اختیارها';
export const text_4665b312d133: string = 'نقش‌ها و اختیارها';
export const text_ef7e0231d689: string = 'رسانه و فایلفایل‌های مجاز گروه';
export const text_2335119781c3: string = 'فایل‌های مجاز گروه';
export const text_5826ea092fa5: string = 'لینک و درخواست‌هاورودی‌های عضویت';
export const text_9da4c0fd40d6: string = 'لینک و درخواست‌ها';
export const text_ecb26c2aba73: string = 'ورودی‌های عضویت';
export const text_96cfbdf43a67: string = 'تنظیمات گروهنمایش، تاریخچه و مجوز';
export const text_93af93e3ec7e: string = 'نمایش، تاریخچه و مجوز';
export const text_799281bfed10: string = 'گفتگو درباره کتاب و تجربه مطالعه';
export const text_be26c3610477: string = 'ذخیره با نسخه فعلی اطلاعات گروه انجام می‌شود.';
export const text_6b32605a22d4: string = 'ذخیره اطلاعات گروه';
export const text_501dd706f666: string = 'عکس گروه';
export const text_1560ab483adf: string =
  'انتخاب عکس آمادهنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_f000ab6ca367: string = 'انتخاب عکس آماده';
export const text_01516ae19123: string =
  'انتخاب و برش با کنترل سیستم انجام شود؛ ثبت، شناسه فایل آماده را به گفتگو متصل می‌کند.';
export const text_ba0abc09e0bc: string = 'حذف عکس فعلی';
export const text_d7dbb4f45114: string = 'کانال آموزشگاه آفتاب';
export const text_65dba583f93b: string = 'اطلاعیه‌های رسمی · ۱۲۸ عضو';
export const text_779e272fcf42: string = 'در این کانال، فقط منتشرکنندگان مجاز پیام می‌فرستند.';
export const text_40120b23c4e5: string = 'رسانه و فایلمطالب در دسترس شما';
export const text_757dc74803e0: string = 'مطالب در دسترس شما';
export const text_c16648950022: string = 'اعلان کانالتنظیم مستقل از عضویت';
export const text_0aa2751db932: string = 'اعلان کانال';
export const text_b11a55bcf808: string = 'تنظیم مستقل از عضویت';
export const text_c939d94eb07a: string = 'اعضای قابل مشاهدهمطابق مجوز کانال';
export const text_d03ebcbee43f: string = 'اعضای قابل مشاهده';
export const text_7e55ad7a8ca8: string = 'مطابق مجوز کانال';
export const text_b5b74fbfacdf: string = 'عنوان کانال';
export const text_15f1b9048f9b: string = 'اطلاعیه‌های آفتاب';
export const text_d37edd620cce: string = 'خبرها و برنامه‌های رسمی آموزشگاه';
export const text_ac86a08c6006: string = 'عکس کانالانتخاب، جایگزینی یا حذف';
export const text_8d4e85c1af02: string = 'عکس کانال';
export const text_2f260a2cf803: string = 'انتخاب، جایگزینی یا حذف';
export const text_1d921f61a85a: string = 'ذخیره اطلاعات کانال';
export const text_7f1dc1b6bee9: string = 'مدیران کانال';
export const text_83a5d89dfb79: string = 'سسارا احمدیمالک کانالمالک';
export const text_db8c33dff4ca: string = 'مالک کانال';
export const text_157e38d1f67b: string = 'مالک';
export const text_4e9d970860d8: string = 'ممریم رضاییانتشار و ویرایش مجازمدیر';
export const text_de460759cc15: string = 'انتشار و ویرایش مجاز';
export const text_632dfbc41d3c: string = 'عضو عادی کانال، دکمه انتشار یا ابزار مدیر را نمی‌بیند.';
export const text_dc4ea3d65e29: string = 'افزودن مدیر مجاز';
export const text_8fbf80711aff: string = 'نمایش گروهخصوصی';
export const text_b1313f56d604: string = 'نمایش گروه';
export const text_0b30936607af: string = 'تاریخچه برای عضو تازهاز زمان پیوستن';
export const text_60a282ad3949: string = 'تاریخچه برای عضو تازه';
export const text_c03a36db2c6c: string = 'از زمان پیوستن';
export const text_d8039311c4a3: string = 'قابلیت اعضاارسال، رسانه و ابزارهای مجاز';
export const text_62625d069243: string = 'قابلیت اعضا';
export const text_ed2a81c76e71: string = 'ارسال، رسانه و ابزارهای مجاز';
export const text_5a4a5bceffac: string = 'دکمه‌ها از مجوز مؤثر حساب و تنظیمات گفتگو پیروی می‌کنند.';
export const text_d3b66c55c2c2: string = 'بازبینی تنظیمات';
export const text_8724dd432776: string = 'تاریخچه عضو تازه';
export const text_064625567ba6: string = 'از زمان پیوستنپیام‌های پیش از عضویت نمایش داده نشوند';
export const text_deb1d5d10aaf: string = 'پیام‌های پیش از عضویت نمایش داده نشوند';
export const text_e64de6753944: string = 'همه تاریخچه مجازطبق سیاست و مجوز گفتگو';
export const text_9b8c5ec6a434: string = 'همه تاریخچه مجاز';
export const text_65b0c2a84a64: string = 'طبق سیاست و مجوز گفتگو';
export const text_b04690039a6b: string =
  'تغییر تاریخچه ممکن است داده بیشتری در دسترس اعضای تازه بگذارد.';
export const text_0725f66ebcc4: string = 'انتخاب سیاست تاریخچه';
export const text_52e284b960e8: string = 'قابلیت اعضای گروه';
export const text_e7aa17d0214b: string =
  'نام و مقدار قابلیت‌ها باید با قرارداد بک‌اند تطبیق قطعی داده شوند.';
export const text_da4087c1f834: string = 'گفتگو برای اعضای مجاز';
export const text_02541dbfe8c9: string = 'ارسال پیامگفتگو برای اعضای مجاز';
export const text_27fd24749f4f: string = 'فایل و رسانه مجاز';
export const text_f66f3824d809: string = 'ارسال پیوستفایل و رسانه مجاز';
export const text_33d88b74bffe: string = 'ساخت نظرسنجی';
export const text_2f308fb1bc28: string = 'طبق قابلیت معتبر';
export const text_d1c4c2bc1269: string = 'ساخت نظرسنجیطبق قابلیت معتبر';
export const text_ddd60856472f: string = 'اختیارهای مریم';
export const text_a9043cf911f1: string = 'مدیر گروه باشگاه کتاب‌خوانی';
export const text_56e087b22a3c: string = 'مدیریت اطلاعات';
export const text_7c25bdb54d5f: string = 'نام، توضیح و عکس';
export const text_1b8b7b9b8d40: string = 'مدیریت اطلاعاتنام، توضیح و عکس';
export const text_462423d8d48e: string = 'دعوت و رسیدگی به عضویت';
export const text_dc1fe202f675: string = 'مدیریت اعضادعوت و رسیدگی به عضویت';
export const text_d999f05bf307: string = 'مدیریت محتوا';
export const text_ff9f6e298242: string = 'عمل مطابق مجوز پیام';
export const text_ce8ea6308851: string = 'مدیریت محتواعمل مطابق مجوز پیام';
export const text_4e820aee8871: string = 'ذخیره اختیارها';
export const text_52cc68396bbb: string = 'محدودیت عضو';
export const text_db3eb91ea0fa: string = 'محدودیت در همین گفتگو';
export const text_81c24f92ce87: string = 'نوع محدودیت';
export const text_816c503c6976: string = 'طبق سیاست معتبر گفتگو';
export const text_02630d3fb03e: string = 'تا زمان';
export const text_28714d8031ee: string = '۲۰ آبان، ۱۸:۰۰';
export const text_526a457f819d: string = 'تکرار پیام نامرتبط';
export const text_cfa242dc7d5c: string = 'ثبت محدودیت';
export const text_bffc688c2d11: string = 'وضعیت ارتباط من';
export const text_fa9d154c5ad8: string = 'ارسال پیام شما در این گروه محدود شده است.';
export const text_50bb3bd469f6: string = 'دامنه';
export const text_66ce64731115: string =
  'محدودیت گروه با مسدودی شخصی حساب تفاوت دارد؛ علت قابل نمایش از نتیجه معتبر می‌آید.';
export const text_2c0f7cdaa976: string = 'نام یا شناسه عضو';
export const text_6aec6dc6e767: string = 'سسارا احمدیمالک گفتگومالک';
export const text_3e8eee5fa527: string = 'ممریم رضاییمدیر گفتگومدیر';
export const text_afc57fea6dd9: string = 'اامیر نادریعضو گفتگو';
export const text_e203137b3b49: string = 'دعوت فرد';
export const text_a5993842b072: string = 'نقش امیر';
export const text_bad6290ac411: string = 'عضواختیار پایه گفتگو';
export const text_54c7d32c0578: string = 'اختیار پایه گفتگو';
export const text_13346dedf676: string = 'مدیربا مجموعه اختیار مشخص';
export const text_9e08a5e26ea2: string = 'با مجموعه اختیار مشخص';
export const text_3b6088889d6a: string = 'مدیرکردن فرد، مالکیت گفتگو را منتقل نمی‌کند.';
export const text_41dafea8b1af: string = 'ثبت نقش';
export const text_47c5a501e339: string = 'حذف امیر از گروه؟';
export const text_73ed2a040dd1: string =
  'دسترسی تازه فرد به این گروه پایان می‌یابد. برای گروه وابسته به کلاس، عضویت از همان کلاس مدیریت می‌شود.';
export const text_a7e1648b8cbf: string = 'حذف از گروه';
export const text_c91a2d24c0c2: string = 'انتقال مالکیت';
export const text_6e9c2b8b39cb: string = 'عضو مجاز مقصد';
export const text_d052343c5e29: string = 'مریم رضاییمدیر فعلی';
export const text_77c18f670b3a: string = 'مدیر فعلی';
export const text_94faf7f8bfbd: string = 'امیر نادریعضو فعلی';
export const text_721140931d77: string = 'عضو فعلی';
export const text_7a0c032ac3a1: string = 'مالکیت فقط پس از پذیرش مقصد تغییر می‌کند.';
export const text_3304b058d80c: string = 'ارسال درخواست انتقال';
export const text_4d5db3a766d6: string = 'پذیرش مالکیت';
export const text_cdf36b65405e: string = 'مدیر مقصد';
export const text_a6492be98621: string = 'سارا احمدی انتقال مالکیت را پیشنهاد داده است.';
export const text_f3274871b2ab: string =
  'مسئولیت مدیریت اعضا، تنظیمات و محتوای مجاز گفتگو را بازبینی کنید.';
export const text_cb1f5dc61d85: string = 'رد پیشنهاد';
export const text_6e6031597726: string = 'خروج آخرین مالک';
export const text_1214c77cb79b: string = 'پیش از خروج، انتقال معتبر مالکیت را تکمیل کنید.';
export const text_24aa0dd8b3b4: string =
  'بازگشت به گروه آزاد است؛ اقدام خروج تا تعیین وضعیت معتبر انجام نمی‌شود.';
export const text_b1e9d130b441: string = 'مدیریت انتقال';
export const text_6f2fcb4904af: string = 'حساب مجاز برای دعوت';
export const text_c8c4e8e53108: string = 'حساب انتخاب‌شده';
export const text_ca489c3a10b1: string = 'دعوت فقط برای مقصد مجاز ارسال می‌شود.';
export const text_c717cd4d6504: string = 'دعوت‌های گفتگو';
export const text_66578047029f: string = 'باشگاه کتاب‌خوانیدعوت سارا احمدیمنتظر';
export const text_7bf44e99ca76: string = 'دعوت سارا احمدی';
export const text_f58144903aea: string = 'کانال مطالعهدعوت مریم رضاییمنتظر';
export const text_616d06c1a9d3: string = 'کانال مطالعه';
export const text_1db85ecc1ff0: string = 'دعوت مریم رضایی';
export const text_91a0354f5d2b: string =
  'بازکردن دعوت، محتوای خصوصی گفتگو را پیش از پذیرش آشکار نمی‌کند.';
export const text_8ed69f43da6a: string = 'پذیرش دعوت گروه';
export const text_586d79900ae7: string = 'دعوت به عضویت';
export const text_6893f92bbed3: string = 'دعوت‌کننده';
export const text_60b56792f2b0: string = 'گروه خصوصی';
export const text_37f6cfead505: string = 'پذیرش و ورود';
export const text_6ea5a1219274: string = 'لینک دعوت تازه';
export const text_189a084fb24a: string = 'اعتبار تا';
export const text_3e835a7d66c7: string = 'حداکثر استفاده';
export const text_5e3cce158f8b: string = '۲۰ بار';
export const text_089ab5cfe333: string = 'نیاز به تأیید مدیر';
export const text_f91e7d46945e: string = 'ورود پس از بررسی درخواست';
export const text_04ec24fc5f10: string = 'نیاز به تأیید مدیرورود پس از بررسی درخواست';
export const text_9a45797cada9: string = 'سقف و اعتبار از قواعد معتبر سرویس پیروی می‌کنند.';
export const text_61134b94ae61: string = 'ساخت لینک';
export const text_6198a86479ac: string = 'دعوت ترم پاییزتا ۲۰ آبان · ۸ از ۲۰ استفادهفعال';
export const text_e9fadd870f55: string = 'دعوت ترم پاییز';
export const text_784f827fdd29: string = 'تا ۲۰ آبان · ۸ از ۲۰ استفاده';
export const text_1e850afb9f20: string = 'دعوت قدیمیاعتبار پایان یافتهمنقضی';
export const text_8a6e3ae4aac5: string = 'دعوت قدیمی';
export const text_805fbf12990b: string = 'اعتبار پایان یافته';
export const text_eb07fef8c0a7: string =
  'کپی و اشتراک لینک با کنترل سیستم انجام می‌شود؛ کد خصوصی در فهرست عمومی نمایش داده نشود.';
export const text_39596d116d9e: string = 'باطل‌کردن لینک؟';
export const text_3725986cfe85: string =
  'این لینک دیگر برای ورود تازه معتبر نیست. عضویت افراد پذیرفته‌شده تغییر نمی‌کند.';
export const text_71900fb83d00: string = 'لینک';
export const text_f6ca43d47c0e: string = 'استفاده';
export const text_a92b1627ba5e: string = '۸ بار';
export const text_c31ef443c9c5: string = 'ابطال لینک';
export const text_986784988e8f: string = 'ورود با کد دعوت';
export const text_72beaa6e7227: string = 'کد یا لینک';
export const text_3673ed6071b9: string = 'کد دعوت دریافت‌شده';
export const text_3ccdb6edf6c1: string = 'گروه خصوصی · نیازمند تأیید مدیر';
export const text_af61d1fbbc0d: string =
  'پس از ثبت درخواست، تا تأیید مدیر محتوای خصوصی باز نمی‌شود.';
export const text_f7bc56d50911: string = 'درخواست‌های گروه';
export const text_73da3d1b81e7: string = 'رریحانه زمانی۱۴ آبان، ۱۰:۲۰منتظر';
export const text_7dbd9020a43f: string = '۱۴ آبان، ۱۰:۲۰';
export const text_a7ba67788a98: string = 'ععلی کریمی۱۴ آبان، ۱۰:۳۵منتظر';
export const text_97aef28e6a4d: string = '۱۴ آبان، ۱۰:۳۵';
export const text_af432f526bdc: string = 'بررسی درخواست ریحانه';
export const text_488a2657a180: string = 'انصراف از درخواست؟';
export const text_a5226e8153f5: string =
  'درخواست پیوستن به باشگاه کتاب‌خوانی لغو می‌شود. محتوای خصوصی همچنان بسته می‌ماند.';
export const text_aad095330131: string = 'لغو درخواست';
export const text_a522f02c4915: string = 'یافتن گفتگو';
export const text_5226199cd3cc: string = 'عنوان گروه یا کانال عمومی';
export const text_cb27509a3b20: string = 'کتاب و گفتگوگروه عمومی';
export const text_bb66db814e3b: string = 'کتاب و گفتگو';
export const text_efffbfabe649: string = 'گروه عمومی';
export const text_f87512ad381f: string = 'نکته‌های مطالعهکانال عمومی';
export const text_2067a2304add: string = 'نکته‌های مطالعه';
export const text_cc35d1893260: string = 'کانال عمومی';
export const text_ae41208d3329: string = 'پیش‌نمایش گروه';
export const text_20db4c19a4bf: string =
  'گفتگو درباره کتاب و تجربه خواندن؛ قواعد گروه را پیش از ورود بخوانید.';
export const text_a74b020a6d20: string = 'سیاست ورود';
export const text_a3084c0004f2: string = 'طبق پاسخ سرویس';
export const text_c9a51dceff37: string = 'قواعد قابل نمایش را خواندم.';
export const text_0c97e129cfe4: string = 'پیوستن به گروه';
export const text_0cbf3ec0b6d2: string = 'وضعیت پیام‌رسان';
export const text_c0dcb028fcb8: string = 'برای این ارتباط، بررسی وضعیت حساب لازم است.';
export const text_90d1bb595385: string = 'وضعیت ارتباط';
export const text_c302dc1f8d47: string = 'طبق پاسخ معتبر';
export const text_487afd678214: string = 'قدم بعدی';
export const text_ae217b9518c1: string = 'بررسی اطلاعات حساب';
export const text_0bd0ee26ff18: string = 'اطلاعات حساس سن یا علت خصوصی دیگران نمایش داده نمی‌شود.';
export const text_733a42439d97: string = 'دیدن وضعیت حساب';
export const text_e631624e6628: string = 'موضوع‌های گروه';
export const text_0ff4557e8a4d: string = 'عنوان موضوع';
export const text_1fbb23e0d1c2: string = 'گفتگوی عمومیموضوع اصلی';
export const text_cd35e6f70fdf: string = 'گفتگوی عمومی';
export const text_4838c81c3144: string = 'موضوع اصلی';
export const text_8159d9a49cfa: string = 'پرسش‌های فصل دوم۸ پیام تازه۸';
export const text_7285ff787aa3: string = 'پرسش‌های فصل دوم';
export const text_53e38ba273e0: string = '۸ پیام تازه';
export const text_419ae73fa90e: string = 'معرفی کتابموضوع بسته‌شدهبسته';
export const text_3ceac7c210b1: string = 'معرفی کتاب';
export const text_a0e499195aea: string = 'موضوع بسته‌شده';
export const text_e367c541161e: string = 'موضوع تازه';
export const text_2851659ac01b: string = 'پرسش‌های فصل سوم';
export const text_ae742421b178: string =
  'موضوع به همین گروه متصل است؛ ایجاد آن، گروه یا عضویت جدا نمی‌سازد.';
export const text_d1eb37f2da72: string = 'ساخت موضوع';
export const text_0aaf752c3e19: string = 'بستن موضوع؟';
export const text_dd0bb8b83d0e: string =
  'ارسال تازه در این موضوع مطابق سیاست سرویس بسته می‌شود. تاریخچه مجاز باقی می‌ماند.';
export const text_726ff17fed47: string = 'پاسخ در گفتگو';
export const text_321639a400f1: string = 'در پاسخ به مریم';
export const text_71e352272cf9: string = 'جلسه فردا ساعت ۱۶ است.';
export const text_14a661b100b5: string = 'پیام شما';
export const text_daff7dbb417f: string = 'ممنون، برای جلسه آماده‌ام.';
export const text_9b7a69907ffe: string = 'ارسال پاسخ';
export const text_e12580f6e2c5: string = 'ویرایش پیام من';
export const text_dfe367d16e8b: string = 'فایل کامل تمرین را فرستادم.';
export const text_63635bbdb33e: string =
  'ویرایش فقط برای پیام مجاز انجام می‌شود؛ شکست ثبت، متن شما را نگه می‌دارد.';
export const text_8febd7e7db65: string = 'پیش‌نویس حفظ شود؟';
export const text_4c6d17a1a95b: string =
  'متن ناتمام در همین گفتگو نگه داشته می‌شود تا بعداً ادامه دهید.';
export const text_c2229000f775: string = 'حذف پیش‌نویس';
export const text_923ddc9f2c48: string = 'نگه‌داشتن پیش‌نویس';
export const text_38a7647a6c4f: string = 'حذف این پیام';
export const text_21d22d732a71: string = 'عمل مجاز نیست';
export const text_b2cfb05c7aa6: string = 'امکان انجام این عمل برای این پیام در دسترس نیست.';
export const text_93fb603a6e13: string =
  'پیام و دکمه‌ها با مجوز تازه بازخوانی می‌شوند. متن عمومی، علت خصوصی مدیر را افشا نمی‌کند.';
export const text_d26045daa30a: string = 'فقط برای مناز نمای شخصی من حذف شود';
export const text_e92dcb52d41f: string = 'فقط برای من';
export const text_32d4e7318e9e: string = 'از نمای شخصی من حذف شود';
export const text_c19734adf372: string = 'برای همهفقط اگر مجوز این پیام را دارم';
export const text_f59c49ee1642: string = 'برای همه';
export const text_3f57d0b4f278: string = 'فقط اگر مجوز این پیام را دارم';
export const text_fae3caf84276: string = 'دامنه حذف باید پیش از تأیید روشن باشد.';
export const text_59675ea15ce6: string = 'ادامه حذف';
export const text_4a5abad7a03e: string = 'حذف برای همه؟';
export const text_7aa8193faaf8: string =
  'این پیام طبق مجوز سرویس از نمای مجاز گفتگو حذف می‌شود؛ ارسال این عمل برگشت بصری تضمین‌شده ندارد.';
export const text_7c58bdadcb3a: string = 'حذف پیام';
export const text_cfb530193723: string = 'گفتگوی مقصد';
export const text_873399c8d190: string = 'ذخیره‌شده‌هافقط برای خودم';
export const text_ddfa2041a758: string = 'فقط برای خودم';
export const text_b64f2ddd7caa: string = 'ممریم رضاییگفتگوی شخصی مجاز';
export const text_a88badbe8dfc: string = 'گفتگوی شخصی مجاز';
export const text_62101db69c56: string = 'باشگاه کتاب‌خوانیگروه مجاز';
export const text_d52d500e7167: string = 'گروه مجاز';
export const text_fdefa4ba93cc: string = 'فقط مقصدهای مجاز برای این عمل نمایش داده شوند.';
export const text_79e4dec3de61: string = 'بازفرستادن به مقصد';
export const text_7e623989a738: string = 'سنجاق پیام';
export const text_d59dd17a07bc: string = 'این پیام در بخش سنجاق‌های همین گفتگو قرار می‌گیرد.';
export const text_49f6a953038e: string = 'برنامه جلسه بعد';
export const text_cc5b23880bef: string = 'واکنش به پیام';
export const text_22928233b609: string = 'پسندیدمواکنش معتبر سرویس';
export const text_901c88583289: string = 'پسندیدم';
export const text_527a3ddc4b31: string = 'واکنش معتبر سرویس';
export const text_e7603849ea2c: string = 'سپاسواکنش معتبر سرویس';
export const text_a229f788ea5c: string = 'سپاس';
export const text_571933c44a1a: string = 'حذف واکنش منواکنش قبلی خودم حذف شود';
export const text_a51450937fef: string = 'حذف واکنش من';
export const text_c973277116a0: string = 'واکنش قبلی خودم حذف شود';
export const text_d2d032f16298: string =
  'در رابط اجرایی، واکنش‌های واقعی و قابل خواندن نمایش داده شوند.';
export const text_320fb3b39d76: string = 'ثبت واکنش';
export const text_331fdaddfa04: string = 'انتخاب پیوست';
export const text_948b8c56c99f: string = 'پیش‌نمایش پیوست';
export const text_a2da504ac79a: string = 'تمرین فصل دوم.pdfPDF · ۱٫۲ مگابایت';
export const text_c4b011b1f05b: string = 'PDF · ۱٫۲ مگابایت';
export const text_662e71f79f57: string = 'صورت تمرین برای جلسه بعد';
export const text_5e84c18aabf1: string = 'مقصد';
export const text_dc74460e4746: string = 'ارسال بی‌صدا';
export const text_d991f7f9b663: string = 'بدون اعلان صوتی طبق پشتیبانی سرویس';
export const text_77004d8f7538: string = 'ارسال بی‌صدابدون اعلان صوتی طبق پشتیبانی سرویس';
export const text_47c72d319038: string = 'تصویر یا ویدیو';
export const text_044fc2ef5591: string = 'فایل دستگاه';
export const text_21bf410190dd: string = 'مخاطب مجاز';
export const text_b9ef6920fab2: string = 'انتخاب فایل و مجوز دستگاه با کنترل سیستم انجام می‌شود.';
export const text_deaf56330839: string = 'بارگذاری پیوست';
export const text_e5c1444aef5a: string = 'تمرین فصل دوم.pdfدر حال بارگذاری';
export const text_f1d6ef9b84ea: string = 'ارسال پیام تا آماده‌شدن فایل کامل نمی‌شود.';
export const text_4cd03760f01f: string =
  'خطا، فایل انتخاب‌شده و توضیح را برای تلاش دوباره نگه می‌دارد.';
export const text_c2f970f6bb7f: string = 'رسانه‌های گروه';
export const text_a2cba21eff28: string = 'تصویرها';
export const text_641b2c5a7a72: string = 'پیوندها';
export const text_ef6d0a23cb98: string = 'تمرین جلسه بعد.pdfPDF · ۲ صفحه';
export const text_4b68379eddf1: string = 'تمرین جلسه بعد.pdf';
export const text_9e0c939868ba: string = 'راهنمای مطالعهپیوند منتشرشده در گفتگو';
export const text_5e7694efb467: string = 'پیوند منتشرشده در گفتگو';
export const text_63afa072192e: string = 'مشاهده فایل';
export const text_b8542d7625f8: string = 'پیش‌نمایش فایل مجاز گفتگو';
export const text_e97015d88bd2: string = 'مطابق مجوز جاری';
export const text_38a9e8a86c29: string = 'گزینه‌های فایل';
export const text_5b3f18e7e8f3: string = 'دیدن پیام اصلی';
export const text_c5923294221d: string = 'ذخیره با کنترل دستگاه';
export const text_9dccd8f592a7: string = 'اشتراک‌گذاری مجاز';
export const text_1c9973bea362: string = 'آدرس فایل خصوصی به پیوند عمومی دائمی تبدیل نشود.';
export const text_be438b93fd85: string = 'نظرسنجی تازه';
export const text_c00a2065c65f: string = 'برای جلسه بعد کدام زمان بهتر است؟';
export const text_59620ae960c8: string = 'گزینه ۱';
export const text_795f07d73dac: string = 'شنبه ۱۶';
export const text_0b75c3de2bc7: string = 'گزینه ۲';
export const text_153a036a6527: string = 'دوشنبه ۱۶';
export const text_31bc655d4104: string = 'چند پاسخ مجاز';
export const text_ca6969a72297: string = 'امکان انتخاب بیش از یک گزینه';
export const text_f7a64ff582f5: string = 'چند پاسخ مجازامکان انتخاب بیش از یک گزینه';
export const text_dc62d8f9bf85: string = 'رأی ناشناس';
export const text_523e785da15d: string = 'مطابق سیاست معتبر نظرسنجی';
export const text_c01f847cfbc0: string = 'رأی ناشناسمطابق سیاست معتبر نظرسنجی';
export const text_316d005b2317: string = 'انتشار نظرسنجی';
export const text_660f852e7066: string = 'رأی من';
export const text_e72d0db41e0a: string = 'یک گزینه انتخاب کنید.';
export const text_5bfcfd224149: string =
  'رأی و تغییر آن مطابق وضعیت باز یا بسته نظرسنجی انجام می‌شود.';
export const text_324e5c116efe: string = 'ثبت رأی';
export const text_4de31dfb6d5b: string = 'نتیجه نظرسنجی';
export const text_368bb1462dfb: string = '۱۲ رأی ثبت‌شده';
export const text_19bdeb61a168: string = '۸ رأی';
export const text_3ba35d36badc: string = '۴ رأی';
export const text_08d7ea82c252: string = 'در نظرسنجی ناشناس، نام رأی‌دهندگان نمایش داده نمی‌شود.';
export const text_a0f4d9e95d74: string = 'پرسش کوتاه';
export const text_c93186d915bf: string = 'کدام روش حل درست است؟';
export const text_390071a9faa4: string = 'تجزیه عبارت / حذف جمله ثابت';
export const text_93f6793ebc54: string = 'گزینه صحیح';
export const text_6847342c368e: string = 'تجزیه عبارت';
export const text_1447306218f2: string = 'حاصل‌ضرب دو عبارت صفر است.';
export const text_31b0bd6d6a9d: string = 'انتشار پرسش کوتاه';
export const text_8335fef03024: string = 'پاسخ پرسش کوتاه';
export const text_0672269c1775: string = 'پرسش کوتاه گفتگو';
export const text_85a3ce58a0bd: string = 'تجزیه عبارتگزینه اول';
export const text_11eeb6e2db77: string = 'حذف جمله ثابتگزینه دوم';
export const text_1915499d8c9a: string = 'حذف جمله ثابت';
export const text_980424214ff4: string =
  'این قابلیت، آزمون رسمی آموزشی و پاسخ‌برگ نمره‌دار کلاس نیست.';
export const text_179a20563e97: string = 'ثبت پاسخ';
export const text_e14c65b7b907: string = 'بستن نظرسنجی؟';
export const text_2c0aeb5b3d40: string =
  'رأی تازه پذیرفته نمی‌شود. نتیجه مجاز نظرسنجی در گفتگو باقی می‌ماند.';
export const text_fd3a6a7ed246: string = 'بستن نظرسنجی';
export const text_0c6ab8cf0d86: string = 'چک‌لیست تازه';
export const text_15a735a70074: string = 'آماده‌سازی جلسه';
export const text_518e1ac0d6eb: string = 'مورد ۱';
export const text_22352e37bcf1: string = 'خواندن جزوه فصل دوم';
export const text_80f5a77f8570: string = 'مورد ۲';
export const text_8373447db9cd: string = 'فرستادن پرسش‌ها';
export const text_af3f4ab77f2e: string = 'حالت';
export const text_2dfa4839d235: string = 'مشارکتی';
export const text_606c16472490: string = 'انتشار چک‌لیست';
export const text_f2b9cd1b1169: string = 'چک‌لیست مشارکتی';
export const text_1b00e915b0c2: string = 'مرور مثال‌ها';
export const text_54d21254bcfa: string =
  'تغییر یک مورد با نسخه تعریف و نسخه وضعیت معتبر ثبت می‌شود.';
export const text_9a3a113dc8ff: string = 'ثبت وضعیت مورد';
export const text_972eb2701cda: string = 'ویرایش چک‌لیست';
export const text_7c5fd385772e: string = 'آماده‌سازی جلسه بعد';
export const text_7f0364dca9dc: string = 'مورد تازه';
export const text_05167bfec701: string = 'آماده‌کردن مثال شخصی';
export const text_00ec704a940f: string =
  'تغییر تعریف فهرست از تیک‌زدن یک مورد جداست؛ تعارض، وضعیت دیگران را بازنویسی نمی‌کند.';
export const text_3ee0bcbbe619: string = 'ذخیره تعریف';
export const text_63dbab43f8f7: string = 'زمان‌بندی پیام';
export const text_e1a573976aed: string = 'یادآوری جلسه فردا ساعت ۱۶';
export const text_8630f4c56e60: string = '۲۰ آبان، ۱۰:۰۰';
export const text_a4cef48f2df3: string = 'منطقه زمانی نمایش';
export const text_07ee3b07646c: string = 'ثبت زمان‌بندی';
export const text_83ccabbf26bd: string = 'پیام‌های زمان‌بندی';
export const text_e3d5bfa63b1d: string = 'یادآوری جلسه فردا۲۰ آبان، ۱۰:۰۰در صف';
export const text_2bbc2780f41c: string = 'یادآوری جلسه فردا';
export const text_1ebfb10a5f69: string = 'در صف';
export const text_3919e5e8b8a9: string = 'جزوه هفته بعد۲۱ آبان، ۸:۰۰در صف';
export const text_d751a22168b5: string = 'جزوه هفته بعد';
export const text_3a227fc663a7: string = '۲۱ آبان، ۸:۰۰';
export const text_2637675e9b26: string =
  'تغییر مجوز فرستنده پیش از ارسال باید از سیاست سرویس پیروی کند.';
export const text_40bccf8e592d: string = 'لغو ارسال زمان‌بندی؟';
export const text_8d0ff5394e0c: string =
  'این پیام از صف ارسال آینده خارج می‌شود؛ پیام منتشرشده قبلی حذف نمی‌شود.';
export const text_9ed293b5612c: string = 'لغو ارسال آینده';
export const text_6a89a41c7746: string = 'فضای مجاز شما';
export const text_a9c0df56b2d7: string = 'اطلاعات و اعضادسترسی مطابق نقش فعلی';
export const text_1893c8771b6d: string = 'اطلاعات و اعضا';
export const text_f1b039b494a9: string = 'دسترسی مطابق نقش فعلی';
export const text_a26276624e61: string = 'تنظیمات و فعالیت‌هاابزارهای مجاز همین زمینه';
export const text_524f1122a033: string = 'تنظیمات و فعالیت‌ها';
export const text_812edff08794: string = 'ابزارهای مجاز همین زمینه';
export const text_d5febebb80f4: string = 'سنجاق در صندوق من';
export const text_eb919ebf6c9f: string = 'علامت خوانده‌نشده';
export const text_73cc143ecaee: string = 'بایگانی برای من';
export const text_8035854c62cb: string = 'تنظیم اعلان';
export const text_e9c9019a0692: string = 'پاک‌کردن تاریخچه من؟';
export const text_5c6ca901e01d: string =
  'دامنه و اثر پاک‌کردن باید از قرارداد و پاسخ سرویس روشن باشد. این عمل با حذف پیام برای همه فرق دارد.';
export const text_491f2911c228: string = 'دامنه عمل را بازبینی کردم.';
export const text_d7cc082c7b35: string = 'پاک‌کردن تاریخچه';
export const text_469babda4f45: string = 'ترک این گروه؟';
export const text_459a605a5cc5: string =
  'دسترسی شما به گروه پایان می‌یابد. اگر گروه به کلاس وابسته است، مسیر پایان عضویت همان کلاس نمایش داده می‌شود.';
export const text_76bbf82d0e16: string = 'بی‌صداکردن گفتگو';
export const text_004fe71a8b80: string = 'تنظیمات این گفتگو';
export const text_2820ed7c02e5: string = 'طبق ترجیح شخصی و مجوز دستگاه';
export const text_b12f692f2dca: string = 'اعلان گفتگوطبق ترجیح شخصی و مجوز دستگاه';
export const text_ca726180dda9: string = 'لغو بی‌صداییبازگشت به تنظیم مجاز حساب';
export const text_5cf06680b120: string = 'لغو بی‌صدایی';
export const text_e1eb984b0bbc: string = 'بازگشت به تنظیم مجاز حساب';
export const text_cf495d1a7460: string = 'افراد مسدودشدهحریم ارتباط شخصی';
export const text_ee6ba6a335d8: string = 'افراد مسدودشده';
export const text_c09cb9c2ae09: string = 'حریم ارتباط شخصی';
export const text_d20edb305db5: string = 'تنظیم دستگاه، ترجیح حساب و mute گفتگو سه لایه جدا هستند.';
export const text_73de8583b05e: string = 'تا زمان مشخصزمان پایان از انتخاب معتبر';
export const text_823faf65d1c6: string = 'تا زمان مشخص';
export const text_9c6ca683af4a: string = 'زمان پایان از انتخاب معتبر';
export const text_349759649f51: string = 'بی‌صدا تا تغییر بعدیمطابق پشتیبانی قرارداد';
export const text_930c98aafb21: string = 'بی‌صدا تا تغییر بعدی';
export const text_2044d3e6ebd6: string = 'مطابق پشتیبانی قرارداد';
export const text_d4c00ce5e9f0: string = 'پایان انتخاب‌شده';
export const text_08b6152d98cf: string = 'فردا، ۸:۰۰';
export const text_08e4c93d1a73: string = 'بی‌صداکردن، عضویت را پایان نمی‌دهد.';
export const text_fb1c0f1d82dc: string = 'ثبت بی‌صدایی';
export const text_779d57732d58: string = 'پیام مستقیممخاطبین';
export const text_189aca12b39a: string = 'پیام مستقیم';
export const text_695a65ff982f: string = 'دعوت به گروهمخاطبین';
export const text_258216a9233d: string = 'نمایش شمارههیچ‌کس';
export const text_ee60166ab4a2: string = 'نمایش شماره';
export const text_a05c7b0bec88: string = 'یافتن با شمارهمخاطبین';
export const text_ba93d28ca2a6: string = 'یافتن با شماره';
export const text_87809362fe82: string = 'ذخیره حریم ارتباط';
export const text_4bdc64ecdb3a: string = 'گزارش این پیام';
export const text_f5f2ce6e4c85: string = 'محتوای نامرتبط یا آسیب‌زا';
export const text_068ffee408c7: string = 'این پیام نیاز به بررسی دارد.';
export const text_d7d62ef27bd0: string =
  'فقط اطلاعات لازم برای بررسی گزارش ارسال شود؛ نتیجه قابل پیگیری است.';
export const text_4e1560b8b0dc: string = 'ارسال گزارش';
export const text_209c03e8277c: string = 'پیگیری گزارش';
export const text_fb05915bb063: string = 'گزارش دریافت شد';
export const text_0a301c64acfa: string = 'گزارش ۰۱۲۴';
export const text_432e7fee583f: string = 'همین پیام';
export const text_3f51be44d894: string = 'ارسال گزارش به معنی اثبات تخلف یا اقدام قطعی نیست.';
export const text_7aa6d49c1efd: string = 'مسدودکردن مریم؟';
export const text_093c53c309a5: string =
  'ارتباط شخصی طبق سیاست مسدودی محدود می‌شود. اثر گفتگوهای مشترک باید با قرارداد و مجوز همان فضا هماهنگ باشد.';
export const text_f60e0f56d98e: string = 'گزارش‌های گروه';
export const text_7fdaf7681f27: string = 'پیام گزارش‌شدهگزارش ۰۱۲۴ · امروزباز';
export const text_913ee735a029: string = 'پیام گزارش‌شده';
export const text_3dd5eb84d061: string = 'گزارش ۰۱۲۴ · امروز';
export const text_a7997169c20e: string = 'پیوست گزارش‌شدهگزارش ۰۱۲۳ · دیروزدر بررسی';
export const text_fc3e7621306d: string = 'پیوست گزارش‌شده';
export const text_5483f0cc52c1: string = 'گزارش ۰۱۲۳ · دیروز';
export const text_e8b597077684: string = 'بررسی گزارش';
export const text_082029a6c802: string = 'بخش مجاز شواهد';
export const text_7ca1ffcd9392: string = 'فقط داده لازم برای رسیدگی';
export const text_b2a537edbf5b: string = 'یادداشت تصمیم';
export const text_f128160e8634: string = 'پیام با قواعد گروه بررسی شد.';
export const text_bcb1789a821f: string = 'بازبینی تصمیم';
export const text_70fcc45d7d03: string = 'پایان بررسی گزارش';
export const text_9a4d1a95cdbc: string = 'رسیدگی شدنتیجه مطابق اختیار گروه';
export const text_1d948fbacd80: string = 'رسیدگی شد';
export const text_46856d38843d: string = 'نتیجه مطابق اختیار گروه';
export const text_819f1f8296d1: string = 'رد گزارشدلیل قابل پیگیری ثبت می‌شود';
export const text_525d78b32fef: string = 'رد گزارش';
export const text_a7d066c1395a: string = 'دلیل قابل پیگیری ثبت می‌شود';
export const text_a3f27232694d: string = 'دلیل تصمیم';
export const text_56d7e98920c7: string = 'شواهد بررسی شد.';
export const text_4ca1b3403f27: string = 'ثبت تصمیم';
export const text_19a350af2326: string = 'پیام در انتظار';
export const text_6fb2bc6c4769: string = 'اتصال قطع است؛ پیام هنوز تحویل سرور نشده.';
export const text_94bb49f2871d: string = 'وضعیت پیام';
export const text_0b26659166cf: string = 'منتظر ارسال';
export const text_d1a864bcdde6: string = 'روی دستگاه حفظ شده';
export const text_071695f5b7fb: string = 'تلاش دوباره همان پیام';
export const text_2218e0e4973f: string = 'ارسال انجام نشد';
export const text_dab5a5324b5a: string = 'پیام ارسال نشد. متن و پیوست شما حفظ شده‌اند.';
export const text_d76cd1068bcc: string = 'ویرایش متن';
export const text_d831eb608329: string = 'تلاش دوباره همان شناسه پیام را ادامه می‌دهد.';
export const text_1f83f6a5d77a: string = 'گفتگو به‌روز شد';
export const text_c2e114c17705: string =
  'پیام‌های تازه و وضعیت تحویل از تغییرات معتبر بازیابی شدند.';
export const text_fe8d1c52269e: string = 'تحویل، خوانده‌شدن و ذخیره محلی، وضعیت‌های متفاوت‌اند.';
export const text_14337c36090d: string = 'هنوز پیامی نیست';
export const text_7015535fee30: string = 'گفتگو را آغاز کنید';
export const text_a0c493ca4754: string = 'با یک پیام کوتاه شروع کنید.';
export const text_948aa6c95e2c: string = 'نوشتن اولین پیام';
export const text_7a8473dd00d8: string = 'کانال فقط خواندنی';
export const text_97bab31f5f1e: string = 'خواندن مطالب مجاز کانال';
export const text_6bcbe9dee869: string = 'برنامه هفته.pdfاطلاعیه منتشرشده';
export const text_2efd3078409d: string = 'برنامه هفته.pdf';
export const text_0b6fb68f12ef: string = 'اطلاعیه منتشرشده';
export const text_27ce9d2b18a5: string = 'انتشار در این کانال فقط برای مدیران مجاز است.';
export const text_43c70925ecda: string = 'دسترسی تغییر کرد';
export const text_3056c3d9afd8: string = 'این گفتگو باز نمی‌شود';
export const text_eb20e9769b65: string = 'وضعیت عضویت و مجوز شما تغییر کرده است.';
export const text_f90fa76e7c85: string = 'نمای قدیمی، مجوز دریافت پیام یا فایل تازه ایجاد نمی‌کند.';
export const text_23c225ece11b: string = 'بازگشت به پیام‌ها';
export const text_e965afdfff3f: string = 'درخواست‌دهنده · حساب عادی';
export const text_923e43b18484: string = 'کارگاه داستان‌نویسیارسال ۱۴ آبان · درخواست ۰۲۴۸در بررسی';
export const text_e86176be18b5: string = 'ارسال ۱۴ آبان · درخواست ۰۲۴۸';
export const text_99083b7670e5: string = 'باشگاه کتاباصلاح هدف کلاس لازم استنیاز به اصلاح';
export const text_d418f8858834: string = 'باشگاه کتاب';
export const text_63fe54a72e74: string = 'اصلاح هدف کلاس لازم است';
export const text_dd03e133c38b: string = 'تمرین عکاسیذخیره روی حسابپیش‌نویس';
export const text_d2a1327c19fe: string = 'ذخیره روی حساب';
export const text_7dbd72a5142c: string = 'جزئیات درخواست';
export const text_2374a846d236: string = 'درخواست ۰۲۴۸';
export const text_e8f4ee0fb3d9: string = 'تاریخچه درخواستارسال، بررسی و تصمیم';
export const text_acb79e794044: string = 'تاریخچه درخواست';
export const text_da515655918b: string = 'ارسال، بررسی و تصمیم';
export const text_9634c7e15ee3: string = 'ارسال درخواست، کلاس فعال و دسترسی گفتگو ایجاد نمی‌کند.';
export const text_655fb661b409: string =
  'درخواست طبق وضعیت مجاز لغو می‌شود. نسخه‌ای از سابقه قابل پیگیری می‌ماند.';
export const text_df20c0f2b4b4: string = 'مشخصات کلاس';
export const text_00003857b952: string = 'تا ۲۰۰ نویسه پس از حذف فاصله ابتدا و انتها.';
export const text_3ee832f136ba: string = 'هدف کلاس';
export const text_e1281e6592c4: string = 'تمرین روایت، خواندن متن و دریافت بازخورد';
export const text_c02ede0e54a3: string = 'تا ۲۰۰۰ نویسه.';
export const text_5980448fa47d: string = 'ادامه توضیحات';
export const text_a170e7b5fbaa: string = 'توضیحات درخواست';
export const text_0b216836ab53: string =
  'اطلاعات خارج از فیلدهای قرارداد در درخواست ثبت‌نشده فرض نمی‌شوند.';
export const text_7441c9d51a89: string =
  'جلسه‌های گفتگو و تمرین نوشتن برای علاقه‌مندان داستان کوتاه.';
export const text_9f49b9d2c336: string = 'تا ۴۰۰۰ نویسه.';
export const text_0613435112ad: string =
  'زمینه کلاس مستقل است؛ ساخت آن، آموزشگاه یا نقش سراسری دانش‌آموز ایجاد نمی‌کند.';
export const text_f2fbf05ef067: string = 'ادامه مدیریت';
export const text_3a10747688f0: string = 'خطای اطلاعات درخواست';
export const text_0b7ccdc9a873: string = 'عنوان نمی‌تواند فقط فاصله باشد.';
export const text_757eb81e929f: string = 'ظرفیت پیشنهادی باید حداقل یک نفر باشد.';
export const text_bc6537adc608: string = 'متن هدف و توضیحات هنگام اصلاح خطا حفظ می‌شوند.';
export const text_036ba6a64063: string = 'بازگشت به اصلاح';
export const text_ed3d2d184893: string = 'مدیریت پیشنهادی';
export const text_5f25304be562: string = 'درخواست‌دهنده و مدیر پیش‌فرض';
export const text_e52ecb6b6d36: string = 'خودم مدیر باشمپیشنهاد پیش‌فرض';
export const text_201fad6bf494: string = 'خودم مدیر باشم';
export const text_6dbb2e33f78e: string = 'پیشنهاد پیش‌فرض';
export const text_5f992cf8df61: string = 'حساب دیگری پیشنهاد می‌کنمانتخاب از حساب‌های مجاز';
export const text_0eb148568d25: string = 'حساب دیگری پیشنهاد می‌کنم';
export const text_ea7618bb4421: string = 'انتخاب از حساب‌های مجاز';
export const text_53a57eef4527: string = 'تعیین مدیر نهایی با مالک یا ادمین پلتفرم است.';
export const text_10ba534092a6: string = 'ادامه انتخاب مدرس';
export const text_528d6d3ea060: string = 'پیشنهاد مدیر دیگر';
export const text_9b365ed19510: string = 'شناسه یا نام حساب مجاز';
export const text_fef09553e5cc: string = 'مریم رضاییحساب انتخاب‌شده';
export const text_f126299a972c: string = 'امیر نادریحساب قابل انتخاب';
export const text_59feaa91fe67: string = 'حساب قابل انتخاب';
export const text_cdfb6e6276a7: string = 'پیشنهاد، اختیار مدیریت را پیش از تأیید ایجاد نمی‌کند.';
export const text_ead56fe52eb1: string = 'انتخاب مدیر پیشنهادی';
export const text_1493b64faa29: string = 'فعلاً بدون مدرستشکیل هسته کلاس مجاز است';
export const text_3e886c8b4b90: string = 'تشکیل هسته کلاس مجاز است';
export const text_4d4a170b15de: string = 'پیشنهاد مدرسانتخاب حساب مجاز';
export const text_ce83e038131a: string = 'پیشنهاد مدرس';
export const text_9ae50a44b79a: string = 'انتخاب حساب مجاز';
export const text_f8fdb73f05bd: string =
  'مدرس اختیاری است. اختیار آموزشی بعداً برای عضویت همان کلاس تنظیم می‌شود.';
export const text_f1593b8906d3: string = 'تمرین و بازخورد داستان کوتاه';
export const text_0c8b9217823e: string = 'بدون مدرس';
export const text_1df967b11888: string = 'اطلاعات را بررسی کردم.';
export const text_549bea2155fe: string = 'ارسال با نسخه معتبر همین پیش‌نویس انجام می‌شود.';
export const text_8d5f12c3d185: string = 'اصلاح لازم است';
export const text_af1e69ff0fc6: string = 'هدف و مخاطب کلاس را روشن‌تر توضیح دهید.';
export const text_5131ddf3692c: string = 'هدف اصلاح‌شده';
export const text_79b23e252cb2: string = 'تمرین داستان برای علاقه‌مندان سطح مقدماتی';
export const text_2fff26358ba2: string =
  'پیام ناظر قابل نمایش از یادداشت داخلی جداست؛ همان درخواست ادامه می‌یابد.';
export const text_a27bbbac6743: string = 'ذخیره اصلاح';
export const text_e23efc671908: string = 'رسید ارسال مجدد';
export const text_46f111cb601f: string = 'درخواست دوباره ارسال شد';
export const text_7168eaea0a05: string = 'شماره';
export const text_20f43b461266: string = '۰۲۴۸';
export const text_1104f0690644: string = '۱۴ آبان، ۱۱:۴۰';
export const text_163e7a4425d5: string = 'دیدن تاریخچهاصلاح و ارسال همین درخواست';
export const text_c704fd9e50d8: string = 'دیدن تاریخچه';
export const text_d8a897dd578a: string = 'اصلاح و ارسال همین درخواست';
export const text_a8c665131fbf: string = 'مالک یا ادمین ماکان';
export const text_a358eba92bd5: string = 'کارگاه داستان‌نویسیسارا احمدی · حساب عادیتازه';
export const text_d98e40ac05a8: string = 'سارا احمدی · حساب عادی';
export const text_86f0819b7d64: string = 'تمرین ریاضیامیر نادری · حساب دانش‌آموزدر بررسی';
export const text_f7c53810fdf2: string = 'تمرین ریاضی';
export const text_ee623181a983: string = 'امیر نادری · حساب دانش‌آموز';
export const text_2b91a7204b14: string = 'درخواست‌دهنده: سارا احمدی';
export const text_d4c3cedbec89: string = 'خود درخواست‌دهنده';
export const text_d5b2fad84cfb: string = 'اختیاری؛ خالی';
export const text_04f24e5cade5: string = 'هدف و شرح کاملاطلاعات ارسال‌شده';
export const text_d61332050a29: string = 'هدف و شرح کامل';
export const text_f62c65a72301: string = 'اطلاعات ارسال‌شده';
export const text_8618c787e577: string = 'تاریخچه بررسینسخه‌ها و تصمیم‌ها';
export const text_e37f81021d2b: string = 'تاریخچه بررسی';
export const text_3c65383bf381: string = 'نسخه‌ها و تصمیم‌ها';
export const text_10cffbd1f7c0: string = 'انتخاب نتیجه بررسی';
export const text_9ec0286eb912: string = 'نتیجه بررسی';
export const text_5a64e50958df: string = 'نیاز به اصلاحبازگشت به همان درخواست';
export const text_84c5be2e4af1: string = 'بازگشت به همان درخواست';
export const text_f26d2392cbab: string = 'رد درخواستپایان با دلیل قابل نمایش';
export const text_434c12a0b80e: string = 'پایان با دلیل قابل نمایش';
export const text_a57e378fde4d: string = 'هدف و محدوده کلاس نیاز به توضیح بیشتر دارد.';
export const text_415e726f7b57: string = 'تأیید درخواست';
export const text_8f105081ab29: string = 'بازبینی نهایی قبل از تأیید';
export const text_4f41d7af50d4: string = 'سارا احمدی · پیش‌فرض درخواست';
export const text_df3bd8d43fbc: string = 'هدف و ظرفیت بررسی و تأیید شد.';
export const text_d2750957f7c2: string = 'مدیر نهایی و اطلاعات را بازبینی کردم.';
export const text_21eb70c80474: string = 'تغییر مدیر نهایی';
export const text_fdbf3961e513: string = 'حساب مقصد مجاز';
export const text_894664667a45: string = 'مریم رضاییمدیر جایگزین پیشنهادی';
export const text_0b35a87b5256: string = 'مدیر جایگزین پیشنهادی';
export const text_8ea051b5864b: string = 'سارا احمدیدرخواست‌دهنده';
export const text_2b814667adf8: string = 'درخواست‌دهنده';
export const text_039252a92c0e: string =
  'درخواست‌دهنده پس از تعیین مدیر دیگر، خودکار عضو یا مدیر کلاس باقی نمی‌ماند.';
export const text_79ba4bcaedc3: string = 'تعیین مدیر نهایی';
export const text_d4af3f803d14: string = 'نتیجه بررسی ثبت شد';
export const text_30850622f8ee: string = 'در آماده‌سازی';
export const text_dd384d8d7b85: string = 'ورود به کلاس فقط با نقش و عضویت معتبر امکان‌پذیر است.';
export const text_e64c244c8742: string = 'مشاهده وضعیت درخواست';
export const text_b38f8da79f00: string = 'مدیر کلاس مستقل';
export const text_6ca8e08a0c26: string = 'همان کلاس تأییدشده';
export const text_d7aa7d101c3c: string = 'مدیر مسئولمسئولیت پذیرفته‌شدهآماده';
export const text_caaa17be2baa: string = 'مدیر مسئول';
export const text_e200cec7715f: string = 'مسئولیت پذیرفته‌شده';
export const text_09d8d23f9f09: string = 'گروه اختصاصیمتصل به همین کلاسآماده';
export const text_9b2cbc79721d: string = 'گروه اختصاصی';
export const text_2aa870e5e601: string = 'متصل به همین کلاس';
export const text_90a321551572: string = 'کانال اختصاصیآماده‌سازی ادامه داردمنتظر';
export const text_685c1972ad86: string = 'کانال اختصاصی';
export const text_9a31fb3c1eba: string = 'آماده‌سازی ادامه دارد';
export const text_4b646d91ac99: string =
  'تا تکمیل مشترک، فعالیت کلاس با وضعیت واقعی نمایش داده می‌شود.';
export const text_d0b028ad2e4c: string = 'فضا کامل نشد';
export const text_8bc474e05fdd: string =
  'کانال اختصاصی هنوز آماده نیست. کلاس و گروه قبلی حفظ شده‌اند.';
export const text_0ef23af7779e: string = 'آماده و متصل';
export const text_c917bb47eb22: string = 'نیاز به ادامه آماده‌سازی';
export const text_9f8bccb5866c: string = 'تلاش دوباره، کلاس یا فضای اضافه نمی‌سازد.';
export const text_b782b07a4517: string = 'ترمیم همین آماده‌سازی';
export const text_5a44d479b45a: string = 'گروه گفتگوگفتگوی متصل و مجازآماده';
export const text_b6480c8fed43: string = 'گفتگوی متصل و مجاز';
export const text_bcf11f11f2cd: string = 'کانال اطلاعیهکانال متصل و مجازآماده';
export const text_734901e78310: string = 'کانال متصل و مجاز';
export const text_bcd253d46f7f: string = 'دسترسی هر دو فضا از عضویت و نقش همان کلاس پیروی می‌کند.';
export const text_d5d059479f61: string = 'عنوان ثبت‌شده';
export const text_429ad98bf3c7: string = 'پذیرش درخواست پیوستن';
export const text_dd5c8ef7bfd5: string = 'افراد می‌توانند درخواست بدهند';
export const text_851d698dc64d: string = 'پذیرش درخواست پیوستنافراد می‌توانند درخواست بدهند';
export const text_0dbd46c32aaa: string = 'بازبینی ظرفیت و روش پذیرش';
export const text_f8827e708e97: string = 'کاهش ظرفیت';
export const text_3a7f9c6e2a6b: string = '۱۲ نفر';
export const text_3a505b240a64: string = '۱۰ نفر';
export const text_02040915a53f: string = 'ظرفیت تازه نباید با شرایط معتبر عضویت ناسازگار باشد.';
export const text_72716f2c86dc: string = 'هیچ عضوی برای جاگرفتن در ظرفیت تازه خودکار حذف نشود.';
export const text_7f8e8486365f: string = 'بازگشت به تنظیمات';
export const text_bb3832f440aa: string = 'بستن درخواست پیوستن';
export const text_d745e06353ca: string =
  'درخواست تازه طبق سیاست کلاس پذیرفته نمی‌شود. عضویت‌های فعال تغییر نمی‌کنند.';
export const text_84e61592e96a: string = 'حساب عادی · قابل دعوت در کلاس';
export const text_dc82fa1a893a: string =
  'عضو آموزشی بودن در این کلاس، نقش سراسری دانش‌آموز ایجاد نمی‌کند.';
export const text_3d877b7950e4: string = 'کارگاه داستان‌نویسیدعوت سارا احمدیمنتظر';
export const text_7200e6a097ae: string = 'تمرین ریاضیدعوت مریم رضاییمنتظر';
export const text_4cf6f4676ec4: string = 'پیش از پذیرش، پیام‌ها و فایل‌های خصوصی باز نمی‌شوند.';
export const text_54fb3c2261bd: string = 'پذیرش دعوت کلاس';
export const text_cc41240ff2b2: string = 'کلاس مستقل · مدیر سارا احمدی';
export const text_ca2f576b7f26: string = 'وضعیت مدرس';
export const text_d5b1ced80279: string = 'اطلاعات و قواعد قابل نمایش را خواندم.';
export const text_55d40bc6e888: string = 'پذیرش عضویت';
export const text_0b39d77e3c01: string = 'نپذیرفتن دعوت';
export const text_4b7ed94408dc: string = 'دعوت کلاس';
export const text_d70a01107bac: string = 'منتظر پاسخ';
export const text_2c9bdef193c4: string =
  'دعوت این کلاس رد می‌شود. هیچ عضویت یا دسترسی خصوصی تازه‌ای ایجاد نمی‌شود.';
export const text_610ee03db103: string = 'دلیل اختیاری';
export const text_a189dc5f3610: string = 'در این زمان امکان شرکت ندارم.';
export const text_720e930ad674: string = 'لغو دعوت ارسال‌شده';
export const text_9601ddac69a8: string = 'دعوت ریحانه زمانی';
export const text_7cae4ebde9b2: string = 'دسترسی خصوصی';
export const text_7e7e4db41722: string = 'هنوز ایجاد نشده';
export const text_9fdb8873188b: string = 'دعوت نیاز به بازبینی دارد.';
export const text_69876c1a88d9: string = 'عضویت قبلاً ثبت شد';
export const text_dfaa14ed83a6: string = 'یک عضویت معتبر وجود دارد';
export const text_2b5375d69600: string = 'مسیر پذیرش';
export const text_5a22ffdaf4cd: string = 'طبق نتیجه سرویس';
export const text_2a42b991c883: string =
  'پذیرش دعوت و درخواست هم‌زمان، عضویت دوم یا شمارش ظرفیت دوباره نمی‌سازد.';
export const text_8518635b865a: string = 'دیدن عضویت';
export const text_fb46451beeb8: string = 'حساب فعال';
export const text_5e10503969a5: string = 'از مسیر مجاز دعوت یا پیوند کلاس';
export const text_1536a9de8b7a: string =
  'درخواست برای بررسی مدیر ارسال می‌شود؛ محتوای خصوصی تا پذیرش بسته است.';
export const text_1b38ceff288c: string = 'قواعد قابل نمایش کلاس را خواندم.';
export const text_9e71a19271f8: string = 'ثبت درخواست پیوستن';
export const text_f2a50821b2d2: string = 'رریحانه زمانیحساب عادی · امروزمنتظر';
export const text_f41ae3492a28: string = 'حساب عادی · امروز';
export const text_86491d525e4e: string = 'ععلی کریمیحساب دانش‌آموز · امروزمنتظر';
export const text_dcbc5c911fb2: string = 'حساب دانش‌آموز · امروز';
export const text_1d5f22b59dd6: string = 'تصمیم عضویت ریحانه';
export const text_7506ac68cf23: string = 'پذیرشبررسی ظرفیت و اعتبار در ثبت نهایی';
export const text_6183d60d902d: string = 'بررسی ظرفیت و اعتبار در ثبت نهایی';
export const text_d3345a2905b0: string = 'ردبا دلیل قابل پیگیری';
export const text_bf78d15387cb: string = 'با دلیل قابل پیگیری';
export const text_cc650cdb3c5e: string = 'با هدف و ظرفیت کلاس سازگار است.';
export const text_48d1e3a897bd: string = 'ثبت تصمیم عضویت';
export const text_528d712d8a98: string = 'سسارا احمدیمدیر مسئولمدیر';
export const text_dd80c5263394: string = 'ممریم رضاییمدرس اختیاری · اختیار مشخصمدرس';
export const text_a6b3618a51cf: string = 'مدرس اختیاری · اختیار مشخص';
export const text_dadd400220c6: string = 'رریحانه زمانیعضو آموزشی · حساب عادیفعال';
export const text_da527f4c83e9: string = 'عضو آموزشی · حساب عادی';
export const text_be0f92376fe2: string = 'نقش مریم در کلاس';
export const text_36b6f46d37c3: string = 'فعالیت آموزشی در همین کلاس';
export const text_40d22c0c9548: string = 'عضو آموزشیفعالیت آموزشی در همین کلاس';
export const text_8fe75925170c: string = 'نقش محلی کلاس';
export const text_11bec847fe9e: string = 'مدرسنقش محلی کلاس';
export const text_7762f170e425: string = 'فقط اگر واگذاری مجاز باشد';
export const text_24ca03f1d527: string = 'مدیریت اعضافقط اگر واگذاری مجاز باشد';
export const text_6d2d8775ae66: string = 'مسئولیت آموزش در کارگاه';
export const text_1296b4f5b795: string = 'ذخیره نقش محلی';
export const text_3e3b727703eb: string = 'پایان عضویت ریحانه؟';
export const text_d5bdeacf652b: string =
  'دسترسی تازه به کلاس، گروه، کانال و فایل مرتبط لغو می‌شود. پاسخ‌های پذیرفته‌شده و سابقه مجاز باقی می‌مانند.';
export const text_0a002be6bc80: string = 'اختیارهای آموزشی';
export const text_b4dccc3fedb4: string = 'سسارا احمدیمدیر · ساخت و ارزیابی مجاز';
export const text_b8912951ccd9: string = 'مدیر · ساخت و ارزیابی مجاز';
export const text_140734866acf: string = 'ممریم رضاییمدرس · ارزیابی مجاز';
export const text_abbc8603c927: string = 'مدرس · ارزیابی مجاز';
export const text_ccac4d54be2d: string = 'رریحانه زمانیعضو آموزشی · پاسخ‌دهی';
export const text_7c7b57ec0217: string = 'عضو آموزشی · پاسخ‌دهی';
export const text_2aedd61ba05d: string =
  'نام مدرس یا مدیر به‌تنهایی، تمام اختیارهای آموزشی را فرض نمی‌کند.';
export const text_3e596276bf87: string = 'اختیار آموزش مریم';
export const text_30642f52bcd1: string = 'ساخت و انتشار تکلیف';
export const text_606e1a7afc45: string = 'فقط در همین کلاس';
export const text_fde766bfcd04: string = 'ساخت و انتشار تکلیففقط در همین کلاس';
export const text_80e56c936439: string = 'طراحی و انتشار آزمون';
export const text_be4bb309f338: string = 'طراحی و انتشار آزمونفقط در همین کلاس';
export const text_396b7b36ec02: string = 'دسترسی به پاسخ مجاز اعضا';
export const text_8d67dd3be5e6: string = 'ارزیابی پاسخ‌هادسترسی به پاسخ مجاز اعضا';
export const text_7c7699224e2d: string = 'مسئولیت بازخورد تکلیف‌ها';
export const text_7cae9e1a7433: string = 'ثبت اختیار آموزشی';
export const text_9ac5ce0b32fb: string = 'لغو اختیار ارزیابی';
export const text_5daede1260b0: string =
  'دسترسی تازه به پاسخ و فایل خصوصی اعضا برای این اختیار بسته می‌شود. سوابق ثبت‌شده با نام ارزیاب حفظ می‌شوند.';
export const text_551b730923ef: string = 'پایان مسئولیت ارزیابی';
export const text_849154ec0861: string = 'ثبت لغو اختیار';
export const text_e610cf57c1da: string = 'انتقال مدیریت';
export const text_055dfe7fd45a: string = 'عضو یا حساب مقصد مجاز';
export const text_5028821c7f48: string = 'مدیر پیشنهادی تازه';
export const text_f168bf44f0a5: string = 'دلیل انتقال';
export const text_548ece8897e6: string = 'تغییر مسئولیت مدیریت کارگاه';
export const text_fc501c514f54: string = 'مدیر فعلی تا تعیین نتیجه معتبر مسئول باقی می‌ماند.';
export const text_5e778d38d265: string = 'پیشنهاد مدیریت';
export const text_77ce90d3cdb1: string = 'سارا احمدی مدیریت را پیشنهاد داده است.';
export const text_de829662ef14: string = 'مسئولیت';
export const text_3b64e1f06534: string = 'اعضا، تنظیمات و وضعیت کلاس';
export const text_76ca39c1b15f: string = 'فضاها';
export const text_a630b982bf48: string = 'گروه و کانال متصل';
export const text_dc532113a411: string = 'پذیرش مدیریت';
export const text_06f7157a934e: string = 'وضعیت انتقال';
export const text_bbebf6b6d009: string = 'مدیر مسئول فعلی';
export const text_3b945872ee63: string =
  'کلاس فعال بدون مدیر مسئول نمی‌ماند؛ انتقال با نتیجه معتبر نهایی می‌شود.';
export const text_490113b8d9dd: string = 'تطبیق فضاهای کلاس';
export const text_6145783d44d5: string = 'طرح ترمیم دریافت‌شده از سرویس';
export const text_712c2912b50f: string = 'همان شناسه موجود';
export const text_be76af07601f: string = 'تطبیق طبق طرح معتبر';
export const text_9ac81bec7eb0: string =
  'این ابزار عملیاتی فقط برای حساب دارای اختیار نمایش داده می‌شود.';
export const text_59f55a1b1a1a: string = 'بازبینی طرح ترمیم';
export const text_bfc0dae3e73b: string = 'اجرای طرح ترمیم';
export const text_e6e5feacdf26: string = 'اثرهای طرح و فضاهای هدف را قبل از ثبت بررسی کنید.';
export const text_fae7a329200c: string = 'هماهنگ‌سازی دسترسی‌ها پس از اصلاح وضعیت';
export const text_9f302d8f7300: string = 'همین طرح بازبینی‌شده را تأیید می‌کنم.';
export const text_5638acd13b40: string = 'اجرای همان طرح';
export const text_df687c000198: string = 'نتیجه تطبیق';
export const text_b30f487caf03: string = 'نتیجه عملیات دریافت شد';
export const text_d09bd0036b27: string = 'همان کلاس قبلی';
export const text_e9f54ac1b4d5: string = 'بدون ایجاد فضای اضافه';
export const text_fb7c0bd5bd51: string = 'رویداد قابل پیگیری';
export const text_a83f6dc03a09: string =
  'موفقیت فقط از نتیجه معتبر عملیات خوانده می‌شود؛ خطای جزئی قابل ادامه است.';
export const text_b168b0d00cfb: string = 'سابقه درخواست';
export const text_d886e8d7ad91: string = '۱۴ آبان، ۱۰:۲۰ارسال درخواست · نسخه ۱';
export const text_7e747b80647e: string = 'ارسال درخواست · نسخه ۱';
export const text_9c6c53931b7d: string = '۱۴ آبان، ۱۱:۰۰نیاز به اصلاح · پیام قابل نمایش';
export const text_cb5b1a704f6d: string = '۱۴ آبان، ۱۱:۰۰';
export const text_05f205338163: string = 'نیاز به اصلاح · پیام قابل نمایش';
export const text_cfb58f40b98e: string = '۱۴ آبان، ۱۱:۴۰ارسال مجدد · نسخه ۳';
export const text_cd3261a6586d: string = 'ارسال مجدد · نسخه ۳';
export const text_475d7b6d217f: string = 'سابقه کلاس';
export const text_805fc6ac77b9: string = 'افزودن عضوریحانه زمانی · پذیرش معتبر';
export const text_3ef1e40f8580: string = 'ریحانه زمانی · پذیرش معتبر';
export const text_eeba6b4eb69d: string = 'تغییر اختیارمریم رضایی · ارزیابی';
export const text_9c547ab6b1c3: string = 'تغییر اختیار';
export const text_2a282f7714c2: string = 'مریم رضایی · ارزیابی';
export const text_188df5430ce0: string = 'تنظیم ظرفیتاز ۲۰ به ۲۴ · دلیل ثبت‌شده';
export const text_a5f42ccd6b63: string = 'تنظیم ظرفیت';
export const text_f5f890328b99: string = 'از ۲۰ به ۲۴ · دلیل ثبت‌شده';
export const text_4cab32c0ee79: string = 'جزئیات رویداد';
export const text_f0d323c43b80: string = 'عمل';
export const text_c2a2f1f6fd07: string = 'تغییر اختیار آموزشی';
export const text_4e9da62eeb07: string = 'انجام‌دهنده';
export const text_d299ba9023c5: string = 'عضو هدف';
export const text_6a151dd1b6f7: string =
  'دلیل قابل نمایش از داده خصوصی یا یادداشت داخلی جداست. سابقه، مجوز دیدن داده خارج از نقش ایجاد نمی‌کند.';
export const text_eaa82954be3c: string = 'تعلیق فعالیت کلاس';
export const text_2f0610143537: string = 'بازبینی فعال‌سازی';
export const text_544b870051b4: string = 'معتبر';
export const text_ccf2910a8d06: string = 'شرایط فعال‌سازی را بازبینی کردم.';
export const text_c39202c3a15a: string = 'دسترسی‌های مؤثر پس از نتیجه معتبر دوباره خوانده می‌شوند.';
export const text_a5034e2e8923: string =
  'اثر توقف بر پذیرش عضو، نوشتن پیام و فعالیت آموزشی پیش از ثبت روشن می‌شود.';
export const text_060aa3773506: string = 'توقف موقت کارگاه';
export const text_6915d1f8252d: string = 'تعلیق کلاس';
export const text_96e24ee0df87: string = 'فعال‌کردن کلاس';
export const text_203a6fadfb18: string = 'بایگانی کلاس؟';
export const text_a53935af927d: string =
  'پذیرش و نوشتن تازه طبق سیاست بایگانی متوقف می‌شوند؛ سوابق مجاز حفظ می‌شوند و دسترسی عضو حذف‌شده برنمی‌گردد.';
export const text_1eedcf3c4031: string = 'دلیل بایگانی';
export const text_8ab74db5197b: string = 'کارهای آموزشی من';
export const text_acd394d4d351: string =
  'روایت یک اتفاق کوچکتا ۲۰ آبان · پاسخ هنوز تحویل نشدهباقی مانده';
export const text_42d8f67af0dc: string = 'تا ۲۰ آبان · پاسخ هنوز تحویل نشده';
export const text_ac040831a06c: string = 'مرور زاویه دیدآزمون منتشرشده در کلاسقابل شروع';
export const text_9770eedaa1ee: string = 'آزمون منتشرشده در کلاس';
export const text_287b8eba880b: string =
  'حساب عادی شما با عضویت محلی معتبر به همین فعالیت‌ها دسترسی دارد.';
export const text_a130b079d6e6: string = 'مدیر با اختیار آموزشی صریح';
export const text_e435db311e89: string = 'تکلیف تازهساخت در زمینه همین کلاس مستقل';
export const text_cf2d3cf01768: string = 'ساخت در زمینه همین کلاس مستقل';
export const text_e29e6ddab92b: string = 'آزمون تازهنسخه، سؤال و قواعد';
export const text_52359d0b7fca: string = 'نسخه، سؤال و قواعد';
export const text_92ae77e9b5b6: string = 'پاسخ‌های منتظرفقط برای ارزیاب مجاز';
export const text_5cbf319483a7: string = 'پاسخ‌های منتظر';
export const text_87373d2a75bd: string = 'فقط برای ارزیاب مجاز';
export const text_2f5bdc6c540e: string = 'ابزار مدرس';
export const text_8d599ccc64c9: string = 'مدرس مجاز همین کلاس';
export const text_549276b47d09: string = 'اختیار ارزیابی همین کلاس';
export const text_0650ff9e7b90: string = 'صف پاسخ‌های تکلیفپاسخ‌های مجاز اعضا';
export const text_d7609cb1c745: string = 'صف پاسخ‌های تکلیف';
export const text_34f7ce1226e9: string = 'پاسخ‌های مجاز اعضا';
export const text_b46b21101f95: string = 'تصحیح آزمونفقط تلاش‌های مجاز';
export const text_cf7f5e78d320: string = 'فقط تلاش‌های مجاز';
export const text_c8b8a529a7ce: string = 'ساخت یا انتشار بدون اختیار مربوط نمایش داده نمی‌شود.';
export const text_7a32a8ab8d1c: string = 'صورت تکلیف کلاس';
export const text_d3cfad23f75c: string = 'یک اتفاق روزمره را از نگاه شخص دیگری روایت کنید.';
export const text_5c1c6cfb4ba6: string = 'نمره و تلاش';
export const text_e27368f50411: string = '۲۰ نمره · ۲ تلاش';
export const text_78d3d8d4940d: string = 'ادامه قواعد و انتشار';
export const text_4fd5bdd29db7: string = 'صدای چرخ چمدان در کوچه می‌پیچید…';
export const text_0518cad637ef: string = 'روایت من.pdfفایل آماده · پیوست مجاز';
export const text_b1da09c3ed6c: string = 'روایت من.pdf';
export const text_f103e45a1726: string = 'فایل آماده · پیوست مجاز';
export const text_58ad28b65400: string = 'متن و فایل را بازبینی کردم.';
export const text_9e049d936af1: string = 'تحویل از همان مسیر تلاش معتبر، با رسید انجام می‌شود.';
export const text_8df981ffd244: string = 'روایت ریحانه.pdfفقط ارزیاب مجاز همین کلاس';
export const text_dd69b9076375: string = 'روایت ریحانه.pdf';
export const text_280e547d0518: string = 'فقط ارزیاب مجاز همین کلاس';
export const text_3a411e1ac710: string = 'جزئیات خوب است؛ پایان را روشن‌تر کنید.';
export const text_3f4fac4c0495: string = 'معادله زیر را حل و روش خود را توضیح دهید.';
export const text_29285b9f8621: string = 'دو عدد با حاصل‌ضرب ۶ و مجموع ۵ می‌یابیم…';
export const text_3c28d3a0c1de: string = 'پاسخ تکمیلی.pdfپیوست آماده طبق سیاست پرسش';
export const text_7820d0cf0c33: string = 'پاسخ تکمیلی.pdf';
export const text_39a6d1095d93: string = 'پیوست آماده طبق سیاست پرسش';
export const text_84bfe5d3853a: string =
  'ذخیره پاسخ و فایل باید با مجوز نوشتن همان تلاش معتبر باشد.';
export const text_f7594544a840: string = 'ذخیره و سؤال بعدی';
export const text_9816d8db3343: string = 'رسید آزمون مستقل';
export const text_0eed678e5773: string = 'پاسخ معتبر';
export const text_89349765e656: string = 'نتیجه من';
export const text_b921b161a7a3: string = 'نتیجه منتشرشده · نسخه ۱';
export const text_9baceaebc48e: string =
  'تشخیص راوی خوب است؛ در پاسخ تشریحی، مثال را روشن‌تر توضیح دهید.';
export const text_41f9a46a075c: string = 'محدوده نمایش';
export const text_7a96376b11b4: string = 'فقط نتیجه خودم';
export const text_b7c2642cbe85: string = 'رسید و سابقهنسخه‌های مجاز همین نتیجه';
export const text_a9fadd739795: string = 'رسید و سابقه';
export const text_cfcae6e627c2: string = 'نسخه‌های مجاز همین نتیجه';
export const text_296f4043c3ce: string = 'ورود با شماره';
export const text_c410c5d40abf: string = 'پیش از ورود';
export const text_58afd8c62193: string = 'حساب شما می‌تواند چند زمینه مجاز داشته باشد.';
export const text_7686c747724f: string = '۰۹۱۲۱۲';
export const text_c9051395d43b: string = 'شماره همراه کامل وارد نشده است.';
export const text_8aef3bf8185a: string = 'ورودی فارسی و لاتین به قالب معتبر تبدیل می‌شود.';
export const text_1a88f55dac92: string = 'کد تأیید';
export const text_80c7189e83be: string = '۱۲۳۴۵';
export const text_c6be7bfa618e: string = 'کد واردشده معتبر نیست یا زمان آن پایان یافته است.';
export const text_b73d6755abf6: string = 'ارسال دوباره پس از زمان مجاز همین درخواست در دسترس است.';
export const text_1851e216e397: string = 'محدودیت ارسال کد';
export const text_d4dd69dc5229: string = 'تعداد درخواست کد به محدودیت مجاز رسیده است.';
export const text_ab49afe00ae9: string = 'در انتظار زمان مجاز سرویس';
export const text_ebe932e8aaa3: string =
  'شماره حفظ می‌شود؛ زمان انتظار از پاسخ معتبر خوانده می‌شود.';
export const text_ec5a5ae1b01d: string = 'بازگشت به ورود';
export const text_01b07e48743e: string = 'احمدی';
export const text_5d56f7f4e5a4: string = 'تاریخ تولد اختیاری';
export const text_1ef8452fd823: string = 'از انتخاب‌گر معتبر';
export const text_1b7b8e455e17: string = 'ذخیره پروفایل';
export const text_867c2864b53d: string = 'انتخاب تاریخ تولد';
export const text_393ca45e8016: string =
  'تاریخ معتبر ذخیره می‌شود؛ نمایش فارسی، معنای date قرارداد را تغییر نمی‌دهد.';
export const text_0537419d1c08: string =
  'انتخاب عکس از دستگاهنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_0496f31dda0b: string = 'انتخاب عکس از دستگاه';
export const text_5226d3b14647: string =
  'برش و انتخاب تصویر با کنترل سیستم انجام شود. ذخیره بعد از آماده‌شدن فایل است.';
export const text_1240c7c463c4: string = 'اطلاعات حسابنام، شناسه و عکس';
export const text_55b00992234a: string = 'نام، شناسه و عکس';
export const text_59622339d1d0: string = 'حریم ارتباطپیام، شماره و دعوت';
export const text_e3ce8df0340d: string = 'پیام، شماره و دعوت';
export const text_052b79afbebe: string = 'اعلان‌هادسته‌ها، دستگاه و سکوت';
export const text_51181cb540e9: string = 'دسته‌ها، دستگاه و سکوت';
export const text_4283205fbdd2: string = 'ظاهر و خواناییتم و اندازه متن';
export const text_9cbff3e254be: string = 'ظاهر و خوانایی';
export const text_1e9535ce1e83: string = 'تم و اندازه متن';
export const text_c1495d7977ca: string = 'امنیت و نشست‌هادستگاه‌های فعال';
export const text_754fd38436b3: string = 'دستگاه‌های فعال';
export const text_a34341ee6a10: string = 'اشتراک و مصرفپیش‌فاکتور و سفارش';
export const text_a389dfb8f340: string = 'پیش‌فاکتور و سفارش';
export const text_ce63f2196634: string = 'مطابق سیستمانتخاب دستگاه را دنبال کن';
export const text_09ac966bd1cb: string = 'مطابق سیستم';
export const text_acdfba965bb3: string = 'انتخاب دستگاه را دنبال کن';
export const text_de0ebfd189f7: string = 'روشنسطح‌های روشن و آبی';
export const text_060c3024e6c0: string = 'سطح‌های روشن و آبی';
export const text_e452ed6c06a5: string = 'تاریکسطح‌های تیره و آبی روشن';
export const text_c5d25b49a8b4: string = 'سطح‌های تیره و آبی روشن';
export const text_b7ee9fe9d04a: string = 'تغییر تم، جای پیمایش و ورودی ناتمام را حفظ می‌کند.';
export const text_fd0bb40369f1: string = 'ذخیره ظاهر';
export const text_d2350d986683: string = 'خوانایی و نمایش';
export const text_ca080c309161: string =
  'این ترجیحات محلی‌اند؛ endpoint ذخیره عمومی تم در snapshot مستند نشده است.';
export const text_e3cc117b271b: string = 'پیروی از اندازه متن دستگاه';
export const text_76dc56d6f9f8: string = 'چیدمان باید با متن بزرگ سازگار باشد';
export const text_a9a8f0e338f7: string =
  'پیروی از اندازه متن دستگاهچیدمان باید با متن بزرگ سازگار باشد';
export const text_d6b59bdfa83c: string = 'کاهش حرکت';
export const text_3c99d8dc6f2c: string = 'ترجیح دستگاه رعایت شود';
export const text_eb2b36fd223c: string = 'کاهش حرکتترجیح دستگاه رعایت شود';
export const text_9fcd2c14d197: string = 'پیش‌نمایش متن';
export const text_260ffc007d30: string = 'این متن با تنظیم خوانایی نمایش داده می‌شود.';
export const text_eb7c7791cb52: string = 'ذخیره ترجیح محلی';
export const text_1489752f0229: string = 'حضور و آخرین بازدیدطبق انتخاب معتبر';
export const text_1a6ff4e07388: string = 'حضور و آخرین بازدید';
export const text_244008c20229: string = 'طبق انتخاب معتبر';
export const text_e46834847305: string = 'چه کسی پیام بدهد؟';
export const text_c1b211298323: string = 'همهطبق محدودیت‌های ایمنی حساب';
export const text_91c50e6a2394: string = 'طبق محدودیت‌های ایمنی حساب';
export const text_e0a35b7a2b34: string = 'مخاطبینفقط مخاطبین مجاز';
export const text_e697049f5954: string = 'فقط مخاطبین مجاز';
export const text_c2ea54b050c1: string = 'هیچ‌کسطبق استثناهای معتبر سرویس';
export const text_104c8dc32406: string = 'طبق استثناهای معتبر سرویس';
export const text_801f8fcc1c96: string = 'ثبت مخاطب پیام';
export const text_bd3f402fa590: string = 'نام حساب';
export const text_a915af869e9a: string = 'اامیر نادریمسدودی شخصی حساب';
export const text_616dd96097f5: string = 'مسدودی شخصی حساب';
export const text_2887fa673560: string = 'نحساب نمونهمسدودی شخصی حساب';
export const text_813bce2b3949: string = 'حساب نمونه';
export const text_a4786861747b: string = 'رفع مسدودی، عضویت آموزشگاه یا کلاس مستقلی ایجاد نمی‌کند.';
export const text_6f96d18d1562: string = 'رفع مسدودی فرد منتخب';
export const text_cb9506545599: string = 'تکلیف تازهریاضی دهم · تمرین فصل دومتازه';
export const text_ffe1c60d7fe2: string = 'ریاضی دهم · تمرین فصل دوم';
export const text_87c399e5f7cb: string = 'دعوت کلاسکارگاه داستان‌نویسیتازه';
export const text_b855dc651d42: string = 'نشست جدیدبررسی دستگاه فعال';
export const text_498ae6d304d6: string = 'نشست جدید';
export const text_d974d94478ff: string = 'بررسی دستگاه فعال';
export const text_940319dcd7db: string = 'دسته‌های اعلان';
export const text_33b763f2ee46: string = 'پیام‌هاپوش و پیامک طبق ترجیح';
export const text_ab468a891200: string = 'پوش و پیامک طبق ترجیح';
export const text_ea4bef0f2219: string = 'تکلیف و نتیجهرویدادهای آموزشی مجاز';
export const text_74bbf71c44bb: string = 'تکلیف و نتیجه';
export const text_b5baedb74a19: string = 'رویدادهای آموزشی مجاز';
export const text_9dddc8523520: string = 'جلسه‌هابرنامه و یادآوری';
export const text_3b397fa8cbb5: string = 'برنامه و یادآوری';
export const text_caaac6944d37: string = 'دعوت‌هادرخواست و پذیرش';
export const text_ac2a06cdb3d7: string = 'درخواست و پذیرش';
export const text_0aa58a44b495: string = 'امنیت حسابرویدادهای امنیتی';
export const text_3eefd901f392: string = 'رویدادهای امنیتی';
export const text_8476f5a3649a: string = 'اعلان تکلیف‌ها';
export const text_daf98efae542: string = 'پوش طبق مجوز دستگاه';
export const text_09b904a95766: string = 'اعلان دستگاهپوش طبق مجوز دستگاه';
export const text_cc58306e301b: string = 'در صورت پشتیبانی سرویس';
export const text_6b103af7f3c4: string = 'پیامکدر صورت پشتیبانی سرویس';
export const text_a65044908038: string = 'ساعات سکوت';
export const text_fe55d1dda0de: string = 'در زمان منتخب مزاحم نشو';
export const text_a3567d2fce05: string = 'ساعات سکوتدر زمان منتخب مزاحم نشو';
export const text_b3300fc0cc72: string = '۲۲:۰۰';
export const text_aa401cf581b0: string = '۰۸:۰۰';
export const text_da97a755a8dc: string = 'ذخیره اعلان تکلیف';
export const text_c6254999bacc: string = 'اعلان این دستگاه';
export const text_b8289a99a234: string = 'مرورگر فعلی';
export const text_9cb02454bf57: string = 'وضعیت اعلان دستگاه';
export const text_5493ead14f6f: string = 'اجازه نمایش اعلان هنوز داده نشده است.';
export const text_1c7b7b812b95: string = 'درخواست مجوز سیستم پس از اقدام روشن کاربر باز می‌شود.';
export const text_e0436d8ab2f7: string = 'فعال‌کردن اعلان دستگاه';
export const text_74b7fa0c6d1c: string = 'دستگاه‌های اعلان';
export const text_10431c0b8735: string = 'مرورگر فعلیثبت‌شده برای پوش وبفعال';
export const text_38d60a999700: string = 'ثبت‌شده برای پوش وب';
export const text_f94b6fcfa9fb: string = 'گوشی اندرویدثبت‌شده برای اعلانفعال';
export const text_71a3f1a8d2a7: string = 'گوشی اندروید';
export const text_e117e458a4f4: string = 'ثبت‌شده برای اعلان';
export const text_72e87c7965b3: string =
  'ثبت مقصد اعلان با نشست ورود تفاوت دارد؛ حذف یکی، دیگری را خودکار پایان نمی‌دهد.';
export const text_f6bfc78c63bd: string = 'حذف مقصد اعلان؟';
export const text_0c7c4edcfa95: string =
  'این دستگاه دیگر اعلان تازه دریافت نمی‌کند. نشست ورود آن جداگانه مدیریت می‌شود.';
export const text_ff1ab3335daf: string = 'حذف ثبت اعلان';
export const text_e13cf3dc5c7a: string = 'نشست‌های فعال';
export const text_35e2ca6ee665: string = 'این مرورگرنشست فعلی · امروزفعلی';
export const text_e3430f921ed8: string = 'این مرورگر';
export const text_a7c98135faf5: string = 'نشست فعلی · امروز';
export const text_b2eab8a58c1c: string = 'گوشی قبلیآخرین فعالیت دیروز';
export const text_6130650ba6a5: string = 'آخرین فعالیت دیروز';
export const text_7174632d472a: string = 'مرورگر دومآخرین فعالیت ۱۲ آبان';
export const text_12fdd7ebbd60: string = 'مرورگر دوم';
export const text_14b81e894633: string = 'آخرین فعالیت ۱۲ آبان';
export const text_c6e6ad9ba017: string = 'دستگاه فعلی از نشست‌های دیگر قابل تشخیص است.';
export const text_36213403c982: string = 'آخرین فعالیت';
export const text_ed4173a826f2: string = '۱۳ آبان، ۱۸:۲۰';
export const text_58460cb64f07: string = 'این دستگاه برای دسترسی تازه نیازمند ورود مجدد می‌شود.';
export const text_f2632f4bab4c: string =
  'نشست این دستگاه پایان می‌یابد. پیش‌نویس‌های حساس و داده محلی مطابق سیاست حساب مدیریت شوند.';
export const text_f6aa82db3906: string = 'پیام‌رسان';
export const text_78d940f8baa4: string = 'وضعیت از پاسخ معتبر';
export const text_0f8c82815111: string = 'قابل بازبینی';
export const text_55c665431b86: string =
  'داده سن و وضعیت ارتباط فقط در محدوده مجاز نمایش داده می‌شوند.';
export const text_24737010aed6: string = 'بازبینی تاریخ تولداطلاعات مرکزی حساب';
export const text_dd8c39fbf274: string = 'بازبینی تاریخ تولد';
export const text_cef4dce197df: string = 'اطلاعات مرکزی حساب';
export const text_3e330f30fab6: string = 'راهنمای ارتباطتوضیح محدودیت قابل نمایش';
export const text_0ddc078020f9: string = 'راهنمای ارتباط';
export const text_8e8df0a245d8: string = 'توضیح محدودیت قابل نمایش';
export const text_7e95838ea6bd: string = 'نصب روی دستگاه';
export const text_a6b9ebfe27ab: string = 'ماکان همیشه در دسترس';
export const text_d27fcda5fdf5: string = 'راهنمای نصب متناسب مرورگر';
export const text_ca9e15245481: string = 'منوی مرورگر را باز کنیداز کنترل خود دستگاه';
export const text_a9fda52477aa: string = 'منوی مرورگر را باز کنید';
export const text_d6abbc536630: string = 'از کنترل خود دستگاه';
export const text_00ee1dba10d4: string = 'افزودن به صفحه اصلیدر صورت پشتیبانی مرورگر';
export const text_66e9549b40c0: string = 'افزودن به صفحه اصلی';
export const text_2278d58b13b6: string = 'در صورت پشتیبانی مرورگر';
export const text_8cbf1a0572d6: string = 'بازکردن ماکانهمان حساب و زمینه مجاز';
export const text_b3a65588e98e: string = 'بازکردن ماکان';
export const text_82aaa10dd7ff: string = 'همان حساب و زمینه مجاز';
export const text_23c23371b1d0: string =
  'این راهنما، نصب یا مجوز موفق را بدون نتیجه واقعی اعلام نمی‌کند.';
export const text_dd24998109f6: string = 'راهنما و پشتیبانی';
export const text_1d83646f925d: string =
  'راهنمای محلی قابل نمایش است؛ تیکت تعاملی تا وجود قرارداد، قابلیت پیشنهادی می‌ماند.';
export const text_9050e979aee5: string = 'موضوع راهنما';
export const text_76f7c0d8c06c: string = 'ورود و کد تأییدروش پیگیری مشکل ورود';
export const text_1480e9684018: string = 'ورود و کد تأیید';
export const text_1491f9add747: string = 'روش پیگیری مشکل ورود';
export const text_bfde2ed96218: string = 'دعوت و عضویتتفاوت دعوت و پذیرش';
export const text_cc6c87334acd: string = 'دعوت و عضویت';
export const text_a32aef3df995: string = 'تفاوت دعوت و پذیرش';
export const text_c9c4bf779cd9: string = 'فایل و اعلانبررسی مجوز دستگاه';
export const text_1fe0fca4430e: string = 'فایل و اعلان';
export const text_af689547a656: string = 'بررسی مجوز دستگاه';
export const text_28042640ff75: string = 'منابع مجاز من';
export const text_acc7e9888b11: string = 'راهنمای داستان‌نویسیشخصی · آماده مطالعه';
export const text_14303966a0c3: string = 'شخصی · آماده مطالعه';
export const text_c5c22a4f7e68: string = 'جزوه ریاضی دهمکلاس مجاز · آماده';
export const text_8e3d98011423: string = 'جزوه ریاضی دهم';
export const text_466503f3cd3e: string = 'کلاس مجاز · آماده';
export const text_5db1d66dd88e: string = 'مرور روایتکتابخانه تخصیص‌یافته';
export const text_b5a9836eb008: string = 'کتابخانه تخصیص‌یافته';
export const text_4b761b981529: string = 'جزئیات منبع';
export const text_1669ec9d59d5: string = 'منبع شخصی · نسخه ۲';
export const text_b731da1e2e04: string = 'آماده دریافت';
export const text_5d94e336834f: string = 'آماده مطالعه';
export const text_c17f0b65eb98: string = 'آماده استفاده';
export const text_8b02a016b94d: string = 'بازکردن محتوامطالعه منبع مجاز';
export const text_c861d4a9c39f: string = 'بازکردن محتوا';
export const text_594614ad4bf7: string = 'مطالعه منبع مجاز';
export const text_d5f5a5e39c74: string = 'نسخه‌ها و ویرایشبرای صاحب یا نقش مجاز';
export const text_e8300534d21f: string = 'نسخه‌ها و ویرایش';
export const text_950cd525c194: string = 'برای صاحب یا نقش مجاز';
export const text_432ca040590f: string = 'نمایش منبعمحدوده دسترسی';
export const text_d90a435157c3: string = 'نمایش منبع';
export const text_d9094a407629: string = 'محدوده دسترسی';
export const text_4b76e7195c0f: string = 'منبع کتابخانه';
export const text_acee0c53e1e1: string = 'نسخه تخصیص‌یافته کتابخانه';
export const text_8e547a05e9d6: string =
  'شما می‌توانید محتوای مجاز را بخوانید؛ ویرایش نسخه مرکزی برای نقش مجاز کتابخانه است.';
export const text_74d4c95ce31b: string = 'مرور روایت.pdfفایل آماده · منبع کتابخانه';
export const text_07663fbdd40e: string = 'مرور روایت.pdf';
export const text_e70208776ff8: string = 'فایل آماده · منبع کتابخانه';
export const text_fe2fa4ad990a: string = 'منبع تازه';
export const text_cf549d434749: string = 'یادداشت‌های فصل دوم';
export const text_c3c37949cff2: string = 'زمینه منبع';
export const text_2cc5b38aa125: string = 'انتخاب فایلنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_ae1a58536c14: string = 'آمادگی فایل، منبع و دستیار جدا نمایش داده می‌شوند.';
export const text_fe2f3fd98ad9: string = 'بارگذاری و ثبت منبع';
export const text_002e5501d346: string = 'آماده‌سازی منبع';
export const text_79ab9208c35e: string = 'یادداشت‌ها.pdfفایل دریافت شده';
export const text_cc56f9a30c82: string = 'یادداشت‌ها.pdf';
export const text_495be175c231: string = 'فایل دریافت شده';
export const text_a08597602886: string = 'فایل آمادهدریافت مجاز فایل ممکن است';
export const text_664898091c50: string = 'دریافت مجاز فایل ممکن است';
export const text_635d90bce5bf: string = 'منبع در پردازشمحتوا هنوز آماده مطالعه نیستمنتظر';
export const text_de926c73f559: string = 'منبع در پردازش';
export const text_58b53f9acd41: string = 'محتوا هنوز آماده مطالعه نیست';
export const text_7d558fc35a1a: string = 'دستیار ناآمادهنیازمند پایان آماده‌سازیمنتظر';
export const text_a77b099d7220: string = 'دستیار ناآماده';
export const text_780af28ae82e: string = 'نیازمند پایان آماده‌سازی';
export const text_39d13c081668: string = 'نسخه تازه منبع';
export const text_e53e03cf5877: string = 'نسخه فعلی';
export const text_8f574a88dc77: string =
  'فایل نسخه تازهنوع و حجم مجاز از پاسخ سرویس خوانده می‌شود.';
export const text_b32902ae3f9d: string = 'فایل نسخه تازه';
export const text_f38111251d3e: string = 'توضیح نسخه';
export const text_cfbb5669de8a: string = 'مثال‌های فصل دوم کامل شد.';
export const text_62e8fc108cef: string = 'نسخه قبلی تا سیاست معتبر انتشار، بی‌خبر جایگزین نمی‌شود.';
export const text_06b84cf795ad: string = 'ساخت نسخه تازه';
export const text_5e4091000102: string = 'انتشار این منبع؟';
export const text_bdf751f6c0ca: string = 'منبع شخصی · نسخه ۳';
export const text_4ad9bf39ba64: string = 'محتوای منبعپیش‌نویس و فایل آماده';
export const text_d670ae538c11: string = 'محتوای منبع';
export const text_a96e8a9d0b8b: string = 'پیش‌نویس و فایل آماده';
export const text_7c6324786826: string = 'نسخه و نمایشتنظیمات همین منبع';
export const text_dd9e7ca3c74c: string = 'نسخه و نمایش';
export const text_282e82f742d7: string = 'تنظیمات همین منبع';
export const text_e0cb45b636d2: string = 'نسخه پیش‌نویس ۳';
export const text_b9708ea58164: string = 'محدوده خصوصی مجازفقط صاحب و نقش‌های مجاز';
export const text_328a1de3174a: string = 'محدوده خصوصی مجاز';
export const text_82f85ad773cc: string = 'فقط صاحب و نقش‌های مجاز';
export const text_ceb53d382716: string = 'محدوده زمینه منبعطبق قابلیت و سیاست سرویس';
export const text_f25068d23f53: string = 'محدوده زمینه منبع';
export const text_97c01680c2bb: string = 'طبق قابلیت و سیاست سرویس';
export const text_0e3a877e4c28: string =
  'نمایش عمومی از وجود گزینه visibility بدون بررسی مقدار مجاز فرض نمی‌شود.';
export const text_cece93828487: string = 'ثبت نمایش';
export const text_f1050aa52b35: string = 'بایگانی منبع؟';
export const text_55f474f403e8: string =
  'اثر بایگانی بر مطالعه و دستیار از وضعیت معتبر خوانده می‌شود. فایل‌های لازم برای سوابق مجاز طبق سیاست حفظ می‌شوند.';
export const text_69057d701128: string = 'انتخاب زمینه دستیار';
export const text_45eaacca2a17: string = 'شخصیمنابع شخصی و اعتبار حساب';
export const text_6f86586ab3cd: string = 'منابع شخصی و اعتبار حساب';
export const text_fffaf1a90d85: string = 'آموزشگاه آفتابمنابع و پرداخت‌کننده مجاز سازمان';
export const text_bbf3cb6bf0ea: string = 'منابع و پرداخت‌کننده مجاز سازمان';
export const text_b8e7df542775: string = 'انتخاب زمینه، مجوز تازه برای خواندن منبع ایجاد نمی‌کند.';
export const text_16a34def2051: string = 'ادامه انتخاب منابع';
export const text_c26a23ddf14f: string = 'منابع گفتگو';
export const text_bb08d01c625a: string = 'منبع آماده و مجاز';
export const text_96c0333ac18d: string = 'یادداشت‌های روایت';
export const text_f2e545c07795: string = 'منبع ناآماده قابل ارسال به دستیار نشان داده نشود.';
export const text_2edf8f183152: string = 'انتخاب فعلی';
export const text_a0ede07bc4cf: string = 'یک منبع';
export const text_5bf06d82e219: string = 'بررسی آمادگی';
export const text_767052b6e73e: string = 'آمادگی دستیار';
export const text_84640844d2a0: string = 'آماده و مجاز';
export const text_3f57da48224b: string = 'پرداخت‌کننده';
export const text_effc7fb61e1f: string = 'سهمیه';
export const text_a5824a9b91f4: string = 'پرسش با همین زمینه، منبع و قصد مصرف ارسال می‌شود.';
export const text_ee8ba8003e28: string = 'تفاوت راوی اول‌شخص و سوم‌شخص چیست؟';
export const text_9b097e3d52be: string = 'ارسال پرسش';
export const text_2d8ab319679d: string = 'توضیح تکلیف';
export const text_c7574f0e9ac4: string = 'دانش‌آموز مجاز';
export const text_f8a7b3d73d1e: string = 'توضیح با زمینه همین تکلیف';
export const text_647cb7b81469: string = 'سؤال من';
export const text_df77f9267e73: string = 'از کجا حل پرسش دوم را شروع کنم؟';
export const text_e1fb93c354e4: string = 'راهنما باید از ساخت پاسخ قطعی یا استناد جعلی پرهیز کند.';
export const text_d9ad30b1aa2f: string = 'دریافت توضیح';
export const text_642a8adf8061: string = 'آمادگی آزمون';
export const text_cbbec9d2aaaf: string = 'برنامه آمادگی با داده مجاز';
export const text_702cc35d68ac: string =
  'ابتدا روش تجزیه را مرور کنید، سپس یک مثال حل کنید و روش خود را توضیح دهید.';
export const text_91b2bd453c7d: string = 'منبع مرتبطجزوه منتشرشده کلاس';
export const text_27fc6d03ead9: string = 'منبع مرتبط';
export const text_fd20ba38fb31: string = 'جزوه منتشرشده کلاس';
export const text_52bf4beaac27: string = 'برنامه مطالعه';
export const text_6e33403a4625: string = 'هدف';
export const text_72972e1c6fce: string = 'مرور فصل دوم ریاضی';
export const text_962b33585c76: string = 'زمان در دسترس';
export const text_94a7fa3f3b37: string = '۳۰ دقیقه';
export const text_ca28c963b3da: string = 'سه روز آینده';
export const text_84a6b3b1ff85: string =
  'برنامه پیشنهادی است و باید با شرایط واقعی یادگیری بازبینی شود.';
export const text_735c285ea835: string = 'ساخت برنامه پیشنهادی';
export const text_759177948efe: string = 'خلاصه کلاس';
export const text_3d564045f783: string = 'مدرس مجاز';
export const text_ca82629f3462: string = 'داده مجاز مدرس همین کلاس';
export const text_3d1a69c5da9c: string = 'خلاصه فعالیتطبق گزارش و پاسخ سرویس';
export const text_7d5a54cbb78e: string = 'خلاصه فعالیت';
export const text_095c9453da80: string = 'طبق گزارش و پاسخ سرویس';
export const text_d0cbb8707eed: string = 'نگاه به یک دانش‌آموزفقط عضو مجاز کلاس';
export const text_d37b27362cc5: string = 'نگاه به یک دانش‌آموز';
export const text_72c5fe3c4846: string = 'فقط عضو مجاز کلاس';
export const text_6ba2636973eb: string = 'پیشنهاد فعالیتقابل بازبینی مدرس';
export const text_a540006cffce: string = 'پیشنهاد فعالیت';
export const text_6f1e62a184e8: string = 'قابل بازبینی مدرس';
export const text_d6f21b763735: string = 'دریافت خلاصه پیشنهادی';
export const text_47d6146e7709: string = 'همراهی با فرزند';
export const text_c40b907c2911: string = 'والد مجاز';
export const text_17eb32cba31e: string = 'رابطه معتبر آموزشگاه آفتاب';
export const text_9521b46c8f14: string = 'درخواست';
export const text_ab468cc96fd0: string = 'برای همراهی با تکلیف‌های این هفته پیشنهاد بده.';
export const text_3b8fddb8976f: string =
  'پیام خصوصی، نتیجه منتشرنشده و یادداشت مدرس وارد خلاصه والد نشوند.';
export const text_c6c6c7dabd0e: string = 'دریافت پیشنهاد همراهی';
export const text_4ae3db8fdfb1: string = 'نگاه به آموزشگاه';
export const text_00eb096d2cf1: string = 'تحلیل پیشنهادی با محدوده مجاز';
export const text_887f61dd74f1: string = 'وضعیت حضور و تحویل تکلیف در آبان';
export const text_8d7fa9124b06: string =
  'خلاصه، جایگزین داده گزارش اصلی نیست و باید قابل بازبینی باشد.';
export const text_43c668905352: string = 'پاسخ دستیار';
export const text_903a161f46bf: string = 'راوی و زاویه دید';
export const text_b2d2c9454add: string = 'پاسخ نمونه قابل بازبینی';
export const text_d136bd917528: string =
  'راوی اول‌شخص با «من» تجربه می‌کند؛ راوی سوم‌شخص از بیرون شخصیت‌ها روایت می‌کند.';
export const text_80d8921f71cb: string = 'منبع پاسخراهنمای داستان‌نویسی · بخش راوی';
export const text_a609b1c07626: string = 'منبع پاسخ';
export const text_8d3e65006391: string = 'راهنمای داستان‌نویسی · بخش راوی';
export const text_10f9bd802135: string =
  'ارجاع باید در خروجی واقعی معتبر باشد؛ متن تصویر، پاسخ نمونه است.';
export const text_229a5c2080a0: string = 'اعتبار کافی نیست';
export const text_a19798ce0b64: string = 'مصرف این درخواست با اعتبار فعلی انجام نمی‌شود.';
export const text_2ce1bfded7f3: string = 'حفظ شده';
export const text_c92ae81f10dd: string = 'بازگشت و ویرایش پرسش';
export const text_d562e3f109e1: string = 'دیدن اعتبار و پیش‌فاکتور';
export const text_e0141b4df11c: string = 'دستیار در دسترس نیست';
export const text_aaac96d2b7d7: string = 'پاسخ دریافت نشد. پرسش و منابع انتخاب‌شده حفظ شده‌اند.';
export const text_5e7e12ed88ad: string =
  'تلاش دوباره، قصد ارسال و پرداخت‌کننده را بی‌خبر عوض نمی‌کند؛ مصرف از نتیجه معتبر خوانده شود.';
export const text_373c2389d548: string = 'تلاش دوباره همان ارسال';
export const text_a4c48fd7c61d: string = 'خلاصه منبع';
export const text_2ee5199c07d5: string =
  'برای تولید و ذخیره این نوع خروجی، قرارداد محصول باید تکمیل شود.';
export const text_01793551e12a: string = 'پیشنهاد توسعه';
export const text_0e009ec229f4: string = 'مرور فصل دوم';
export const text_808b21329c5a: string = 'خروجی ساخت‌یافته نمونه';
export const text_2695a426749e: string =
  'تعریف‌ها، مثال‌ها و نکته‌های مهم در یک خلاصه قابل بازبینی گرد می‌آیند.';
export const text_82d941bdb266: string = 'پیش‌نمایش طرح';
export const text_b2b00ffcb433: string = 'فلش‌کارت مطالعه';
export const text_4df8c123c7c4: string = 'راوی اول‌شخص چیست؟';
export const text_a96031b5afc8: string = 'پرسش نمونه فلش‌کارت';
export const text_0b776a46f207: string = 'نمایش پاسخ';
export const text_f22fae83a366: string =
  'سیاست تولید، ذخیره و مرور کارت‌ها هنوز تصمیم مستقل می‌خواهد.';
export const text_4e7727779b5b: string = 'بازگشت به پیش‌نمایش';
export const text_62db215e4ac4: string =
  'خلاصه، نقشه مفهومی، خودآزمایی و صوت باید قرارداد، مصرف و دسترسی روشن داشته باشند.';
export const text_5aabd574fa46: string = 'راهنمای مرور صوتی';
export const text_c2af1e25d4e9: string = 'طرح صفحه؛ فایل واقعی تولید نشده است.';
export const text_b415ae668031: string = 'بازگشت به دستیار';
export const text_8000868e5d42: string = 'اشتراک فعلی';
export const text_8fad79b9bcc9: string = 'وضعیت از قرارداد تجاری';
export const text_6e428ca9f77c: string = 'نمونه';
export const text_f47e3b64ce2b: string = 'بسته‌های قابل انتخابکاتالوگ مجاز فعلی';
export const text_20c3202af29e: string = 'بسته‌های قابل انتخاب';
export const text_973bfc073f51: string = 'کاتالوگ مجاز فعلی';
export const text_fad77d6de423: string = 'سفارش‌های منپرداخت و وضعیت';
export const text_39e1508bf6d1: string = 'سفارش‌های من';
export const text_7b345e8752ac: string = 'پرداخت و وضعیت';
export const text_3596e07437d5: string = 'دیدن بسته‌ها';
export const text_8e16c24a21b4: string = 'پرداخت‌کننده و اختیار خرید معتبر';
export const text_6da8a605a45d: string = '۱۰۰ عضو آموزشی';
export const text_07948e3e7d13: string = '۶۴ عضو · ۶ گیگابایت';
export const text_8cdbf08ae3c5: string = 'پیش‌فاکتور تغییربازبینی قیمت و اثر ظرفیت';
export const text_78f05794f409: string = 'پیش‌فاکتور تغییر';
export const text_af4bf92318c5: string = 'بازبینی قیمت و اثر ظرفیت';
export const text_54ccbce8188e: string = 'تاریخچه سفارشهمان آموزشگاه';
export const text_4fa524e7d1bb: string = 'تاریخچه سفارش';
export const text_a996bd66691c: string = 'همان آموزشگاه';
export const text_ca568219f13a: string = 'انتخاب بسته';
export const text_402691bdd64d: string = 'بسته قابل خریدقیمت و ظرفیت از کاتالوگ';
export const text_e75a91f55f5a: string = 'بسته قابل خرید';
export const text_a88179d35fdc: string = 'قیمت و ظرفیت از کاتالوگ';
export const text_53b09b63098a: string = 'بسته دیگرسیاست نسخه تجاری معتبر';
export const text_60b9339b8ee7: string = 'بسته دیگر';
export const text_f575b5854f4d: string = 'سیاست نسخه تجاری معتبر';
export const text_9d6ed4e7bd06: string =
  'قیمت، دوره و ظرفیت در تصویر تعهد فروش نیستند؛ پیش‌فاکتور معتبر مبناست.';
export const text_37eef41a1498: string = 'دریافت پیش‌فاکتور';
export const text_68530db0a36c: string = 'بازبینی پیش‌فاکتور';
export const text_cdfea6b3032e: string = 'خریدار';
export const text_e556990203bb: string = 'حساب شخصی سارا';
export const text_b1e8a8c1dcd7: string = 'بسته آموزشگاه · ماهانه';
export const text_eef56dfc6123: string = '۲٬۹۰۰٬۰۰۰ تومان';
export const text_0709fe5256bc: string = 'اعتبار قیمت';
export const text_5836097fbf47: string = 'مبلغ، دوره و ظرفیت را بازبینی کردم.';
export const text_b6e4955aff15: string = 'ساخت سفارش';
export const text_a0750d3802e5: string = 'سفارش در انتظار';
export const text_aede957960e2: string = 'سفارش ۰۱۲۴';
export const text_4d3dff36d161: string = 'بازگشت از صفحه، وضعیت سفارش را از بین نمی‌برد.';
export const text_9f8678a1dfeb: string = 'ادامه پرداخت';
export const text_165beefbf8d2: string = 'بررسی پرداخت';
export const text_8c2cfba864e8: string = 'پارامتر موفقیت URL به‌تنهایی، رسید معتبر پرداخت نیست.';
export const text_e45d6f245167: string = 'از درگاه برگشته‌اید؛ وضعیت نهایی از سفارش خوانده می‌شود.';
export const text_9d6260615cbb: string = 'بررسی وضعیت سفارش';
export const text_fbc053927658: string = 'سفارش ۰۱۲۴۱۴ آبان · پرداخت تأییدشدهتأییدشده';
export const text_d61bdddd8a3c: string = '۱۴ آبان · پرداخت تأییدشده';
export const text_66cf25baa773: string = 'سفارش ۰۱۲۳۱۲ آبان · پرداخت ناتماممنتظر';
export const text_dc227eec383d: string = 'سفارش ۰۱۲۳';
export const text_32b901880e2d: string = '۱۲ آبان · پرداخت ناتمام';
export const text_57b6f209042c: string = 'وضعیت سفارش تأیید شد';
export const text_8d5ac7ec8524: string = '۰۱۲۴';
export const text_89bb0e81e6a5: string = 'طبق نتیجه معتبر';
export const text_a46a070a8d4c: string = 'اشتراک';
export const text_0462d4a341cd: string = 'بسته ماهانه فعال';
export const text_76ee8c8d46d6: string = 'بازگشت به سفارش‌ها';
export const text_36e55696a970: string = 'کاهش بسته اشتراک';
export const text_3be4235dd8e1: string =
  'اثر کاهش ظرفیت، زمان اعمال و منابع مازاد باید پیش از ثبت از قرارداد روشن شوند.';
export const text_28a4b851956f: string = 'بسته مقصد';
export const text_ec644610f839: string = 'بسته پایه ماهانه';
export const text_86b44772903a: string = 'اثر تغییر را بازبینی کردم.';
export const text_7f858a3147db: string = 'ثبت درخواست کاهش';
export const text_f6274a9ffa3b: string = 'مدیریت ماکان';
export const text_a115a8f55539: string = 'ادمین پلتفرم';
export const text_37a7682a5a40: string = 'پنل پلتفرم';
export const text_9bcede99ae99: string = 'ورود از پروفایل حساب دارای اختیار';
export const text_1de87248d27b: string = 'درخواست‌های تشکیلفوق‌برنامه مستقل';
export const text_1cee02d16d04: string = 'فوق‌برنامه مستقل';
export const text_9d072f182f76: string = 'کاربران و آموزشگاه‌هاعملیات مجاز پلتفرم';
export const text_9cbd8feda221: string = 'کاربران و آموزشگاه‌ها';
export const text_468a273ba59f: string = 'عملیات مجاز پلتفرم';
export const text_7ca8bee9bb5e: string = 'عملیات و ممیزیسلامت، گزارش و سابقه';
export const text_927b6a8fd3a7: string = 'عملیات و ممیزی';
export const text_b1a9be7ebe2c: string = 'سلامت، گزارش و سابقه';
export const text_ff2b1f75d8d6: string = 'پنل، مقصد ششم همگانی برنامه نیست.';
export const text_8232a3e35818: string = 'نقش‌های پلتفرم';
export const text_92067ad842af: string = 'مالک ماکان';
export const text_b05a3e8d9c2c: string = 'سسارا احمدیمالک پلتفرممالک';
export const text_99a422cd5dce: string = 'مالک پلتفرم';
export const text_b181bfeafa94: string = 'ممریم رضاییرسیدگی‌کننده مجازادمین';
export const text_e8138f7dfbd3: string = 'رسیدگی‌کننده مجاز';
export const text_20d9f252f83b: string = 'ادمین';
export const text_ea9e5ce190aa: string = 'حساب مقصد';
export const text_7579b6c6b4c0: string = 'نقش واگذاری';
export const text_6c861869f0ec: string = 'رسیدگی‌کننده گزارش';
export const text_c52a81cab269: string = 'بازبینی اعطای نقش';
export const text_11eb965b3feb: string = 'پایان نقش پلتفرم؟';
export const text_38b59fd7d432: string =
  'اختیار پلتفرمی این انتساب پایان می‌یابد؛ نقش‌های آموزشگاه و کلاس مستقل جدا هستند.';
export const text_90caec701f6f: string = 'انتساب';
export const text_abfff0e416f8: string = 'ادمین منتخب';
export const text_291772334ad8: string = 'کاربران پلتفرم';
export const text_d967311aefa3: string = 'حساب یا شناسه مجاز';
export const text_ca8a2e5f0171: string = 'تعلیق';
export const text_51ec7edd72b0: string = 'ننازنین موسویحساب فعالفعال';
export const text_354ac487fd1c: string = 'اامیر نادریحساب در بررسیدر بررسی';
export const text_37365027da7b: string = 'حساب در بررسی';
export const text_c879d6147b3b: string = 'جزئیات حساب';
export const text_53cf24af1561: string = 'نمای عملیاتی مجاز پلتفرم';
export const text_887be2eac314: string = 'مطابق داده مجاز';
export const text_53cb067ea544: string = 'نشست‌ها';
export const text_938a5d7bed17: string = 'فهرست مجاز عملیات';
export const text_1310bcc55479: string = 'وضعیت ارتباطبررسی مجاز اطلاعات';
export const text_0518bcd2136b: string = 'بررسی مجاز اطلاعات';
export const text_05c5bd2dd9f3: string = 'نشست‌های حسابپایان با اختیار و دلیل';
export const text_0353ec0a3bd6: string = 'نشست‌های حساب';
export const text_e5e7f2bbd19e: string = 'پایان با اختیار و دلیل';
export const text_89dcf9347be5: string = 'تعلیق حساب؟';
export const text_3659c83204c5: string = 'اثر تعلیق بر ورود و دسترسی‌ها باید پیش از ثبت روشن باشد.';
export const text_fb82dc95d510: string = 'بازبینی وضعیت حساب';
export const text_b6cb8c5da338: string = 'دامنه عمل و حساب هدف را بررسی کردم.';
export const text_03a39fdc704a: string = 'ثبت تعلیق';
export const text_86dea222b1be: string = 'آموزشگاه‌ها';
export const text_8399fc57e671: string = 'نام آموزشگاه';
export const text_18997502d6bd: string = 'آفتاباشتراک و اعضای مجازفعال';
export const text_6052e83a795f: string = 'اشتراک و اعضای مجاز';
export const text_51acfa793a99: string = 'باراندر حال راه‌اندازیمنتظر';
export const text_47db74267d14: string = 'باران';
export const text_42d75a011766: string = 'در حال راه‌اندازی';
export const text_5ca27fb312b4: string = 'آموزشگاه تازه';
export const text_64cb3217f6a4: string = 'راه‌اندازی برای سفارش معتبر';
export const text_6ec12588f8ab: string =
  'ساخت سازمان از کلاس مستقل جداست؛ عضویت مدیر با دعوت و انتساب معتبر انجام می‌شود.';
export const text_ed00ac62eedb: string = 'ثبت آموزشگاه';
export const text_e1a33511318f: string = 'اثر تعلیق آموزشگاه';
export const text_779558dbc7ec: string = 'پیامدهای تعلیق را پیش از تصمیم بررسی کنید.';
export const text_3515ecf51e4c: string = 'اعضا و کلاس‌ها';
export const text_9a88df75c77a: string = 'اشتراک و منابع';
export const text_6f6cdc900867: string = 'بازبینی عملیات آموزشگاه';
export const text_59852ffd9ee8: string = 'بازبینی تعلیق';
export const text_56c4e854dfb1: string = 'عضویت‌های آفتاب';
export const text_f0a10b8fec08: string = 'سسارا احمدیمدیر آموزشگاهفعال';
export const text_9c9e4c335ffc: string = 'ممریم رضاییمدرس آموزشگاهفعال';
export const text_aa10a1091a7c: string = 'مدرس آموزشگاه';
export const text_657c73610c0e: string = 'نقش پلتفرمی، مجوز نامحدود مشاهده پیام و پاسخ خصوصی نیست.';
export const text_177d3ffc786c: string = 'دعوت مدیر آموزشگاه';
export const text_f9411ab31f2d: string = 'راه‌اندازی سفارش معتبر';
export const text_01b2ce7f84e1: string = 'ارسال دعوت مدیر';
export const text_93771e1775e9: string = 'پایان عضویت سازمان؟';
export const text_9a9c3128542f: string = 'پایان همکاری سازمانی';
export const text_6d89cf59c8f4: string = 'دسترسی‌های زمینه‌ای طبق اثر معتبر این عملیات تازه شوند.';
export const text_509804c83aac: string = 'راه‌اندازی‌ها';
export const text_6e7adb1cd0c1: string = 'در اجرا';
export const text_1f53e7fdf412: string = 'آموزشگاه بارانسفارش ۰۱۲۴در صف';
export const text_3198c6b36701: string = 'آموزشگاه آفتابراه‌اندازی تکمیل‌شدهتکمیل';
export const text_fae9352500c1: string = 'راه‌اندازی تکمیل‌شده';
export const text_9f3ab49eb92d: string = 'تکمیل';
export const text_a6fe602d293a: string = 'راه‌اندازی تازه';
export const text_99c9e9fef549: string = 'نسخه پلن';
export const text_7fbd2ac3d335: string = 'بسته آموزشگاه · نسخه ۲';
export const text_f352c7687d4e: string = 'مدیر اولیه';
export const text_963bafb4e762: string = 'پایان اشتراک اختیاری';
export const text_449d6c1532c8: string = '۱۴ آذر ۱۴۰۵';
export const text_42f6e6c69fe3: string = 'تکمیل سفارش تأییدشده';
export const text_6588dc6df210: string = 'بازبینی راه‌اندازی';
export const text_7633e0814dd1: string = 'سفارش پلتفرم';
export const text_0134bd87cede: string = 'وضعیت پرداخت';
export const text_6601e48ce394: string = 'راه‌اندازی';
export const text_66b8b6ce5b6a: string = 'جزئیات سفارشاقلام و اثر تجاری';
export const text_5df85f0268fb: string = 'اقلام و اثر تجاری';
export const text_5a84bc38216a: string = 'سابقه عملیاتشناسه قابل پیگیری';
export const text_1365c8afecc6: string = 'سابقه عملیات';
export const text_032c7697a139: string = 'شناسه قابل پیگیری';
export const text_8569525d7bf8: string = 'پلن‌های ماکان';
export const text_715866da2194: string = 'پلن آموزشگاهنسخه منتشرشده و پیش‌نویس';
export const text_ebebfe51cbb0: string = 'پلن آموزشگاه';
export const text_1166f229b072: string = 'نسخه منتشرشده و پیش‌نویس';
export const text_280200760b35: string = 'پلن شخصینسخه منتشرشده';
export const text_081ea8f37a3c: string = 'پلن شخصی';
export const text_25406af40f15: string = 'نسخه منتشرشده';
export const text_5001c586faf3: string = 'پلن تازه';
export const text_4c4b96ab153e: string = 'نسخه پیش‌نویس پلن';
export const text_5fb5c2680d06: string = 'عنوان نسخه';
export const text_6079757b1d5e: string = 'نسخه پیشنهادی جدید';
export const text_f0315a9d9049: string = 'قیمت و دوره';
export const text_fd5f13c98ee1: string = 'ماهانه · ۲٬۹۰۰٬۰۰۰ تومان';
export const text_25cb9ed558ae: string = 'ظرفیت و سهمیه';
export const text_513ca822cb47: string = '۱۰۰ عضو آموزشی · ۱۰ گیگابایت';
export const text_5312ccb37466: string = 'قیمت‌های پلن مالی قبلی، نرخ مصوب کاتالوگ فرض نمی‌شوند.';
export const text_32b09b39a582: string = 'اعتبارسنجی نسخه';
export const text_b3c3ac471519: string = 'بازبینی انتشار پلن';
export const text_6a315e97d6ae: string = 'اعتبارسنجی';
export const text_4b4fdcf2cd16: string = 'نتیجه معتبر سرویس';
export const text_06cb5c593c08: string = 'پیش‌نویس منتخب';
export const text_dd163a9d2d28: string = 'دسترس‌پذیری';
export const text_9e7d4b57d650: string = 'طبق تنظیم فروش';
export const text_8bc526cd766b: string = 'قیمت، ظرفیت و اثر نسخه را بررسی کردم.';
export const text_9a703d21867b: string = 'نسخه منتشرشده، مبنای پیش‌فاکتور و سفارش جدید می‌شود.';
export const text_d12bdd23e3a1: string = 'انتشار نسخه پلن';
export const text_4894d2a9a285: string = 'قرارداد تجاری';
export const text_2167b3bded2a: string = 'صاحب اشتراک';
export const text_4d2a12e3c42c: string = 'مبدأ دوره';
export const text_d226802b6b1c: string = '۱۴ آبان ۱۴۰۵';
export const text_9ac40e5a916f: string = 'شماره دوره';
export const text_359e186bfc73: string = 'توافق ثبت‌شده مشتری';
export const text_4085cf70a534: string = 'بازبینی قرارداد';
export const text_354ad40ca6de: string = 'دسترس‌پذیری پلن';
export const text_2e8932d32ede: string = 'تغییر امکان عرضه برای خرید تازه';
export const text_621d8ecdcdc4: string = 'قابل عرضه';
export const text_0459771a9609: string = 'مطابق پارامتر availability';
export const text_0cf5480fdead: string = 'قابل عرضهمطابق پارامتر availability';
export const text_2e1093952eeb: string = 'اثر این تغییر روی اشتراک‌های موجود جدا بررسی می‌شود.';
export const text_b0f4545120b3: string = 'ثبت تنظیم عرضه';
export const text_abcbb53eaee5: string = 'سابقه تجاری';
export const text_8a84710c4c77: string = 'ساخت قراردادآموزشگاه آفتاب · نسخه ۳';
export const text_191c29b5d20d: string = 'ساخت قرارداد';
export const text_fbec6a579eb2: string = 'آموزشگاه آفتاب · نسخه ۳';
export const text_73908923a881: string = 'تغییر استثنااثر و دلیل ثبت‌شده';
export const text_5eed6c44e65c: string = 'تغییر استثنا';
export const text_9d4bb46eb440: string = 'اثر و دلیل ثبت‌شده';
export const text_adba4b276684: string = 'انتشار نسخهنسخه معتبر کاتالوگ';
export const text_1f3fe9253448: string = 'انتشار نسخه';
export const text_dcfc5e8f6771: string = 'نسخه معتبر کاتالوگ';
export const text_5fba9c338905: string = 'تاریخچه تجاری با پرداخت، عضویت و نقش آموزشی یکی نیست.';
export const text_d38f494282cc: string = 'منابع کتابخانه';
export const text_3a93577e3977: string = 'راهنمای روایتنسخه مرکزی مجاز';
export const text_df442eea8593: string = 'راهنمای روایت';
export const text_61b5a0c4e2e1: string = 'نسخه مرکزی مجاز';
export const text_936bed4a14a3: string = 'مرور معادلهنسخه مرکزی مجاز';
export const text_4ca635083fdf: string = 'منبع کتابخانه تازه';
export const text_2d4ca3905867: string = 'ثبت منبع مرکزی';
export const text_e89060489f50: string = 'اطلاعات منبع';
export const text_4a76440b4902: string = 'طبق فیلدهای معتبر';
export const text_92e5a5c6bd9f: string = 'مرور معادله.pdfفایل آماده و مجاز';
export const text_308d68f61da0: string = 'مرور معادله.pdf';
export const text_08a7b5d8bd45: string = 'فایل آماده و مجاز';
export const text_7bb21a6251ed: string = 'افزودن محتوای تأییدشده';
export const text_58917c8a0f83: string = 'ثبت منبع کتابخانه';
export const text_5363c36e4d23: string = 'نمای آموزش پلتفرم';
export const text_766170fdcbf5: string = 'کلاس‌هانمای عملیاتی مجاز';
export const text_3e320b913d98: string = 'نمای عملیاتی مجاز';
export const text_6281cbea9d90: string = 'مدرسان و ثبت‌نام‌هاداده مجاز عملیات';
export const text_c2b307bbdb0c: string = 'مدرسان و ثبت‌نام‌ها';
export const text_281bfbc015e7: string = 'داده مجاز عملیات';
export const text_3f785451d317: string = 'تکلیف‌ها و آزمون‌هافهرست عملیاتی مجاز';
export const text_5c30986c9ff8: string = 'فهرست عملیاتی مجاز';
export const text_23710e549cd7: string =
  'وجود نمای مدیریتی، دسترسی بی‌قید به پاسخ خصوصی یا محتوای حساس را توجیه نمی‌کند.';
export const text_bd251899dad5: string = 'پرونده‌های گزارش';
export const text_887aa454e4cc: string = 'گزارش ۰۱۲۴پیام گزارش‌شده · زمینه مجازباز';
export const text_f5887ba5942a: string = 'پیام گزارش‌شده · زمینه مجاز';
export const text_162ef6d78a17: string = 'گزارش ۰۱۲۳فایل گزارش‌شدهدر بررسی';
export const text_cac551a2b4d3: string = 'گزارش ۰۱۲۳';
export const text_19ca3c38559f: string = 'فایل گزارش‌شده';
export const text_a942142b63b4: string = 'شواهد پرونده';
export const text_36f92987d865: string = 'محتوای لازم برای رسیدگی';
export const text_065d01f09e3b: string = 'مطابق مجوز و محدوده گزارش';
export const text_b6fdba430a8c: string = 'دلیل مشاهده گسترده‌تر';
export const text_8235111a90a5: string = 'نیاز به فهم زمینه همین گزارش';
export const text_b41aaed176d7: string = 'درخواست زمینه مجاز';
export const text_07708379fe7d: string = 'ثبت نتیجه پرونده';
export const text_95885071588f: string = 'رسیدگی و اقدام مجازنوع اقدام از قابلیت معتبر';
export const text_e00cb716939c: string = 'رسیدگی و اقدام مجاز';
export const text_e71573395d25: string = 'نوع اقدام از قابلیت معتبر';
export const text_797684f43f66: string = 'رد پروندهبا دلیل قابل پیگیری';
export const text_aed625be83b1: string = 'رد پرونده';
export const text_039647155665: string = 'شواهد و قواعد بررسی شدند.';
export const text_882871f70ff1: string = 'سلامت عملیات';
export const text_b88463f971a6: string = 'سرویس‌های اصلینتیجه health مستند';
export const text_13ff286d2073: string = 'سرویس‌های اصلی';
export const text_65e2035b443e: string = 'نتیجه health مستند';
export const text_6c057f504af7: string = 'کارهای پس‌زمینهوضعیت jobهای مجاز';
export const text_9a3855396391: string = 'کارهای پس‌زمینه';
export const text_4d34859b9fdb: string = 'وضعیت jobهای مجاز';
export const text_cba38648eb49: string = 'اعلان‌های عملیاتیرویداد و خطای ارسال';
export const text_c6ecd32332b4: string = 'اعلان‌های عملیاتی';
export const text_404646191cf1: string = 'رویداد و خطای ارسال';
export const text_6ea63c2e673b: string = 'نمای سلامت، تأیید کامل رفتار کسب‌وکار نیست.';
export const text_a761af76df90: string = 'آماده‌سازی منبعوضعیت از فهرست عملیاتدر اجرا';
export const text_2a5b28e210fc: string = 'وضعیت از فهرست عملیات';
export const text_7f5fba557ea0: string = 'اعلان کلاسوضعیت از فهرست عملیاتناموفق';
export const text_3ee5ebfe899d: string = 'اعلان کلاس';
export const text_7c223f7b3db4: string =
  'تا وجود فرمان retry مجاز، دکمه اجرای دوباره عمومی نمایش داده نشود.';
export const text_f851430098d1: string = 'سابقه ممیزی';
export const text_b629e95da008: string = 'فیلترهای واقعی از پارامترهای endpoint خوانده شوند.';
export const text_0267d13759a5: string = 'نوع عمل یا شناسه مجاز';
export const text_783030fd8ae2: string = 'بررسی درخواست کلاسعامل، زمان و نتیجه مجاز';
export const text_0d7360b2aef3: string = 'بررسی درخواست کلاس';
export const text_4656b0bf7b83: string = 'عامل، زمان و نتیجه مجاز';
export const text_9da5fc3c49d0: string = 'تغییر نقشهدف و دلیل ثبت‌شده';
export const text_476d160b4b48: string = 'تغییر نقش';
export const text_a0dfc4f1fdb6: string = 'هدف و دلیل ثبت‌شده';
export const text_11c3d1ccaafb: string = 'تغییر قراردادنسخه و اثر تجاری';
export const text_8ddea274ee81: string = 'تغییر قرارداد';
export const text_7ec1b42e9a10: string = 'نسخه و اثر تجاری';
export const text_dd3d2b04ab97: string = 'دریافت کلاس‌ها';
export const text_8f695c10c971: string =
  'اسکلت هم‌اندازه ردیف نهایی است؛ جای داده خوانده‌شده جابه‌جا نمی‌شود.';
export const text_a7880ea0c8f9: string = 'پیام‌های تازه';
export const text_d6391fe935ee: string = 'پیام‌های قدیمی‌تر در حال دریافت‌اند.';
export const text_f0a1f2419ed5: string =
  'دریافت جزئی، نوشتن پیام و خواندن داده موجود را بی‌دلیل قفل نمی‌کند.';
export const text_6d19632972ce: string = 'ادامه اعضا';
export const text_deb2d1543be8: string =
  'شناسه پایدار مانع ردیف تکراری می‌شود؛ فیلتر، cursor معتبر خودش را دارد.';
export const text_1dcb11bdeaaf: string = 'ننازنین موسویعضو آموزشی';
export const text_57ec0b00ee4d: string = 'رریحانه زمانیعضو آموزشی';
export const text_ec792f3d2476: string = 'دریافت افراد بیشتر';
export const text_f8b9003a2e77: string = 'هنوز کلاسی ندارید';
export const text_da4ec17decdd: string = 'کلاس‌های شما اینجا می‌آیند';
export const text_844f0342e624: string = 'دعوت معتبر را بررسی کنید یا به فضای مجاز دیگری بروید.';
export const text_011884eb28a5: string = 'هنوز گفتگویی نیست';
export const text_b82a78a5d594: string = 'اولین گفتگو را شروع کنید';
export const text_cd4402f46fbf: string = 'مخاطب یا حساب مجاز را انتخاب کنید.';
export const text_f742acfc6899: string = 'باشگاه قدیمی';
export const text_befe11531907: string = 'با این فیلتر کلاسی نیست';
export const text_ae676786ca5b: string =
  'عبارت یا فیلتر را تغییر دهید؛ این حالت به معنی حذف همه کلاس‌ها نیست.';
export const text_fe6c916d0bb0: string = 'پاک‌کردن فیلتر';
export const text_0a0ded2a4795: string = 'دسترسی مجاز نیست';
export const text_13c9a317e568: string = 'زمینه درخواست‌شده';
export const text_eacd288c752c: string = 'این بخش در دسترس شما نیست';
export const text_d0a5e39c1fa1: string = 'نقش و فضای فعال را بررسی کنید.';
export const text_54c0ae47fdcc: string = 'بازگشت به فضای مجاز';
export const text_d56a739e531f: string = 'دریافت انجام نشد';
export const text_cbbb7c444310: string = 'فهرست جاری';
export const text_b87a0fe013c3: string =
  'اطلاعات تازه دریافت نشد. داده قبلی با زمان آخرین دریافت نمایش داده می‌شود.';
export const text_f622a7fcbef8: string = 'ریاضی دهمآخرین داده دریافت‌شده · ۱۰:۲۰';
export const text_3125ac2d841b: string = 'آخرین داده دریافت‌شده · ۱۰:۲۰';
export const text_47c92617998c: string = 'عضویت پایان یافته';
export const text_bc1fa61f0763: string = 'دسترسی کلاس تغییر کرده';
export const text_20dab148d751: string =
  'سوابق و محتوای مجاز فقط طبق وضعیت جاری نمایش داده می‌شوند.';
export const text_a0971f3442dd: string = 'فایل و داده تازه پس از لغو عضویت دریافت نمی‌شوند.';
export const text_656ed7a1e51a: string = 'نسخه تازه‌تری وجود دارد';
export const text_c5d66be8a4e3: string = 'ویرایش کلاس';
export const text_5114c841c6cc: string = 'متن ناتمام شما در همین فرم حفظ شده است.';
export const text_8a9e47f475a8: string = 'اطلاعات روی سرویس تغییر کرده است.';
export const text_106c86835352: string = 'متن شما';
export const text_db375d8587df: string = 'نسخه تازه';
export const text_490fffac91e2: string =
  'ذخیره مجدد، نسخه تازه را بدون تصمیم شما بازنویسی نمی‌کند.';
export const text_d8f53983067e: string = 'بازبینی نسخه تازه';
export const text_9982184a77fa: string = 'نتیجه ثبت روشن نیست';
export const text_b436a8857c6f: string = 'ارتباط هنگام ثبت قطع شد.';
export const text_6b1a04c0c406: string =
  'پیش از ساخت دوباره، همان درخواست با شناسه معتبر پیگیری می‌شود؛ موفقیت حدس زده نمی‌شود.';
export const text_974b0ee75f13: string = 'پیگیری همان درخواست';
export const text_32c7cd5d84c5: string = 'تغییرات ذخیره نشده';
export const text_68275c3cb255: string = 'فرم چندمرحله‌ای';
export const text_5a8b0e902419: string =
  'می‌توانید متن را نگه دارید و بعد ادامه دهید، یا تغییرات ناتمام را کنار بگذارید.';
export const text_564d2ece0e2c: string = 'کنارگذاشتن تغییرات';
export const text_e41cbb82c26b: string = 'ماندن در فرم';
export const text_2467fb6997d2: string = 'اصلاح زمان جلسه';
export const text_61f77d53a8b5: string = '۲۰ آبان، ۱۶:۰۰';
export const text_4de9e3d93a92: string = '۲۰ آبان، ۱۵:۰۰';
export const text_417006dea914: string = 'پایان جلسه باید بعد از شروع باشد.';
export const text_80c95a992cca: string = 'بازبینی پس از اصلاح';
export const text_ceda068aaad5: string = 'پیوست پذیرفته نشد';
export const text_838f377366c1: string = 'عضو مجاز';
export const text_07bb430b6a42: string =
  'سقف و نوع معتبر از قرارداد یا پاسخ سیاست خوانده می‌شوند؛ متن پاسخ حفظ می‌ماند.';
export const text_4275891ff1c0: string = 'پاسخ تمرین.zipفایل انتخاب‌شده';
export const text_97041d88fca1: string = 'پاسخ تمرین.zip';
export const text_cd440bff27d3: string = 'نوع یا حجم این فایل با سیاست همین فعالیت سازگار نیست.';
export const text_bfe18d4bd991: string = 'انتخاب فایل دیگر';
export const text_647f06a8a7cb: string = 'نام بلند عضو';
export const text_0d999dc3a911: string = 'ننازنین موسوی احمدآبادیعضو آموزشی · نام چندخطی مجاز';
export const text_0caab4663d79: string = 'عضو آموزشی · نام چندخطی مجاز';
export const text_39aac1fef778: string = 'ممحمدحسین رضایی نیک‌سرشتعضو آموزشی · اطلاعات روشن';
export const text_0be2125fe2da: string = 'محمدحسین رضایی نیک‌سرشت';
export const text_309ef873bb6a: string = 'عضو آموزشی · اطلاعات روشن';
export const text_12d965e02cde: string =
  'نام با افزایش ارتفاع ردیف خوانا می‌ماند؛ دکمه اصلی خارج قاب نمی‌رود.';
export const text_3ee874c71a6d: string = 'مجوز انتخاب فایل';
export const text_e85f4db9dad4: string = 'مرورگر اجازه اعلان نداده است.';
export const text_3d767784c106: string =
  'مرکز اعلان داخل برنامه همچنان قابل استفاده است. راه تغییر مجوز متناسب مرورگر نمایش داده شود.';
export const text_c3fe2a5ac002: string =
  'انتخاب فایل با کنترل دستگاه انجام می‌شود؛ اگر اجازه داده نشود، متن پاسخ قابل ادامه است.';
export const text_e546b48c30b8: string = 'ادامه بدون فایل';
export const text_5c846b7d6764: string = 'بازکردن انتخاب‌گر';
export const text_26a5997b6ec0: string = 'دیدن راهنمای مجوز';
export const text_74ed361d3c62: string = 'اتصال برقرار نیست';
export const text_9fc761b09c44: string = 'داده دریافت‌شده با زمان مشخص نمایش داده می‌شود.';
export const text_9812fa0d7d8b: string = 'آخرین دریافت';
export const text_7e2a414f2046: string = 'پاسخ محلی، پرداخت یا عضویت موفق نامیده نمی‌شود.';
export const text_8ebd4627e347: string = 'تلاش برای اتصال';
export const text_b5e55332516d: string = 'برای ادامه وارد شوید';
export const text_be04c08181e3: string = 'مقصد قبلی حفظ شده';
export const text_ff021bfc77cc: string = 'بررسی پیوند دعوت';
export const text_959b1854a1d0: string = 'اعتبار دعوت و دسترسی حساب در حال بررسی است.';
export const text_658a1f5a6440: string =
  'پیش از روشن‌شدن وضعیت، فرم نامرتبط یا محتوای خصوصی نمایش داده نمی‌شود.';
export const text_d8b2159d59fd: string =
  'نشست شما پایان یافته است. پس از ورود معتبر، همین فعالیت در محدوده مجاز ادامه پیدا می‌کند.';
export const text_9b009e657294: string = 'ورود مجدد';
export const text_26ed589395ad: string = 'دعوت دیگر معتبر نیست';
export const text_7691a32b5ac0: string = 'این دعوت قابل پذیرش نیست';
export const text_b3263aa927a1: string = 'ممکن است لغو شده، منقضی یا قبلاً تعیین تکلیف شده باشد.';
export const text_f95028b6b464: string = 'بازگشت به دعوت‌ها';
export const text_c3a66ed71c4c: string = 'تغییر شماره همراه';
export const text_40fd518e4dd2: string = 'پیشنهاد تکمیلی';
export const text_6bde4a1352d9: string =
  'برای تغییر امن شماره، تأیید شماره فعلی و تازه، وضعیت نشست و اثر ارتباطات باید قرارداد مشخص داشته باشند.';
export const text_5b9cb83ccb35: string = 'نیازمند قرارداد';
export const text_f0fdbf27ac7f: string =
  'این قابلیت هنوز فعال نشده است. می‌توانید به بخش قبلی برگردید.';
export const text_93217dd6595d: string = 'حذف حساب';
export const text_2f54ac00b848: string = 'نیازمند تصمیم محصول';
export const text_783ae5b083eb: string =
  'انتقال مسئولیت کلاس و گفتگو، نگهداری سوابق آموزشی و مهلت بازیابی پیش از عرضه باید تعریف شوند.';
export const text_324a69a9636a: string = 'تیکت پشتیبانی';
export const text_f67c40eda8b8: string =
  'موضوع، پیوست، رسید و وضعیت پیگیری برای تیکت تعاملی باید قرارداد جدا داشته باشند.';
export const text_31859978222f: string = 'راهنمای موجودمقاله محلی قابل نمایش';
export const text_6519f40d0fe5: string = 'راهنمای موجود';
export const text_977eaf18c9c4: string = 'مقاله محلی قابل نمایش';
export const text_a5cd95ebfe4a: string = 'بازگشت به راهنما';
export const text_739257a89ca5: string = 'ریاضی دهم۲۴ عضو · آفتاب';
export const text_1d6167e75411: string = '۲۴ عضو · آفتاب';
export const text_d05f084354cd: string = 'ریاضی نهم۱۸ عضو · آفتاب';
export const text_ec948ab49b83: string = '۱۸ عضو · آفتاب';
export const text_81d98803ddb9: string = 'ننازنین موسویوضعیت حضورحاضر';
export const text_3d51785de478: string = 'اامیر نادریوضعیت حضورغایب';
export const text_0afc35f9a85e: string = 'حضور پس از بازبینی مدرس';
export const text_9f649ebc931a: string = 'ذخیره حضور';
export const text_a45f46373673: string = 'درس سوم · ریاضی دهم';
export const text_164171f1b24a: string = 'حاصل‌ضرب دو عبارت صفر است؛ یکی از آن دو باید صفر باشد.';
export const text_83aea9ce8b12: string = 'جزوه.pdfفایل آماده و مجاز';
export const text_325ef57aa93e: string = 'جزوه.pdf';
export const text_199bf839afe6: string = 'همان متن و همان اختیار در هر دو تم.';
export const text_d0c98fdb9332: string = 'مطابق قابلیت اعضا';
export const text_45ae9696225c: string = 'ارسال پیاممطابق قابلیت اعضا';
export const text_96662a54fdfc: string = 'ارسال فایل';
export const text_901da3bd01b1: string = 'ارسال فایلمطابق قابلیت اعضا';
export const text_c7583ba2fb7c: string = 'تاریخچهاز زمان پیوستن';
export const text_0cede56828d1: string = 'تاریخچه';
export const text_4d638ccc3a22: string = 'ترک گروه؟';
export const text_0bec0880c39d: string =
  'دسترسی تازه شما به این گروه پایان می‌یابد؛ گروه وابسته به کلاس از مسیر عضویت کلاس مدیریت می‌شود.';
export const text_6b9c82348574: string = 'اعضای کارگاه';
export const text_e3c2e70b2e4d: string = 'ممریم رضاییمدرس محلیمدرس';
export const text_0026c120ae8c: string = 'مدرس محلی';
export const text_5c71371d3236: string = 'رریحانه زمانیعضو آموزشی · حساب عادی';
export const text_1a74647213c9: string = 'اختیار آموزشی';
export const text_8a0aee463ef5: string = 'همین کلاس مستقل';
export const text_c65dc463b67f: string = 'ساخت تکلیفهمین کلاس مستقل';
export const text_9f8b253e8829: string = 'طراحی آزمون';
export const text_0fda7f616ea8: string = 'طراحی آزمونهمین کلاس مستقل';
export const text_5c04574c3454: string = 'ارزیابی پاسخهمین کلاس مستقل';
export const text_276a28a5bcd6: string = 'مسئولیت تازه آموزشی';
export const text_514936c8433e: string = 'ثبت اختیار';
export const text_a71c65addec0: string = 'پیشنهاد انتقال مدیریت';
export const text_adc4e4d96b1a: string = 'مسئولیت اعضا و فضاهای همین کلاس را بازبینی کنید.';
export const text_f07890a60a3f: string = 'نام منبع';
export const text_c50bab1c3d98: string = 'راهنمای روایتآماده مطالعه';
export const text_babb8a298516: string = 'یادداشت هفتهدر حال آماده‌سازیمنتظر';
export const text_161416ef6992: string = 'یادداشت هفته';
export const text_083673b538b0: string = 'فرق راوی و نویسنده چیست؟';
export const text_97c14989590a: string = 'مصرف مطابق بررسی معتبر انجام می‌شود.';
export const text_1868ee6a7ef7: string = 'مبلغ و اثر ظرفیت را بررسی کردم.';
export const text_89d8f6a577a9: string = 'مدیریت کلاس‌های آموزشگاه';
export const text_b369dfef796d: string = 'فهرست و جزئیات کنار هم؛ حفظ فیلتر، ترتیب تمرکز و بازگشت.';
export const text_847ddb060829: string = 'مدیر آموزشگاه · آموزشگاه آفتاب';
export const text_a557b58c59f0: string = 'کلاس منتخب';
export const text_dfc79bacffbf: string = 'ترم';
export const text_f9305ba293dd: string = 'اعضا و مدرس‌هاثبت‌نام و انتساب';
export const text_17b9e74fd2c3: string = 'اعضا و مدرس‌ها';
export const text_01772a20d830: string = 'ثبت‌نام و انتساب';
export const text_b5c0aedb5dd1: string = 'جلسه‌هابرنامه و حضور';
export const text_3c19c6f1ae0d: string = 'برنامه و حضور';
export const text_31e4fbf96ff7: string = '۲۴ / ۳۰';
export const text_c9c8f44a921d: string = '۲۲ / ۳۰';
export const text_2a14c9e1f93c: string = 'ادبیات';
export const text_7573f4412d26: string = '۲۸ / ۳۰';
export const text_994b42ad5e26: string = 'انتخاب ردیف، همان کلاس و ابزارهای مجازش را باز می‌کند.';
export const text_4df830cedb6b: string = 'جلسه و حضور؛ برنامه کنار فهرست';
export const text_e964a87c9a31: string = 'مدرس · آموزشگاه آفتاب';
export const text_ac517ac4b166: string = 'جلسه بعد۱۷ آبان، ۱۶:۰۰';
export const text_5d54591e7235: string = 'جلسه بعد';
export const text_2e3dc8505169: string = '۱۷ آبان، ۱۶:۰۰';
export const text_d3cf7eace203: string = 'ویرایش جلسهمطابق اختیار مدرس';
export const text_5736a30540ec: string = 'مطابق اختیار مدرس';
export const text_543281da8d7e: string = 'اصلاح';
export const text_feb5db273417: string = 'ثبت مدرس';
export const text_c3225f120dd9: string = 'مطابق ثبت جاری';
export const text_515ce19b1449: string = '۱۰ دقیقه';
export const text_3db077ed91b4: string =
  'ثبت گروهی با نسخه و مجوز جاری؛ خطا در همان ردیف یا بخش توضیح داده شود.';
export const text_ad7b615b5614: string = 'مطالعه درس و منابع همان کلاس';
export const text_8479030beb11: string = 'دانش‌آموز · ریاضی دهم · آفتاب';
export const text_1aad69f01240: string = 'دریافت جزوه';
export const text_7bb57f525dbf: string = '۱. مفهوم معادلهدرس منتشرشده';
export const text_cfe71978b07d: string = '۲. تجزیه عبارتدرس منتشرشده';
export const text_49849463242b: string = '۳. معادله درجه دومانتخاب فعلی';
export const text_bad3a7da9076: string = 'جزوه فصل دوم.pdf۴ صفحه · فایل مجاز';
export const text_2ac67135ba68: string = '۴ صفحه · فایل مجاز';
export const text_6f6148e3d958: string = 'درس سوم · مدرس مریم رضایی';
export const text_b07addeb7ea5: string =
  'حاصل‌ضرب دو عبارت صفر است؛ بنابراین یکی از آن دو باید صفر باشد.';
export const text_270e5b0d5cfd: string =
  'با صفر قرار دادن هر عبارت، ریشه‌های ۲ و ۳ به دست می‌آیند.';
export const text_184981908ae5: string =
  'پرسش درباره همین درس از گروه رسمی کلاس ادامه پیدا می‌کند.';
export const text_b1d2611532c3: string = 'بازکردن گفتگوی رسمی';
export const text_d41f236fbe12: string = 'ارزیابی تکلیف؛ پاسخ و بازخورد کنار هم';
export const text_9dedf9249a1f: string = 'ارزیاب کلاس';
export const text_a07c0aeb9efb: string = 'ارزیاب کلاس · ریاضی دهم · آفتاب';
export const text_7de6e2c160c0: string = 'ننازنین موسویتلاش اول · منتخب';
export const text_37d347cb313d: string = 'تلاش اول · منتخب';
export const text_5d3a598767b6: string = 'اامیر نادریتلاش دوم';
export const text_6c18a5acafb4: string = 'رریحانه زمانیتلاش اول';
export const text_b5d6df27e7eb: string = 'پاسخ ثبت‌شده نازنین';
export const text_5c35acd1c9e5: string =
  'ابتدا معادله را تجزیه می‌کنیم؛ سپس هر عبارت را برابر صفر قرار می‌دهیم.';
export const text_5a392d842b20: string = 'پاسخ نازنین.pdfفایل پاسخ · دسترسی ارزیاب';
export const text_cce20cd00443: string = 'فایل پاسخ · دسترسی ارزیاب';
export const text_b73ca2bacf92: string = 'یادداشت خصوصی در خروجی عضو یا والد منتشر نشود.';
export const text_1a06aff62718: string = 'روش درست است؛ توضیح مرحله آخر کامل‌تر شود.';
export const text_2d32573c4ce9: string = 'تمرین تکمیلی پیشنهاد شود.';
export const text_8b79851ba28a: string = 'تصحیح آزمون؛ سؤال، پاسخ و بارم';
export const text_61f20d777356: string = 'ارزیاب آزمون';
export const text_bb663cb24bce: string = 'ارزیاب آزمون · ریاضی دهم · آفتاب';
export const text_624c2733b1df: string = 'ذخیره نمره سؤال';
export const text_52954202d471: string = 'پاسخ‌برگ نازنین';
export const text_1322030fa75b: string = 'سؤال ۱تستی · تصحیح‌شده';
export const text_dd76efe59285: string = 'تستی · تصحیح‌شده';
export const text_43c2ba374b01: string = 'سؤال ۲تستی · تصحیح‌شده';
export const text_2de3daf8d7c9: string = 'سؤال ۵تشریحی · انتخاب فعلی';
export const text_d29e8e1d4edb: string = 'تشریحی · انتخاب فعلی';
export const text_a07c8a38a44d: string = 'سؤال ۵ · تشریحی';
export const text_44cf10413e4a: string = 'معادله را حل و روش خود را توضیح دهید.';
export const text_13a6168eeef1: string = 'پاسخ عضو';
export const text_b41690192e1d: string = 'عبارت را تجزیه و دو ریشه را محاسبه کردم.';
export const text_c4389ee20b28: string = 'پاسخ تکمیلی.pdfپیوست همین پرسش';
export const text_09b3a18ebec1: string = 'پیوست همین پرسش';
export const text_a2c9040b9dc5: string = 'بارم تشریحی';
export const text_9289646d3ee5: string = 'نمره تشریحی';
export const text_48451c0eed44: string = 'دلیل انتخاب روش را بیشتر توضیح دهید.';
export const text_6b9fa65f4269: string = 'تکمیل تصحیح از انتشار نتیجه جداست.';
export const text_16084a34a370: string = 'پیام‌رسان؛ صندوق، گفتگو و زمینه';
export const text_debf488e43be: string = 'حساب شخصی · حساب شخصی';
export const text_f59d8ef55cf8: string = 'رریاضی دهم۳ پیام تازه';
export const text_07ebe304d052: string = 'ممریم رضاییممنون، دریافت کردم.';
export const text_bba86a0ac635: string = 'ممنون، دریافت کردم.';
export const text_7d3f5b65251c: string = 'دکارگاه داستانتمرین تازه منتشر شد.';
export const text_63f71262a374: string = 'تمرین تازه منتشر شد.';
export const text_1a414fafa2b1: string = 'گروه رسمی کلاس · آفتاب';
export const text_3c00ce7df5aa: string = 'پرسش خود را درباره همین جلسه بنویسید.';
export const text_137ff7a38a67: string = 'عضویت معتبر کلاس';
export const text_14719fa2ae34: string = 'اعضامطابق مجوز گفتگو';
export const text_acd276b6f900: string = 'مطابق مجوز گفتگو';
export const text_e240ae1ac6a6: string = 'فایل‌هارسانه و فایل مجاز';
export const text_eda80d6b7f56: string = 'رسانه و فایل مجاز';
export const text_237976bb4e8f: string = 'اعلانترجیح شخصی';
export const text_9a646b9a4e7c: string = 'اعلان';
export const text_57e0d396876c: string = 'ترجیح شخصی';
export const text_c3117aa58dd6: string = 'پایان عضویت از کلاس مدیریت می‌شود.';
export const text_2c0f05fdf271: string = 'تنظیمات و اعضای گفتگو';
export const text_57a8153c8eb6: string = 'مالک گفتگو · باشگاه کتاب‌خوانی';
export const text_67531e2ca6ba: string = 'اطلاعات گروهنام، شرح و عکس';
export const text_f93fe91ca2c7: string = 'نام، شرح و عکس';
export const text_0b1cfa04032a: string = 'اعضا و مدیراننقش و اختیار';
export const text_5d6018c47dd6: string = 'نقش و اختیار';
export const text_ae784224850d: string = 'لینک دعوتاعتبار و درخواست‌ها';
export const text_7a555e2a0c9a: string = 'اعتبار و درخواست‌ها';
export const text_2adc61476892: string = 'قابلیت اعضاسیاست گفتگو';
export const text_fed20d7a5deb: string = 'سیاست گفتگو';
export const text_9bccde0ce896: string = 'گروه خصوصی · ۱۲ عضو';
export const text_7582c3c79f62: string = 'اختیار';
export const text_07baa9efa9e7: string = 'مدیریت معتبر';
export const text_d2d4bd85c2fd: string = 'طبق اختیار واگذارشده';
export const text_ce16f2857811: string = 'ویرایش اختیار';
export const text_51808a4154d3: string = 'قابلیت پایه';
export const text_bd0f05510b7e: string = 'ارسال پیام اعضا';
export const text_0d9b84bb6223: string = 'مطابق قابلیت معتبر';
export const text_454fb5469f69: string = 'ارسال پیام اعضامطابق قابلیت معتبر';
export const text_b72763ceb931: string = 'نمایش تاریخچه کامل';
export const text_c58b440b9baa: string = 'برای اعضای تازه';
export const text_f552987c13cb: string = 'نمایش تاریخچه کاملبرای اعضای تازه';
export const text_4732e67523bb: string =
  'گروه وابسته به کلاس، عضویت مستقلِ ناسازگار ایجاد نمی‌کند.';
export const text_cd36c1095495: string = 'کلاس مستقل؛ عضویت، فضا و اختیار';
export const text_e63110a143fb: string = 'مدیر کلاس مستقل · کارگاه داستان‌نویسی';
export const text_d7e5fb5474a2: string = 'کلاس مستقل از آموزشگاه';
export const text_e893e069c055: string = 'گروه اختصاصیهمان فضای متصل';
export const text_5a755038cb89: string = 'همان فضای متصل';
export const text_f201d272091a: string = 'کانال اختصاصیهمان فضای متصل';
export const text_84da5e38ff66: string = 'تاریخچهاعضا، اختیار و وضعیت';
export const text_76538f8e3203: string = 'اعضا، اختیار و وضعیت';
export const text_496dae9f7632: string = 'نوع حساب';
export const text_93b23a4f2464: string = 'نقش محلی';
export const text_0f0f3d5f357f: string = 'عادی';
export const text_6e77d5edddf1: string = 'صریح و معتبر';
export const text_ec570d81c920: string = 'پاسخ‌دهی';
export const text_c07eb685d2f0: string =
  'نقش، اختیار آموزشی و مدیریت کلاس جداگانه تغییر می‌کنند؛ هر تغییر را پیش از ثبت بررسی کنید.';
export const text_9d4cfbc9dac5: string = 'بررسی تشکیل فوق‌برنامه در پنل';
export const text_703a23a0b6e2: string = 'ادمین پلتفرم · مدیریت پلتفرم';
export const text_f860b75cf56b: string = 'بازبینی و ثبت تصمیم';
export const text_82a451abba9c: string = 'شماره درخواست';
export const text_4b5da986a0bb: string = 'کارگاه داستانسارا احمدی · ارسال‌شده';
export const text_5e5792ab27c5: string = 'سارا احمدی · ارسال‌شده';
export const text_5dda0ff75cbf: string = 'باشگاه کتابامیر نادری · اصلاح‌شده';
export const text_ecabed2310d8: string = 'امیر نادری · اصلاح‌شده';
export const text_074e825f079e: string = 'تمرین عکاسیمریم رضایی · در بررسی';
export const text_d2b4df96efbd: string = 'مریم رضایی · در بررسی';
export const text_e4fb344bd3c8: string = 'درخواست ۰۲۴۸ · نسخه معتبر';
export const text_6925e0492bcf: string = 'مدیر پیش‌فرض';
export const text_0963c243a028: string = 'هدف و محدوده بررسی شد.';
export const text_524953abf5db: string =
  'تأیید، همان کلاس و یک گروه و کانال اختصاصی را به فرایند آماده‌سازی می‌برد.';
export const text_db549ff745a1: string = 'پلن و قرارداد؛ نسخه و اثر تجاری';
export const text_addaae2418c9: string = 'ادمین تجاری';
export const text_5898bd7ba209: string = 'مدیریت تجاری';
export const text_9a3feb38c907: string = 'ادمین تجاری · پلتفرم';
export const text_077a3a063e63: string = 'بازبینی انتشار نسخه';
export const text_f1855483ae23: string = 'پلن آموزشگاهنسخه منتشرشده ۲';
export const text_1feb741dd1fe: string = 'نسخه منتشرشده ۲';
export const text_c67dcad8708e: string = 'نسخه ۳پیش‌نویس منتخب';
export const text_d8834b89953c: string = 'نسخه ۳';
export const text_8ebc5ecfa0d7: string = 'تاریخچهانتشار و تغییرهای معتبر';
export const text_50c435ef12dd: string = 'انتشار و تغییرهای معتبر';
export const text_b8cc6abec831: string = 'نسخه تجاری پیش‌نویس';
export const text_38af1746237f: string = 'قیمت و ظرفیت از قرارداد معتبر';
export const text_48efa6e31c5e: string = 'طبق فیلد معتبر';
export const text_5bb71222ac4a: string = 'نتیجه سرویس';
export const text_944437a8443b: string = 'ظرفیت آموزشی';
export const text_ebc38a6a2012: string = 'طبق نسخه منتخب';
export const text_74322b42c020: string = 'مصرف دستیار';
export const text_65507aeb1373: string = 'طبق سیاست نسخه';
export const text_3c20132c0ff7: string = 'بازبینی شرایط عرضه';
export const text_40555eb4dc18: string = 'دیدن نتیجه اعتبارسنجی';
export const text_5328c28e9c0b: string = 'منبع؛ محتوا، نسخه و دسترسی';
export const text_ad79b96148e0: string = 'صاحب منبع';
export const text_4be55123b2ea: string = 'صاحب منبع · فضای شخصی';
export const text_ca1de71ff7ea: string = '۳ · پیش‌نویس';
export const text_b80d608bfa1a: string = 'در انتظار آمادگی';
export const text_0f291273d1af: string = 'نسخه ۲منتشرشده';
export const text_f66ab6852da7: string = 'نسخه ۲';
export const text_a35e1406ed91: string = 'نمایشمحدوده مجاز فعلی';
export const text_aba36536157c: string = 'محدوده مجاز فعلی';
export const text_c6a3cc7acf55: string = 'متن پیش‌نویس';
export const text_194072364428: string =
  'نکته‌های اصلی، مثال‌ها و توضیح‌های مکمل در این نسخه تکمیل شده‌اند.';
export const text_e58b9646fc68: string = 'یادداشت‌های فصل دوم.pdfفایل آماده · نسخه تازه';
export const text_089b735af680: string = 'یادداشت‌های فصل دوم.pdf';
export const text_13d3bd0d21df: string = 'فایل آماده · نسخه تازه';
export const text_e97f68def9f7: string =
  'تعارض نسخه، متن جاری را حفظ می‌کند؛ انتشار فقط پس از بازبینی معتبر انجام می‌شود.';
export const text_f62aa1af2e65: string = 'دستیار؛ گفتگو، منابع و قصد مصرف';
export const text_1d8951386f9f: string = 'زمینه گفتگو';
export const text_71b847c6956d: string = 'طبق بررسی معتبر';
export const text_f8369c7f289c: string = 'راهنمای روایتمنبع آماده و مجاز';
export const text_6d639305fad8: string = 'یادداشت‌هاانتخاب نشده';
export const text_b4822799dd39: string = 'یادداشت‌ها';
export const text_4c59c215f900: string = 'انتخاب نشده';
export const text_50f3daab941d: string = 'منبع انتخاب‌شده روشن است.';
export const text_a450e7a9da20: string = 'تفاوت راوی و نویسنده';
export const text_9b3d44f2a987: string =
  'نویسنده پدیدآورنده متن است؛ راوی صدایی است که داستان را روایت می‌کند. این پاسخ نمونه باید در اجرا با ارجاع معتبر همراه شود.';
export const text_e4593a46d741: string = 'پرسش شما';
export const text_a6c08c3650de: string = 'یک مثال ساده هم بده.';
export const text_1b8c8a7d1781: string = 'ارسال همان پرسش';
export const text_0b97872a3087: string = 'آمادگی منابع';
export const text_b77c1fe2f2a6: string = 'برای همین ارسال';
export const text_6d37b97e15b1: string = 'در خطا، منبع و پرداخت‌کننده بی‌خبر تغییر نمی‌کنند.';
export const text_7505c4c3f048: string = 'گزارش آموزشگاه؛ فیلتر تا خروجی';
export const text_52a7c0bb8401: string = 'درخواست خروجی گزارش';
export const text_315ce637d025: string = 'حضور نمونه';
export const text_c97ebc42a089: string = 'در حال تکمیل';
export const text_27e650fd145d: string = '۹۰٪';
export const text_ed745ee69d5e: string = '۸۰٪';
export const text_62964dd78f0e: string = '۸۸٪';
export const text_1188be6ef29d: string = '۷۸٪';
export const text_c598fac86845: string = 'خروجی در حال آماده‌سازیشناسه پیگیری گزارش ۰۱۲۸';
export const text_e668ee4bc8b1: string = 'خروجی در حال آماده‌سازی';
export const text_4d0018dec600: string = 'شناسه پیگیری گزارش ۰۱۲۸';
export const text_2fcae6325791: string = 'گزارش قبلی آماده استدریافت با مجوز جاری';
export const text_1f59fdfaad68: string = 'گزارش قبلی آماده است';
export const text_8599cc65ea16: string = 'دریافت با مجوز جاری';
export const text_b44e2489fa5b: string =
  'عددها نمونه‌اند؛ حالت بدون داده، فیلتر بدون نتیجه و خطای خروجی باید از هم متمایز باشند.';

// V5 product navigation and context copy.
export const learningReports = {
  navigation: 'گزارش‌ها و پیشرفت',
  studentTitle: 'پیشرفت من',
  classTitle: 'گزارش کلاس',
  categories: 'نوع گزارش آموزشی',
  grades: 'نتایج منتشرشده',
  attendance: 'حضور',
  assignments: 'تکلیف‌ها',
  exams: 'آزمون‌ها',
  class: 'کلاس',
  learner: 'فراگیر',
  chooseClass: 'کلاس را انتخاب کنید',
  noClass: 'کلاسی برای گزارش در دسترس نیست',
  title: 'عنوان',
  status: 'وضعیت',
  score: 'نمره',
  when: 'زمان',
  unknown: 'مشخص نشده',
  noScore: 'نتیجه‌ای ثبت نشده',
  notApplicable: '—',
  updated: 'به‌روزرسانی: ',
  empty: 'در این بخش گزارشی نیست',
  emptyDescription: 'گزارش‌های مجاز پس از ثبت فعالیت آموزشی در همین بخش نمایش داده می‌شوند.',
};
export const reportExport = {
  range: 'بازه',
  lastRequest: 'پیگیری آخرین خروجی',
  back: 'بازگشت به گزارش‌ها',
  failed: 'ساخت خروجی انجام نشد',
  unavailable: 'فایل این خروجی فعلاً در دسترس نیست. وضعیت آن را دوباره بررسی کنید.',
  configure: 'تنظیم خروجی',
  create: 'ساخت خروجی',
  cancel: 'انصراف',
  type: 'نوع گزارش',
  format: 'قالب',
  csv: 'CSV',
  from: 'از زمان',
  to: 'تا زمان',
  attendance: 'حضور کلاس‌ها',
  assessments: 'ارزیابی‌ها',
  enrollments: 'ثبت‌نام‌ها',
  workload: 'کارکرد معلمان',
  invalidRange: 'پایان بازه باید پس از آغاز آن باشد.',
  allowedOnly: 'فقط داده‌های مجاز همین آموزشگاه در فایل قرار می‌گیرند.',
  preparing: 'خروجی در حال ساخت',
  ready: 'خروجی آماده است',
  status: 'وضعیت',
  rows: 'تعداد ردیف‌ها',
  requested: 'زمان درخواست',
  keepRequest: 'می‌توانید از صفحه خارج شوید و بعد وضعیت همین درخواست را ببینید.',
  download: 'دریافت فایل گزارش',
  downloading: 'در حال دریافت…',
  check: 'بررسی وضعیت',
  newExport: 'خروجی تازه',
  statuses: {
    Queued: 'در صف آماده‌سازی',
    Processing: 'در حال آماده‌سازی',
    Completed: 'آمادهٔ دریافت',
    Failed: 'آماده‌سازی انجام نشد',
  },
};
export const scheduleFilters = {
  thisClass: 'فقط همین کلاس',
  authorizedSchedule: 'برنامهٔ نقش فعلی',
  title: 'فیلتر برنامه',
  date: 'تاریخ هفته',
  class: 'کلاس',
  allClasses: 'همه کلاس‌های مجاز',
  cancelled: 'نمایش جلسه‌های لغوشده',
  apply: 'اعمال فیلتر',
  reset: 'بازنشانی',
};
export const unsavedNavigation = {
  title: 'تغییرات ذخیره نشده',
  description:
    'تغییرات این فرم هنوز ذخیره نشده است. می‌توانید ویرایش را ادامه دهید یا از صفحه خارج شوید.',
  continueEditing: 'ادامه ویرایش',
  leaveWithoutSaving: 'خروج بدون ذخیره',
  discardAndLeave: 'دورریختن و خروج',
};
export const privacySettings = {
  title: 'حریم خصوصی',
  blockedTitle: 'افراد مسدودشده',
  blockedSearch: 'نام حساب',
  unblockSelected: 'رفع مسدودی فرد منتخب',
  direct: 'پیام مستقیم',
  phoneVisibility: 'نمایش شماره',
  phoneDiscovery: 'یافتن با شماره',
  groupInvites: 'دعوت به گروه',
  presence: 'حضور و آخرین بازدید',
  directDialog: 'چه کسی پیام بدهد؟',
  save: 'ذخیره تغییرات',
  apply: 'ثبت انتخاب',
  applyDirect: 'ثبت مخاطب پیام',
  choose: 'انتخاب مخاطب مجاز',
  draftHint: 'انتخاب شما پس از ذخیره تغییرات ثبت می‌شود.',
  audiences: {
    Everyone: 'همه',
    Contacts: 'مخاطبین',
    Nobody: 'هیچ‌کس',
  },
  audienceDescriptions: {
    Everyone: 'طبق محدودیت‌های ایمنی حساب',
    Contacts: 'فقط مخاطبین مجاز',
    Nobody: 'طبق استثناهای معتبر سرویس',
  },
};
export const v5Product = {
  newPersonRecord: 'پرونده تازه',
  formationSteps: ['مشخصات', 'مدیریت', 'بازبینی'],
  requestNext: 'ادامه',
  personalWorkspace: 'فضای شخصی',
  listSeparator: '، ',
  weekNavigation: 'برنامهٔ این هفته',
  schoolToday: 'برنامه امروز',
  noUpcomingSession: 'جلسه‌ای پیش رو ثبت نشده است',
  noUpcomingSessionHint: 'برنامهٔ هفته و درس‌های مجازتان همچنان در دسترس هستند.',
  requestActiveAccounts: 'همه حساب‌های فعال',
  requestSubmitReview: 'ارسال برای بررسی',
  requestSavedDraft: 'مشاهدهٔ پیش‌نویس ثبت‌شده',
  requestReconcileDraft:
    'پیش‌نویس شما ثبت شده است. نتیجهٔ ارسال را پیگیری کنید یا همان پیش‌نویس را باز کنید.',
  assistantStart: 'امروز روی چه چیزی کار کنیم؟',
  assistantIntro: 'یک سؤال روشن، یک پاسخ قابل پیگیری',
  assistantAnswerContext: 'زمینهٔ پاسخ',
  assistantConversationTitle: 'گفتگو با دستیار',
  extraEmptyTitle: 'کلاس بعدی از شما شروع می‌شود',
  extraEmptyDescription: 'برای هر موضوعی که می‌خواهید با هم یاد بگیرید، درخواست تشکیل کلاس بدهید.',
  extraAllAccounts: 'برای همه حساب‌ها',
  extraRequestPolicy:
    'بدون نیاز به آموزشگاه یا نقش دانش‌آموز. درخواست شما را مالک یا ادمین ماکان بررسی می‌کند.',
  extraInviteHint: 'لینک دعوت دارید؟',
  extraTabRequests: 'درخواست‌ها',
  extraTabInvites: 'دعوت‌ها',
  extraInviteDescription: 'آن را باز کنید و مشخصات کلاس را ببینید.',
  requestClassTitle: 'عنوان کلاس',
  codeSafety: 'کد را برای هیچ‌کس ارسال نکنید. ماکان هرگز آن را در گفتگو نمی‌خواهد.',
  independentLearningPending:
    'تکلیف و آزمون کلاس مستقل هنوز در دسترس نیست. زمان عرضه پس از تأیید نهایی اعلام می‌شود.',
  backToClass: 'بازگشت به کلاس',
  profileFinancialTitle: 'پروفایل و وضعیت اشتراک',
  profileSubscriptionTitle: 'اشتراک شما',
  requestDetails: 'درخواست تشکیل کلاس',
  requestSubject: 'موضوع',
  requestAudience: 'مخاطبان و پذیرش',
  requestManagement: 'مدیریت و مدرس',
  requestReview: 'بازبینی درخواست',
  requestNameHint: 'نام کوتاه و روشن انتخاب کنید.',
  requestNameRequiredHint: 'نام کلاس، الزامی',
  requestAudienceLabel: 'این کلاس برای چه کسانی است؟',
  requestCapacityHint: 'سقف نهایی تابع سیاست مصوب کلاس است.',
  requestMembershipWays: 'راه‌های عضویت',
  requestByInvitation: 'دعوت مدیر و پذیرش فرد',
  requestByJoin: 'درخواست پیوستن و بررسی مدیر',
  requestAttendanceRules: 'قواعد حضور',
  requestContinueManagement: 'ادامه: مدیریت و مدرس',
  requestContinueReview: 'مرور درخواست',
  requestManager: 'مدیر پیشنهادی',
  requestSelf: 'خودم · درخواست‌دهنده',
  requestManagerPolicy: 'مالک یا ادمین ماکان می‌تواند هنگام بررسی، مدیر نهایی دیگری تعیین کند.',
  requestTeacher: 'مدرس اختیاری',
  requestWithoutTeacher: 'فعلاً بدون مدرس',
  requestProposeTeacher: 'معرفی مدرس پیشنهادی',
  requestTeacherPolicy:
    'نبود مدرس مانع تشکیل نیست. دسترسی‌های آموزشی تابع اختیار معتبر همان کلاس است.',
  requestAcceptRules: 'قواعد مدیریت کلاس و حریم اعضا را خواندم و می‌پذیرم.',
  requestIndependence: 'کلاس مستقل از آموزشگاه است. ثبت فرم، هنوز به معنی تشکیل کلاس نیست.',
  requestDraftPolicy: 'پیش‌نویس هنگام پیشروی حفظ می‌شود.',
  requestSubmissionPolicy:
    'ثبت فرم، هنوز به معنی تشکیل کلاس نیست. نتیجه بررسی را در «درخواست‌های من» می‌بینید.',
  requestLocalFields: 'مخاطب و قواعد حضور فعلاً فقط در پیش‌نویس همین مرورگر نگه داشته می‌شوند.',
  preferenceOn: 'فعال',
  readingLargeHint: 'نمایش متن رابط با اندازهٔ ۲۰۰٪',
  readingMotionHint: 'کاهش پویانمایی‌های غیرضروری',
  preferenceOff: 'غیرفعال',
  memberDetails: 'نقش و عضویت',
  classMember: 'عضو کلاس',
  registeredTitle: 'عنوان ثبت‌شده',
  groupEditorTitle: 'نام گروه',
  channelEditorTitle: 'عنوان کانال',
  groupEditorDescription: 'توضیح',
  channelEditorDescription: 'شرح',
  saveGroupInfo: 'ذخیره اطلاعات گروه',
  saveChannelInfo: 'ذخیره اطلاعات کانال',
  groupInfoPolicy: 'ذخیره با نسخه فعلی اطلاعات گروه انجام می‌شود.',
  channelInfoPolicy: 'ذخیره با نسخه فعلی اطلاعات کانال انجام می‌شود.',
  groupPhoto: 'عکس گروه',
  channelPhoto: 'عکس کانال',
  conversationPhotoDescription: 'انتخاب، جایگزینی یا حذف',
  channelNotifications: 'اعلان کانال',
  channelNotificationsDescription: 'تنظیم مستقل از عضویت',
  myConversations: 'گفتگوهای من',
  conversationMembersDescription: 'نقش‌ها و اختیارها',
  groupMembersTitle: 'اعضای گروه',
  channelMembersTitle: 'اعضای کانال',
  groupMediaTitle: 'رسانه‌های گروه',
  channelMediaTitle: 'رسانه‌های کانال',
  groupSettingsTitle: 'تنظیمات گروه',
  channelSettingsTitle: 'تنظیمات کانال',
  memberNameOrId: 'نام یا شناسه عضو',
  memberName: 'نام عضو',
  noMatchingMembers: 'عضوی با این نام پیدا نشد',
  clearMemberSearch: 'پاک‌کردن جستجو',
  inviteLinksTitle: 'لینک‌های دعوت',
  inviteLinkActive: 'فعال',
  newInviteLinkTitle: 'لینک دعوت تازه',
  inviteLinkDeadline: 'اعتبار تا',
  inviteLinkMaximumUses: 'حداکثر استفاده',
  inviteLinkApproval: 'نیاز به تأیید مدیر',
  inviteLinkApprovalHint: 'ورود پس از بررسی درخواست',
  inviteLinkFormPolicy: 'مهلت اعتبار و سقف استفاده را مشخص کنید.',
  createInviteLink: 'ساخت لینک',
  inviteLinkInvalid: 'زمان اعتبار آینده و تعداد استفادهٔ معتبر را مشخص کنید.',
  inviteLinksPolicy:
    'کپی و اشتراک لینک با کنترل سیستم انجام می‌شود؛ کد خصوصی در فهرست عمومی نمایش داده نشود.',
  groupJoinRequestsTitle: 'درخواست‌های گروه',
  reviewJoinRequest: 'بررسی درخواست',
  joinReviewPolicy:
    'تصمیم شما برای عضویت در همین کلاس ثبت می‌شود. ظرفیت و دسترسی هنگام ثبت دوباره بررسی می‌شوند.',
  memberRoleFilter: 'نمایش اعضای گفتگو',
  allMembers: 'همه',
  conversationAdmins: 'مدیران',
  conversationAdmin: 'مدیر',
  conversationOwner: 'مالک',
  invitePerson: 'دعوت فرد',
  independentClassManager: 'مدیر کلاس مستقل',
  conversationMemberRoles: {
    Owner: 'مالک گفتگو',
    Admin: 'مدیر گفتگو',
    Member: 'عضو گفتگو',
  },
  memberPageSearchPolicy: 'جستجو و فیلتر روی اعضای همین صفحه اعمال می‌شود.',
  conversationMediaDescription: 'فایل‌های مجاز گفتگو',
  conversationInvites: 'لینک و درخواست‌ها',
  conversationInvitesDescription: 'ورودی‌های عضویت',
  conversationSettingsDescription: 'نمایش، تاریخچه و مجوز',
  joinRequestsDescription: 'افراد می‌توانند درخواست بدهند',
  archiveReason: 'دلیل بایگانی',
  classLifecyclePolicy: {
    activate: 'وضعیت فعلی کلاس و دلیل فعال‌سازی را پیش از ثبت بررسی کنید.',
    suspend: 'اثر توقف بر پذیرش عضو، نوشتن پیام و فعالیت آموزشی پیش از ثبت روشن می‌شود.',
    archive:
      'پذیرش و نوشتن تازه طبق سیاست بایگانی متوقف می‌شوند؛ سوابق مجاز حفظ می‌شوند و دسترسی عضو حذف‌شده برنمی‌گردد.',
  },
  memberNotOnPage: 'این عضو در صفحهٔ فعلی فهرست نیست؛ صفحهٔ فهرست را بررسی کنید.',
  courseCatalog: 'درس کاتالوگ',
  educationalPeriod: 'دوره آموزشی',
  reviewClass: 'بازبینی کلاس',
  activateClassAfterCreate: 'پس از ساخت، کلاس فعال شود.',
  teachingClasses: 'کلاس‌های تدریس',
  newSession: 'جلسه تازه',
  teachingDestinations: 'کلاس‌ها و کارهای مدرس',
  teacherNewAnswers: 'پاسخ تازه',
  teacherTodaySessions: 'جلسه امروز',
  learners: 'دانش‌آموز',
  classStatusFilter: 'وضعیت کلاس‌ها',
  teacherContent: 'کارهای محتوایی مدرس',
  assignTeacher: 'انتساب مدرس',
  chooseLearner: 'انتخاب دانش‌آموز',
  freeCapacity: 'ظرفیت آزاد',
  activeEnrollment: 'ثبت‌نام فعال',
  classLearners: 'دانش‌آموزان کلاس',
  classTeachers: 'مدرسان کلاس',
  classTeachersPrefix: 'مدرسان ',
  teacherAssignmentPolicy: 'داشتن نقش مدرس آموزشگاه به‌تنهایی، انتساب به همه کلاس‌ها نیست.',
  optionalSessionLink: 'پیوند جلسه اختیاری',
  classMemberTypes: 'نوع اعضای کلاس',
  createGroup: 'ساخت گروه',
  selectPeople: 'انتخاب افراد',
  creationDescription: 'شرح اختیاری',
  groupDescription: 'توضیح اختیاری',
  visibility: 'نمایش',
  classTitle: 'عنوان کلاس',
  course: 'درس',
  period: 'دوره',
  classMembersAndRoles: 'اعضا و نقش‌ها',
  inviteToClass: 'دعوت به کلاس',
  classHistory: 'سابقه کلاس',
  classSpaces: 'فضاهای کلاس',
  formationReady: 'کلاس آماده است',
  formationFailed: 'آماده‌سازی کامل نشد',
  formationProgress: 'آماده‌سازی کلاس',
  formationClass: 'کلاس ثبت شد',
  formationManager: 'پذیرش مدیریت',
  formationGroup: 'گروه کلاس',
  formationChannel: 'کانال کلاس',
  formationReadyDescription: 'کلاس و فضاهای گفتگو آماده‌اند.',
  formationFailedDescription: 'بخشی از آماده‌سازی کامل نشده است.',
  formationProgressDescription: 'کلاس و فضاهای گفتگو در حال آماده‌شدن‌اند.',
  formationTracking: 'می‌توانید از این صفحه خارج شوید؛ وضعیت از درخواست‌های من قابل پیگیری است.',
  openClass: 'ورود به کلاس',
  backToRequests: 'بازگشت به درخواست‌ها',
  trackPreparation: 'پیگیری آماده‌سازی',
  createChannel: 'ساخت کانال',
  creationContext: 'زمینه',
  personalContext: 'شخصی',
  staleData: 'اطلاعات تازه دریافت نشد. دادهٔ قبلی با زمان آخرین دریافت نمایش داده می‌شود.',
  lastSuccessfulRead: 'آخرین دریافت موفق: ',
  saveReading: 'ذخیره ترجیح محلی',
  readingPreview: 'پیش‌نمایش متن',
  readingPreviewText: 'این متن با تنظیم خوانایی شما نمایش داده می‌شود.',
  readingSaved: 'ترجیح خوانایی در این مرورگر ذخیره شد.',
  readingStorageError: 'مرورگر اجازهٔ ذخیرهٔ ترجیح خوانایی را نداد؛ تنظیم قبلی حفظ شده است.',
  timeZone: 'منطقه زمانی',
  tehranTimeZone: 'تهران',
  sessionTimeZoneHint: 'زمان جلسه با منطقهٔ زمانی همین دستگاه ثبت می‌شود.',
  contentSearch: 'جستجو در کارهای محتوایی',
  reviewSession: 'بازبینی جلسه',
  selectCatalogItem: 'انتخاب ',
  completeExamGradeTitle: 'تکمیل ارزیابی آزمون',
  completeExamGrade: 'تکمیل ارزیابی',
  completeExamGradeDescription:
    'تکمیل ارزیابی، انتشار نتیجه نیست؛ نتیجه تا اقدام انتشار خصوصی می‌ماند.',
  totalGrade: 'جمع نمره',
  libraryMetadata: 'اطلاعات کتابخانه',
  noTeacher: 'تعیین نشده',
  summaryUnavailable: 'اطلاعات دریافت نشده',
  conversations: 'گفتگوهای من',
  enrollments: 'ثبت‌نام',
  teachers: 'مدرس',
  manageClasses: 'مدیریت کلاس‌های آموزشگاه',
  context: 'در همین زمینه',
  active: 'فضای فعال',
  account: 'اطلاعات حساب',
  accountDescription: 'نام، شناسه و اطلاعات تماس',
  spaces: 'فضاها و نقش‌های من',
  spacesDescription: 'فضاهای مجاز و نقش فعال شما',
  sources: 'منابع من',
  sourcesDescription: 'فایل‌ها و آمادگی مطالعه',
  privacy: 'حریم خصوصی و امنیت',
  privacyDescription: 'ارتباط، دستگاه‌ها و نشست‌ها',
  settings: 'تنظیمات',
  appearance: 'ظاهر و خوانایی',
  appearanceDescription: 'تم، اندازهٔ متن و کاهش حرکت',
  notificationsDescription: 'دسته‌ها، دستگاه و سکوت',
  securityDescription: 'دستگاه‌ها و نشست‌های فعال',
  helpDescription: 'راهنما و پشتیبانی',
  inboxContext: 'گفتگوهای من',
  inboxDescription: 'همهٔ گفتگوهای مجاز حساب شما',
  savedProfile: 'ذخیره پروفایل',
  loginSubtitle: 'ورود و ثبت‌نام',
  codeDestination: 'پیامک به ',
  codeIntro: 'کد پیامک‌شده را وارد کنید.',
  welcomeTitle: 'شروع آشنا',
  profileSubtitle: 'حساب و ترجیحات شما',
  contextBackPolicy: 'بازگشت، انتخاب و فیلتر فعلی را حفظ می‌کند.',
  contextPagePolicy: 'اطلاعات و اقدام‌های همین مورد',
  appearanceProfile: 'اعلان و ظاهر',
  appearanceProfileDescription: 'روشن، تاریک یا مطابق دستگاه',
  accountSettingsDescription: 'نام، شناسه و عکس',
  communication: 'حریم ارتباط',
  communicationDescription: 'پیام، شماره و دعوت',
  appearanceSettingsDescription: 'تم و اندازه متن',
  security: 'امنیت و نشست‌ها',
  devicesDescription: 'دستگاه‌های فعال',
  billing: 'اشتراک و مصرف',
  billingDescription: 'پیش‌فاکتور و سفارش',
  systemDescription: 'انتخاب دستگاه را دنبال کن',
  lightDescription: 'سطح‌های روشن و آبی',
  darkDescription: 'سطح‌های تیره و آبی روشن',
  saveAppearance: 'ذخیره ظاهر',
  appearancePolicy: 'تغییر تم، جای پیمایش و ورودی ناتمام را حفظ می‌کند.',
};
export const v5Parent = {
  parentRole: 'والد',
  chooseChild: 'انتخاب',
  selected: 'انتخاب‌شده',
  activeRelation: 'رابطه فعال',
  endedRelation: 'رابطه پایان‌یافته',
  childScopePolicy: 'بالای همه گزارش‌ها، نام فرزند و آموزشگاه دیده می‌شود.',
  children: 'فرزندان من',
  program: 'برنامه',
  results: 'نتایج',
  assignments: 'تکلیف‌ها',
  exams: 'آزمون‌ها',
  resultTypes: 'نوع نتایج فرزند',
  upcoming: 'برنامه نزدیک',
  today: 'امروز',
  followUp: 'پیگیری آموزشی',
  attendance: 'حضور در جلسات',
  assignmentFollowUp: 'تکلیف‌های منتشرشده',
  publishedResults: 'نتایج منتشرشده',
  guardianRelation: 'دعوت و رابطه والد',
  presentOfTotal: (present: string, total: string) => `${present} حاضر از ${total} جلسه`,
  attendanceOfTotal: (present: string, total: string) => `${present} حضور از ${total} جلسه`,
  scoreOf: (score: string, maximum: string) => `نمره ${score} از ${maximum}`,
  minutes: (minutes: string) => `${minutes} دقیقه`,
  authorizedChildInfo: (name: string, school: string) =>
    `این نما مربوط به اطلاعات مجاز ${name} در ${school} است.`,
  recordedPresence: (present: string) => `${present} حضور ثبت‌شده`,
  availableActivities: (count: string) => `${count} فعالیت قابل پیگیری در این نما`,
  authorizedRelation: (name: string) => `رابطه تأییدشده با ${name}`,
  selectedChild: 'فرزند انتخاب‌شده',
  school: 'آموزشگاه',
  child: 'فرزند',
  noUpcomingSession: 'جلسه نزدیکی در این نما نیست',
  noPublishedResult: 'نتیجه منتشرشده‌ای در این نما نیست',
  releasedResult: 'نتیجه منتشرشده',
  unreleasedResult: 'نتیجه هنوز منتشر نشده',
  waiting: 'منتظر',
  resultPolicy: 'یادداشت خصوصی مدرس و نتیجه منتشرنشده نمایش داده نمی‌شوند.',
  changedAccess: 'دسترسی تغییر کرد',
  changedRelation: 'رابطه مجاز شما با این پرونده تغییر کرده است.',
  changedRelationPolicy:
    'داده تازه و فایل گزارش این فرزند دیگر باز نمی‌شود. می‌توانید به فهرست فرزندان برگردید.',
  backToChildren: 'بازگشت به فرزندان',
  childActivities: 'فعالیت‌های فرزند',
};
export const v5Notifications = {
  categoryTitle: (category: string) => `اعلان ${category}`,
  saveAssignments: 'ذخیره اعلان تکلیف',
  pushHint: 'پوش طبق مجوز دستگاه',
  smsHint: 'برای همین نوع اعلان',
  quietHours: 'ساعات سکوت',
  quietHint: 'در زمان منتخب مزاحم نشو',
  enabled: 'روشن',
  disabled: 'خاموش',
  tehran: 'تهران',
};
export const v5NotificationDevices = {
  title: 'اعلان این دستگاه',
  devices: 'دستگاه‌های اعلان',
  current: 'مرورگر فعلی',
  browser: 'مرورگر وب',
  android: 'دستگاه اندروید',
  ios: 'دستگاه iOS',
  account: (name: string | null) => (name ? `حساب شخصی · ${name}` : 'حساب شخصی'),
  status: 'وضعیت اعلان دستگاه',
  defaultPermission: 'اجازه نمایش اعلان هنوز داده نشده است.',
  denied: 'مرورگر اجازه اعلان نداده است.',
  deniedPolicy:
    'مرکز اعلان داخل برنامه همچنان قابل استفاده است. برای تغییر مجوز، راهنمای مرورگر خود را ببینید.',
  permissionPolicy: 'درخواست مجوز سیستم پس از اقدام روشن کاربر باز می‌شود.',
  enable: 'فعال‌کردن اعلان دستگاه',
  guide: 'دیدن راهنمای مجوز',
  guideTitle: 'راهنمای مجوز دستگاه',
  guideIntro: 'مجوز اعلان ماکان را در تنظیمات همین مرورگر بررسی کنید و سپس به این صفحه برگردید.',
  chrome:
    'Chrome: تنظیمات ← حریم خصوصی و امنیت ← تنظیمات سایت ← اعلان‌ها؛ اجازهٔ ماکان را بررسی کنید.',
  firefox:
    'Firefox: تنظیمات ← حریم خصوصی و امنیت ← مجوزها ← تنظیمات اعلان‌ها؛ وضعیت ماکان را بررسی کنید.',
  safari: 'Safari در Mac: تنظیمات ← وب‌سایت‌ها ← اعلان‌ها؛ اجازهٔ ماکان را بررسی کنید.',
  chromeHelp: 'راهنمای رسمی Chrome',
  firefoxHelp: 'راهنمای رسمی Firefox',
  safariHelp: 'راهنمای رسمی Safari در Mac',
  unsupported: 'ثبت اعلان وب در این مرورگر در دسترس نیست.',
  preparing: 'آماده‌سازی مرورگر برای اعلان…',
  granted: 'اجازهٔ مرورگر داده شده است؛ ثبت این دستگاه هنوز تأیید نشده است.',
  registered: 'ثبت اعلان همین مرورگر تأیید شد.',
  webRegistered: 'ثبت‌شده برای پوش وب',
  deviceRegistered: 'ثبت‌شده برای اعلان',
  active: 'فعال',
  inactive: 'غیرفعال',
  refresh: 'بازخوانی وضعیت دستگاه',
  storage: 'مرورگر اجازهٔ نگه‌داری وضعیت ثبت را نداد. وضعیت دستگاه را دوباره بررسی کنید.',
  key: 'تنظیمات اعلان این مرورگر با سرویس هماهنگ نیست. راهنمای مجوز را بررسی کنید.',
  subscription: 'اطلاعات اعلان این مرورگر آماده نشد. وضعیت دستگاه را دوباره بررسی کنید.',
  unconfirmed: 'ثبت فعال همین مرورگر هنوز تأیید نشده است. وضعیت دستگاه را دوباره بخوانید.',
  serviceUnavailable: vnext.pushUnavailable,
  uncertain:
    'پاسخ قطعی ثبت دریافت نشد. برای جلوگیری از ثبت تکراری، ابتدا وضعیت دستگاه‌ها را بررسی کنید.',
  unknownRegistration:
    'این مرورگر هنوز به یک ثبت تأییدشده وصل نشده است. در صورت باقی‌ماندن ابهام، از پشتیبانی کمک بگیرید.',
  deleteTitle: 'حذف مقصد اعلان؟',
  deletePolicy: 'این دستگاه دیگر اعلان تازه دریافت نمی‌کند. نشست ورود آن جداگانه مدیریت می‌شود.',
  destination: 'مقصد',
  delete: 'حذف ثبت اعلان',
  removed: 'ثبت اعلان حذف شد.',
  empty: 'دستگاه اعلان ثبت‌شده‌ای ندارید.',
  emptyPage: 'در این صفحه دستگاهی نیست.',
  listPolicy: 'ثبت مقصد اعلان با نشست ورود تفاوت دارد؛ حذف یکی، دیگری را خودکار پایان نمی‌دهد.',
  changed: 'وضعیت این دستگاه تغییر کرده است. اطلاعات تازه را بررسی کنید.',
  noLongerActive: 'این ثبت اکنون فعال نیست.',
  lastSeen: 'آخرین فعالیت',
  created: 'زمان ثبت',
  preferenceTitle: 'اعلان؛ تفاوت ترجیح حساب و مجوز دستگاه',
  permissionOff: 'مجوز مرورگر خاموش است.',
  accountOn: 'ترجیح حساب روشن است',
  accountOff: 'ترجیح حساب خاموش است',
  bothNeeded: 'با روشن‌بودن ترجیح حساب، مجوز دستگاه هم برای نمایش اعلان لازم است.',
  preferences: 'ترجیح حساب و مجوز دستگاه',
  reviewPreference: 'بازخوانی ترجیح حساب',
};
export const timeInput = {
  tehran: v5Notifications.tehran,
  invalidTime: 'ساعت باید از ۰۰ تا ۲۳ و دقیقه از ۰۰ تا ۵۹ باشد.',
  timeFormatHint: 'زمان را با ساعت ۲۴ ساعته و دقیقه وارد کنید.',
};
export const v5ScheduleRules = {
  details: 'قاعده برنامه',
  range: 'بازه اجرای برنامه',
  next: 'ادامه بازه زمانی',
  create: 'ساخت قاعده برنامه',
  reviewChange: 'بررسی تغییر قاعده',
  change: 'اعمال تغییر از چه روزی؟',
  saveChange: 'ثبت تغییر قاعده',
  day: 'روز هفته',
  time: 'شروع محلی',
  duration: 'مدت',
  durationUnit: 'دقیقه',
  zone: 'منطقه زمانی',
  title: 'عنوان جلسه',
  link: 'پیوند اختیاری',
  inPerson: 'جلسه حضوری',
  zoneNote: 'قاعده، زمان محلی و منطقه زمانی را با هم نگه می‌دارد.',
  reviewed: 'بازه و روز هفته را بازبینی کردم.',
  apply: 'تاریخ اعمال',
  beforeTime: 'شروع قبلی',
  afterTime: 'شروع تازه',
  changeNote: 'تاریخ اعمال را انتخاب کنید. نتیجهٔ به‌روزرسانی پس از ثبت نمایش داده می‌شود.',
  applyInvalid: 'تاریخ اعمال باید داخل بازهٔ برنامه باشد.',
};
export const v5Lessons = {
  create: 'درس تازه',
  edit: 'ویرایش پیش‌نویس',
  title: 'عنوان درس',
  body: 'متن درس',
  editTitle: 'عنوان',
  editBody: 'متن',
  order: 'ترتیب نمایش',
  invalidOrder: 'ترتیب نمایش باید عدد صحیح نامنفی و در محدودهٔ مجاز باشد.',
  addAttachment: 'افزودن پیوست درس',
  fileHint: 'فایل مجاز را از دستگاه انتخاب کنید.',
  save: 'ذخیره پیش‌نویس',
  review: 'بازبینی انتشار',
  draft: 'پیش‌نویس',
  draftPolicy: 'پیش‌نویس برای دانش‌آموز قابل مشاهده نیست.',
  publishTitle: 'انتشار درس؟',
  publish: 'انتشار درس',
  reviewed: 'متن و پیوست را بررسی کردم.',
  sequence: 'ترتیب',
  lessonSequence: (value: string) => `درس ${value}`,
  attachment: 'پیوست',
  noAttachments: 'پیوستی ندارد',
  readyFiles: (value: string) => `${value} فایل آماده`,
  authorizedMembers: (value: string) => `${value} عضو مجاز`,
  filesUnavailable: 'یک یا چند پیوست آمادهٔ انتشار نیست. برای اصلاح، به ویرایش پیش‌نویس برگردید.',
};
export const v5ClassMembers = {
  membersTitle: 'اعضای کلاس',
  teaching: 'مسئولیت مدرس',
  teachingMember: (name: string) => `${name} · مدرس همین کلاس`,
  noTeacherResponsibility: 'مسئولیت تدریس فعالی برای این عضو ثبت نشده است.',
  info: 'مشخصات و وضعیت',
  infoHint: 'اطلاعات همین مورد',
  related: 'فعالیت‌های مرتبط',
  relatedHint: 'فقط موارد مجاز',
  roles: 'نقش محلی',
  roleTitle: (name: string) => `نقش ${name} در کلاس`,
  permissionsTitle: (name: string) => `اختیار آموزش ${name}`,
  summaryTitle: 'نقش‌های همین عضو',
  dualTitle: 'یک حساب با دو نقش محلی',
  localMember: 'عضو همین کلاس',
  learner: 'عضو آموزشی',
  learnerHint: 'فعالیت آموزشی در همین کلاس',
  teacher: 'مدرس',
  teacherHint: 'نقش محلی کلاس',
  manager: 'مدیر کلاس',
  managerHint: 'نقش محلی؛ انتقال مدیریت جداست.',
  saveRoles: 'ذخیره نقش محلی',
  reason: 'دلیل تغییر',
  reasonRequired: 'دلیل را بنویسید.',
  permissionReason: 'دلیل',
  reviewPermissions: 'مرور اختیارها',
  assignment: 'ساخت و انتشار تکلیف',
  exam: 'طراحی و انتشار آزمون',
  grade: 'ارزیابی پاسخ‌ها',
  classOnly: 'فقط در همین کلاس',
  privateAnswers: 'دسترسی به پاسخ مجاز اعضا',
  savePermissions: 'ثبت اختیار آموزشی',
  rolePolicy: 'نام نقش سراسری، جای اختیار محلی این کلاس را نمی‌گیرد.',
  changed: 'اطلاعات این عضو تغییر کرده است. نسخهٔ تازه را بررسی کنید.',
  reviewLatest: 'بررسی اطلاعات تازه',
  refresh: 'دریافت تازه اطلاعات',
  end: 'پایان عضویت',
  endTitle: (name: string) => `پایان عضویت ${name}؟`,
  endPolicy:
    'دسترسی تازه به کلاس، گروه، کانال و فایل مرتبط لغو می‌شود. پاسخ‌های پذیرفته‌شده و سابقه مجاز باقی می‌مانند.',
  revoke: 'لغو اختیار ارزیابی',
  revokeAction: 'ثبت لغو اختیار',
  revokePolicy:
    'دسترسی تازه به پاسخ و فایل خصوصی اعضا برای این اختیار بسته می‌شود. سوابق ثبت‌شده با نام ارزیاب حفظ می‌شوند.',
  endTeacher: 'پایان مسئولیت مدرس',
  teacherTitle: 'مدرس اختیاری و پایان مسئولیت تدریس',
  teacherPolicy: 'کلاس می‌تواند بدون مدرس ادامه یابد؛ اختیارهای آموزشی باید جداگانه مرور شوند.',
  currentTeacher: 'مدرس فعلی',
  responsibleManager: 'مدیر مسئول',
  ended: 'عضویت این حساب پایان یافته است.',
  endedAt: 'زمان پایان عضویت',
  joinedAt: 'زمان پیوستن',
  noEffectivePermissions: 'اختیار آموزشی فعالی برای این عضو ثبت نشده است.',
  searchPolicy: 'جستجو فقط در اعضای همین کلاس انجام می‌شود.',
  searchHint: 'املای نام را بررسی کنید یا جستجو را پاک کنید.',
  emptyPage: 'در این صفحه عضوی نیست.',
};

export const aiIntegration = {
  context: 'انتخاب زمینه دستیار',
  unavailableTitle: 'دستیار در دسترس نیست',
  done: 'تأیید انتخاب',
  tools: 'ابزارهای آموزشی دستیار',
  operation: 'نوع کمک',
  operations: {
    chat: 'گفتگو با دستیار',
    analysis: 'تحلیل وضعیت یادگیری',
    plan: 'برنامهٔ مطالعه',
    homework: 'راهنمای تکلیف',
    exam: 'آمادگی آزمون',
    child: 'خلاصهٔ وضعیت فرزند',
    teacherClass: 'خلاصهٔ کلاس',
    activities: 'پیشنهاد فعالیت آموزشی',
    school: 'خلاصهٔ آموزشگاه',
    managerClass: 'بررسی وضعیت کلاس',
  },
  payer: 'محل مصرف اعتبار',
  choosePayer: 'انتخاب محل مصرف',
  payers: {
    Organization: 'اعتبار آموزشگاه',
    Individual: 'اعتبار شخصی',
    FreeTrial: 'اعتبار آزمایشی',
  },
  payerRequired: 'محل مصرف اعتبار را انتخاب کنید.',
  payerPolicy: 'درخواست با همین انتخاب بررسی می‌شود؛ اعتبار دیگری خودکار جایگزین نمی‌شود.',
  send: 'دریافت پاسخ',
  sending: 'در حال دریافت پاسخ…',
  retry: 'تلاش دوبارهٔ همین درخواست',
  newRequest: 'ویرایش و درخواست تازه',
  editQuestion: 'بازگشت و ویرایش پرسش',
  credit: 'بررسی اعتبار',
  checkingCredit: 'در حال بررسی اعتبار این انتخاب…',
  creditRemaining: 'درخواست باقی‌مانده برای این انتخاب:',
  creditAvailable: 'اعتبار این انتخاب برای درخواست بررسی شد.',
  creditCheckFailed: 'وضعیت اعتبار دریافت نشد. دوباره بررسی کنید.',
  refreshCredit: 'بررسی دوبارهٔ اعتبار',
  quotaExceeded:
    'سهمیهٔ این خدمت تمام شده است. اعتبار یا اشتراک انتخاب‌شده را بررسی کنید؛ نوشتهٔ شما حفظ شده است.',
  savedQuestion: 'پرسش حفظ شده',
  changeRequest:
    'با ویرایش، پیگیری درخواست قبلی کنار گذاشته می‌شود؛ ارسال تازه فقط با انتخاب شما انجام می‌شود.',
  uncertain: 'پاسخ تأییدشده‌ای دریافت نشد. درخواست قبلی برای پیگیری حفظ شده است.',
  wait: 'برای تلاش دوباره، زمان اعلام‌شدهٔ سرویس را رعایت کنید.',
  question: 'سؤال شما',
  goals: 'هدف‌های مطالعه؛ هر هدف در یک سطر',
  minutes: 'زمان در دسترس، به دقیقه',
  notes: 'توضیح تکمیلی',
  objective: 'هدف فعالیت',
  materials: 'وسایل در دسترس؛ هر مورد در یک سطر',
  class: 'کلاس',
  chooseClass: 'انتخاب کلاس',
  assignment: 'تکلیف',
  chooseAssignment: 'انتخاب تکلیف',
  exam: 'آزمون',
  chooseExam: 'انتخاب آزمون',
  resourceRequired: 'مورد آموزشی را از فهرست مجاز انتخاب کنید.',
  childRequired: 'ابتدا فرزند خود را انتخاب کنید.',
  result: 'پاسخ دستیار',
  reviewAnswer: 'پاسخ قابل بازبینی',
  subscriptionInactive:
    'اشتراک محل مصرف اعتبار انتخاب‌شده فعال نیست. وضعیت همان اشتراک را بررسی کنید.',
  contextNotAllowed: 'دستیار در این فضای حساب مجاز نیست. فضاهای مجاز خود را بررسی کنید.',
  recommendations: 'پیشنهادها',
  strengths: 'نقاط قوت',
  risks: 'موارد نیازمند توجه',
  steps: 'گام‌ها',
  hints: 'راهنمایی‌ها',
  priorities: 'اولویت‌ها',
  planItems: 'برنامهٔ پیشنهادی',
  activities: 'فعالیت‌های پیشنهادی',
  attention: 'نیازمند توجه',
  upcoming: 'پیش رو',
  sources: 'منابع پاسخ',
  empty: 'محتوای مرتبطی پیدا نشد.',
  insufficient: 'شواهد کافی برای پاسخ مستند پیدا نشد.',
  page: 'صفحه',
  version: 'نسخه',
  retrieval: 'جستجو در منابع',
  answer: 'پاسخ با استناد به منابع',
  mode: 'روش پاسخ',
  privacy: 'پاسخ در همین فضای حساب نمایش داده می‌شود. دسترسی منابع هنگام هر درخواست بررسی می‌شود.',
  serviceUnavailable: 'دستیار در حال حاضر در این سرویس در دسترس نیست. نوشتهٔ شما حفظ شده است.',
  citationInvalid: 'استناد پاسخ با منابع انتخاب‌شده تطبیق ندارد؛ پاسخ نمایش داده نشد.',
  quota: 'اعتبار لازم برای این درخواست در دسترس نیست.',
  knowledge: 'آماده‌سازی منبع برای دستیار',
  status: 'وضعیت آماده‌سازی',
  reason: 'دلیل اقدام روی منبع',
  ingest: 'آماده‌سازی این نسخه',
  reindex: 'آماده‌سازی دوباره',
  supersede: 'کنارگذاشتن این نسخه',
  delete: 'حذف از جستجوی دستیار',
  confirmLifecycle: 'این اقدام فقط روی همین نسخهٔ منبع انجام شود؟',
  refresh: 'بررسی وضعیت منبع',
  reviewVersion: 'اطلاعات منبع تغییر کرده است. ابتدا نسخهٔ تازه را بررسی کنید.',
  adoptVersion: 'بررسی نسخهٔ تازه',
  lifecycleAccepted: 'پاسخ اقدام دریافت شد؛ وضعیت آماده‌سازی را بررسی کنید.',
  knowledgeStates: {
    NotIngested: 'آماده‌سازی شروع نشده',
    Queued: 'در صف آماده‌سازی',
    Extracting: 'در حال خواندن فایل',
    OCR: 'در حال خواندن تصویر',
    Normalizing: 'در حال آماده‌سازی متن',
    Chunking: 'در حال بخش‌بندی',
    Embedding: 'در حال پردازش',
    Indexing: 'در حال نمایه‌سازی',
    Ready: 'آماده',
    ExtractFailed: 'خواندن فایل انجام نشد',
    OcrFailed: 'خواندن تصویر انجام نشد',
    ChunkFailed: 'بخش‌بندی انجام نشد',
    EmbeddingFailed: 'پردازش انجام نشد',
    IndexFailed: 'نمایه‌سازی انجام نشد',
    Superseded: 'کنارگذاشته‌شده',
    Deleted: 'از جستجو حذف شده',
    ReindexRequired: 'نیازمند آماده‌سازی دوباره',
  },
};
export const sourceWorkspace = {
  contentHint: 'مطالعهٔ منبع مجاز',
  versionHint: 'برای صاحب یا نقش مجاز',
  visibilityHint: 'محدودهٔ دسترسی',
};
export const paymentCopy = {
  retryOrder: 'پیگیری ثبت سفارش قبلی',
  title: 'وضعیت پرداخت',
  orders: 'سوابق سفارش‌ها',
  order: 'سفارش',
  amount: 'مبلغ سفارش',
  attempt: 'تلاش پرداخت',
  start: 'شروع پرداخت',
  startTitle: 'ادامهٔ پرداخت سفارش',
  startDescription:
    'پرداخت برای همین سفارش آغاز می‌شود. پس از بازگشت، نتیجه از سرور بررسی خواهد شد.',
  retryStart: 'پیگیری شروع پرداخت قبلی',
  openGateway: 'ادامه در درگاه زیبال',
  recover: 'پیگیری نتیجهٔ پرداخت',
  refresh: 'به‌روزرسانی وضعیت پرداخت',
  receipt: 'مشاهدهٔ رسید پرداخت',
  receiptTitle: 'رسید پرداخت',
  unavailable:
    'درگاه پرداخت فعلاً در دسترس نیست. پس از فعال شدن درگاه می‌توانید همین سفارش را ادامه دهید.',
  quoteRequired: 'برای شروع پرداخت، پلن همین سفارش را انتخاب و برآورد تازهٔ هزینه را دریافت کنید.',
  uncertain: 'نتیجهٔ شروع پرداخت هنوز مشخص نیست. پیگیری را برای همین سفارش ادامه دهید.',
  paid: 'پرداخت سفارش تأیید شده است.',
  orderPending: 'سفارش در انتظار پرداخت است.',
  cancelled: 'سفارش لغو شده است.',
  verificationPending: 'نتیجهٔ پرداخت هنوز قطعی نیست. برای همین پرداخت پیگیری کنید.',
  mismatch: 'پرداخت تأیید نشده است. نتیجه نیاز به بررسی دارد؛ پرداخت تازه‌ای شروع نکنید.',
  failed: 'این پرداخت ناموفق بوده است.',
  storageUnavailable:
    'امکان حفظ درخواست پرداخت وجود ندارد. تنظیمات ذخیره‌سازی مرورگر را بررسی کنید.',
  returned: 'برای نمایش نتیجه، وضعیت پرداخت از سرور خوانده می‌شود.',
  providerReference: 'شناسهٔ پیگیری درگاه',
  settlementReference: 'شمارهٔ مرجع پرداخت',
  paidAt: 'زمان پرداخت',
  notStarted: 'هنوز پرداختی آغاز نشده است.',
  statuses: {
    Created: 'در حال آماده‌سازی پرداخت',
    Initiating: 'در حال شروع پرداخت',
    PendingVerification: 'در انتظار بررسی پرداخت',
    Unknown: 'نتیجهٔ پرداخت نامشخص است',
    Failed: 'پرداخت ناموفق',
    Succeeded: 'پرداخت موفق',
  },
  fulfillment: {
    NotStarted: 'فعال‌سازی هنوز آغاز نشده است.',
    SubscriptionActivationPending:
      'پرداخت انجام شده؛ فعال‌سازی اشتراک در حال انجام است. پرداخت دوباره لازم نیست.',
    SubscriptionActivated: 'اشتراک فعال شده است.',
    ProvisioningPending: 'پرداخت انجام شده؛ آماده‌سازی آموزشگاه در حال انجام است.',
  },
} as const;

export const serverAlignedUi = {
  activeWorkspace: 'فضای فعال',
  role: 'نقش',
  newSchoolContent: 'محتوای تازه',
  schoolMembers: 'افراد و عضویت‌ها',
  schoolMembersDescription: 'نقش، دعوت و روابط والد و دانش‌آموز',
  schoolStructure: 'دوره، درس و کلاس',
  schoolStructureDescription: 'ساختار آموزشی سازمان',
  schoolCapacity: 'ظرفیت و اشتراک',
  schoolCapacityDescription: 'مصرف و ظرفیت مصوب',
  phonePlaceholder: '۰۹۱۲ ۱۲۳ ۴۵۶۷',
  otpPlaceholder: '— — — — — —',
  loginTitle: 'ورود به ماکان',
  loginPhoneHeading: 'با شماره همراه وارد شوید',
  todayTitle: 'امروز من',
  teacherDashboard: 'داشبورد معلم',
  managerDashboard: 'داشبورد مدیر آموزشگاه',
  childDashboard: 'نمای آموزشی فرزند',
  schoolGreeting: (name: string) => `سلام ${name}`,
  dayIntro: 'برنامه و کارهای پیش روی شما',
  teacherDay: 'آموزش امروز شما',
  teacherDayIntro: 'جلسه‌ها، پاسخ‌های در انتظار و محتوای کلاس‌ها در یک نگاه.',
  activeClasses: 'کلاس فعال',
  pendingAssignments: 'تکلیف پیش رو',
  upcomingExams: 'آزمون پیش رو',
  recordedAttendance: 'حضور ثبت‌شده',
  upcomingSessions: 'جلسه پیش رو',
  pendingAssessments: 'پاسخ در انتظار ارزیابی',
  pendingExamAssessments: 'آزمون در انتظار ارزیابی',
  pendingInvitations: 'دعوت در انتظار',
  chooseConversation: 'یک گفتگو را انتخاب کنید',
  assistantTitle: 'دستیار یادگیری',
  addSource: 'افزودن منبع',
  assistantStart: 'امروز روی چه چیزی کار کنیم؟',
  assistantIntro: 'یک پرسش روشن بنویسید یا یکی از منابع مجاز خود را انتخاب کنید.',
  profileTitle: 'پروفایل من',
  accountServices: 'حساب و خدمات',
  preferences: 'ترجیحات',
  planUsage: 'پلن و مصرف من',
  planDescription: 'پلن فعال و اعتبار باقی‌مانده',
  payments: 'پرداخت‌های من',
  paymentsDescription: 'وضعیت، رسید و پیگیری',
  helpInstall: 'راهنما و نصب برنامه',
  helpInstallDescription: 'روش نصب روی دستگاه و پاسخ به پرسش‌ها',
  independentClasses: 'کلاس‌های مستقل من',
  classRequest: 'درخواست تشکیل کلاس',
  followMembership: 'پیگیری و عضویت',
  titleCounterLimit: ' / ۲۰۰',
  purposeCounterLimit: ' / ۲۰۰۰',
  descriptionCounterLimit: ' / ۴۰۰۰',
  requestSpecifications: 'مشخصات و ظرفیت',
  requestReview: 'مرور و ارسال',
  requestFormTitle: 'درخواست شما',
  requestPurpose: 'هدف کلاس',
  requestPurposeHint: 'هدف و مخاطب کلاس را توضیح دهید.',
  requestDescription: 'توضیحات تکمیلی',
  requestDescriptionHint: 'اختیاری؛ جزئیات برنامه و نیازها',
  requestTitleHint: 'نام روشن و قابل تشخیص',
  requestManager: 'مدیر پیشنهادی',
  requestManagerHint: 'پیش‌فرض شما هستید؛ تصمیم نهایی با مدیریت است.',
  requestTeacher: 'مدرس پیشنهادی',
  requestBeforeSend: 'پیش از ارسال',
  requestNameError: 'نام کلاس را بنویسید؛ حداکثر ۲۰۰ نویسه.',
  requestPurposeError: 'هدف کلاس را بنویسید؛ حداکثر ۲۰۰۰ نویسه.',
  requestDescriptionError: 'توضیح تکمیلی نباید بیشتر از ۴۰۰۰ نویسه باشد.',
};
