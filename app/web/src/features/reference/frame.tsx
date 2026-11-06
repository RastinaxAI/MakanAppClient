'use client';
import * as uiText from '@/content/fa';
import { type ReactNode } from 'react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { Button } from '@/components/ui/button';
import { referenceBlueprint } from './registry';
/** Runtime pages no longer render the archived V4 screen tree. */
export function ReferenceFrame({
  id,
  title,
  subtitle,
  back = '/personal/profile',
  children,
}: {
  id: string;
  title?: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
}) {
  let fallback = '';
  try {
    fallback = referenceBlueprint(id).title;
  } catch {
    fallback = uiText.brand_name;
  }
  return (
    <V5Scene
      id={id}
      title={title || fallback}
      subtitle={subtitle}
      back={back}
      kind="article"
      menu={
        <div className="stack">
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
