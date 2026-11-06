import { seedConversationDetails } from './conversation-details.mjs';
import { ids } from './state.mjs';

export function seedConversationContext(state, body) {
  seedConversationDetails(state, body);
  state.conversationContext = body;
  Object.assign(state.conversationDetail, {
    scope: 'Organization',
    organizationId: ids.org,
    title: 'گفتگوی آموزشگاه برای آزمون زمینه',
  });
}

export function conversationContextRoute({ state, auth, url, send }) {
  if (!state.conversationContext) return false;
  const p = url.pathname,
    v = state.conversationDetail;
  if (p === '/api/v1/conversations/account' && state.conversationContext.hiddenFromAccount)
    return send({ items: [], nextCursor: null, hasMore: false });
  if (!v || !p.startsWith('/api/v1/conversations/' + v.conversationId)) return false;
  if (
    state.conversationContext.revoked ||
    auth.context.workspaceType !== 'Organization' ||
    auth.context.organizationId !== v.organizationId
  )
    return send({ code: 'CONVERSATION_NOT_FOUND', traceId: 'fixture-context-hidden' }, 404);
  return false;
}
