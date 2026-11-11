import { randomUUID } from 'node:crypto';
import { id, make } from './state.mjs';

export function seedMessagingRepair(state, body) {
  state.messagingRepair = body;
  state.messagingInvitations = [];
  if (body.blocked)
    state.blocked.set(
      id(102),
      [
        [104, 'امیر نادری'],
        [101, 'حساب نمونه'],
      ].map(([user, displayName], index) =>
        make('BlockedUserResult', {
          blockId: id(5200 + index),
          user: make('SafeMessagingIdentityResult', { userId: id(user), displayName }),
          version: '1',
        }),
      ),
    );
  if (body.privacy)
    state.privacy.set(
      id(102),
      make('MessagingPrivacySettingsResult', {
        directMessagesAudience: 'Contacts',
        phoneNumberVisibilityAudience: 'Nobody',
        phoneNumberDiscoveryAudience: 'Nobody',
        groupInvitesAudience: 'Contacts',
        onlineAudience: 'Contacts',
        lastSeenAudience: 'Contacts',
        version: '1',
        ...body.privacy,
      }),
    );
}

export function messagingInvitationsRoute({ state, auth, url, req, send }) {
  const p = url.pathname;
  if (p === '/api/v1/messaging/invitations' && req.method === 'GET')
    return send((state.messagingInvitations ?? []).filter((i) => i.targetUserId === auth.user.id));
  const m = /^\/api\/v1\/messaging\/invitations\/([^/]+)\/(accept|decline)$/.exec(p);
  if (!m || req.method !== 'POST') return false;
  const invitation = state.messagingInvitations?.find(
    (i) => i.id === m[1] && i.targetUserId === auth.user.id,
  );
  if (!invitation) return send({ code: 'INVITATION_NOT_FOUND' }, 404);
  if (invitation.status !== 'Pending' || Date.parse(invitation.expiresAtUtc) <= Date.now())
    return send({ code: 'INVITATION_NOT_PENDING' }, 409);
  invitation.status = m[2] === 'accept' ? 'Accepted' : 'Declined';
  if (m[2] === 'accept') {
    const detail = state.conversationDetail;
    if (!detail || detail.conversationId !== invitation.conversationId)
      return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    if (!detail.participants.some((v) => v.user.userId === auth.user.id && v.status === 'Active'))
      detail.participants.push(
        make('ConversationParticipantResult', {
          participantId: randomUUID(),
          user: make('SafeMessagingIdentityResult', {
            userId: auth.user.id,
            displayName: auth.user.displayName,
            username: auth.user.username,
          }),
          role: 'Member',
          status: 'Active',
          version: '1',
        }),
      );
  }
  return send(
    state.messagingRepair?.badReceipt ? { ...invitation, conversationId: id(99999) } : invitation,
  );
}
