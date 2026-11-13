'use client';
import { uiClass } from '@/components/v5/classes';
import * as uiText from '@/content/fa';
import Link from 'next/link';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Bell, BookOpen, ShieldCheck } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { V4List, V4Row } from '@/components/v4/page';
import { AuthLayout } from './auth-layout';
import s from './welcome.module.css';
const LoginHelp = dynamic(() => import('./login-help'));
const t = uiText.v6Ui;
export function WelcomePage() {
  const [help, setHelp] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <AuthLayout view="welcome">
        <section className={uiClass('rx-main')}>
          <header className={uiClass('rx-head ' + s.header)}>
            <BrandMark />
            <div className={uiClass('grow')}>
              <h1>{t.authWelcomeTitle}</h1>
              <p>{t.authWelcomeTitle}</p>
            </div>
            <Link
              className={uiClass('rx-icon-button')}
              href="/personal/notifications"
              aria-label={uiText.text_9f2a436a61f3}
            >
              <Bell size={22} />
            </Link>
          </header>
          <div className={uiClass('rx-content ' + s.viewport)}>
            <div className={uiClass('rx-workspace')}>
              <div className={uiClass('rx-body-grid ' + s.content)}>
                <section className={s.lead}>
                  <span className={s.mark}>
                    <BookOpen size={27} />
                  </span>
                  <h2 className={uiClass('banner-title')}>{t.authWelcomeLead}</h2>
                  <p>{t.authWelcomeIntro}</p>
                </section>
                <section className={uiClass('card ' + s.startCard)}>
                  <p>{t.authMessenger}</p>
                  <Button asChild className={s.start}>
                    <Link href="/enter">
                      <ArrowLeft size={19} />
                      {t.authStart}
                    </Link>
                  </Button>
                </section>
                <div className={uiClass('tagline')}>
                  <V4List>
                    <V4Row
                      title={t.authTerms}
                      description={t.authTermsHint}
                      icon={<ShieldCheck />}
                      onClick={() => {
                        trigger.current =
                          document.activeElement instanceof HTMLButtonElement
                            ? document.activeElement
                            : null;
                        setHelp(true);
                      }}
                    />
                  </V4List>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AuthLayout>
      {help && <LoginHelp onClose={() => setHelp(false)} returnFocus={trigger} />}
    </>
  );
}
