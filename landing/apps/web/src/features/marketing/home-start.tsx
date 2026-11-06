import { ArrowLeft, LogIn, Layers3, BookOpen } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AppEntryLink } from "@/components/marketing/app-entry-link";
import { SourceLink as Link } from "@/features/leads/source-link";
import type { CmsSection } from "@/features/cms/types";

export function HomeStart({ section }: { section: CmsSection }) {
  const steps = [
    {
      icon: LogIn,
      title: "وارد حساب خود شوید",
      text: "با شمارهٔ همراه و کد تأیید وارد شوید و پروفایل خود را کامل کنید.",
    },
    {
      icon: Layers3,
      title: "مسیر خودتان را انتخاب کنید",
      text: "دعوت آموزشگاه را بپذیرید، به یک کلاس مستقل بپیوندید یا از پیام‌ها و دستیار شروع کنید.",
    },
    {
      icon: BookOpen,
      title: "یادگیری و ارتباط را آغاز کنید",
      text: "برنامه و فعالیت‌ها را دنبال کنید، گفت‌وگو کنید و با منابع خودتان مطالعه کنید.",
    },
  ];
  return (
    <section
      className="makan-home-start"
      id="home-start"
      data-section="start"
      aria-labelledby="home-start-title"
    >
      <Container>
        <p className="makan-editorial-kicker">آمادهٔ شروع هستید؟</p>
        <h2 id="home-start-title">{section.title}</h2>
        <p className="makan-home-start-summary">{section.description}</p>
        <ol className="makan-home-start-steps">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <span>
                <Icon size={22} aria-hidden="true" />{" "}
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="makan-home-start-actions">
          <AppEntryLink className="premium-button premium-button-blue">
            ورود به اپلیکیشن <ArrowLeft aria-hidden="true" />
          </AppEntryLink>
          <Link href="/demo" className="makan-editorial-link">
            برای راه‌اندازی مدرسه، درخواست دمو بدهید{" "}
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
