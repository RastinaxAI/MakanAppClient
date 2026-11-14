'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useContext, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as copy from '@/content/fa';
import { Button, buttonClass } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { V4Field, V4Hero, V4List, V4Note, V4Row, V4SwitchRow } from '@/components/v4/page';
import { useClassViewState } from './frame';
import {
  SceneMenuClose,
  useSceneContextSummary,
  useSceneFormAction,
} from '@/components/v5/form-actions';
import { usePersonal, usePersonalApi } from '@/features/personal/provider';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import { date } from '@/lib/formatting';
import {
  classApi as api,
  classBase as base,
  delegableAcademicCapabilities,
  hasFlag,
  type S,
} from './api-model';
import { StaticConnectedFrame } from './frame';
import { useClassCommand } from './use-class-command';

const t = copy.v5ClassMembers;
type Membership = S['PersonalClassMembershipDto'];
type Grant = S['PersonalClassAcademicPermissionDto'];
type Command = ReturnType<typeof useClassCommand>;
type Action = 'end' | 'revoke' | 'teacher';
type Snapshot = { kind: Action; member: Membership; grant?: Grant };
type CommittedChange =
  | { kind: 'roles'; before: Membership; after: Membership }
  | { kind: 'permissions'; before?: Grant; after: Grant; memberVersion: string };
type Draft = {
  version: string;
  grantVersion: string | null;
  roles: string[];
  capabilities: string[];
  reason: string;
  appliedChange?: string;
};
const roles = ['Learner', 'Teacher', 'Manager'] as const;
const capabilities = ['AuthorAssignments', 'AuthorExams', 'Grade'] as const;
const labels = {
  Learner: t.learner,
  Teacher: t.teacher,
  Manager: t.manager,
  AuthorAssignments: t.assignment,
  AuthorExams: t.exam,
  Grade: t.grade,
};
const hints = {
  Learner: t.learnerHint,
  Teacher: t.teacherHint,
  Manager: t.managerHint,
  AuthorAssignments: t.classOnly,
  AuthorExams: t.classOnly,
  Grade: t.privateAnswers,
};
const flags = (value: string) =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && part !== 'None');
const flagValue = (values: string[]) => values.join(', ') || 'None';
const sameFlags = (left: string, right: string) =>
  JSON.stringify([...new Set(flags(left))].sort()) ===
  JSON.stringify([...new Set(flags(right))].sort());
const toggle = (values: string[], value: string, checked: boolean) =>
  checked ? [...new Set([...values, value])] : values.filter((item) => item !== value);
const validDraft = (value: unknown): value is Draft => {
  if (!value || typeof value !== 'object') return false;
  const d = value as Draft;
  return (
    typeof d.version === 'string' &&
    (d.grantVersion === null || typeof d.grantVersion === 'string') &&
    Array.isArray(d.roles) &&
    d.roles.every((role) => typeof role === 'string') &&
    Array.isArray(d.capabilities) &&
    d.capabilities.every((capability) => typeof capability === 'string') &&
    typeof d.reason === 'string' &&
    d.reason.length <= 500 &&
    (d.appliedChange === undefined || typeof d.appliedChange === 'string')
  );
};
function acknowledgedMember(value: Membership, original: Membership, expectedRoles: string) {
  return (
    !!value &&
    value.id === original.id &&
    value.userId === original.userId &&
    value.joinedAtUtc === original.joinedAtUtc &&
    value.status === original.status &&
    typeof value.version === 'string' &&
    sameFlags(value.localRoles, expectedRoles) &&
    sameFlags(value.delegatedCapabilities, original.delegatedCapabilities)
  );
}
function acknowledgedGrant(value: Grant, classId: string, memberId: string, expected: string) {
  return (
    !!value &&
    value.personalClassId === classId &&
    value.membershipId === memberId &&
    typeof value.id === 'string' &&
    typeof value.version === 'string' &&
    typeof value.isEffective === 'boolean' &&
    typeof value.capabilities === 'string' &&
    sameFlags(value.capabilities, expected)
  );
}

function useMemberGrants(classId: string, enabled: boolean) {
  const { session, call } = usePersonal();
  return useQuery({
    queryKey: [
      'personal',
      session.user.id,
      'account',
      `${api}/${classId}/academic-permissions`,
      'all-pages',
    ],
    enabled,
    queryFn: async ({ signal }) => {
      const items = new Map<string, Grant>();
      for (let page = 1; page <= 100; page++) {
        const result = await call<S['PersonalClassPageOfPersonalClassAcademicPermissionDto']>(
          `${api}/${classId}/academic-permissions?page=${page}&pageSize=100`,
          { signal, expectedStatus: 200 },
        );
        if (
          result.page !== page ||
          result.pageSize !== 100 ||
          !Number.isSafeInteger(result.totalCount) ||
          result.totalCount < 0 ||
          !Array.isArray(result.items) ||
          result.items.length > 100 ||
          result.items.some((row) => row.personalClassId !== classId)
        )
          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
        for (const item of result.items) items.set(item.id, item);
        if (page * result.pageSize >= result.totalCount) return [...items.values()];
        if (!result.items.length) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      }
      throw new ApiError(503);
    },
  });
}

/** Real member subviews share one paginated membership identity and command scope. */
export function ClassMemberWorkspace({
  id,
  classValue,
  memberId,
  page,
}: {
  id: string;
  classValue: S['PersonalClassDto'];
  memberId: string;
  page: number;
}) {
  const { session } = usePersonal(),
    params = useSearchParams(),
    cache = useQueryClient();
  const view =
    params.get('view') === 'permissions'
      ? 'permissions'
      : params.get('view') === 'summary'
        ? 'summary'
        : params.get('view') === 'teaching'
          ? 'teaching'
          : 'roles';
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassMembershipDto']>(
    `${api}/${classValue.id}/memberships?page=${page}&pageSize=30`,
    { poll: 10000, enabled: classValue.id === id },
  );
  const member = q.data?.items.find((row) => row.id === memberId);
  const profile = usePersonalApi<S['MessagingPublicProfileResult']>(
    '/api/v1/people/' + member?.userId,
    { enabled: !!member && member.userId !== session.user.id },
  );
  const name =
    member?.userId === session.user.id
      ? session.user.displayName || session.user.firstName
      : profile.data?.userId === member?.userId
        ? profile.data?.displayName
        : undefined;
  const displayName = name || copy.v5Product.classMember;
  const grants = useMemberGrants(
    classValue.id,
    classValue.id === id && !!member && classValue.capabilities?.canManageRoles === true,
  );
  const matchingGrants =
    grants.data?.filter(
      (row) =>
        row.personalClassId === classValue.id && row.membershipId === memberId && row.isEffective,
    ) ?? [];
  const grant = matchingGrants[0];
  const command = useClassCommand('member:' + memberId);
  const [action, setAction] = useState<Snapshot | null>(null);
  const [committedChange, setCommittedChange] = useState<CommittedChange>();
  const manager = usePersonalApi<S['MessagingPublicProfileResult']>(
    '/api/v1/people/' + classValue.managerUserId,
    {
      enabled:
        action?.kind === 'teacher' &&
        !!classValue.managerUserId &&
        classValue.managerUserId !== session.user.id,
    },
  );
  const managerName =
    (classValue.managerUserId === session.user.id
      ? session.user.displayName || session.user.firstName
      : manager.data?.userId === classValue.managerUserId
        ? manager.data?.displayName
        : undefined) || '—';
  const path = `${base}/classes/${classValue.id}/members/${memberId}?page=${page}`;
  const mutable =
    member?.status === 'Active' && !classValue.archived && classValue.state === 'Active';
  const canRoles = mutable && classValue.capabilities?.canManageRoles === true;
  const open = (kind: Action) => {
    if (!member || command.busy) return;
    command.clearFeedback();
    setAction({ kind, member: structuredClone(member), grant: grant && structuredClone(grant) });
  };
  const dual =
    !!member && hasFlag(member.localRoles, 'Learner') && hasFlag(member.localRoles, 'Teacher');
  const invalid =
    classValue.id !== id ||
    (profile.data && profile.data.userId !== member?.userId) ||
    matchingGrants.length > 1;
  const menu = (
    <MemberMenu
      path={path}
      canRoles={!!canRoles}
      teacher={!!member && hasFlag(member.localRoles, 'Teacher')}
      canEnd={!!mutable && classValue.capabilities?.canManageMembers === true}
      canRevoke={!!canRoles && !!grant && hasFlag(grant.capabilities, 'Grade')}
      busy={command.busy}
      onAction={open}
      onRefresh={() =>
        void cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] })
      }
    />
  );
  return (
    <StaticConnectedFrame
      id={
        view === 'permissions'
          ? 'MK-309'
          : view === 'summary'
            ? 'RX-032'
            : view === 'teaching'
              ? 'RX-033'
              : 'MK-306'
      }
      kind={view === 'teaching' ? 'list' : undefined}
      title={
        view === 'permissions'
          ? t.permissionsTitle(displayName)
          : view === 'summary'
            ? dual
              ? t.dualTitle
              : t.summaryTitle
            : view === 'teaching'
              ? classValue.title
              : t.roleTitle(displayName)
      }
      subtitle={
        classValue.managerUserId === session.user.id
          ? copy.v5Product.independentClassManager
          : copy.text_22e1884c93fc
      }
      contextTitle={classValue.title}
      back={`${base}/classes/${classValue.id}/members?page=${page}`}
      menu={menu}
    >
      {invalid ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : !member ? (
        <EmptyState title={copy.v5Product.memberNotOnPage} />
      ) : (
        <>
          {member.status !== 'Active' && (
            <>
              <V4Note>{t.ended}</V4Note>
              <div className={uiClass('card')}>
                <div className={uiClass('kv')}>
                  <span className={uiClass('key')}>{t.endedAt}</span>
                  <span className={uiClass('val')}>
                    {member.endedAtUtc ? date(member.endedAtUtc, true) : '—'}
                  </span>
                </div>
                {member.endReason && <p className={uiClass('policy')}>{member.endReason}</p>}
              </div>
            </>
          )}
          {view === 'summary' ? (
            <MemberSummary
              member={member}
              name={displayName}
              overlay={!!action}
              review={
                canRoles && hasFlag(member.localRoles, 'Teacher')
                  ? path + '&view=permissions'
                  : undefined
              }
            />
          ) : view === 'teaching' ? (
            <TeachingResponsibility
              member={member}
              name={displayName}
              classValue={classValue}
              path={path}
            />
          ) : view === 'permissions' && !classValue.capabilities?.canManageRoles ? (
            <ErrorState error={new ApiError(403)} />
          ) : view === 'permissions' && grants.isPending ? (
            <LoadingSkeleton />
          ) : view === 'permissions' && grants.isError ? (
            <ErrorState error={grants.error} onRetry={() => void grants.refetch()} />
          ) : view === 'permissions' && !hasFlag(member.localRoles, 'Teacher') ? (
            <ErrorState error={new ApiError(403)} />
          ) : (
            <MemberEditor
              key={member.id + ':' + view}
              member={member}
              grant={grant}
              classValue={classValue}
              kind={view}
              command={command}
              canEdit={!!canRoles}
              committedChange={committedChange}
              overlay={!!action}
            />
          )}
          {!action && command.feedback}
          <MemberActionDialog
            snapshot={action}
            current={member}
            grant={grant}
            name={displayName}
            managerName={managerName}
            classValue={classValue}
            command={command}
            onClose={() => setAction(null)}
            onCommitted={setCommittedChange}
            onRefresh={async () => {
              await q.refetch();
              if (classValue.capabilities?.canManageRoles) await grants.refetch();
            }}
          />
        </>
      )}
    </StaticConnectedFrame>
  );
}

function MemberMenu({
  path,
  canRoles,
  teacher,
  canEnd,
  canRevoke,
  busy,
  onAction,
  onRefresh,
}: {
  path: string;
  canRoles: boolean;
  teacher: boolean;
  canEnd: boolean;
  canRevoke: boolean;
  busy: boolean;
  onAction: (kind: Action) => void;
  onRefresh: () => void;
}) {
  const close = useContext(SceneMenuClose);
  return (
    <div className={uiClass('stack')}>
      <Link
        className={uiClass(buttonClass('button button-outline'))}
        href={path + '&view=roles'}
        onClick={close ?? undefined}
      >
        {t.roles}
      </Link>
      <Link
        className={uiClass(buttonClass('button button-outline'))}
        href={path + '&view=summary'}
        onClick={close ?? undefined}
      >
        {t.summaryTitle}
      </Link>
      {canRoles && teacher && (
        <Link
          className={uiClass(buttonClass('button button-outline'))}
          href={path + '&view=permissions'}
          onClick={close ?? undefined}
        >
          {t.reviewPermissions}
        </Link>
      )}
      {teacher && (
        <Link
          className={uiClass(buttonClass('button button-outline'))}
          href={path + '&view=teaching'}
          onClick={close ?? undefined}
        >
          {t.teaching}
        </Link>
      )}
      {(
        [
          ['end', t.end, canEnd],
          ['revoke', t.revoke, canRevoke],
          ['teacher', t.endTeacher, canRoles && teacher],
        ] as const
      )
        .filter(([, , allowed]) => allowed)
        .map(([kind, label]) => (
          <Button
            key={kind}
            variant={kind === 'revoke' ? 'outline' : 'destructive'}
            disabled={busy}
            onClick={() => {
              close?.();
              onAction(kind);
            }}
          >
            {label}
          </Button>
        ))}
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => {
          close?.();
          onRefresh();
        }}
      >
        {t.refresh}
      </Button>
    </div>
  );
}

function TeachingResponsibility({
  member,
  name,
  classValue,
  path,
}: {
  member: Membership;
  name: string;
  classValue: S['PersonalClassDto'];
  path: string;
}) {
  useSceneContextSummary([
    { label: t.info, value: t.infoHint },
    { label: t.related, value: t.relatedHint },
  ]);
  if (member.status !== 'Active' || !hasFlag(member.localRoles, 'Teacher'))
    return <EmptyState title={t.noTeacherResponsibility} />;
  return (
    <>
      <V4Hero title={classValue.title}>
        <p>{t.teachingMember(name)}</p>
      </V4Hero>
      <V4List>
        <V4Row
          title={t.info}
          description={t.infoHint}
          icon={<FileText size={22} />}
          href={path + '&view=roles'}
        />
        <V4Row
          title={t.related}
          description={t.relatedHint}
          icon={<FileText size={22} />}
          href={`${base}/classes/${classValue.id}/learning`}
        />
      </V4List>
    </>
  );
}

function MemberSummary({
  member,
  name,
  review,
  overlay,
}: {
  member: Membership;
  name: string;
  review?: string;
  overlay: boolean;
}) {
  const action = useMemo(
    () =>
      review ? (
        <Button asChild>
          <Link href={review}>{t.reviewPermissions}</Link>
        </Button>
      ) : undefined,
    [review],
  );
  useSceneFormAction(action, !!review && !overlay);
  useSceneContextSummary(
    roles.map((role) => ({
      label: labels[role],
      value: hasFlag(member.localRoles, role) ? copy.text_a3fa2a3ffcb9 : copy.text_4e67bd8e3482,
    })),
  );
  return (
    <>
      <V4Hero title={name}>
        <p>{t.localMember}</p>
      </V4Hero>
      <V4List>
        {(['Teacher', 'Learner', 'Manager'] as const).map((role) => (
          <V4SwitchRow
            key={role}
            title={labels[role]}
            description={hints[role]}
            checked={hasFlag(member.localRoles, role)}
            disabled
            onCheckedChange={() => {}}
          />
        ))}
      </V4List>
      <V4Note>{t.rolePolicy}</V4Note>
    </>
  );
}

function MemberEditor({
  member,
  grant,
  classValue,
  kind,
  command,
  canEdit,
  committedChange,
  overlay,
}: {
  member: Membership;
  grant?: Grant;
  classValue: S['PersonalClassDto'];
  kind: 'roles' | 'permissions';
  command: Command;
  canEdit: boolean;
  committedChange?: CommittedChange;
  overlay: boolean;
}) {
  const { session } = usePersonal(),
    formId = useId();
  const initial: Draft = {
    version: member.version,
    grantVersion: grant?.version ?? null,
    roles: flags(member.localRoles),
    capabilities: flags(grant?.capabilities ?? 'None'),
    reason: '',
  };
  const [draft, setDraft, ready] = useClassViewState(
    session.user.id +
      ':' +
      contextSignature(session.context) +
      ':class-member:' +
      classValue.id +
      ':' +
      member.id +
      ':' +
      kind,
    initial,
    validDraft,
  );
  useEffect(() => {
    if (!ready || !committedChange || committedChange.kind !== kind) return;
    setDraft((current) => {
      const appliedChange =
        committedChange.kind + ':' + committedChange.after.id + ':' + committedChange.after.version;
      if (current.appliedChange === appliedChange) return current;
      if (committedChange.kind === 'roles')
        return {
          ...current,
          appliedChange,
          roles: current.roles.filter((role) => role !== 'Teacher'),
          version:
            current.version === committedChange.before.version
              ? committedChange.after.version
              : current.version,
        };
      return {
        ...current,
        appliedChange,
        capabilities: current.capabilities.filter((capability) => capability !== 'Grade'),
        grantVersion:
          current.version === committedChange.memberVersion &&
          current.grantVersion === (committedChange.before?.version ?? null)
            ? committedChange.after.version
            : current.grantVersion,
      };
    });
  }, [committedChange, kind, ready, setDraft]);
  const permissions = kind === 'permissions';
  const stale =
    draft.version !== member.version ||
    (permissions && draft.grantVersion !== (grant?.version ?? null));
  const disabled = command.busy || !ready || stale || !canEdit || !member.version;
  const action = useMemo(
    () => (
      <Button form={formId} type="submit" disabled={disabled} aria-busy={command.busy}>
        {permissions ? t.savePermissions : t.saveRoles}
      </Button>
    ),
    [formId, disabled, command.busy, permissions],
  );
  useSceneFormAction(action, canEdit && !overlay);
  useSceneContextSummary([
    { label: permissions ? t.permissionReason : t.reason, value: draft.reason },
  ]);
  const delegable = delegableAcademicCapabilities(classValue);
  return (
    <form
      id={formId}
      className={uiClass('v5-native-form')}
      data-class-member-editor={kind}
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || !draft.reason.trim()) return;
        const expectedRoles = flagValue(draft.roles),
          expectedCapabilities = flagValue(
            draft.capabilities.filter((capability) => delegable.includes(capability)),
          );
        if (permissions) {
          const result = await command.run<Grant>(
            `${api}/${classValue.id}/academic-permissions/${member.id}`,
            {
              capabilities: expectedCapabilities,
              expectedMembershipVersion: draft.version,
              expectedGrantVersion: draft.grantVersion,
              reason: draft.reason.trim(),
            },
            {
              method: 'PUT',
              idempotent: true,
              expectedStatus: 200,
              reconcileOnError: true,
              acceptResult: (value) =>
                acknowledgedGrant(value, classValue.id, member.id, expectedCapabilities),
            },
          );
          if (result)
            setDraft((current) => ({
              ...current,
              grantVersion: result.value.version,
              capabilities: flags(result.value.capabilities),
              reason: '',
            }));
        } else {
          const result = await command.run<Membership>(
            `${api}/${classValue.id}/memberships/${member.id}/roles`,
            {
              roles: expectedRoles,
              delegatedCapabilities: member.delegatedCapabilities,
              expectedVersion: draft.version,
              reason: draft.reason.trim(),
            },
            {
              method: 'PUT',
              expectedStatus: 200,
              reconcileOnError: true,
              acceptResult: (value) => acknowledgedMember(value, member, expectedRoles),
            },
          );
          if (result)
            setDraft((current) => ({
              ...current,
              version: result.value.version,
              roles: flags(result.value.localRoles),
              reason: '',
            }));
        }
      }}
    >
      <fieldset
        className={uiClass('v5-native-fields')}
        disabled={command.busy || !ready || !canEdit}
      >
        <V4List>
          {(permissions ? capabilities : roles).map((flag) => (
            <V4SwitchRow
              key={flag}
              title={labels[flag]}
              description={hints[flag]}
              checked={(permissions ? draft.capabilities : draft.roles).includes(flag)}
              disabled={permissions && !delegable.includes(flag)}
              onCheckedChange={(checked) =>
                setDraft((current) =>
                  permissions
                    ? { ...current, capabilities: toggle(current.capabilities, flag, checked) }
                    : { ...current, roles: toggle(current.roles, flag, checked) },
                )
              }
            />
          ))}
        </V4List>
        {canEdit && (
          <V4Field label={permissions ? t.permissionReason : t.reason}>
            <NativeInput
              required
              pattern=".*\S.*"
              title={t.reasonRequired}
              maxLength={500}
              value={draft.reason}
              onChange={(event) =>
                setDraft((current) => ({ ...current, reason: event.target.value }))
              }
            />
          </V4Field>
        )}
      </fieldset>
      {stale && (
        <>
          <p role="status">{t.changed}</p>
          <Button
            type="button"
            variant="outline"
            disabled={command.busy}
            onClick={() => {
              command.clearFeedback();
              setDraft((current) => ({
                ...current,
                version: member.version,
                grantVersion: grant?.version ?? null,
              }));
            }}
          >
            {t.reviewLatest}
          </Button>
        </>
      )}
    </form>
  );
}

function MemberActionDialog({
  snapshot,
  current,
  grant,
  name,
  managerName,
  classValue,
  command,
  onClose,
  onRefresh,
  onCommitted,
}: {
  snapshot: Snapshot | null;
  current: Membership;
  grant?: Grant;
  name: string;
  managerName: string;
  classValue: S['PersonalClassDto'];
  command: Command;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  onCommitted: (change: CommittedChange) => void;
}) {
  const formId = useId(),
    { session } = usePersonal();
  const [reasons, setReasons] = useClassViewState(
    session.user.id +
      ':' +
      contextSignature(session.context) +
      ':class-member-dialog:' +
      classValue.id +
      ':' +
      current.id,
    { end: '', revoke: '', teacher: '' },
    (value): value is Record<Action, string> =>
      !!value &&
      typeof value === 'object' &&
      (['end', 'revoke', 'teacher'] as const).every(
        (key) =>
          typeof (value as Record<Action, string>)[key] === 'string' &&
          (value as Record<Action, string>)[key].length <= 500,
      ),
  );
  const kind = snapshot?.kind ?? 'end';
  const stale =
    !!snapshot &&
    (snapshot.member.version !== current.version ||
      current.status !== 'Active' ||
      classValue.archived ||
      classValue.state !== 'Active' ||
      (kind === 'revoke' && snapshot.grant?.version !== grant?.version));
  const allowed =
    kind === 'end'
      ? classValue.capabilities?.canManageMembers
      : classValue.capabilities?.canManageRoles;
  const disabled = command.busy || stale || !allowed;
  const submit = (
    <div className={uiClass('confirm-actions')}>
      <Button
        variant={kind === 'revoke' ? 'default' : 'destructive'}
        type="submit"
        form={formId}
        disabled={disabled}
        aria-busy={command.busy}
      >
        {kind === 'end' ? t.end : kind === 'revoke' ? t.revokeAction : t.endTeacher}
      </Button>
      <Button type="button" variant="outline" disabled={command.busy} onClick={onClose}>
        {copy.text_fa7af603d430}
      </Button>
    </div>
  );
  const title = kind === 'end' ? t.endTitle(name) : kind === 'revoke' ? t.revoke : t.teacherTitle;
  return (
    <Dialog
      open={!!snapshot}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        title={title}
        description=""
        footer={submit}
        scenario={kind === 'end' ? 'MK-307' : kind === 'revoke' ? 'MK-310' : 'RX-033'}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLButtonElement>(
                '.v5-scene .rx-head button.rx-icon-button:not(.rx-back)',
              )
              ?.focus(),
          );
        }}
      >
        {snapshot && (
          <form
            id={formId}
            className={uiClass('v5-native-form')}
            onSubmit={async (event) => {
              event.preventDefault();
              if (disabled || !reasons[kind].trim()) return;
              let result;
              let change: CommittedChange | undefined;
              if (kind === 'end')
                result = await command.run(
                  `${api}/${classValue.id}/memberships/${snapshot.member.id}`,
                  { expectedVersion: snapshot.member.version, reason: reasons.end.trim() },
                  { method: 'DELETE', expectedStatus: 204, reconcileOnError: true },
                );
              else if (kind === 'teacher') {
                const expectedRoles = flagValue(
                  flags(snapshot.member.localRoles).filter((role) => role !== 'Teacher'),
                );
                result = await command.run<Membership>(
                  `${api}/${classValue.id}/memberships/${snapshot.member.id}/roles`,
                  {
                    expectedVersion: snapshot.member.version,
                    roles: expectedRoles,
                    delegatedCapabilities: snapshot.member.delegatedCapabilities,
                    reason: reasons.teacher.trim(),
                  },
                  {
                    method: 'PUT',
                    expectedStatus: 200,
                    reconcileOnError: true,
                    acceptResult: (value) =>
                      acknowledgedMember(value, snapshot.member, expectedRoles),
                  },
                );
                if (result)
                  change = { kind: 'roles', before: snapshot.member, after: result.value };
              } else if (snapshot.grant) {
                const expectedCapabilities = flagValue(
                  flags(snapshot.grant.capabilities).filter((capability) => capability !== 'Grade'),
                );
                result = await command.run<Grant>(
                  `${api}/${classValue.id}/academic-permissions/${snapshot.member.id}`,
                  {
                    capabilities: expectedCapabilities,
                    expectedMembershipVersion: snapshot.member.version,
                    expectedGrantVersion: snapshot.grant.version,
                    reason: reasons.revoke.trim(),
                  },
                  {
                    method: 'PUT',
                    idempotent: true,
                    expectedStatus: 200,
                    reconcileOnError: true,
                    acceptResult: (value) =>
                      acknowledgedGrant(
                        value,
                        classValue.id,
                        snapshot.member.id,
                        expectedCapabilities,
                      ),
                  },
                );
                if (result)
                  change = {
                    kind: 'permissions',
                    before: snapshot.grant,
                    after: result.value,
                    memberVersion: snapshot.member.version,
                  };
              }
              if (result) {
                if (change) onCommitted(change);
                setReasons((current) => ({ ...current, [kind]: '' }));
                onClose();
              }
            }}
          >
            <fieldset
              className={uiClass('v5-native-fields')}
              data-fields-layout="dialog"
              disabled={command.busy}
            >
              {kind === 'teacher' && (
                <dl className={uiClass('v5-dialog-summary')}>
                  <div className={uiClass('kv')}>
                    <dt>{t.currentTeacher}</dt>
                    <dd>{name}</dd>
                  </div>
                  <div className={uiClass('kv')}>
                    <dt>{t.responsibleManager}</dt>
                    <dd>{managerName}</dd>
                  </div>
                </dl>
              )}
              <p className={uiClass('policy dialog-policy')}>
                {kind === 'end'
                  ? t.endPolicy
                  : kind === 'revoke'
                    ? t.revokePolicy
                    : t.teacherPolicy}
              </p>
              <V4Field label={t.permissionReason}>
                <NativeInput
                  required
                  pattern=".*\S.*"
                  title={t.reasonRequired}
                  maxLength={500}
                  value={reasons[kind]}
                  onChange={(event) =>
                    setReasons((current) => ({ ...current, [kind]: event.target.value }))
                  }
                />
              </V4Field>
            </fieldset>
            {stale && (
              <>
                <p role="status">{t.changed}</p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={command.busy}
                  onClick={async () => {
                    await onRefresh();
                    onClose();
                  }}
                >
                  {t.reviewLatest}
                </Button>
              </>
            )}
            {command.feedback}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
