import type { ReactNode } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  PanelsTopLeft,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SourceLink as Link } from "@/features/leads/source-link";
import { Container } from "@/components/layout/container";
import { MediaImage } from "@/features/cms/media-image";
import { RichText } from "@/features/cms/rich-text";
import type { CmsSection, CmsImageRef } from "@/features/cms/types";
import type { Audience, Feature } from "./content";
import { PremiumFeatureStory } from "./premium";
import { RoleStory } from "./role-story";
import { AssistantOverview } from "./assistant-overview";
import type { WidgetItem } from "@/features/builder/types";

const detailIcons: Record<string, LucideIcon> = {
  messenger: MessageCircle,
  school: GraduationCap,
  reports: ChartNoAxesCombined,
  workspace: PanelsTopLeft,
  ai: Sparkles,
  schools: Building2,
  teachers: BookOpen,
  students: GraduationCap,
  parents: Users,
};

export function DetailIntroduction({
  section,
  kind,
  slug,
  image,
  privatePreview,
}: {
  section: CmsSection;
  kind: "feature" | "audience";
  slug: string;
  image?: CmsImageRef;
  privatePreview?: boolean;
}) {
  const DetailIcon = detailIcons[slug] || GraduationCap;
  return (
    <section
      className={`premium-detail-intro premium-detail-${kind}`}
      aria-labelledby="hero-title"
    >
      <Container>
        <nav
          aria-label="مسیر صفحه"
          className="mb-9 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="min-h-11 rounded-lg py-2">
            خانه
          </Link>
          <ChevronLeft size={14} aria-hidden="true" />
          <Link
            href={kind === "feature" ? "/features" : "/solutions"}
            className="min-h-11 rounded-lg py-2"
          >
            {kind === "feature" ? "امکانات" : "راهکارها"}
          </Link>
          <ChevronLeft size={14} aria-hidden="true" />
          <span aria-current="page">{section.title}</span>
        </nav>
        <div className="premium-detail-layout">
          <div>
            <p className="premium-eyebrow">{section.kicker}</p>
            <h1 id="hero-title" className="builder-widget-title">
              {section.title}
              <span>{section.accent}</span>
            </h1>
            <p className="premium-detail-summary">{section.description}</p>
            {section.body_html && (
              <RichText
                html={section.body_html}
                privatePreview={privatePreview}
              />
            )}
            <Link
              href={section.cta_href || "/demo"}
              className="premium-button premium-button-blue mt-7"
            >
              {section.cta_label || "درخواست دموی ماکان"}
              <ArrowLeft aria-hidden="true" />
            </Link>
          </div>
          <div
            className={
              kind === "feature" && slug === "ai"
                ? "min-w-0"
                : "premium-detail-emblem"
            }
          >
            {image ? (
              <MediaImage
                image={image}
                priority
                privatePreview={privatePreview}
              />
            ) : kind === "feature" && slug === "ai" ? (
              <AssistantOverview />
            ) : (
              <>
                <div className="detail-emblem-symbol" aria-hidden="true">
                  <DetailIcon />
                </div>
                <p>
                  {kind === "feature"
                    ? "یک بخش از تجربهٔ یکپارچهٔ ماکان"
                    : "آموزش، از نگاه نقش شما"}
                </p>
                <small>
                  تجربهٔ {section.title} را در اپلیکیشن ماکان دنبال کنید.
                </small>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PremiumProblem({
  section,
  suffix,
  children,
}: {
  section: CmsSection;
  suffix: string;
  children?: ReactNode;
}) {
  return (
    <section
      className="premium-problem"
      data-section={section.type}
      aria-labelledby={`problem-${suffix}`}
    >
      <Container>
        <div className="premium-problem-heading">
          <p className="premium-eyebrow">{section.kicker}</p>
          <h2 id={`problem-${suffix}`} className="builder-widget-title">
            {section.title}
          </h2>
          <p>{section.description}</p>
        </div>
        <ol className="premium-problem-rows">
          {section.items.map((item, index) => (
            <li key={index}>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                {item.title && <h3>{item.title}</h3>}
                <p>{item.description}</p>
                {item.href && (
                  <Link href={item.href} className="premium-story-link">
                    بیشتر بخوانید
                    <ArrowLeft size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        {children}
      </Container>
    </section>
  );
}
export function PremiumFeatures({
  section,
  features,
  suffix,
  children,
  stories = false,
}: {
  section: CmsSection;
  features: Feature[];
  suffix: string;
  children?: ReactNode;
  stories?: boolean;
}) {
  return (
    <section data-section="features">
      <Container className="premium-feature-index">
        <p className="premium-eyebrow">{section.kicker}</p>
        <h2 id={`features-${suffix}`} className="builder-widget-title">
          {section.title}
        </h2>
        <p className="premium-section-summary">{section.description}</p>
        <div className="premium-feature-rows">
          {section.items.map((item, index) => (
            <article key={index}>
              <p className="premium-feature-number">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.href && (
                  <Link href={item.href} className="premium-story-link">
                    آشنایی با {item.title}
                    <ArrowLeft size={17} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {children}
      </Container>
      {stories &&
        features
          .filter((feature) =>
            ["messenger", "school", "ai"].includes(feature.slug),
          )
          .map((feature, index) => (
            <PremiumFeatureStory
              key={feature.slug}
              feature={feature}
              order={index + 1}
              storyId={`feature-${suffix}-${feature.slug}`}
            />
          ))}
    </section>
  );
}
export function PremiumAudiences({
  section,
  audiences,
  suffix,
  children,
  items,
  media,
  privatePreview,
  onItemSelect,
  activeIndex,
}: {
  section: CmsSection;
  audiences: Audience[];
  suffix: string;
  children?: ReactNode;
  items?: WidgetItem[];
  media?: CmsImageRef[];
  privatePreview?: boolean;
  onItemSelect?: (index: number) => void;
  activeIndex?: number;
}) {
  return (
    <section className="premium-audience-section" data-section="audiences">
      <Container>
        <p className="premium-eyebrow">{section.kicker}</p>
        <h2 id={`audiences-${suffix}`} className="builder-widget-title">
          {section.title}
        </h2>
        <p className="premium-section-summary">{section.description}</p>
        <RoleStory
          audiences={audiences}
          items={items}
          media={media}
          privatePreview={privatePreview}
          onItemSelect={onItemSelect}
          activeIndex={activeIndex}
        />
        {children}
      </Container>
    </section>
  );
}
export function PremiumJourney({
  section,
  suffix,
  children,
}: {
  section: CmsSection;
  suffix: string;
  children?: ReactNode;
}) {
  return (
    <section className="premium-journey" data-section="onboarding">
      <Container>
        <div className="premium-journey-heading">
          <p className="premium-eyebrow">{section.kicker}</p>
          <h2 id={`journey-${suffix}`} className="builder-widget-title">
            {section.title}
          </h2>
          <p>{section.description}</p>
        </div>
        <ol className="premium-journey-steps">
          {section.items.map((item, index) => (
            <li key={index}>
              <span>{(index + 1).toLocaleString("fa-IR")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.href && (
                <Link href={item.href} className="premium-story-link">
                  آشنایی بیشتر
                  <ArrowLeft size={17} aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ol>
        {children}
      </Container>
    </section>
  );
}
