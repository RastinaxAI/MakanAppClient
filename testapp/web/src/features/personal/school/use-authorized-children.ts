'use client';
import { useRef, useState } from 'react';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
type Child = components['schemas']['AuthorizedChildResult'];
/** Shared child selection; the acknowledged server context remains authoritative. */
export function useAuthorizedChildren() {
  const { session, call, reload } = usePersonal();
  const children = usePersonalApi<Child[]>('/api/v1/guardian/children', { poll: 5000 });
  const scoped =
    children.data?.filter((child) => child.organizationId === session.context.organizationId) ?? [];
  const active = children.isSuccess
    ? scoped.find(
        (child) =>
          child.learnerOrganizationPersonId === session.context.subjectOrganizationPersonId &&
          child.relationStatus === 'Active',
      )
    : undefined;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [pendingId, setPendingId] = useState<string>();
  const lock = useRef(false);
  async function select(id: string) {
    if (lock.current || !children.isSuccess) return false;
    const child = scoped.find(
      (item) => item.learnerOrganizationPersonId === id && item.relationStatus === 'Active',
    );
    if (!child) return false;
    if (id === active?.learnerOrganizationPersonId) return true;
    lock.current = true;
    setBusy(true);
    setPendingId(id);
    setError(undefined);
    try {
      await call('/api/v1/guardian/children/' + id + '/select', { method: 'POST' });
      await reload();
      return true;
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) setError(err);
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
      setPendingId(undefined);
    }
  }
  return {
    children,
    scoped,
    active,
    busy,
    pendingId,
    error: children.error ?? error,
    select,
    retry: () => {
      setError(undefined);
      void children.refetch();
    },
  };
}
