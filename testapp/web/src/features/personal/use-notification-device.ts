'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { usePwa } from '@/features/pwa/provider';
import { usePersonal, usePersonalApi } from './provider';
import {
  acknowledgedWebPush,
  activePushDevice,
  findPushDevice,
  pushDevicePath,
  readPushAssociation,
  sameApplicationKey,
  storePushAssociation,
  subscriptionFingerprint,
  vapidApplicationKey,
  webPushBody,
  type PushAcknowledgment,
  type PushAssociation,
  type PushDevice,
} from './notification-device-model';

export function useNotificationDevice() {
  const { session, call } = usePersonal();
  const cache = useQueryClient();
  const pwa = usePwa();
  const configuration = usePersonalApi<components['schemas']['WebPushClientConfiguration']>(
    pushDevicePath + '/web-push/configuration',
  );
  const key = session.user.id + ':' + session.revision;
  const currentKey = useRef(key);
  currentKey.current = key;
  const alive = useRef(true);
  const lock = useRef(false);
  const inspection = useRef(0);
  const disabledRegistration = useRef<string | undefined>(undefined);
  const enableDisplay = useCallback(() => {
    disabledRegistration.current = undefined;
    pwa.registration?.active?.postMessage({ type: 'PUSH_ENABLED', userId: session.user.id });
  }, [pwa.registration, session.user.id]);
  const disableDisplay = useCallback(
    (registrationId: string) => {
      if (disabledRegistration.current === registrationId) return;
      disabledRegistration.current = registrationId;
      pwa.registration?.active?.postMessage({ type: 'PUSH_DISABLED' });
    },
    [pwa.registration],
  );
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    'unsupported',
  );
  const [association, setAssociation] = useState<PushAssociation>();
  const [fingerprint, setFingerprint] = useState<string>();
  const [confirmed, setConfirmed] = useState<PushDevice>();
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [localProblem, setLocalProblem] = useState<
    'storage' | 'key' | 'subscription' | 'unconfirmed'
  >();
  const isCurrent = useCallback(() => alive.current && currentKey.current === key, [key]);
  const supported = pwa.secure && !!pwa.registration?.pushManager;
  const active =
    permission === 'granted' &&
    activePushDevice(confirmed) &&
    !association?.uncertain &&
    association?.registrationId === confirmed?.id &&
    !!fingerprint &&
    fingerprint === association?.fingerprint;

  const inspect = useCallback(
    async (explicit = false) => {
      const attempt = ++inspection.current;
      const current = () => isCurrent() && inspection.current === attempt;
      const saved = readPushAssociation(session.user.id);
      const allowed = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
      if (!current()) return;
      setPermission(allowed);
      setAssociation(saved);
      setConfirmed(undefined);
      setFingerprint(undefined);
      const subscription = await pwa.registration?.pushManager?.getSubscription();
      const body = subscription && webPushBody(subscription);
      const actual = body ? await subscriptionFingerprint(body) : undefined;
      if (!current()) return;
      setFingerprint(actual);
      if (saved?.registrationId && actual === saved.fingerprint) {
        const row = await findPushDevice(call, saved.registrationId);
        if (!current()) return;
        if (row?.platform === 'Web') {
          if (
            saved.createdAtUtc &&
            Date.parse(saved.createdAtUtc) !== Date.parse(row.createdAtUtc)
          ) {
            setLocalProblem('unconfirmed');
            return;
          }
          setConfirmed(row);
          if (!activePushDevice(row)) disableDisplay(row.id);
          // An explicit read may recover a previously known identity; it cannot
          // associate the first lost acknowledgment with an arbitrary Web row.
          if (!saved.uncertain || explicit) {
            const next = {
              ...saved,
              version: row.version,
              createdAtUtc: row.createdAtUtc,
              uncertain: false,
            };
            if (!storePushAssociation(next)) setLocalProblem('storage');
            setAssociation(next);
            if (allowed === 'granted' && activePushDevice(row)) enableDisplay();
          }
        }
      }
    },
    [call, isCurrent, pwa.registration, session.user.id, enableDisplay, disableDisplay],
  );

  useEffect(() => {
    alive.current = true;
    let live = true;
    setChecking(true);
    setError(undefined);
    void inspect()
      .catch((problem) => {
        if (live && isCurrent()) setError(problem);
      })
      .finally(() => {
        if (live && isCurrent()) setChecking(false);
      });
    return () => {
      live = false;
      alive.current = false;
    };
  }, [inspect, isCurrent]);
  useEffect(() => {
    const refreshPermission = () => {
      if (isCurrent())
        setPermission(
          typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
        );
    };
    let status: PermissionStatus | undefined;
    let live = true;
    void navigator.permissions
      ?.query({ name: 'notifications' })
      .then((result) => {
        if (!live) return;
        status = result;
        result.addEventListener('change', refreshPermission);
      })
      .catch(() => {});
    window.addEventListener('focus', refreshPermission);
    return () => {
      live = false;
      status?.removeEventListener('change', refreshPermission);
      window.removeEventListener('focus', refreshPermission);
    };
  }, [isCurrent]);

  async function refresh() {
    if (!isCurrent() || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setLocalProblem(undefined);
    try {
      await inspect(true);
      const result = await configuration.refetch();
      if (result.isError) throw result.error;
    } catch (problem) {
      if (isCurrent()) setError(problem);
    } finally {
      lock.current = false;
      if (isCurrent()) setBusy(false);
    }
  }
  async function enable() {
    if (
      lock.current ||
      checking ||
      configuration.isError ||
      !configuration.data?.isConfigured ||
      association?.uncertain ||
      !supported ||
      !pwa.ready ||
      active
    )
      return;
    const applicationServerKey = vapidApplicationKey(configuration.data.vapidPublicKey);
    if (!applicationServerKey) {
      setLocalProblem('key');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setLocalProblem(undefined);
    try {
      const allowed =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;
      if (!isCurrent()) return;
      setPermission(allowed);
      if (allowed !== 'granted') return;
      let subscription = await pwa.registration!.pushManager.getSubscription();
      if (!isCurrent()) return;
      if (subscription && !sameApplicationKey(subscription, applicationServerKey)) {
        setLocalProblem('key');
        return;
      }
      subscription ??= await pwa.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      if (!isCurrent()) return;
      const body = webPushBody(subscription);
      if (!body) {
        setLocalProblem('subscription');
        return;
      }
      const actual = await subscriptionFingerprint(body);
      if (!isCurrent()) return;
      const saved = readPushAssociation(session.user.id);
      if (saved?.uncertain) {
        setAssociation(saved);
        return;
      }
      const previous = saved?.fingerprint === actual ? saved : undefined;
      const row = previous?.registrationId
        ? await findPushDevice(call, previous.registrationId)
        : undefined;
      if (!isCurrent()) return;
      if (previous?.registrationId && !row) {
        setLocalProblem('unconfirmed');
        return;
      }
      if (row && row.platform !== 'Web') throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      if (previous && activePushDevice(row)) {
        if (
          previous.createdAtUtc &&
          Date.parse(previous.createdAtUtc) !== Date.parse(row!.createdAtUtc)
        ) {
          setLocalProblem('unconfirmed');
          return;
        }
        const verified = {
          ...previous,
          version: row!.version,
          createdAtUtc: row!.createdAtUtc,
          uncertain: false,
        };
        setFingerprint(actual);
        setAssociation(verified);
        setConfirmed(row);
        if (!storePushAssociation(verified)) {
          setLocalProblem('storage');
          return;
        }
        enableDisplay();
        return;
      }
      body.expectedVersion = row?.version ?? null;
      const intent: PushAssociation = {
        userId: session.user.id,
        fingerprint: actual,
        version: row?.version ?? null,
        registrationId: previous?.registrationId,
        createdAtUtc: previous?.createdAtUtc,
        uncertain: true,
      };
      if (!storePushAssociation(intent)) {
        setLocalProblem('storage');
        return;
      }
      setAssociation(intent);
      setFingerprint(actual);
      const result = await call<PushAcknowledgment>(pushDevicePath + '/web-push', {
        method: 'POST',
        expectedStatus: 200,
        body: JSON.stringify(body),
      });
      if (!isCurrent()) return;
      if (!acknowledgedWebPush(result)) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      void cache.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'personal' &&
          query.queryKey[1] === session.user.id &&
          typeof query.queryKey[3] === 'string' &&
          query.queryKey[3].startsWith(pushDevicePath),
      });
      const next: PushAssociation = {
        ...intent,
        registrationId: result.id,
        createdAtUtc: result.createdAtUtc,
        version: result.version ?? null,
        uncertain: true,
      };
      setAssociation(next);
      if (!storePushAssociation(next)) {
        setLocalProblem('storage');
        return;
      }
      const registered = await findPushDevice(call, result.id);
      if (!isCurrent()) return;
      if (
        !activePushDevice(registered) ||
        registered?.platform !== 'Web' ||
        Date.parse(registered.createdAtUtc) !== Date.parse(result.createdAtUtc)
      ) {
        setLocalProblem('unconfirmed');
        return;
      }
      const verified = { ...next, version: registered.version, uncertain: false };
      setAssociation(verified);
      setConfirmed(registered);
      if (!storePushAssociation(verified)) {
        setLocalProblem('storage');
        return;
      }
      enableDisplay();
    } catch (problem) {
      if (isCurrent()) setError(problem);
    } finally {
      lock.current = false;
      if (isCurrent()) setBusy(false);
    }
  }
  function disableLocal(registrationId: string) {
    if (association?.registrationId === registrationId && association.fingerprint === fingerprint) {
      inspection.current++;
      disableDisplay(registrationId);
      setConfirmed(undefined);
    }
  }
  return {
    permission,
    configuration,
    supported,
    ready: pwa.ready,
    pwaError: pwa.error,
    association,
    fingerprint,
    confirmed,
    checking,
    busy,
    error,
    localProblem,
    active,
    enable,
    refresh,
    disableLocal,
  };
}
