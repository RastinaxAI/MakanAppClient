import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  ChevronLeft,
  Heart,
  Sprout,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SourceLink as Link } from "@/features/leads/source-link";
import { makanStory } from "@/features/marketing/makan-story";
import { getSeoStatus, getSettings } from "@/lib/public-api";

export async function generateMetadata(): Promise<Metadata> {
  const [status, settings] = await Promise.all([getSeoStatus(), getSettings()]);
  const url = status.origin
    ? new URL(makanStory.href, status.origin).href
    : undefined;
  const images = status.origin
    ? [
        {
          url: new URL(makanStory.image, status.origin).href,
          width: makanStory.imageWidth,
          height: makanStory.imageHeight,
          alt: makanStory.imageAlt,
        },
      ]
    : undefined;
  return {
    title: { absolute: `${makanStory.title} | ${settings.general.brand_name}` },
    description: makanStory.description,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: status.enabled, follow: true },
    openGraph: {
      title: makanStory.title,
      description: makanStory.description,
      type: "website",
      locale: "fa_IR",
      siteName: settings.general.brand_name,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: makanStory.title,
      description: makanStory.description,
      images,
    },
  };
}

const commitments = [
  {
    icon: BookOpen,
    number: "۰۱",
    title: "برای یادگیری",
    description:
      "کمک کنیم مسیر درس و تمرین روشن‌تر شود و دانش‌آموز فرصت بیشتری برای فهمیدن و رشد داشته باشد.",
  },
  {
    icon: Users,
    number: "۰۲",
    title: "برای همراهی",
    description:
      "فاصلهٔ میان مدرسه، معلم و خانواده را کمتر کنیم تا دانش‌آموز در مسیر یادگیری احساس تنهایی نکند.",
  },
  {
    icon: Heart,
    number: "۰۳",
    title: "برای فردا",
    description:
      "یاد ماکان را در توجه به نیاز واقعی دانش‌آموزان زنده نگه داریم؛ با قدم‌های کوچک، پیوسته و مسئولانه.",
  },
];

export default function MakanNasiriPage() {
  return (
    <article className="makan-memorial-page">
      <Container>
        <nav className="makan-story-breadcrumb" aria-label="مسیر صفحه">
          <Link href="/">خانه</Link>
          <ChevronLeft size={14} aria-hidden="true" />
          <span aria-current="page">به یاد ماکان</span>
        </nav>
        <div className="makan-memorial-hero">
          <div className="makan-memorial-intro">
            <p className="makan-editorial-kicker">
              <Sprout size={19} aria-hidden="true" /> روایتی از چراییِ ماکان
            </p>
            <h1>
              به نام ماکان،
              <br />
              <span>
                برای فردای
                <br className="makan-memorial-linebreak" /> دانش‌آموزان.
              </span>
            </h1>
            <p className="makan-memorial-deck">
              گاهی یک نام، دلیل شروع یک مسیر می‌شود.
            </p>
            <p>
              برای ما، «ماکان» چنین نامی است. یاد ماکان نصیری و دغدغهٔ کمک به
              دانش‌آموزان، جرقهٔ ساختن این برنامه شد؛ انگیزه‌ای برای اینکه سهمی
              در بهترشدن تجربهٔ یادگیری داشته باشیم.
            </p>
            <a href="#our-beginning" className="makan-editorial-link">
              داستان آغاز ما <ArrowLeft size={19} aria-hidden="true" />
            </a>
            <div className="makan-memorial-dedication">
              <Heart size={18} aria-hidden="true" />
              <span>
                به یاد ماکان نصیری
                <br />
                <small>و همهٔ کودکانی که رؤیای یادگرفتن داشتند.</small>
              </span>
            </div>
          </div>
          <figure className="makan-memorial-image">
            <Image
              src={makanStory.image}
              alt={makanStory.imageAlt}
              width={makanStory.imageWidth}
              height={makanStory.imageHeight}
              sizes="(min-width: 1200px) 540px, (min-width: 768px) 46vw, 90vw"
              preload
            />
            <figcaption>
              ماکان نصیری <span>نامی که در مسیر ما ماند.</span>
            </figcaption>
          </figure>
        </div>
      </Container>
      <section
        className="makan-memorial-biography"
        aria-labelledby="makan-biography-title"
      >
        <Container className="makan-memorial-reading-layout">
          <div>
            <p className="makan-editorial-kicker">یاد یک دانش‌آموز</p>
            <h2 id="makan-biography-title">
              ماکان نصیری
              <br />
              که بود؟
            </h2>
          </div>
          <div className="makan-memorial-prose">
            <p>
              ماکان نصیری، دانش‌آموز هفت‌سالهٔ کلاس اول دبستان شجرهٔ طیبه در
              میناب بود. او در ۹ اسفند ۱۴۰۴، در حملهٔ هوایی به مدرسه‌اش جان
              باخت.
            </p>
            <p>
              در این صفحه، یاد او را با توجه به دنیای کودکان گرامی می‌داریم؛
              دنیایی که باید در آن فرصت آموختن، دوستی و ساختن آینده وجود داشته
              باشد.
            </p>
            <a
              className="makan-memorial-source"
              href={makanStory.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              منبع زندگی‌نامه: ویکی‌پدیای فارسی{" "}
              <ArrowUpLeft size={16} aria-hidden="true" />
              <span className="sr-only"> (در برگهٔ جدید)</span>
            </a>
          </div>
        </Container>
      </section>
      <section
        className="makan-memorial-beginning"
        id="our-beginning"
        aria-labelledby="makan-beginning-title"
      >
        <Container className="makan-memorial-reading-layout">
          <div>
            <p className="makan-editorial-kicker">
              <Sprout size={18} aria-hidden="true" /> روایت تیم ماکان
            </p>
            <h2 id="makan-beginning-title">
              از یک یاد،
              <br />
              به یک قدم.
            </h2>
          </div>
          <div className="makan-memorial-prose">
            <p>
              ایدهٔ اصلی ماکان از یاد ماکان نصیری و خواست کمک به دانش‌آموزان
              ساخته شد. همین انگیزه ما را وارد مسیر ساخت این برنامه کرد. یاد او
              برایمان راهنما شد تا هر بار به یک پرسش برگردیم: چطور می‌توانیم
              همراه بهتری برای دانش‌آموزان باشیم؟
            </p>
            <p>
              پاسخ ما، تلاش برای نزدیک‌ترکردن آدم‌های دنیای آموزش است؛ فضایی که
              مدرسه و معلم بتوانند آموزش را پیگیری کنند، خانواده همراه بماند و
              دانش‌آموز مسیر روشن‌تری پیش روی خود ببیند.
            </p>
            <p className="makan-memorial-pullquote">
              «یاد ماکان، چراغ راه ما شد؛
              <br />
              کمک به دانش‌آموزان، دلیل ادامهٔ راه.»
            </p>
            <p className="makan-memorial-quote-credit">از طرف تیم ماکان</p>
          </div>
        </Container>
      </section>
      <section
        className="makan-memorial-commitments"
        aria-labelledby="makan-commitments-title"
      >
        <Container>
          <p className="makan-editorial-kicker">
            معنای این یاد، در کار هر روز ما
          </p>
          <h2 id="makan-commitments-title">سه دلیل برای ادامه‌دادن.</h2>
          <div className="makan-commitments-grid">
            {commitments.map(({ icon: Icon, number, title, description }) => (
              <div key={number}>
                <div className="makan-commitment-top">
                  <Icon size={25} aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
          <div className="makan-memorial-return">
            <span>
              <Sprout size={21} aria-hidden="true" /> این مسیر، با یاد ماکان
              ادامه دارد.
            </span>
            <Link href="/#product-journey" className="makan-editorial-link">
              آشنایی با دنیای ماکان <ArrowLeft size={19} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </article>
  );
}
