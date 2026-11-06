'use client';
import * as uiText from '@/content/fa';
import { useState } from 'react';
import { vnext as t } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, label } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import { useResourceCommand } from '../use-resource-command';
import { Card, Field } from './shared';
import { applyMembershipReceipt } from './vnext-model';
import s from './school.module.css';
type S = components['schemas'];
type Action = 'grant' | 'change' | 'end-role' | 'end-membership';
export function MemberRoleEditor({
  member,
  refresh,
  onClose,
}: {
  member: S['SchoolMemberResult'];
  refresh: () => Promise<S['SchoolMemberResult'] | undefined>;
  onClose: () => void;
}) {
  const { session, reload } = usePersonal();
  const [baseline, setBaseline] = useState(member),
    [action, setAction] = useState<Action>('grant');
  const [assignmentId, setAssignmentId] = useState(
    member.roleAssignments.find((r) => r.status === 'Active')?.roleAssignmentId ?? '',
  );
  const [role, setRole] = useState<S['OrganizationRole']>('Teacher'),
    [reason, setReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>();
  const command = useResourceCommand('school-membership:' + member.membershipId);
  const assignment = baseline.roleAssignments.find(
    (r) => r.roleAssignmentId === assignmentId && r.status === 'Active',
  );
  const needsRole = action === 'change' || action === 'end-role';
  const valid =
    baseline.membershipStatus === 'Active' &&
    !!baseline.version &&
    !!reason.trim() &&
    (!needsRole || !!assignment?.version);
  if (session.context.activeRole !== 'Manager') return null;
  return (
    <Card title={t.manageRoles + ' · ' + member.displayName}>
      <p className={s.hint}>{t.roleHint}</p>
      <p>
        {baseline.activeRoles.map(label).join(' / ')}
        {uiText.text_588da4105320}
        {label(baseline.membershipStatus)}
      </p>
      <fieldset className={s.form} disabled={command.busy || refreshing}>
        <Field label={t.roleAction}>
          <select value={action} onChange={(e) => setAction(e.target.value as Action)}>
            <option value="grant">{t.grantRole}</option>
            <option value="change">{t.changeRole}</option>
            <option value="end-role">{t.endRole}</option>
            <option value="end-membership">{t.endMembership}</option>
          </select>
        </Field>
        {needsRole && (
          <Field label={t.activeRole}>
            <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
              {baseline.roleAssignments
                .filter((r) => r.status === 'Active')
                .map((r) => (
                  <option key={r.roleAssignmentId} value={r.roleAssignmentId}>
                    {label(r.role)}
                  </option>
                ))}
            </select>
          </Field>
        )}
        {(action === 'grant' || action === 'change') && (
          <Field label={t.newRole}>
            <select value={role} onChange={(e) => setRole(e.target.value as S['OrganizationRole'])}>
              {(['Student', 'Teacher', 'Parent', 'Manager'] as const).map((r) => (
                <option key={r} value={r}>
                  {label(r)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label={t.reason}>
          <textarea
            required
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      </fieldset>
      {command.feedback}
      {!!error && <ErrorState error={error} />}
      <div className={s.row}>
        <ConfirmAction
          trigger={t.confirmMutation}
          confirm={t.confirmMutation}
          title={t.confirmMutation}
          description={t.confirmRole}
          disabled={!valid || command.busy || refreshing}
          destructive={action.startsWith('end')}
          onConfirm={async () => {
            setError(undefined);
            const prefix = '/api/v1/organization/members/' + baseline.membershipId;
            const path =
              action === 'end-membership'
                ? prefix
                : action === 'grant'
                  ? prefix + '/roles'
                  : prefix + '/roles/' + assignmentId;
            const body =
              action === 'end-membership'
                ? { expectedVersion: baseline.version, reason: reason.trim() }
                : {
                    expectedMembershipVersion: baseline.version,
                    reason: reason.trim(),
                    ...(needsRole ? { expectedRoleVersion: assignment!.version } : {}),
                    ...(action === 'grant'
                      ? { role }
                      : action === 'change'
                        ? { toRole: role }
                        : {}),
                  };
            const result = await command.run<S['SchoolMembershipMutationResult']>(path, body, {
              method: action === 'grant' ? 'POST' : action === 'change' ? 'PUT' : 'DELETE',
              idempotent: true,
              throwOnError: true,
              acceptResult: (r) =>
                r.membershipId === baseline.membershipId && !!r.membershipVersion,
            });
            if (!result) return false;
            const next = applyMembershipReceipt(baseline, result.value);
            if (!next) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            setBaseline(next);
            if (baseline.membershipId === session.context.membershipId) await reload();
            return true;
          }}
        />
        <Button
          variant="outline"
          disabled={command.busy || refreshing}
          onClick={async () => {
            setRefreshing(true);
            try {
              const next = await refresh();
              if (next) setBaseline(next);
            } catch (e) {
              setError(e);
            } finally {
              setRefreshing(false);
            }
          }}
        >
          {t.refreshVersion}
        </Button>
        <Button variant="ghost" disabled={command.busy} onClick={onClose}>
          {t.close}
        </Button>
      </div>
    </Card>
  );
}
