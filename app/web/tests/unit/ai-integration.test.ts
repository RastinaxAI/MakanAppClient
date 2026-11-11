import { describe, expect, it } from 'vitest';
import { clientValidator } from '@/lib/api/client-contract';
import { parseProblem } from '@/lib/api/errors';
import {
  acceptAssistantResult,
  sourceVersions,
  type AssistantIntent,
} from '@/features/personal/assistant/model';
const source = '00000000-0000-4000-8000-000000001500';
const foreign = '00000000-0000-4000-8000-000000001501';
const id = '00000000-0000-4000-8000-000000009900';
const versions = [{ sourceId: source, version: 3 }];
const citation = {
  sourceId: source,
  version: 3,
  chunkId: 'chunk-1',
  title: 'محتوای مجاز',
  pageStart: 1,
  pageEnd: 1,
  sectionTitle: null,
  quotePreview: null,
};
const rag = {
  requestId: 'request-1',
  correlationId: 'correlation-1',
  status: 'Ok',
  answer: 'پاسخ مجاز',
  claims: [{ text: 'ادعا', citations: [citation] }],
  citations: [citation],
};
const intent: AssistantIntent = {
  path: '/api/v1/ai/knowledge/rag/answer',
  operationId: id,
  payer: 'Individual',
  sources: versions,
  body: { clientOperationId: id, query: 'پرسش', sources: versions, payer: 'Individual' },
};
describe('authorized, version-pinned assistant answers', () => {
  it('enforces the published nonempty, bounded source list at the shared contract boundary', () => {
    const schema = clientValidator({ $ref: '#/components/schemas/KnowledgeQueryCommand' });
    expect(schema.safeParse(intent.body).success).toBe(true);
    expect(schema.safeParse({ ...intent.body, sources: [] }).success).toBe(false);
    expect(
      schema.safeParse({ ...intent.body, sources: Array.from({ length: 33 }, () => versions[0]) })
        .success,
    ).toBe(false);
    expect(schema.safeParse({ ...intent.body, query: 'x'.repeat(4001) }).success).toBe(false);
  });
  it('pins only the exact authoritative preflight identities and versions', () => {
    const preflight = {
      authorized: true,
      retrievalAvailable: true,
      selectedCount: 1,
      errorCode: null,
      commercialStatus: 'NotConsumed',
      versions: [{ sourceId: source, number: 3 }],
    };
    expect(sourceVersions(preflight, [source])).toEqual(versions);
    for (const changed of [
      { ...preflight, selectedCount: 2 },
      { ...preflight, versions: [{ sourceId: foreign, number: 3 }] },
      { ...preflight, versions: [{ sourceId: source, number: 0 }] },
      { ...preflight, versions: [] },
      { ...preflight, errorCode: 'SOURCE_NOT_READY' },
    ])
      expect(() => sourceVersions(changed, [source])).toThrow();
    expect(() => sourceVersions(preflight, [source, source])).toThrow();
    expect(() => sourceVersions({ ...preflight, authorized: false }, [source])).toThrow();
    expect(() => sourceVersions({ ...preflight, retrievalAvailable: false }, [source])).toThrow();
  });
  it('accepts only citations from the selected version, including opaque top-level citation items', () => {
    expect(acceptAssistantResult(intent, rag).answer).toBe('پاسخ مجاز');
    for (const c of [
      { ...citation, sourceId: foreign },
      { ...citation, version: 2 },
      { ...citation, chunkId: '' },
      { arbitrary: 'private' },
    ])
      expect(() => acceptAssistantResult(intent, { ...rag, citations: [c] })).toThrow();
    expect(() =>
      acceptAssistantResult(intent, {
        ...rag,
        claims: [{ text: 'ادعا', citations: [] }],
        citations: [],
      }),
    ).toThrow();
  });
  it('checks a retrieval row against its own citation as well as the allowlist', () => {
    const query = { ...intent, path: '/api/v1/ai/knowledge/retrieve' };
    const result = {
      requestId: 'r',
      correlationId: 'c',
      status: 'Ok',
      results: [
        { sourceId: source, version: 3, rank: 1, chunkId: 'chunk-1', text: 'متن', citation },
      ],
    };
    expect(acceptAssistantResult(query, result).status).toBe('Ok');
    expect(() =>
      acceptAssistantResult(query, {
        ...result,
        results: [{ ...result.results[0], chunkId: 'unbound' }],
      }),
    ).toThrow();
  });
  it('keeps both support identifiers without leaking raw provider details', () => {
    const p = parseProblem(
      {
        code: 'AI_UNAVAILABLE',
        requestId: 'r',
        correlationId: 'c',
        providerBody: 'private',
        detail: 'private',
      },
      503,
    );
    expect(p).toMatchObject({ requestId: 'r', correlationId: 'c', traceId: 'c' });
    expect(p).not.toHaveProperty('providerBody');
    expect(p).not.toHaveProperty('detail');
  });
});
