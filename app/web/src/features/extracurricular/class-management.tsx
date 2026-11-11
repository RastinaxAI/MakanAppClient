'use client';
import {
  Textarea as NativeTextarea,
  Input as NativeInput,
  Select as NativeSelect,
  SearchField,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { integration80c as t } from '@/content/fa';
import { vnext } from '@/content/fa';
import { Button, buttonClass } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent, useDialogFormAction } from '@/components/ui/dialog';
import { ErrorState, LoadingSkeleton, EmptyState } from '@/components/ui/states';
import { usePersonal, usePersonalApi } from '@/features/personal/provider';
import { resolvePersonInput } from '@/features/personal/messaging/directory';
import { Field, Pager } from '@/features/personal/school/shared';
import { date } from '@/lib/formatting';
import { ApiError } from '@/lib/api/errors';
import {
  classBase as base,
  classApi as api,
  stateLabel,
  hasFlag,
  independentLearningReleased,
  type S,
} from './api-model';
import { StaticConnectedFrame } from './frame';
import { ClassMemberWorkspace } from './class-member';
import { useClassCommand } from './use-class-command';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { V4Hero, V4List, V4Row } from '@/components/v4/page';
import {
  useSceneFormAction,
  useSceneContextSummary,
  useSceneMenuTools,
  SceneMenuClose,
} from '@/components/v5/form-actions';
import {
  BookOpen,
  Users,
  UserPlus,
  ClipboardList,
  MessagesSquare,
  History,
  Settings,
  SearchX,
} from 'lucide-react';

function QueryResult({
  q,
  children,
}: {
  q: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown };
  children: ReactNode;
}) {
  return q.isPending ? (
    <LoadingSkeleton />
  ) : q.isError ? (
    <ErrorState error={q.error} onRetry={() => void q.refetch()} />
  ) : (
    children
  );
}
export function ClassOverview({ id }: { id: string }) {
  const { session } = usePersonal();
  const q = usePersonalApi<S['PersonalClassDto']>(`${api}/${id}`, { poll: 10000 });
  return (
    <StaticConnectedFrame
      id={
        q.data?.archived ? 'MK-25' : q.data?.managerUserId === session.user.id ? 'MK-24' : 'MK-23'
      }
      title={q.data?.title ?? t.independent}
    >
      <QueryResult q={q}>
        {q.data && (
          <>
            <V4Hero title={q.data.title}>
              <span className={uiClass('badge')}>{stateLabel(q.data.state ?? 'Unknown')}</span>
              <span>
                {t.capacity}
                {uiText.text_45822f54a0d0}
                {q.data.capacity?.toLocaleString('fa-IR') ?? '—'}
              </span>
            </V4Hero>
            <V4List>
              {[
                {
                  path: 'learning',
                  title: t.learning,
                  Icon: BookOpen,
                  show: independentLearningReleased,
                },
                { path: 'members', title: t.members, Icon: Users, show: true },
                {
                  path: 'requests',
                  title: t.joins,
                  Icon: ClipboardList,
                  show: q.data.capabilities?.canManageMembers,
                },
                {
                  path: 'invite',
                  title: t.invite,
                  Icon: UserPlus,
                  show: q.data.capabilities?.canManageMembers,
                },
                { path: 'setup', title: t.spaces, Icon: MessagesSquare, show: true },
                { path: 'info', title: t.history, Icon: History, show: true },
                {
                  path: 'edit',
                  title: t.settings,
                  Icon: Settings,
                  show: q.data.managerUserId === session.user.id,
                },
              ]
                .filter((item) => item.show)
                .map(({ path, title, Icon }) => (
                  <V4Row
                    key={path}
                    title={title}
                    icon={<Icon size={22} />}
                    href={`${base}/classes/${id}/${path}`}
                  />
                ))}
            </V4List>
            <p className={uiClass('policy')}>{t.grantHint}</p>
            <ClassSpaces value={q.data} />
          </>
        )}
      </QueryResult>
    </StaticConnectedFrame>
  );
}
function VersionForm({
  version,
  busy,
  children,
  onSubmit,
  label = t.save,
  primary = false,
  onCancel,
  reasonValue,
  onReasonChange,
  reasonLabel = t.reason,
}: {
  version: string;
  busy: boolean;
  children: ReactNode;
  onSubmit: (data: FormData, version: string) => Promise<unknown>;
  label?: string;
  primary?: boolean;
  onCancel?: () => void;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
  reasonLabel?: string;
}) {
  const formId = useId();
  const [committed, setCommitted] = useState(false);
  const [expected, setExpected] = useState(version),
    stale = expected !== version;
  const action = useMemo(
    () => (
      <Button type="submit" form={formId} disabled={busy || stale || !version} aria-busy={busy}>
        {label}
      </Button>
    ),
    [formId, busy, stale, version, label],
  );
  const lifted = useSceneFormAction(action, primary);
  const dialogActions = useMemo(
    () => (
      <div className={uiClass('confirm-actions')}>
        {action}
        <Button type="button" variant="outline" onClick={onCancel}>
          {uiText.text_fa7af603d430}
        </Button>
      </div>
    ),
    [action, onCancel],
  );
  const inDialog = useDialogFormAction(dialogActions, !!onCancel);
  useEffect(() => {
    if (committed) {
      setExpected(version);
      setCommitted(false);
    }
  }, [committed, version]);
  return (
    <form
      id={formId}
      className={uiClass(primary || onCancel ? 'v5-native-form' : 'card stack')}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!stale && !busy) {
          const result = await onSubmit(new FormData(e.currentTarget), expected);
          if (result) setCommitted(true);
        }
      }}
    >
      <fieldset
        className={uiClass(primary || onCancel ? 'v5-native-fields' : 'stack')}
        disabled={busy}
      >
        {children}
        <Field label={reasonLabel}>
          <NativeTextarea
            name="reason"
            required
            maxLength={500}
            value={reasonValue}
            onChange={onReasonChange ? (event) => onReasonChange(event.target.value) : undefined}
          />
        </Field>
      </fieldset>
      {stale && (
        <>
          <p role="alert">{t.versionConflict}</p>
          <Button type="button" variant="outline" onClick={() => setExpected(version)}>
            {t.refresh}
          </Button>
        </>
      )}
      {!lifted && !inDialog && action}
    </form>
  );
}
export function ClassManagement({
  id,
  section,
  memberId,
}: {
  id: string;
  section: string;
  memberId?: string;
}) {
  const params = useSearchParams();
  const { session } = usePersonal();
  const [emptyMemberSearch, setEmptyMemberSearch] = useState(false);
  const q = usePersonalApi<S['PersonalClassDto']>(`${api}/${id}`, {
    enabled: section !== 'join',
    poll: 10000,
  });
  if (section === 'join')
    return (
      <StaticConnectedFrame id="MK-302" title={t.join}>
        <JoinClass id={id} />
      </StaticConnectedFrame>
    );
  if (section === 'members' && memberId && q.data)
    return (
      <ClassMemberWorkspace
        id={id}
        classValue={q.data}
        memberId={memberId}
        page={membershipPage(params.get('page'))}
      />
    );
  return (
    <StaticConnectedFrame
      back={
        section === 'members' && memberId
          ? `${base}/classes/${id}/members?page=${membershipPage(params.get('page'))}`
          : `${base}/classes/${id}`
      }
      id={
        section === 'members'
          ? memberId
            ? 'MK-306'
            : emptyMemberSearch
              ? 'MK-54'
              : 'MK-305'
          : section === 'requests'
            ? 'MK-303'
            : section === 'invite'
              ? 'MK-296'
              : section === 'edit'
                ? 'MK-293'
                : section === 'info'
                  ? 'MK-318'
                  : 'MK-292'
      }
      title={
        section === 'members'
          ? memberId
            ? uiText.v5Product.memberDetails
            : emptyMemberSearch
              ? uiText.v5ClassMembers.membersTitle
              : uiText.v5Product.classMembersAndRoles
          : section === 'requests'
            ? t.joins
            : section === 'invite'
              ? uiText.v5Product.inviteToClass
              : section === 'edit'
                ? t.settings
                : section === 'info'
                  ? uiText.v5Product.classHistory
                  : uiText.v5Product.classSpaces
      }
      subtitle={
        section === 'members' && emptyMemberSearch
          ? q.data?.title
          : q.data?.managerUserId === session.user.id
            ? uiText.v5Product.independentClassManager
            : undefined
      }
      contextTitle={q.data?.title}
    >
      <QueryResult q={q}>
        {q.data &&
          (section === 'members' ? (
            <Members value={q.data} onEmptySearchChange={setEmptyMemberSearch} />
          ) : section === 'requests' ? (
            <JoinRequests value={q.data} />
          ) : section === 'invite' ? (
            <InviteMember value={q.data} />
          ) : ['edit', 'archive'].includes(section) ? (
            <ClassSettings value={q.data} />
          ) : section === 'info' ? (
            <ClassHistory id={id} />
          ) : (
            <ClassSpaces value={q.data} />
          ))}
      </QueryResult>
    </StaticConnectedFrame>
  );
}
function ClassSpaces({ value }: { value: S['PersonalClassDto'] }) {
  const q = usePersonalApi<S['OfficialSpacesPairResult']>(`${api}/${value.id}/spaces`, {
    poll: 5000,
  });
  const command = useClassCommand('repair:' + value.id),
    [pending, setPending] = useState(false);
  return (
    <section className={uiClass('card stack')}>
      <h3>{t.spaces}</h3>
      <QueryResult q={q}>
        {q.data && (
          <div className={uiClass('link-pair')}>
            {(['group', 'channel'] as const).map((kind) => {
              const space = q.data![kind];
              return (
                <div className={uiClass('link-card')} key={kind}>
                  <h4>{t[kind]}</h4>
                  <p>{stateLabel(space.state)}</p>
                  {space.conversationId && space.capabilities.canRead && (
                    <Link
                      className={uiClass(buttonClass('btn secondary'))}
                      href={`/personal/messages/${space.conversationId}`}
                    >
                      {t.open}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </QueryResult>
      {value.capabilities?.canManageSpaces && value.version && (
        <VersionForm
          version={value.version}
          busy={command.busy}
          label={t.repair}
          onSubmit={async (f, version) => {
            const r = await command.run(`${api}/${value.id}/spaces/repair`, {
              expectedVersion: version,
              reason: f.get('reason'),
            });
            if (r) {
              setPending(true);
              void q.refetch();
            }
          }}
        >
          <p>{t.formationHint}</p>
        </VersionForm>
      )}
      {pending && <p role="status">{t.repairPending}</p>}
      {command.feedback}
    </section>
  );
}
export function ClassInvitationList({ id }: { id?: string }) {
  const [page, setPage] = useState(1);
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassInvitationDto']>(
    `${api}/invitations/page?page=${page}&pageSize=30`,
    { poll: 10000 },
  );
  return (
    <StaticConnectedFrame id="MK-297" title={t.invitations}>
      <QueryResult q={q}>
        {q.data && (
          <>
            {!q.data.items.length && <EmptyState title={t.noItems} />}{' '}
            {q.data.items
              .filter((v) => !id || v.id === id)
              .map((v) => (
                <Invitation key={v.id} value={v} />
              ))}
            <Pager page={page} total={q.data.totalCount} onChange={setPage} />
          </>
        )}
      </QueryResult>
      <Transfers />
    </StaticConnectedFrame>
  );
}
function Invitation({ value }: { value: S['PersonalClassInvitationDto'] }) {
  const command = useClassCommand('invitation:' + value.id),
    router = useRouter(),
    { session } = usePersonal();
  const pending = value.status === 'Pending' && Date.parse(value.expiresAtUtc) > Date.now();
  return (
    <article className={uiClass('card stack')}>
      <h3>{value.classTitle || t.invitations}</h3>
      {value.inviter && (
        <p>
          {vnext.invitationFrom}
          {uiText.text_45822f54a0d0}
          {value.inviter.displayName}
          {value.inviter.username && (
            <bdi>
              {uiText.text_25c0dfd543f5}
              {value.inviter.username}
              {uiText.text_ba5ec51d07a4}
            </bdi>
          )}
        </p>
      )}
      <p>{stateLabel(value.status ?? (value.accepted ? 'Accepted' : 'Unknown'))}</p>
      <small>{date(value.expiresAtUtc, true)}</small>
      {pending && value.destinationUserId === session.user.id && (
        <>
          <Button
            disabled={command.busy}
            onClick={async () => {
              const r = await command.run<S['PersonalClassDto']>(
                `${api}/invitations/${value.id}/accept`,
              );
              if (r) router.push(`${base}/classes/${r.value.id}`);
            }}
          >
            {t.accept}
          </Button>
          {value.version && (
            <VersionForm
              version={value.version}
              busy={command.busy}
              label={t.decline}
              onSubmit={(f, version) =>
                command.run(`${api}/invitations/${value.id}/decline`, {
                  expectedVersion: version,
                  reason: f.get('reason'),
                })
              }
            >
              <p>{t.decline}</p>
            </VersionForm>
          )}
        </>
      )}
      {command.feedback}
    </article>
  );
}
function InviteMember({ value }: { value: S['PersonalClassDto'] }) {
  const formId = useId();
  const { call } = usePersonal(),
    [target, setTarget] = useState(''),
    [roles, setRoles] = useState('Learner');
  const [error, setError] = useState<unknown>(),
    [invitation, setInvitation] = useState<S['PersonalClassInvitationDto']>();
  const command = useClassCommand('invite:' + value.id),
    [resolving, setResolving] = useState(false);
  const action = useMemo(
    () => (
      <Button
        type="submit"
        form={formId}
        disabled={command.busy || resolving}
        aria-busy={command.busy || resolving}
      >
        {t.invite}
      </Button>
    ),
    [formId, command.busy, resolving],
  );
  const lifted = useSceneFormAction(action, value.capabilities?.canManageMembers === true);
  if (!value.capabilities?.canManageMembers) return <ErrorState error={new ApiError(403)} />;
  return (
    <>
      <form
        id={formId}
        className={uiClass('v5-native-form')}
        onSubmit={async (e) => {
          e.preventDefault();
          if (resolving || command.busy) return;
          setResolving(true);
          setError(undefined);
          try {
            const resolved = await call<S['PeopleResolveResult']>('/api/v1/people/resolve', {
              method: 'POST',
              body: JSON.stringify(resolvePersonInput(target)),
            });
            if (!resolved.isDiscoverable || !resolved.profile) throw new ApiError(404);
            const person = resolved.profile;
            const r = await command.run<S['PersonalClassInvitationDto']>(
              `${api}/${value.id}/invitations`,
              {
                destinationUserId: person.userId,
                localRoles: roles,
                delegatedCapabilities: 'None',
              },
              { idempotent: true },
            );
            if (r) setInvitation(r.value);
          } catch (e) {
            setError(e);
          } finally {
            setResolving(false);
          }
        }}
      >
        <Field label={t.target}>
          <NativeInput required value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label={t.roles}>
          <NativeSelect value={roles} onChange={(e) => setRoles(e.target.value)}>
            <option value="Learner">{t.learner}</option>
            <option value="Teacher">{t.teacher}</option>
          </NativeSelect>
        </Field>
        {!lifted && action}
        {!!error && <ErrorState error={error} />}
        {command.feedback}
      </form>
      {invitation && (
        <div className={uiClass('card')}>
          <p role="status">{t.pendingMember}</p>
          <p>
            {stateLabel(invitation.status ?? 'Unknown')}
            {uiText.text_588da4105320}
            {date(invitation.expiresAtUtc, true)}
          </p>
          {invitation.version && (
            <VersionForm
              version={invitation.version}
              busy={command.busy}
              label={t.revoke}
              onSubmit={(f, version) =>
                command.run(`${api}/invitations/${invitation.id}/revoke`, {
                  expectedVersion: version,
                  reason: f.get('reason'),
                })
              }
            >
              <p>{t.revoke}</p>
            </VersionForm>
          )}
        </div>
      )}
    </>
  );
}
function JoinClass({ id }: { id: string }) {
  const command = useClassCommand('join:' + id),
    [result, setResult] = useState<S['PersonalClassJoinDto']>();
  return (
    <section className={uiClass('card stack')}>
      <p>{t.pendingMember}</p>
      <Button
        disabled={command.busy || !!result}
        onClick={async () => {
          const r = await command.run<S['PersonalClassJoinDto']>(
            `${api}/${id}/join-requests`,
            {},
            { idempotent: true },
          );
          if (r) setResult(r.value);
        }}
      >
        {t.join}
      </Button>
      {result && <p role="status">{stateLabel(result.status)}</p>}
      {command.feedback}
    </section>
  );
}
function JoinRequests({ value }: { value: S['PersonalClassDto'] }) {
  const [page, setPage] = useState(1);
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassJoinDto']>(
    `${api}/join-requests?classId=${value.id}&page=${page}&pageSize=30`,
    { poll: 10000 },
  );
  return (
    <QueryResult q={q}>
      {q.data && (
        <>
          {q.data.items.map((item) => (
            <JoinDecision
              key={item.id}
              value={item}
              canManage={value.capabilities?.canManageMembers === true}
            />
          ))}
          {!q.data.items.length && <EmptyState title={t.noItems} />}
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
    </QueryResult>
  );
}
function JoinDecision({
  value,
  canManage,
}: {
  value: S['PersonalClassJoinDto'];
  canManage: boolean;
}) {
  const command = useClassCommand('join-decision:' + value.id);
  const { session } = usePersonal();
  const [open, setOpen] = useState(false);
  const key =
    'makan:draft:view:' +
    session.user.id +
    ':' +
    contextSignature(session.context) +
    ':join-decision:' +
    value.id +
    ':';
  const [reason, setReason, ready] = useViewState(
    key + 'reason',
    '',
    (v): v is string => typeof v === 'string' && v.length <= 500,
  );
  const [decision, setDecision] = useViewState(
    key + 'decision',
    'Approved',
    (v): v is string => v === 'Approved' || v === 'Rejected',
  );
  return (
    <article className={uiClass('card stack')}>
      <p>
        <MemberName userId={value.userId} />
      </p>
      <p>{stateLabel(value.status)}</p>
      {canManage && value.status === 'Pending' && (
        <>
          <Button disabled={!ready || command.busy} onClick={() => setOpen(true)}>
            {uiText.v5Product.reviewJoinRequest}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent title={uiText.v5Product.reviewJoinRequest}>
              <div className={uiClass('card')}>
                <MemberName userId={value.userId} />
                <p>{uiText.v5Product.joinReviewPolicy}</p>
              </div>
              <VersionForm
                version={value.version}
                busy={command.busy}
                label={t.action}
                reasonValue={reason}
                onReasonChange={setReason}
                onCancel={() => setOpen(false)}
                onSubmit={async (f, version) => {
                  const result = await command.run(`${api}/join-requests/${value.id}/decision`, {
                    expectedVersion: version,
                    decision: f.get('decision'),
                    reason: f.get('reason'),
                  });
                  if (result) {
                    setOpen(false);
                    setReason('');
                  }
                  return result;
                }}
              >
                <Field label={t.status}>
                  <NativeSelect
                    name="decision"
                    value={decision}
                    onChange={(event) => setDecision(event.target.value)}
                  >
                    <option value="Approved">{t.approve}</option>
                    <option value="Rejected">{t.reject}</option>
                  </NativeSelect>
                </Field>
              </VersionForm>
              {command.feedback}
            </DialogContent>
          </Dialog>
        </>
      )}
      {!open && command.feedback}
    </article>
  );
}
function Members({
  value,
  onEmptySearchChange,
}: {
  value: S['PersonalClassDto'];
  onEmptySearchChange: (empty: boolean) => void;
}) {
  const { session, call } = usePersonal();
  const params = useSearchParams(),
    router = useRouter(),
    path = usePathname();
  const page = membershipPage(params.get('page'));
  const setPage = (next: number) => {
    const query = new URLSearchParams(params);
    query.set('page', String(next));
    router.replace(path + '?' + query, { scroll: false });
  };
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassMembershipDto']>(
    `${api}/${value.id}/memberships?page=${page}&pageSize=30`,
    { poll: 10000 },
  );
  const members = q.data?.items ?? [];
  // The same public-profile reads and cache keys used by member details. Only
  // the returned membership page is searched; no unregistered query is sent.
  const identities = useQueries({
    queries: members.map((member) => {
      const path = '/api/v1/people/' + member.userId;
      return {
        queryKey: ['personal', session.user.id, session.revision, path],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const profile = await call<S['MessagingPublicProfileResult']>(path, { signal });
          if (profile.userId !== member.userId)
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          return profile;
        },
        enabled: session.user.id !== member.userId,
      };
    }),
  });
  const named = members.map((member, index) => ({
    member,
    name:
      (member.userId === session.user.id
        ? session.user.displayName || session.user.firstName
        : identities[index]?.data?.displayName) || uiText.v5Product.classMember,
  }));
  const [search, setSearch, searchReady] = useViewState(
    session.user.id + ':' + contextSignature(session.context) + ':class-members:' + value.id,
    '',
    (s): s is string => typeof s === 'string' && s.length <= 200,
  );
  const query = searchReady ? search : '';
  const visible = named.filter(({ name }) =>
    name.toLocaleLowerCase('fa').includes(query.trim().toLocaleLowerCase('fa')),
  );
  const identitiesPending = identities.some(
    (identity) => identity.isPending && identity.fetchStatus !== 'idle',
  );
  const emptySearch =
    q.isSuccess &&
    !!query.trim() &&
    q.data.items.length > 0 &&
    !visible.length &&
    !identitiesPending;
  useEffect(() => {
    onEmptySearchChange(emptySearch);
    return () => onEmptySearchChange(false);
  }, [emptySearch, onEmptySearchChange]);
  const [transfersOpen, setTransfersOpen] = useState(false);
  const closeMenu = useContext(SceneMenuClose);
  useSceneMenuTools(
    <Button
      variant="outline"
      onClick={() => {
        closeMenu?.();
        setTransfersOpen(true);
      }}
    >
      {t.transfer}
    </Button>,
    true,
  );
  useSceneContextSummary(
    q.isSuccess
      ? visible.slice(0, 3).map(({ member, name }) => ({
          label: name,
          value: memberDescription(member),
        }))
      : [],
    true,
  );
  return (
    <>
      <QueryResult q={q}>
        {q.data && (
          <>
            <SearchField
              aria-label={uiText.v5Product.memberName}
              placeholder={uiText.v5Product.memberName}
              maxLength={200}
              value={query}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch('')}
            />
            {(page > 1 || q.data.totalCount > q.data.pageSize) && (
              <p className={uiClass('policy')}>{uiText.v5Product.memberPageSearchPolicy}</p>
            )}
            {visible.length > 0 && (
              <V4List>
                {visible.map(({ member, name }) => (
                  <MemberListRow
                    key={member.id}
                    value={member}
                    name={name}
                    classId={value.id}
                    page={page}
                  />
                ))}
              </V4List>
            )}
            {q.data.items.length > 0 &&
              !visible.length &&
              (identitiesPending ? (
                <LoadingSkeleton variant="cards" />
              ) : (
                <>
                  <EmptyState
                    variant="v5-full"
                    icon={<SearchX />}
                    title={uiText.v5Product.noMatchingMembers}
                    description={uiText.v5ClassMembers.searchHint}
                  />
                  <Button variant="outline" onClick={() => setSearch('')}>
                    {uiText.v5Product.clearMemberSearch}
                  </Button>
                </>
              ))}
            {!!query.trim() && (
              <p className={uiClass('hint')}>{uiText.v5ClassMembers.searchPolicy}</p>
            )}
            {!q.data.items.length && (
              <EmptyState
                title={
                  page > 1 || q.data.totalCount > 0 ? uiText.v5ClassMembers.emptyPage : vnext.empty
                }
              />
            )}
            {(page > 1 || q.data.totalCount > q.data.pageSize) && (
              <Pager page={page} total={q.data.totalCount} onChange={setPage} />
            )}
          </>
        )}
      </QueryResult>
      <Dialog open={transfersOpen} onOpenChange={setTransfersOpen}>
        <DialogContent title={t.transfer}>
          {transfersOpen && <Transfers classValue={value} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
function membershipPage(value: string | null) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
function MemberListRow({
  value,
  classId,
  page,
  name,
}: {
  value: S['PersonalClassMembershipDto'];
  classId: string;
  page: number;
  name: string;
}) {
  return (
    <V4Row
      testId={'membership-' + value.id}
      title={name}
      description={memberDescription(value)}
      iconClassName="avatar"
      icon={Array.from(name)[0]}
      href={`${base}/classes/${classId}/members/${value.id}?page=${page}`}
      end={
        <span className={uiClass('badge')}>
          {hasFlag(value.localRoles, 'Manager')
            ? t.manager
            : hasFlag(value.localRoles, 'Teacher')
              ? t.teacher
              : stateLabel(value.status)}
        </span>
      }
    />
  );
}
function memberDescription(value: S['PersonalClassMembershipDto']) {
  const roles = ['Learner', 'Teacher', 'Manager']
    .filter((role) => hasFlag(value.localRoles, role))
    .map((role) => ({ Learner: t.learner, Teacher: t.teacher, Manager: t.manager })[role])
    .join(' / ');
  return roles + ' · ' + stateLabel(value.status);
}
function ClassSettings({ value }: { value: S['PersonalClassDto'] }) {
  const command = useClassCommand('settings:' + value.id),
    { session } = usePersonal();
  const manager = value.managerUserId === session.user.id;
  const [capacity, setCapacity] = useState(String(value.capacity ?? 1));
  const [accepting, setAccepting] = useState(value.acceptingJoinRequests);
  const [reason, setReason] = useState('');
  const [lifecycle, setLifecycle] = useState<'activate' | 'suspend' | 'archive' | null>(null);
  const [reasons, setReasons] = useState({ activate: '', suspend: '', archive: '' });
  const closeLifecycle = useCallback(() => setLifecycle(null), []);
  const closeMenu = useContext(SceneMenuClose);
  const lifecycleMenu = useMemo(
    () => (
      <div className={uiClass('stack')}>
        {(['activate', 'suspend', 'archive'] as const)
          .filter((action) => action !== 'archive' || value.capabilities?.canArchive)
          .map((action) => (
            <Button
              key={action}
              variant="outline"
              onClick={() => {
                closeMenu?.();
                setLifecycle(action);
              }}
            >
              {t[action]}
            </Button>
          ))}
        <Link
          className={uiClass(buttonClass('button button-outline'))}
          href={`${base}/classes/${value.id}/members`}
        >
          {t.transfer}
        </Link>
      </div>
    ),
    [closeMenu, value.capabilities?.canArchive, value.id],
  );
  const actionsInMenu = useSceneMenuTools(lifecycleMenu, manager && !!value.version);
  useSceneContextSummary([
    { label: t.capacity, value: capacity },
    { label: t.reason, value: reason },
  ]);
  if (!value.version || !manager) return <ErrorState error={new ApiError(403)} />;
  return (
    <>
      <div className={uiClass('card')}>
        <div className={uiClass('kv')}>
          <span className={uiClass('key')}>{uiText.v5Product.registeredTitle}</span>
          <span className={uiClass('val')}>{value.title}</span>
        </div>
      </div>
      <VersionForm
        primary
        version={value.version}
        busy={command.busy}
        reasonValue={reason}
        onReasonChange={setReason}
        onSubmit={(f, version) =>
          command.run(
            `${api}/${value.id}/settings`,
            {
              expectedVersion: version,
              capacity: Number(f.get('capacity')),
              acceptingJoinRequests: f.get('accepting') === 'on',
              reason: f.get('reason'),
            },
            { method: 'PUT' },
          )
        }
      >
        <Field label={t.capacity}>
          <NativeInput
            required
            name="capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
        </Field>
        <label className={uiClass('v4-check v5-setting-choice')}>
          <span className={uiClass('grow')}>
            <strong>{t.accepting}</strong>
            <small>{uiText.v5Product.joinRequestsDescription}</small>
          </span>
          <NativeInput
            name="accepting"
            type="checkbox"
            aria-label={t.accepting}
            checked={accepting}
            onChange={(event) => setAccepting(event.target.checked)}
          />
        </label>
      </VersionForm>
      {!actionsInMenu && lifecycleMenu}
      {command.feedback}
      <Dialog
        open={!!lifecycle}
        onOpenChange={(open) => {
          if (!open) closeLifecycle();
        }}
      >
        {lifecycle && (
          <DialogContent
            title={t[lifecycle]}
            description={uiText.v5Product.classLifecyclePolicy[lifecycle]}
            scenario={
              lifecycle === 'suspend' ? 'MK-320' : lifecycle === 'archive' ? 'MK-322' : undefined
            }
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              document
                .querySelector<HTMLElement>(
                  '[data-v5-scene="MK-293"] .rx-head button.rx-icon-button',
                )
                ?.focus();
            }}
          >
            <VersionForm
              version={value.version}
              busy={command.busy}
              label={t[lifecycle]}
              reasonValue={reasons[lifecycle]}
              onReasonChange={(text) =>
                setReasons((current) => ({ ...current, [lifecycle]: text }))
              }
              onCancel={closeLifecycle}
              reasonLabel={lifecycle === 'archive' ? uiText.v5Product.archiveReason : t.reason}
              onSubmit={async (fields, version) => {
                const result = await command.run(`${api}/${value.id}/${lifecycle}`, {
                  expectedVersion: version,
                  reason: fields.get('reason'),
                });
                if (result) {
                  setReasons((current) => ({ ...current, [lifecycle]: '' }));
                  closeLifecycle();
                }
                return result;
              }}
            >
              {command.feedback}
            </VersionForm>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
function Transfers({ classValue }: { classValue?: S['PersonalClassDto'] }) {
  const [page, setPage] = useState(1),
    { session } = usePersonal(),
    command = useClassCommand('manager-transfer:' + (classValue?.id ?? 'incoming'));
  const q = usePersonalApi<S['PersonalClassPageOfPersonalClassTransferDto']>(
    `${api}/manager-transfers?page=${page}&pageSize=30${classValue ? '&classId=' + classValue.id : ''}`,
    { poll: 10000 },
  );
  return (
    <section className={uiClass('card stack')}>
      <h3>{t.transfer}</h3>
      {classValue?.managerUserId === session.user.id && classValue.version && (
        <VersionForm
          version={classValue.version}
          busy={command.busy}
          label={t.transfer}
          onSubmit={(f, version) =>
            command.run(
              `${api}/${classValue.id}/manager-transfers`,
              { expectedVersion: version, targetUserId: f.get('target'), reason: f.get('reason') },
              { idempotent: true },
            )
          }
        >
          <Field label={t.transferTarget}>
            <NativeInput name="target" required pattern="[a-fA-F0-9-]{36}" dir="ltr" />
          </Field>
        </VersionForm>
      )}
      <QueryResult q={q}>
        {q.data && (
          <>
            {q.data.items.map((v) => (
              <article key={v.id}>
                <p>{stateLabel(v.status)}</p>
                <p>{v.reason}</p>
                {v.status === 'Pending' &&
                  v.targetUserId === session.user.id &&
                  (['Accepted', 'Declined'] as const).map((decision) => (
                    <ConfirmAction
                      key={decision}
                      title={decision === 'Accepted' ? t.transferAccept : t.transferDecline}
                      trigger={decision === 'Accepted' ? t.transferAccept : t.transferDecline}
                      description={v.reason}
                      onConfirm={async () =>
                        !!(await command.run(`${api}/manager-transfers/${v.id}/decision`, {
                          expectedVersion: v.version,
                          decision,
                        }))
                      }
                    />
                  ))}
              </article>
            ))}
            <Pager page={page} total={q.data.totalCount} onChange={setPage} />
          </>
        )}
      </QueryResult>
      {command.feedback}
    </section>
  );
}
function ClassHistory({ id }: { id: string }) {
  const [page, setPage] = useState(1),
    q = usePersonalApi<S['PersonalClassPageOfPersonalClassHistoryItem']>(
      `${api}/${id}/history?page=${page}&pageSize=30`,
    );
  return (
    <QueryResult q={q}>
      {q.data && (
        <>
          {q.data.items.map((v) => (
            <article className={uiClass('card')} key={v.id}>
              <p>{stateLabel(v.action)}</p>
              <p>{date(v.occurredAtUtc, true)}</p>
            </article>
          ))}
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
    </QueryResult>
  );
}

function useMemberName(userId: string) {
  return useMemberIdentity(userId) || uiText.v5Product.classMember;
}
function useMemberIdentity(userId: string) {
  const { session } = usePersonal();
  const q = usePersonalApi<S['MessagingPublicProfileResult']>('/api/v1/people/' + userId, {
    enabled: !!userId && session.user.id !== userId,
  });
  return session.user.id === userId
    ? session.user.displayName || session.user.firstName
    : q.data?.userId === userId
      ? q.data.displayName
      : undefined;
}
function MemberName({ userId }: { userId: string }) {
  return <span>{useMemberName(userId)}</span>;
}
