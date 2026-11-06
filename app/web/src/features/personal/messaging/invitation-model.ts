import type { components } from '@/generated/api/schema';
type Invitation = components['schemas']['ConversationInvitationResult'];

/** A creation receipt can outlive acceptance; current membership wins over Pending. */
export function currentInitialTargets(
  targets: readonly components['schemas']['ConversationInitialTargetResult'][],
  participants: readonly components['schemas']['ConversationParticipantResult'][],
) {
  const active = new Set(
    participants.filter((p) => p.status === 'Active').map((p) => p.user.userId),
  );
  return targets.map((t) =>
    t.outcome === 'InvitationPending' && active.has(t.targetUserId)
      ? { ...t, outcome: 'Added' as const }
      : t,
  );
}

export function receivedPendingInvitations(items: readonly Invitation[], userId: string) {
  return items.filter((item) => item.targetUserId === userId && item.status === 'Pending');
}

export function invitationCanBeAnswered(item: Invitation, userId: string, now = Date.now()) {
  return (
    item.targetUserId === userId &&
    item.status === 'Pending' &&
    Number.isFinite(Date.parse(item.expiresAtUtc)) &&
    Date.parse(item.expiresAtUtc) > now
  );
}

export function validInvitationReceipt(
  current: Invitation,
  result: Invitation,
  decision: 'accept' | 'decline',
) {
  return (
    result.id === current.id &&
    result.conversationId === current.conversationId &&
    result.targetUserId === current.targetUserId &&
    result.status === (decision === 'accept' ? 'Accepted' : 'Declined')
  );
}
