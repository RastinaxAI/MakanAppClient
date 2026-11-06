import Image from "next/image";
import { ArrowLeft, Heart, Sprout } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SourceLink as Link } from "@/features/leads/source-link";

import { makanStory } from "./makan-story";

export function MakanOriginLink() {
  return (
    <Link href={makanStory.href} className="makan-origin-link">
      <span className="makan-origin-symbol">
        <Sprout size={19} aria-hidden="true" />
      </span>
      <span>
        یک نام، یک یاد، یک مسیر <strong>داستان ماکان</strong>
      </span>
      <ArrowLeft size={17} aria-hidden="true" />
    </Link>
  );
}

export function MakanRemembrance({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`makan-remembrance${compact ? " makan-remembrance-compact" : ""}`}
      aria-labelledby="makan-remembrance-title"
    >
      <Container>
        <div className="makan-remembrance-layout">
          <div className="makan-remembrance-copy">
            <p className="makan-editorial-kicker">
              <Sprout size={18} aria-hidden="true" /> ریشهٔ یک همراهی
            </p>
            <h2 id="makan-remembrance-title">
              ماکان،{compact ? " " : <br />}فراتر از یک نام.
            </h2>
            {!compact && (
              <p className="makan-remembrance-lead">
                به یاد ماکان نصیری؛ برای فردای دانش‌آموزان.
              </p>
            )}
            <p>
              {compact ? (
                "ایدهٔ ماکان از یاد ماکان نصیری و دغدغهٔ کمک به دانش‌آموزان شکل گرفت؛ یاد او راهنمای این مسیر است."
              ) : (
                <>
                  ایدهٔ ماکان از یاد ماکان نصیری و دغدغهٔ کمک به دانش‌آموزان شکل
                  گرفت. با همین انگیزه قدم در این مسیر گذاشتیم؛ یاد ماکان
                  راهنمای ما شد تا ارتباط، آموزش و همراهی را به هم نزدیک‌تر
                  کنیم.
                </>
              )}
            </p>
            <Link href={makanStory.href} className="makan-editorial-link">
              {compact ? "داستان ماکان" : "داستان ماکان و آغاز این مسیر"}{" "}
              <ArrowLeft size={19} aria-hidden="true" />
            </Link>
          </div>
          <figure className="makan-remembrance-portrait">
            <Image
              src={makanStory.image}
              alt={makanStory.imageAlt}
              width={makanStory.imageWidth}
              height={makanStory.imageHeight}
              sizes={
                compact
                  ? "(min-width: 768px) 170px, 110px"
                  : "(min-width: 1100px) 420px, (min-width: 768px) 38vw, 320px"
              }
            />
            {!compact && (
              <figcaption>
                <Heart size={14} aria-hidden="true" /> به یاد ماکان و همهٔ
                کودکانِ چشم‌به‌راه فردا
              </figcaption>
            )}
          </figure>
        </div>
      </Container>
    </section>
  );
}
