'use client';
import { uiClass } from '@/components/v5/classes';

import { useContext, type ReactNode } from 'react';
import appearance from './school.module.css';
import { usePersonal } from '@/features/personal/provider';
import { ProductContext, V5Scene } from '@/components/v5/scene';
import * as uiText from '@/content/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export function ReferenceSchoolFrame({
  children,
  context,
}: {
  children?: ReactNode;
  context?: ReactNode;
}) {
  const { session } = usePersonal();
  const place = useContext(ProductContext);
  const role = session.context.activeRole;
  const organization = session.context.workspaceType === 'Organization';
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
      title={
        role === 'Student'
          ? uiText.navigation_education
          : role === 'Teacher'
            ? uiText.serverAlignedUi.teacherDashboard
            : role === 'Manager'
              ? uiText.serverAlignedUi.managerDashboard
              : uiText.navigation_education
      }
      back="/personal"
      subtitle={organization ? place.title : undefined}
      deep={false}
      kind="list"
      context={context}
      actions={
        role === 'Manager' && organization ? (
          <Button asChild>
            <Link href="/personal/education/invitations">{uiText.text_016c18389868}</Link>
          </Button>
        ) : role === 'Teacher' && organization ? (
          <Button asChild>
            <Link href="/personal/education/lessons/new">
              {uiText.serverAlignedUi.newSchoolContent}
            </Link>
          </Button>
        ) : undefined
      }
      moreLabel={uiText.text_589d5004f227}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      onBack={() => window.dispatchEvent(new Event('makan:workspace-picker'))}
    >
      <div className={uiClass('v5-school ' + appearance.school)} data-mk-view={id}>
        {children}
      </div>
    </V5Scene>
  );
}
