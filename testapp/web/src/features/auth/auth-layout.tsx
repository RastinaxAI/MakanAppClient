'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import type { ReactNode } from 'react';
import frameStyles from '@/components/v5/frame.module.css';
export function AuthLayout({ children, view }: { children: ReactNode; view?: 'welcome' }) {
  return (
    <main className={uiClass('v5-product-viewport ' + frameStyles.viewport)} data-auth-layout>
      <div
        className={uiClass('rx-root auth ' + frameStyles.frame + ' ' + frameStyles.auth)}
        data-auth-view={view}
      >
        <section className={uiClass('rx-app-frame')} aria-label={uiText.text_53e6fda46753}>
          {children}
        </section>
      </div>
    </main>
  );
}
