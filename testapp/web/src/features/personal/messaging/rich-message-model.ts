import type { components } from '@/generated/api/schema';
type S = components['schemas'];
export function scheduledComposerKey(userId: string, sessionId: string, conversationId: string) {
  return `makan:draft:scheduled:${userId}:${sessionId}:${conversationId}`;
}
/** Handoff stays out of the URL and expires; existing scheduled drafts are never overwritten. */
export function readScheduledComposerDraft(raw: string | null, now: number) {
  try {
    const value = JSON.parse(raw ?? 'null');
    return value &&
      typeof value.text === 'string' &&
      value.text.length <= 20000 &&
      value.text.trim() &&
      Number.isFinite(value.at) &&
      value.at <= now &&
      now - value.at <= 300000
      ? (value.text as string)
      : null;
  } catch {
    return null;
  }
}
export function pollCommand(
  input: {
    question: string;
    options: string[];
    multiple: boolean;
    anonymous: boolean;
    quiz: boolean;
    correct: number;
    explanation: string;
  },
  clientMessageId: string,
): S['CreateConversationPollCommand'] | null {
  const options = input.options.map((x) => x.trim());
  if (
    !input.question.trim() ||
    options.length < 2 ||
    options.some((x) => !x) ||
    new Set(options).size !== options.length ||
    (input.quiz && (input.correct < 1 || input.correct > options.length))
  )
    return null;
  return {
    clientMessageId,
    question: input.question.trim(),
    options,
    allowsMultipleAnswers: input.quiz ? false : input.multiple,
    isAnonymous: input.anonymous,
    isQuiz: input.quiz,
    correctOptionNumber: input.quiz ? input.correct : null,
    explanation: input.quiz ? input.explanation.trim() || null : null,
    topicId: null,
    isSilent: false,
  };
}
export function checklistCommand(
  title: string,
  items: { itemId: string; text: string }[],
  mode: S['ConversationChecklistMode'],
  clientMessageId: string,
): S['CreateConversationChecklistCommand'] | null {
  if (!title.trim() || !items.length || items.some((x) => !x.text.trim())) return null;
  return {
    clientMessageId,
    title: title.trim(),
    mode,
    items: items.map((x) => ({ itemId: x.itemId, text: x.text.trim() })),
    topicId: null,
    isSilent: false,
  };
}
export function scheduleCommand(
  text: string,
  at: string,
  clientMessageId: string,
  now = Date.now(),
): S['ScheduleMessageCommand'] | null {
  const time = Date.parse(at);
  if (!text.trim() || !Number.isFinite(time) || time <= now) return null;
  return {
    scheduledAtUtc: new Date(time).toISOString(),
    message: {
      clientMessageId,
      kind: 'Text',
      text: text.trim(),
      attachmentIds: [],
      mentionedUserIds: [],
      replyToMessageId: null,
      contactUserId: null,
      topicId: null,
      isSilent: false,
    },
  };
}
export function selectedPollOptions(
  poll: S['ConversationPollResult'],
  current: number[],
  option: number,
) {
  if (poll.status !== 'Open' || !poll.options.some((x) => x.number === option)) return current;
  return poll.allowsMultipleAnswers
    ? current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option]
    : [option];
}
