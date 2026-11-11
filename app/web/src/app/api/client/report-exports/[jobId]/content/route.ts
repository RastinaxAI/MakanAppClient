import { clientSessionId, getClientState } from '@/lib/server/client-session';
import { readSession, withSessionRead } from '@/lib/server/session';
import { authenticatedFetch, safeResponse, problem } from '@/lib/server/backend';
import { validator as clientValidator } from '@/lib/api/contract';
import { ApiError, parseProblem } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Stream the authorized job's bytes; a context change terminates the stream. */
export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params;
    if (!guid.test(jobId) || new URL(request.url).searchParams.size) return problem(404);
    const id = await clientSessionId();
    if (!id) return problem(401);
    const prepared = await withSessionRead(id, async () => {
      const state = await getClientState(id);
      if (!state) throw new ApiError(401);
      if (request.headers.get('X-Makan-Context') !== state.revision)
        throw new ApiError(409, { code: 'CONTEXT_CHANGED' });
      if (state.context.workspaceType !== 'Organization')
        throw new ApiError(403, { code: 'ORGANIZATION_WORKSPACE_REQUIRED' });
      if (state.context.activeRole !== 'Manager') throw new ApiError(403);
      const session = await readSession(id);
      if (!session) throw new ApiError(401);
      const path = '/api/v1/reports/exports/' + jobId;
      const metadata = (await authenticatedFetch(id, session, path, { signal: request.signal }))
        .response;
      const raw = await metadata.json().catch(() => null);
      if (!metadata.ok) throw new ApiError(metadata.status, parseProblem(raw, metadata.status));
      const validated = clientValidator({
        $ref: '#/components/schemas/ReportExportJobResult',
      }).safeParse(raw);
      if (!validated.success) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      const job = validated.data as components['schemas']['ReportExportJobResult'];
      if (job.jobId !== jobId || job.format !== 'Csv')
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      if (!job.reportType.startsWith('Manager')) throw new ApiError(403);
      if (job.status !== 'Completed' || !job.downloadAvailable)
        throw new ApiError(409, { code: 'REPORT_EXPORT_NOT_READY' });
      const response = (
        await authenticatedFetch(id, session, path + '/download', {
          signal: request.signal,
          headers: { Accept: 'text/csv, application/octet-stream' },
        })
      ).response;
      return { response, revision: state.revision };
    });
    const current = async () => {
      request.signal.throwIfAborted();
      const session = await readSession(id);
      if (!session) throw new ApiError(401);
      if (session.revision !== prepared.revision)
        throw new ApiError(409, { code: 'CONTEXT_CHANGED' });
    };
    await current();
    const response = prepared.response;
    if (!response.ok) return safeResponse(response);
    const type = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
    if (
      !response.body ||
      !['text/csv', 'text/plain', 'application/octet-stream'].includes(type ?? '')
    )
      throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
    const reader = response.body.getReader();
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          await current();
          const next = await reader.read();
          await current();
          if (next.done) controller.close();
          else controller.enqueue(next.value);
        } catch (error) {
          await reader.cancel().catch(() => {});
          controller.error(error);
        }
      },
      async cancel(reason) {
        await reader.cancel(reason);
      },
    });
    const headers = new Headers({
      'Cache-Control': 'no-store, private',
      Vary: 'Cookie',
      'X-Content-Type-Options': 'nosniff',
      'X-Makan-Context': prepared.revision,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="makan-report.csv"',
    });
    const length = response.headers.get('Content-Length');
    if (length && /^\d+$/.test(length)) headers.set('Content-Length', length);
    return new Response(stream, { status: 200, headers });
  } catch (error) {
    return problem(
      error instanceof ApiError ? error.status : 503,
      error instanceof ApiError ? error.problem.code : 'UPSTREAM_UNAVAILABLE',
    );
  }
}
