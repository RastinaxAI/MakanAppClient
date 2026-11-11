'use client';
import { uiClass } from '@/components/v5/classes';

import Link from 'next/link';
import { MessagesSquare, Megaphone } from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import { integration80c as t } from '@/content/fa';
import { usePersonalApi } from '@/features/personal/provider';
import {
  readableOfficialEndpoint,
  type OfficialPair,
} from '@/features/personal/messaging/official-model';
import { classApi, stateLabel } from './api-model';

/** Read the existing class-bound pair; an organizational role never grants access here. */
export function ClassPreviewSpaces({ id }: { id: string }) {
  const query = usePersonalApi<OfficialPair>(`${classApi}/${id}/spaces`);
  if (query.isPending) return <LoadingSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  const pair = query.data;
  if (pair.sourceKind !== 'PersonalClass' || pair.sourceId !== id || pair.organizationId !== null)
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  return (
    <div className={uiClass('link-pair')} aria-label={t.spaces}>
      {(['Group', 'Channel'] as const).map((purpose) => {
        const space = purpose === 'Group' ? pair.group : pair.channel;
        const Icon = purpose === 'Group' ? MessagesSquare : Megaphone;
        const content = (
          <>
            <Icon size={24} />
            <b>{purpose === 'Group' ? t.group : t.channel}</b>
            <div className={uiClass('small muted')}>{stateLabel(space.state)}</div>
          </>
        );
        return readableOfficialEndpoint(pair, purpose) ? (
          <Link
            className={uiClass('link-card')}
            key={purpose}
            href={`/personal/messages/${space.conversationId}`}
          >
            {content}
          </Link>
        ) : (
          <div className={uiClass('link-card')} key={purpose}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
