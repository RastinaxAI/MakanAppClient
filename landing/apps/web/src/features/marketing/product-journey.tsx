"use client";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  GraduationCap,
  Layers3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SourceLink as Link } from "@/features/leads/source-link";
import { ImageViewer } from "@/components/media/image-viewer";
import { trackEvent } from "@/features/analytics/events";
import { productDestinations } from "./product-journey-data";
import { productScreens } from "./product-screens";

const destinationIcons = [
  GraduationCap,
  CalendarDays,
  Sparkles,
  MessageCircle,
  UserRound,
];

export function ProductJourney({
  title = "با مسیر هر بخش آشنا شوید.",
  description = "پنج بخش ماکان را انتخاب کنید و مسیر استفاده را در تصاویر ببینید.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section
      className="makan-journey"
      id="product-journey"
      data-section="experience"
      aria-labelledby="product-journey-title"
    >
      <Container>
        <div className="makan-journey-heading">
          <div>
            <p className="makan-editorial-kicker">
              <Layers3 size={18} aria-hidden="true" /> یک حساب، پنج بخش
            </p>
            <h2 id="product-journey-title">{title}</h2>
          </div>
          <p>{description}</p>
        </div>
        <ul
          className="makan-journey-overview"
          aria-label="معرفی همهٔ بخش‌های ماکان"
        >
          {productDestinations.map((destination, index) => {
            const Icon = destinationIcons[index] || GraduationCap;
            return (
              <li key={destination.id}>
                <Icon size={24} aria-hidden="true" />
                <h3>{destination.label}</h3>
                <p>{destination.overview}</p>
                <Link href={destination.href}>
                  {destination.id === "profile"
                    ? "همهٔ امکانات"
                    : "توضیح بیشتر"}
                  <ArrowLeft size={16} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="makan-journey-more-links">
          <span>برای بررسی دقیق‌تر:</span>
          <Link href="/features/reports">گزارش‌ها و پیشرفت آموزشی</Link>
          <Link href="/features">همهٔ امکانات</Link>
        </div>
        <p className="makan-journey-preview-label">
          حالا مسیر هر بخش را در تصاویر ببینید.
        </p>
        <Tabs
          defaultValue="school"
          dir="rtl"
          className="makan-journey-tabs"
          data-feature-preview
          onValueChange={() => trackEvent("feature_tab_view")}
        >
          <TabsList
            className="makan-journey-navigation"
            aria-label="پنج بخش اصلی ماکان"
          >
            {productDestinations.map((destination, index) => {
              const Icon = destinationIcons[index] || GraduationCap;
              return (
                <TabsTrigger
                  key={destination.id}
                  value={destination.id}
                  className="makan-journey-tab"
                >
                  <Icon aria-hidden="true" />
                  <span>{destination.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {productDestinations.map((destination) => (
            <TabsContent
              key={destination.id}
              value={destination.id}
              className="makan-journey-panel"
            >
              <div className="makan-journey-panel-copy">
                <span className="makan-journey-active">
                  <Check size={14} aria-hidden="true" /> فعال
                </span>
                <h3>{destination.title}</h3>
                <p>{destination.description}</p>
                <ol className="makan-journey-steps">
                  {destination.steps.map((step, index) => (
                    <li key={step}>
                      <span>{(index + 1).toLocaleString("fa-IR")}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="makan-journey-note">
                  <ShieldCheck size={17} aria-hidden="true" />
                  <p>{destination.note}</p>
                </div>
                <Link href={destination.href} className="makan-editorial-link">
                  جزئیات و امکانات
                  <ArrowLeft size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="makan-journey-screens">
                <div className="makan-journey-screen-pair">
                  {productScreens[destination.id].map(
                    ({ image, title }, index) => (
                      <figure key={image.src}>
                        <ImageViewer
                          image={image}
                          caption="برگرفته از طراحی ماکان؛ برای خواندن نوشته‌ها، اندازهٔ اصلی را انتخاب کنید."
                          sizes="(max-width: 767px) 42vw, (max-width: 1099px) 180px, 220px"
                        />
                        <figcaption>
                          <span>{(index + 1).toLocaleString("fa-IR")}</span>
                          {title.split("؛ ")[1]}
                        </figcaption>
                      </figure>
                    ),
                  )}
                </div>
                <p className="makan-journey-image-source">
                  از طراحی ماکان · برای دیدن جزئیات، تصویر را بزرگ کنید
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </section>
  );
}
