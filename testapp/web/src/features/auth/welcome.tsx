'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import { CalendarDays, MessagesSquare, UsersRound } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand';
import { Button, buttonClass } from '@/components/ui/button';
import { V4List, V4Row } from '@/components/v4/page';
import { AuthLayout } from './auth-layout';
import s from './welcome.module.css';
export function WelcomePage() {
  return (
    <AuthLayout view="welcome">
      <section className={uiClass('rx-main')}>
        <header className={uiClass('rx-head ' + s.header)}>
          <div className={uiClass('grow')}>
            <h1>{uiText.v5Product.welcomeTitle}</h1>
          </div>
        </header>
        <div className={uiClass('rx-content ' + s.viewport)}>
          <div className={uiClass('rx-workspace')}>
            <div className={uiClass('rx-body-grid ' + s.content)}>
              <BrandMark />
              <h2 className={uiClass('banner-title')}>
                {uiText.text_f1f1352e3a44}
                <br />
                {uiText.text_f51cf6c76e5a}
              </h2>
              <p className={uiClass('policy')}>{uiText.text_e4edd014da62}</p>
              <V4List>
                {[
                  {
                    Icon: CalendarDays,
                    title: uiText.text_3b85559794f7,
                    description: uiText.text_9561aa5b11b0,
                  },
                  {
                    Icon: UsersRound,
                    title: uiText.text_973a4cd40e8c,
                    description: uiText.text_87721ba89db6,
                  },
                  {
                    Icon: MessagesSquare,
                    title: uiText.text_2f8fb5d35b1a,
                    description: uiText.text_b76881edda77,
                  },
                ].map(({ Icon, ...feature }) => (
                  <V4Row key={feature.title} {...feature} icon={<Icon />} />
                ))}
              </V4List>
              <p className={uiClass('tagline')}>{uiText.text_ce6a15857208}</p>
            </div>
          </div>
        </div>
        <footer className={uiClass('rx-bottom-actions')}>
          <Button className={uiClass(buttonClass('btn'))} asChild>
            <Link href="/enter">{uiText.text_b788f2ef91e8}</Link>
          </Button>
        </footer>
      </section>
    </AuthLayout>
  );
}
