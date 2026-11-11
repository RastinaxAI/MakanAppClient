'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useRef, useState } from 'react';
import { ChevronLeft, UserRound, GraduationCap, LoaderCircle } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { usePersonal } from '@/features/personal/provider';
import { useWorkspaceSnapshot, WorkspaceVisibilityNotice } from '@/features/personal/workspaces';
import { visibleWorkspaces, canEnterWorkspace } from '@/features/personal/workspace-model';
import type { components } from '@/generated/api/schema';
import { V5Scene } from '@/components/v5/scene';
type Workspace = components['schemas']['WorkspaceResult'];
export function WorkspaceSelection() {
  const { session, selectWorkspace } = usePersonal();
  const q = useWorkspaceSnapshot();
  const workspaces = q.data ? visibleWorkspaces(q.data) : [];
  const [entering, setEntering] = useState<string>(),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const current = workspaces.find(
    (w) =>
      w.workspaceType === session.context.workspaceType &&
      w.membershipId === session.context.membershipId &&
      w.role === session.context.activeRole,
  );
  async function enter(w: Workspace, key: string) {
    if (lock.current || !canEnterWorkspace(w)) return;
    lock.current = true;
    setEntering(key);
    setError(undefined);
    try {
      await selectWorkspace(
        { workspaceType: w.workspaceType, membershipId: w.membershipId, role: w.role },
        '/personal',
      );
    } catch (e) {
      setError(e);
    } finally {
      lock.current = false;
      setEntering(undefined);
    }
  }
  return (
    <V5Scene
      id="MK-83"
      title={uiText.text_f22fc41872c4}
      subtitle={uiText.text_f736bd2c5640}
      back="/personal/profile"
      kind="list"
    >
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : !workspaces.length ? (
        <EmptyState title={uiText.text_1e8321671f3f} />
      ) : (
        <div className={uiClass('v5-space-choices')} data-workspace-choices>
          {workspaces.map((w, index) => (
            <button
              key={`${w.membershipId}:${w.role}:${index}`}
              aria-pressed={current === w}
              disabled={!!entering || !canEnterWorkspace(w)}
              onClick={() => void enter(w, `${w.membershipId}:${w.role}:${index}`)}
            >
              <span className={uiClass('tile-icon')}>
                {w.workspaceType === 'Personal' ? (
                  <UserRound size={20} />
                ) : (
                  <GraduationCap size={20} />
                )}
              </span>
              <span>
                <strong>{w.organizationName ?? uiText.text_d034f3bcfe7f}</strong>
                <small>
                  {w.workspaceType === 'Personal' ? uiText.text_9336384b74e8 : label(w.role ?? '')}
                </small>
                {!canEnterWorkspace(w) && <small>{uiText.text_c7581e2c4ccf}</small>}
              </span>
              {entering === `${w.membershipId}:${w.role}:${index}` ? (
                <LoaderCircle
                  className={uiClass('spinner')}
                  size={20}
                  aria-label={uiText.text_d04bf8106c45}
                />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          ))}
        </div>
      )}
      <WorkspaceVisibilityNotice snapshot={q.data} />
      {!!error && <ErrorState error={error} />}
    </V5Scene>
  );
}
