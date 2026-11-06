import type { components } from '@/generated/api/schema';
import { canEnterWorkspace, visibleWorkspaces } from '../workspace-model';
type S = components['schemas'];
type Context = Pick<
  S['AccessContext'],
  'workspaceType' | 'organizationId' | 'membershipId' | 'activeRole'
>;
type Summary = S['ConversationSummaryResult'];

export function conversationNeedsWorkspace(summary: Summary, context: Context) {
  return (
    summary.scope === 'Organization' &&
    (!summary.organizationId ||
      context.workspaceType !== 'Organization' ||
      context.organizationId !== summary.organizationId ||
      !context.membershipId ||
      !context.activeRole)
  );
}

export function conversationWorkspaceChoices(
  summary: Summary | undefined,
  snapshot: S['WorkspaceSnapshotResult'],
  context: Context,
) {
  if (summary && (summary.scope !== 'Organization' || !summary.organizationId)) return [];
  return visibleWorkspaces(snapshot).filter(
    (w) =>
      w.workspaceType === 'Organization' &&
      w.organizationId &&
      w.membershipId &&
      w.role &&
      canEnterWorkspace(w) &&
      (!summary || w.organizationId === summary.organizationId) &&
      !(
        context.workspaceType === 'Organization' &&
        context.membershipId === w.membershipId &&
        context.activeRole === w.role
      ),
  );
}

export function conversationWorkspaceDestination(
  id: string,
  search = '',
): `/personal/messages/${string}` {
  const params = new URLSearchParams(search).toString();
  return `/personal/messages/${encodeURIComponent(id)}${params ? '?' + params : ''}`;
}
