import { id, make } from './state.mjs';
// Declared loopback-only attendance service. No request is forwarded to a live backend.
export function attendanceRoute({ state, auth, url, req, body, send }) {
  const match = /^\/api\/v1\/academic\/sessions\/([^/]+)\/attendance(?:\/([^/]+))?$/.exec(
    url.pathname,
  );
  if (!match) return false;
  const session = state.schedule.find((row) => row.id === match[1]);
  if (
    auth.context.workspaceType !== 'Organization' ||
    !['Teacher', 'Manager'].includes(auth.context.activeRole) ||
    !session ||
    session.organizationId !== auth.context.organizationId
  )
    return send({ code: 'NOT_FOUND' }, 404);
  state.attendance ??= new Map();
  if (!state.attendance.has(session.id))
    state.attendance.set(session.id, { entries: [], revisions: [] });
  const record = state.attendance.get(session.id);
  if (req.method === 'GET')
    return send(
      make('SessionAttendanceResult', {
        sessionId: session.id,
        sessionStatus: session.status,
        ...record,
      }),
    );
  if (session.status === 'Cancelled') return send({ code: 'SESSION_CANCELLED' }, 409);
  const statuses = ['Present', 'Absent', 'Late', 'Excused'];
  if (req.method === 'PUT' && !match[2]) {
    if (session.status !== 'Scheduled') return send({ code: 'SESSION_NOT_SCHEDULED' }, 409);
    if (
      !Array.isArray(body.entries) ||
      !body.entries.length ||
      new Set(body.entries.map((row) => row.enrollmentId)).size !== body.entries.length
    )
      return send({ code: 'ATTENDANCE_INVALID' }, 422);
    const rows = body.entries.map((entry) =>
      record.entries.find((row) => row.enrollmentId === entry.enrollmentId),
    );
    if (rows.some((row, index) => !row || !statuses.includes(body.entries[index].status)))
      return send({ code: 'NOT_FOUND' }, 404);
    if (rows.some((row) => row.attendanceId || row.status !== 'NotRecorded'))
      return send({ code: 'ATTENDANCE_ALREADY_RECORDED' }, 409);
    for (const [index, row] of rows.entries())
      Object.assign(row, {
        attendanceId: id(33000 + record.entries.indexOf(row)),
        status: body.entries[index].status,
        recordedAtUtc: new Date().toISOString(),
        recordedByMembershipId: auth.context.membershipId,
        rowVersion: '1',
      });
    return send(rows);
  }
  if (req.method === 'PATCH' && match[2]) {
    const row = record.entries.find((entry) => entry.attendanceId === match[2]);
    if (!row) return send({ code: 'NOT_FOUND' }, 404);
    if (body.expectedRowVersion !== row.rowVersion) return send({ code: 'VERSION_CONFLICT' }, 409);
    if (!statuses.includes(body.status) || !body.correctionReason?.trim())
      return send({ code: 'ATTENDANCE_CORRECTION_INVALID' }, 422);
    record.revisions.push(
      make('AttendanceRevisionResult', {
        id: id(34000 + record.revisions.length),
        previousStatus: row.status,
        newStatus: body.status,
        correctedAtUtc: new Date().toISOString(),
        correctedByMembershipId: auth.context.membershipId,
        reason: body.correctionReason.trim(),
      }),
    );
    Object.assign(row, { status: body.status, rowVersion: String(Number(row.rowVersion) + 1) });
    return send(row);
  }
  return send({ code: 'METHOD_NOT_ALLOWED' }, 405);
}
