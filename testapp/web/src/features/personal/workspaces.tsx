'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { usePersonalApi } from './provider';
import { usePersonal } from './provider';
import { useEffect, useRef, useState } from 'react';
import { Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { visibleWorkspaces, canEnterWorkspace } from './workspace-model';
import { ApiError } from '@/lib/api/errors';
import w from './workspaces.module.css';
import s from './personal.module.css';

export function useWorkspaceSnapshot() {
  return usePersonalApi<components['schemas']['WorkspaceSnapshotResult']>(
    '/api/v1/workspaces/snapshot',
    { poll: 10000 },
  );
}
export function WorkspaceVisibilityNotice({
  snapshot,
}: {
  snapshot?: components['schemas']['WorkspaceSnapshotResult'];
}) {
  return snapshot?.personalWorkspaceVisible === null ? (
    <p className={uiClass(s.muted)} role="status">
      {uiText.text_2c65dfd06215}
    </p>
  ) : null;
}

type Workspace = components['schemas']['WorkspaceResult'];
export function workspaceKey(space: Workspace) {
  return [space.workspaceType, space.organizationId, space.membershipId, space.role].join(':');
}
export function SchoolContextPicker({
  onSelected,
  readOnly = false,
}: {
  onSelected?: () => void;
  readOnly?: boolean;
}) {
  const { session, selectWorkspace } = usePersonal();
  const submitting = useRef(false);
  const q = useWorkspaceSnapshot();
  const rows = q.data ? visibleWorkspaces(q.data) : [];
  const organizations = rows.filter((row) => row.workspaceType === 'Organization');
  const current = organizations.find(
    (row) =>
      row.organizationId === session.context.organizationId &&
      row.membershipId === session.context.membershipId &&
      row.role === session.context.activeRole,
  );
  const [selected, setSelected] = useState(current ? workspaceKey(current) : '');
  const currentKey = current ? workspaceKey(current) : '';
  useEffect(() => {
    if (currentKey) setSelected((value) => value || currentKey);
  }, [currentKey]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const chosen = organizations.find((row) => workspaceKey(row) === selected);
  const groups = [...new Set(organizations.map((row) => row.organizationId))].map((id) =>
    organizations.filter((row) => row.organizationId === id),
  );
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  return (
    <form
      className={w.picker}
      data-school-context-picker
      onSubmit={async (event) => {
        event.preventDefault();
        if (submitting.current || readOnly || !chosen || !canEnterWorkspace(chosen)) return;
        submitting.current = true;
        setBusy(true);
        setError(undefined);
        try {
          await selectWorkspace(
            {
              workspaceType: chosen.workspaceType,
              membershipId: chosen.membershipId,
              role: chosen.role,
            },
            '/personal/education',
          );
          onSelected?.();
        } catch (e) {
          setError(e);
          if (e instanceof ApiError && [403, 409].includes(e.status)) void q.refetch();
        } finally {
          submitting.current = false;
          setBusy(false);
        }
      }}
    >
      <div className={w.notice}>
        <Info aria-hidden="true" />
        <p>{uiText.v6Ui.schoolOnly}</p>
      </div>
      {groups.length ? (
        groups.map((group) => (
          <section
            className={w.organization}
            aria-label={group[0].organizationName ?? group[0].displayName}
            key={group[0].organizationId}
            data-selected={group.some((row) => workspaceKey(row) === selected) || undefined}
          >
            <div className={w.organizationHeading}>
              <span className={w.avatar} aria-hidden="true">
                {group[0].organizationName?.charAt(0)}
              </span>
              <div>
                <strong>{group[0].organizationName}</strong>
                <small>
                  {group.some(canEnterWorkspace)
                    ? uiText.v6Ui.verifiedMembership
                    : uiText.v6Ui.unavailable}
                </small>
              </div>
              {group.some((row) => row === current) && (
                <span className={w.active}>{uiText.v6Ui.active}</span>
              )}
            </div>
            {group.map((row) => (
              <label className={w.choice} key={workspaceKey(row)}>
                <Input
                  type="radio"
                  name="school-context"
                  value={workspaceKey(row)}
                  checked={workspaceKey(row) === selected}
                  disabled={busy || readOnly || !canEnterWorkspace(row)}
                  onChange={() => setSelected(workspaceKey(row))}
                />
                <span>
                  <strong>{label(row.role ?? '')}</strong>
                  <small>
                    {canEnterWorkspace(row) ? uiText.v6Ui.roleScope : uiText.v6Ui.unavailable}
                  </small>
                </span>
              </label>
            ))}
          </section>
        ))
      ) : (
        <EmptyState title={uiText.v6Ui.noAccess} />
      )}
      <WorkspaceVisibilityNotice snapshot={q.data} />
      {!!error && <ErrorState error={error} />}
      {!readOnly && (
        <Button
          className={w.submit}
          type="submit"
          disabled={busy || !chosen || !canEnterWorkspace(chosen)}
          aria-busy={busy}
        >
          <Check size={20} />
          {uiText.v6Ui.enterRole}
        </Button>
      )}
      {!readOnly &&
        rows.some((row) => row.workspaceType === 'Personal' && canEnterWorkspace(row)) && (
          <Button
            className={w.personal}
            variant="ghost"
            disabled={busy}
            onClick={async () => {
              if (submitting.current) return;
              submitting.current = true;
              setBusy(true);
              setError(undefined);
              try {
                await selectWorkspace(
                  { workspaceType: 'Personal', membershipId: null, role: null },
                  '/personal/profile',
                );
                onSelected?.();
              } catch (e) {
                setError(e);
              } finally {
                submitting.current = false;
                setBusy(false);
              }
            }}
          >
            {uiText.v6Ui.personalSpace}
          </Button>
        )}
      {readOnly && <p>{uiText.v6Ui.roleUnchanged}</p>}
    </form>
  );
}
