'use client';
import * as uiText from '@/content/fa';
import type { ReactNode } from 'react';
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="v5-product-viewport" data-auth-layout>
      <div className="rx-root auth">
        <section className="rx-app-frame" aria-label={uiText.text_53e6fda46753}>
          {children}
        </section>
      </div>
    </main>
  );
}
