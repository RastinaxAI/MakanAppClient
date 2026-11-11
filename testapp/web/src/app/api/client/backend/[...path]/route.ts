import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { operationFor, validator } from '@/lib/api/contract';
import { isClientOperation, requiresSchoolContext } from '@/lib/client-surface';
import { clientSessionId, getClientState } from '@/lib/server/client-session';
import { readSession, writeSession, withSessionLock, withSessionRead } from '@/lib/server/session';
import { authenticatedFetch, checkOrigin, problem, safeResponse } from '@/lib/server/backend';
import { ApiError } from '@/lib/api/errors';
export const runtime = 'nodejs';
async function handler(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (request.method !== 'GET' && !checkOrigin(request)) return problem(403, 'ORIGIN_REJECTED');
  const segments = (await params).path;
  if (segments.some((s) => !s || s === '.' || s === '..' || /[\\/?#%]/.test(s)))
    return problem(404);
  const path = '/' + segments.join('/');
  // File operations use the dedicated streaming, conversation-bound BFF.
  if (path === '/api/v1/files' || path.startsWith('/api/v1/files/')) return problem(404);
  const op = operationFor(request.method, path);
  if (!op || !isClientOperation(op.method, op.path)) return problem(404);
  const templateSegments = op.path.slice(1).split('/');
  for (const definition of op.parameters.filter((p) => p.in === 'path')) {
    const index = templateSegments.indexOf(`{${definition.name}}`);
    const raw = segments[index];
    const value =
      definition.schema.type === 'integer' && /^-?\d+$/.test(raw ?? '') ? Number(raw) : raw;
    if (index < 0 || !validator(definition.schema).safeParse(value).success)
      return problem(400, 'INVALID_PATH_PARAMETER');
  }
  const id = await clientSessionId();
  if (!id) return problem(401);
  try {
    const access = request.method === 'GET' ? withSessionRead : withSessionLock;
    return await access(id, async () => {
      const state = await getClientState(id);
      if (!state) return problem(401);
      if (request.headers.get('X-Makan-Context') !== state.revision)
        return problem(409, 'CONTEXT_CHANGED');
      if (requiresSchoolContext(path) && state.context.workspaceType !== 'Organization')
        return problem(403, 'ORGANIZATION_WORKSPACE_REQUIRED');
      const inputUrl = new URL(request.url),
        query = new URLSearchParams();
      for (const [key, value] of inputUrl.searchParams) {
        const definition = op.parameters.find((p) => p.in === 'query' && p.name === key);
        if (!definition || query.has(key)) return problem(400, 'UNKNOWN_QUERY_PARAMETER');
        const parsed =
          definition.schema.type === 'integer' || definition.schema.type === 'number'
            ? Number(value)
            : definition.schema.type === 'boolean'
              ? value === 'true'
                ? true
                : value === 'false'
                  ? false
                  : value
              : value;
        if (!validator(definition.schema).safeParse(parsed).success)
          return problem(400, 'INVALID_QUERY_PARAMETER');
        if (/^(page|pageNumber|pageSize)$/i.test(key) && typeof parsed === 'number' && parsed < 1)
          return problem(400, 'INVALID_PAGINATION');
        query.append(key, value);
      }
      for (const definition of op.parameters.filter((p) => p.in === 'query' && p.required))
        if (!query.has(definition.name)) return problem(400, 'MISSING_QUERY_PARAMETER');
      const headers = new Headers();
      // Only contract-declared headers cross the BFF. In particular, bodyless AI
      // operations need their original operation ID on an explicit retry.
      for (const definition of op.parameters.filter((p) => p.in === 'header')) {
        const value = request.headers.get(definition.name);
        if (value === null) {
          if (definition.required) return problem(400, 'MISSING_REQUEST_HEADER');
          continue;
        }
        if (!validator(definition.schema).safeParse(value).success)
          return problem(400, 'INVALID_REQUEST_HEADER');
        headers.set(definition.name, value);
      }
      let body: string | undefined;
      if (op.body) {
        const parsed = validator(op.body).safeParse(await request.json().catch(() => null));
        if (!parsed.success)
          return NextResponse.json(
            { status: 400, code: 'VALIDATION_ERROR', errors: parsed.error.flatten().fieldErrors },
            { status: 400, headers: { 'Cache-Control': 'no-store' } },
          );
        const operationId = (parsed.data as { operationId?: string | null })?.operationId;
        const headerId = headers.get('X-AI-Operation-Id');
        if (operationId && headerId && operationId.toLowerCase() !== headerId.toLowerCase())
          return problem(400, 'AI_OPERATION_ID_MISMATCH');
        body = JSON.stringify(parsed.data);
        headers.set('Content-Type', 'application/json');
      }
      const session = await readSession(id);
      if (!session) return problem(401);
      const { response } = await authenticatedFetch(
        id,
        session,
        path + (query.size ? '?' + query : ''),
        {
          method: request.method,
          signal: request.signal,
          headers,
          body,
        },
      );
      if (
        (path === '/api/v1/workspaces/select' ||
          /^\/api\/v1\/guardian\/children\/[^/]+\/select$/.test(path)) &&
        response.ok
      ) {
        const after = await readSession(id);
        if (after)
          await writeSession(id, { ...after, revision: randomUUID(), contextSignature: undefined });
      }
      const result = await safeResponse(response, op.response, validator);
      if (
        process.env.NODE_ENV === 'development' &&
        [
          '/api/v1/sources',
          '/api/v1/ai/chat',
          '/api/v1/commerce/ai/simple-text/preflight',
        ].includes(path) &&
        request.method === 'POST' &&
        !result.ok
      ) {
        const detail = (await result
          .clone()
          .json()
          .catch(() => null)) as { code?: unknown } | null;
        const code =
          typeof detail?.code === 'string' && /^[A-Z0-9_]{1,100}$/.test(detail.code)
            ? detail.code
            : 'UNCLASSIFIED';
        console.warn('Makan operation rejected', {
          operation: op.path,
          status: result.status,
          code,
        });
      }
      result.headers.set('X-Makan-Context', (await readSession(id))?.revision ?? '');
      return result;
    });
  } catch (error) {
    return problem(
      error instanceof ApiError
        ? error.status
        : error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)
          ? 504
          : 503,
      error instanceof ApiError ? error.problem.code : 'UPSTREAM_UNAVAILABLE',
    );
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
