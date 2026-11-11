'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { aiIntegration as t } from '@/content/fa';
import { usePersonal } from '../provider';
import type { AiPayer } from './model';
import { useQuery } from '@tanstack/react-query';
import { readAssistantQuota } from './preflight';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { number } from '@/lib/formatting';
export function AssistantPayer({
  value,
  onChange,
  disabled = false,
  checkQuota = true,
}: {
  value: AiPayer | '';
  onChange: (value: AiPayer | '') => void;
  disabled?: boolean;
  checkQuota?: boolean;
}) {
  const { session } = usePersonal();
  return (
    <div className={uiClass('stack')}>
      <label className={uiClass('field')}>
        {t.payer}
        <NativeSelect
          aria-label={t.payer}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as AiPayer | '')}
        >
          <option value="">{t.choosePayer}</option>
          {(
            [
              'Individual',
              ...(session.context.workspaceType === 'Organization' ? ['Organization'] : []),
              'FreeTrial',
            ] as AiPayer[]
          ).map((payer) => (
            <option key={payer} value={payer}>
              {t.payers[payer]}
            </option>
          ))}
        </NativeSelect>
        <small>{t.payerPolicy}</small>
      </label>
      {checkQuota && value && !disabled && <AssistantQuotaNotice payer={value} />}
    </div>
  );
}

function AssistantQuotaNotice({ payer }: { payer: AiPayer }) {
  const { session, call } = usePersonal();
  const quota = useQuery({
    queryKey: ['personal', session.user.id, session.revision, 'assistant-quota-preview', payer],
    queryFn: ({ signal }) => readAssistantQuota(call, session, payer, signal),
    staleTime: 10000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const denied = quota.data && (!quota.data.allowed || quota.data.requiresExplicitSelection);
  const message = denied
    ? new ApiError(403, { code: quota.data.errorCode ?? 'AI_QUOTA_NOT_AVAILABLE' }).message
    : undefined;
  return (
    <div className={uiClass('stack')} data-assistant-quota-preview>
      <p className={uiClass('policy')} role="status">
        {quota.isPending
          ? t.checkingCredit
          : quota.isError
            ? t.creditCheckFailed
            : denied
              ? message
              : quota.data.remaining === null
                ? t.creditAvailable
                : `${t.creditRemaining} ${number(quota.data.remaining)}`}
      </p>
      {(quota.isError || denied) && (
        <Button variant="outline" disabled={quota.isFetching} onClick={() => void quota.refetch()}>
          {t.refreshCredit}
        </Button>
      )}
    </div>
  );
}
