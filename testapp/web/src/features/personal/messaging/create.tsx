'use client';
import {
  Select as NativeSelect,
  Input as NativeInput,
  Textarea as NativeTextarea,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Users, Megaphone, ArrowLeft, Search } from 'lucide-react';
import { readCreationDraft, creationWasRejected } from './creation-draft';
import { V5Scene } from '@/components/v5/scene';
import { V4Field } from '@/components/v4/page';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import s from '../personal.module.css';
import { usePersonal, usePersonalApi } from '../provider';
import { messagingNextLabels } from '../status-labels';
type Command = components['schemas']['CreateManagedConversationCommand'];
export function CreateConversationPage() {
  const kind = useSearchParams().get('kind') === 'channels' ? 'channels' : 'groups';
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
  const key =
    'makan-create:' + session.user.id + ':' + contextSignature(session.context) + ':' + kind;
  const draftKey = key + ':draft:v1';
  const stepUrl = '/personal/messages/new?kind=' + kind;
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
      const draft = readCreationDraft(sessionStorage.getItem(draftKey));
      if (draft) {
        setTitle(draft.title);
        setDescription(draft.description);
        setVisibility(draft.visibility);
        setHistory(draft.history);
        setSelected(new Set(draft.selected));
      }
      const raw = sessionStorage.getItem(key);
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
        { method: 'POST', body: JSON.stringify(command) },
      );
      if (result.scope !== 'Personal' || result.type !== (group ? 'Group' : 'Channel'))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      cache.setQueryData(
        ['personal', session.user.id, session.revision, 'creation-receipt', result.conversationId],
        result.initialTargets ?? [],
      );
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(draftKey);
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
      id={members ? (group ? 'MK-189' : 'MK-192') : group ? 'MK-188' : 'MK-191'}
      title={
        members
          ? uiText.text_b462d2f2ea47
          : group
            ? uiText.v5Product.createGroup
            : uiText.v5Product.createChannel
      }
      back={members ? stepUrl : '/personal/messages'}
      kind={members ? 'list' : 'form'}
      onSubmit={(event) => {
        event.preventDefault();
        if (!allowed || !storageReady) return;
        if (members) void submit();
        else if (title.trim() && chosenVisibility) router.push(stepUrl + '&step=members');
      }}
      menu={
        group ? (
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
            <section className={uiClass(d.memberSelection)}>
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
              <p className={uiClass(s.muted)}>
                {number(selected.size)}
                {uiText.text_903259a26e2b}
              </p>
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
                      <label className={uiClass(s.selectContact)} key={contact.contactUserId}>
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
