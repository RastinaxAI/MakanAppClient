import { describe, it, expect } from 'vitest';
import {
  pollCommand,
  checklistCommand,
  scheduleCommand,
  selectedPollOptions,
  scheduledComposerKey,
  readScheduledComposerDraft,
} from '@/features/personal/messaging/rich-message-model';
import { isClientOperation } from '@/lib/client-surface';
import type { components } from '@/generated/api/schema';
const id = '00000000-0000-4000-8000-000000000901';
const poll = {
  question: ' Which day? ',
  options: [' Saturday ', 'Monday '],
  multiple: true,
  anonymous: true,
  quiz: false,
  correct: 1,
  explanation: '',
};
describe('V4 rich messaging contracts and user intent', () => {
  it('trims the question/options and preserves the client identity across a manual retry', () => {
    const one = pollCommand(poll, id),
      two = pollCommand(poll, id);
    expect(one).toEqual(two);
    expect(one?.clientMessageId).toBe(id);
    expect(one?.options).toEqual(['Saturday', 'Monday']);
  });
  it.each([
    { question: '' },
    { options: ['one'] },
    { options: ['one', ' '] },
    { options: ['same', ' same '] },
    { quiz: true, correct: 3 },
  ])('does not emit an invalid poll payload: %j', (change) => {
    expect(pollCommand({ ...poll, ...change }, id)).toBeNull();
  });
  it('quiz mode disables multiple answers and carries the chosen correct answer', () => {
    expect(
      pollCommand({ ...poll, quiz: true, correct: 2, explanation: ' because ' }, id),
    ).toMatchObject({
      allowsMultipleAnswers: false,
      correctOptionNumber: 2,
      explanation: 'because',
    });
  });
  it('non-quiz data cannot accidentally disclose a correct answer or explanation', () => {
    expect(pollCommand({ ...poll, correct: 2, explanation: 'private draft' }, id)).toMatchObject({
      correctOptionNumber: null,
      explanation: null,
    });
  });
  it('checklists require a title and non-empty items', () => {
    expect(checklistCommand('', [{ itemId: id, text: 'one' }], 'Personal', id)).toBeNull();
    expect(checklistCommand('title', [], 'Personal', id)).toBeNull();
    expect(checklistCommand('title', [{ itemId: id, text: ' ' }], 'Personal', id)).toBeNull();
  });
  it('checklist identity and item IDs survive trimming', () => {
    expect(
      checklistCommand(' title ', [{ itemId: id, text: ' task ' }], 'Collaborative', id),
    ).toMatchObject({
      clientMessageId: id,
      items: [{ itemId: id, text: 'task' }],
      mode: 'Collaborative',
    });
  });
  it('rejects invalid, empty or past scheduled messages', () => {
    for (const at of ['', 'invalid', '2020-01-01'])
      expect(scheduleCommand('text', at, id, Date.UTC(2026, 10, 6))).toBeNull();
    expect(scheduleCommand(' ', '2027-01-01', id, 0)).toBeNull();
  });
  it('converts local date input to an absolute timestamp without changing the message identity', () => {
    const cmd = scheduleCommand(' text ', '2027-01-01T10:30:00+03:30', id, 0);
    expect(cmd?.scheduledAtUtc).toBe('2027-01-01T07:00:00.000Z');
    expect(cmd?.message).toMatchObject({
      kind: 'Text',
      text: 'text',
      clientMessageId: id,
      attachmentIds: [],
    });
  });
  const base = {
    status: 'Open',
    allowsMultipleAnswers: false,
    options: [{ number: 4 }, { number: 8 }],
  } as components['schemas']['ConversationPollResult'];
  it('uses actual option numbers from the server rather than indexes', () => {
    expect(selectedPollOptions(base, [4], 8)).toEqual([8]);
    expect(selectedPollOptions(base, [4], 2)).toEqual([4]);
  });
  it('allows toggling multiple choices and never changes closed polls', () => {
    const multi = { ...base, allowsMultipleAnswers: true };
    expect(selectedPollOptions(multi, [4], 8)).toEqual([4, 8]);
    expect(selectedPollOptions(multi, [4, 8], 4)).toEqual([8]);
    expect(selectedPollOptions({ ...multi, status: 'Closed' }, [4], 8)).toEqual([4]);
  });
  it('exposes only the published client operations; owner grants remain blocked', () => {
    for (const op of [
      ['GET', '/api/v1/messaging/folders'],
      ['POST', '/api/v1/conversations/{conversationId}/polls'],
      [
        'PUT',
        '/api/v1/conversations/{conversationId}/messages/{messageId}/checklist/items/{itemId}',
      ],
      ['POST', '/api/v1/conversations/{conversationId}/scheduled-messages'],
    ])
      expect(isClientOperation(...(op as [string, string]))).toBe(true);
    expect(
      isClientOperation('POST', '/api/v1/platform/personal-classes/{id}/academic-permissions'),
    ).toBe(false);
  });
});

it('scheduled-message handoff is account/session/conversation bound and rejects stale or malformed input', () => {
  const now = 500000;
  expect(scheduledComposerKey('a', 'session-1', 'chat')).not.toBe(
    scheduledComposerKey('b', 'session-1', 'chat'),
  );
  expect(scheduledComposerKey('a', 'session-1', 'chat')).not.toBe(
    scheduledComposerKey('a', 'session-2', 'chat'),
  );
  expect(scheduledComposerKey('a', 'session-1', 'chat')).not.toBe(
    scheduledComposerKey('a', 'session-1', 'other'),
  );
  expect(
    readScheduledComposerDraft(JSON.stringify({ text: 'متن محفوظ Latin', at: now - 1000 }), now),
  ).toBe('متن محفوظ Latin');
  for (const value of [
    null,
    'bad',
    '{}',
    JSON.stringify({ text: 'expired', at: now - 300001 }),
    JSON.stringify({ text: 'future', at: now + 1 }),
    JSON.stringify({ text: 'x'.repeat(20001), at: now }),
    JSON.stringify({ text: ' ', at: now }),
  ])
    expect(readScheduledComposerDraft(value, now)).toBeNull();
});
