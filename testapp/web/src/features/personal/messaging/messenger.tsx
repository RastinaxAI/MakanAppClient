'use client';
import { SearchField } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ContextBackLink } from '@/components/navigation/page-back';
import { useMediaQuery } from '@/components/hooks/use-media-query';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { number } from '@/lib/formatting';
import { ApiError } from '@/lib/api/errors';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Settings,
  Users,
  Archive,
  Bookmark,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import { MessagesSquare, SquarePen, MoreHorizontal, BellOff, Pin, Search } from './messenger-icons';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProfileAvatar } from '../profile-photo';
import { ConversationAvatar } from './conversation-photo';
import { usePersonal } from '../provider';
import {
  flattenAccountInbox,
  filterAccountInbox,
  messagingReturnPath,
  type InboxView,
} from './inbox-model';
import { officialMetadataMatches } from './official-model';
import { ConversationItem } from './conversation-item';
import type { MessageSearchTab } from './search';
import { useMessagingLive } from './live';
import { useConversationSelection } from './selection';
import s from './messenger.module.css';
import t from './messaging-theme.module.css';
import { conversationTitle } from './model';
import { OfficialBadge } from './official';
import { PresenceIndicator } from './conversation-controls';
import { MessagingInvitationsLink } from './received-invitations';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import { V5Scene } from '@/components/v5/scene';
import inboxStyle from './inbox.module.css';
const ConversationRoom = dynamic(
  () => import('./conversation-room').then((module) => module.ConversationRoom),
  { loading: () => <LoadingSkeleton /> },
);
const MessengerSearchResults = dynamic(
  () => import('./search').then((module) => module.MessengerSearchResults),
  { loading: () => <LoadingSkeleton /> },
);

const filterLabels = {
  All: uiText.text_15270886eadd,
  Direct: uiText.text_bb8b8f5b8bfc,
  Group: uiText.text_197ebc70e3d9,
  Channel: uiText.text_028b3c5809be,
  Unread: uiText.text_b3e662eb0f81,
  Archived: uiText.text_332d2faea0e2,
  Saved: uiText.text_7d24bb2778c3,
} as const;
function shortTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('fa-IR', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '';
}
export function Messenger({
  conversationId,
  sidebarOnly = false,
}: {
  conversationId?: string;
  sidebarOnly?: boolean;
}) {
  return <ContextMessenger conversationId={conversationId} sidebarOnly={sidebarOnly} />;
}
function ContextMessenger({
  conversationId,
  sidebarOnly,
}: {
  conversationId?: string;
  sidebarOnly: boolean;
}) {
  const { last, remember } = useConversationSelection();
  const wide = useMediaQuery('(min-width:768px)');
  const live = useMessagingLive();
  const { session, call } = usePersonal(),
    router = useRouter(),
    pathname = usePathname(),
    search = useSearchParams();
  const requested = search.get('filter') ?? 'All';
  const filter = requested in filterLabels ? (requested as keyof typeof filterLabels) : 'All';
  const view: InboxView =
    search.get('view') === 'personal'
      ? 'personal'
      : search.get('view') === 'official'
        ? 'official'
        : 'all';
  const q = (search.get('q') ?? '').slice(0, 100),
    pageSize = 30;
  const searchMode =
    !sidebarOnly &&
    (search.get('search') === '1' || (!!q && !search.has('filter') && !search.has('view')));
  const searchTarget: MessageSearchTab = [
    'people',
    'groups',
    'messages',
    'pins',
    'media',
    'links',
  ].includes(search.get('searchIn') ?? '')
    ? (search.get('searchIn') as MessageSearchTab)
    : 'people';
  const showConversations = !searchMode;
  const cache = useQueryClient();
  const [requestedPages, setRequestedPages] = useState(1);
  useEffect(() => setRequestedPages(1), [filter, q]);
  const [draft, setDraft] = useState(q),
    [hidden, setHidden] = useState<Set<string>>(() => new Set());
  useEffect(() => setDraft(q), [q]);
  const routeParams = new URLSearchParams({ filter });
  if (view !== 'all') routeParams.set('view', view);
  if (q) routeParams.set('q', q);
  const inbox = useInfiniteQuery({
    queryKey: ['personal', session.user.id, 'account', '/api/v1/conversations/account', filter, q],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ Filter: filter, Limit: String(pageSize) });
      if (q) params.set('Search', q);
      if (pageParam) params.set('Cursor', pageParam);
      const result = await call<components['schemas']['AccountInboxPageResult']>(
        '/api/v1/conversations/account?' + params,
        { signal },
      );
      if (result.hasMore && (!result.nextCursor || result.nextCursor === pageParam))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      return result;
    },
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    refetchInterval: 5000,
    retry: false,
    enabled: showConversations,
  });
  function retryInbox() {
    if (inbox.error instanceof ApiError && [400, 409].includes(inbox.error.status)) {
      setRequestedPages(1);
      void cache.resetQueries({
        queryKey: [
          'personal',
          session.user.id,
          'account',
          '/api/v1/conversations/account',
          filter,
          q,
        ],
        exact: true,
      });
    } else void inbox.refetch();
  }
  // A live invalidation may cancel fetchNextPage. Preserve the user's load intent
  // until that page is actually cached; never cancel an active refresh to append it.
  useEffect(() => {
    if (
      !inbox.isFetching &&
      !inbox.isError &&
      inbox.hasNextPage &&
      inbox.data &&
      inbox.data.pages.length < requestedPages
    )
      void inbox.fetchNextPage({ cancelRefetch: false });
  }, [inbox, requestedPages]);
  const allRows = useMemo(() => flattenAccountInbox(inbox.data?.pages ?? []), [inbox.data]);
  const unavailable = useCallback((id: string) => {
    setHidden((previous) => (previous.has(id) ? previous : new Set([...previous, id])));
  }, []);
  const available = useCallback(
    (id: string) =>
      setHidden((previous) => {
        if (!previous.has(id)) return previous;
        const next = new Set(previous);
        next.delete(id);
        return next;
      }),
    [],
  );
  function update(nextFilter: typeof filter, nextQuery = q) {
    const next = new URLSearchParams({ filter: nextFilter });
    if (nextFilter === filter && nextFilter === 'All' && view !== 'all') next.set('view', view);
    if (nextQuery) next.set('q', nextQuery);
    if (searchMode) {
      next.set('search', '1');
      next.set('searchIn', searchTarget);
      if (search.has('from')) next.set('from', messagingReturnPath(search.get('from')));
    }
    router.push(pathname + '?' + next, { scroll: false });
  }
  function updateSearchTarget(next: MessageSearchTab) {
    const params = new URLSearchParams(search);
    params.set('searchIn', next);
    params.set('search', '1');
    router.push(pathname + '?' + params, { scroll: false });
  }
  const rows = filterAccountInbox(
    allRows.filter(
      (row) => !hidden.has(row.conversationId) && (filter === 'Archived' || !row.isArchived),
    ),
    view,
  );
  const keepCachedInbox =
    !!inbox.data &&
    !(inbox.error instanceof ApiError && [401, 403, 404].includes(inbox.error.status));
  const displayId = sidebarOnly
    ? undefined
    : (conversationId ??
      (wide && search.get('list') !== '1' && rows?.some((row) => row.conversationId === last)
        ? last
        : undefined));
  const compactSidebar = sidebarOnly || !!displayId;
  const selected = allRows.find((row) => row.conversationId === displayId);
  useEffect(() => {
    if (conversationId && allRows.some((row) => row.conversationId === conversationId))
      remember(conversationId);
  }, [conversationId, allRows, remember]);
  const listStyle = inboxStyle;
  const listScroll = useRef<HTMLDivElement>(null);
  useScrollMemory(listScroll, `inbox:${filter}:${view}:${q}:${searchMode}:${compactSidebar}`);
  useEffect(() => {
    const scroll = listScroll.current;
    const header = scroll?.querySelector<HTMLElement>('[data-inbox-header]');
    if (!scroll || !header) return;
    const measure = () =>
      scroll.style.setProperty(
        '--inbox-header-height',
        header.getBoundingClientRect().height + 'px',
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => {
      observer.disconnect();
      scroll.style.removeProperty('--inbox-header-height');
    };
  }, [compactSidebar, searchMode]);
  const filterRow = useRef<HTMLElement>(null);
  useEffect(() => {
    filterRow.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [filter, view, searchMode, compactSidebar]);
  const returnPath = pathname + (search.size ? '?' + search : '');
  const from = new URLSearchParams({ from: returnPath });
  const newMessageHref = '/personal/messages/new?kind=direct&' + from;
  const listTools = (
    <div className={inboxStyle.tools} data-inbox-tools>
      <Link
        className={inboxStyle.tool}
        href={'/personal/messages?' + new URLSearchParams({ search: '1', from: returnPath })}
        aria-label={uiText.text_3fb47eb71ac7}
        title={uiText.text_3fb47eb71ac7}
      >
        <Search size={22} aria-hidden="true" />
      </Link>
      <MessagingInvitationsLink returnPath={returnPath} className={inboxStyle.tool} />
      <Menu.Root dir="rtl">
        <Menu.Trigger asChild>
          <button
            type="button"
            className={inboxStyle.tool}
            aria-label={uiText.v71Ui.inboxMore}
            title={uiText.v71Ui.inboxMore}
          >
            <MoreHorizontal size={22} aria-hidden="true" />
          </button>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            className={uiClass(`dropdown ${t.theme} ${t.menu}`)}
            align="end"
            sideOffset={8}
          >
            <Menu.Item onSelect={() => update('Saved')}>
              <Bookmark size={18} />
              {uiText.text_9f3597ff2f66}
            </Menu.Item>
            <Menu.Item onSelect={() => update('Archived')}>
              <Archive size={18} />
              {uiText.v71Ui.archive}
            </Menu.Item>
            <Menu.Item asChild>
              <Link href={'/personal/messages/folders?' + from}>
                <FolderOpen size={18} />
                {uiText.v71Ui.folders}
              </Link>
            </Menu.Item>
            <Menu.Item asChild>
              <Link href="/personal/settings">
                <Settings size={18} />
                {uiText.text_feab3764e510}
              </Link>
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
  const compose = !searchMode && (
    <Link
      className={inboxStyle.compose}
      href={newMessageHref}
      aria-label={uiText.v71Ui.newMessage}
      title={uiText.v71Ui.newMessage}
      data-composer-trigger
    >
      <SquarePen size={24} aria-hidden="true" />
    </Link>
  );
  const presets = [
    { filter: 'All', view: 'all', label: filterLabels.All },
    { filter: 'Direct', view: 'all', label: filterLabels.Direct },
    { filter: 'Group', view: 'all', label: filterLabels.Group },
    { filter: 'Channel', view: 'all', label: filterLabels.Channel },
    { filter: 'All', view: 'official', label: uiText.v6Ui.officialFilter },
    { filter: 'Unread', view: 'all', label: filterLabels.Unread },
  ] as const;
  const inboxControls = (
    <>
      <div className={inboxStyle.scroll} ref={listScroll} data-inbox-scroll>
        <header className={inboxStyle.header} role="banner" data-inbox-header>
          {searchMode ? (
            <>
              <ContextBackLink
                href={messagingReturnPath(search.get('from'))}
                className={inboxStyle.tool}
                aria-label={uiText.common_back}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </ContextBackLink>
              <h1 className={uiClass('sr-only')}>{uiText.v6Ui.publicSearch}</h1>
              <form
                className={uiClass(listStyle.search + ' ' + inboxStyle.headerSearch)}
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  update(filter, draft.trim());
                }}
              >
                <SearchField
                  showEmptyClear
                  aria-label={uiText.text_b5159abdeeb1}
                  placeholder={uiText.v6Ui.mainSearch}
                  maxLength={100}
                  value={draft}
                  autoFocus={searchMode && !q}
                  onChange={(event) => setDraft(event.target.value)}
                  onClear={() => {
                    setDraft('');
                    update(filter, '');
                  }}
                  action={
                    <button
                      type="submit"
                      aria-label={uiText.text_3fb47eb71ac7}
                      className={uiClass(listStyle.searchSubmit)}
                    >
                      <Search size={displayId ? 20 : 19} />
                    </button>
                  }
                />
              </form>
            </>
          ) : (
            <>
              {compactSidebar ? (
                <h2>{uiText.navigation_messages}</h2>
              ) : (
                <h1>{uiText.navigation_messages}</h1>
              )}
              {listTools}
            </>
          )}
        </header>
        <div
          className={`${inboxStyle.top} ${compactSidebar ? inboxStyle.embeddedTop : searchMode ? inboxStyle.searchTop : ''}`}
        >
          {
            <nav
              ref={filterRow}
              className={uiClass(listStyle.filter)}
              aria-label={uiText.text_6f9bc91900c3}
            >
              {searchMode ? (
                <>
                  {(
                    [
                      'people',
                      'groups',
                      'pins',
                      'media',
                      'links',
                      ...(q ? ['messages'] : []),
                    ] as MessageSearchTab[]
                  ).map((value) => (
                    <button
                      key={value}
                      onClick={() => updateSearchTarget(value)}
                      aria-pressed={searchTarget === value}
                    >
                      {value === 'people'
                        ? uiText.messengerPdf.people
                        : value === 'groups'
                          ? uiText.messengerPdf.group
                          : value === 'pins'
                            ? uiText.messengerPdf.pins
                            : value === 'media'
                              ? uiText.messengerPdf.media
                              : value === 'links'
                                ? uiText.messengerPdf.links
                                : uiText.v6Ui.searchMessages}
                    </button>
                  ))}
                </>
              ) : (
                presets.map((preset) => (
                  <button
                    key={preset.filter + preset.view}
                    onClick={() => {
                      const params = new URLSearchParams({ filter: preset.filter });
                      if (preset.view !== 'all') params.set('view', preset.view);
                      if (q) params.set('q', q);
                      router.push(pathname + '?' + params, { scroll: false });
                    }}
                    onFocus={(event) =>
                      event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
                    }
                    aria-pressed={filter === preset.filter && view === preset.view}
                  >
                    {preset.label}
                  </button>
                ))
              )}
            </nav>
          }
          {(['Archived', 'Saved'].includes(filter) || view === 'personal') && (
            <div className={uiClass(listStyle.filterTitle)}>
              <strong>
                {view === 'official' ? uiText.v6Ui.officialFilter : filterLabels[filter]}
              </strong>
              <button onClick={() => update('All')}>{uiText.text_eaadb95c2b86}</button>
            </div>
          )}
        </div>
        <div className={uiClass(listStyle.list)}>
          {searchMode && <MessengerSearchResults query={q} tab={searchTarget} />}
          {showConversations && inbox.isError && keepCachedInbox && (
            <ErrorState error={inbox.error} onRetry={retryInbox} />
          )}
          {!showConversations ? null : inbox.isPending ? (
            <LoadingSkeleton />
          ) : inbox.isError && !keepCachedInbox ? (
            <ErrorState error={inbox.error} onRetry={retryInbox} />
          ) : !rows?.length && view !== 'all' && inbox.hasNextPage ? (
            <p className={inboxStyle.filterNotice} role="status">
              {uiText.v6Ui.moreFiltered}
            </p>
          ) : !rows?.length ? (
            q ? (
              <EmptyState title={uiText.text_c8acf4fa9c84} description={uiText.text_eb844d50a629} />
            ) : (
              <section className={inboxStyle.empty} data-inbox-empty>
                <span className={inboxStyle.emptyIllustration} aria-hidden>
                  {filter === 'Group' ? (
                    <Users aria-hidden="true" />
                  ) : (
                    <MessagesSquare aria-hidden="true" />
                  )}
                </span>
                <h2>
                  {filter === 'Group'
                    ? uiText.messengerPdf.emptyGroup
                    : uiText.messengerPdf.emptyPersonal}
                </h2>
                <p>
                  {filter === 'Group'
                    ? uiText.messengerPdf.emptyGroupDescription
                    : uiText.messengerPdf.emptyPersonalDescription}
                </p>
                <Button asChild>
                  <Link
                    href={
                      filter === 'Group'
                        ? '/personal/messages/new?kind=groups&' + from
                        : newMessageHref
                    }
                  >
                    {filter === 'Group'
                      ? uiText.messengerPdf.createGroup
                      : uiText.messengerPdf.addNewMessage}
                  </Link>
                </Button>
              </section>
            )
          ) : (
            <div className={uiClass(listStyle.inboxCard)}>
              {rows.map((row) => (
                <ConversationItem
                  key={row.conversationId}
                  row={row}
                  href={'/personal/messages/' + row.conversationId + '?' + routeParams}
                  selected={row.conversationId === displayId}
                  time={
                    row.lastMessageAtUtc ? <time>{shortTime(row.lastMessageAtUtc)}</time> : null
                  }
                  status={
                    row.unreadCount > 0 ? (
                      <b
                        className={uiClass(listStyle.unread)}
                        aria-label={number(row.unreadCount) + uiText.text_a300d2d3e7cd}
                      >
                        {number(row.unreadCount)}
                      </b>
                    ) : row.isPinned ? (
                      <Pin size={14} aria-label={uiText.text_c52d80c47859} />
                    ) : null
                  }
                >
                  {row.type === 'Saved' ? (
                    <span
                      className={uiClass(listStyle.avatar)}
                      aria-label={uiText.text_9f3597ff2f66}
                    >
                      <Bookmark size={28} fill="currentColor" />
                    </span>
                  ) : row.type === 'Group' || row.type === 'Channel' ? (
                    <ConversationAvatar
                      id={row.conversationId}
                      photo={row.photo}
                      name={conversationTitle(row)}
                      className={uiClass(listStyle.avatar)}
                    />
                  ) : (
                    <span className={!sidebarOnly ? listStyle.avatarSlot : undefined}>
                      <ProfileAvatar
                        photo={
                          row.type === 'Direct' ? row.otherParticipant?.profilePhoto : undefined
                        }
                        name={conversationTitle(row)}
                        className={uiClass(
                          `${listStyle.avatar} ${row.scope === 'Organization' ? listStyle.organizationAvatar : ''}`,
                        )}
                      />
                      {!sidebarOnly && row.otherParticipant && (
                        <PresenceIndicator userId={row.otherParticipant.userId} />
                      )}
                    </span>
                  )}
                  <span className={uiClass(listStyle.chatSummary)}>
                    <span className={uiClass(listStyle.row)}>
                      <strong dir="auto">
                        {conversationTitle(row)} <OfficialBadge summary={row} compact />
                        {row.isMuted && <BellOff size={12} aria-label={uiText.text_16be3d3db4fc} />}
                      </strong>
                    </span>
                    {row.scope === 'Organization' && !officialMetadataMatches(row) && (
                      <small className={uiClass(listStyle.orgLabel)}>
                        <Building2 size={12} />
                        {row.organization?.organizationName ?? uiText.text_7298890ac877}
                      </small>
                    )}
                    <span className={uiClass(listStyle.row)}>
                      <span className={uiClass(listStyle.preview)} data-message-preview>
                        {officialMetadataMatches(row) && row.official!.displayLabel + ' · '}
                        {row.lastMessagePreview ?? uiText.text_8253c0eeba70}
                      </span>
                    </span>
                  </span>
                </ConversationItem>
              ))}
            </div>
          )}
          {showConversations && inbox.hasNextPage && (
            <div className={uiClass(listStyle.paging)}>
              <Button
                variant="ghost"
                disabled={inbox.isFetchingNextPage}
                onClick={() => {
                  // A background refresh must not disable the button between pointer down/up.
                  // Queue the user's intent and append after that refresh has finished.
                  setRequestedPages((inbox.data?.pages.length ?? 1) + 1);
                  if (inbox.isError) void inbox.fetchNextPage({ cancelRefetch: false });
                }}
              >
                {inbox.isFetchingNextPage ? uiText.text_80516c4adbbe : uiText.text_1e8ff49623b1}
              </Button>
            </div>
          )}
        </div>
        <span className={uiClass('sr-only')} role="status">
          {inbox.isError
            ? uiText.text_a4770d022c38
            : inbox.isFetching
              ? uiText.text_41f38689a3ef
              : live.state === 'live'
                ? uiText.text_7d870c3eb207
                : live.state === 'connecting'
                  ? uiText.text_3b6b5e0a1c78
                  : uiText.text_ce167312e237}
        </span>
      </div>
      {compose}
    </>
  );
  if (sidebarOnly)
    return (
      <section
        className={`${inboxStyle.sidebar} ${inboxStyle.embeddedLegacy}`}
        data-chat-list
        aria-label={uiText.text_bf3af9311de4}
      >
        {inboxControls}
      </section>
    );
  if (!displayId)
    return (
      <V5Scene
        id={
          searchMode
            ? 'MSG-02'
            : filter === 'Unread'
              ? 'MK-171'
              : filter === 'Archived'
                ? 'MK-172'
                : 'MK-170'
        }
        title={searchMode ? uiText.v6Ui.publicSearch : uiText.navigation_messages}
        subtitle={uiText.v6Ui.personalMessenger}
        back={searchMode ? messagingReturnPath(search.get('from')) : '/personal'}
        kind="list"
        layout="messenger"
        deep={searchMode}
        headerTools={searchMode ? <></> : listTools}
        header={<></>}
        summary={(inbox.isSuccess || keepCachedInbox ? rows : []).slice(0, 4).map((row) => ({
          label: conversationTitle(row),
          value: row.lastMessagePreview ?? uiText.text_8253c0eeba70,
        }))}
      >
        <div
          className={`${inboxStyle.workspace} ${searchMode ? inboxStyle.searchWorkspace : inboxStyle.inboxWorkspace}`}
          data-inbox-root
          data-messenger-search={searchMode || undefined}
        >
          <section
            className={inboxStyle.sidebar}
            data-messenger
            data-chat-list
            aria-label={uiText.text_bf3af9311de4}
          >
            {inboxControls}
          </section>
        </div>
      </V5Scene>
    );
  return (
    <V5Scene
      id="MK-179"
      title={uiText.text_f6aa82db3906}
      back={
        selected?.scope === 'Organization'
          ? '/personal/messages?view=organization'
          : '/personal/messages'
      }
      kind="list"
      layout="messenger"
      deep
    >
      <div className={uiClass(`${t.theme} ${s.messenger} ${s.activeChat}`)} data-messenger>
        <section
          className={`${s.sidebar} ${inboxStyle.sidebar}`}
          data-chat-list
          aria-label={uiText.text_bf3af9311de4}
        >
          {inboxControls}
        </section>
        <ConversationRoom
          key={displayId}
          id={displayId}
          summary={selected}
          onUnavailable={unavailable}
          onAvailable={available}
        />
      </div>
    </V5Scene>
  );
}
