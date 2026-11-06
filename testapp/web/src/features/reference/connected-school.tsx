'use client';

import type { ReactNode } from 'react';
import { usePersonal } from '@/features/personal/provider';
import { V5Scene } from '@/components/v5/scene';
import * as uiText from '@/content/fa';
export function ReferenceSchoolFrame({ children }: { children?: ReactNode }) {
  const { session } = usePersonal();
  const role = session.context.activeRole;
  const id =
    session.context.workspaceType !== 'Organization'
      ? 'MK-59'
      : role === 'Manager'
        ? 'MK-08'
        : role === 'Teacher'
          ? 'MK-07'
          : role === 'Parent'
            ? 'MK-09'
            : 'MK-04';
  return (
    <V5Scene
      id={id}
      title={uiText.navigation_education}
      back="/personal"
      deep={false}
      kind="list"
      moreLabel={uiText.text_589d5004f227}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      onBack={() => window.dispatchEvent(new Event('makan:workspace-picker'))}
    >
      <div className="v5-school" data-mk-view={id}>
        {children}
      </div>
    </V5Scene>
  );
}
