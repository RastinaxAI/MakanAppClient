import { conversationToolsRoute } from './conversation-tools.mjs';
import { randomUUID } from 'node:crypto';
import { make, id } from './state.mjs';
export function seedConversationDetails(state, body) {
  state.qaInviteLinks = [];
  state.qaTopics = [];
  state.qaJoinRequests = [];
  state.qaMuted = new Map();
  state.conversationMessages = body.messages
    ? state.messages.map((message) => ({ ...message, conversationId: id(950) }))
    : [];
  if (body.systemMessages)
    state.conversationMessages = [
      'عضوی گروه را ترک کرد.',
      'عضوی به گروه اضافه شد.',
      'عضوی از پیوند دعوت پیوست.',
    ].map((text, i) =>
      make('ConversationMessageResult', {
        conversationId: id(950),
        messageId: id(980 + i),
        sequence: i + 1,
        text,
        originKind: 'System',
        kind: 'Text',
        senderUserId: id(9999),
        sender: make('SafeMessagingIdentityResult', {
          userId: id(9999),
          displayName: 'سامانهٔ آزمون',
        }),
        sentAtUtc: new Date().toISOString(),
        version: '1',
      }),
    );
  state.conversationMediaTitle = body.mediaTitle ?? 'جزوه';
  state.conversationDetail = make('ManagedConversationResult', {
    conversationId: id(950),
    type: body.type === 'Channel' ? 'Channel' : 'Group',
    scope: 'Personal',
    organizationId: null,
    title: 'گفتگوی آزمایشی جزئیات',
    description: 'توضیحات معتبر گروه آزمایشی',
    managementPolicy: body.system ? 'SystemManagedAcademic' : 'UserManaged',
    visibility: 'Private',
    groupHistoryPolicy: 'FromJoin',
    memberCapabilities: 'SendMessages',
    status: 'Active',
    version: '1',
    participants: [101, 102].map((n, i) =>
      make('ConversationParticipantResult', {
        participantId: id(960 + i),
        user: make('SafeMessagingIdentityResult', {
          userId: id(n),
          displayName: i ? 'عضو آزمایشی دوم' : 'مالک آزمایشی گفتگو',
          username: 'test.' + n,
        }),
        role: i ? 'Member' : 'Owner',
        status: 'Active',
        version: '1',
      }),
    ),
  });
}
export function conversationDetailsRoute({ state, auth, url, req, body, send }) {
  const p = url.pathname;
  if (
    ['/api/v1/conversations/groups', '/api/v1/conversations/channels'].includes(p) &&
    req.method === 'POST'
  ) {
    const operation = auth.user.id + ':' + body.clientOperationId;
    state.createdConversations ??= new Map();
    const old = state.createdConversations.get(operation);
    if (old)
      return JSON.stringify(old.command) === JSON.stringify(body)
        ? send(old.value)
        : send({ code: 'IDEMPOTENCY_CONFLICT' }, 409);
    if (!body.title?.trim() || body.scope !== 'Personal')
      return send({ code: 'VALIDATION_ERROR' }, 400);
    const users = [
      auth.user.id,
      ...new Set(
        (body.initialParticipantUserIds ?? []).filter(
          (id) =>
            id !== auth.user.id &&
            !state.release154?.pendingInitial &&
            !state.messagingRepair?.inviteFirst,
        ),
      ),
    ];
    if (users.some((id) => !state.users.has(id))) return send({ code: 'USER_NOT_FOUND' }, 404);
    const value = make('ManagedConversationResult', {
      conversationId: randomUUID(),
      type: p.endsWith('/channels') ? 'Channel' : 'Group',
      scope: 'Personal',
      organizationId: null,
      title: body.title,
      description: body.description,
      visibility: body.visibility ?? 'Private',
      groupHistoryPolicy: body.groupHistoryPolicy ?? 'FromJoin',
      memberCapabilities: 'SendMessages',
      managementPolicy: 'UserManaged',
      status: 'Active',
      version: '1',
      initialTargets: (body.initialParticipantUserIds ?? []).map((userId) => ({
        targetUserId: userId,
        outcome:
          state.release154?.pendingInitial || state.messagingRepair?.inviteFirst
            ? 'InvitationPending'
            : 'Added',
        invitationId:
          state.release154?.pendingInitial || state.messagingRepair?.inviteFirst
            ? randomUUID()
            : null,
        invitationExpiresAtUtc:
          state.release154?.pendingInitial || state.messagingRepair?.inviteFirst
            ? state.messagingRepair?.expired
              ? '2020-01-01T00:00:00Z'
              : '2099-11-09T12:00:00Z'
            : null,
      })),
      participants: users.map((userId, i) =>
        make('ConversationParticipantResult', {
          participantId: randomUUID(),
          user: make('SafeMessagingIdentityResult', {
            userId,
            displayName: state.users.get(userId).displayName,
            username: state.users.get(userId).username,
          }),
          role: i ? 'Member' : 'Owner',
          status: 'Active',
          version: '1',
        }),
      ),
    });
    state.conversationDetail = value;
    state.messagingInvitations ??= [];
    for (const target of value.initialTargets.filter((t) => t.outcome === 'InvitationPending'))
      state.messagingInvitations.push(
        make('ConversationInvitationResult', {
          id: target.invitationId,
          conversationId: value.conversationId,
          inviterUserId: auth.user.id,
          targetUserId: target.targetUserId,
          status: 'Pending',
          expiresAtUtc: target.invitationExpiresAtUtc,
        }),
      );
    state.createdConversations.set(operation, { command: body, value });
    return send(value);
  }
  const v = state.conversationDetail;
  if (!v) return false;
  const tools = conversationToolsRoute({ state, auth, url, req, body, send });
  if (tools !== false) return tools;
  if (p === '/api/v1/conversations') {
    const member = v.participants.some(
      (m) => m.user.userId === auth.user.id && m.status === 'Active',
    );
    if (url.searchParams.get('scope') && url.searchParams.get('scope') !== v.scope) return send([]);
    return send(
      member && Number(url.searchParams.get('page') ?? 1) === 1
        ? [
            make('ConversationSummaryResult', {
              conversationId: v.conversationId,
              type: v.type,
              scope: v.scope,
              organizationId: v.organizationId,
              title: v.title,
              photo: v.photo,
              isMuted: state.qaMuted?.get(auth.user.id) ?? false,
              isArchived: false,
              unreadCount: 0,
            }),
          ]
        : [],
    );
  }
  if (!p.startsWith('/api/v1/conversations/' + v.conversationId)) return false;
  const member = v.participants.find(
    (m) => m.user.userId === auth.user.id && m.status === 'Active',
  );
  if (!member) return send({ code: 'CONVERSATION_NOT_FOUND' }, 404);
  if (p.endsWith('/summary'))
    return send(
      make('ConversationSummaryResult', {
        conversationId: v.conversationId,
        type: v.type,
        scope: v.scope,
        organizationId: v.organizationId,
        title: v.title,
        isMuted: state.qaMuted?.get(auth.user.id) ?? false,
        isArchived: false,
        unreadCount: 0,
      }),
    );
  if (p === '/api/v1/conversations/' + v.conversationId) return send(v);
  const writable = member.role === 'Owner' && v.managementPolicy === 'UserManaged';
  if (p.endsWith('/info') && req.method === 'PATCH') {
    if (!writable) return send({ code: 'FORBIDDEN' }, 403);
    if (body.expectedVersion !== v.version) return send({ code: 'VERSION_CONFLICT' }, 409);
    if (!body.title?.trim()) return send({ code: 'VALIDATION_ERROR' }, 400);
    v.title = body.title;
    v.description = body.description;
    v.version = String(Number(v.version) + 1);
    return send(
      make('ConversationInfoResult', {
        conversationId: v.conversationId,
        title: v.title,
        description: v.description,
        version: v.version,
      }),
    );
  }
  if (p.endsWith('/members') && req.method === 'POST') {
    if (!writable) return send({ code: 'FORBIDDEN' }, 403);
    const user = state.users.get(body.userId);
    if (!user) return send({ code: 'USER_NOT_FOUND' }, 404);
    if (!v.participants.some((m) => m.user.userId === body.userId && m.status === 'Active'))
      v.participants.push(
        make('ConversationParticipantResult', {
          participantId: randomUUID(),
          user: make('SafeMessagingIdentityResult', {
            userId: user.id,
            displayName: user.displayName,
            username: user.username,
          }),
          role: 'Member',
          status: 'Active',
          version: '1',
        }),
      );
    v.version = String(Number(v.version) + 1);
    return send(v);
  }
  const targetPath = p.match(/\/members\/([^/]+)(\/role)?$/);
  if (targetPath && ['PATCH', 'DELETE'].includes(req.method)) {
    if (!writable) return send({ code: 'FORBIDDEN' }, 403);
    const target = v.participants.find(
      (m) => m.user.userId === targetPath[1] && m.status === 'Active',
    );
    if (!target) return send({ code: 'MEMBER_NOT_FOUND' }, 404);
    if (target.role === 'Owner') return send({ code: 'OWNER_TRANSFER_REQUIRED' }, 409);
    if (req.method === 'DELETE') target.status = 'Removed';
    else {
      if (!['Admin', 'Member'].includes(body.role)) return send({ code: 'INVALID_ROLE' }, 400);
      target.role = body.role;
    }
    v.version = String(Number(v.version) + 1);
    return send(v);
  }
  if (p.endsWith('/messages') && req.method === 'POST') {
    const override = state.release154?.capabilities?.[auth.user.id]?.canPublish;
    if (
      override === false ||
      !(
        override === true ||
        writable ||
        (v.type === 'Group' && /SendMessages|All/.test(v.memberCapabilities))
      )
    )
      return send({ code: 'SEND_NOT_ALLOWED' }, 403);
    const peers = (body.mentionedUserIds ?? []).map((userId) =>
      v.participants.find((row) => row.user.userId === userId && row.status === 'Active'),
    );
    if (peers.some((row) => !row)) return send({ code: 'MENTION_NOT_AVAILABLE' }, 400);
    state.conversationMessages ??= [];
    const old = state.conversationMessages.find(
      (row) => row.clientMessageId === body.clientMessageId && row.senderUserId === auth.user.id,
    );
    if (old) return send(make('MessageReceiptResult', { ...old }));
    const files = (body.attachmentIds ?? []).map((fileId) => state.files.get(fileId));
    if (
      files.some(
        (file) =>
          !file || file.asset.uploadedByUserId !== auth.user.id || file.asset.status !== 'Ready',
      )
    )
      return send({ code: 'FILE_NOT_AVAILABLE' }, 403);
    const message = make('ConversationMessageResult', {
      messageId: randomUUID(),
      conversationId: v.conversationId,
      clientMessageId: body.clientMessageId,
      senderUserId: auth.user.id,
      sender: member.user,
      kind: body.kind ?? 'Text',
      text: body.text,
      mentions: peers.map((row) => row.user),
      sequence: state.conversationMessages.length + 1,
      sentAtUtc: new Date().toISOString(),
      version: '1',
      attachments: files.map(({ asset }) =>
        make('MessageAttachmentResult', {
          fileAssetId: asset.id,
          fileName: asset.originalFileName,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          kind: asset.contentType.startsWith('image/')
            ? 'Image'
            : asset.contentType.startsWith('video/')
              ? 'Video'
              : 'File',
        }),
      ),
    });
    state.conversationMessages.push(message);
    return send(make('MessageReceiptResult', { ...message }));
  }
  if (p.endsWith('/messages') && req.method === 'GET')
    return send(
      make('ConversationMessagePageResult', {
        conversationId: v.conversationId,
        messages: state.conversationMessages ?? [],
        nextBeforeSequence: null,
      }),
    );
  if ((p.endsWith('/read') || p.endsWith('/delivered')) && req.method === 'POST')
    return send(null, 204);
  if (p.endsWith('/read-states')) return send([]);
  if (p.endsWith('/me/restriction'))
    return send(
      make('MemberRestrictionResult', { conversationId: v.conversationId, userId: auth.user.id }),
    );
  if (p.endsWith('/members') && req.method === 'GET') {
    const page = Number(url.searchParams.get('page') ?? 1);
    if (state.exactV5Messaging) {
      const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get('pageSize') ?? 30)));
      return send(
        make('ConversationParticipantPageResult', {
          items: v.participants.slice((page - 1) * pageSize, page * pageSize),
          page,
          pageSize,
          hasMore: page * pageSize < v.participants.length,
        }),
      );
    }
    return send(
      make('ConversationParticipantPageResult', {
        items: v.participants.slice(page - 1, page),
        page,
        pageSize: 1,
        hasMore: page < v.participants.length,
      }),
    );
  }
  if (p.endsWith('/media')) {
    if (url.searchParams.get('kind') === 'Image')
      return send(make('ConversationMediaPageResult', { items: [], nextBeforeSequence: null }));
    const next = url.searchParams.get('beforeSequence'),
      sequence = next ? 20 : 50;
    return send(
      make('ConversationMediaPageResult', {
        items: [
          make('ConversationMediaItemResult', {
            messageId: id(sequence),
            sequence,
            senderUserId: id(101),
            attachment: make('MessageAttachmentResult', {
              fileAssetId: id(970 + sequence),
              kind: 'File',
              fileName: `${state.conversationMediaTitle}-${sequence}.pdf`,
              contentType: 'application/pdf',
              sizeBytes: 100,
            }),
          }),
        ],
        nextBeforeSequence: next ? null : 25,
      }),
    );
  }
  if (p.endsWith('/settings') && req.method === 'PATCH') {
    if (member.role !== 'Owner' || v.managementPolicy !== 'UserManaged')
      return send({ code: 'FORBIDDEN' }, 403);
    if (body.expectedVersion !== v.version) return send({ code: 'VERSION_CONFLICT' }, 409);
    Object.assign(v, { ...body, version: String(Number(v.version) + 1) });
    return send(v);
  }
  if (p.endsWith('/leave') && req.method === 'POST') {
    member.status = 'Left';
    return send(v);
  }
  return false;
}
