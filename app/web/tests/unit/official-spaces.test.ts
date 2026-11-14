import { describe, it, expect } from 'vitest';
import type { components } from '@/generated/api/schema';
import {
  officialMetadataMatches,
  readableOfficialEndpoint,
  officialConversationCapabilities,
  officialPairPath,
  academicActivityMatches,
  academicActivityHref,
  type OfficialPair,
} from '@/features/personal/messaging/official-model';
import { filterAccountInbox } from '@/features/personal/messaging/inbox-model';
type S = components['schemas'];
const meta = {
  sourceKind: 'Class',
  sourceId: 'class',
  organizationId: 'org',
  purpose: 'Group',
  displayLabel: 'گروه رسمی',
  version: '1',
} as const;
const endpoint = {
  conversationId: 'group',
  state: 'Ready',
  capabilities: { canRead: true, canSend: false, canManage: false },
  official: meta,
  attemptCount: 0,
  lastFailureCategory: null,
};
const pair = (): OfficialPair => ({
  sourceKind: 'Class',
  sourceId: 'class',
  organizationId: 'org',
  version: '1',
  group: { ...endpoint },
  channel: {
    ...endpoint,
    conversationId: 'channel',
    state: 'RepairRequired',
    official: { ...meta, purpose: 'Channel' },
  },
});
const summary = (patch: Partial<S['ConversationSummaryResult']> = {}) =>
  ({
    conversationId: 'group',
    type: 'Group',
    scope: 'Organization',
    organizationId: 'org',
    title: 'نام دلخواه',
    official: meta,
    ...patch,
  }) as S['ConversationSummaryResult'];
const activity = {
  eventId: 'event',
  kind: 'Assignment',
  sourceId: 'task',
  sourceVersionId: 'version',
  sourceRevision: 1,
  organizationId: 'org',
  classId: 'class',
  destinationConversationId: 'group',
  destinationPurpose: 'Group',
  actorKind: 'User',
  initiatedByUserId: 'teacher',
  occurredAtUtc: '2026-10-30T00:00:00Z',
  title: 'تکلیف',
  dueAtUtc: null,
  availableFromUtc: null,
  availableUntilUtc: null,
  state: 'Published',
  isActionable: true,
} satisfies NonNullable<S['AcademicActivityCardResult']>;
describe('server-bound official spaces', () => {
  it('does not grant a badge from a title or an unbound boolean', () => {
    expect(
      officialMetadataMatches(summary({ title: 'گروه رسمی', official: null, isOfficial: true })),
    ).toBe(false);
    expect(officialMetadataMatches(summary({ organizationId: 'another-org' }))).toBe(false);
    expect(officialMetadataMatches(summary())).toBe(true);
  });
  it('keeps a readable group usable independently of a broken channel', () => {
    const p = pair();
    expect(readableOfficialEndpoint(p, 'Group')).toBe(true);
    expect(readableOfficialEndpoint(p, 'Channel')).toBe(false);
    expect(officialConversationCapabilities(summary(), p)?.canSend).toBe(false);
  });
  it('rejects a ready pair that points both purposes at the same conversation', () => {
    const p = pair();
    p.channel.state = 'Ready';
    p.channel.conversationId = p.group.conversationId;
    expect(readableOfficialEndpoint(p, 'Group')).toBe(false);
    expect(readableOfficialEndpoint(p, 'Channel')).toBe(false);
    expect(officialConversationCapabilities(summary(), p)).toBeNull();
  });
  it('requires explicit read permission and the exact source and conversation bindings', () => {
    const p = pair();
    p.group.capabilities = { canRead: false, canSend: true, canManage: true };
    expect(readableOfficialEndpoint(p, 'Group')).toBe(false);
    expect(officialConversationCapabilities(summary(), p)).toBeNull();
    expect(
      officialConversationCapabilities(summary({ conversationId: 'another-chat' }), pair()),
    ).toBeNull();
    expect(
      officialConversationCapabilities(summary(), { ...pair(), sourceId: 'another-class' }),
    ).toBeNull();
  });
  it('renders structured activities only for matching System messages and official class bindings', () => {
    const m = {
      conversationId: 'group',
      originKind: 'System',
      academicActivity: activity,
    } as S['ConversationMessageResult'];
    expect(academicActivityMatches(m, summary())).toBe(true);
    expect(academicActivityMatches({ ...m, originKind: 'User' }, summary())).toBe(false);
    expect(
      academicActivityMatches(
        { ...m, academicActivity: { ...activity, classId: 'another-class' } },
        summary(),
      ),
    ).toBe(false);
    expect(academicActivityHref(activity)).toBe('/personal/education/assignments/task');
  });
});

describe('independent official bindings and account inbox views', () => {
  const metadata = {
    ...meta,
    sourceKind: 'PersonalClass' as const,
    sourceId: 'independent',
    organizationId: null,
  };
  const personal = summary({ scope: 'Personal', organizationId: null, official: metadata });
  const ownPair: OfficialPair = {
    ...pair(),
    sourceKind: 'PersonalClass',
    sourceId: 'independent',
    organizationId: null,
    group: {
      ...endpoint,
      official: metadata,
      capabilities: { canRead: true, canSend: true, canManage: false },
    },
    channel: { ...pair().channel, official: { ...metadata, purpose: 'Channel' } },
  };
  it('uses the actual independent pair without requiring an organization role', () => {
    expect(officialMetadataMatches(personal)).toBe(true);
    expect(officialPairPath(metadata)).toBe('/api/v1/personal-classes/independent/spaces');
    expect(officialConversationCapabilities(personal, ownPair)?.canSend).toBe(true);
    expect(
      officialConversationCapabilities(personal, { ...ownPair, sourceId: 'other-class' }),
    ).toBeNull();
    expect(
      officialConversationCapabilities(personal, {
        ...ownPair,
        group: {
          ...ownPair.group,
          capabilities: { canRead: false, canSend: true, canManage: true },
        },
      }),
    ).toBeNull();
  });
  it('rejects a personal-class badge bound to an organization or another purpose', () => {
    expect(officialMetadataMatches(summary({ official: metadata }))).toBe(false);
    expect(
      officialMetadataMatches({ ...personal, official: { ...metadata, purpose: 'Channel' } }),
    ).toBe(false);
  });
  it('filters loaded pages without sorting or treating an unbound flag as a personal conversation', () => {
    const direct = summary({
      conversationId: 'direct',
      scope: 'Personal',
      organizationId: null,
      official: null,
      isOfficial: false,
      type: 'Direct',
    });
    const bad = { ...direct, conversationId: 'bad', isOfficial: true };
    const rows = [personal, direct, bad, summary()];
    expect(filterAccountInbox(rows, 'all')).toEqual(rows);
    expect(filterAccountInbox(rows, 'personal')).toEqual([direct]);
    expect(filterAccountInbox(rows, 'official')).toEqual([personal, rows[3]]);
  });
});
