'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ProductContext, V5Scene } from '@/components/v5/scene';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { date } from '@/lib/formatting';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { ClipboardList, MessageSquare, Bell, ChevronLeft, CheckCheck } from 'lucide-react';
import { usePersonal, usePersonalApi } from './provider';
import { Pager } from './school/shared';
import s from './account-services.module.css';
import centerStyle from './notification-center.module.css';
type S = components['schemas'];
export function NotificationsPage() {
  const { call, session } = usePersonal(),
    [page, setPage] = useState(1),
    [unread, setUnread] = useState(false),
    [busy, setBusy] = useState<string>(),
    [error, setError] = useState<unknown>();
  const q = usePersonalApi<S['NotificationPage']>(
    '/api/v1/notifications?' +
      new URLSearchParams({ Page: String(page), PageSize: '20', UnreadOnly: String(unread) }),
    { poll: 15000 },
  );
  return (
    <V5Scene
      id="MK-344"
      title={uiText.text_9f2a436a61f3}
      back="/personal/profile"
      menu={
        <Button asChild variant="outline">
          <Link href="/personal/settings/notifications">{uiText.text_49a3bb5d02f6}</Link>
        </Button>
      }
      context={<NotificationContext items={q.data?.items ?? []} />}
    >
      <div className={uiClass('chips')}>
        <button
          type="button"
          className={uiClass('chip ' + (!unread ? 'on' : ''))}
          aria-pressed={!unread}
          onClick={() => {
            setUnread(false);
            setPage(1);
          }}
        >
          {uiText.text_15270886eadd}
        </button>
        <label className={uiClass(centerStyle.filter)} data-active={unread}>
          <NativeInput
            type="checkbox"
            aria-label={uiText.text_98328e62b409}
            checked={unread}
            onChange={(e) => {
              setPage(1);
              setUnread(e.target.checked);
            }}
          />
          <span>{uiText.text_b3e662eb0f81}</span>
        </label>
      </div>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <div className={uiClass('list')}>
            {q.data.items.length ? (
              q.data.items.map((item) => {
                const sameContext =
                  !item.organizationId || item.organizationId === session.context.organizationId;
                const target =
                  item.resourceType === 'Conversation'
                    ? '/personal/messages/' + item.resourceId
                    : item.resourceType === 'Assignment'
                      ? '/personal/education/assignments/' + item.resourceId
                      : item.resourceType === 'Exam'
                        ? '/personal/education/exams/' + item.resourceId
                        : null;
                return (
                  <article
                    key={item.id}
                    className={uiClass('row')}
                    data-notification-unread={!item.readAtUtc}
                  >
                    <span className={uiClass('tile-icon')}>
                      {item.resourceType === 'Conversation' ? (
                        <MessageSquare size={22} />
                      ) : ['Assignment', 'Exam'].includes(item.resourceType ?? '') ? (
                        <ClipboardList size={22} />
                      ) : (
                        <Bell size={22} />
                      )}
                    </span>
                    <div className={uiClass('grow')}>
                      <h2 className={uiClass(centerStyle.title)}>{item.title}</h2>
                      <p>
                        {item.body}
                        <time className={uiClass(centerStyle.time)} dateTime={item.createdAtUtc}>
                          {' '}
                          · {date(item.createdAtUtc, true)}
                        </time>
                      </p>
                      {!sameContext && (
                        <p className={uiClass(s.muted)}>{uiText.text_f707420decb3}</p>
                      )}
                    </div>
                    <div className={uiClass(centerStyle.actions)}>
                      {target && sameContext && (
                        <Button asChild variant="ghost" size="icon">
                          <Link
                            href={target}
                            aria-label={uiText.text_515ee981f4a0}
                            title={uiText.text_515ee981f4a0}
                          >
                            <ChevronLeft size={18} />
                          </Link>
                        </Button>
                      )}
                      {!item.readAtUtc && (
                        <Button
                          disabled={!!busy}
                          size="icon"
                          variant="ghost"
                          aria-label={uiText.text_cb1e79eee77e}
                          title={uiText.text_cb1e79eee77e}
                          onClick={async () => {
                            if (busy) return;
                            setBusy(item.id);
                            setError(undefined);
                            try {
                              await call(`/api/v1/notifications/${item.id}/read`, {
                                method: 'POST',
                              });
                              await q.refetch();
                            } catch (problem) {
                              setError(problem);
                            } finally {
                              setBusy(undefined);
                            }
                          }}
                        >
                          <CheckCheck size={19} />
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title={uiText.text_1999b6d24abb} />
            )}
          </div>
          {(page > 1 || q.data.totalCount > q.data.pageSize) && (
            <Pager
              page={page}
              size={q.data.pageSize}
              total={q.data.totalCount}
              onChange={setPage}
            />
          )}
        </>
      )}
      {!!error && <ErrorState error={error} />}
    </V5Scene>
  );
}

function NotificationContext({ items }: { items: S['NotificationPage']['items'] }) {
  const place = useContext(ProductContext);
  return (
    <>
      <div className={uiClass('context-tag')}>{uiText.v5Product.context}</div>
      <h3>{place.title}</h3>
      <p>{place.role}</p>
      {items.slice(0, 3).map((item) => (
        <div className={uiClass('context-item')} key={item.id}>
          <b>{item.title}</b>
          <div className={uiClass('context-value')}>{item.body}</div>
        </div>
      ))}
      <div className={uiClass('context-item')}>
        <p>{uiText.v5Product.contextBackPolicy}</p>
      </div>
    </>
  );
}
