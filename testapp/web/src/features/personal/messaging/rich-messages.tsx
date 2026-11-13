'use client';
import {
  Input as NativeInput,
  Select as NativeSelect,
  Textarea as NativeTextarea,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { v4Text as t } from '@/content/fa';
import { useContext, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BarChart3, ListChecks, Clock, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorState, EmptyState, LoadingSkeleton, label } from '@/components/ui/states';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { V4Page, V4Field, V4List, V4Row, V4SwitchRow } from '@/components/v4/page';
import { SceneMenuClose } from '@/components/v5/form-actions';
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
  scheduledComposerKey,
  readScheduledComposerDraft,
} from './rich-message-model';
import { canWriteConversation, conversationTitle } from './model';
import { isManagedConversation } from './summary';
import s from './rich-messages.module.css';
type S = components['schemas'];
type RichPageContext = {
  id: string;
  title: string;
  participantRole?: S['ConversationParticipantRole'];
};
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
  if (managed && (data.data?.conversationId !== id || !Array.isArray(data.data?.participants)))
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  const writable =
    managed && data.data ? canWriteConversation(data.data, session.user.id) : !managed;
  if (!writable) return <ErrorState error={new ApiError(403)} />;
  const participantRole = data.data?.participants.find(
    (member) => member.user.userId === session.user.id && member.status === 'Active',
  )?.role;
  const context = { id, title: conversationTitle(summary), participantRole };
  return section === 'scheduled' ? (
    <ScheduledMessages {...context} />
  ) : section === 'checklist-new' ? (
    <ChecklistForm {...context} />
  ) : (
    <PollForm {...context} quiz={section === 'quiz-new'} />
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
    ready: draft.ready,
  };
}

function RichFormActions({
  addLabel,
  removeLabel,
  count,
  minimum,
  maximum,
  onAdd,
  onRemove,
}: {
  addLabel: string;
  removeLabel: (index: number) => string;
  count: number;
  minimum: number;
  maximum: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <V4List>
      <V4Row
        title={addLabel}
        icon={<Plus />}
        disabled={count >= maximum}
        onClick={() => {
          onAdd();
        }}
      />
      {count > minimum &&
        Array.from({ length: count }, (_, index) => (
          <V4Row
            key={index}
            title={removeLabel(index)}
            icon={<X />}
            onClick={() => {
              onRemove(index);
            }}
          />
        ))}
    </V4List>
  );
}

function RichMenuAction({ title, onSelect }: { title: string; onSelect: () => void }) {
  const close = useContext(SceneMenuClose);
  return (
    <V4List>
      <V4Row
        title={title}
        onClick={() => {
          close?.();
          onSelect();
        }}
      />
    </V4List>
  );
}

function PollForm({ id, title, participantRole, quiz }: RichPageContext & { quiz: boolean }) {
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
  const [invalid, setInvalid] = useState(false),
    [optionsOpen, setOptionsOpen] = useState(false);
  const v = draft.value;
  function update<K extends keyof typeof v>(key: K, value: (typeof v)[K]) {
    draft.set({ ...v, [key]: value });
    setInvalid(false);
  }
  return (
    <V4Page
      id={quiz ? 'MK-245' : 'MK-242'}
      title={quiz ? t.quiz : t.newPoll}
      subtitle={participantRole ? uiText.v5Product.conversationMemberRoles[participantRole] : title}
      contextTitle={title}
      back={route(id)}
      headerTools={<></>}
      actions={
        <Button type="submit" form="v4-poll" disabled={command.busy}>
          {command.busy ? t.waiting : quiz ? t.publishQuiz : t.publishPoll}
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
          <NativeInput
            required
            maxLength={1000}
            value={v.question}
            onChange={(e) => update('question', e.target.value)}
          />
        </V4Field>
        {quiz ? (
          <V4Field
            label={t.options}
            summaryValue={v.options.some((option) => option) ? v.options.join(' / ') : ''}
          >
            <NativeInput
              type="button"
              aria-label={t.options}
              className={uiClass(s.optionSummary)}
              aria-haspopup="dialog"
              aria-expanded={optionsOpen}
              value={
                v.options.some((option) => option) ? v.options.join(' / ') : t.configureOptions
              }
              onClick={() => setOptionsOpen(true)}
            />
          </V4Field>
        ) : (
          v.options.map((option, i) => (
            <V4Field key={i} label={t.option + ' ' + number(i + 1)}>
              <NativeInput
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
          ))
        )}
        {!quiz && (
          <V4List>
            <V4SwitchRow
              title={t.multiple}
              description={t.multipleHint}
              checked={v.multiple}
              onCheckedChange={(checked) => update('multiple', checked)}
            />
            <V4SwitchRow
              title={t.anonymous}
              description={t.anonymousHint}
              checked={v.anonymous}
              onCheckedChange={(checked) => update('anonymous', checked)}
            />
          </V4List>
        )}
        {quiz && (
          <>
            <V4Field label={t.correctOption}>
              <NativeSelect
                value={v.correct}
                onChange={(e) => update('correct', Number(e.target.value))}
              >
                {v.options.map((_, i) => (
                  <option key={i} value={i + 1}>
                    {v.options[i] || t.option + ' ' + number(i + 1)}
                  </option>
                ))}
              </NativeSelect>
            </V4Field>
            <V4Field label={t.explanation}>
              <NativeTextarea
                value={v.explanation}
                onChange={(e) => update('explanation', e.target.value)}
              />
            </V4Field>
          </>
        )}
        <div className={uiClass('stack')}>
          <RichFormActions
            addLabel={t.addOption}
            removeLabel={(index) => t.remove + ' ' + t.option + ' ' + number(index + 1)}
            count={v.options.length}
            minimum={2}
            maximum={10}
            onAdd={() => {
              update('options', [...v.options, '']);
              if (quiz) setOptionsOpen(true);
            }}
            onRemove={(index) =>
              draft.set({ ...v, options: v.options.filter((_, n) => n !== index), correct: 1 })
            }
          />
          {quiz && (
            <V4List>
              <V4SwitchRow
                title={t.anonymous}
                description={t.anonymousHint}
                checked={v.anonymous}
                onCheckedChange={(checked) => update('anonymous', checked)}
              />
            </V4List>
          )}
        </div>
        {invalid && (
          <p className={uiClass('v4-form-error')} role="alert">
            {t.validation}
          </p>
        )}
        {command.feedback}
      </form>
      {quiz && (
        <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
          <DialogContent title={t.options}>
            {v.options.map((option, index) => (
              <div className={uiClass(s.option)} key={index}>
                <V4Field label={t.option + ' ' + number(index + 1)}>
                  <NativeInput
                    maxLength={300}
                    value={option}
                    onChange={(event) =>
                      update(
                        'options',
                        v.options.map((value, n) => (n === index ? event.target.value : value)),
                      )
                    }
                  />
                </V4Field>
                {v.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t.remove + ' ' + t.option + ' ' + number(index + 1)}
                    onClick={() =>
                      draft.set({
                        ...v,
                        options: v.options.filter((_, n) => n !== index),
                        correct: 1,
                      })
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
            <div className={uiClass('confirm-actions')}>
              <Button type="button" onClick={() => setOptionsOpen(false)}>
                {t.applyOptions}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </V4Page>
  );
}
function ChecklistForm({ id, title, participantRole }: RichPageContext) {
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
      subtitle={participantRole ? uiText.v5Product.conversationMemberRoles[participantRole] : title}
      contextTitle={title}
      back={route(id)}
      headerTools={<></>}
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
          <NativeInput
            required
            maxLength={300}
            value={v.title}
            onChange={(e) => update({ ...v, title: e.target.value })}
          />
        </V4Field>
        {v.items.map((item, i) => (
          <div className={uiClass(s.option)} key={i}>
            <V4Field label={t.item + ' ' + number(i + 1)}>
              <NativeInput
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
          </div>
        ))}
        <V4Field label={t.mode}>
          <NativeSelect
            value={v.mode}
            onChange={(e) =>
              update({ ...v, mode: e.target.value as S['ConversationChecklistMode'] })
            }
          >
            <option value="Collaborative">{t.collaborative}</option>
            <option value="Personal">{t.personal}</option>
          </NativeSelect>
        </V4Field>
        <RichFormActions
          addLabel={t.addItem}
          removeLabel={(index) => t.remove + ' ' + t.item + ' ' + number(index + 1)}
          count={v.items.length}
          minimum={1}
          maximum={30}
          onAdd={() =>
            update({ ...v, items: [...v.items, { itemId: crypto.randomUUID(), text: '' }] })
          }
          onRemove={(index) => update({ ...v, items: v.items.filter((_, n) => index !== n) })}
        />
        {invalid && (
          <p className={uiClass('v4-form-error')} role="alert">
            {t.validation}
          </p>
        )}
        {command.feedback}
      </form>
    </V4Page>
  );
}

function ScheduledMessages({ id, title, participantRole }: RichPageContext) {
  const params = useSearchParams(),
    { session } = usePersonal();
  const [page, setPage] = useState(1),
    [creating, setCreating] = useState(params.get('compose') === '1'),
    [invalid, setInvalid] = useState(false);
  const data = usePersonalApi<S['ScheduledMessagePageResult']>(
    root(id) + `/scheduled-messages?page=${page}&pageSize=30`,
  );
  const command = useRichCommand(),
    draft = useCreationDraft(`schedule:${id}`, { text: '', at: '' });
  const v = draft.value;
  const handedOff = useRef(false);
  useEffect(() => {
    if (!draft.ready || handedOff.current || params.get('compose') !== '1') return;
    handedOff.current = true;
    const key = scheduledComposerKey(session.user.id, session.context.sessionId, id);
    try {
      const text = readScheduledComposerDraft(sessionStorage.getItem(key), Date.now());
      sessionStorage.removeItem(key);
      if (text && !draft.value.text.trim()) draft.set({ ...draft.value, text });
    } catch {}
  }, [draft.ready, id, params, session.user.id, session.context.sessionId, draft]);
  return (
    <V4Page
      id={creating ? 'MK-251' : 'MK-252'}
      title={creating ? t.schedule : t.scheduled}
      subtitle={participantRole ? uiText.v5Product.conversationMemberRoles[participantRole] : title}
      contextTitle={title}
      back={route(id)}
      menu={
        <RichMenuAction
          title={creating ? t.cancel : t.schedule}
          onSelect={() => setCreating((current) => !current)}
        />
      }
      actions={
        creating && (
          <Button form="v4-schedule" type="submit" disabled={command.busy}>
            {command.busy ? t.waiting : t.scheduleSubmit}
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
            <NativeTextarea
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
          <div className={uiClass('card')}>
            <div className={uiClass('kv')}>
              <span className={uiClass('key')}>{uiText.text_4172b29c8925}</span>
              <span className={uiClass('val')}>{title}</span>
            </div>
            <div className={uiClass('kv')}>
              <span className={uiClass('key')}>{uiText.text_a4cef48f2df3}</span>
              <span className={uiClass('val')}>{uiText.text_cdb566689830}</span>
            </div>
          </div>
          {invalid && (
            <p className={uiClass('v4-form-error')} role="alert">
              {t.invalidTime}
            </p>
          )}
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
                description={date(item.scheduledAtUtc, true)}
                end={
                  item.status === 'Scheduled' ? (
                    <ConfirmAction
                      title={t.cancelSchedule}
                      description={t.cancelScheduleHint}
                      trigger={t.cancel}
                      scenario="MK-253"
                      triggerControl={
                        <Button
                          type="button"
                          variant="ghost"
                          className={uiClass(s.scheduleStatus)}
                          aria-label={t.cancel}
                        >
                          <span className={uiClass('badge warn')}>{uiText.text_1ebfb10a5f69}</span>
                        </Button>
                      }
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
                  ) : (
                    <span className={uiClass('badge')}>{label(item.status)}</span>
                  )
                }
              />
            ))}
          </V4List>
          {(page > 1 || data.data.hasMore) && (
            <div className={uiClass('v4-inline-actions')}>
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
          )}
        </>
      ) : (
        <EmptyState title={t.scheduledEmpty} />
      )}
      {!creating && <p className={uiClass('policy')}>{uiText.text_2637675e9b26}</p>}
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
      className={uiClass(s.poll)}
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
        <label className={uiClass(s.pollOption)} key={option.number}>
          <NativeInput
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
              className={uiClass(s.progress)}
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
      <div className={uiClass('v4-inline-actions')}>
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
    [items, setItems] = useState<S['ChecklistItemInput'][]>([]),
    [editBaseline, setEditBaseline] = useState<{
      version: string;
      mode: S['ConversationChecklistMode'];
    }>();
  if (data.isPending) return <LoadingSkeleton />;
  if (data.isError) return <ErrorState error={data.error} onRetry={() => void data.refetch()} />;
  const list = data.data;
  return (
    <section className={uiClass(s.poll)} data-v4-view="MK-249" aria-label={list.title}>
      <strong>
        <ListChecks size={18} />
        {list.title}
      </strong>
      <small>{list.mode === 'Personal' ? t.personal : t.collaborative}</small>
      <Dialog
        open={editing}
        onOpenChange={(next) => {
          if (!command.busy) setEditing(next);
        }}
      >
        <DialogContent title={t.editChecklist} scenario="MK-250">
          <form
            className={uiClass(s.editChecklist)}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editBaseline || !title.trim() || items.some((x) => !x.text.trim())) return;
              const result = await command.run(
                path,
                {
                  title: title.trim(),
                  items: items.map((x) => ({ ...x, text: x.text.trim() })),
                  mode: editBaseline.mode,
                  expectedVersion: editBaseline.version,
                },
                'PUT',
              );
              if (result) setEditing(false);
            }}
          >
            <V4Field label={t.title}>
              <NativeInput required value={title} onChange={(e) => setTitle(e.target.value)} />
            </V4Field>
            {items.map((item, i) => (
              <V4Field label={t.item + ' ' + number(i + 1)} key={item.itemId}>
                <NativeInput
                  required
                  value={item.text}
                  onChange={(e) =>
                    setItems(items.map((x, n) => (i === n ? { ...x, text: e.target.value } : x)))
                  }
                />
              </V4Field>
            ))}
            <div className={uiClass('confirm-actions')}>
              <Button
                type="button"
                variant="outline"
                disabled={command.busy}
                onClick={() => setEditing(false)}
              >
                {t.cancel}
              </Button>
              <Button disabled={command.busy} type="submit">
                {uiText.text_3ee0bcbbe619}
              </Button>
            </div>
            {command.feedback}
          </form>
        </DialogContent>
      </Dialog>
      {list.items.map((item) => (
        <label className={uiClass(s.pollOption)} key={item.itemId}>
          <NativeInput
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
      ))}
      {list.isCompleted && <small>{t.completed}</small>}
      {canManage && !editing && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setTitle(list.title);
            setItems(list.items.map((x) => ({ itemId: x.itemId, text: x.text })));
            setEditBaseline({ version: list.version, mode: list.mode });
            setEditing(true);
          }}
        >
          {t.editChecklist}
        </Button>
      )}
      {!editing && command.feedback}
    </section>
  );
}

export function RichToolLinks({ id }: { id: string }) {
  return (
    <div className={uiClass(s.toolLinks)} aria-label={t.conversationTools}>
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
