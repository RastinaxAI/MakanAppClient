import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import type { ApiRequestInit } from '@/lib/api/client';
import type { ClientRequestScope } from '@/lib/client-surface';
type S = components['schemas'];
export type MessageMutation = 'edit' | 'delete' | 'pin' | 'unpin';
type ClientCall = <T>(
  path: string,
  init?: ApiRequestInit & { scope?: ClientRequestScope },
) => Promise<T>;
/** Only documented commands. A mismatched or stale receipt never changes visible history. */
export async function mutateMessage(
  call: ClientCall,
  message: S['ConversationMessageResult'],
  action: MessageMutation,
  text?: string,
) {
  if (message.isDeleted) throw new ApiError(409, { code: 'MESSAGE_NOT_AVAILABLE' });
  const base = '/api/v1/conversations/' + message.conversationId;
  if (action === 'pin' || action === 'unpin') {
    const result = await call<S['ConversationPinResult']>(base + '/pins/' + message.messageId, {
      method: action === 'pin' ? 'POST' : 'DELETE',
    });
    if (
      result.conversationId !== message.conversationId ||
      result.messageId !== message.messageId ||
      result.isPinned !== (action === 'pin')
    )
      throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
    return { isPinned: result.isPinned };
  }
  if (action === 'edit' && !text?.trim() && !message.attachments.length)
    throw new ApiError(400, { code: 'VALIDATION_ERROR' });
  const result = await call<S['MessageMutationResult']>(
    base +
      '/messages/' +
      message.messageId +
      (action === 'delete'
        ? '/for-everyone?' + new URLSearchParams({ expectedVersion: message.version })
        : ''),
    {
      method: action === 'edit' ? 'PATCH' : 'DELETE',
      ...(action === 'edit'
        ? {
            body: JSON.stringify({
              text: text?.trim() || null,
              expectedVersion: message.version,
            } satisfies S['EditMessageCommand']),
          }
        : {}),
    },
  );
  if (
    result.messageId !== message.messageId ||
    result.sequence !== message.sequence ||
    !result.version ||
    result.isDeleted !== (action === 'delete')
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return {
    ...result,
    ...(action === 'edit'
      ? { text: text?.trim() || null, isEdited: true }
      : { text: null, isPinned: false }),
  };
}
