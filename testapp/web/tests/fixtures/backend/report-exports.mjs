// Contract-shaped report exports; only the isolated fixture server imports this.
import { id, make } from './state.mjs';
export function seedReportExports(state, options = {}) {
  state.reportExports ??= { jobs: new Map(), options: {} };
  Object.assign(state.reportExports.options, options);
  if (options.status)
    for (const job of state.reportExports.jobs.values()) {
      job.value.status = options.status;
      job.value.downloadAvailable = options.status === 'Completed';
      job.value.completedAtUtc = options.status === 'Completed' ? '2026-11-07T08:01:00Z' : null;
    }
}
export function reportExportRoute({ state, auth, req, res, url, body, send }) {
  if (!url.pathname.startsWith('/api/v1/reports/exports')) return false;
  if (auth.context.workspaceType !== 'Organization' || auth.context.activeRole !== 'Manager')
    return send({ code: 'AUTH_FORBIDDEN' }, 403);
  seedReportExports(state);
  const store = state.reportExports;
  if (url.pathname === '/api/v1/reports/exports' && req.method === 'POST') {
    if (
      ![
        'ManagerTeacherWorkload',
        'ManagerAttendance',
        'ManagerAssessments',
        'ManagerEnrollments',
      ].includes(body.reportType) ||
      body.format !== 'Csv' ||
      !body.clientOperationId
    )
      return send({ code: 'VALIDATION_ERROR' }, 400);
    const prior = [...store.jobs.values()].find(
      (j) => j.operation === body.clientOperationId && j.userId === auth.user.id,
    );
    if (prior) return send(prior.value);
    const value = make('ReportExportJobResult', {
      jobId: id(9800 + store.jobs.size),
      reportType: body.reportType,
      format: 'Csv',
      status: 'Queued',
      expectedRowCount: 2,
      dataAsOfUtc: '2026-11-07T08:00:00Z',
      requestedAtUtc: '2026-11-07T08:00:00Z',
      startedAtUtc: null,
      completedAtUtc: null,
      failedAtUtc: null,
      downloadAvailable: false,
      failureCode: null,
    });
    store.jobs.set(value.jobId, {
      value,
      operation: body.clientOperationId,
      userId: auth.user.id,
      organizationId: auth.context.organizationId,
    });
    if (store.options.loseCreateOnce) {
      store.options.loseCreateOnce = false;
      return send({ code: 'FIXTURE_LOST_ACK' }, 503);
    }
    return send(value, 202);
  }
  const match = url.pathname.match(/^\/api\/v1\/reports\/exports\/([^/]+)(\/download)?$/);
  const job = match && store.jobs.get(match[1]);
  if (!job || job.userId !== auth.user.id || job.organizationId !== auth.context.organizationId)
    return send({ code: 'NOT_FOUND' }, 404);
  if (!match[2]) return send(job.value);
  if (job.value.status !== 'Completed' || !job.value.downloadAvailable)
    return send({ code: 'EXPORT_NOT_READY' }, 409);
  if (store.options.denyDownload) return send({ code: 'AUTH_FORBIDDEN' }, 403);
  res.statusCode = 200;
  const text = store.options.invalidBinary
    ? JSON.stringify({ status: 403, code: 'AUTH_FORBIDDEN' })
    : '\uFEFFعنوان,تعداد\nکلاس آزمایشی,2\n';
  res.setHeader(
    'Content-Type',
    store.options.invalidBinary ? 'application/problem+json' : 'text/csv; charset=utf-8',
  );
  res.setHeader('Content-Length', Buffer.byteLength(text));
  res.end(text);
  return true;
}
