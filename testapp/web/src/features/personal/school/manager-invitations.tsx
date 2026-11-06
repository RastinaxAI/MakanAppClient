'use client';
import * as uiText from '@/content/fa';
import Link from 'next/link';
import { ArrowLeft, FolderSync, UserRoundPlus, UsersRound } from 'lucide-react';
import { base } from './shared';
import { V5Scene } from '@/components/v5/scene';
import { InvitationsPage } from './invitations';
import { SentInvitations } from './sent-invitations';
import s from './manager-workspace.module.css';
export function ManagerInvitations() {
  return (
    <V5Scene
      id="MK-110"
      title={uiText.text_141ab31cbb75}
      subtitle={uiText.text_69a24d13a391}
      back={base}
      kind="list"
      moreLabel={uiText.text_589d5004f227}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
    >
      <div className={s.stack}>
        <nav className={s.invitationActions} aria-label={uiText.text_e61d50d522fa}>
          <Link className={s.primaryAction} href={base + '/guardians/new'}>
            <UserRoundPlus size={22} />
            <span>{uiText.text_afeb96c95c63}</span>
            <ArrowLeft size={17} />
          </Link>
          <Link href={base + '/people'}>
            <FolderSync size={22} />
            <span>{uiText.text_8987b66cfbc9}</span>
            <ArrowLeft size={17} />
          </Link>
          <Link href={base + '/members'}>
            <UsersRound size={22} />
            <span>{uiText.text_48eb62b1b116}</span>
            <ArrowLeft size={17} />
          </Link>
        </nav>
        <SentInvitations />
        <InvitationsPage />
      </div>
    </V5Scene>
  );
}
