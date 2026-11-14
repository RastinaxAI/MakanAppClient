import { describe, expect, it, vi } from 'vitest';
import { readAssistantQuota, checkAssistantQuota } from '@/features/personal/assistant/preflight';
import { ApiError } from '@/lib/api/errors';
import type { ClientState } from '@/lib/server/client-session';
import { aiIntegration as t } from '@/content/fa';
import { citationSourceMatches } from '@/features/personal/assistant/model';
import type { components } from '@/generated/api/schema';
const user = '00000000-0000-4000-8000-000000000101',
  org = '00000000-0000-4000-8000-000000000001';
const session = {
  user: { id: user },
  context: { workspaceType: 'Organization', organizationId: org },
} as ClientState;
const result = {
  payer: 'Organization',
  ownerType: 'Organization',
  ownerId: org,
  unit: 'SimpleText',
  amount: 1,
  remaining: 0,
  periodEndsAtUtc: null,
  allowed: false,
  errorCode: 'SUBSCRIPTION_INACTIVE',
  requiresExplicitSelection: false,
};
const signal = new AbortController().signal;
describe('assistant credit preflight', () => {
  it('does not reveal a citation excerpt after access, source identity, current version or status changes', () => {
    const citation = { sourceId: org, version: 3 } as components['schemas']['KnowledgeCitation'];
    const source = {
      sourceId: org,
      currentVersion: 3,
      status: 'Active',
      capabilities: { canRead: true },
    } as components['schemas']['EducationalSourceResult'];
    expect(citationSourceMatches(citation, source)).toBe(true);
    for (const changed of [
      { sourceId: user },
      { currentVersion: 4 },
      { status: 'Archived' },
      { capabilities: { canRead: false } },
    ])
      expect(
        citationSourceMatches(citation, {
          ...source,
          ...changed,
        } as components['schemas']['EducationalSourceResult']),
      ).toBe(false);
  });
  it('can display a denied selection without representing it as permission to send', async () => {
    const call = vi.fn().mockResolvedValue(result) as Parameters<typeof readAssistantQuota>[0];
    expect(await readAssistantQuota(call, session, 'Organization', signal)).toMatchObject({
      allowed: false,
      remaining: 0,
    });
    await expect(checkAssistantQuota(call, session, 'Organization', signal)).rejects.toMatchObject({
      status: 403,
      problem: { code: 'SUBSCRIPTION_INACTIVE' },
    });
  });
  it('rejects another owner or another payer even when the response claims allowed', async () => {
    for (const changed of [
      { ownerId: user },
      { ownerType: 'Individual' },
      { payer: 'FreeTrial' },
    ]) {
      const call = vi
        .fn()
        .mockResolvedValue({ ...result, allowed: true, ...changed }) as Parameters<
        typeof readAssistantQuota
      >[0];
      await expect(readAssistantQuota(call, session, 'Organization', signal)).rejects.toMatchObject(
        { status: 502, problem: { code: 'CONTRACT_MISMATCH' } },
      );
    }
  });
  it('ties trial credit to the actual account and keeps its explicit selection in the request', async () => {
    const call = vi.fn().mockResolvedValue({
      ...result,
      payer: 'FreeTrial',
      ownerType: 'Individual',
      ownerId: user,
      allowed: true,
      errorCode: null,
      remaining: 2,
    });
    await checkAssistantQuota(
      call as Parameters<typeof checkAssistantQuota>[0],
      session,
      'FreeTrial',
      signal,
    );
    expect(JSON.parse(call.mock.calls[0][1].body)).toEqual({
      contextType: 'Organization',
      contextId: org,
      payer: 'FreeTrial',
    });
  });
  it('describes the real exhausted-quota code as credit exhaustion rather than an unrelated permission denial', () => {
    expect(new ApiError(403, { code: 'QUOTA_EXCEEDED' }).message).toBe(t.quotaExceeded);
  });
});
