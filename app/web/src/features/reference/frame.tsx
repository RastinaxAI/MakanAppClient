'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { type ReactNode } from 'react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { Button } from '@/components/ui/button';
/** Runtime pages no longer render the archived V4 screen tree. */
export function ReferenceFrame({
  id,
  title,
  subtitle,
  back = '/personal/profile',
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
}) {
  return (
    <V5Scene
      id={id}
      title={title}
      subtitle={subtitle}
      back={back}
      menu={
        <div className={uiClass('stack')}>
          <Button asChild>
            <Link href="/personal/profile">{uiText.text_33f4cefcfd71}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/personal/settings">{uiText.navigation_settings}</Link>
          </Button>
        </div>
      }
    >
      {children}
    </V5Scene>
  );
}
