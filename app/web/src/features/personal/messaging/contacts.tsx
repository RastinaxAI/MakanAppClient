'use client';
import { Input as NativeInput, SearchField } from '@/components/ui/input';
import { uiClass } from '@/components/v5/classes';
import * as uiText from '@/content/fa';
import d from './directory.module.css';
import t from './messaging-theme.module.css';
import { Button } from '@/components/ui/button';
import { V5Scene } from '@/components/v5/scene';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  Bell,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Pencil,
  RefreshCw,
  Info,
  Search,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import s from '../personal.module.css';
import { ProfileAvatar } from '../profile-photo';
import { startPersonalConversation } from './directory';
import { usePersonal, usePersonalApi } from '../provider';
import { safeAuthReturnPath } from '@/lib/auth-return';
import { messagingNextLabels } from '../status-labels';
const ContactPhoneForm = dynamic(() => import('./contact-form').then((m) => m.ContactPhoneForm), {
  loading: () => <LoadingSkeleton />,
});
type Person = components['schemas']['MessagingPublicProfileResult'];
type ContactRow = {
  profile: Person;
  name: string;
  contact?: components['schemas']['UserContactResult'];
};
const text = uiText.v6Ui;
export function MessengerPeopleSearch({ query }: { query: string }) {
  return <ContactsPage embedded initialQuery={query} />;
}
export function ContactsPage({
  embedded = false,
  initialQuery,
}: { embedded?: boolean; initialQuery?: string } = {}) {
  const { session, call } = usePersonal(),
    router = useRouter(),
    cache = useQueryClient();
  const params = useSearchParams();
  const personId = params.get('person') ?? '';
  const validPersonId = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(personId);
  const person = usePersonalApi<Person>('/api/v1/people/' + encodeURIComponent(personId), {
    enabled: validPersonId,
  });
  const initial = initialQuery ?? params.get('q') ?? '';
  const [tab, setTab] = useState<'contacts' | 'add' | 'search'>(
    params.get('view') === 'add'
      ? 'add'
      : embedded || params.get('view') === 'search'
        ? 'search'
        : 'contacts',
  );
  const [draft, setDraft] = useState(initial),
    [query, setQuery] = useState(initial),
    [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [notice, setNotice] = useState('');
  const [detail, setDetail] = useState<ContactRow | null>(null),
    [sync, setSync] = useState(params.get('view') === 'sync');
  const lock = useRef(false);
  const status = usePersonalApi<components['schemas']['MessagingStatusResult']>(
    '/api/v1/me/messaging-status',
    { poll: 10000 },
  );
  const canCreateDirect =
    status.isSuccess &&
    status.data.allowedActions.some(
      (action) => action === 'CreateDirect' || action === 'CreateDirectWithAuthorizedRelationship',
    );
  const contacts = usePersonalApi<components['schemas']['UserContactPageResult']>(
    '/api/v1/contacts?' +
      new URLSearchParams({ q: query, page: String(page), pageSize: '20', favoritesOnly: 'false' }),
    { enabled: tab === 'contacts' },
  );
  const people = usePersonalApi<components['schemas']['PeopleSearchPageResult']>(
    '/api/v1/people/search?' +
      new URLSearchParams({ q: query.replace(/^@/, ''), page: String(page), pageSize: '20' }),
    { enabled: tab === 'search' && !!query },
  );
  function changeTab(next: typeof tab) {
    setTab(next);
    setQuery('');
    setDraft('');
    setPage(1);
    setError(undefined);
    setNotice('');
  }
  async function start(profile: Person) {
    if (
      lock.current ||
      !canCreateDirect ||
      !profile.canStartDirect ||
      profile.userId === session.user.id
    )
      return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const result = await startPersonalConversation(call, profile.userId);
      await cache.invalidateQueries({
        predicate: (item) =>
          item.queryKey.some(
            (key) => typeof key === 'string' && key.startsWith('/api/v1/conversations'),
          ),
      });
      router.push('/personal/messages/' + result.conversationId);
    } catch (e) {
      setError(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save(profile: Person) {
    if (lock.current || profile.userId === session.user.id) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const result = await call<components['schemas']['UserContactResult']>('/api/v1/contacts', {
        method: 'POST',
        body: JSON.stringify({
          contactUserId: profile.userId,
          savedName: null,
        } satisfies components['schemas']['SaveUserContactCommand']),
      });
      if (result.contactUserId !== profile.userId)
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      setNotice(uiText.text_c69ebbd6ae2f);
      setDetail(null);
      await cache.invalidateQueries({
        predicate: (item) =>
          item.queryKey.some(
            (key) =>
              typeof key === 'string' &&
              (key.startsWith('/api/v1/contacts') || key.startsWith('/api/v1/people')),
          ),
      });
    } catch (e) {
      setError(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const data = tab === 'contacts' ? contacts : people;
  const rows: ContactRow[] | undefined =
    tab === 'contacts'
      ? contacts.data?.items.map((contact) => ({
          profile: contact.profile,
          name: contact.savedName || contact.profile.displayName,
          contact,
        }))
      : people.data?.items.map((profile) => ({ profile, name: profile.displayName }));
  const contents = (
    <>
      {notice && (
        <p className={s.success} role="status">
          {notice}
        </p>
      )}
      {status.isError ? (
        <ErrorState error={status.error} onRetry={() => void status.refetch()} />
      ) : (
        status.data &&
        status.data.nextAction !== 'None' && (
          <section className={d.contactNotice} role="status">
            <p>
              {canCreateDirect
                ? uiText.text_1b9ffc2a9963
                : messagingNextLabels[status.data.nextAction]}
            </p>
            {status.data.nextAction === 'ProfileCompletionRequired' && (
              <Button asChild variant="outline">
                <Link href="/personal/profile/edit">{uiText.text_dc1e77f52af9}</Link>
              </Button>
            )}
          </section>
        )
      )}
      {!!error && !detail && <ErrorState error={error} />}
      {embedded && <h2 className={d.sectionTitle}>{text.people}</h2>}
      <section className={d.book} aria-label={tab === 'search' ? text.people : text.contactBook}>
        {!embedded && <h3>{tab === 'search' ? text.people : text.contactBook}</h3>}
        {tab === 'search' && !query ? (
          <EmptyState title={uiText.text_8e4123c40ba0} description={uiText.text_514b1fbad09d} />
        ) : data.isPending ? (
          <LoadingSkeleton />
        ) : data.isError ? (
          <ErrorState error={data.error} onRetry={() => void data.refetch()} />
        ) : !rows?.length ? (
          <EmptyState
            title={tab === 'contacts' ? uiText.text_8d1b81ec1aa1 : uiText.text_9620a4294e2d}
            description={tab === 'contacts' ? uiText.text_17f6af62f546 : uiText.text_dae5c09caaa2}
          />
        ) : (
          <div className={d.peopleRows}>
            {rows.map((row) => (
              <article className={d.person} key={row.profile.userId}>
                <button
                  type="button"
                  className={d.personMain}
                  aria-label={text.showContact(row.name)}
                  onClick={() => {
                    if (embedded)
                      router.push(
                        '/personal/contacts?person=' +
                          row.profile.userId +
                          '&from=' +
                          encodeURIComponent('/personal/messages?' + params),
                      );
                    else setDetail(row);
                    setError(undefined);
                  }}
                >
                  <ProfileAvatar
                    photo={row.profile.profilePhoto}
                    name={row.name}
                    className={d.personAvatar}
                  />
                  <span>
                    <strong dir="auto">{row.name}</strong>
                    <small>
                      <bdi dir="ltr">@{row.profile.username}</bdi>
                    </small>
                  </span>
                  <ChevronLeft size={18} />
                </button>
              </article>
            ))}
          </div>
        )}
        {(tab === 'contacts' || !!query) && data.data && (data.data.hasMore || page > 1) && (
          <div className={s.paging}>
            <Button
              size="icon"
              variant="outline"
              aria-label={uiText.text_a7009e9019ab}
              disabled={page <= 1 || data.isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronRight size={18} />
            </Button>
            <span>
              {uiText.text_2714496eef16}
              {number(page)}
            </span>
            <Button
              size="icon"
              variant="outline"
              aria-label={uiText.text_a0b6f49670b9}
              disabled={!data.data.hasMore || data.isFetching}
              onClick={() => setPage(page + 1)}
            >
              <ChevronLeft size={18} />
            </Button>
          </div>
        )}
      </section>
      {embedded && (
        <p className={d.contactNotice}>
          <Info size={20} />
          {text.searchPrivacy}
        </p>
      )}
    </>
  );
  const selected =
    detail ??
    (validPersonId && person.data?.userId.toLowerCase() === personId.toLowerCase()
      ? {
          profile: person.data,
          name: person.data.displayName,
          contact: contacts.data?.items.find((row) => row.contactUserId === personId),
        }
      : null);
  const startView = !!personId && !!params.get('from')?.startsWith('/personal/messages');
  if (!embedded && (selected || personId))
    return (
      <V5Scene
        id={startView ? 'MSG-03' : 'CON-08'}
        title={startView ? text.startConversation : (selected?.name ?? text.contactInformation)}
        subtitle={text.personalIdentity}
        back={
          detail
            ? '/personal/contacts'
            : (safeAuthReturnPath(params.get('from')) ?? '/personal/messages')
        }
        onBack={
          detail
            ? () => {
                setDetail(null);
                setError(undefined);
              }
            : undefined
        }
        backWithinPage={!!detail}
        kind="list"
        deep
      >
        {selected ? (
          <div className={d.personDetail}>
            <div className={d.personSummary}>
              <ProfileAvatar
                photo={selected.profile.profilePhoto}
                name={selected.name}
                className={d.detailAvatar}
              />
              <h2>{selected.name}</h2>
              <p>
                {selected.contact?.savedName ? text.savedContactNameHint : text.registeredContact}
              </p>
              {startView && (
                <>
                  <bdi dir="ltr">@{selected.profile.username}</bdi>
                  <p>{selected.profile.phoneNumber ?? text.phonePrivate}</p>
                </>
              )}
            </div>
            {!startView && (
              <dl>
                <div>
                  <dt>{text.publicName}</dt>
                  <dd>{selected.profile.displayName}</dd>
                </div>
                <div>
                  <dt>{text.username}</dt>
                  <dd>
                    <bdi dir="ltr">@{selected.profile.username}</bdi>
                  </dd>
                </div>
                {selected.profile.phoneNumber ? (
                  <div>
                    <dt>{text.publicPhone}</dt>
                    <dd>
                      <bdi dir="ltr">{selected.profile.phoneNumber}</bdi>
                    </dd>
                  </div>
                ) : (
                  <p>{text.phonePrivate}</p>
                )}
              </dl>
            )}
            {status.isError ? (
              <ErrorState error={status.error} onRetry={() => void status.refetch()} />
            ) : (
              status.data &&
              status.data.nextAction !== 'None' && (
                <p className={d.contactNotice}>{messagingNextLabels[status.data.nextAction]}</p>
              )
            )}
            <Button
              disabled={
                busy ||
                !canCreateDirect ||
                !selected.profile.canStartDirect ||
                selected.profile.userId === session.user.id
              }
              onClick={() => void start(selected.profile)}
            >
              <MessageCircle size={20} />
              {startView ? text.startPersonalConversation : uiText.text_51dd685556b8}
            </Button>
            {!selected.contact && !selected.profile.isSavedContact && (
              <Button variant="outline" disabled={busy} onClick={() => void save(selected.profile)}>
                {uiText.text_8cfe257aece4}
              </Button>
            )}
            {startView && (
              <Button asChild variant="outline">
                <Link href="/personal/contacts?view=add">{text.addContactByPhone}</Link>
              </Button>
            )}
            {!startView && selected.contact && (
              <ContactActions
                contact={selected.contact}
                triggerLabel={uiText.text_dae770ce3334}
                onChanged={() => {
                  void contacts.refetch();
                  setDetail(null);
                }}
              />
            )}
            {!!error && <ErrorState error={error} />}
          </div>
        ) : !validPersonId ? (
          <ErrorState error={new ApiError(400, { code: 'VALIDATION_ERROR' })} />
        ) : person.isError ? (
          <ErrorState error={person.error} onRetry={() => void person.refetch()} />
        ) : (
          <LoadingSkeleton />
        )}
      </V5Scene>
    );
  if (embedded)
    return (
      <div className={d.directoryContent} data-main-people-results>
        {contents}
      </div>
    );
  if (tab === 'add')
    return (
      <ContactPhoneForm
        onBack={() => changeTab('contacts')}
        onSaved={async () => {
          await cache.invalidateQueries({
            predicate: (item) =>
              item.queryKey.some(
                (key) => typeof key === 'string' && key.startsWith('/api/v1/contacts'),
              ),
          });
          changeTab('contacts');
          setNotice(uiText.text_c69ebbd6ae2f);
        }}
      />
    );
  return (
    <V5Scene
      id="CON-01"
      title={uiText.text_759044ca1d2d}
      subtitle={text.personalIdentity}
      back="/personal/messages"
      kind="list"
      deep
      headerTools={
        <Button asChild variant="ghost" size="icon">
          <Link href="/personal/notifications" aria-label={uiText.text_9f2a436a61f3}>
            <Bell size={21} />
          </Link>
        </Button>
      }
    >
      <div className={d.directoryContent} data-contacts-directory>
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(draft.trim());
            setPage(1);
          }}
        >
          <SearchField
            showEmptyClear
            aria-label={uiText.text_2c54ecc60e86}
            placeholder={text.contactSearch}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClear={() => {
              setDraft('');
              setQuery('');
              setPage(1);
            }}
            action={
              <button
                className={d.searchAction}
                type="submit"
                aria-label={uiText.text_2a93eb7f06ce}
              >
                <Search size={22} />
              </button>
            }
          />
        </form>
        <Button
          variant="outline"
          className={d.addContact}
          aria-label={uiText.text_5fde423d6a3f}
          onClick={() => changeTab('add')}
        >
          <Plus size={20} />
          {text.addContactByPhone}
        </Button>
        {contents}
        <button type="button" className={d.syncContact} onClick={() => setSync(true)}>
          <span className={d.syncIcon}>
            <RefreshCw size={22} />
          </span>
          <span>
            <strong>{text.syncContacts}</strong>
            <small>{text.syncHint}</small>
          </span>
          <ChevronLeft size={18} />
        </button>
        <Dialog open={sync} onOpenChange={setSync}>
          <DialogContent title={text.syncContacts}>
            <p>{text.syncUnavailable}</p>
          </DialogContent>
        </Dialog>
      </div>
    </V5Scene>
  );
}
function ContactActions({
  contact,
  onChanged,
  triggerLabel,
}: {
  contact: components['schemas']['UserContactResult'];
  onChanged: () => void;
  triggerLabel?: string;
}) {
  const { call } = usePersonal();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const [alias, setAlias] = useState(contact.savedName ?? ''),
    [favorite, setFavorite] = useState(contact.isFavorite);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) {
          setAlias(contact.savedName ?? '');
          setFavorite(contact.isFavorite);
          setError(undefined);
        }
        setOpen(value);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size={triggerLabel ? 'default' : 'icon'}
          variant={triggerLabel ? 'outline' : 'ghost'}
          aria-label={
            triggerLabel ??
            uiText.text_aa46bc41d37e + (contact.savedName || contact.profile.displayName)
          }
        >
          {triggerLabel ? (
            <>
              <Pencil size={20} />
              {triggerLabel}
            </>
          ) : (
            <MoreHorizontal size={20} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={uiClass(`${t.theme}`)}
        title={uiText.text_dae770ce3334}
        description={contact.savedName || contact.profile.displayName}
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(undefined);
            try {
              await call('/api/v1/contacts/' + contact.contactUserId, {
                method: 'PATCH',
                body: JSON.stringify({
                  savedName: alias.trim() || null,
                  isFavorite: favorite,
                  expectedVersion: contact.version,
                } satisfies components['schemas']['UpdateUserContactCommand']),
              });
              onChanged();
              setOpen(false);
            } catch (error) {
              setError(error);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className={uiClass(s.singleField)}>
            {uiText.text_796ebc9a8741}
            <NativeInput
              value={alias}
              disabled={busy}
              onChange={(event) => setAlias(event.target.value)}
            />
          </label>
          <label className={uiClass(s.selectContact)}>
            <NativeInput
              type="checkbox"
              checked={favorite}
              disabled={busy}
              onChange={(event) => setFavorite(event.target.checked)}
            />
            <span>{uiText.text_c4749ec2c895}</span>
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? uiText.text_b5ef00b1806f : uiText.text_b7d4e6239152}
          </Button>
        </form>
        <p className={uiClass(s.muted)}>{uiText.text_d5499ef00124}</p>
        {!!error && <ErrorState error={error} />}
        {error instanceof ApiError && [409, 412].includes(error.status) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChanged();
              setOpen(false);
            }}
          >
            {uiText.text_b41fe8563d7d}
          </Button>
        )}
        <div className={uiClass(s.actions)}>
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(undefined);
              try {
                await call('/api/v1/contacts/' + contact.contactUserId, { method: 'DELETE' });
                setOpen(false);
                onChanged();
              } catch (e) {
                setError(e);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Trash2 size={17} />
            {uiText.text_539f52498828}
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(undefined);
              try {
                await call('/api/v1/messaging/blocks/' + contact.contactUserId, { method: 'POST' });
                await cache.invalidateQueries({
                  predicate: (query) =>
                    query.queryKey.some(
                      (key) =>
                        typeof key === 'string' && key.startsWith('/api/v1/messaging/blocks'),
                    ),
                });
                setOpen(false);
                onChanged();
              } catch (e) {
                setError(e);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Ban size={17} />
            {uiText.text_24417444e3d1}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export { BlockedAccountsPage, MessagingPrivacyPage } from './privacy';
