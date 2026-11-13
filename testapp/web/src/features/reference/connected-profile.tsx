'use client';
import * as text from '@/content/fa';
import { useState } from 'react';
import { ArrowLeftRight, Bell, CreditCard, ContactRound, KeyRound, Settings } from 'lucide-react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { usePersonal, usePersonalApi } from '@/features/personal/provider';
import type { components } from '@/generated/api/schema';
import { summaryMatches, subscriptionLabels } from '@/features/personal/commerce-model';
import { useWorkspaceSnapshot, SchoolContextPicker } from '@/features/personal/workspaces';
import { visibleWorkspaces, canEnterWorkspace } from '@/features/personal/workspace-model';
import { ProfileAvatar } from '@/features/personal/profile-photo';
import s from './connected-profile.module.css';
const t = text.v6Ui;
export function ReferenceProfile({
  initialChooserOpen = false,
  initialAccessOpen = false,
}: {
  initialChooserOpen?: boolean;
  initialAccessOpen?: boolean;
}) {
  const { session, logout } = usePersonal();
  const spaces = useWorkspaceSnapshot();
  const [chooser, setChooser] = useState(initialChooserOpen),
    [access, setAccess] = useState(initialAccessOpen);
  const user = session.user;
  const name =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    text.text_8b4cb595cd35;
  const subscription = usePersonalApi<components['schemas']['CommercialSummaryDto']>(
    '/api/v1/commerce/personal/subscription',
  );
  const current = subscription.data;
  const validSummary = !!current && summaryMatches(current, 'Individual', user.id);
  const school = spaces.data
    ? visibleWorkspaces(spaces.data).find(
        (row) =>
          row.workspaceType === 'Organization' &&
          row.organizationId === session.context.organizationId &&
          row.membershipId === session.context.membershipId &&
          row.role === session.context.activeRole &&
          canEnterWorkspace(row),
      )
    : undefined;
  return (
    <>
      <V5Scene
        id="MK-47"
        title={t.profile}
        subtitle={t.personalIdentity}
        back="/personal"
        kind="list"
        deep={false}
        headerTools={
          <Button asChild size="icon" variant="ghost">
            <Link href="/personal/notifications" aria-label={text.text_9f2a436a61f3}>
              <Bell size={21} />
            </Link>
          </Button>
        }
      >
        <div className={s.profile} data-v6-profile>
          <Link
            className={s.summary}
            href="/personal/profile/edit"
            aria-label={text.text_7f941e8233a2}
          >
            <ProfileAvatar photo={user.profilePhoto} name={name} className={s.avatar} />
            <div>
              <h2>{name}</h2>
              <p>{t.profileHint}</p>
              <span className={s.badge}>{t.personalIdentity}</span>
            </div>
          </Link>
          <section className={s.card} aria-label={t.myDetails}>
            <h3>{t.myDetails}</h3>
            <div className={s.detail}>
              <span>{t.phone}</span>
              <bdi dir="ltr">{user.phoneNumber}</bdi>
            </div>
            <div className={s.detail}>
              <span>{t.username}</span>
              <bdi dir="ltr">{user.username ? '@' + user.username : text.text_becb77371bdf}</bdi>
            </div>
          </section>
          <section className={s.card} aria-label={t.schoolContext}>
            <h3>{t.schoolContext}</h3>
            {spaces.isPending ? (
              <LoadingSkeleton />
            ) : spaces.isError ? (
              <ErrorState error={spaces.error} onRetry={() => void spaces.refetch()} />
            ) : (
              <>
                {school ? (
                  <div className={s.school}>
                    <span className={s.schoolAvatar} aria-hidden="true">
                      {school.organizationName?.charAt(0)}
                    </span>
                    <div>
                      <strong>{school.organizationName}</strong>
                      <small>
                        {label(school.role ?? '')} · {t.verifiedMembership}
                      </small>
                    </div>
                    <span className={s.badge}>{t.active}</span>
                  </div>
                ) : (
                  <p className={s.noSchool}>{t.noSchool}</p>
                )}
                <Button className={s.choose} variant="outline" onClick={() => setChooser(true)}>
                  <ArrowLeftRight size={20} />
                  {t.chooseSchool}
                </Button>
              </>
            )}
          </section>
          <V4List>
            <V4Row
              title={t.myAccess}
              description={t.accessHint}
              icon={<KeyRound />}
              onClick={() => setAccess(true)}
            />
            <V4Row
              title={t.plansPayments}
              description={
                validSummary
                  ? (current.planDisplayName ?? subscriptionLabels[current.state])
                  : t.plansHint
              }
              icon={<CreditCard />}
              href="/personal/subscription"
            />
            <V4Row
              title={text.text_759044ca1d2d}
              description={text.v6Ui.contactsHint}
              icon={<ContactRound />}
              href="/personal/contacts"
            />
            <V4Row title={text.v5Product.settings} icon={<Settings />} href="/personal/settings" />
          </V4List>
          {subscription.isError && (
            <ErrorState error={subscription.error} onRetry={() => void subscription.refetch()} />
          )}
          <ConfirmAction
            trigger={text.account_logout}
            title={text.text_2ddbb4f12b8f}
            description={text.text_f40112f83ec9}
            confirm={text.account_logout}
            destructive
            onConfirm={async () => {
              await logout();
              return true;
            }}
          />
        </div>
      </V5Scene>
      <Dialog open={chooser} onOpenChange={setChooser}>
        <DialogContent title={t.schoolPicker}>
          <SchoolContextPicker onSelected={() => setChooser(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={access} onOpenChange={setAccess}>
        <DialogContent title={t.myAccess}>
          <SchoolContextPicker readOnly />
          <Button asChild variant="outline">
            <Link href="/personal/profile/details">{text.v5Product.account}</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
