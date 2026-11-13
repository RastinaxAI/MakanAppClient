'use client';
import {
  Select as NativeSelect,
  Input as NativeInput,
  Textarea as NativeTextarea,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Users, Megaphone, ArrowLeft, UserPlus, Search } from 'lucide-react';
import { readCreationDraft, creationWasRejected } from './creation-draft';
import { startPersonalConversation } from './directory';
import { ProfileAvatar } from '../profile-photo';
import { V5Scene } from '@/components/v5/scene';
import { V4Field, V4List, V4Row } from '@/components/v4/page';
import d from './directory.module.css';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { clientValidator } from '@/lib/api/client-contract';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import { number } from '@/lib/formatting';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useViewState } from '@/components/hooks/use-view-state';
import { SearchField } from '@/components/ui/input';
import { messagingReturnPath } from './inbox-model';
const ContactPhoneForm = dynamic(() =>
  import('./contact-form').then((module) => module.ContactPhoneForm),
);
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import s from '../personal.module.css';
import { usePersonal, usePersonalApi } from '../provider';
import { messagingNextLabels } from '../status-labels';
type Command = components['schemas']['CreateManagedConversationCommand'];
export function CreateConversationPage() {
  const requested = useSearchParams().get('kind');
  const kind = requested === 'channels' ? 'channels' : 'groups';
  if (requested !== 'groups' && requested !== 'channels') return <NewMessage />;
  return <CreateConversation key={kind} kind={kind} />;
}
function CreateConversation({ kind }: { kind: 'groups' | 'channels' }) {
  const search = useSearchParams();
  const members = search.get('step') === 'members';
  const { session, call } = usePersonal(),
    router = useRouter(),
    cache = useQueryClient();
  const [title, setTitle] = useState(''),
    [description, setDescription] = useState(''),
    [visibility, setVisibility] = useState<'' | 'Private' | 'Public'>('Private'),
    [history, setHistory] = useState<'' | 'FullHistory' | 'FromJoin'>(''),
    [selected, setSelected] = useState<Set<string>>(() => new Set()),
    [page, setPage] = useState(1),
    [contactQuery, setContactQuery] = useState(''),
    [queryDraft, setQueryDraft] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [frozen, setFrozen] = useState<Command | null>(null),
    [storageReady, setStorageReady] = useState(false);
  const mutex = useRef(false);
  const key = 'makan-create:' + session.user.id + ':Personal:' + kind;
  const legacyKey = useRef(
    'makan-create:' + session.user.id + ':' + contextSignature(session.context) + ':' + kind,
  );
  const draftKey = key + ':draft:v1';
  const returnPath = messagingReturnPath(search.get('from'));
  const from = new URLSearchParams({ from: returnPath });
  const pickerUrl = '/personal/messages/new?kind=direct&' + from;
  const stepUrl = '/personal/messages/new?' + new URLSearchParams({ kind, from: returnPath });
  const status = usePersonalApi<components['schemas']['MessagingStatusResult']>(
    '/api/v1/me/messaging-status',
  );
  const contacts = usePersonalApi<components['schemas']['UserContactPageResult']>(
    '/api/v1/contacts?page=' +
      page +
      '&pageSize=20&favoritesOnly=false&q=' +
      encodeURIComponent(contactQuery),
    { enabled: storageReady && members },
  );
  const group = kind === 'groups';
  const generalGroup = status.data?.allowedActions.includes('CreatePersonalGroup') ?? false;
  const privateOnly =
    group && !generalGroup && !!status.data?.allowedActions.includes('CreatePrivatePersonalGroup');
  const allowed = group
    ? generalGroup || privateOnly
    : !!status.data?.allowedActions.includes('CreatePersonalChannel');
  const chosenVisibility = privateOnly ? 'Private' : visibility;
  useEffect(() => {
    try {
      const draft = readCreationDraft(
        sessionStorage.getItem(draftKey) ?? sessionStorage.getItem(legacyKey.current + ':draft:v1'),
      );
      if (draft) {
        setTitle(draft.title);
        setDescription(draft.description);
        setVisibility(draft.visibility);
        setHistory(draft.history);
        setSelected(new Set(draft.selected));
      }
      const raw = sessionStorage.getItem(key) ?? sessionStorage.getItem(legacyKey.current);
      if (raw) {
        const parsed = clientValidator({
          $ref: '#/components/schemas/CreateManagedConversationCommand',
        }).safeParse(JSON.parse(raw));
        if (!parsed.success) throw new Error(uiText.text_07379c3f080e);
        const value = parsed.data as Command;
        if (value.scope !== 'Personal') throw new Error(uiText.text_f00bc0f210dc);
        setFrozen(value);
        router.replace(stepUrl + '&step=members');
        setTitle(value.title);
        setDescription(value.description ?? '');
        setVisibility(value.visibility ?? '');
        setHistory(value.groupHistoryPolicy ?? '');
        setSelected(new Set(value.initialParticipantUserIds ?? []));
      }
      setStorageReady(true);
    } catch (error) {
      setError(error);
    }
  }, [key, draftKey, router, stepUrl]);
  useEffect(() => {
    if (!storageReady) return;
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ title, description, visibility, history, selected: [...selected] }),
      );
    } catch {
      setStorageReady(false);
      setError(new Error(uiText.text_f43b73d65e75));
    }
  }, [storageReady, draftKey, title, description, visibility, history, selected]);
  useEffect(() => {
    if (storageReady && members && !title.trim() && !frozen) router.replace(stepUrl);
  }, [storageReady, members, title, frozen, router, stepUrl]);
  async function submit() {
    if (mutex.current || !storageReady || !allowed) return;
    mutex.current = true;
    setBusy(true);
    setError(undefined);
    let command = frozen;
    try {
      if (!command) {
        if (!title.trim() || !chosenVisibility) return;
        command = {
          clientOperationId: crypto.randomUUID(),
          scope: 'Personal',
          title: title.trim(),
          description: description.trim() || null,
          initialParticipantUserIds: selected.size ? [...selected] : null,
          visibility: chosenVisibility,
          ...(group && history ? { groupHistoryPolicy: history } : {}),
        };
        sessionStorage.setItem(key, JSON.stringify(command));
        setFrozen(command);
      }
      const result = await call<components['schemas']['ManagedConversationResult']>(
        '/api/v1/conversations/' + kind,
        { method: 'POST', body: JSON.stringify(command), scope: 'account' },
      );
      if (result.scope !== 'Personal' || result.type !== (group ? 'Group' : 'Channel'))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      cache.setQueryData(
        ['personal', session.user.id, 'account', 'creation-receipt', result.conversationId],
        result.initialTargets ?? [],
      );
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(draftKey);
      sessionStorage.removeItem(legacyKey.current);
      sessionStorage.removeItem(legacyKey.current + ':draft:v1');
      setStorageReady(false);
      setFrozen(null);
      await cache.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) => typeof key === 'string' && key.startsWith('/api/v1/conversations'),
          ),
      });
      router.replace('/personal/messages/' + result.conversationId);
    } catch (error) {
      setError(error);
      if (error instanceof ApiError && creationWasRejected(error.status, error.problem.code)) {
        sessionStorage.removeItem(key);
        setFrozen(null);
      }
    } finally {
      mutex.current = false;
      setBusy(false);
    }
  }
  return (
    <V5Scene
      key={members ? 'members' : 'information'}
      id={members ? (group ? 'MK-189' : 'MK-192') : group ? 'MK-188' : 'MK-191'}
      title={
        members
          ? group
            ? uiText.messengerPdf.newGroup
            : uiText.text_b462d2f2ea47
          : group
            ? uiText.v5Product.createGroup
            : uiText.v5Product.createChannel
      }
      back={members ? stepUrl : pickerUrl}
      kind={members ? 'list' : 'form'}
      onSubmit={(event) => {
        event.preventDefault();
        if (!allowed || !storageReady) return;
        if (members) void submit();
        else if (title.trim() && chosenVisibility) router.push(stepUrl + '&step=members');
      }}
      menu={
        group ? (
          <>
            {members && (
              <>
                <p>
                  {title} · {number(selected.size)} {uiText.text_4339e868ff4c}
                </p>
                <p>{uiText.text_903259a26e2b}</p>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || !!frozen}
                  onClick={() => router.push(stepUrl)}
                >
                  {uiText.text_d6aa12d559e9}
                </Button>
              </>
            )}
            <V4Field label={uiText.text_d30d3aa840fa}>
              <NativeSelect
                value={history}
                disabled={busy || !!frozen}
                onChange={(e) => setHistory(e.target.value as typeof history)}
              >
                <option value="">{uiText.text_99f51b9ca3db}</option>
                <option value="FullHistory">{uiText.text_079e2f4cd4d2}</option>
                <option value="FromJoin">{uiText.text_c693180e811e}</option>
              </NativeSelect>
            </V4Field>
          </>
        ) : undefined
      }
      actions={
        status.isSuccess && allowed ? (
          <Button
            type="submit"
            disabled={busy || !storageReady || !title.trim() || !chosenVisibility}
            aria-busy={busy}
          >
            {busy ? (
              uiText.text_25384e522776
            ) : !members ? (
              <>
                {uiText.v5Product.selectPeople}
                <ArrowLeft size={18} />
              </>
            ) : frozen ? (
              uiText.text_6f96c570c24b
            ) : group ? (
              uiText.text_9c8e4fa37d9f
            ) : (
              uiText.text_67f771b12e76
            )}
          </Button>
        ) : undefined
      }
    >
      {status.isPending ? (
        <LoadingSkeleton />
      ) : status.isError ? (
        <ErrorState error={status.error} onRetry={() => void status.refetch()} />
      ) : !allowed ? (
        <section className={uiClass(s.profileCard)}>
          <EmptyState
            title={uiText.text_3bd2ff842bd4}
            description={messagingNextLabels[status.data.nextAction]}
          />
          <Button asChild variant="outline">
            <Link href="/personal/profile">{uiText.text_e0318aee0f47}</Link>
          </Button>
        </section>
      ) : (
        <>
          {!members && (
            <fieldset className={uiClass(d.creationFields)}>
              <V4Field label={group ? uiText.text_0e1567f71aa6 : uiText.text_e282736ca3cc}>
                <NativeInput
                  required
                  value={title}
                  disabled={busy || !!frozen}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </V4Field>
              <V4Field
                label={
                  group ? uiText.v5Product.groupDescription : uiText.v5Product.creationDescription
                }
              >
                <NativeTextarea
                  rows={3}
                  value={description}
                  disabled={busy || !!frozen}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </V4Field>
              <V4Field label={uiText.v5Product.creationContext}>
                <NativeInput readOnly value={uiText.v5Product.personalContext} />
              </V4Field>
              <V4Field label={uiText.v5Product.visibility}>
                <NativeSelect
                  required
                  value={chosenVisibility}
                  disabled={busy || !!frozen || privateOnly}
                  onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                >
                  <option value="" disabled>
                    {uiText.text_398ac1b17cdd}
                  </option>
                  <option value="Private">{uiText.text_e205d3a7a33e}</option>
                  <option value="Public">{uiText.text_526e310df41f}</option>
                </NativeSelect>
              </V4Field>
              {privateOnly && <p className={uiClass(s.muted)}>{uiText.text_20acc600bc80}</p>}
            </fieldset>
          )}
          {members && (
            <section
              className={uiClass(d.memberSelection)}
              data-group-recipient-picker={group || undefined}
            >
              {!group && (
                <div className={uiClass(d.creationSummary)}>
                  <span className={uiClass(d.smallAvatar)}>
                    {group ? <Users size={24} /> : <Megaphone size={24} />}
                  </span>
                  <div>
                    <strong dir="auto">{title}</strong>
                    <small>
                      {chosenVisibility === 'Private'
                        ? uiText.text_e205d3a7a33e
                        : uiText.text_526e310df41f}
                      {uiText.text_588da4105320}
                      {number(selected.size)} {uiText.text_4339e868ff4c}
                    </small>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy || !!frozen}
                    onClick={() => router.push(stepUrl)}
                  >
                    {uiText.text_d6aa12d559e9}
                  </Button>
                </div>
              )}
              <div className={uiClass(d.contactSearch)}>
                <Search size={18} />
                <NativeInput
                  aria-label={uiText.text_78c43fe4c4d4}
                  placeholder={uiText.text_671a1dcda1c2}
                  value={queryDraft}
                  onChange={(ev) => setQueryDraft(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter') {
                      ev.preventDefault();
                      setContactQuery(queryDraft.trim());
                      setPage(1);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setContactQuery(queryDraft.trim());
                    setPage(1);
                  }}
                >
                  {uiText.text_2a93eb7f06ce}
                </Button>
              </div>
              {!group && (
                <p className={uiClass(s.muted)}>
                  {number(selected.size)}
                  {uiText.text_903259a26e2b}
                </p>
              )}
              {contacts.isPending ? (
                <LoadingSkeleton />
              ) : contacts.isError ? (
                <ErrorState error={contacts.error} onRetry={() => void contacts.refetch()} />
              ) : !contacts.data.items.length ? (
                <EmptyState
                  title={uiText.text_185fb1725ae8}
                  description={uiText.text_93792447ba47}
                />
              ) : (
                <div className={uiClass(s.spaceList)}>
                  {contacts.data.items
                    .filter((item) => item.contactUserId !== session.user.id)
                    .map((contact) => (
                      <label className={d.memberChoice} key={contact.contactUserId}>
                        <NativeInput
                          type="checkbox"
                          disabled={busy || !!frozen}
                          checked={selected.has(contact.contactUserId)}
                          onChange={(event) =>
                            setSelected((previous) => {
                              const next = new Set(previous);
                              if (event.target.checked) next.add(contact.contactUserId);
                              else next.delete(contact.contactUserId);
                              return next;
                            })
                          }
                        />
                        <ProfileAvatar
                          name={contact.savedName || contact.profile.displayName}
                          photo={contact.profile.profilePhoto}
                          className={d.recipientAvatar}
                        />
                        <span>
                          {contact.savedName || contact.profile.displayName}
                          <small>
                            <bdi dir="ltr">
                              {uiText.text_c3641f8544d7}
                              {contact.profile.username}
                            </bdi>
                          </small>
                        </span>
                      </label>
                    ))}
                </div>
              )}
              {(page > 1 || contacts.data?.hasMore) && (
                <div className={uiClass(s.actions)}>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={page <= 1 || contacts.isFetching}
                    onClick={() => setPage(page - 1)}
                  >
                    {uiText.text_88e65319d694}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!contacts.data?.hasMore || contacts.isFetching}
                    onClick={() => setPage(page + 1)}
                  >
                    {uiText.text_12ca1a58c6ca}
                  </Button>
                </div>
              )}
            </section>
          )}
          {!!error &&
            (error instanceof ApiError ? (
              <ErrorState error={error} />
            ) : (
              <p className={uiClass('field-error')} role="alert">
                {error instanceof Error ? error.message : uiText.text_ee786ae11865}
              </p>
            ))}
          {frozen && <p className={uiClass(s.muted)}>{uiText.text_ca7549e86e0e}</p>}
        </>
      )}
    </V5Scene>
  );
}

/** Only saved account contacts are searched here; public usernames stay in MSG-02. */
function NewMessage() {
  const { session, call } = usePersonal();
  const router = useRouter(),
    search = useSearchParams();
  const cache = useQueryClient();
  const [picker, setPicker, ready] = useViewState(
    'makan:draft:new-message:' + session.user.id,
    { draft: '', query: '', page: 1 },
    (value): value is { draft: string; query: string; page: number } => {
      if (!value || typeof value !== 'object') return false;
      const item = value as Record<string, unknown>;
      return (
        typeof item.draft === 'string' &&
        item.draft.length <= 100 &&
        typeof item.query === 'string' &&
        item.query.length <= 100 &&
        typeof item.page === 'number' &&
        Number.isInteger(item.page) &&
        item.page > 0
      );
    },
  );
  const { draft, query, page } = picker;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const returnPath = messagingReturnPath(search.get('from'));
  const from = new URLSearchParams({ from: returnPath });
  const pickerUrl = '/personal/messages/new?kind=direct&' + from;
  const status = usePersonalApi<components['schemas']['MessagingStatusResult']>(
    '/api/v1/me/messaging-status',
  );
  const contacts = usePersonalApi<components['schemas']['UserContactPageResult']>(
    '/api/v1/contacts?' +
      new URLSearchParams({ page: String(page), pageSize: '30', favoritesOnly: 'false', q: query }),
    { enabled: ready },
  );
  const rows = contacts.data?.items
    .map((contact) => ({
      name: contact.savedName || contact.profile.displayName,
      profile: contact.profile,
    }))
    .filter((row) => row.profile.userId !== session.user.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  const canStart = status.data?.allowedActions.some(
    (action) => action === 'CreateDirect' || action === 'CreateDirectWithAuthorizedRelationship',
  );
  async function start(profile: components['schemas']['MessagingPublicProfileResult']) {
    if (lock.current || !canStart || !profile.canStartDirect) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const receipt = await startPersonalConversation(call, profile.userId);
      await cache.invalidateQueries({ queryKey: ['personal', session.user.id, 'account'] });
      router.push('/personal/messages/' + receipt.conversationId + '?' + from);
    } catch (cause) {
      setError(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (search.get('view') === 'add')
    return (
      <ContactPhoneForm
        onBack={() => router.replace(pickerUrl, { scroll: false })}
        onSaved={async () => {
          await cache.invalidateQueries({
            predicate: (entry) =>
              entry.queryKey[0] === 'personal' &&
              entry.queryKey[1] === session.user.id &&
              entry.queryKey[2] === 'account' &&
              String(entry.queryKey[3]).startsWith('/api/v1/contacts'),
          });
          router.replace(pickerUrl, { scroll: false });
        }}
      />
    );
  return (
    <V5Scene
      id="MSG-03"
      title={uiText.v71Ui.newMessage}
      back={returnPath}
      kind="list"
      deep
      headerTools={<></>}
    >
      <section className={d.recipientPicker} data-recipient-picker>
        <form
          className={d.recipientSearch}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setPicker((previous) => ({ ...previous, query: previous.draft.trim(), page: 1 }));
          }}
        >
          <SearchField
            aria-label={uiText.v71Ui.searchContacts}
            placeholder={uiText.v71Ui.searchContacts}
            value={draft}
            maxLength={100}
            onChange={(event) =>
              setPicker((previous) => ({ ...previous, draft: event.target.value }))
            }
            onClear={() => setPicker({ draft: '', query: '', page: 1 })}
            action={
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label={uiText.text_3fb47eb71ac7}
              >
                <Search size={20} aria-hidden="true" />
              </Button>
            }
          />
        </form>
        {!query && !draft && (
          <V4List>
            <V4Row
              title={uiText.v71Ui.newGroup}
              icon={<Users />}
              href={'/personal/messages/new?kind=groups&' + from}
            />
            <V4Row
              title={uiText.v71Ui.newChannel}
              icon={<Megaphone />}
              href={'/personal/messages/new?kind=channels&' + from}
            />
            <V4Row
              title={uiText.v71Ui.newContact}
              icon={<UserPlus />}
              href={pickerUrl + '&view=add'}
            />
          </V4List>
        )}
        <h2 className={d.letter}>{uiText.v71Ui.contacts}</h2>
        {!!error && <ErrorState error={error} />}
        {status.isError ? (
          <ErrorState error={status.error} onRetry={() => void status.refetch()} />
        ) : status.data && !canStart ? (
          <p role="status">{messagingNextLabels[status.data.nextAction]}</p>
        ) : null}
        {contacts.isPending ? (
          <LoadingSkeleton />
        ) : contacts.isError ? (
          <ErrorState error={contacts.error} onRetry={() => void contacts.refetch()} />
        ) : !rows?.length ? (
          <>
            <EmptyState title={uiText.text_c8acf4fa9c84} />
            <Button variant="outline" asChild>
              <Link href={pickerUrl + '&view=add'}>
                <UserPlus size={20} />
                {uiText.v71Ui.newContact}
              </Link>
            </Button>
          </>
        ) : (
          <div>
            {rows.map((row, index) => (
              <div key={row.profile.userId}>
                {(index === 0 ||
                  rows[index - 1].name.trim().charAt(0) !== row.name.trim().charAt(0)) && (
                  <h3 className={d.letter}>{row.name.trim().charAt(0)}</h3>
                )}
                <button
                  type="button"
                  className={d.recipient}
                  disabled={busy || !canStart || !row.profile.canStartDirect}
                  onClick={() => void start(row.profile)}
                >
                  <ProfileAvatar
                    name={row.name}
                    photo={row.profile.profilePhoto}
                    className={d.recipientAvatar}
                  />
                  <span>
                    <strong dir="auto">{row.name}</strong>
                    <small>
                      <bdi dir="ltr">@{row.profile.username}</bdi>
                    </small>
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={d.recipientPaging}>
          {page > 1 && (
            <Button
              variant="ghost"
              disabled={contacts.isFetching}
              onClick={() => setPicker((previous) => ({ ...previous, page: previous.page - 1 }))}
            >
              {uiText.text_88e65319d694}
            </Button>
          )}
          {contacts.data?.hasMore && (
            <Button
              variant="ghost"
              disabled={contacts.isFetching}
              onClick={() => setPicker((previous) => ({ ...previous, page: previous.page + 1 }))}
            >
              {uiText.text_12e9b2eceeab}
            </Button>
          )}
        </div>
      </section>
    </V5Scene>
  );
}
