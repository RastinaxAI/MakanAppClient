// Isolated acceptance data. No provider, live backend, or billed request is used.
import { make, ids } from './state.mjs';
import { seedSources } from './sources.mjs';
export function seedAiIntegration(state, options = {}) {
  state.aiIntegration = { enabled: true, ...state.aiIntegration, ...options };
  state.aiOperations ??= new Map();
  state.knowledgeOperations ??= new Map();
  state.knowledgeStates ??= new Map();
}
export function aiIntegrationRoute({ state, auth, url, req, body, send }) {
  const path = url.pathname;
  const lifecycle =
    /^\/api\/v1\/sources\/([^/]+)\/versions\/(\d+)\/knowledge\/(status|ingest|delete|supersede|reindex)$/.exec(
      path,
    );
  const knowledge = path.startsWith('/api/v1/ai/knowledge/');
  const ai = path.startsWith('/api/v1/ai/') && path !== '/api/v1/ai/sources/preflight';
  const quota = path === '/api/v1/commerce/ai/simple-text/preflight';
  if (!lifecycle && !ai && !quota) return false;
  const options = state.aiIntegration;
  if (!options?.enabled)
    return send(
      {
        code: 'AI_RUNTIME_UNAVAILABLE',
        requestId: 'fixture-unavailable',
        correlationId: 'fixture-ai',
      },
      503,
    );
  if (quota)
    return send(
      make('AiQuotaPreflightDto', {
        payer: body.payer ?? 'Organization',
        ownerType: body.payer === 'Organization' ? 'Organization' : 'Individual',
        ownerId: body.payer === 'Organization' ? ids.org : auth.user.id,
        unit: 'SimpleText',
        amount: 1,
        remaining: options.quotaAllowed === false ? 0 : 30,
        allowed: options.quotaAllowed !== false,
        errorCode:
          options.quotaAllowed === false ? (options.quotaCode ?? 'AI_QUOTA_NOT_AVAILABLE') : null,
        requiresExplicitSelection: !body.payer,
      }),
    );
  seedSources(state, auth);
  const sourceAllowed = (row) =>
    row &&
    row.scope !== 'Library' &&
    (row.scope === 'Personal'
      ? row.ownerUserId === auth.user.id
      : auth.context.workspaceType === 'Organization' &&
        row.organizationId === auth.context.organizationId);
  if (lifecycle) {
    const [, sourceId, versionText, action] = lifecycle,
      version = Number(versionText),
      row = state.sources.get(sourceId);
    if (!sourceAllowed(row) || row.currentVersion !== version)
      return send({ code: 'SOURCE_NOT_FOUND' }, 404);
    const key = sourceId + ':' + version;
    const status = () =>
      make('KnowledgeProcessingStatus', {
        sourceId,
        version,
        state: state.knowledgeStates.get(key) ?? options.knowledgeState ?? 'NotIngested',
        updatedAtUtc: new Date().toISOString(),
      });
    if (action === 'status' && req.method === 'GET') return send(status());
    const writer =
      row.scope === 'Personal'
        ? row.ownerUserId === auth.user.id
        : ['Teacher', 'Manager'].includes(auth.context.activeRole);
    if (!writer) return send({ code: 'AUTH_FORBIDDEN' }, 403);
    if (body.expectedVersion !== row.version) return send({ code: 'CONCURRENCY_CONFLICT' }, 412);
    const operationKey = auth.user.id + ':' + body.clientOperationId;
    const previous = state.knowledgeOperations.get(operationKey);
    if (previous)
      return previous.path === path && JSON.stringify(previous.body) === JSON.stringify(body)
        ? send(previous.value, previous.status)
        : send({ code: 'IDEMPOTENCY_CONFLICT' }, 409);
    state.knowledgeStates.set(
      key,
      action === 'delete' ? 'Deleted' : action === 'supersede' ? 'Superseded' : 'Queued',
    );
    const value = status(),
      code = ['ingest', 'reindex'].includes(action) ? 202 : 200;
    state.knowledgeOperations.set(operationKey, { path, body, value, status: code });
    return send(value, code);
  }
  if (options.status)
    return send(
      {
        code: options.code ?? 'AI_RUNTIME_UNAVAILABLE',
        requestId: 'fixture-failed',
        correlationId: 'fixture-ai',
      },
      options.status,
    );
  if (knowledge) {
    const allowed = (body.sources ?? []).every((source) => {
      const row = state.sources.get(source.sourceId);
      return sourceAllowed(row) && row.revision === source.version && row.aiReady;
    });
    if (!body.sources?.length || !allowed) return send({ code: 'SOURCE_ACCESS_DENIED' }, 403);
    const source = body.sources[0],
      row = state.sources.get(source.sourceId),
      citation = {
        sourceId: source.sourceId,
        version: source.version,
        chunkId: 'fixture-chunk-1',
        title: row.title,
        pageStart: 2,
        pageEnd: 2,
        sectionTitle: null,
        quotePreview: 'نقل مجاز از دادهٔ آزمون',
      };
    if (options.foreignCitation) citation.sourceId = options.foreignCitation;
    const key = auth.user.id + ':' + body.clientOperationId;
    if (state.aiOperations.has(key)) return send({ code: 'AI_OPERATION_ALREADY_COMPLETED' }, 409);
    const value = path.endsWith('/retrieve')
      ? {
          requestId: 'fixture-retrieve',
          correlationId: 'fixture-ai',
          status: 'Ok',
          results: [
            {
              ...source,
              chunkId: citation.chunkId,
              rank: 1,
              text: 'محتوای مرتبط مجاز آزمایشی',
              citation,
            },
          ],
        }
      : {
          requestId: 'fixture-rag',
          correlationId: 'fixture-ai',
          status: 'Ok',
          answer: 'پاسخ مستند آزمایشی از نسخهٔ انتخاب‌شده',
          claims: [{ text: 'ادعای آزمون', citations: [citation] }],
          citations: [citation],
        };
    state.aiOperations.set(key, { path, body, value });
    if (options.lostAck) {
      options.lostAck = false;
      return send({ code: 'UPSTREAM_UNAVAILABLE' }, 503);
    }
    return send(value);
  }
  const role = auth.context.workspaceType === 'Organization' ? auth.context.activeRole : null;
  const expectedRole = path.includes('/teachers/')
    ? 'Teacher'
    : path.includes('/managers/')
      ? 'Manager'
      : path.includes('/parents/')
        ? 'Parent'
        : path === '/api/v1/ai/chat'
          ? null
          : 'Student';
  if (expectedRole && role !== expectedRole) return send({ code: 'AUTH_FORBIDDEN' }, 403);
  const targetClass = /\/classes\/([^/]+)/.exec(path)?.[1];
  if (targetClass && targetClass !== ids.class) return send({ code: 'CLASS_NOT_FOUND' }, 404);
  if (path.includes('/parents/') && !auth.context.subjectOrganizationPersonId)
    return send({ code: 'LEARNER_NOT_FOUND' }, 404);
  const operationId = req.headers['x-ai-operation-id'];
  if (!operationId || (body.operationId && body.operationId !== operationId))
    return send({ code: 'AI_OPERATION_ID_MISMATCH' }, 400);
  const payer = req.headers['x-ai-payer'];
  if (!['Organization', 'Individual', 'FreeTrial'].includes(payer))
    return send({ code: 'AI_PAYER_SELECTION_REQUIRED' }, 400);
  const signature = JSON.stringify({ path, body, payer }),
    key =
      auth.user.id +
      ':' +
      auth.context.workspaceType +
      ':' +
      auth.context.activeRole +
      ':' +
      operationId;
  const previous = state.aiOperations.get(key);
  if (previous)
    return previous.signature === signature
      ? send(previous.value)
      : send({ code: 'AI_OPERATION_IDEMPOTENCY_CONFLICT' }, 409);
  const schema = path.endsWith('/chat')
    ? 'AiChatResult'
    : path.endsWith('/analyze')
      ? 'AiStudentAnalysisResponse'
      : path.endsWith('/study-plan')
        ? 'AiStudyPlanResponse'
        : path.endsWith('/explain')
          ? 'AiHomeworkExplanationResponse'
          : path.endsWith('/prepare')
            ? 'AiExamPreparationResponse'
            : path.endsWith('/child-summary')
              ? 'AiParentChildSummaryResponse'
              : path.endsWith('/activity-suggestions')
                ? 'AiActivitySuggestionsResponse'
                : 'AiRoleInsightResponse';
  const value = make(schema, {
    requestId: 'fixture-business-' + operationId,
    correlationId: 'fixture-ai',
    ...(schema === 'AiChatResult'
      ? {
          answer: { text: 'پاسخ واقعی قرارداد در محیط آزمون', language: 'fa' },
          conversationId: ids.chat,
        }
      : schema === 'AiHomeworkExplanationResponse'
        ? { explanation: 'راهنمای مجاز تکلیف آزمایشی' }
        : schema === 'AiParentChildSummaryResponse'
          ? { academicSummary: 'خلاصهٔ مجاز فرزند انتخاب‌شده' }
          : { summary: 'خلاصهٔ مجاز آموزشی در محیط آزمون' }),
  });
  state.aiOperations.set(key, { signature, value });
  if (options.lostAck) {
    options.lostAck = false;
    return send({ code: 'UPSTREAM_UNAVAILABLE' }, 503);
  }
  return send(value);
}
