import * as uiText from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { latinDigits } from '@/lib/formatting';
import { ApiError } from '@/lib/api/errors';
import type { ApiRequestInit } from '@/lib/api/client';
import type { ClientRequestScope } from '@/lib/client-surface';

/** Both the contact profile and the new-message picker use this account-scoped command. */
export async function startPersonalConversation(
  call: <T>(path: string, init?: ApiRequestInit & { scope?: ClientRequestScope }) => Promise<T>,
  targetUserId: string,
) {
  const result = await call<components['schemas']['DirectConversationResult']>(
    '/api/v1/conversations/direct',
    {
      method: 'POST',
      scope: 'account',
      body: JSON.stringify({ targetUserId, scope: 'Personal' }),
    },
  );
  if (result.otherParticipant.userId !== targetUserId || result.scope !== 'Personal')
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return result;
}
export function resolvePersonInput(input: string): components['schemas']['ResolvePersonCommand'] {
  const value = latinDigits(input).trim();
  if (/^[+\d\s()-]+$/.test(value)) {
    let phone = value.replace(/[\s()-]/g, '');
    if (/^09\d{9}$/.test(phone)) phone = '+98' + phone.slice(1);
    if (!/^\+989\d{9}$/.test(phone)) throw new Error(uiText.text_33698387f1a0);
    return { username: null, phoneNumber: phone };
  }
  const username = value.replace(/^@/, '');
  if (!/^[a-zA-Z0-9._]{3,32}$/.test(username)) throw new Error(uiText.text_ed1379baea73);
  return { username, phoneNumber: null };
}
