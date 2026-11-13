import { id, ids, make } from './state.mjs';
function savedId(auth) {
  return id(9000 + Number.parseInt(auth.user.id.slice(-4), 16));
}
function metadata(auth, conversationId, type = 'Direct') {
  return make('ManagedConversationResult', {
    conversationId,
    type,
    scope: 'Personal',
    organizationId: null,
    title: type === 'Saved' ? 'پیام‌های ذخیره‌شده' : 'گفتگوی آزمایشی',
    description: null,
    managementPolicy: 'None',
    status: 'Active',
    version: 'message-target-1',
    participants: [
      make('ConversationParticipantResult', {
        user: make('SafeMessagingIdentityResult', {
          userId: auth.user.id,
          displayName: auth.user.displayName,
        }),
        status: 'Active',
        role: 'Owner',
      }),
    ],
  });
}
export function savedFixtureSummaries(state, auth) {
  if (!state.savedAccounts?.has(auth.user.id)) return [];
  const rows = state.savedMessages?.get(auth.user.id) ?? [];
  return [
    make('ConversationSummaryResult', {
      conversationId: savedId(auth),
      type: 'Saved',
      scope: 'Personal',
      organizationId: null,
      title: 'پیام‌های ذخیره‌شده',
      otherParticipant: null,
      lastMessagePreview: rows.at(-1)?.text ?? null,
      lastMessageAtUtc: rows.at(-1)?.sentAtUtc ?? null,
      lastMessageSequence: rows.length,
      unreadCount: 0,
      isArchived: false,
    }),
  ];
}
export function messageActionsRoute({ state, auth, url, body, req, send }) {
  const p = url.pathname;
  const directAllowed = [id(101), id(102)].includes(auth.user.id);
  const detailMember = state.conversationDetail?.participants.find(
    (member) => member.user.userId === auth.user.id && member.status === 'Active',
  );
  function permitted(conversationId) {
    return conversationId === ids.chat
      ? directAllowed
      : state.conversationDetail?.conversationId === conversationId && !!detailMember;
  }
  const presence = p.match(/^\/api\/v1\/people\/([^/]+)\/presence$/);
  if (presence && req.method === 'GET') {
    const config = state.release154?.presence?.[presence[1]];
    return send(
      make('PresenceResult', {
        userId: presence[1],
        state: typeof config === 'string' ? config : (config?.state ?? 'Hidden'),
        lastSeenAtUtc: null,
        expiresAtUtc: new Date(Date.now() + 60000).toISOString(),
        ...(typeof config === 'object' ? config : {}),
      }),
    );
  }
  if (p === `/api/v1/conversations/${ids.chat}/media` && req.method === 'GET') {
    if (!permitted(ids.chat)) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    const before = Number(url.searchParams.get('beforeSequence') ?? Infinity);
    const kind = url.searchParams.get('kind');
    const matching = state.messages
      .filter((message) => !message.isDeleted && message.sequence < before)
      .sort((a, b) => b.sequence - a.sequence)
      .flatMap((message) =>
        message.attachments
          .filter((attachment) => !kind || attachment.kind === kind)
          .map((attachment) =>
            make('ConversationMediaItemResult', {
              messageId: message.messageId,
              sequence: message.sequence,
              senderUserId: message.senderUserId,
              attachment,
              sentAtUtc: message.sentAtUtc,
            }),
          ),
      );
    return send(make('ConversationMediaPageResult', { items: matching, nextBeforeSequence: null }));
  }
  if (p === '/api/v1/messages/search' && req.method === 'GET') {
    const query = (url.searchParams.get('q') ?? '').toLocaleLowerCase('fa');
    const all = [...state.messages, ...(state.conversationMessages ?? [])].filter(
      (message) => permitted(message.conversationId) && !message.isDeleted,
    );
    const matching = all.filter(
      (message) =>
        (!query || message.text?.toLocaleLowerCase('fa').includes(query)) &&
        (!url.searchParams.get('conversationId') ||
          message.conversationId === url.searchParams.get('conversationId')) &&
        (url.searchParams.get('hasAttachment') !== 'true' || message.attachments.length > 0) &&
        (url.searchParams.get('hasLinks') !== 'true' || /https?:\/\//.test(message.text ?? '')),
    );
    const cursor = url.searchParams.get('cursor');
    if (cursor && !/^search:\d+$/.test(cursor)) return send({ code: 'INVALID_CURSOR' }, 400);
    const start = Number(cursor?.split(':')[1] ?? 0),
      limit = Number(url.searchParams.get('limit') ?? 30);
    const items = matching.slice(start, start + limit).map((message) =>
      make('MessageSearchItemResult', {
        ...message,
        conversationDisplayName:
          message.conversationId === ids.chat ? 'گفتگوی آزمایشی' : state.conversationDetail.title,
        snippet: message.text,
      }),
    );
    return send(
      make('MessageSearchPageResult', {
        items,
        totalCount: matching.length,
        nextCursor: start + limit < matching.length ? 'search:' + (start + limit) : null,
      }),
    );
  }
  const stateChange = p.match(/^\/api\/v1\/conversations\/([^/]+)\/(state\/pin|mark-unread|mute)$/);
  if (stateChange && (stateChange[2] !== 'mute' || stateChange[1] === ids.chat)) {
    const [, conversationId, action] = stateChange;
    if (!permitted(conversationId)) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    state.pdfConversationState ??= new Map();
    const key = auth.user.id + ':' + conversationId;
    const current =
      state.pdfConversationState.get(key) ??
      make('ConversationUserStateResult', {
        conversationId,
        isPinned: false,
        isMuted: false,
        muteMode: 'None',
        mutedUntilUtc: null,
      });
    if (action === 'state/pin') current.isPinned = req.method === 'POST';
    if (action === 'mark-unread') current.isManuallyUnread = true;
    if (action === 'mute') {
      current.isMuted = req.method === 'PUT';
      current.muteMode = current.isMuted ? body.mode : 'None';
      current.mutedUntilUtc = current.isMuted ? body.mutedUntilUtc : null;
    }
    state.pdfConversationState.set(key, current);
    return send(current);
  }
  const mutation = p.match(
    /^\/api\/v1\/conversations\/([^/]+)\/(?:messages|pins)\/([^/]+)(\/for-everyone)?$/,
  );
  if (mutation && ['PATCH', 'DELETE', 'POST'].includes(req.method)) {
    const [, conversationId, messageId] = mutation;
    const message = [...state.messages, ...(state.conversationMessages ?? [])].find(
      (message) => message.conversationId === conversationId && message.messageId === messageId,
    );
    if (!permitted(conversationId) || !message) return send({ code: 'MESSAGE_NOT_AVAILABLE' }, 404);
    const pin = p.includes('/pins/');
    if (!pin && message.senderUserId !== auth.user.id && detailMember?.role !== 'Owner')
      return send({ code: 'AUTH_FORBIDDEN' }, 403);
    if (pin) {
      message.isPinned = req.method === 'POST';
      return send(
        make('ConversationPinResult', {
          conversationId,
          messageId,
          pinnedByUserId: auth.user.id,
          pinnedAtUtc: new Date().toISOString(),
          isPinned: message.isPinned,
        }),
      );
    }
    if (
      (req.method === 'PATCH' ? body.expectedVersion : url.searchParams.get('expectedVersion')) !==
      message.version
    )
      return send({ code: 'VERSION_CONFLICT' }, 409);
    if (req.method === 'PATCH') {
      if (!body.text?.trim() && !message.attachments.length)
        return send({ code: 'VALIDATION_ERROR' }, 400);
      message.text = body.text;
      message.isEdited = true;
      message.editedAtUtc = new Date().toISOString();
    } else {
      message.isDeleted = true;
      message.deletedAtUtc = new Date().toISOString();
      message.text = null;
      message.isPinned = false;
    }
    message.version = crypto.randomUUID();
    return send(
      make('MessageMutationResult', {
        messageId,
        sequence: message.sequence,
        editedAtUtc: message.editedAtUtc,
        deletedAtUtc: message.deletedAtUtc,
        isDeleted: message.isDeleted,
        version: message.version,
      }),
    );
  }
  if (p === '/api/v1/conversations/saved') {
    state.savedAccounts ??= new Set();
    const existed = state.savedAccounts.has(auth.user.id);
    state.savedAccounts.add(auth.user.id);
    return send(
      make('SavedConversationResult', {
        conversationId: savedId(auth),
        type: 'Saved',
        scope: 'Personal',
        alreadyExisted: existed,
      }),
      existed ? 200 : 201,
    );
  }
  if (
    req.method === 'GET' &&
    p === `/api/v1/conversations/${savedId(auth)}` &&
    state.savedAccounts?.has(auth.user.id)
  )
    return send(metadata(auth, savedId(auth), 'Saved'));
  if (
    req.method === 'GET' &&
    p === `/api/v1/conversations/${ids.chat}` &&
    [id(101), id(102)].includes(auth.user.id)
  )
    return send(metadata(auth, ids.chat));
  if (
    req.method === 'GET' &&
    p === `/api/v1/conversations/${savedId(auth)}/messages` &&
    state.savedAccounts?.has(auth.user.id)
  )
    return send(
      make('ConversationMessagePageResult', {
        messages: state.savedMessages?.get(auth.user.id) ?? [],
        nextBeforeSequence: null,
      }),
    );
  const match = p.match(
    /^\/api\/v1\/conversations\/([^/]+)\/messages\/([^/]+)\/(forward|reports)$/,
  );
  if (!match) return false;
  const [, conversationId, messageId, action] = match,
    source = state.messages.find((m) => m.messageId === messageId);
  if (
    conversationId !== ids.chat ||
    ![id(101), id(102)].includes(auth.user.id) ||
    !source ||
    source.isDeleted
  )
    return send({ code: 'MESSAGE_NOT_AVAILABLE' }, 404);
  state.messageActions ??= new Map();
  const operation = action === 'forward' ? body.clientMessageId : body.clientReportId;
  const old = state.messageActions.get(operation);
  if (old) return send(old, action === 'reports' ? 201 : 200);
  if (action === 'reports') {
    const result = make('AbuseReportReceiptResult', {
      reportId: crypto.randomUUID(),
      conversationId,
      messageId,
      reason: body.reason,
      status: 'Submitted',
    });
    state.messageActions.set(operation, result);
    return send(result, 201);
  }
  if (
    source.kind !== 'Text' ||
    source.attachments.length ||
    ![ids.chat, savedId(auth)].includes(body.destinationConversationId)
  )
    return send({ code: 'FORWARD_NOT_ALLOWED' }, 403);
  const destination = body.destinationConversationId;
  state.savedMessages ??= new Map();
  const rows =
    destination === ids.chat ? state.messages : (state.savedMessages.get(auth.user.id) ?? []);
  const forwarded = {
    ...structuredClone(source),
    messageId: crypto.randomUUID(),
    clientMessageId: body.clientMessageId,
    conversationId: destination,
    sequence: rows.length + 1,
    senderUserId: auth.user.id,
    sender: make('SafeMessagingIdentityResult', {
      userId: auth.user.id,
      displayName: auth.user.displayName,
    }),
    sentAtUtc: new Date().toISOString(),
    isForwarded: true,
  };
  rows.push(forwarded);
  if (destination !== ids.chat) state.savedMessages.set(auth.user.id, rows);
  const result = make('MessageReceiptResult', { ...forwarded, status: 'Sent' });
  state.messageActions.set(operation, result);
  return send(result);
}
