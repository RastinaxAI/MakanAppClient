import { describe, expect, it, vi } from 'vitest';
import type { components } from '@/generated/api/schema';
import { mutateMessage } from '@/features/personal/messaging/message-mutations';
import { mentionRange, mentionedIds } from '@/features/personal/messaging/mentions';
import { visiblePresence, visiblePresenceDetail } from '@/features/personal/messaging/model';
import { messageLinks } from '@/features/personal/messaging/media-model';
import { samplePeaks } from '@/features/personal/messaging/voice-message';
import { startPersonalConversation } from '@/features/personal/messaging/directory';
import { ApiError } from '@/lib/api/errors';
type S = components['schemas'];
const message: S['ConversationMessageResult'] = {
  conversationId: '00000000-0000-4000-8000-000000000009',
  messageId: '00000000-0000-4000-8000-000000000101',
  sequence: 7,
  version: 'version+/=',
  isDeleted: false,
  attachments: [],
  text: 'old',
  senderUserId: '00000000-0000-4000-8000-000000000101',
  sender: { userId: '00000000-0000-4000-8000-000000000101', username: 'test', displayName: 'test' },
  clientMessageId: '00000000-0000-4000-8000-000000000102',
  kind: 'Text',
  sentAtUtc: '2026-11-13T00:00:00Z',
  editedAtUtc: null,
  deletedAtUtc: null,
  isEdited: false,
  reply: null,
  isForwarded: false,
  reactions: [],
  mentions: [],
  contactCard: null,
  isPinned: false,
  topicId: null,
  isSilent: false,
};
const receipt = {
  messageId: message.messageId,
  sequence: message.sequence,
  version: 'new',
  editedAtUtc: '2026-11-13T00:00:00Z',
  deletedAtUtc: null,
  isDeleted: false,
};
describe('message mutations use the documented identity and version', () => {
  it('edits the frozen version and accepts only the intended message receipt', async () => {
    const api = vi.fn().mockResolvedValue(receipt);
    const patch = await mutateMessage(api, message, 'edit', '  new text  ');
    expect(api.mock.calls[0][1]).toEqual({
      method: 'PATCH',
      body: JSON.stringify({ text: 'new text', expectedVersion: message.version }),
    });
    expect(patch).toMatchObject({ text: 'new text', isEdited: true, version: 'new' });
    api.mockResolvedValue({ ...receipt, messageId: '00000000-0000-4000-8000-000000000999' });
    await expect(mutateMessage(api, message, 'edit', 'new')).rejects.toMatchObject({ status: 502 });
  });
  it('rejects another sequence, deleted edit receipts and blank text without making up a success', async () => {
    const api = vi.fn().mockResolvedValue({ ...receipt, sequence: 99 });
    await expect(mutateMessage(api, message, 'edit', 'new')).rejects.toMatchObject({ status: 502 });
    api.mockResolvedValue({ ...receipt, isDeleted: true });
    await expect(mutateMessage(api, message, 'edit', 'new')).rejects.toMatchObject({ status: 502 });
    api.mockClear();
    await expect(mutateMessage(api, message, 'edit', '  ')).rejects.toMatchObject({ status: 400 });
    expect(api).not.toHaveBeenCalled();
  });
  it('uses explicit everyone deletion and URL-encodes the original concurrency token', async () => {
    const api = vi
      .fn()
      .mockResolvedValue({ ...receipt, isDeleted: true, deletedAtUtc: '2026-11-13T00:00:00Z' });
    expect(await mutateMessage(api, message, 'delete')).toMatchObject({
      isDeleted: true,
      text: null,
    });
    const url = new URL(api.mock.calls[0][0], 'https://example.test');
    expect(url.pathname).toBe(
      `/api/v1/conversations/${message.conversationId}/messages/${message.messageId}/for-everyone`,
    );
    expect(url.searchParams.get('expectedVersion')).toBe(message.version);
  });
  it('propagates a version conflict unchanged so the UI can retain the edit', async () => {
    const conflict = new ApiError(409, { code: 'VERSION_CONFLICT' });
    const api = vi.fn().mockRejectedValue(conflict);
    await expect(mutateMessage(api, message, 'edit', 'new')).rejects.toBe(conflict);
  });
  it('binds pin acknowledgements to the conversation, message and requested state', async () => {
    const api = vi.fn().mockResolvedValue({
      conversationId: message.conversationId,
      messageId: message.messageId,
      isPinned: true,
    });
    expect(await mutateMessage(api, message, 'pin')).toEqual({ isPinned: true });
    await expect(mutateMessage(api, message, 'unpin')).rejects.toMatchObject({ status: 502 });
    api.mockResolvedValue({
      conversationId: 'other',
      messageId: message.messageId,
      isPinned: true,
    });
    await expect(mutateMessage(api, message, 'pin')).rejects.toMatchObject({ status: 502 });
  });
});
it('new-message selection never turns a receipt for another identity into a personal chat', async () => {
  const api = vi
    .fn()
    .mockResolvedValue({ scope: 'Personal', otherParticipant: { userId: 'wrong' } });
  await expect(startPersonalConversation(api, 'target')).rejects.toMatchObject({ status: 502 });
  expect(api.mock.calls[0][1]).toMatchObject({
    scope: 'account',
    body: JSON.stringify({ targetUserId: 'target', scope: 'Personal' }),
  });
});
it('link extraction excludes executable schemes, credentials and prose punctuation', () => {
  expect(
    messageLinks(
      'javascript:alert(1) data:text/html,hello https://user:pass@example.test https://example.test/a. https://example.test/a.',
    ),
  ).toEqual(['https://example.test/a']);
});
it('waveforms contain measured sample peaks and never fill silence or missing audio with random bars', () => {
  expect(samplePeaks(new Float32Array())).toEqual([]);
  expect(samplePeaks(new Float32Array([0, 0, 0, 0]), 2)).toEqual([0, 0]);
  expect(samplePeaks(new Float32Array([0, -0.5, 0.25, 1]), 2)).toEqual([0.5, 1]);
});

it('honors hidden, expiry and target identity in server presence', () => {
  const value: S['PresenceResult'] = {
    userId: 'teacher',
    state: 'Online',
    lastSeenAtUtc: null,
    expiresAtUtc: '2026-11-13T01:00:00Z',
  };
  const now = Date.parse('2026-11-13T00:00:00Z');
  expect(visiblePresence(value, 'teacher', now)).toBe('Online');
  expect(visiblePresence({ ...value, state: 'Recently' }, 'teacher', now)).toBe('Recently');
  expect(visiblePresence({ ...value, state: 'Hidden' }, 'teacher', now)).toBeNull();
  expect(visiblePresence(value, 'someone-else', now)).toBeNull();
  expect(visiblePresence(value, 'teacher', now + 3600000)).toBeNull();
  expect(visiblePresence({ ...value, expiresAtUtc: 'invalid' }, 'teacher', now)).toBeNull();
});

it('finds a caret mention without turning email addresses into member suggestions', () => {
  expect(mentionRange('سلام @mary', 10)).toEqual({ start: 5, end: 10, query: 'mary' });
  expect(mentionRange('mail@domain.com', 15)).toBeNull();
  expect(mentionRange('@سارا_احمدی', 11)?.query).toBe('سارا_احمدی');
});
it('keeps only explicitly selected whole mention tokens, excluding URLs and longer usernames', () => {
  const selected = [
    { userId: 'a', token: '@ali' },
    { userId: 'b', token: '@سارا_احمدی' },
  ];
  expect(mentionedIds('سلام @ali و @سارا_احمدی', selected)).toEqual(['a', 'b']);
  expect(mentionedIds('@alice https://example.org/@ali', selected)).toEqual([]);
  expect(mentionedIds('someone@ali.example', selected)).toEqual([]);
});

it('exact last-seen requires a current matching public response, including offline without an online badge', () => {
  const now = Date.parse('2026-11-13T12:00:00Z');
  const value: S['PresenceResult'] = {
    userId: 'teacher',
    state: 'Offline',
    lastSeenAtUtc: '2026-11-13T11:37:00Z',
    expiresAtUtc: '2026-11-13T12:01:00Z',
  };
  expect(visiblePresenceDetail(value, 'teacher', now)?.lastSeenAtUtc).toBe(value.lastSeenAtUtc);
  expect(visiblePresence(value, 'teacher', now)).toBeNull();
  expect(visiblePresenceDetail({ ...value, state: 'Hidden' }, 'teacher', now)).toBeNull();
  expect(visiblePresenceDetail(value, 'someone-else', now)).toBeNull();
  expect(
    visiblePresenceDetail({ ...value, expiresAtUtc: '2026-11-13T12:00:00Z' }, 'teacher', now),
  ).toBeNull();
});
