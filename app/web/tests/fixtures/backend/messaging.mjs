import { ids, id, make, paged, schemas } from './state.mjs';
export function messagingRoute({ state, url, body, auth, send, req }) {
  const p = url.pathname;
  const profile = (u) =>
    make('MessagingPublicProfileResult', {
      userId: u.id,
      username: u.username,
      displayName: u.displayName,
      phoneNumber: null,
      isSavedContact: true,
      isFavorite: false,
      canStartDirect: true,
      profilePhoto: null,
    });
  if (p === '/api/v1/messaging/privacy') {
    const current =
      state.privacy.get(auth.user.id) ?? make('MessagingPrivacySettingsResult', { version: '1' });
    if (req.method === 'PUT') {
      if (body.expectedVersion !== current.version)
        return send({ code: 'PRIVACY_VERSION_CONFLICT' }, 409);
      const { expectedVersion, ...values } = body;
      const next = {
        ...current,
        ...values,
        isExplicit: true,
        version: String(Number(current.version) + 1),
      };
      state.privacy.set(auth.user.id, next);
      return send(next);
    }
    return send(current);
  }
  if (p === '/api/v1/messaging/blocks' && req.method === 'GET')
    return send(state.blocked.get(auth.user.id) ?? []);
  const block = p.match(/^\/api\/v1\/messaging\/blocks\/([^/]+)$/);
  if (block && req.method === 'POST') {
    const user = state.users.get(block[1]);
    if (!user || user.id === auth.user.id) return send({ code: 'AUTH_FORBIDDEN' }, 403);
    const rows = state.blocked.get(auth.user.id) ?? [];
    const alreadyExisted = rows.some((item) => item.user.userId === user.id);
    if (!alreadyExisted)
      state.blocked.set(auth.user.id, [
        ...rows,
        make('BlockedUserResult', {
          user: make('SafeMessagingIdentityResult', {
            userId: user.id,
            displayName: user.displayName,
            username: user.username,
          }),
          createdAtUtc: new Date().toISOString(),
          version: '1',
        }),
      ]);
    return send(
      make('UserBlockResult', {
        blockId: id(12400),
        blockedUser: make('SafeMessagingIdentityResult', {
          userId: user.id,
          displayName: user.displayName,
          username: user.username,
        }),
        status: 'Active',
        createdAtUtc: new Date().toISOString(),
        version: '1',
        alreadyExisted,
      }),
      alreadyExisted ? 200 : 201,
    );
  }
  if (block && req.method === 'DELETE') {
    const rows = state.blocked.get(auth.user.id) ?? [];
    if (!rows.some((item) => item.user.userId === block[1]))
      return send({ code: 'BLOCK_NOT_FOUND' }, 404);
    state.blocked.set(
      auth.user.id,
      rows.filter((item) => item.user.userId !== block[1]),
    );
    return send(null, 204);
  }
  if (p === '/api/v1/people/search')
    return send(
      paged(
        'PeopleSearchPageResult',
        [...state.users.values()].filter((u) => u.id !== auth.user.id).map(profile),
        url,
      ),
    );
  if (p === '/api/v1/people/resolve') {
    const u = [...state.users.values()].find(
      (u) =>
        u.username.toLowerCase() ===
          String(body.username ?? '')
            .replace(/^@/, '')
            .toLowerCase() ||
        (typeof body.phoneNumber === 'string' &&
          u.phoneNumber.replace(/^0/, '+98') === body.phoneNumber.replace(/^0/, '+98')),
    );
    return send(
      make('PeopleResolveResult', { isDiscoverable: !!u, profile: u ? profile(u) : null }),
    );
  }
  if (req.method === 'GET' && /^\/api\/v1\/people\/[^/]+$/.test(p)) {
    const user = state.users.get(p.split('/').at(-1));
    return user ? send(profile(user)) : send({ code: 'PERSON_NOT_FOUND' }, 404);
  }
  if (p === '/api/v1/contacts' || /^\/api\/v1\/contacts\/[^/]+$/.test(p)) {
    state.contactBooks ??= new Map();
    if (!state.contactBooks.has(auth.user.id))
      state.contactBooks.set(
        auth.user.id,
        new Map(
          [...state.users.values()]
            .filter((u) => u.id !== auth.user.id)
            .map((u) => [
              u.id,
              make('UserContactResult', {
                contactUserId: u.id,
                profile: profile(u),
                savedName: null,
                version: 'AAAAAAAAAAE=',
              }),
            ]),
        ),
      );
    const book = state.contactBooks.get(auth.user.id);
    const userId = p === '/api/v1/contacts' ? body.contactUserId : p.split('/').at(-1);
    if (req.method === 'POST') {
      const user = state.users.get(userId);
      if (!user || userId === auth.user.id) return send({ code: 'PERSON_NOT_FOUND' }, 404);
      const row = make('UserContactResult', {
        contactUserId: userId,
        profile: profile(user),
        savedName: body.savedName,
        version: 'AAAAAAAAAAI=',
      });
      book.set(userId, row);
      return send(row);
    }
    if (req.method === 'DELETE') {
      book.delete(userId);
      return send(null, 204);
    }
    if (req.method === 'PATCH') {
      const row = book.get(userId);
      if (!row) return send({ code: 'CONTACT_NOT_FOUND' }, 404);
      if (row.version !== body.expectedVersion) return send({ code: 'VERSION_CONFLICT' }, 409);
      Object.assign(row, {
        savedName: body.savedName,
        isFavorite: body.isFavorite,
        version: 'AAAAAAAAAAM=',
      });
      return send(row);
    }
    const query = (url.searchParams.get('q') ?? '').toLowerCase();
    const matching = [...book.values()].filter(
      (row) =>
        (!query ||
          (row.savedName + ' ' + row.profile.displayName + ' ' + row.profile.username)
            .toLowerCase()
            .includes(query)) &&
        (url.searchParams.get('favoritesOnly') !== 'true' || row.isFavorite),
    );
    const page = Number(url.searchParams.get('page') ?? 1),
      pageSize = Number(url.searchParams.get('pageSize') ?? 30);
    return send(
      make('UserContactPageResult', {
        items: matching.slice((page - 1) * pageSize, page * pageSize),
        page,
        pageSize,
        hasMore: page * pageSize < matching.length,
      }),
    );
  }

  const allowed = [id(101), id(102)].includes(auth.user.id);
  const summary = () =>
    make('ConversationSummaryResult', {
      conversationId: ids.chat,
      type: state.chatKind ?? 'Direct',
      scope: 'Personal',
      organizationId: null,
      title: state.chatKind === 'Saved' ? 'پیام‌های ذخیره‌شده' : null,
      otherParticipant:
        state.chatKind === 'Saved'
          ? null
          : make('SafeMessagingIdentityResult2', {
              userId: auth.user.id === id(101) ? id(102) : id(101),
              displayName:
                state.chatDisplayName ??
                (state.design
                  ? auth.user.id === id(101)
                    ? 'مریم رضایی'
                    : 'سارا احمدی'
                  : auth.user.id === id(101)
                    ? 'استاد آزمایشی'
                    : 'دانشجوی آزمایشی'),
              username: auth.user.id === id(101) ? 'test.Teacher' : 'test.Student',
            }),
      lastMessagePreview: state.messages.at(-1)?.text ?? null,
      lastMessageAtUtc: state.messages.at(-1)?.createdAtUtc ?? null,
      lastMessageSequence: state.messages.length,
      lastReadMessageSequence: state.pdfReadCursors?.get(auth.user.id + ':' + ids.chat) ?? 0,
      unreadCount: state.messages.filter(
        (m) =>
          m.senderUserId !== auth.user.id &&
          m.sequence > (state.pdfReadCursors?.get(auth.user.id + ':' + ids.chat) ?? 0),
      ).length,
      ...((value) =>
        value
          ? {
              isPinned: value.isPinned,
              isMuted: value.isMuted,
              muteMode: value.muteMode,
              mutedUntilUtc: value.mutedUntilUtc,
              isManuallyUnread: value.isManuallyUnread,
            }
          : { isPinned: false })(state.pdfConversationState?.get(auth.user.id + ':' + ids.chat)),
      isArchived: state.chatArchives?.get(auth.user.id) ?? state.chatArchived ?? false,
      ...((hidden) =>
        hidden && state.messages.at(-1)?.sequence <= hidden
          ? {
              lastMessagePreview: null,
              lastMessageAtUtc: null,
              lastMessageSequence: null,
              unreadCount: 0,
            }
          : {})(state.chatHistoryHidden?.get(auth.user.id)),
      organization: null,
    });
  if (p === `/api/v1/conversations/${ids.chat}/summary`) {
    return allowed ? send(summary()) : send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
  }
  if (p === '/api/v1/conversations') {
    if (state.inboxPages) {
      const scope = url.searchParams.get('scope'),
        size = Number(url.searchParams.get('pageSize') ?? 30),
        page = Number(url.searchParams.get('page') ?? 1);
      const count =
        scope === 'Personal' ? state.inboxPages.personal : state.inboxPages.organization;
      const rows = Array.from({ length: count ?? 0 }, (_, i) =>
        make('ConversationSummaryResult', {
          conversationId: id((scope === 'Personal' ? 2000 : 3000) + i),
          type: scope === 'Personal' ? 'Direct' : 'Group',
          scope,
          organizationId: scope === 'Personal' ? null : ids.org,
          title: (scope === 'Personal' ? 'گفتگوی حساب ' : 'گفتگوی رسمی ') + (i + 1),
          otherParticipant: null,
          lastMessageAtUtc: new Date(Date.UTC(2026, 10, 1, 12, 0, -i)).toISOString(),
          isPinned: false,
        }),
      );
      return send(rows.slice((page - 1) * size, page * size));
    }
    const filter = url.searchParams.get('filter') ?? 'All';
    const rows =
      allowed &&
      (url.searchParams.get('scope') === 'Personal' || auth.context.workspaceType === 'Personal')
        ? [summary()]
        : [];
    const matching = rows.filter(
      (row) =>
        filter === 'All' ||
        filter === row.type ||
        (filter === 'Unread' && row.unreadCount > 0) ||
        (filter === 'Archived' && row.isArchived),
    );
    const page = Number(url.searchParams.get('page') ?? 1),
      size = Number(url.searchParams.get('pageSize') ?? 30);
    return send(matching.slice((page - 1) * size, page * size));
  }
  if (
    p === `/api/v1/conversations/${ids.chat}/archive` &&
    ['POST', 'DELETE'].includes(req.method)
  ) {
    if (!allowed) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    state.chatArchives ??= new Map();
    state.chatArchives.set(auth.user.id, req.method === 'POST');
    return send(
      make('ConversationUserStateResult', {
        conversationId: ids.chat,
        isArchived: state.chatArchives.get(auth.user.id),
        version: '1',
      }),
    );
  }
  if (p === `/api/v1/conversations/${ids.chat}/clear-history` && req.method === 'POST') {
    if (!allowed) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    state.chatHistoryHidden ??= new Map();
    const through = state.messages.at(-1)?.sequence ?? 0;
    state.chatHistoryHidden.set(auth.user.id, through);
    return send(
      make('ConversationUserStateResult', {
        conversationId: ids.chat,
        historyHiddenThroughSequence: through,
        isArchived: state.chatArchives?.get(auth.user.id) ?? false,
        version: 'clear-' + through,
      }),
    );
  }
  if (p === '/api/v1/conversations/direct')
    return allowed &&
      body.scope === 'Personal' &&
      [id(101), id(102)].includes(body.targetUserId) &&
      body.targetUserId !== auth.user.id
      ? send(
          make('DirectConversationResult', {
            conversationId: ids.chat,
            type: 'Direct',
            scope: 'Personal',
            organizationId: null,
            otherParticipant: make('SafeMessagingIdentityResult', {
              userId: body.targetUserId,
              displayName: state.users.get(body.targetUserId)?.displayName ?? 'مخاطب آزمایشی',
              username: state.users.get(body.targetUserId)?.username ?? null,
            }),
            alreadyExisted: true,
          }),
          201,
        )
      : send({ code: 'DIRECT_RECIPIENT_NOT_AVAILABLE' }, 404);
  if (p.startsWith('/api/v1/conversations/' + ids.chat)) {
    if (!allowed) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
    if (p.endsWith('/read-states'))
      return send(
        make('ConversationPeerReadStateResult', { conversationId: ids.chat, participants: [] }),
      );
    if (p.endsWith('/read')) {
      state.pdfReadCursors ??= new Map();
      const key = auth.user.id + ':' + ids.chat;
      state.pdfReadCursors.set(
        key,
        Math.max(state.pdfReadCursors.get(key) ?? 0, body.upToMessageSequence ?? 0),
      );
      const saved = state.pdfConversationState?.get(key);
      if (saved) saved.isManuallyUnread = false;
      return send(null, 204);
    }
    if (p.endsWith('/delivered')) return send(null, 204);
    if (p.endsWith('/messages')) {
      if (req.method === 'POST') {
        const old = state.messages.find(
          (m) => m.clientMessageId === body.clientMessageId && m.senderUserId === auth.user.id,
        );
        if (old) return send(make('MessageReceiptResult', { ...old }));
        const files = (body.attachmentIds ?? []).map((fileId) => state.files.get(fileId));
        if (
          files.some(
            (file) =>
              !file ||
              file.asset.uploadedByUserId !== auth.user.id ||
              file.asset.status !== 'Ready',
          )
        )
          return send({ code: 'FILE_NOT_AVAILABLE' }, 403);
        const m = make('ConversationMessageResult', {
          messageId: id(10000 + state.messages.length),
          conversationId: ids.chat,
          clientMessageId: body.clientMessageId,
          senderUserId: auth.user.id,
          sender: make('SafeMessagingIdentityResult', {
            userId: auth.user.id,
            displayName: auth.user.displayName,
            username: auth.user.username,
          }),
          kind: body.kind ?? 'Text',
          text: body.text,
          sequence: state.messages.length + 1,
          createdAtUtc: new Date().toISOString(),
          sentAtUtc: new Date().toISOString(),
          attachments: files.map(({ asset }) =>
            make('MessageAttachmentResult', {
              fileAssetId: asset.id,
              fileName: asset.originalFileName,
              contentType: asset.contentType,
              sizeBytes: asset.sizeBytes,
              createdAtUtc: asset.createdAtUtc,
              kind: asset.contentType.startsWith('image/')
                ? 'Image'
                : asset.contentType.startsWith('video/')
                  ? 'Video'
                  : 'File',
            }),
          ),
        });
        state.messages.push(m);
        return send(make('MessageReceiptResult', { ...m }));
      }
      return send(
        make('ConversationMessagePageResult', {
          messages: state.messages.filter(
            (message) => message.sequence > (state.chatHistoryHidden?.get(auth.user.id) ?? 0),
          ),
          nextBeforeSequence: null,
        }),
      );
    }
    return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
  }
  if (p.includes('/negotiate')) return send({ code: 'FIXTURE_LIVE_DISABLED' }, 503);
  // Fail unknown fixture endpoints explicitly instead of returning invented successful data.
  return false;
}
