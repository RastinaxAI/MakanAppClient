'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { BookOpen, GraduationCap, Mail, School, UsersRound, Gem } from 'lucide-react';
import { V4List, V4Row } from '@/components/v4/page';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { base } from './shared';
import layout from './dashboard-layout.module.css';
import { OfficialSpaces } from './official-spaces';
type S = components['schemas'];
export function ManagerHome() {
  const { session } = usePersonal();
  const dashboard = usePersonalApi<S['ManagerDashboardDto']>('/api/v1/dashboards/manager', {
    poll: 10000,
  });
  if (dashboard.isPending) return <LoadingSkeleton />;
  if (dashboard.isError)
    return <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />;
  const d = dashboard.data;
  if (d.organizationId !== session.context.organizationId)
    return <ErrorState error={new ApiError(403)} />;
  return (
    <>
      <div className={layout.metrics} aria-label={uiText.text_622d10d391a9}>
        {[
          {
            title: uiText.text_fbd179d162db,
            count: d.operationalCounts.enrolledLearnerCount,
            Icon: GraduationCap,
          },
          {
            title: uiText.v5Product.teachers,
            count: d.operationalCounts.teacherCount,
            Icon: UsersRound,
          },
          {
            title: uiText.text_e85db0fb2a48,
            count: d.operationalCounts.activeClassCount,
            Icon: School,
          },
          {
            title: uiText.serverAlignedUi.pendingInvitations,
            count: d.pendingInvitationCount,
            Icon: Mail,
          },
        ].map(({ title, count, Icon }) => (
          <div className={layout.metric} key={title}>
            <Icon aria-hidden="true" />
            <b>{number(count)}</b>
            <span>{title}</span>
          </div>
        ))}
      </div>
      <section className={uiClass('card')}>
        <h3>{uiText.text_e5b141057b67}</h3>
        <V4List>
          <V4Row
            title={uiText.serverAlignedUi.schoolMembers}
            description={uiText.serverAlignedUi.schoolMembersDescription}
            icon={<UsersRound />}
            href={base + '/members'}
          />
          <V4Row
            title={uiText.serverAlignedUi.schoolStructure}
            description={uiText.serverAlignedUi.schoolStructureDescription}
            icon={<BookOpen />}
            href={base + '/classes'}
          />
          <V4Row
            title={uiText.serverAlignedUi.schoolCapacity}
            description={uiText.serverAlignedUi.schoolCapacityDescription}
            icon={<Gem />}
            href="/personal/subscription?scope=organization"
          />
        </V4List>
      </section>
      <details className={uiClass('card')}>
        <summary>{uiText.text_030eacc9e686}</summary>
        <OfficialSpaces />
      </details>
    </>
  );
}
