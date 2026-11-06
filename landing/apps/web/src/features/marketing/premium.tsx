import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  CalendarDays,
  Check,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { SourceLink as Link } from "@/features/leads/source-link";
import { Container } from "@/components/layout/container";
import { MediaImage } from "@/features/cms/media-image";
import { RichText } from "@/features/cms/rich-text";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CmsImageRef, CmsSection } from "@/features/cms/types";
import type { Feature } from "./content";
import { MakanOriginLink } from "./makan-remembrance";
import { productDestinations } from "./product-journey-data";
import { AssistantOverview } from "./assistant-overview";
import { AppEntryLink } from "@/components/marketing/app-entry-link";

/** A capability map, deliberately labelled as an illustration rather than product evidence. */
export function CapabilityMap({ compact = false }: { compact?: boolean }) {
  const destinationIcons = [
    GraduationCap,
    CalendarDays,
    Sparkles,
    MessageCircle,
    UserRound,
  ];
  return (
    <figure
      className={`makan-capability-map makan-destination-map ${compact ? "is-compact" : ""}`}
    >
      <div className="destination-map-label">
        <span /> دنیای ماکان، در یک نگاه
        <span dir="ltr">MAKAN</span>
      </div>
      <div className="destination-map-center">
        <Image
          src="/brand/makan-logo.png"
          alt="ماکان"
          width={76}
          height={76}
          sizes="76px"
          className="rounded-2xl"
        />
        <div>
          <strong>ماکان</strong>
          <span>یک هویت؛ فرصت‌های بیشتر برای یادگیری.</span>
        </div>
      </div>
      <div className="destination-map-modules">
        {productDestinations.map((destination, index) => {
          const Icon = destinationIcons[index] || GraduationCap;
          return (
            <div
              className={`destination-map-module destination-map-${destination.id}`}
              key={destination.id}
            >
              <span className="destination-map-icon">
                <Icon aria-hidden="true" />
              </span>
              <div>
                <strong>{destination.label}</strong>
                <small>{destination.short}</small>
              </div>
              <span className="destination-map-number">
                {(index + 1).toLocaleString("fa-IR", {
                  minimumIntegerDigits: 2,
                })}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption>پنج بخش فعال؛ از ارتباط تا یادگیری با هوش مصنوعی</figcaption>
    </figure>
  );
}

export function PremiumHero({
  section,
  image,
  privatePreview = false,
  showOrigin = false,
}: {
  section: CmsSection;
  image?: CmsImageRef;
  privatePreview?: boolean;
  showOrigin?: boolean;
}) {
  return (
    <section
      className="makan-premium-hero"
      data-section="hero"
      aria-labelledby="hero-title"
    >
      <Container className="premium-hero-layout">
        <div className="premium-hero-copy">
          <p className="premium-eyebrow">
            <span className="h-px w-8 bg-current" />{" "}
            {section.kicker || "ماکان؛ همراه مدرسه"}
          </p>
          <h1 id="hero-title" className="builder-widget-title">
            {section.title}
            <span>{section.accent}</span>
          </h1>
          <p className="premium-hero-summary">{section.description}</p>
          {section.body_html && (
            <RichText
              html={section.body_html}
              privatePreview={privatePreview}
            />
          )}
          <div className="premium-actions">
            {showOrigin ? (
              <AppEntryLink className="premium-button premium-button-white">
                ورود به اپلیکیشن <ArrowLeft aria-hidden="true" />
              </AppEntryLink>
            ) : (
              <Link
                href={section.cta_href || "/demo"}
                className="premium-button premium-button-white"
              >
                {section.cta_label || "درخواست دموی ماکان"}
                <ArrowLeft aria-hidden="true" />
              </Link>
            )}
            <Link
              href={showOrigin ? "#product-journey" : "/features"}
              className="premium-text-link"
            >
              {showOrigin ? "آشنایی با امکانات ماکان" : "ماکان را بشناسید"}{" "}
              <ArrowUpLeft aria-hidden="true" />
            </Link>
          </div>
          <ul className="premium-proof">
            {section.items.map((item, index) => (
              <li key={index}>
                <Check aria-hidden="true" size={16} />
                {item.title}
              </li>
            ))}
          </ul>
          {showOrigin && <MakanOriginLink />}
        </div>
        <div className="premium-hero-visual">
          {image ? (
            <MediaImage
              image={image}
              priority
              privatePreview={privatePreview}
            />
          ) : (
            <CapabilityMap />
          )}
        </div>
      </Container>
      <Container className="premium-hero-bottom">
        <span>از ارتباط روزمره، تا مدیریت یادگیری.</span>
        <span dir="ltr">MAKANAPP / EDUCATION CONNECTED</span>
      </Container>
    </section>
  );
}

export function PremiumFeatureStory({
  feature,
  order = 1,
  privatePreview = false,
  storyId,
}: {
  feature: Feature;
  order?: number;
  privatePreview?: boolean;
  storyId?: string;
}) {
  const image = feature.media?.find(
    (asset) => asset.id === feature.image_media_id,
  );
  const Icon = feature.slug === "messenger" ? MessageCircle : BookOpen;
  return (
    <section
      className={`premium-story ${order % 2 === 0 ? "premium-story-reverse" : ""}`}
      aria-labelledby={storyId || `story-${feature.slug}`}
    >
      <Container className="premium-story-layout">
        <div className="premium-story-copy">
          <StatusBadge status={feature.readiness} />
          <p className="premium-story-number">
            {String(order).padStart(2, "0")} <span>/ {feature.title}</span>
          </p>
          <h2
            id={storyId || `story-${feature.slug}`}
            className="builder-widget-title"
          >
            {feature.headline}
          </h2>
          <p className="premium-story-summary">{feature.summary}</p>
          <ul className="premium-story-benefits">
            {feature.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index}>
                <span>
                  <Check size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3>{benefit.title}</h3>
                  {benefit.description && <p>{benefit.description}</p>}
                </div>
              </li>
            ))}
          </ul>
          <Link
            href={`/features/${feature.slug}`}
            className="premium-story-link"
          >
            آشنایی با {feature.title}
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="premium-story-visual">
          {image ? (
            <MediaImage image={image} privatePreview={privatePreview} />
          ) : feature.slug === "ai" ? (
            <AssistantOverview />
          ) : (
            <figure className="premium-product-concept">
              <div className="concept-caption">
                <Icon aria-hidden="true" />
                <span>{feature.title}</span>
                <span className="concept-tag">معرفی قابلیت</span>
              </div>
              <div className="concept-content">
                <span className="concept-word">
                  {feature.slug === "messenger" ? "ارتباط،" : "یادگیری،"}
                  <br />
                  <strong>
                    {feature.slug === "messenger"
                      ? "در جای درست."
                      : "با نظم بیشتر."}
                  </strong>
                </span>
                <div className="concept-tracks">
                  {feature.workflow.slice(0, 3).map((item, index) => (
                    <div key={index}>
                      <span>{(index + 1).toLocaleString("fa-IR")}</span>
                      <p>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              <figcaption>
                مسیر استفاده از {feature.title} در تجربهٔ یکپارچهٔ ماکان.
              </figcaption>
            </figure>
          )}
        </div>
      </Container>
    </section>
  );
}

export function PremiumDemoInvitation({
  title,
  description,
  label,
  href,
}: {
  title: string;
  description: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="premium-invitation">
      <Container>
        <div className="premium-invitation-inner">
          <div>
            <p className="premium-eyebrow">
              <ShieldCheck size={18} aria-hidden="true" /> قدم بعدی، یک گفت‌وگوی
              روشن
            </p>
            <h2 className="builder-widget-title">{title}</h2>
            <p>{description}</p>
          </div>
          <Link
            href={href || "/demo"}
            className="premium-button premium-button-blue"
          >
            {label || "درخواست دموی ماکان"}
            <ArrowLeft aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
