'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { v5Product as t, serverAlignedUi as v9 } from '@/content/fa';
import { useContext, useState } from 'react';
import { SceneMenuClose } from '@/components/v5/form-actions';
import { SlidersHorizontal, BookOpen, Check, ChevronLeft, Wallet, CreditCard } from 'lucide-react';
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
import { ApiError } from '@/lib/api/errors';
import { useWorkspaceSnapshot, WorkspaceVisibilityNotice } from '@/features/personal/workspaces';
import { visibleWorkspaces, canEnterWorkspace } from '@/features/personal/workspace-model';
function WorkspaceMenuAction({ onOpen }: { onOpen: () => void }) {
  const close = useContext(SceneMenuClose);
  return (
    <Button
      variant="outline"
      onClick={() => {
        close?.();
        onOpen();
      }}
    >
      {t.spaces}
    </Button>
  );
}
export function ReferenceProfile() {
  const { session, changing, selectWorkspace, logout } = usePersonal(),
    spaces = useWorkspaceSnapshot(),
    [chooser, setChooser] = useState(false);
  const user = session.user,
    name =
      user.displayName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      uiText.text_8b4cb595cd35;
  const subscription = usePersonalApi<components['schemas']['CommercialSummaryDto']>(
    '/api/v1/commerce/personal/subscription',
  );
  const current = subscription.data;
  const validSummary = !!current && summaryMatches(current, 'Individual', user.id);
  const workspaces = spaces.data ? visibleWorkspaces(spaces.data) : [];
  const role = session.context.activeRole
    ? label(session.context.activeRole)
    : uiText.text_d034f3bcfe7f;

  const logoutAction = (
    <ConfirmAction
      trigger={uiText.account_logout}
      title={uiText.text_2ddbb4f12b8f}
      description={uiText.text_f40112f83ec9}
      confirm={uiText.account_logout}
      destructive
      onConfirm={async () => {
        await logout();
        return true;
      }}
    />
  );
  return (
    <>
      <V5Scene
        id="MK-47"
        title={t.profileFinancialTitle}
        subtitle={t.profileSubtitle}
        back="/personal"
        kind="list"
        deep={false}
        menu={
          <div className={uiClass('stack')}>
            <Button asChild variant="outline">
              <Link href="/personal/profile/edit">{uiText.text_7f941e8233a2}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/personal/settings">{t.settings}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/personal/resources">{t.sources}</Link>
            </Button>
            <WorkspaceMenuAction onOpen={() => setChooser(true)} />
            <Button asChild variant="outline">
              <Link href="/personal/profile/details">{t.account}</Link>
            </Button>
            {logoutAction}
          </div>
        }
      >
        <section className={uiClass('card')}>
          <div className={uiClass('grow')}>
            <h3>{name}</h3>
            <p>
              {role} · {uiText.text_d034f3bcfe7f}
            </p>
          </div>
        </section>
        <section className={uiClass('card')}>
          <h3>{t.profileSubscriptionTitle}</h3>
          {subscription.isPending ? (
            <LoadingSkeleton />
          ) : subscription.isError || !validSummary ? (
            <ErrorState
              error={subscription.error ?? new ApiError(502, { code: 'CONTRACT_MISMATCH' })}
              onRetry={() => void subscription.refetch()}
            />
          ) : (
            <>
              <span className={uiClass('badge')}>{subscriptionLabels[current.state]}</span>
              <div className={uiClass('kv')}>
                <span className={uiClass('key')}>{v9.planUsage}</span>
                <b className={uiClass('val')}>
                  {current.planDisplayName ?? subscriptionLabels[current.state]}
                </b>
              </div>
            </>
          )}
        </section>
        <V4List>
          <V4Row
            title={v9.planUsage}
            description={v9.planDescription}
            icon={<Wallet />}
            href="/personal/subscription"
          />
          <V4Row
            title={v9.payments}
            description={v9.paymentsDescription}
            icon={<CreditCard />}
            href="/personal/subscription?view=payments"
          />
          <V4Row
            title={t.settings}
            description={t.privacyDescription}
            icon={<SlidersHorizontal />}
            href="/personal/settings"
          />
        </V4List>
      </V5Scene>
      <Dialog open={chooser} onOpenChange={setChooser}>
        <DialogContent title={t.spaces}>
          {spaces.isPending ? (
            <LoadingSkeleton />
          ) : spaces.isError ? (
            <ErrorState error={spaces.error} onRetry={() => void spaces.refetch()} />
          ) : (
            <div className={uiClass('v5-space-choices')} aria-label={uiText.text_5111e892b919}>
              {workspaces.map((w, i) => {
                const selected =
                  w.workspaceType === session.context.workspaceType &&
                  w.membershipId === session.context.membershipId &&
                  w.role === session.context.activeRole;
                return (
                  <button
                    key={w.membershipId + ':' + w.role + ':' + i}
                    aria-pressed={selected}
                    disabled={changing || selected || !canEnterWorkspace(w)}
                    onClick={() =>
                      void selectWorkspace(
                        {
                          workspaceType: w.workspaceType,
                          membershipId: w.membershipId,
                          role: w.role,
                        },
                        '/personal/profile',
                      )
                    }
                  >
                    <BookOpen />
                    <span className={uiClass('grow')}>
                      <strong>{w.organizationName ?? w.displayName}</strong>
                      <small>{w.role ? label(w.role) : uiText.text_d034f3bcfe7f}</small>
                    </span>
                    {selected ? <Check /> : <ChevronLeft />}
                  </button>
                );
              })}
            </div>
          )}
          <WorkspaceVisibilityNotice snapshot={spaces.data} />
        </DialogContent>
      </Dialog>
    </>
  );
}
