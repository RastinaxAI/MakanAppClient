'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { components } from '@/generated/api/schema';
import type { ClientRequestScope } from '@/lib/client-surface';
import { useViewState } from '@/components/hooks/use-view-state';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';
import { usePersonal } from '../provider';
import { ProfileAvatar } from '../profile-photo';
import * as fa from '@/content/fa';
import s from './messenger.module.css';
type S = components['schemas'];
export type MentionToken = { userId: string; token: string };
export function mentionRange(text: string, caret: number) {
  const prefix = text.slice(0, caret);
  const match = prefix.match(/(?:^|\s)@([\p{L}\p{N}._\u200c-]*)$/u);
  if (!match) return null;
  const tail = text.slice(caret).match(/^[\p{L}\p{N}._\u200c-]*/u)![0];
  return { start: caret - match[1].length - 1, end: caret + tail.length, query: match[1] };
}
export function mentionedIds(text: string, selected: MentionToken[]) {
  const ordinary = text.split(/https?:\/\/[^\s<>]+/u);
  return [
    ...new Set(
      selected
        .filter(({ token }) => {
          const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(
            '(^|[^\\p{L}\\p{N}._@\\u200c-])' + escaped + '(?![\\p{L}\\p{N}._\\u200c-])',
            'iu',
          );
          return ordinary.some((part) => pattern.test(part));
        })
        .map(({ userId }) => userId),
    ),
  ];
}
export function useMentions({
  id,
  scope,
  scopeKey,
  enabled,
  draft,
  setDraft,
  composer,
  knownMembers,
}: {
  id: string;
  scope: ClientRequestScope;
  scopeKey: string;
  enabled: boolean;
  draft: string;
  setDraft: (text: string) => void;
  composer: RefObject<HTMLTextAreaElement | null>;
  knownMembers: S['ConversationParticipantResult'][];
}) {
  const { call, session } = usePersonal();
  const [range, setRange] = useState<ReturnType<typeof mentionRange>>(null);
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = 'mentions-' + useId();
  const [selected, setSelected, ready] = useViewState<MentionToken[]>(
    session.user.id + ':' + scopeKey + ':conversation-mentions:' + id,
    [],
    (value): value is MentionToken[] =>
      Array.isArray(value) &&
      value.every((row) => row && typeof row.userId === 'string' && typeof row.token === 'string'),
  );
  const rows = useInfiniteQuery({
    queryKey: [
      'personal',
      session.user.id,
      scope === 'account' ? 'account' : session.revision,
      'mention-members',
      id,
    ],
    enabled: enabled && !!range,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      call<S['ConversationParticipantPageResult']>(
        `/api/v1/conversations/${id}/members?page=${pageParam}&pageSize=30`,
        { signal, scope },
      ),
    getNextPageParam: (last, _, page) => (last.hasMore ? page + 1 : undefined),
    retry: false,
  });
  const candidates = rows.isError
    ? []
    : [
        ...new Map(
          [...knownMembers, ...(rows.data?.pages.flatMap((page) => page.items) ?? [])]
            .filter(
              (row) =>
                row.status === 'Active' &&
                row.user.userId !== session.user.id &&
                (row.user.displayName + ' ' + (row.user.username ?? ''))
                  .toLocaleLowerCase('fa')
                  .includes(range?.query.toLocaleLowerCase('fa') ?? ''),
            )
            .map((row) => [row.user.userId, row.user]),
        ).values(),
      ];
  const index = Math.min(active, Math.max(0, candidates.length - 1));
  useEffect(() => {
    if (!range) return;
    const outside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !panel.current?.contains(event.target) &&
        event.target !== composer.current
      )
        setRange(null);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [range, composer]);
  function change(text: string, caret = text.length) {
    setDraft(text);
    const ids = mentionedIds(text, selected);
    setSelected((old) => old.filter((row) => ids.includes(row.userId)));
    setRange(enabled ? mentionRange(text, caret) : null);
    setActive(0);
  }
  function choose(person: S['SafeMessagingIdentityResult']) {
    if (!range) return;
    const token = '@' + (person.username || person.displayName.replace(/\s+/g, '_'));
    const next = draft.slice(0, range.start) + token + ' ' + draft.slice(range.end);
    setDraft(next);
    setSelected((old) => [
      ...old.filter((row) => row.userId !== person.userId),
      { userId: person.userId, token },
    ]);
    const caret = range.start + token.length + 1;
    setRange(null);
    requestAnimationFrame(() => {
      composer.current?.focus();
      composer.current?.setSelectionRange(caret, caret);
    });
  }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!enabled || !range || event.nativeEvent.isComposing) return false;
    if (event.key === 'Escape') {
      event.preventDefault();
      setRange(null);
      return true;
    }
    if (!candidates.length) return false;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(
        (index + (event.key === 'ArrowDown' ? 1 : candidates.length - 1)) % candidates.length,
      );
      return true;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      choose(candidates[index]);
      return true;
    }
    return false;
  }
  const open = enabled && !!range;
  return {
    ready,
    change,
    keyDown,
    ids: (text = draft) => (enabled ? mentionedIds(text, selected) : []),
    clear: () => {
      setSelected([]);
      setRange(null);
    },
    inputProps: {
      'aria-autocomplete': 'list' as const,
      'aria-haspopup': 'listbox' as const,
      'aria-controls': open ? panelId : undefined,
      'aria-activedescendant': open && candidates.length ? panelId + '-' + index : undefined,
    },
    panel: open ? (
      <div ref={panel} className={s.mentionPanel}>
        <div id={panelId} role="listbox" aria-label={fa.messengerPdf.mentionPeople}>
          {candidates.map((person, i) => (
            <button
              key={person.userId}
              id={panelId + '-' + i}
              type="button"
              role="option"
              aria-selected={i === index}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(person)}
            >
              <ProfileAvatar
                name={person.displayName}
                photo={person.profilePhoto}
                className={s.mentionAvatar}
              />
              <span>
                <strong>{person.displayName}</strong>
                {person.username && <small dir="ltr">@{person.username}</small>}
              </span>
            </button>
          ))}
        </div>
        {rows.isError && <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />}
        {!rows.isError && !candidates.length && (
          <p>{rows.isFetching ? fa.text_80516c4adbbe : fa.messengerPdf.noMentionMembers}</p>
        )}
        {rows.hasNextPage && (
          <Button
            variant="ghost"
            disabled={rows.isFetchingNextPage}
            onClick={() => void rows.fetchNextPage()}
          >
            {fa.text_12e9b2eceeab}
          </Button>
        )}
      </div>
    ) : null,
  };
}
