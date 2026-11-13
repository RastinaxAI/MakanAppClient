import type { components } from '@/generated/api/schema';
import { clientOperationFor, clientValidator } from '@/lib/api/client-contract';
import { ApiError, isRecord } from '@/lib/api/errors';

type S = components['schemas'];
export type AiPayer = S['AiPayerSelection'];
export type SourceVersion = S['KnowledgeSourceVersion'];
/** A stored citation is never authorization to show a stale or revoked source excerpt. */
export function citationSourceMatches(
  citation: S['KnowledgeCitation'],
  source: S['EducationalSourceResult'],
) {
  return (
    source.sourceId === citation.sourceId &&
    source.capabilities.canRead &&
    source.status === 'Active' &&
    source.currentVersion === citation.version
  );
}
export type AssistantIntent = {
  path: string;
  operationId: string;
  payer: AiPayer;
  body?: Record<string, unknown>;
  sources?: SourceVersion[];
  /** Client-side intent binding; never sent as an API field or permission. */
  contextKey?: string;
};
export function assistantRequestScope(intent: AssistantIntent) {
  return intent.path === '/api/v1/ai/chat' && intent.payer !== 'Organization' && !intent.sources
    ? 'account'
    : 'context';
}
export const businessOperations = {
  chat: { path: '/api/v1/ai/chat', role: null },
  analysis: { path: '/api/v1/ai/students/analyze', role: 'Student' },
  plan: { path: '/api/v1/ai/study-plan', role: 'Student' },
  homework: { path: '/api/v1/ai/homeworks/{assignmentId}/explain', role: 'Student' },
  exam: { path: '/api/v1/ai/exams/{examId}/prepare', role: 'Student' },
  child: { path: '/api/v1/ai/parents/child-summary', role: 'Parent' },
  teacherClass: { path: '/api/v1/ai/teachers/classes/{classId}/summary', role: 'Teacher' },
  activities: {
    path: '/api/v1/ai/teachers/classes/{classId}/activity-suggestions',
    role: 'Teacher',
  },
  school: { path: '/api/v1/ai/managers/school-summary', role: 'Manager' },
  managerClass: { path: '/api/v1/ai/managers/classes/{classId}/insight', role: 'Manager' },
} as const;
export type BusinessOperation = keyof typeof businessOperations;
const knowledgePaths = ['/api/v1/ai/knowledge/retrieve', '/api/v1/ai/knowledge/rag/answer'];
const uuid = clientValidator({ type: 'string', format: 'uuid' });
export const validGuid = (value: unknown): value is string => uuid.safeParse(value).success;
export function isAssistantIntent(value: unknown): value is AssistantIntent {
  if (
    !isRecord(value) ||
    typeof value.path !== 'string' ||
    !validGuid(value.operationId) ||
    !['Individual', 'Organization', 'FreeTrial'].includes(String(value.payer)) ||
    (value.contextKey !== undefined && typeof value.contextKey !== 'string')
  )
    return false;
  const operation = clientOperationFor('POST', value.path);
  if (!operation) return false;
  const business = Object.values(businessOperations).some((o) => o.path === operation.path);
  if (!business && !knowledgePaths.includes(operation.path)) return false;
  if (operation.body && !clientValidator(operation.body).safeParse(value.body).success)
    return false;
  if (business)
    return (
      !operation.body || (isRecord(value.body) && value.body.operationId === value.operationId)
    );
  return (
    isRecord(value.body) &&
    value.body.clientOperationId === value.operationId &&
    value.body.payer === value.payer &&
    clientValidator({
      type: 'array',
      minItems: 1,
      maxItems: 32,
      items: { $ref: '#/components/schemas/KnowledgeSourceVersion' },
    }).safeParse(value.sources).success &&
    JSON.stringify(value.sources) === JSON.stringify(value.body.sources)
  );
}
export function sourceVersions(
  result: S['AiSourcePreflightResult'],
  ids: string[],
): SourceVersion[] {
  if (!result.authorized)
    throw new ApiError(403, { code: result.errorCode ?? 'SOURCE_ACCESS_DENIED' });
  if (!result.retrievalAvailable)
    throw new ApiError(503, { code: result.errorCode ?? 'AI_SOURCE_RETRIEVAL_NOT_AVAILABLE' });
  if (result.errorCode) throw new ApiError(422, { code: result.errorCode });
  const keys = new Set(ids.map((id) => id.toLowerCase()));
  if (
    !keys.size ||
    keys.size > 32 ||
    keys.size !== ids.length ||
    result.selectedCount !== keys.size ||
    result.versions.length !== keys.size ||
    new Set(result.versions.map((s) => s.sourceId.toLowerCase())).size !== keys.size ||
    result.versions.some(
      (s) => !keys.has(s.sourceId.toLowerCase()) || !Number.isSafeInteger(s.number) || s.number < 1,
    )
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return result.versions.map((s) => ({ sourceId: s.sourceId, version: s.number }));
}
export function acceptAssistantResult(intent: AssistantIntent, value: unknown) {
  const operation = clientOperationFor('POST', intent.path);
  if (!operation?.response) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  const parsed = clientValidator(operation.response).safeParse(value);
  if (
    !parsed.success ||
    !isRecord(parsed.data) ||
    typeof parsed.data.requestId !== 'string' ||
    !parsed.data.requestId.trim()
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  if (intent.sources) {
    const allowed = new Set(intent.sources.map((s) => `${s.sourceId.toLowerCase()}:${s.version}`));
    const citation = (v: unknown) => {
      const p = clientValidator({ $ref: '#/components/schemas/KnowledgeCitation' }).safeParse(v);
      if (!p.success) throw new ApiError(502, { code: 'AI_CITATION_INVALID' });
      const c = p.data as S['KnowledgeCitation'];
      if (!allowed.has(`${c.sourceId.toLowerCase()}:${c.version}`) || !c.chunkId.trim())
        throw new ApiError(502, { code: 'AI_CITATION_INVALID' });
      return c;
    };
    if ('results' in parsed.data) {
      for (const row of parsed.data.results as S['KnowledgeRetrieveResult'][]) {
        const c = citation(row.citation);
        if (
          row.sourceId.toLowerCase() !== c.sourceId.toLowerCase() ||
          row.version !== c.version ||
          row.chunkId !== c.chunkId
        )
          throw new ApiError(502, { code: 'AI_CITATION_INVALID' });
      }
    } else {
      for (const c of parsed.data.citations as unknown[]) citation(c);
      for (const claim of parsed.data.claims as S['KnowledgeRagClaim'][]) {
        if (parsed.data.status === 'Ok' && !claim.citations.length)
          throw new ApiError(502, { code: 'AI_CITATION_INVALID' });
        claim.citations.forEach(citation);
      }
      if (
        parsed.data.status === 'Ok' &&
        !(parsed.data.claims as unknown[]).length &&
        !(parsed.data.citations as unknown[]).length
      )
        throw new ApiError(502, { code: 'AI_CITATION_INVALID' });
    }
  }
  return parsed.data;
}
