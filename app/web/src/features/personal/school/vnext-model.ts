import type { components } from '@/generated/api/schema';
type S = components['schemas'];
export function applyMembershipReceipt(
  baseline: S['SchoolMemberResult'],
  receipt: S['SchoolMembershipMutationResult'],
): S['SchoolMemberResult'] | undefined {
  if (receipt.membershipId !== baseline.membershipId || !receipt.membershipVersion) return;
  return {
    ...baseline,
    version: receipt.membershipVersion,
    membershipStatus: receipt.status,
    roleAssignments: receipt.activeRoleAssignments,
    activeRoles: receipt.activeRoleAssignments
      .filter((r) => r.status === 'Active')
      .map((r) => r.role),
  };
}
export function invitationRevokePath(item: S['SchoolSentInvitationDto']) {
  if (item.status !== 'Pending' || !item.allowedActions.includes('Revoke')) return;
  if (item.invitationType === 'PersonLink' && item.organizationPersonId)
    return `/api/v1/organization/people/${item.organizationPersonId}/invitations/${item.invitationId}/revoke`;
  if (item.invitationType === 'GuardianLink')
    return `/api/v1/organization/guardian-invitations/${item.invitationId}/revoke`;
  // No public organization-membership invitation revoke endpoint was published.
}
