'use client';
import { Select as NativeSelect, Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useState } from 'react';
import { vnext as t } from '@/content/fa';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { date } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { useResourceCommand } from '../use-resource-command';
import { Card, Field, Pager } from './shared';
import { invitationRevokePath } from './vnext-model';
import s from './school.module.css';
type S = components['schemas'];
export function SentInvitations() {
  const { session } = usePersonal();
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [kind, setKind] = useState('');
  const query = new URLSearchParams({
    page: String(page),
    pageSize: '30',
    ...(status ? { status } : {}),
    ...(kind ? { invitationType: kind } : {}),
  });
  const q = usePersonalApi<S['SchoolPageOfSchoolSentInvitationDto']>(
    '/api/v1/organization/invitations?' + query,
  );
  return (
    <Card title={t.sentInvitations}>
      <p className={uiClass(s.hint)}>{t.sentHint}</p>
      <div className={uiClass(s.two)}>
        <Field label={t.status}>
          <NativeSelect
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            {['Pending', 'Accepted', 'Declined', 'Expired', 'Revoked'].map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t.invitationType}>
          <NativeSelect
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            {(['Membership', 'PersonLink', 'GuardianLink'] as const).map((v) => (
              <option key={v} value={v}>
                {t[v]}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.items.some((i) => i.organizationId !== session.context.organizationId) ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : (
        <>
          {!q.data.items.length && <EmptyState title={t.empty} />}
          <div className={uiClass(s.editorList)}>
            {q.data.items.map((item) => (
              <SentInvitation key={item.invitationId} item={item} />
            ))}
          </div>
          <Pager
            page={q.data.page}
            total={q.data.totalCount}
            size={q.data.pageSize}
            onChange={setPage}
          />
        </>
      )}
    </Card>
  );
}
function SentInvitation({ item }: { item: S['SchoolSentInvitationDto'] }) {
  const command = useResourceCommand('school-invitation:' + item.invitationId);
  const path = invitationRevokePath(item);
  const [reason, setReason] = useState('');
  return (
    <article className={uiClass(s.question)}>
      <h3>{item.targetDisplayName}</h3>
      {item.targetUsername && (
        <bdi>
          {uiText.text_c3641f8544d7}
          {item.targetUsername}
        </bdi>
      )}
      <p>
        {t[item.invitationType]}
        {uiText.text_588da4105320}
        {label(item.status)}
        {uiText.text_588da4105320}
        {label(item.role)}
      </p>
      <p>{date(item.expiresAtUtc, true)}</p>
      {path && item.version ? (
        <>
          <Field label={t.reason}>
            <NativeInput
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <ConfirmAction
            title={t.revoke}
            trigger={t.revoke}
            confirm={t.revoke}
            description={item.targetDisplayName}
            disabled={command.busy || !reason.trim()}
            destructive
            onConfirm={async () => {
              const result = await command.run(
                path,
                { expectedRowVersion: item.version, reason: reason.trim() },
                { throwOnError: true },
              );
              if (!result) throw command.error ?? new ApiError(409);
              return true;
            }}
          />
        </>
      ) : (
        item.status === 'Pending' && <p className={uiClass(s.hint)}>{t.unavailableAction}</p>
      )}
      {command.feedback}
    </article>
  );
}
