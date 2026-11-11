// Isolated V4 browser fixture; no real accounts, services or production mutations.
import { make, id, userFor } from './state.mjs';
import { seedConversationDetails } from './conversation-details.mjs';
import { randomUUID } from 'node:crypto';
export function seedRichMessaging(state, body = {}) {
  seedConversationDetails(state, { type: body.type });
  if (body.adminCapabilities)
    state.release154 = {
      ...state.release154,
      capabilities: { ...state.release154?.capabilities, [id(102)]: body.adminCapabilities },
    };
  if (body.referenceInvites)
    state.qaInviteLinks = [0, 1].map((index) => ({
      link: make('InviteLinkResult', {
        id: id(5500 + index),
        conversationId: state.conversationDetail.conversationId,
        createdByUserId: id(101),
        expiresAtUtc: new Date(Date.now() + (index ? -1 : 48) * 3600000).toISOString(),
        maximumUses: index ? 20 : 10,
        usedCount: index ? 4 : 3,
        requiresApproval: !index,
        revokedAtUtc: null,
        version: '1',
      }),
      token: randomUUID(),
    }));
  state.conversationDetail.title = 'گفتگوی بررسی V4';
  state.conversationMessages = [];
  if (body.exactV5) {
    state.exactV5Messaging = true;
    const channel = state.conversationDetail.type === 'Channel';
    state.conversationDetail.title = channel ? 'اطلاعیه‌های آفتاب' : 'باشگاه کتاب‌خوانی';
    if (body.editPending) state.conversationDetail.title += ' · پیش از ویرایش';
    state.conversationDetail.description = channel
      ? 'خبرها و برنامه‌های رسمی آموزشگاه'
      : 'گفتگو درباره کتاب و تجربه مطالعه';
    state.conversationDetail.participants = [
      [101, 'سارا', 'احمدی', 'sara.ahmadi', 'Owner'],
      [102, 'مریم', 'رضایی', 'maryam.rezaei', 'Admin'],
      [104, 'امیر', 'نادری', 'amir.naderi', 'Member'],
    ].map(([user, firstName, lastName, username, role], index) => {
      const displayName = firstName + ' ' + lastName;
      Object.assign(state.users.get(id(user)), { firstName, lastName, displayName, username });
      return make('ConversationParticipantResult', {
        participantId: id(960 + index),
        user: make('SafeMessagingIdentityResult', { userId: id(user), displayName, username }),
        role,
        status: 'Active',
        version: '1',
      });
    });
  }
  if (body.referenceJoinRequests)
    state.qaJoinRequests = [
      [103, 'ریحانه', 'زمانی'],
      [199, 'علی', 'کریمی'],
    ].map(([user, firstName, lastName], index) => {
      Object.assign(userFor(state, '09120000' + user).user, {
        firstName,
        lastName,
        displayName: firstName + ' ' + lastName,
      });
      return make('ConversationJoinRequestResult2', {
        id: id(5520 + index),
        conversationId: state.conversationDetail.conversationId,
        userId: id(user),
        status: 'Pending',
        createdAtUtc: '2026-11-05T06:' + (index ? '55' : '50') + ':00.000Z',
        expiresAtUtc: '2099-12-01T12:00:00.000Z',
        version: 'join-reference-1',
      });
    });
  state.richMessaging = {
    polls: new Map(),
    checklists: new Map(),
    scheduled: body.referenceScheduled
      ? [
          ['یادآوری جلسه فردا', '2026-11-11T06:30:00.000Z'],
          ['جزوه هفته بعد', '2026-11-12T04:30:00.000Z'],
        ].map(([text, scheduledAtUtc], index) =>
          make('ScheduledMessageResult', {
            id: id(5600 + index),
            conversationId: state.conversationDetail.conversationId,
            clientMessageId: id(5610 + index),
            status: 'Scheduled',
            scheduledAtUtc,
            createdAtUtc: '2026-11-07T08:00:00.000Z',
            completedAtUtc: null,
            dispatchedMessageId: null,
            lastFailureCode: null,
            content: make('ScheduledMessageContent', { kind: 'Text', text }),
            version: 'schedule-reference-1',
          }),
        )
      : [],
    intents: new Map(),
    folders: [
      make('ChatFolderResult', {
        id: id(1900),
        name: 'آموزشگاه',
        includedTypes: 'Group, Channel',
        excludedTypes: 'None',
        unreadOnly: false,
        sortOrder: 0,
        overrides: [],
        version: 'folder-1',
      }),
    ],
  };
  if (body.readOnly) {
    state.conversationDetail.participants[0].role = 'Member';
    state.conversationDetail.memberCapabilities = 'None';
  }
}
export function richMessagingRoute({ state, auth, url, req, body, send }) {
  const r = state.richMessaging;
  if (!r) return false;
  const p = url.pathname,
    group = state.conversationDetail.conversationId;
  if (p === '/api/v1/messaging/folders') return send(r.folders);
  const folderMatch = p.match(/^\/api\/v1\/messaging\/folders\/([^/]+)$/);
  if (folderMatch) {
    const item = r.folders.find((x) => x.id === folderMatch[1]);
    if (!item) return send({ code: 'NOT_FOUND' }, 404);
    if (req.method === 'DELETE') {
      r.folders = r.folders.filter((x) => x !== item);
      return send(null, 204);
    }
    if (req.method === 'PUT') {
      if (body.expectedVersion !== item.version) return send({ code: 'VERSION_CONFLICT' }, 409);
      Object.assign(item, body, { version: 'folder-' + randomUUID() });
      delete item.expectedVersion;
      return send(item);
    }
  }
  if (p === '/api/v1/conversations' && url.searchParams.has('folderId')) return send([]);
  if (!p.startsWith('/api/v1/conversations/' + group + '/')) return false;
  const member = state.conversationDetail.participants.find((x) => x.user.userId === auth.user.id);
  const canWrite = member && ['Owner', 'Admin'].includes(member.role);
  const ensureWrite = () => canWrite || send({ code: 'FORBIDDEN' }, 403);
  function receipt(message) {
    return make('MessageReceiptResult', {
      messageId: message.messageId,
      conversationId: group,
      clientMessageId: message.clientMessageId,
      sequence: message.sequence,
      sentAtUtc: message.sentAtUtc,
    });
  }
  function createMessage(kind, text) {
    const message = make('ConversationMessageResult', {
      messageId: randomUUID(),
      conversationId: group,
      clientMessageId: body.clientMessageId,
      senderUserId: auth.user.id,
      sender: make('SafeMessagingIdentityResult', {
        userId: auth.user.id,
        displayName: 'کاربر آزمون',
      }),
      sequence: state.conversationMessages.length + 1,
      kind,
      text,
      sentAtUtc: new Date().toISOString(),
      attachments: [],
      version: 'message-1',
    });
    state.conversationMessages.push(message);
    return message;
  }
  if ((p.endsWith('/polls') || p.endsWith('/checklists')) && req.method === 'POST') {
    if (!canWrite) return ensureWrite();
    const old = r.intents.get(body.clientMessageId);
    if (old)
      return old.payload === JSON.stringify(body)
        ? send(old.value)
        : send({ code: 'IDEMPOTENCY_CONFLICT' }, 409);
    const poll = p.endsWith('/polls'),
      message = createMessage(poll ? 'Poll' : 'Checklist', poll ? body.question : body.title);
    if (poll)
      r.polls.set(
        message.messageId,
        make('ConversationPollResult', {
          messageId: message.messageId,
          conversationId: group,
          question: body.question,
          allowsMultipleAnswers: body.allowsMultipleAnswers,
          isAnonymous: body.isAnonymous,
          isQuiz: body.isQuiz,
          status: 'Open',
          options: body.options.map((text, i) =>
            make('ConversationPollOptionResult', {
              number: i + 1,
              text,
              voteCount: 0,
              isSelected: false,
            }),
          ),
          totalVoters: 0,
          ownVoteVersion: null,
          correctOptionNumber: body.correctOptionNumber,
          explanation: body.explanation,
          version: 'poll-1',
        }),
      );
    else
      r.checklists.set(
        message.messageId,
        make('ConversationChecklistResult', {
          messageId: message.messageId,
          conversationId: group,
          title: body.title,
          mode: body.mode,
          items: body.items.map((x) =>
            make('ConversationChecklistItemResult', { ...x, isChecked: false, stateVersion: null }),
          ),
          isCompleted: false,
          version: 'definition-1',
          messageVersion: 'message-1',
        }),
      );
    const value = receipt(message);
    r.intents.set(body.clientMessageId, { payload: JSON.stringify(body), value });
    return send(value);
  }
  const pollMatch = p.match(/\/messages\/([^/]+)\/poll(?:\/(vote|close|voters))?$/);
  if (pollMatch) {
    const poll = r.polls.get(pollMatch[1]);
    if (!poll) return send({ code: 'NOT_FOUND' }, 404);
    if (!pollMatch[2]) return send(poll);
    if (pollMatch[2] === 'vote') {
      if (poll.status !== 'Open') return send({ code: 'POLL_CLOSED' }, 409);
      if (body.expectedVoteVersion !== poll.ownVoteVersion)
        return send({ code: 'VERSION_CONFLICT' }, 409);
      poll.options.forEach((o) => {
        o.isSelected = body.optionNumbers.includes(o.number);
        o.voteCount = o.isSelected ? 1 : 0;
      });
      poll.ownVoteVersion = randomUUID();
      poll.totalVoters = 1;
      return send(poll);
    }
    if (pollMatch[2] === 'close') {
      if (!canWrite) return ensureWrite();
      if (body.expectedVersion !== poll.version) return send({ code: 'VERSION_CONFLICT' }, 409);
      poll.status = 'Closed';
      poll.version = randomUUID();
      return send(poll);
    }
    return poll.isAnonymous
      ? send({ code: 'FORBIDDEN' }, 403)
      : send(make('ConversationPollVoterPageResult', { items: [], hasMore: false }));
  }
  const checklistMatch = p.match(/\/messages\/([^/]+)\/checklist(?:\/items\/([^/]+))?$/);
  if (checklistMatch) {
    const list = r.checklists.get(checklistMatch[1]);
    if (!list) return send({ code: 'NOT_FOUND' }, 404);
    if (req.method === 'GET') return send(list);
    if (checklistMatch[2]) {
      const item = list.items.find((x) => x.itemId === checklistMatch[2]);
      if (!item) return send({ code: 'NOT_FOUND' }, 404);
      if (
        body.expectedDefinitionVersion !== list.version ||
        body.expectedStateVersion !== item.stateVersion
      )
        return send({ code: 'VERSION_CONFLICT' }, 409);
      item.isChecked = body.isChecked;
      item.stateVersion = randomUUID();
      list.isCompleted = list.items.every((x) => x.isChecked);
      return send(list);
    }
    if (!canWrite) return ensureWrite();
    if (body.expectedVersion !== list.version) return send({ code: 'VERSION_CONFLICT' }, 409);
    list.title = body.title;
    list.mode = body.mode;
    list.items = body.items.map((x) => ({ ...x, isChecked: false, stateVersion: null }));
    list.version = randomUUID();
    return send(list);
  }
  if (p.endsWith('/scheduled-messages')) {
    if (req.method === 'GET')
      return send(make('ScheduledMessagePageResult', { items: r.scheduled, hasMore: false }));
    if (!canWrite) return ensureWrite();
    const item = make('ScheduledMessageResult', {
      id: randomUUID(),
      conversationId: group,
      clientMessageId: body.message.clientMessageId,
      status: 'Scheduled',
      scheduledAtUtc: body.scheduledAtUtc,
      content: make('ScheduledMessageContent', { ...body.message }),
      version: 'schedule-1',
    });
    r.scheduled.push(item);
    return send(item);
  }
  const cancel = p.match(/\/scheduled-messages\/([^/]+)\/cancel$/);
  if (cancel) {
    const item = r.scheduled.find((x) => x.id === cancel[1]);
    if (!item) return send({ code: 'NOT_FOUND' }, 404);
    if (!canWrite) return ensureWrite();
    if (body.expectedVersion !== item.version) return send({ code: 'VERSION_CONFLICT' }, 409);
    item.status = 'Cancelled';
    item.version = randomUUID();
    return send(item);
  }
  return false;
}
