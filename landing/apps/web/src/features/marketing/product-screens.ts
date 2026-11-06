const screen = (name: string, title: string) => ({
  title,
  image: {
    src: `/images/product/${name}.webp`,
    alt: title,
    width: 600,
    height: 1283,
  },
});

/** Phone frames extracted from the supplied Makan design PDF. */
export const productScreens = {
  school: [
    screen("school-today", "آموزشگاه؛ برنامهٔ امروز و فعالیت‌های من"),
    screen("school-lesson", "آموزشگاه؛ مطالعهٔ درس و منابع آموزشی"),
  ],
  activities: [
    screen("activities-classes", "فوق‌برنامه؛ کلاس‌های من، گروه و کانال کلاس"),
    screen("activities-requests", "فوق‌برنامه؛ درخواست تشکیل کلاس و پیگیری آن"),
  ],
  assistant: [
    screen("assistant-start", "دستیار؛ شروع گفت‌وگو با منابع انتخاب‌شده"),
    screen("assistant-answer", "دستیار؛ پاسخ به سؤال و بازگشت به منبع"),
  ],
  messages: [
    screen("messages-inbox", "پیام‌ها؛ صندوق یکپارچهٔ گفت‌وگوها"),
    screen("messages-chat", "پیام‌ها؛ گفت‌وگوی شخصی و ارسال پیوست"),
  ],
  profile: [
    screen("profile-account", "پروفایل؛ حساب، فضاها و نقش‌های من"),
    screen("profile-security", "پروفایل؛ امنیت حساب و نشست‌های فعال"),
  ],
};
