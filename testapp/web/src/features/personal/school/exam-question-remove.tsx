'use client';
import { uiClass } from '@/components/v5/classes';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { v5ExamQuestion as t } from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ApiError } from '@/lib/api/errors';
import { ErrorState } from '@/components/ui/states';
import { persianDigits } from '@/lib/formatting';
import { usePersonal } from '../provider';
type S = components['schemas'];

/** Only the server's versioned 204 confirms removal from this organization draft. */
export function ExamQuestionRemove({
  exam,
  question,
  onRefresh,
  onRemoved,
  onOpenChange,
  disabled = false,
  open,
  hideTrigger = false,
}: {
  exam: S['ExamEditorDto'];
  question: S['ExamEditorQuestionDto'];
  onRefresh: () => Promise<unknown>;
  onRemoved?: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  hideTrigger?: boolean;
}) {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [localOpen, setLocalOpen] = useState(false);
  const expanded = open ?? localOpen;
  const changeOpen = (value: boolean) => {
    if (open === undefined) setLocalOpen(value);
    onOpenChange?.(value);
  };
  const current = useRef({
    command: {
      expectedVersionRowVersion: exam.versionRowVersion,
      expectedQuestionRowVersion: question.rowVersion,
    },
    order: question.order,
    prompt: question.prompt,
    version: exam.versionNumber,
  });
  current.current = {
    command: {
      expectedVersionRowVersion: exam.versionRowVersion,
      expectedQuestionRowVersion: question.rowVersion,
    },
    order: question.order,
    prompt: question.prompt,
    version: exam.versionNumber,
  };
  const [snapshot, setSnapshot] = useState<typeof current.current>();
  const [conflict, setConflict] = useState(false);
  const [refreshing, setRefreshing] = useState(false),
    [refreshError, setRefreshError] = useState<unknown>(),
    [submitting, setSubmitting] = useState(false);
  const removed = useRef(false);
  const opening = useRef(0);
  const capture = useCallback(() => {
    opening.current++;
    removed.current = false;
    setConflict(false);
    setRefreshError(undefined);
    setSnapshot(current.current);
  }, []);
  useLayoutEffect(() => {
    if (expanded) capture();
  }, [expanded, capture]);
  const displayed = snapshot ?? current.current;
  const stale = !!(
    expanded &&
    snapshot &&
    (snapshot.command.expectedVersionRowVersion !== exam.versionRowVersion ||
      snapshot.command.expectedQuestionRowVersion !== question.rowVersion)
  );
  return (
    <ConfirmAction
      scenario="MK-153"
      title={t.removeTitle}
      description={t.removeDescription}
      trigger={t.remove + ' ' + persianDigits(String(question.order))}
      triggerControl={
        <Button
          type="button"
          variant="destructive"
          aria-label={t.remove + ' ' + persianDigits(String(question.order))}
          data-exam-question-remove-trigger={question.id}
          onClick={capture}
        >
          {t.remove}
        </Button>
      }
      confirm={t.remove}
      destructive
      primaryFirst
      open={expanded}
      hideTrigger={hideTrigger}
      onOpenChange={changeOpen}
      disabled={
        disabled ||
        refreshing ||
        submitting ||
        stale ||
        exam.versionStatus !== 'Draft' ||
        !exam.versionRowVersion.trim() ||
        !question.rowVersion.trim()
      }
      feedback={
        <>
          <dl className={uiClass('v5-dialog-summary')} data-exam-question-remove-meta>
            <div>
              <dt>{t.question}</dt>
              <dd>{persianDigits(String(displayed.order)) + ' · ' + displayed.prompt}</dd>
            </div>
            <div>
              <dt>{t.version}</dt>
              <dd>{t.draft + ' ' + persianDigits(String(displayed.version))}</dd>
            </div>
          </dl>
          {stale && (
            <p className={uiClass('dialog-policy')} role="status">
              {t.changed}
            </p>
          )}
          {(conflict || stale) && (
            <Button
              type="button"
              variant="outline"
              disabled={refreshing || submitting}
              onClick={async () => {
                const epoch = opening.current;
                setRefreshing(true);
                setRefreshError(undefined);
                try {
                  await onRefresh();
                  if (epoch === opening.current) changeOpen(false);
                } catch (error) {
                  if (epoch === opening.current) setRefreshError(error);
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {t.latest}
            </Button>
          )}
          {!!refreshError && <ErrorState error={refreshError} />}
        </>
      }
      onCloseAutoFocus={(event) => {
        if (!removed.current) {
          if (hideTrigger) {
            event.preventDefault();
            requestAnimationFrame(() =>
              document
                .querySelector<HTMLButtonElement>(
                  '.v5-scene .rx-head button.rx-icon-button:not(.rx-back)',
                )
                ?.focus(),
            );
          } else {
            event.preventDefault();
            requestAnimationFrame(() =>
              (
                document.querySelector<HTMLElement>(
                  '[data-exam-question-remove-trigger="' + question.id + '"]',
                ) ?? document.querySelector<HTMLElement>('[data-exam-question-list]')
              )?.focus(),
            );
          }
          return;
        }
        event.preventDefault();
        requestAnimationFrame(() => {
          const target =
            document.querySelector<HTMLElement>('[data-exam-question-list]') ??
            document.querySelector<HTMLElement>('main h1,main h2');
          if (target) {
            target.tabIndex = -1;
            target.focus();
          }
        });
      }}
      onConfirm={async () => {
        if (!snapshot || stale || disabled || refreshing || submitting) return false;
        setSubmitting(true);
        try {
          await call<void>('/api/v1/academic/exams/' + exam.id + '/questions/' + question.id, {
            method: 'DELETE',
            expectedStatus: 204,
            body: JSON.stringify(snapshot.command),
          });
          removed.current = true;
          if (onRemoved) await onRemoved();
          else await onRefresh();
          void cache.invalidateQueries({
            queryKey: ['personal', session.user.id, session.revision],
          });
          return true;
        } catch (error) {
          if (error instanceof ApiError && [409, 412].includes(error.status)) setConflict(true);
          throw error;
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
