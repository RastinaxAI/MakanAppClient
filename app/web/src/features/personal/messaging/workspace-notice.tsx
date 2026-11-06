'use client';
import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { messagingWorkspace as t } from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { usePersonal } from '../provider';
import { useWorkspaceSnapshot } from '../workspaces';
import { conversationWorkspaceChoices, conversationWorkspaceDestination } from './workspace-model';
import s from './workspace-notice.module.css';

export function ConversationWorkspaceNotice({
  id,
  summary,
  error,
  onRetry,
}: {
  id: string;
  summary?: components['schemas']['ConversationSummaryResult'];
  error?: unknown;
  onRetry?: () => void;
}) {
  const { session, selectWorkspace } = usePersonal();
  const snapshot = useWorkspaceSnapshot(),
    search = useSearchParams();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false),
    [problem, setProblem] = useState<unknown>();
  const choices = snapshot.data
    ? conversationWorkspaceChoices(summary, snapshot.data, session.context)
    : [];
  return (
    <section className={s.page} aria-label={t.title} data-conversation-workspace>
      <Button asChild variant="ghost">
        <Link href="/personal/messages">
          <ArrowRight size={18} />
          {t.back}
        </Link>
      </Button>
      <div className={s.card}>
        <Building2 size={34} aria-hidden="true" />
        <h2>{summary ? t.title : t.unresolvedTitle}</h2>
        {summary?.title && <h3 dir="auto">{summary.title}</h3>}
        <p>{summary ? t.explanation : t.unresolvedExplanation}</p>
        {!!error && <ErrorState error={error} onRetry={onRetry} />}
        {snapshot.isPending ? (
          <LoadingSkeleton />
        ) : snapshot.isError ? (
          <ErrorState error={snapshot.error} onRetry={() => void snapshot.refetch()} />
        ) : choices.length ? (
          <div className={s.choices}>
            {choices.map((space) => (
              <Button
                key={space.membershipId + ':' + space.role}
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  if (lock.current) return;
                  lock.current = true;
                  setBusy(true);
                  setProblem(undefined);
                  try {
                    await selectWorkspace(
                      {
                        workspaceType: 'Organization',
                        membershipId: space.membershipId,
                        role: space.role,
                      },
                      conversationWorkspaceDestination(id, search.toString()),
                    );
                  } catch (e) {
                    setProblem(e);
                  } finally {
                    lock.current = false;
                    setBusy(false);
                  }
                }}
              >
                <span>{busy ? t.changing : t.select}</span>
                <strong>{space.organizationName || space.displayName}</strong>
                <span>{label(space.role ?? '')}</span>
              </Button>
            ))}
          </div>
        ) : (
          <p role="status">{summary ? t.noMatchingWorkspace : t.noAlternativeWorkspace}</p>
        )}
        {!!problem && <ErrorState error={problem} />}
        <Button
          type="button"
          variant="ghost"
          disabled={busy || snapshot.isFetching}
          onClick={() => void snapshot.refetch()}
        >
          {t.refresh}
        </Button>
      </div>
    </section>
  );
}
