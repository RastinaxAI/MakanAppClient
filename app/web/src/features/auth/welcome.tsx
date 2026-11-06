'use client';
import * as uiText from '@/content/fa';
import Link from 'next/link';
import { CalendarDays, MessagesSquare, UsersRound } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { AuthLayout } from './auth-layout';
import s from './welcome.module.css';
export function WelcomePage() {
  return (
    <AuthLayout>
      <section className="rx-main">
        <header className="rx-head">
          <div className="grow">
            <h1>{uiText.v5Product.welcomeTitle}</h1>
          </div>
        </header>
        <div className="rx-content">
          <div className="rx-workspace">
            <div className={'rx-body-grid ' + s.content}>
              <BrandMark />
              <h2 className="banner-title">
                {uiText.text_f1f1352e3a44}
                <br />
                {uiText.text_f51cf6c76e5a}
              </h2>
              <p>{uiText.text_e4edd014da62}</p>
              <div className={'list ' + s.features}>
                {[
                  [CalendarDays, uiText.text_3b85559794f7, uiText.text_9561aa5b11b0],
                  [UsersRound, uiText.text_973a4cd40e8c, uiText.text_87721ba89db6],
                  [MessagesSquare, uiText.text_2f8fb5d35b1a, uiText.text_b76881edda77],
                ].map(([Icon, title, description]) => {
                  const Glyph = Icon as typeof CalendarDays;
                  return (
                    <article className="row" key={String(title)}>
                      <span className="tile-icon" aria-hidden="true">
                        <Glyph size={24} />
                      </span>
                      <div className="grow">
                        <h4>{String(title)}</h4>
                        <p>{String(description)}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="tagline">{uiText.text_ce6a15857208}</p>
            </div>
          </div>
        </div>
        <footer className="rx-bottom-actions">
          <Button className="btn" asChild>
            <Link href="/enter">{uiText.text_b788f2ef91e8}</Link>
          </Button>
        </footer>
      </section>
    </AuthLayout>
  );
}
