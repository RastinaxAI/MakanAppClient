import { describe, expect, it } from 'vitest';
import { clientRequestScope, requiresSchoolContext } from '../../src/lib/client-surface';
describe('account data ownership remains distinct from educational authorization', () => {
  it.each([
    '/api/v1/contacts?page=2',
    '/api/v1/people/resolve',
    '/api/v1/conversations/account?Filter=All',
    '/api/v1/conversations/abc/summary',
    '/api/v1/personal-classes/page?page=1',
    '/api/v1/personal-class-requests/mine',
    '/api/v1/workspaces/snapshot',
  ])('keeps the account cache for %s', (path) => {
    expect(clientRequestScope(path)).toBe('account');
  });
  it.each([
    '/api/v1/workspaces/select',
    '/api/v1/guardian/children',
    '/api/v1/organization/classes',
    '/api/v1/dashboards/parent',
    '/api/v1/reports/student/assignments',
    '/api/v1/academic/assignments/id',
    '/api/v1/conversations/id/messages',
    '/api/v1/conversations/accounting',
    '/api/v1/contacts-other',
  ])('does not infer a context-free request from %s', (path) => {
    expect(clientRequestScope(path)).toBe('context');
  });
  it('does not turn cache ownership into a school permission or open proposed independent education', () => {
    expect(requiresSchoolContext('/api/v1/organization/classes')).toBe(true);
    expect(clientRequestScope('/api/v1/academic/personal-classes/id')).toBe('context');
  });
});
