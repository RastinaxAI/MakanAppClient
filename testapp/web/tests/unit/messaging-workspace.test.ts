import { describe, expect, it } from 'vitest';
import type { components } from '@/generated/api/schema';
import {
  conversationNeedsWorkspace,
  conversationWorkspaceChoices,
  conversationWorkspaceDestination,
} from '@/features/personal/messaging/workspace-model';
import { safeAuthReturnPath } from '@/lib/auth-return';
type S = components['schemas'];
const context = {
  workspaceType: 'Personal' as const,
  organizationId: null,
  membershipId: null,
  activeRole: null,
};
const summary = {
  scope: 'Organization',
  organizationId: 'school-1',
} as S['ConversationSummaryResult'];
const space = {
  workspaceType: 'Organization',
  organizationId: 'school-1',
  organizationName: 'School',
  membershipId: 'membership',
  role: 'Teacher',
  displayName: 'Teacher',
  status: 'Active',
  canEnter: true,
  isVisible: true,
} as S['WorkspaceResult'];
const snapshot = (workspaces: S['WorkspaceResult'][]): S['WorkspaceSnapshotResult'] => ({
  workspaces,
  version: 'version',
  hasEffectiveEducationalRole: true,
  personalWorkspaceVisible: false,
  personalVisibilityDecision: 'HiddenByEducationalRole',
});
describe('conversation workspace routing', () => {
  it('requires the bound organization context but leaves personal conversations independent of roles', () => {
    expect(conversationNeedsWorkspace(summary, context)).toBe(true);
    expect(
      conversationNeedsWorkspace(summary, {
        workspaceType: 'Organization',
        organizationId: 'school-1',
        membershipId: 'membership',
        activeRole: 'Teacher',
      }),
    ).toBe(false);
    expect(
      conversationNeedsWorkspace(summary, {
        workspaceType: 'Organization',
        organizationId: 'other',
        membershipId: 'membership',
        activeRole: 'Teacher',
      }),
    ).toBe(true);
    expect(conversationNeedsWorkspace({ ...summary, scope: 'Personal' }, context)).toBe(false);
  });
  it('offers only visible enterable workspace assignments of the actual organization', () => {
    const invalid = [
      { ...space, organizationId: 'other' },
      { ...space, canEnter: false },
      { ...space, isVisible: false },
      { ...space, membershipId: null },
      { ...space, role: null },
    ];
    expect(conversationWorkspaceChoices(summary, snapshot([space, ...invalid]), context)).toEqual([
      space,
    ]);
  });
  it('does not assume the same title or role grants access to another organization', () => {
    expect(
      conversationWorkspaceChoices(
        summary,
        snapshot([{ ...space, organizationId: 'other' }]),
        context,
      ),
    ).toEqual([]);
    expect(
      conversationWorkspaceChoices(
        { ...summary, organizationId: null },
        snapshot([space]),
        context,
      ),
    ).toEqual([]);
    expect(conversationNeedsWorkspace({ ...summary, organizationId: null }, context)).toBe(true);
  });
  it('offers alternatives after an unresolved 404 without implying membership or repeating the current choice', () => {
    const current = {
      workspaceType: 'Organization' as const,
      organizationId: 'school-1',
      membershipId: 'membership',
      activeRole: 'Teacher' as const,
    };
    const otherRole = { ...space, role: 'Parent' as const };
    expect(conversationWorkspaceChoices(undefined, snapshot([space, otherRole]), current)).toEqual([
      otherRole,
    ]);
    expect(
      conversationWorkspaceChoices({ ...summary, scope: 'Personal' }, snapshot([space]), context),
    ).toEqual([]);
  });
  it('returns to the exact conversation with safely encoded identifier and search parameters', () => {
    const destination = conversationWorkspaceDestination(
      'target',
      'filter=Group&q=%D8%B1%DB%8C%D8%A7%D8%B6%DB%8C',
    );
    expect(destination).toBe(
      '/personal/messages/target?filter=Group&q=%D8%B1%DB%8C%D8%A7%D8%B6%DB%8C',
    );
    const hostile = conversationWorkspaceDestination('javascript:alert(1)/?\n', 'q=//evil.invalid');
    expect(hostile).toContain('/personal/messages/javascript%3A');
    expect(safeAuthReturnPath(hostile)).toBe(hostile);
    expect(new URL(hostile, 'https://makan.invalid').origin).toBe('https://makan.invalid');
  });
});
