import type { components } from '@/generated/api/schema';
import type { ApiRequestInit } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { ClientState } from '@/lib/server/client-session';
import type { AiPayer } from './model';
type S = components['schemas'];
type Call = <T>(path: string, init?: ApiRequestInit) => Promise<T>;
export async function readAssistantQuota(
  call: Call,
  session: ClientState,
  payer: AiPayer,
  signal: AbortSignal,
) {
  const organization = session.context.workspaceType === 'Organization';
  const result = await call<S['AiQuotaPreflightDto']>('/api/v1/commerce/ai/simple-text/preflight', {
    method: 'POST',
    signal,
    expectedStatus: 200,
    body: JSON.stringify({
      contextType: organization ? 'Organization' : 'Personal',
      contextId: organization ? session.context.organizationId : null,
      payer,
    }),
  });
  const ownerType = payer === 'Organization' ? 'Organization' : 'Individual';
  const ownerId = payer === 'Organization' ? session.context.organizationId : session.user.id;
  if (
    result.payer !== payer ||
    result.ownerType !== ownerType ||
    !ownerId ||
    result.ownerId !== ownerId
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return result;
}
export async function checkAssistantQuota(
  call: Call,
  session: ClientState,
  payer: AiPayer,
  signal: AbortSignal,
) {
  const result = await readAssistantQuota(call, session, payer, signal);
  if (!result.allowed || result.requiresExplicitSelection)
    throw new ApiError(403, { code: result.errorCode ?? 'AI_QUOTA_NOT_AVAILABLE' });
}
