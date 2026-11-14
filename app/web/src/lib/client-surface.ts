// This bounds the public-account BFF surface. It is NOT a permission grant;
// the authenticated backend must authorize each operation and resource.
import allowedOperations from '../../contracts/client-surface.json';
const clientOperations = new Set(allowedOperations);
export function isClientOperation(method: string, template: string) {
  return clientOperations.has(`${method} ${template}`);
}
export function requiresSchoolContext(path: string) {
  if (path === '/api/v1/academic/exams/discovery') return true;
  // Shared assessment resources authorize their real class on the backend.
  // PersonalClass is an independent domain, with no organization membership.
  if (
    /^\/api\/v1\/academic\/(personal-classes|assignments|submission-attempts|exams|exam-attempts|evaluations)(\/|$)/.test(
      path,
    )
  )
    return false;
  return /^\/api\/v1\/(academic|organization|reports)\//.test(path);
}
export function contextSignature(context: {
  workspaceType: string;
  organizationId: string | null;
  membershipId: string | null;
  activeRole: string | null;
  subjectOrganizationPersonId: string | null;
}) {
  return JSON.stringify([
    context.workspaceType,
    context.organizationId,
    context.membershipId,
    context.activeRole,
    context.subjectOrganizationPersonId,
  ]);
}

export type ClientRequestScope = 'account' | 'context';
/** Cache ownership only. The BFF revision check and server authorization still apply. */
export function clientRequestScope(path: string): ClientRequestScope {
  const pathname = path.split('?')[0];
  return /^\/api\/v1\/(contacts(?:\/|$)|people(?:\/|$)|personal-classes(?:\/|$)|personal-class-requests(?:\/|$)|messaging\/(?:privacy|blocks|invitations)(?:\/|$)|conversations\/account$|conversations\/[^/]+\/summary$|workspaces\/snapshot$|commerce\/personal(?:\/|$)|me(?:\/profile)?$|auth\/sessions(?:\/|$))/.test(
    pathname,
  ) || /^\/api\/client\/security\/sessions(?:\/|$)/.test(pathname)
    ? 'account'
    : 'context';
}
