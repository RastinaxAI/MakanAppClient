'use client';
import { useState } from 'react';
import * as uiText from '@/content/fa';
import {
  BookOpen,
  UsersRound,
  HeartHandshake,
  BadgeCheck,
  ChartNoAxesCombined,
  Settings,
  Mail,
} from 'lucide-react';
import { V4List, V4Row } from '@/components/v4/page';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { useWorkspaceSnapshot } from '../workspaces';
import { base } from './shared';
import layout from './dashboard-layout.module.css';
import { OfficialSpaces } from './official-spaces';
import { SchoolQuickActions } from './quick-actions';
type S = components['schemas'];
const t = uiText.v6Ui;
export function ManagerHome() {
  const { session } = usePersonal();
  const spaces = useWorkspaceSnapshot();
  const [officialOpen, setOfficialOpen] = useState(false);
  const organization =
    spaces.data?.workspaces.find(
      (space) =>
        space.organizationId === session.context.organizationId &&
        space.membershipId === session.context.membershipId &&
        space.role === 'Manager',
    )?.organizationName ?? uiText.navigation_education;
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
      <section className={layout.welcome}>
        <h2>{organization}</h2>
        <p>{t.schoolManagement}</p>
      </section>
      <div className={layout.metrics} aria-label={uiText.text_622d10d391a9}>
        {[
          [uiText.text_e85db0fb2a48, d.operationalCounts.activeClassCount],
          [uiText.v5Product.teachers, d.operationalCounts.teacherCount],
          [uiText.text_fbd179d162db, d.operationalCounts.enrolledLearnerCount],
        ].map(([title, count]) => (
          <div className={layout.metric} key={title}>
            <strong>{number(Number(count))}</strong>
            <span>{title}</span>
          </div>
        ))}
      </div>
      <SchoolQuickActions />
      <div className={layout.grid}>
        <section className={layout.section}>
          <h3>{t.schoolEducation}</h3>
          <V4List>
            <V4Row
              title={t.schoolStructure}
              description={uiText.serverAlignedUi.schoolStructureDescription}
              icon={<BookOpen />}
              href={base + '/classes'}
            />
            <V4Row
              title={t.schoolMembers}
              description={uiText.serverAlignedUi.schoolMembersDescription}
              icon={<UsersRound />}
              href={base + '/members'}
            />
            <V4Row title={t.schoolRelations} icon={<HeartHandshake />} href={base + '/guardians'} />
            <V4Row
              title={uiText.serverAlignedUi.pendingInvitations}
              description={number(d.pendingInvitationCount)}
              icon={<Mail />}
              href={base + '/invitations'}
            />
          </V4List>
        </section>
        <section className={layout.section}>
          <h3>{t.schoolOrganization}</h3>
          <V4List>
            <V4Row
              title={t.schoolOfficial}
              icon={<BadgeCheck />}
              onClick={() => setOfficialOpen(true)}
            />
            <V4Row
              title={t.schoolReports}
              icon={<ChartNoAxesCombined />}
              href={base + '/reports'}
            />
            <V4Row
              title={t.schoolSettings}
              description={uiText.serverAlignedUi.schoolCapacityDescription}
              icon={<Settings />}
              href="/personal/subscription?scope=organization"
            />
          </V4List>
        </section>
      </div>
      <Dialog open={officialOpen} onOpenChange={setOfficialOpen}>
        <DialogContent title={t.schoolOfficial}>
          <OfficialSpaces />
        </DialogContent>
      </Dialog>
    </>
  );
}
