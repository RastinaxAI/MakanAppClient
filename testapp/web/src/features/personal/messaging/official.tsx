'use client';
import { uiClass } from '@/components/v5/classes';

import { BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { v6Ui as t } from '@/content/fa';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import {
  officialMetadataMatches,
  officialPairPath,
  officialConversationCapabilities,
  type OfficialPair,
} from './official-model';
import s from '../school/official-spaces.module.css';

export function OfficialIdentity({
  summary,
}: {
  summary: components['schemas']['ConversationSummaryResult'];
}) {
  if (!officialMetadataMatches(summary) || !summary.official) return null;
  const source = summary.official;
  const href =
    source.sourceKind === 'PersonalClass'
      ? '/personal/extracurricular/classes/' + encodeURIComponent(source.sourceId)
      : source.sourceKind === 'Class'
        ? '/personal/education/classes/' + encodeURIComponent(source.sourceId)
        : '/personal/education';
  return (
    <section className={uiClass('card')} data-v6-official-identity>
      <h3>
        <BadgeCheck size={18} /> {t.officialIdentity}
      </h3>
      <div className={uiClass('kv')}>
        <span className={uiClass('key')}>{t.officialSource}</span>
        <b className={uiClass('val')}>{source.displayLabel}</b>
      </div>
      <div className={uiClass('kv')}>
        <span className={uiClass('key')}>{t.officialDomain}</span>
        <b className={uiClass('val')}>
          {source.sourceKind === 'PersonalClass'
            ? t.independentTag
            : source.sourceKind === 'Class'
              ? t.schoolClass
              : t.schoolOrganization}
        </b>
      </div>
      <p>{t.officialMembership}</p>
      <Button asChild variant="outline">
        <Link href={href}>{t.viewOfficialSource}</Link>
      </Button>
    </section>
  );
}

export function OfficialBadge({
  summary,
  compact = false,
}: {
  summary: components['schemas']['ConversationSummaryResult'];
  compact?: boolean;
}) {
  return officialMetadataMatches(summary) ? (
    <span
      className={uiClass(compact ? s.compactBadge : s.badge)}
      aria-label={compact ? summary.official!.displayLabel : undefined}
      title={summary.official!.displayLabel}
    >
      <BadgeCheck size={15} />
      {!compact && summary.official!.displayLabel}
    </span>
  ) : null;
}
export function useOfficialConversationAccess(
  summary: components['schemas']['ConversationSummaryResult'],
) {
  const { session } = usePersonal();
  const declared = !!summary.official || summary.isOfficial === true;
  const binding =
    officialMetadataMatches(summary) &&
    (summary.official?.sourceKind === 'PersonalClass' ||
      (session.context.workspaceType === 'Organization' &&
        summary.organizationId === session.context.organizationId));
  const q = usePersonalApi<OfficialPair>(
    summary.official ? officialPairPath(summary.official) : '/api/v1/organization/official-spaces',
    {
      enabled: declared && binding,
      poll: 5000,
    },
  );
  const caps = binding && q.isSuccess ? officialConversationCapabilities(summary, q.data) : null;
  const error = !declared
    ? undefined
    : !binding
      ? new ApiError(403)
      : (q.error ?? (q.isSuccess && !caps ? new ApiError(403) : undefined));
  return {
    declared,
    ready: !declared || !!caps,
    canRead: !declared || !!caps?.canRead,
    canSend: !declared || !!caps?.canSend,
    canManage: !declared || !!caps?.canManage,
    error,
    refetch: q.refetch,
  };
}
