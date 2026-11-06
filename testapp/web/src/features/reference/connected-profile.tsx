'use client';
import * as uiText from '@/content/fa';
import { v5Product as t } from '@/content/fa';
import { useState } from 'react';
import {
  UserRound,
  CircleUserRound,
  Files,
  SlidersHorizontal,
  Layers,
  BookOpen,
  ShieldCheck,
  Check,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { usePersonal } from '@/features/personal/provider';
import { ProfileAvatar } from '@/features/personal/profile-photo';
import { useWorkspaceSnapshot, WorkspaceVisibilityNotice } from '@/features/personal/workspaces';
import { visibleWorkspaces, canEnterWorkspace } from '@/features/personal/workspace-model';
export function ReferenceProfile() {
  const { session, changing, selectWorkspace, logout } = usePersonal(),
    spaces = useWorkspaceSnapshot(),
    [chooser, setChooser] = useState(false);
  const user = session.user,
    name =
      user.displayName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      uiText.text_8b4cb595cd35;
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
        title={uiText.navigation_profile}
        subtitle={t.profileSubtitle}
        back="/personal"
        kind="list"
        deep={false}
        menu={
          <div className="stack">
            <Button asChild variant="outline">
              <Link href="/personal/profile/edit">{uiText.text_7f941e8233a2}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/personal/settings">{t.settings}</Link>
            </Button>
            {logoutAction}
          </div>
        }
      >
        <div className="user-summary">
          <ProfileAvatar photo={user.profilePhoto} name={name} className="avatar" />
          <h3>{name}</h3>
          <p dir="ltr">{user.username ? '@' + user.username : ''}</p>
          <div style={{ marginTop: 12 }}>
            <span className="badge">
              <UserRound size={12} />
              {role}
            </span>
          </div>
        </div>
        <V4List>
          <V4Row
            title={t.account}
            description={t.accountDescription}
            icon={<CircleUserRound />}
            href="/personal/profile/details"
          />
          <V4Row
            title={t.spaces}
            description={t.spacesDescription}
            icon={<Layers />}
            onClick={() => setChooser(true)}
          />
          <V4Row
            title={t.sources}
            description={t.sourcesDescription}
            icon={<Files />}
            href="/personal/resources"
          />
          <V4Row
            title={t.privacy}
            description={t.privacyDescription}
            icon={<ShieldCheck />}
            href="/personal/settings/privacy"
          />
          <V4Row
            title={t.appearanceProfile}
            description={t.appearanceProfileDescription}
            icon={<SlidersHorizontal />}
            href="/personal/settings/appearance"
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
            <div className="v5-space-choices" aria-label={uiText.text_5111e892b919}>
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
                    <span className="grow">
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
