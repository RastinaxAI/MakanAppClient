'use client';
import * as uiText from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { PageBack } from '@/components/navigation/page-back';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import {
  BookOpen,
  GraduationCap,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import s from './personal.module.css';
import { displayDateOnly } from './profile-model';
import { ProfileAvatar } from './profile-photo';
import { usePersonal, usePersonalApi } from './provider';
import { useWorkspaceSnapshot } from './workspaces';
import { visibleWorkspaces } from './workspace-model';
import { ageCategoryLabels, ageVerificationLabels, messagingNextLabels } from './status-labels';

export function PersonalHome() {
  const { session } = usePersonal();
  const spaces = useWorkspaceSnapshot();
  const organizationCount = spaces.data
    ? new Set(
        visibleWorkspaces(spaces.data)
          .filter((w) => w.organizationId)
          .map((w) => w.organizationId),
      ).size
    : null;
  const cards = [
    {
      title: uiText.text_58b634557905,
      description: uiText.text_be6ad26a2907,
      href: '/personal/messages',
      icon: MessageCircle,
    },
    {
      title: uiText.text_2cb3fe307efb,
      description: uiText.text_bc5dba82dc68,
      href: '/personal/profile',
      icon: UserRound,
    },
    {
      title: uiText.text_8fa4122032f4,
      description: uiText.text_38f053ad5286,
      href: '/personal/education',
      icon: GraduationCap,
    },
    {
      title: uiText.text_3a2a401438ce,
      description: uiText.text_cd91c90b6565,
      href: '/personal/resources',
      icon: BookOpen,
    },
    {
      title: uiText.text_b929671ed22f,
      description: uiText.text_7efe1b3a70de,
      href: '/personal/ai',
      icon: Sparkles,
    },
    {
      title: uiText.text_6b1ac4d74206,
      description: uiText.text_d4a1c2a050f1,
      href: '/personal/subscription',
      icon: Wallet,
    },
  ];
  return (
    <>
      <div className={s.heading}>
        <span>
          {session.context.workspaceType === 'Personal'
            ? uiText.text_ab3c684df5df
            : uiText.text_7298890ac877}
        </span>
        <h1>
          {session.user.firstName
            ? uiText.format_3d34ebe177d6(session.user.firstName)
            : uiText.text_faa9d5e66033}
        </h1>
        <p>{uiText.text_b9c5b60f445c}</p>
      </div>
      {!session.user.isProfileComplete && (
        <div className={s.notice}>
          <UserRound size={22} />
          <p>
            <strong>{uiText.text_338907839d78}</strong>
            <span>{uiText.text_878db5df132b}</span>
          </p>
          <Button asChild variant="outline">
            <Link href="/personal/profile/edit">{uiText.text_dc1e77f52af9}</Link>
          </Button>
        </div>
      )}
      {spaces.isError ? (
        <ErrorState error={spaces.error} onRetry={() => void spaces.refetch()} />
      ) : organizationCount === 0 ? (
        <div className={s.personalNote}>
          <ShieldCheck size={20} />
          <p>{uiText.text_97abd9bfcbc0}</p>
        </div>
      ) : organizationCount !== null ? (
        <p className={s.muted}>{uiText.text_4ee5ce4fd1a6}</p>
      ) : null}
      <div className={s.cards}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <span className={s.cardIcon}>
              <card.icon size={24} />
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className={s.cardAction}>
              {uiText.text_52fa408fc93a}
              <span aria-hidden="true">{uiText.text_774f1d6b2910}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
export function PersonalProfile() {
  const { session, logout } = usePersonal();
  const status = usePersonalApi<components['schemas']['MessagingStatusResult']>(
    '/api/v1/me/messaging-status',
  );
  const user = session.user;
  const name =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    uiText.text_d34d90474c92;
  return (
    <V5Scene
      id="MK-47"
      title={uiText.v5Product.account}
      back="/personal/profile"
      menu={
        <Link className="button button-outline" href="/personal/profile/preferences">
          {uiText.text_8aa6893911d9}
        </Link>
      }
      actions={
        <Button asChild>
          <Link href="/personal/profile/edit">{uiText.text_7f941e8233a2}</Link>
        </Button>
      }
    >
      <div className="v5-user-summary card" data-profile-overview>
        <ProfileAvatar photo={user.profilePhoto} name={name} className="avatar" />
        <div className="grow">
          <h2>{name}</h2>
          <p dir="ltr">{user.username ? '@' + user.username : uiText.text_becb77371bdf}</p>
          <span className="badge">{label(session.context.activeRole ?? 'Personal')}</span>
        </div>
      </div>
      <section aria-label={uiText.text_61d235c5d463}>
        <V4List>
          {[
            [uiText.text_69c1e5b1fe20, user.firstName],
            [uiText.text_3fe7ba4a2131, user.lastName],
            [uiText.text_5903c1c121cb, user.displayName],
            [uiText.text_2690bee9ac93, displayDateOnly(user.dateOfBirth)],
            [uiText.text_d7429b08c9cf, user.phoneNumber],
          ].map(([title, value]) => (
            <V4Row
              key={title}
              title={title!}
              description={<bdi>{value || uiText.text_5749a86140fa}</bdi>}
            />
          ))}
        </V4List>
      </section>
      <AccountIdentifier id={user.id} />
      <section className="card" aria-label={uiText.text_7511feb9767e}>
        <h2>{uiText.text_7511feb9767e}</h2>
        {status.isPending ? (
          <LoadingSkeleton />
        ) : status.isError ? (
          <ErrorState error={status.error} onRetry={() => void status.refetch()} />
        ) : (
          <V4List>
            <V4Row
              title={uiText.text_f56cfcd67f9c}
              description={ageVerificationLabels[status.data.verificationStatus]}
            />
            <V4Row
              title={uiText.text_c97a6f291fe6}
              description={ageCategoryLabels[status.data.effectiveAgeCategory]}
            />
            <V4Row
              title={uiText.text_96b3a0fde540}
              description={messagingNextLabels[status.data.nextAction]}
            />
          </V4List>
        )}
      </section>
      <Button variant="ghost" onClick={() => void logout()}>
        <LogOut size={18} />
        {uiText.account_logout}
      </Button>
    </V5Scene>
  );
}
export { PersonalProfileEdit } from './profile-edit';
function AccountIdentifier({ id }: { id: string }) {
  const [copied, setCopied] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <section className="card" aria-label={uiText.text_89b515f684ce}>
      <h2>{uiText.text_89b515f684ce}</h2>
      <p>
        <bdi dir="ltr">{id}</bdi>
      </p>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setFailed(false);
          } catch {
            setFailed(true);
          }
        }}
      >
        {uiText.text_72c0b5c79c22}
      </Button>
      {copied && <p role="status">{uiText.text_a0a416aef2e7}</p>}
      {failed && <p role="status">{uiText.text_59a007742acf}</p>}
    </section>
  );
}
export function PersonalPending({ area }: { area: 'resources' | 'ai' | 'subscription' }) {
  const info = {
    resources: {
      title: uiText.text_3a2a401438ce,
      text: uiText.text_dfa644fe2ec0,
    },
    ai: {
      title: uiText.text_b929671ed22f,
      text: uiText.text_bf28dfb51c5d,
    },
    subscription: {
      title: uiText.text_ab67aa4d93be,
      text: uiText.text_fb5f200e68b3,
    },
  }[area];
  return (
    <>
      <div className={s.heading}>
        <span>{uiText.text_ab3c684df5df}</span>
        <h1>{info.title}</h1>
      </div>
      <section className={s.profileCard}>
        <EmptyState title={uiText.text_177460222287} description={info.text} />
        <PageBack href="/personal" />
      </section>
    </>
  );
}
