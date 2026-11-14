'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import * as fa from '@/content/fa';
import { usePersonal } from '../provider';
import { ProfileAvatar } from '../profile-photo';
import { ConversationAvatar } from './conversation-photo';
import { MessageAttachment } from './media';
import { messageLinks } from './media-model';
import { conversationTitle } from './model';
import { Pin } from './messenger-icons';
import s from './conversation-pages.module.css';
import list from './inbox.module.css';
type S = components['schemas'];
export type MessageSearchTab = 'people' | 'groups' | 'messages' | 'pins' | 'media' | 'links';

export function MessengerSearchResults({
  query,
  tab,
  conversationId,
}: {
  query: string;
  tab: MessageSearchTab;
  conversationId?: string;
}) {
  if (tab === 'people') return <People query={query} />;
  if (tab === 'groups') return <Groups query={query} />;
  if (tab === 'pins') return <Pins query={query} conversationId={conversationId} />;
  return <MessageResults query={query} tab={tab} conversationId={conversationId} />;
}
function People({ query }: { query: string }) {
  const { call, session } = usePersonal();
  const rows = useInfiniteQuery({
    queryKey: ['personal', session.user.id, 'account', 'pdf-people', query],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        pageSize: '30',
        q: query.replace(/^@/, ''),
      });
      if (query)
        return call<S['PeopleSearchPageResult']>('/api/v1/people/search?' + params, {
          signal,
          scope: 'account',
        });
      const data = await call<S['UserContactPageResult']>(
        '/api/v1/contacts?' + params + '&favoritesOnly=false',
        { signal, scope: 'account' },
      );
      return {
        ...data,
        items: data.items.map((item) => ({
          ...item.profile,
          displayName: item.savedName || item.profile.displayName,
        })),
      };
    },
    getNextPageParam: (last, _, page) => (last.hasMore ? page + 1 : undefined),
    retry: false,
  });
  const people = [
    ...new Map(
      rows.data?.pages
        .flatMap((page) => page.items)
        .filter((person) => person.userId !== session.user.id)
        .map((person) => [person.userId, person]),
    ).values(),
  ].sort((a, b) => a.displayName.localeCompare(b.displayName, 'fa'));
  return (
    <section className={s.searchResults} data-main-people-results>
      {rows.isPending ? (
        <LoadingSkeleton />
      ) : rows.isError ? (
        <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />
      ) : !people.length ? (
        <EmptyState title={fa.text_c8acf4fa9c84} />
      ) : (
        people.map((person, index) => (
          <div key={person.userId}>
            {(index === 0 || people[index - 1].displayName[0] !== person.displayName[0]) && (
              <h2 className={s.alphabet}>{person.displayName[0]}</h2>
            )}
            <Link
              className={list.chatItem}
              aria-label={fa.v6Ui.showContact(person.displayName)}
              href={
                '/personal/contacts?' +
                new URLSearchParams({
                  person: person.userId,
                  from: '/personal/messages?search=1&q=' + encodeURIComponent(query),
                })
              }
            >
              <ProfileAvatar
                name={person.displayName}
                photo={person.profilePhoto}
                className={list.avatar}
              />
              <span className={list.chatSummary}>
                <strong>{person.displayName}</strong>
                <small className={list.preview}>
                  <bdi dir="ltr">@{person.username}</bdi>
                </small>
              </span>
            </Link>
          </div>
        ))
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
    </section>
  );
}
function Groups({ query }: { query: string }) {
  const { call, session } = usePersonal();
  const rows = useInfiniteQuery({
    queryKey: ['personal', session.user.id, 'account', 'pdf-group-search', query],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ Filter: 'Group', Limit: '30' });
      if (query) params.set('Search', query);
      if (pageParam) params.set('Cursor', pageParam);
      const data = await call<S['AccountInboxPageResult']>(
        '/api/v1/conversations/account?' + params,
        { signal, scope: 'account' },
      );
      if (data.hasMore && (!data.nextCursor || data.nextCursor === pageParam))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      return data;
    },
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    retry: false,
  });
  const groups = [
    ...new Map(
      rows.data?.pages.flatMap((page) => page.items).map((row) => [row.conversationId, row]),
    ).values(),
  ];
  return (
    <section className={s.searchResults}>
      {rows.isPending ? (
        <LoadingSkeleton />
      ) : rows.isError ? (
        <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />
      ) : !groups.length ? (
        <EmptyState title={fa.text_c8acf4fa9c84} />
      ) : (
        groups.map((row) => (
          <Link
            key={row.conversationId}
            className={list.chatItem}
            href={'/personal/messages/' + row.conversationId}
          >
            <ConversationAvatar
              id={row.conversationId}
              name={conversationTitle(row)}
              photo={row.photo}
              className={list.avatar}
            />
            <span className={list.chatSummary}>
              <strong>{conversationTitle(row)}</strong>
              <small className={list.preview}>{row.lastMessagePreview}</small>
            </span>
            {row.unreadCount > 0 && (
              <span className={list.unread}>{row.unreadCount.toLocaleString('fa-IR')}</span>
            )}
          </Link>
        ))
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
    </section>
  );
}
function MessageResults({
  query,
  tab,
  conversationId,
}: {
  query: string;
  tab: 'messages' | 'media' | 'links';
  conversationId?: string;
}) {
  const { call, session } = usePersonal();
  const rows = useInfiniteQuery({
    queryKey: [
      'personal',
      session.user.id,
      'account',
      'pdf-message-search',
      query,
      tab,
      conversationId,
    ],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ limit: '30' });
      if (query) params.set('q', query);
      if (conversationId) params.set('conversationId', conversationId);
      else params.set('scope', 'Personal');
      if (tab === 'media') params.set('hasAttachment', 'true');
      if (tab === 'links') params.set('hasLinks', 'true');
      if (pageParam) params.set('cursor', pageParam);
      const data = await call<S['MessageSearchPageResult']>('/api/v1/messages/search?' + params, {
        signal,
        scope: 'account',
      });
      if (data.nextCursor && data.nextCursor === pageParam)
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      return data;
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: false,
  });
  const messages = [
    ...new Map(
      rows.data?.pages.flatMap((page) => page.items).map((row) => [row.messageId, row]),
    ).values(),
  ];
  return (
    <section className={s.searchResults} data-message-search-results>
      {rows.isPending ? (
        <LoadingSkeleton />
      ) : rows.isError && !messages.length ? (
        <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />
      ) : !messages.length ? (
        <EmptyState title={fa.text_c8acf4fa9c84} />
      ) : tab === 'media' ? (
        <div className={s.mediaGrid}>
          {messages.flatMap((message) =>
            message.attachments.map((asset) => (
              <MessageAttachment
                key={message.messageId + asset.fileAssetId}
                conversationId={message.conversationId}
                asset={asset}
                compact
              />
            )),
          )}
        </div>
      ) : tab === 'links' ? (
        <div className={s.linkGrid}>
          {messages.flatMap((message) => {
            const links = messageLinks(message.snippet);
            if (!links.length)
              return [
                <Link
                  key={message.messageId}
                  className={s.linkCard}
                  href={`/personal/messages/${message.conversationId}?${new URLSearchParams({ message: message.messageId, sequence: String(message.sequence) })}`}
                >
                  <strong>{message.sender.displayName}</strong>
                  <span>{message.snippet}</span>
                </Link>,
              ];
            return links.map((url) => (
              <a
                key={message.messageId + url}
                className={s.linkCard}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong dir="ltr">{new URL(url).hostname}</strong>
                <span dir="ltr">{url}</span>
                <small>{message.sender.displayName}</small>
              </a>
            ));
          })}
        </div>
      ) : (
        messages.map((message) => (
          <Link
            key={message.messageId}
            className={list.chatItem}
            href={`/personal/messages/${message.conversationId}?${new URLSearchParams({ message: message.messageId, sequence: String(message.sequence), from: '/personal/messages?' + new URLSearchParams({ search: '1', q: query, searchIn: tab }) })}`}
          >
            <ProfileAvatar
              name={message.sender.displayName}
              photo={message.sender.profilePhoto}
              className={list.avatar}
            />
            <span className={list.chatSummary}>
              <strong>{message.sender.displayName}</strong>
              <span className={list.preview}>{message.snippet}</span>
            </span>
          </Link>
        ))
      )}
      {rows.isError && !!messages.length && (
        <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />
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
    </section>
  );
}

type PinJob = { id: string; before: number | null };
type PinCursor = { account: string | null; moreAccounts: boolean; jobs: PinJob[] };
/** The contract has no global pins index. Read permitted histories in bounded, explicit pages. */
function Pins({ query, conversationId }: { query: string; conversationId?: string }) {
  const { call, session } = usePersonal();
  const rows = useInfiniteQuery({
    queryKey: ['personal', session.user.id, 'account', 'pdf-pins', query, conversationId],
    initialPageParam: {
      account: null,
      moreAccounts: !conversationId,
      jobs: conversationId ? [{ id: conversationId, before: null }] : [],
    } as PinCursor,
    queryFn: async ({ pageParam, signal }) => {
      let { account, moreAccounts } = pageParam;
      const jobs = [...pageParam.jobs];
      if (!jobs.length && moreAccounts) {
        const params = new URLSearchParams({ Filter: 'All', Limit: '12' });
        if (account) params.set('Cursor', account);
        const inbox = await call<S['AccountInboxPageResult']>(
          '/api/v1/conversations/account?' + params,
          { signal, scope: 'account' },
        );
        if (inbox.hasMore && (!inbox.nextCursor || inbox.nextCursor === account))
          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
        account = inbox.nextCursor;
        moreAccounts = inbox.hasMore;
        jobs.push(
          ...inbox.items
            .filter((row) => row.scope === 'Personal')
            .map((row) => ({ id: row.conversationId, before: null })),
        );
      }
      const active = jobs.splice(0, 3);
      const pages = await Promise.all(
        active.map(async (job) => {
          const params = new URLSearchParams({ limit: '50' });
          if (job.before !== null) params.set('beforeSequence', String(job.before));
          const page = await call<S['ConversationMessagePageResult']>(
            `/api/v1/conversations/${job.id}/messages?${params}`,
            { signal, scope: 'account' },
          );
          if (
            page.nextBeforeSequence !== null &&
            job.before !== null &&
            page.nextBeforeSequence >= job.before
          )
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          return { job, page };
        }),
      );
      for (const { job, page } of pages)
        if (page.nextBeforeSequence !== null)
          jobs.push({ id: job.id, before: page.nextBeforeSequence });
      return {
        items: pages
          .flatMap(({ page }) => page.messages)
          .filter(
            (message) =>
              message.isPinned &&
              !message.isDeleted &&
              (!query ||
                message.text?.toLocaleLowerCase('fa').includes(query.toLocaleLowerCase('fa'))),
          ),
        next: jobs.length || moreAccounts ? { account, moreAccounts, jobs } : undefined,
      };
    },
    getNextPageParam: (last) => last.next,
    retry: false,
  });
  const messages = [
    ...new Map(
      rows.data?.pages.flatMap((page) => page.items).map((row) => [row.messageId, row]),
    ).values(),
  ];
  return (
    <section className={s.searchResults} data-pin-results>
      {rows.isPending ? (
        <LoadingSkeleton />
      ) : rows.isError ? (
        <ErrorState error={rows.error} onRetry={() => void rows.refetch()} />
      ) : !messages.length && !rows.hasNextPage ? (
        <EmptyState title={fa.text_c8acf4fa9c84} />
      ) : (
        messages.map((message) => (
          <Link
            key={message.messageId}
            className={list.chatItem}
            href={`/personal/messages/${message.conversationId}?${new URLSearchParams({ message: message.messageId, sequence: String(message.sequence), from: '/personal/messages?' + new URLSearchParams({ search: '1', q: query, searchIn: 'pins' }) })}`}
          >
            <ProfileAvatar
              name={message.sender.displayName}
              photo={message.sender.profilePhoto}
              className={list.avatar}
            />
            <span className={list.chatSummary}>
              <strong>
                {message.sender.displayName} <Pin size={12} />
              </strong>
              <span>{message.text}</span>
            </span>
          </Link>
        ))
      )}
      {rows.hasNextPage && (
        <>
          <p className={s.note}>{fa.messengerPdf.pinsMoreHint}</p>
          <Button
            variant="ghost"
            disabled={rows.isFetchingNextPage}
            onClick={() => void rows.fetchNextPage()}
          >
            {fa.text_12e9b2eceeab}
          </Button>
        </>
      )}
    </section>
  );
}
