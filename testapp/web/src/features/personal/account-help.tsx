'use client';
import * as uiText from '@/content/fa';
import { v4Text as t } from '@/content/fa';
import { BookOpen, ShieldCheck, Smartphone, Phone, CircleHelp, Trash2 } from 'lucide-react';
import { V4Page, V4Hero, V4List, V4Row, V4Note } from '@/components/v4/page';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { InstallPanel } from '@/features/pwa/install';
import { usePersonalApi } from './provider';
import { ageCategoryLabels, ageVerificationLabels, messagingNextLabels } from './status-labels';
import type { components } from '@/generated/api/schema';
export type AccountHelpSection =
  | 'help'
  | 'phone'
  | 'delete-account'
  | 'communication'
  | 'install'
  | 'support';
export function AccountHelp({ section }: { section: AccountHelpSection }) {
  const ids = {
    help: 'MK-355',
    phone: 'MK-440',
    'delete-account': 'MK-441',
    communication: 'MK-353',
    install: 'MK-354',
    support: 'MK-442',
  };
  const titles = {
    help: t.support,
    phone: t.phoneChange,
    'delete-account': t.deleteAccount,
    communication: t.communication,
    install: t.install,
    support: t.supportTicket,
  };
  const proposal = ['phone', 'delete-account', 'support'].includes(section);
  return (
    <V4Page id={ids[section]} title={titles[section]} back="/personal/settings">
      {proposal ? (
        <>
          <V4Note>{t.proposalHint}</V4Note>
          <V4List>
            <V4Row
              title={t.helpArticle}
              description={t.helpDescription}
              icon={<BookOpen />}
              href="/personal/settings/help"
            />
          </V4List>
        </>
      ) : section === 'communication' ? (
        <CommunicationStatus />
      ) : section === 'install' ? (
        <>
          <V4Hero title={t.install}>{t.helpDescription}</V4Hero>
          <InstallPanel />
        </>
      ) : (
        <>
          <V4Hero title={t.helpIntro}>{t.helpBody}</V4Hero>
          <V4List>
            <V4Row
              title={t.communication}
              icon={<ShieldCheck />}
              href="/personal/settings/communication"
            />
            <V4Row title={t.install} icon={<Smartphone />} href="/personal/settings/install" />
            <V4Row title={t.phoneChange} icon={<Phone />} href="/personal/settings/phone" />
            <V4Row
              title={t.supportTicket}
              icon={<CircleHelp />}
              href="/personal/settings/support"
            />
            <V4Row
              title={t.deleteAccount}
              icon={<Trash2 />}
              href="/personal/settings/delete-account"
            />
          </V4List>
          <V4Hero title={t.helpPrivacy}>{t.helpPrivacyBody}</V4Hero>
        </>
      )}
    </V4Page>
  );
}
function CommunicationStatus() {
  const data = usePersonalApi<components['schemas']['MessagingStatusResult']>(
    '/api/v1/me/messaging-status',
  );
  return data.isPending ? (
    <LoadingSkeleton />
  ) : data.isError ? (
    <ErrorState error={data.error} onRetry={() => void data.refetch()} />
  ) : (
    <V4List>
      <V4Row
        title={uiText.text_c97a6f291fe6}
        description={ageCategoryLabels[data.data.effectiveAgeCategory]}
      />
      <V4Row
        title={uiText.text_f56cfcd67f9c}
        description={ageVerificationLabels[data.data.verificationStatus]}
      />
      <V4Row
        title={uiText.text_96b3a0fde540}
        description={messagingNextLabels[data.data.nextAction]}
      />
    </V4List>
  );
}
