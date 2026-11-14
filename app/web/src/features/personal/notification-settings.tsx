'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import {
  SceneMenuClose,
  useSceneContextSummary,
  useSceneFormAction,
  useSceneMenuTools,
} from '@/components/v5/form-actions';
import { V4Field, V4List, V4Note, V4Row, V4SwitchRow } from '@/components/v4/page';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { Button } from '@/components/ui/button';
import { TimeInput, TimeZoneInput } from '@/components/ui/time-input';
import { canonicalTime, timeInputLabel, timeZoneLabel } from '@/lib/time-input';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import {
  Bell,
  MessageSquare,
  ClipboardList,
  CalendarDays,
  Mail,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePersonal, usePersonalApi } from './provider';
import {
  acknowledgedPreference,
  notificationPreferenceBody,
  type NotificationPreference,
} from './notification-preference-model';
import s from './account-services.module.css';
type S = components['schemas'];
const t = uiText.v5Notifications;
export const notificationLabels: Record<S['NotificationPreferenceCategory'], string> = {
  Messages: uiText.navigation_messages,
  Assignments: uiText.text_e8fed4d47d62,
  Results: uiText.text_aae3c4a0c257,
  Sessions: uiText.text_92797051c40c,
  Reports: uiText.text_5dc634b07b21,
  Invitations: uiText.text_016c18389868,
  AccountSecurity: uiText.text_36e2e9a2e4a1,
};
const categoryIcons = {
  Messages: MessageSquare,
  Assignments: ClipboardList,
  Results: ClipboardList,
  Sessions: CalendarDays,
  Reports: BarChart3,
  Invitations: Mail,
  AccountSecurity: ShieldCheck,
};
export function NotificationSettings({ category }: { category?: string }) {
  const { session } = usePersonal(),
    scope = useSearchParams().get('scope') === 'organization' ? 'organization' : 'personal';
  const org = scope === 'organization' ? session.context.organizationId : null;
  const suffix = org ? '?organizationId=' + org : '',
    path = '/api/v1/notification-preferences' + suffix;
  const q = usePersonalApi<S['NotificationPreferenceItem'][]>(path, {
    enabled: scope === 'personal' || !!org,
  });
  const push = usePersonalApi<S['WebPushClientConfiguration']>(
    '/api/v1/notifications/devices/web-push/configuration',
  );
  if (
    (scope === 'organization' && !org) ||
    (category && !Object.hasOwn(notificationLabels, category))
  )
    return <ErrorState error={new ApiError(404)} />;
  const item = q.data?.find((row) => row.category === category);
  return (
    <V5Scene
      id={category ? 'MK-346' : 'MK-345'}
      title={
        category
          ? t.categoryTitle(notificationLabels[category as keyof typeof notificationLabels])
          : uiText.text_940319dcd7db
      }
      subtitle={
        category
          ? (org ? uiText.text_b05e4b9892e2 : uiText.text_d034f3bcfe7f) +
            ' · ' +
            (session.user.firstName || session.user.displayName)
          : org
            ? uiText.text_b05e4b9892e2
            : uiText.text_d034f3bcfe7f
      }
      back={
        category
          ? `/personal/settings/notifications?scope=${scope}`
          : '/personal/profile/preferences'
      }
      menu={
        <V4List>
          <V4Row
            title={uiText.v5NotificationDevices.title}
            href="/personal/settings/notifications/device"
          />
          <V4Row
            title={uiText.v5NotificationDevices.devices}
            href="/personal/settings/notifications/devices"
          />
          <V4Row
            title={uiText.v5NotificationDevices.preferences}
            href="/personal/settings/notifications/device?view=preferences"
          />
        </V4List>
      }
    >
      {push.data?.isConfigured === false && (
        <div className={uiClass('alert')} role="status">
          <Bell size={19} />
          <p>{uiText.vnext.pushUnavailable}</p>
        </div>
      )}
      {!category && !!session.context.organizationId && (
        <nav className={uiClass(s.scope)} aria-label={uiText.text_327a658aba96}>
          <Link
            href="/personal/settings/notifications?scope=personal"
            aria-current={scope === 'personal' ? 'page' : undefined}
          >
            {uiText.text_d034f3bcfe7f}
          </Link>
          {session.context.organizationId && (
            <Link
              href="/personal/settings/notifications?scope=organization"
              aria-current={scope === 'organization' ? 'page' : undefined}
            >
              {uiText.text_b05e4b9892e2}
            </Link>
          )}
        </nav>
      )}
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError && !q.data ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data?.some(
          (row) => row.organizationId !== org || row.scope !== (org ? 'Organization' : 'Personal'),
        ) ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : category ? (
        item ? (
          <PreferenceForm
            key={scope + ':' + category}
            original={item}
            suffix={suffix}
            reload={async () => {
              const r = await q.refetch();
              if (r.isError) throw r.error;
              const row = r.data?.find((row) => row.category === category);
              if (
                row &&
                (row.organizationId !== org || row.scope !== (org ? 'Organization' : 'Personal'))
              )
                throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
              return row;
            }}
          />
        ) : (
          <EmptyState title={uiText.text_a1e394cdbcf2} />
        )
      ) : (
        <V4List>
          {q.data?.length ? (
            q.data.map((row) => {
              const Icon = categoryIcons[row.category];
              return (
                <V4Row
                  key={row.category}
                  href={`/personal/settings/notifications/${row.category}?scope=${scope}`}
                  title={notificationLabels[row.category]}
                  icon={<Icon size={22} />}
                  description={
                    <>
                      {uiText.text_b8451239c1bb}
                      {row.inAppEnabled ? uiText.text_a3fa2a3ffcb9 : uiText.text_4e67bd8e3482}
                      {uiText.text_de7d3b6c7249}{' '}
                      {row.pushEnabled ? uiText.text_a3fa2a3ffcb9 : uiText.text_4e67bd8e3482}
                      {uiText.text_86642a4557c6}{' '}
                      {row.smsEnabled ? uiText.text_a3fa2a3ffcb9 : uiText.text_4e67bd8e3482}
                      {row.isMandatory && (
                        <span className={uiClass(s.badge)}>{uiText.text_fd171c24dcfc}</span>
                      )}
                    </>
                  }
                />
              );
            })
          ) : (
            <EmptyState title={uiText.text_63693d28fdf3} />
          )}
        </V4List>
      )}
    </V5Scene>
  );
}
function PreferenceForm({
  original,
  suffix,
  reload,
}: {
  original: S['NotificationPreferenceItem'];
  suffix: string;
  reload: () => Promise<S['NotificationPreferenceItem'] | undefined>;
}) {
  const formId = useId();
  const { call } = usePersonal();
  const closeMenu = useContext(SceneMenuClose);
  const [baseline, setBaseline] = useState(original),
    [values, setValues] = useState(original),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  useUnsavedChanges(dirty);
  const saveTitle = busy
    ? uiText.text_b5ef00b1806f
    : original.category === 'Assignments'
      ? t.saveAssignments
      : uiText.text_1d615f338733;
  const saveAction = useMemo(
    () => (
      <Button type="submit" form={formId} disabled={busy || !dirty} aria-busy={busy}>
        {saveTitle}
      </Button>
    ),
    [formId, busy, dirty, saveTitle],
  );
  const actionPresented = useSceneFormAction(saveAction);
  const refresh = useCallback(async () => {
    if (lock.current || (dirty && !window.confirm(uiText.text_e00522c63330))) return;
    closeMenu?.();
    lock.current = true;
    setBusy(true);
    try {
      const row = await reload();
      if (row) {
        setValues(row);
        setBaseline(row);
        setError(undefined);
        setSaved(false);
      }
    } catch (problem) {
      setError(problem);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [closeMenu, dirty, reload]);
  const refreshAction = useMemo(
    () => (
      <Button type="button" variant="outline" disabled={busy} onClick={refresh}>
        {uiText.text_aae95f355460}
      </Button>
    ),
    [busy, refresh],
  );
  const refreshPresented = useSceneMenuTools(refreshAction);
  useSceneContextSummary(
    values.quietHoursEnabled
      ? [
          {
            label: uiText.text_631f359ae660,
            value: timeInputLabel(values.quietHoursStartLocal),
          },
          { label: uiText.text_988da0ee1c79, value: timeInputLabel(values.quietHoursEndLocal) },
          {
            label: uiText.text_9547b882b1cf,
            value: timeZoneLabel(values.timeZoneId),
          },
        ]
      : [
          { label: uiText.text_8c12a8350a0e, value: values.pushEnabled ? t.enabled : t.disabled },
          { label: uiText.text_c7362666bdce, value: values.smsEnabled ? t.enabled : t.disabled },
          { label: t.quietHours, value: t.disabled },
        ],
  );
  const set = <K extends keyof S['NotificationPreferenceItem']>(
    key: K,
    value: S['NotificationPreferenceItem'][K],
  ) => {
    setSaved(false);
    setValues((old) => ({ ...old, [key]: value }));
  };
  return (
    <form
      id={formId}
      className={uiClass('v5-native-form')}
      data-notification-preference-form
      onSubmit={async (e) => {
        e.preventDefault();
        if (lock.current || !dirty) return;
        if (
          values.quietHoursEnabled &&
          (!canonicalTime(values.quietHoursStartLocal) || !canonicalTime(values.quietHoursEndLocal))
        ) {
          e.currentTarget.reportValidity();
          return;
        }
        lock.current = true;
        setBusy(true);
        setSaved(false);
        setError(undefined);
        try {
          const body = notificationPreferenceBody(values, baseline.rowVersion);
          const result = await call<S['NotificationPreferenceItem']>(
            '/api/v1/notification-preferences/' + baseline.category + suffix,
            { method: 'PUT', expectedStatus: 200, body: JSON.stringify(body) },
          );
          if (!acknowledgedPreference(result, original, body))
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          setBaseline(result);
          setValues(result);
          setSaved(true);
          await reload().catch(setError);
        } catch (problem) {
          setError(problem);
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <V4List>
        <V4SwitchRow
          title={uiText.text_8c12a8350a0e}
          description={t.pushHint}
          checked={values.pushEnabled}
          disabled={busy || !baseline.canDisablePush}
          onCheckedChange={(checked) => set('pushEnabled', checked)}
        />
        <V4SwitchRow
          title={uiText.text_c7362666bdce}
          description={t.smsHint}
          checked={values.smsEnabled}
          disabled={busy || !baseline.canDisableSms}
          onCheckedChange={(checked) => set('smsEnabled', checked)}
        />
        <V4SwitchRow
          title={t.quietHours}
          description={t.quietHint}
          checked={values.quietHoursEnabled}
          disabled={busy}
          onCheckedChange={(checked) => {
            set('quietHoursEnabled', checked);
            if (checked && !values.timeZoneId)
              set('timeZoneId', Intl.DateTimeFormat().resolvedOptions().timeZone);
          }}
        />
      </V4List>
      {values.quietHoursEnabled && (
        <fieldset className={uiClass('v5-native-fields')} disabled={busy}>
          <V4Field label={uiText.text_631f359ae660}>
            <TimeInput
              required
              value={values.quietHoursStartLocal}
              onValueChange={(value) =>
                set('quietHoursStartLocal', value ? canonicalTime(value) || value : null)
              }
            />
          </V4Field>
          <V4Field label={uiText.text_988da0ee1c79}>
            <TimeInput
              required
              value={values.quietHoursEndLocal}
              onValueChange={(value) =>
                set('quietHoursEndLocal', value ? canonicalTime(value) || value : null)
              }
            />
          </V4Field>
          <V4Field label={uiText.text_9547b882b1cf}>
            <TimeZoneInput
              required
              value={values.timeZoneId}
              onValueChange={(value) => set('timeZoneId', value)}
            />
          </V4Field>
        </fieldset>
      )}
      {baseline.isMandatory && <V4Note>{uiText.text_d79df76cab90}</V4Note>}
      {!!error && <ErrorState error={error} />}
      {saved && (
        <p role="status" className={uiClass(s.badge)}>
          {uiText.text_083a0ab6b295}
        </p>
      )}
      {!actionPresented && saveAction}
      {!refreshPresented && refreshAction}
    </form>
  );
}

/** Two actual account preferences, independent from the browser's permission. */
export function NotificationPermissionPreferences() {
  const query = usePersonalApi<NotificationPreference[]>('/api/v1/notification-preferences');
  const rows = query.data?.filter((row) => ['Messages', 'Assignments'].includes(row.category));
  const valid =
    rows?.length === 2 &&
    new Set(rows.map((row) => row.category)).size === 2 &&
    rows.every((row) => row.scope === 'Personal' && row.organizationId === null);
  useSceneContextSummary(
    valid
      ? rows.map((row) => ({
          label: t.categoryTitle(notificationLabels[row.category]),
          value: row.pushEnabled
            ? uiText.v5NotificationDevices.accountOn
            : uiText.v5NotificationDevices.accountOff,
        }))
      : [],
    !query.isError,
  );
  if (query.isPending) return <LoadingSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!valid) return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  return (
    <V4List>
      {rows.map((row) => (
        <AccountPushSwitch
          key={row.category}
          original={row}
          reload={async () => {
            const result = await query.refetch();
            if (result.isError) throw result.error;
            return result.data?.find((entry) => entry.category === row.category);
          }}
        />
      ))}
    </V4List>
  );
}
function AccountPushSwitch({
  original,
  reload,
}: {
  original: NotificationPreference;
  reload: () => Promise<NotificationPreference | undefined>;
}) {
  const { call } = usePersonal();
  const [baseline, setBaseline] = useState(original);
  const [checked, setChecked] = useState(original.pushEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const lock = useRef(false),
    alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  // A background refresh must not remount a switch and erase an unacknowledged save.
  // Only confirmed idle state follows new server values; an uncertain save requires review.
  useEffect(() => {
    if (lock.current || busy || error) return;
    setBaseline(original);
    setChecked(original.pushEnabled);
  }, [original, busy, error]);
  return (
    <>
      <V4SwitchRow
        title={t.categoryTitle(notificationLabels[original.category])}
        description={
          checked ? uiText.v5NotificationDevices.accountOn : uiText.v5NotificationDevices.accountOff
        }
        checked={checked}
        disabled={busy || !!error || (!baseline.canDisablePush && baseline.pushEnabled)}
        onCheckedChange={async (value) => {
          if (lock.current) return;
          lock.current = true;
          setBusy(true);
          setChecked(value);
          const body = notificationPreferenceBody(
            { ...baseline, pushEnabled: value },
            baseline.rowVersion,
            true,
          );
          try {
            const result = await call<NotificationPreference>(
              '/api/v1/notification-preferences/' + baseline.category,
              { method: 'PUT', expectedStatus: 200, body: JSON.stringify(body) },
            );
            if (!alive.current) return;
            if (!acknowledgedPreference(result, original, body))
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            setBaseline(result);
            setChecked(result.pushEnabled);
            await reload();
          } catch (problem) {
            if (alive.current) setError(problem);
          } finally {
            lock.current = false;
            if (alive.current) setBusy(false);
          }
        }}
      />
      {!!error && <ErrorState error={error} />}
      {!!error && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            try {
              const row = await reload();
              if (!alive.current) return;
              if (
                !row ||
                row.category !== original.category ||
                row.scope !== 'Personal' ||
                row.organizationId !== null
              )
                throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
              setBaseline(row);
              setChecked(row.pushEnabled);
              setError(undefined);
            } catch (problem) {
              if (alive.current) setError(problem);
            } finally {
              lock.current = false;
              if (alive.current) setBusy(false);
            }
          }}
        >
          {uiText.v5NotificationDevices.reviewPreference}
        </Button>
      )}
    </>
  );
}
