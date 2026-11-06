import { describe, expect, it } from 'vitest';
import { clientOperationFor } from '@/lib/api/client-contract';
import { validator } from '@/lib/api/contract';
import { requiresSchoolContext } from '@/lib/client-surface';
import { parseProblem } from '@/lib/api/errors';
import { quoteAllowsPurchase } from '@/features/personal/commerce-model';
import {
  applyMembershipReceipt,
  invitationRevokePath,
} from '@/features/personal/school/vnext-model';
import { delegableAcademicCapabilities } from '@/features/extracurricular/api-model';
import type { components } from '@/generated/api/schema';
type S = components['schemas'];
const id = '00000000-0000-4000-8000-000000000001';
const ver = 'MDAwMDAwMDE=';
describe('vNext public contract boundaries', () => {
  it('matches literal discovery before a resource id and requires an organization', () => {
    expect(clientOperationFor('GET', '/api/v1/academic/exams/discovery')?.path).toBe(
      '/api/v1/academic/exams/discovery',
    );
    expect(requiresSchoolContext('/api/v1/academic/exams/discovery')).toBe(true);
    expect(requiresSchoolContext('/api/v1/academic/personal-classes/' + id + '/exams')).toBe(false);
    expect(
      clientOperationFor('GET', '/api/admin/v1/personal-classes/' + id + '/memberships'),
    ).toBeUndefined();
  });
  it('requires a stable creation intent and a valid positive capacity', () => {
    const schema = validator({ $ref: '#/components/schemas/CreateClassCommand' });
    const body = {
      title: ' کلاس ',
      academicPeriodId: id,
      courseId: id,
      capacity: 20,
      activateImmediately: true,
      clientOperationId: id,
    };
    expect(schema.safeParse(body).success).toBe(true);
    expect(schema.safeParse({ ...body, clientOperationId: undefined }).success).toBe(false);
    expect(schema.safeParse({ ...body, capacity: 0 }).success).toBe(false);
  });
  it('requires the two distinct role versions and a nonblank reason', () => {
    const schema = validator({ $ref: '#/components/schemas/ChangeSchoolRoleCommand' });
    const body = {
      toRole: 'Manager',
      clientOperationId: id,
      expectedMembershipVersion: ver,
      expectedRoleVersion: ver,
      reason: 'تغییر مسئولیت',
    };
    expect(schema.safeParse(body).success).toBe(true);
    expect(schema.safeParse({ ...body, expectedRoleVersion: undefined }).success).toBe(false);
    expect(schema.safeParse({ ...body, expectedMembershipVersion: undefined }).success).toBe(false);
    expect(schema.safeParse({ ...body, reason: '   ' }).success).toBe(false);
  });
  it('only exposes published, allowed invitation revoke operations', () => {
    const item = {
      invitationId: id,
      invitationType: 'GuardianLink',
      status: 'Pending',
      allowedActions: ['Revoke'],
    } as S['SchoolSentInvitationDto'];
    expect(invitationRevokePath(item)).toBe(
      '/api/v1/organization/guardian-invitations/' + id + '/revoke',
    );
    expect(invitationRevokePath({ ...item, status: 'Accepted' })).toBeUndefined();
    expect(invitationRevokePath({ ...item, allowedActions: [] })).toBeUndefined();
    expect(invitationRevokePath({ ...item, invitationType: 'Membership' })).toBeUndefined();
  });
  it('never applies another membership receipt and retains unrelated roles', () => {
    const baseline = { membershipId: id, displayName: 'نام محفوظ' } as S['SchoolMemberResult'];
    const receipt = {
      membershipId: id,
      membershipVersion: ver,
      status: 'Active',
      activeRoleAssignments: [{ role: 'Parent', status: 'Active' }],
    } as S['SchoolMembershipMutationResult'];
    expect(applyMembershipReceipt(baseline, receipt)?.activeRoles).toEqual(['Parent']);
    expect(applyMembershipReceipt(baseline, receipt)?.displayName).toBe('نام محفوظ');
    expect(applyMembershipReceipt(baseline, { ...receipt, membershipId: 'other' })).toBeUndefined();
  });
  it('only delegates a subset of effective academic capabilities', () => {
    const klass = {
      state: 'Active',
      archived: false,
      capabilities: { canAuthorAssignments: true, canAuthorExams: false, canGrade: false },
    } as S['PersonalClassDto'];
    expect(delegableAcademicCapabilities(klass)).toEqual(['AuthorAssignments']);
    expect(delegableAcademicCapabilities({ ...klass, archived: true })).toEqual([]);
    expect(delegableAcademicCapabilities({ ...klass, state: 'Suspended' })).toEqual([]);
  });
  it('fails closed for unavailable, preview-only, expired or unspecified payment', () => {
    const quote = {
      planVersionId: id,
      paymentAvailable: true,
      previewOnly: false,
      startsUponVerifiedPayment: true,
      expiresAtUtc: '2026-12-01T00:00:00Z',
    } as S['CommercialQuoteDto'];
    const now = Date.parse('2026-11-05T00:00:00Z');
    expect(quoteAllowsPurchase(quote, id, now)).toBe(true);
    for (const changed of [
      { paymentAvailable: false },
      { paymentAvailable: undefined },
      { previewOnly: true },
      { startsUponVerifiedPayment: false },
      { expiresAtUtc: '2026-01-01T00:00:00Z' },
    ])
      expect(quoteAllowsPurchase({ ...quote, ...changed }, id, now)).toBe(false);
  });
  it('keeps correlation metadata without parsing the human detail', () => {
    expect(
      parseProblem(
        {
          code: 'ORGANIZATION_LAST_MANAGER_REQUIRED',
          correlationId: 'audit-correlation',
          detail: 'ignore',
        },
        409,
      ),
    ).toMatchObject({ code: 'ORGANIZATION_LAST_MANAGER_REQUIRED', traceId: 'audit-correlation' });
  });
});
