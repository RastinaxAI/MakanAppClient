'use client';
import { uiClass } from '@/components/v5/classes';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellOff, Info, Laptop, Smartphone } from 'lucide-react';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Note, V4Row } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { ApiError } from '@/lib/api/errors';
import {
  v5NotificationDevices as t,
  text_313cbecb4dd3 as close,
  text_fa7af603d430 as cancel,
  text_28d94a2716a9 as previous,
  text_a381bb5c90e2 as next,
  text_ab3c684df5df as personalWorkspace,
} from '@/content/fa';
import { usePersonal, usePersonalApi } from './provider';
import { useNotificationDevice } from './use-notification-device';
import {
  activePushDevice,
  currentPushDevice,
  findPushDevice,
  pushDevicePath,
  pushPagePath,
  samePushIdentity,
  validPushPage,
  type PushDevice,
  type PushPage,
} from './notification-device-model';
import { NotificationPermissionPreferences } from './notification-settings';

const root = '/personal/settings/notifications';
const platformTitle = (row: PushDevice, current: boolean) =>
  current
    ? t.current
    : row.platform === 'Android'
      ? t.android
      : row.platform === 'Ios'
        ? t.ios
        : t.browser;
function DeviceMenu() {
  return (
    <V4List>
      <V4Row title={t.title} href={root + '/device'} />
      <V4Row title={t.devices} href={root + '/devices'} />
      <V4Row title={t.preferences} href={root + '/device?view=preferences'} />
    </V4List>
  );
}
export function NotificationDevice({ preferences = false }: { preferences?: boolean }) {
  const { session } = usePersonal();
  const device = useNotificationDevice();
  const [guide, setGuide] = useState(false);
  const denied = device.permission === 'denied';
  const loading = device.checking || device.configuration.isPending;
  const enableDisabled =
    loading ||
    device.busy ||
    device.configuration.isError ||
    !device.configuration.data?.isConfigured ||
    !device.supported ||
    !device.ready ||
    device.permission === 'unsupported' ||
    !!device.association?.uncertain ||
    device.active;
  return (
    <V5Scene
      id={preferences ? 'RX-040' : denied ? 'MK-435' : 'MK-347'}
      title={preferences ? t.preferenceTitle : t.title}
      subtitle={t.account(session.user.firstName || session.user.displayName)}
      contextTitle={personalWorkspace}
      back={root}
      menu={<DeviceMenu />}
      actions={
        <Button
          disabled={!denied && !preferences && enableDisabled}
          aria-busy={device.busy}
          onClick={denied || preferences ? () => setGuide(true) : device.enable}
        >
          {preferences ? t.guideTitle : denied ? t.guide : t.enable}
        </Button>
      }
    >
      {(!denied || preferences) && (
        <section className={uiClass('card hero v5-hero')}>
          <h3>{preferences ? t.title : t.current}</h3>
          <p>
            {preferences
              ? device.active
                ? t.registered
                : device.permission === 'granted'
                  ? t.granted
                  : t.permissionOff
              : t.status}
          </p>
        </section>
      )}
      {preferences && <NotificationPermissionPreferences />}
      <div className={uiClass('alert' + (denied || preferences ? ' warn' : ''))} role="status">
        {denied || preferences ? (
          <BellOff size={24} aria-hidden="true" />
        ) : (
          <Info size={24} aria-hidden="true" />
        )}
        <div>
          {preferences
            ? t.bothNeeded
            : denied
              ? t.denied
              : loading
                ? t.preparing
                : device.active
                  ? t.registered
                  : device.permission === 'granted'
                    ? t.granted
                    : device.permission === 'unsupported'
                      ? t.unsupported
                      : t.defaultPermission}
        </div>
      </div>
      {!preferences && (
        <p className={uiClass('policy')}>{denied ? t.deniedPolicy : t.permissionPolicy}</p>
      )}
      {!loading && (!device.supported || device.pwaError) && <V4Note>{t.unsupported}</V4Note>}
      {device.configuration.data?.isConfigured === false && <V4Note>{t.serviceUnavailable}</V4Note>}
      {(device.error || device.configuration.isError) && (
        <ErrorState error={device.error || device.configuration.error} onRetry={device.refresh} />
      )}
      {device.localProblem && (
        <p role="status" className={uiClass('policy')}>
          {t[device.localProblem]}
        </p>
      )}
      {device.association?.uncertain && (
        <div className={uiClass('stack')} data-push-uncertain>
          <p role="status" className={uiClass('policy')}>
            {t.uncertain}
          </p>
          {!device.association.registrationId && (
            <p className={uiClass('policy')}>{t.unknownRegistration}</p>
          )}
          <Button asChild variant="outline">
            <Link href={root + '/devices'}>{t.devices}</Link>
          </Button>
        </div>
      )}
      {(device.active || device.association || device.localProblem) && (
        <Button variant="outline" disabled={device.busy} onClick={device.refresh}>
          {t.refresh}
        </Button>
      )}
      <Dialog open={guide} onOpenChange={setGuide}>
        <DialogContent title={t.guideTitle} description={t.guideIntro}>
          <div className={uiClass('stack')}>
            <p className={uiClass('policy')}>{t.chrome}</p>
            <Button asChild variant="outline">
              <a
                href="https://support.google.com/chrome/answer/3220216"
                target="_blank"
                rel="noreferrer"
              >
                {t.chromeHelp}
              </a>
            </Button>
            <p className={uiClass('policy')}>{t.firefox}</p>
            <Button asChild variant="outline">
              <a
                href="https://support.mozilla.org/en-US/kb/push-notifications-firefox"
                target="_blank"
                rel="noreferrer"
              >
                {t.firefoxHelp}
              </a>
            </Button>
            <p className={uiClass('policy')}>{t.safari}</p>
            <Button asChild variant="outline">
              <a
                href="https://support.apple.com/guide/safari/ibrwe2159f50/mac"
                target="_blank"
                rel="noreferrer"
              >
                {t.safariHelp}
              </a>
            </Button>
          </div>
          <div className={uiClass('confirm-actions')}>
            <Button onClick={() => setGuide(false)}>{close}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </V5Scene>
  );
}

export function NotificationDevices() {
  const { session, call } = usePersonal();
  const device = useNotificationDevice();
  const [page, setPage] = useViewState(
    session.user.id + ':notification-devices:page',
    1,
    (value): value is number => Number.isInteger(value) && Number(value) > 0,
  );
  const query = usePersonalApi<PushPage>(pushPagePath(page));
  const [selected, setSelected] = useState<{ row: PushDevice; title: string }>();
  const [removed, setRemoved] = useState(false);
  const data = query.data;
  const invalid = data && !validPushPage(data, page);
  const rows = data && !invalid ? data.items : [];
  const current = currentPushDevice(device.association, device.fingerprint, rows);
  const dismiss = () => setSelected(undefined);
  return (
    <V5Scene
      id="MK-348"
      title={t.devices}
      subtitle={t.account(session.user.firstName || session.user.displayName)}
      contextTitle={personalWorkspace}
      back={root}
      menu={<DeviceMenu />}
      overlayActive={!!selected}
      summary={rows.map((row) => ({
        label: platformTitle(row, row.id === current?.id),
        value: row.platform === 'Web' ? t.webRegistered : t.deviceRegistered,
      }))}
    >
      {removed && (
        <p role="status" className={uiClass('policy')}>
          {t.removed}
        </p>
      )}
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.isError || invalid ? (
        <ErrorState
          error={invalid ? new ApiError(502, { code: 'CONTRACT_MISMATCH' }) : query.error}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <>
          <V4List>
            {rows.length ? (
              rows.map((row) => {
                const title = platformTitle(row, row.id === current?.id);
                const duplicate =
                  rows.filter((other) => other.platform === row.platform).length > 1;
                return (
                  <V4Row
                    key={row.id}
                    title={title}
                    ariaLabel={title}
                    testId={'push-device-' + row.id}
                    icon={row.platform === 'Web' ? <Laptop size={24} /> : <Smartphone size={24} />}
                    description={
                      <>
                        {row.platform === 'Web' ? t.webRegistered : t.deviceRegistered}
                        {duplicate && (
                          <>
                            <br />
                            {t.created}:{' '}
                            <bdi>{new Date(row.createdAtUtc).toLocaleString('fa-IR')}</bdi>
                          </>
                        )}
                      </>
                    }
                    end={
                      <span className={uiClass('badge')}>
                        {activePushDevice(row) ? t.active : t.inactive}
                      </span>
                    }
                    endInteractive={false}
                    onClick={() => {
                      setRemoved(false);
                      setSelected({ row, title });
                    }}
                  />
                );
              })
            ) : (
              <EmptyState title={data?.totalCount === 0 ? t.empty : t.emptyPage} />
            )}
          </V4List>
          <p className={uiClass('policy')}>{t.listPolicy}</p>
        </>
      )}
      {(page > 1 || (!!data && page * data.pageSize < data.totalCount)) && (
        <nav className={uiClass('button-row')} aria-label={t.devices}>
          <Button
            variant="outline"
            disabled={page === 1 || query.isPending}
            onClick={() => setPage(page - 1)}
          >
            {previous}
          </Button>
          <span>{page.toLocaleString('fa-IR')}</span>
          <Button
            variant="outline"
            disabled={!data || page * data.pageSize >= data.totalCount || query.isPending}
            onClick={() => setPage(page + 1)}
          >
            {next}
          </Button>
        </nav>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) dismiss();
        }}
      >
        {selected && (
          <DeletePushDevice
            key={selected.row.id}
            snapshot={selected.row}
            title={selected.title}
            read={() => findPushDevice(call, selected.row.id)}
            onRead={() => {
              void query.refetch();
              void device.refresh();
            }}
            remove={async () => {
              try {
                await call(pushDevicePath + '/' + selected.row.id, {
                  method: 'DELETE',
                  expectedStatus: 204,
                });
                device.disableLocal(selected.row.id);
              } finally {
                // A dismissed dialog cannot prevent a read after its pending
                // request settles. This never retries DELETE or claims success.
                void query.refetch();
                void device.refresh();
              }
            }}
            onCancel={dismiss}
            onRemoved={() => {
              setRemoved(true);
              dismiss();
            }}
          />
        )}
      </Dialog>
    </V5Scene>
  );
}
function DeletePushDevice({
  snapshot,
  title,
  read,
  onRead,
  remove,
  onCancel,
  onRemoved,
}: {
  snapshot: PushDevice;
  title: string;
  read: () => Promise<PushDevice | undefined>;
  onRead: () => void;
  remove: () => Promise<void>;
  onCancel: () => void;
  onRemoved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [changed, setChanged] = useState(false);
  const [inactive, setInactive] = useState(false);
  const lock = useRef(false);
  const committed = useRef(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  async function review() {
    const row = await read();
    if (!alive.current) return false;
    if (!row || !samePushIdentity(row, snapshot)) {
      onRead();
      setChanged(true);
      return false;
    }
    if (!activePushDevice(row)) {
      onRead();
      setInactive(true);
      return false;
    }
    return true;
  }
  return (
    <DialogContent
      title={t.deleteTitle}
      description={t.deletePolicy}
      descriptionHidden
      scenario="MK-349"
      side
      onCloseAutoFocus={(event) => {
        if (
          committed.current ||
          !document.querySelector(`[data-testid="push-device-${snapshot.id}"]`)
        ) {
          event.preventDefault();
          document.querySelector<HTMLElement>('.v5-scene .rx-head h1')?.focus();
        }
      }}
    >
      <p className={uiClass('policy dialog-policy')}>{t.deletePolicy}</p>
      <dl className={uiClass('v5-dialog-summary')}>
        <div>
          <dt>{t.destination}</dt>
          <dd>{title}</dd>
        </div>
      </dl>
      {!!error && <ErrorState error={error} />}
      {changed && <p role="status">{t.changed}</p>}
      {inactive && <p role="status">{t.noLongerActive}</p>}
      <div className={uiClass('confirm-actions')}>
        {error ? (
          <Button
            disabled={busy}
            onClick={async () => {
              if (lock.current) return;
              lock.current = true;
              setBusy(true);
              try {
                await review();
                setError(undefined);
              } catch (problem) {
                setError(problem);
              } finally {
                lock.current = false;
                setBusy(false);
              }
            }}
          >
            {t.refresh}
          </Button>
        ) : (
          !inactive &&
          !changed && (
            <Button
              variant="destructive"
              disabled={busy}
              aria-busy={busy}
              onClick={async () => {
                if (lock.current) return;
                lock.current = true;
                setBusy(true);
                try {
                  if (await review()) {
                    await remove();
                    if (alive.current) {
                      committed.current = true;
                      onRemoved();
                    }
                  }
                } catch (problem) {
                  if (alive.current) setError(problem);
                } finally {
                  lock.current = false;
                  if (alive.current) setBusy(false);
                }
              }}
            >
              {t.delete}
            </Button>
          )
        )}
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          {cancel}
        </Button>
      </div>
    </DialogContent>
  );
}
