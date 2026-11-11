import { ids, id, make, classRow, assignment } from './state.mjs';

// Explicit local contract fixture for the existing school-assignment command.
export function assignmentDraftRoute({ state, req, url, body, auth, send }) {
  const create = /^\/api\/v1\/academic\/classes\/([^/]+)\/assignments$/.exec(url.pathname);
  const resource = /^\/api\/v1\/academic\/assignments\/([^/]+)(\/publish)?$/.exec(url.pathname);
  const createdList = create && req.method === 'GET' && state.createdAssignments?.size;
  if (
    !(create && req.method === 'POST') &&
    !createdList &&
    !(resource && state.createdAssignments?.has(resource[1]))
  )
    return false;
  if (auth.context.workspaceType !== 'Organization' || auth.context.organizationId !== ids.org)
    return send({ code: 'NOT_FOUND' }, 404);
  const author = ['Teacher', 'Manager'].includes(auth.context.activeRole);
  state.createdAssignments ??= new Map();
  if (createdList) {
    const rows = [...state.createdAssignments.values()].filter(
      (row) => row.classId === create[1] && (author || row.status === 'Published'),
    );
    return send([...(create[1] === ids.class ? [assignment()] : []), ...rows]);
  }
  if (create) {
    const classes = state.managerCase?.classes ?? state.designClasses ?? [classRow()];
    const selected = classes.find((c) => c.id === create[1] && c.organizationId === ids.org);
    if (!author || !selected) return send({ code: 'NOT_FOUND' }, 404);
    const files = body.attachmentFileIds ?? [];
    if (
      !Array.isArray(files) ||
      files.some((fileId) => {
        const asset = state.files.get(fileId)?.asset;
        return (
          !asset ||
          asset.status !== 'Ready' ||
          asset.organizationId !== ids.org ||
          asset.uploadedByUserId !== auth.user.id
        );
      })
    )
      return send({ code: 'FILE_NOT_AVAILABLE' }, 409);
    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !Number.isFinite(Date.parse(body.dueAtUtc)) ||
      !Number.isInteger(body.maxAttempts) ||
      body.maxAttempts < 1 ||
      !Number.isFinite(body.maxScore) ||
      body.maxScore <= 0
    )
      return send({ code: 'VALIDATION_FAILED' }, 422);
    const row = make('AssignmentResult', {
      ...body,
      id: id(2600 + state.createdAssignments.size),
      classId: selected.id,
      classTitle: selected.title,
      organizationId: ids.org,
      classRef: { kind: 'OrganizationClass', classId: selected.id },
      status: 'Draft',
      assignmentRowVersion: '1',
      versionRowVersion: '1',
      versionId: id(2800 + state.createdAssignments.size),
      versionNumber: 1,
      attachmentFileIds: files,
    });
    state.createdAssignments.set(row.id, row);
    return send(row, 201);
  }
  const row = state.createdAssignments.get(resource[1]);
  if (!author && (auth.context.activeRole !== 'Student' || row.status !== 'Published'))
    return send({ code: 'NOT_FOUND' }, 404);
  if (req.method === 'GET') return send(row);
  if (
    !author ||
    row.status !== 'Draft' ||
    body.expectedAssignmentRowVersion !== row.assignmentRowVersion ||
    body.expectedVersionRowVersion !== row.versionRowVersion
  )
    return send({ code: 'VERSION_CONFLICT' }, 409);
  if (resource[2]) row.status = 'Published';
  else Object.assign(row, body);
  row.assignmentRowVersion = String(Number(row.assignmentRowVersion) + 1);
  row.versionRowVersion = String(Number(row.versionRowVersion) + 1);
  return resource[2]
    ? send(make('PublishAssignmentResult', { assignment: row, recipientCount: 1 }))
    : send(row);
}
