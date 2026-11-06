import { describe, expect, it } from 'vitest';
import type { components } from '@/generated/api/schema';
import {
  invitationCanBeAnswered,
  receivedPendingInvitations,
  validInvitationReceipt,
  currentInitialTargets,
} from '@/features/personal/messaging/invitation-model';
import {
  everyonePrivacyDraft,
  initialPrivacyDraft,
} from '@/features/personal/messaging/privacy-model';
import { isClientOperation, requiresSchoolContext } from '@/lib/client-surface';
type S = components['schemas'];
const invitation: S['ConversationInvitationResult'] = {
  id: 'invitation',
  conversationId: 'conversation',
  inviterUserId: 'sender',
  targetUserId: 'recipient',
  status: 'Pending',
  expiresAtUtc: '2099-01-01T00:00:00Z',
};
const privacy: S['MessagingPrivacySettingsResult'] = {
  directMessagesAudience: 'Contacts',
  phoneNumberVisibilityAudience: 'Nobody',
  phoneNumberDiscoveryAudience: 'Nobody',
  groupInvitesAudience: 'Contacts',
  onlineAudience: 'Contacts',
  lastSeenAudience: 'Contacts',
  isExplicit: false,
  version: 'opaque-version',
};
describe('messaging invitation and privacy boundaries', () => {
  it('does not keep calling a now-active member pending from an old creation receipt', () => {
    const targets = [
      {
        targetUserId: 'recipient',
        outcome: 'InvitationPending' as const,
        invitationId: 'invitation',
        invitationExpiresAtUtc: '2099-01-01T00:00:00Z',
      },
    ];
    const active = {
      status: 'Active',
      user: { userId: 'recipient' },
    } as S['ConversationParticipantResult'];
    expect(currentInitialTargets(targets, [active])[0].outcome).toBe('Added');
    expect(currentInitialTargets(targets, [{ ...active, status: 'Left' }])[0].outcome).toBe(
      'InvitationPending',
    );
    expect(targets[0].outcome).toBe('InvitationPending');
  });
  it('allows only a current incoming and unexpired pending invitation to be answered', () => {
    expect(invitationCanBeAnswered(invitation, 'recipient')).toBe(true);
    for (const status of ['Accepted', 'Declined', 'Revoked', 'Expired'] as const)
      expect(invitationCanBeAnswered({ ...invitation, status }, 'recipient')).toBe(false);
    expect(invitationCanBeAnswered(invitation, 'sender')).toBe(false);
    expect(
      invitationCanBeAnswered({ ...invitation, expiresAtUtc: '2020-01-01T00:00:00Z' }, 'recipient'),
    ).toBe(false);
    expect(invitationCanBeAnswered({ ...invitation, expiresAtUtc: 'invalid' }, 'recipient')).toBe(
      false,
    );
  });
  it('does not expose outgoing or other-account invitations in the incoming list', () => {
    expect(
      receivedPendingInvitations(
        [
          invitation,
          { ...invitation, targetUserId: 'another' },
          { ...invitation, status: 'Accepted' },
        ],
        'recipient',
      ),
    ).toEqual([invitation]);
  });
  it('binds an acceptance receipt to the original invitation, recipient, conversation and decision', () => {
    const accepted = { ...invitation, status: 'Accepted' as const };
    expect(validInvitationReceipt(invitation, accepted, 'accept')).toBe(true);
    for (const patch of [
      { id: 'other' },
      { conversationId: 'other' },
      { targetUserId: 'other' },
      { status: 'Pending' as const },
    ])
      expect(validInvitationReceipt(invitation, { ...accepted, ...patch }, 'accept')).toBe(false);
    expect(validInvitationReceipt(invitation, accepted, 'decline')).toBe(false);
    expect(
      validInvitationReceipt(invitation, { ...invitation, status: 'Declined' }, 'decline'),
    ).toBe(true);
  });
  it('offers Everyone for non-explicit defaults without mutating the effective server object', () => {
    const draft = initialPrivacyDraft(privacy);
    for (const k of [
      'directMessagesAudience',
      'phoneNumberVisibilityAudience',
      'phoneNumberDiscoveryAudience',
      'groupInvitesAudience',
      'onlineAudience',
      'lastSeenAudience',
    ] as const)
      expect(draft[k]).toBe('Everyone');
    expect(privacy.groupInvitesAudience).toBe('Contacts');
    expect(draft.version).toBe('opaque-version');
    expect(draft.isExplicit).toBe(false);
  });
  it('preserves saved choices and absent optional fields unless the user chooses the Everyone draft', () => {
    const explicit = { ...privacy, isExplicit: true };
    expect(initialPrivacyDraft(explicit)).toEqual(explicit);
    expect(everyonePrivacyDraft(explicit).groupInvitesAudience).toBe('Everyone');
    const { onlineAudience: _online, lastSeenAudience: _last, ...old } = privacy;
    expect(everyonePrivacyDraft(old)).not.toHaveProperty('onlineAudience');
    expect(everyonePrivacyDraft(old)).not.toHaveProperty('lastSeenAudience');
  });
  it('connects only published recipient operations independently of school role', () => {
    expect(isClientOperation('GET', '/api/v1/messaging/invitations')).toBe(true);
    for (const action of ['accept', 'decline'])
      expect(
        isClientOperation('POST', `/api/v1/messaging/invitations/{invitationId}/${action}`),
      ).toBe(true);
    expect(requiresSchoolContext('/api/v1/messaging/invitations')).toBe(false);
    expect(
      isClientOperation('POST', '/api/admin/v1/messaging/invitations/{invitationId}/accept'),
    ).toBe(false);
  });
});
