'use client';
import * as uiText from '@/content/fa';
import { v4Text as t } from '@/content/fa';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BarChart3, ListChecks, Clock, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorState, EmptyState, LoadingSkeleton, label } from '@/components/ui/states';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { V4Page, V4Field, V4List, V4Row } from '@/components/v4/page';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { useTextDraft } from '@/components/hooks/use-text-draft';
import { contextSignature } from '@/lib/client-surface';
import {
  pollCommand,
  checklistCommand,
  scheduleCommand,
  selectedPollOptions,
} from './rich-message-model';
import { canWriteConversation, conversationTitle } from './model';
import { isManagedConversation } from './summary';
import s from './rich-messages.module.css';
type S = components['schemas'];
export type RichSection = 'poll-new' | 'quiz-new' | 'checklist-new' | 'scheduled';
const root = (id: string) => '/api/v1/conversations/' + id;
const route = (id: string) => '/personal/messages/' + id;

function useRichCommand() {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  async function run<T>(
    path: string,
    payload: unknown,
    method = 'POST',
    throwOnError = false,
  ): Promise<{ value: T } | undefined> {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const value = await call<T>(path, { method, body: JSON.stringify(payload) });
      await cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
      return { value };
    } catch (e) {
      setError(e);
      if (e instanceof ApiError && [403, 409, 412].includes(e.status))
        await cache.invalidateQueries({
          queryKey: ['personal', session.user.id, session.revision],
        });
      if (throwOnError) throw e;
      return undefined;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, feedback: error ? <ErrorState error={error} /> : null };
}

/** The create tools use the same server-derived publication gate as the composer. */
export function ConversationRichTools({
  id,
  summary,
  section,
}: {
  id: string;
  summary: S['ConversationSummaryResult'];
  section: RichSection;
}) {
  const { session } = usePersonal();
  const managed = isManagedConversation(summary.type);
  const data = usePersonalApi<S['ManagedConversationResult']>(root(id), { enabled: managed });
  if (managed && data.isPending) return <LoadingSkeleton />;
  if (managed && data.isError)
    return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  const writable =
    managed && data.data ? canWriteConversation(data.data, session.user.id) : !managed;
  if (!writable) return <ErrorState error={new ApiError(403)} />;
  return section === 'scheduled' ? (
    <ScheduledMessages id={id} title={conversationTitle(summary)} />
  ) : section === 'checklist-new' ? (
    <ChecklistForm id={id} title={conversationTitle(summary)} />
  ) : (
    <PollForm id={id} title={conversationTitle(summary)} quiz={section === 'quiz-new'} />
  );
}

function useCreationDraft<T extends object>(scope: string, initial: T) {
  const { session } = usePersonal();
  const seed = useRef({ ...initial, $clientMessageId: crypto.randomUUID() });
  const draft = useTextDraft(
    `${session.user.id}:${contextSignature(session.context)}:v4:${scope}`,
    JSON.stringify(seed.current),
    'v4-1',
  );
  let value = initial;
  let identity: string = seed.current.$clientMessageId;
  function sameShape(expected: unknown, actual: unknown): boolean {
    if (Array.isArray(expected))
      return (
        Array.isArray(actual) &&
        actual.length <= 30 &&
        actual.every((item) => sameShape(expected[0], item))
      );
    if (expected && typeof expected === 'object')
      return (
        !!actual &&
        typeof actual === 'object' &&
        Object.entries(expected).every(([k, v]) =>
          sameShape(v, (actual as Record<string, unknown>)[k]),
        )
      );
    return typeof expected === typeof actual;
  }
  try {
    const parsed = JSON.parse(draft.text);
    if (sameShape(seed.current, parsed) && /^[0-9a-f-]{36}$/i.test(parsed.$clientMessageId)) {
      value = parsed;
      identity = parsed.$clientMessageId;
    }
  } catch {}
  // The message identity lives with the draft, so a lost receipt does not create a second item on retry.
  return {
    value,
    set: (value: T) => draft.setText(JSON.stringify({ ...value, $clientMessageId: identity })),
    clear: () => draft.reset(),
    identity,
  };
}

function PollForm({ id, title, quiz }: { id: string; title: string; quiz: boolean }) {
  const router = useRouter(),
    command = useRichCommand();
  const draft = useCreationDraft(`poll:${id}:${quiz}`, {
    question: '',
    options: ['', ''],
    multiple: false,
    anonymous: true,
    quiz,
    correct: 1,
    explanation: '',
  });
  const [invalid, setInvalid] = useState(false);
  const v = draft.value;
  function update<K extends keyof typeof v>(key: K, value: (typeof v)[K]) {
    draft.set({ ...v, [key]: value });
    setInvalid(false);
  }
  return (
    <V4Page
      id={quiz ? 'MK-245' : 'MK-242'}
      title={quiz ? t.quiz : t.newPoll}
      subtitle={title}
      back={route(id)}
      actions={
        <Button type="submit" form="v4-poll" disabled={command.busy}>
          {command.busy ? t.waiting : t.publishPoll}
        </Button>
      }
    >
      <form
        id="v4-poll"
        onSubmit={async (e) => {
          e.preventDefault();
          const body = pollCommand(v, draft.identity);
          if (!body) {
            setInvalid(true);
            return;
          }
          const receipt = await command.run<S['MessageReceiptResult']>(root(id) + '/polls', body);
          if (receipt?.value?.messageId) {
            draft.clear();
            router.push(route(id));
          }
        }}
      >
        <V4Field label={t.question}>
          <input
            required
            maxLength={1000}
            value={v.question}
            onChange={(e) => update('question', e.target.value)}
          />
        </V4Field>
        {v.options.map((option, i) => (
          <div className={s.option} key={i}>
            <V4Field label={t.option + ' ' + number(i + 1)}>
              <input
                required
                maxLength={300}
                value={option}
                onChange={(e) =>
                  update(
                    'options',
                    v.options.map((o, n) => (n === i ? e.target.value : o)),
                  )
                }
              />
            </V4Field>
            {v.options.length > 2 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t.remove + ' ' + t.option + ' ' + number(i + 1)}
                onClick={() =>
                  draft.set({ ...v, options: v.options.filter((_, n) => n !== i), correct: 1 })
                }
              >
                <X size={18} />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          disabled={v.options.length >= 10}
          onClick={() => update('options', [...v.options, ''])}
        >
          <Plus size={18} />
          {t.addOption}
        </Button>
        <V4List>
          {!quiz && (
            <label className="v4-check">
              <span>{t.multiple}</span>
              <input
                type="checkbox"
                checked={v.multiple}
                onChange={(e) => update('multiple', e.target.checked)}
              />
            </label>
          )}
          <label className="v4-check">
            <span>{t.anonymous}</span>
            <input
              type="checkbox"
              checked={v.anonymous}
              onChange={(e) => update('anonymous', e.target.checked)}
            />
          </label>
        </V4List>
        {quiz && (
          <>
            <V4Field label={t.correctOption}>
              <select value={v.correct} onChange={(e) => update('correct', Number(e.target.value))}>
                {v.options.map((_, i) => (
                  <option key={i} value={i + 1}>
                    {t.option + ' ' + number(i + 1)}
                  </option>
                ))}
              </select>
            </V4Field>
            <V4Field label={t.explanation}>
              <textarea
                value={v.explanation}
                onChange={(e) => update('explanation', e.target.value)}
              />
            </V4Field>
          </>
        )}
        {invalid && (
          <p className="v4-form-error" role="alert">
            {t.validation}
          </p>
        )}
        {command.feedback}
      </form>
    </V4Page>
  );
}
function ChecklistForm({ id, title }: { id: string; title: string }) {
  const router = useRouter(),
    command = useRichCommand();
  const draft = useCreationDraft(`checklist:${id}`, {
    title: '',
    mode: 'Collaborative' as S['ConversationChecklistMode'],
    items: [
      { itemId: '', text: '' },
      { itemId: '', text: '' },
    ],
  });
  const [invalid, setInvalid] = useState(false),
    v = draft.value;
  function update(value: typeof v) {
    draft.set(value);
    setInvalid(false);
  }
  return (
    <V4Page
      id="MK-248"
      title={t.newChecklist}
      subtitle={title}
      back={route(id)}
      actions={
        <Button form="v4-checklist" type="submit" disabled={command.busy}>
          {command.busy ? t.waiting : t.publishChecklist}
        </Button>
      }
    >
      <form
        id="v4-checklist"
        onSubmit={async (e) => {
          e.preventDefault();
          const items = v.items.map((x, i) => ({
            ...x,
            itemId: x.itemId || crypto.randomUUID(),
            index: i,
          }));
          update({ ...v, items });
          const body = checklistCommand(v.title, items, v.mode, draft.identity);
          if (!body) {
            setInvalid(true);
            return;
          }
          const receipt = await command.run<S['MessageReceiptResult']>(
            root(id) + '/checklists',
            body,
          );
          if (receipt?.value?.messageId) {
            draft.clear();
            router.push(route(id));
          }
        }}
      >
        <V4Field label={t.title}>
          <input
            required
            maxLength={300}
            value={v.title}
            onChange={(e) => update({ ...v, title: e.target.value })}
          />
        </V4Field>
        {v.items.map((item, i) => (
          <div className={s.option} key={i}>
            <V4Field label={t.item + ' ' + number(i + 1)}>
              <input
                required
                maxLength={1000}
                value={item.text}
                onChange={(e) =>
                  update({
                    ...v,
                    items: v.items.map((x, n) => (n === i ? { ...x, text: e.target.value } : x)),
                  })
                }
              />
            </V4Field>
            {v.items.length > 1 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t.remove + ' ' + t.item + ' ' + number(i + 1)}
                onClick={() => update({ ...v, items: v.items.filter((_, n) => i !== n) })}
              >
                <X size={18} />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          disabled={v.items.length >= 30}
          onClick={() =>
            update({ ...v, items: [...v.items, { itemId: crypto.randomUUID(), text: '' }] })
          }
        >
          <Plus size={18} />
          {t.addItem}
        </Button>
        <V4Field label={t.mode}>
          <select
            value={v.mode}
            onChange={(e) =>
              update({ ...v, mode: e.target.value as S['ConversationChecklistMode'] })
            }
          >
            <option value="Collaborative">{t.collaborative}</option>
            <option value="Personal">{t.personal}</option>
          </select>
        </V4Field>
        {invalid && (
          <p className="v4-form-error" role="alert">
            {t.validation}
          </p>
        )}
        {command.feedback}
      </form>
    </V4Page>
  );
}

function ScheduledMessages({ id, title }: { id: string; title: string }) {
  const [page, setPage] = useState(1),
    [creating, setCreating] = useState(false),
    [invalid, setInvalid] = useState(false);
  const data = usePersonalApi<S['ScheduledMessagePageResult']>(
    root(id) + `/scheduled-messages?page=${page}&pageSize=30`,
  );
  const command = useRichCommand(),
    draft = useCreationDraft(`schedule:${id}`, { text: '', at: '' });
  const v = draft.value;
  return (
    <V4Page
      id={creating ? 'MK-251' : 'MK-252'}
      title={creating ? t.schedule : t.scheduled}
      subtitle={title}
      back={route(id)}
      actions={
        creating ? (
          <Button form="v4-schedule" type="submit" disabled={command.busy}>
            {command.busy ? t.waiting : t.scheduleSubmit}
          </Button>
        ) : (
          <Button onClick={() => setCreating(true)}>
            <Plus size={18} />
            {t.schedule}
          </Button>
        )
      }
    >
      {creating ? (
        <form
          id="v4-schedule"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = scheduleCommand(v.text, v.at, draft.identity);
            if (!body) {
              setInvalid(true);
              return;
            }
            const value = await command.run<S['ScheduledMessageResult']>(
              root(id) + '/scheduled-messages',
              body,
            );
            if (value?.value?.id) {
              draft.clear();
              setCreating(false);
            }
          }}
        >
          <V4Field label={t.text}>
            <textarea
              required
              value={v.text}
              onChange={(e) => draft.set({ ...v, text: e.target.value })}
            />
          </V4Field>
          <V4Field label={t.scheduleAt} hint={t.localTime}>
            <JalaliDateInput
              withTime
              value={v.at}
              onValueChange={(at) => draft.set({ ...v, at })}
              required
            />
          </V4Field>
          {invalid && (
            <p className="v4-form-error" role="alert">
              {t.invalidTime}
            </p>
          )}
          <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
            {t.cancel}
          </Button>
        </form>
      ) : data.isPending ? (
        <LoadingSkeleton />
      ) : data.isError ? (
        <ErrorState error={data.error} onRetry={() => void data.refetch()} />
      ) : data.data.items.length ? (
        <>
          <V4List>
            {data.data.items.map((item) => (
              <V4Row
                key={item.id}
                title={item.content.text || t.schedule}
                icon={<Clock />}
                description={
                  <>
                    {date(item.scheduledAtUtc, true)}
                    {uiText.text_588da4105320}
                    {label(item.status)}
                  </>
                }
                end={
                  item.status === 'Scheduled' ? (
                    <ConfirmAction
                      title={t.cancelSchedule}
                      description={t.cancelScheduleHint}
                      trigger={t.cancel}
                      confirm={t.cancel}
                      onConfirm={async () =>
                        !!(await command.run(
                          root(id) + `/scheduled-messages/${item.id}/cancel`,
                          {
                            expectedVersion: item.version,
                          },
                          'POST',
                          true,
                        ))
                      }
                    />
                  ) : undefined
                }
              />
            ))}
          </V4List>
          <div className="v4-inline-actions">
            <Button
              type="button"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t.back}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!data.data.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.loadMore}
            </Button>
          </div>
        </>
      ) : (
        <EmptyState title={t.scheduledEmpty} />
      )}
      {command.feedback}
    </V4Page>
  );
}

export function RichMessage({
  message,
  canManage = false,
}: {
  message: S['ConversationMessageResult'];
  canManage?: boolean;
}) {
  return message.kind === 'Poll' ? (
    <PollCard message={message} canManage={canManage} />
  ) : message.kind === 'Checklist' ? (
    <ChecklistCard message={message} canManage={canManage} />
  ) : null;
}
function PollCard({
  message,
  canManage,
}: {
  message: S['ConversationMessageResult'];
  canManage: boolean;
}) {
  const path = root(message.conversationId) + `/messages/${message.messageId}/poll`;
  const data = usePersonalApi<S['ConversationPollResult']>(path, { poll: 15000 }),
    command = useRichCommand();
  const [selected, setSelected] = useState<number[]>([]),
    [voters, setVoters] = useState(false);
  useEffect(() => {
    if (data.data) setSelected(data.data.options.filter((o) => o.isSelected).map((o) => o.number));
  }, [data.data]);
  if (data.isPending) return <LoadingSkeleton />;
  if (data.isError) return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  const poll = data.data;
  return (
    <section
      className={s.poll}
      data-v4-view={poll.isQuiz ? 'MK-246' : 'MK-243'}
      aria-label={poll.question}
    >
      <strong>
        <BarChart3 size={18} />
        {poll.question}
      </strong>
      <small>
        {poll.isAnonymous ? t.anonymous : t.poll}
        {uiText.text_588da4105320}
        {number(poll.totalVoters)} {t.totalVoters}
      </small>
      {poll.options.map((option) => (
        <label className={s.pollOption} key={option.number}>
          <input
            type={poll.allowsMultipleAnswers ? 'checkbox' : 'radio'}
            name={'poll-' + poll.messageId}
            checked={selected.includes(option.number)}
            disabled={poll.status !== 'Open' || command.busy}
            onChange={() =>
              setSelected((current) => selectedPollOptions(poll, current, option.number))
            }
          />
          <span>
            {option.text}
            <span
              className={s.progress}
              style={
                {
                  '--poll-progress':
                    Math.max(
                      0,
                      Math.min(
                        100,
                        poll.totalVoters ? (option.voteCount / poll.totalVoters) * 100 : 0,
                      ),
                    ) + '%',
                } as CSSProperties
              }
            />
          </span>
          <b>{number(option.voteCount)}</b>
        </label>
      ))}
      {poll.status === 'Open' && (
        <Button
          disabled={command.busy || !selected.length}
          onClick={() =>
            void command.run(path + '/vote', {
              optionNumbers: selected,
              expectedVoteVersion: poll.ownVoteVersion,
            })
          }
        >
          {t.vote}
        </Button>
      )}
      {poll.isQuiz && poll.explanation && <p>{poll.explanation}</p>}
      {!poll.isAnonymous && (
        <Button type="button" variant="ghost" onClick={() => setVoters((v) => !v)}>
          {t.voters}
        </Button>
      )}
      {voters && !poll.isAnonymous && <PollVoters path={path} />}
      {canManage && poll.status === 'Open' && (
        <ConfirmAction
          title={t.closePoll}
          description={t.closePollHint}
          trigger={t.closePoll}
          onConfirm={async () =>
            !!(await command.run(path + '/close', { expectedVersion: poll.version }, 'POST', true))
          }
        />
      )}
      {poll.status === 'Closed' && <small>{label(poll.status)}</small>}
      {command.feedback}
    </section>
  );
}
function PollVoters({ path }: { path: string }) {
  const [page, setPage] = useState(1);
  const data = usePersonalApi<S['ConversationPollVoterPageResult']>(
    path + `/voters?page=${page}&pageSize=30`,
  );
  return data.isPending ? (
    <LoadingSkeleton />
  ) : data.isError ? (
    <ErrorState error={data.error} onRetry={() => void data.refetch()} />
  ) : (
    <>
      <ul>
        {data.data.items.map((item) => (
          <li key={item.user.userId}>
            {item.user.displayName}
            {uiText.text_588da4105320}
            {item.optionNumbers.map(number).join(uiText.text_11735aabd336)}
          </li>
        ))}
      </ul>
      <div className="v4-inline-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t.back}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={!data.data.hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          {t.loadMore}
        </Button>
      </div>
    </>
  );
}
function ChecklistCard({
  message,
  canManage,
}: {
  message: S['ConversationMessageResult'];
  canManage: boolean;
}) {
  const path = root(message.conversationId) + `/messages/${message.messageId}/checklist`;
  const data = usePersonalApi<S['ConversationChecklistResult']>(path, { poll: 15000 }),
    command = useRichCommand();
  const [editing, setEditing] = useState(false),
    [title, setTitle] = useState(''),
    [items, setItems] = useState<S['ChecklistItemInput'][]>([]);
  if (data.isPending) return <LoadingSkeleton />;
  if (data.isError) return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  const list = data.data;
  return (
    <section className={s.poll} data-v4-view="MK-249" aria-label={list.title}>
      <strong>
        <ListChecks size={18} />
        {list.title}
      </strong>
      <small>{list.mode === 'Personal' ? t.personal : t.collaborative}</small>
      {editing ? (
        <form
          className={s.editChecklist}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim() || items.some((x) => !x.text.trim())) return;
            const result = await command.run(
              path,
              {
                title: title.trim(),
                items: items.map((x) => ({ ...x, text: x.text.trim() })),
                mode: list.mode,
                expectedVersion: list.version,
              },
              'PUT',
            );
            if (result) setEditing(false);
          }}
        >
          <V4Field label={t.title}>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </V4Field>
          {items.map((item, i) => (
            <V4Field label={t.item + ' ' + number(i + 1)} key={item.itemId}>
              <input
                required
                value={item.text}
                onChange={(e) =>
                  setItems(items.map((x, n) => (i === n ? { ...x, text: e.target.value } : x)))
                }
              />
            </V4Field>
          ))}
          <Button disabled={command.busy} type="submit">
            {t.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            {t.cancel}
          </Button>
        </form>
      ) : (
        list.items.map((item) => (
          <label className={s.pollOption} key={item.itemId}>
            <input
              type="checkbox"
              checked={item.isChecked}
              disabled={command.busy}
              onChange={(e) =>
                void command.run(
                  path + '/items/' + item.itemId,
                  {
                    isChecked: e.target.checked,
                    expectedDefinitionVersion: list.version,
                    expectedStateVersion: item.stateVersion,
                  },
                  'PUT',
                )
              }
            />
            <span>{item.text}</span>
          </label>
        ))
      )}
      {list.isCompleted && <small>{t.completed}</small>}
      {canManage && !editing && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setTitle(list.title);
            setItems(list.items.map((x) => ({ itemId: x.itemId, text: x.text })));
            setEditing(true);
          }}
        >
          {t.editChecklist}
        </Button>
      )}
      {command.feedback}
    </section>
  );
}

export function RichToolLinks({ id }: { id: string }) {
  return (
    <div className={s.toolLinks} aria-label={t.conversationTools}>
      <Link href={route(id) + '/poll-new'}>
        <BarChart3 size={18} />
        {t.newPoll}
      </Link>
      <Link href={route(id) + '/quiz-new'}>
        <BarChart3 size={18} />
        {t.quiz}
      </Link>
      <Link href={route(id) + '/checklist-new'}>
        <ListChecks size={18} />
        {t.newChecklist}
      </Link>
      <Link href={route(id) + '/scheduled'}>
        <Clock size={18} />
        {t.scheduled}
      </Link>
    </div>
  );
}
