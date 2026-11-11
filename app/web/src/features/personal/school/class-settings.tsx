'use client';
import { Input as NativeInput, Textarea as NativeTextarea } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useRef, useState } from 'react';
import { vnext as t } from '@/content/fa';
import * as uiText from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { V4Note } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { number } from '@/lib/formatting';
import { ErrorState } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { useResourceCommand } from '../use-resource-command';
import { usePersonalApi } from '../provider';
import { Field } from './shared';
import s from './school.module.css';
type S = components['schemas'];
export function ClassSettings({
  item,
  refresh,
}: {
  item: S['ClassResult'];
  refresh: () => Promise<S['ClassResult'] | undefined>;
}) {
  const [baseline, setBaseline] = useState(item),
    [title, setTitle] = useState(item.title),
    [capacity, setCapacity] = useState(String(item.capacity)),
    [reason, setReason] = useState('');
  const [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState<unknown>();
  const command = useResourceCommand('school-class-settings:' + item.id);
  const [review, setReview] = useState<S['UpdateClassSettingsCommand'] | null>(null);
  const [attemptedVersion, setAttemptedVersion] = useState('');
  const returnFocus = useRef<HTMLElement | null>(null);
  const conflict =
    review?.expectedVersion === attemptedVersion &&
    command.error instanceof ApiError &&
    [409, 412].includes(command.error.status);
  const learners = usePersonalApi<S['SchoolPageOfClassLearnerResult']>(
    `/api/v1/academic/classes/${item.id}/learners?Page=1&PageSize=1&status=Active`,
    { enabled: !!review },
  );
  async function acceptLatest() {
    setRefreshing(true);
    setError(undefined);
    try {
      const next = await refresh();
      if (next) {
        setBaseline(next);
        setReview(null);
      }
    } catch (e) {
      setError(e);
    } finally {
      setRefreshing(false);
    }
  }
  async function commit() {
    if (!review || command.busy) return;
    setAttemptedVersion(review.expectedVersion);
    const result = await command.run<S['ClassResult']>(
      '/api/v1/academic/classes/' + item.id,
      review,
      {
        method: 'PATCH',
        acceptResult: (r) => r.id === item.id && r.organizationId === item.organizationId,
      },
    );
    if (result) {
      setBaseline(result.value);
      setTitle(result.value.title);
      setCapacity(String(result.value.capacity));
      setReview(null);
    }
  }
  const dirty = title !== baseline.title || Number(capacity) !== baseline.capacity;
  useUnsavedChanges(dirty);
  const valid =
    title.trim().length > 0 &&
    title.trim().length <= 200 &&
    Number.isSafeInteger(Number(capacity)) &&
    Number(capacity) > 0 &&
    !!reason.trim() &&
    !!baseline.version;
  return (
    <V5Scene
      id="MK-95"
      title={t.classSettingsTitle}
      subtitle={item.title}
      back={'/personal/education/classes/' + item.id}
      moreLabel={uiText.text_589d5004f227}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || command.busy || refreshing) return;
        returnFocus.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setError(undefined);
        setReview({
          title: title.trim(),
          capacity: Number(capacity),
          reason: reason.trim(),
          expectedVersion: baseline.version,
        });
      }}
      actions={
        <>
          <Button
            type="submit"
            data-class-settings-save
            disabled={!valid || command.busy || refreshing}
            aria-busy={command.busy}
          >
            {t.saveClassSettings}
          </Button>
          {(command.error || error || !baseline.version) && (
            <Button
              type="button"
              variant="outline"
              disabled={command.busy || refreshing}
              onClick={() => void acceptLatest()}
            >
              {t.refreshSettings}
            </Button>
          )}
        </>
      }
    >
      <fieldset
        data-v5-workflow-fields
        className={uiClass(s.form)}
        disabled={command.busy || refreshing || !!review}
      >
        <Field label={t.title}>
          <NativeInput
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label={t.capacity}>
          <NativeInput
            required
            type="number"
            min={1}
            step={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </Field>
        <Field label={t.reason}>
          <NativeTextarea
            required
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      </fieldset>
      {!baseline.version && <p role="alert">{t.emptyVersion}</p>}
      {!review && command.feedback}
      {!!error && <ErrorState error={error} />}
      <V4Note>{t.classSettingsHint}</V4Note>
      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open && !command.busy && !refreshing) setReview(null);
        }}
      >
        <DialogContent
          scenario={conflict ? 'MK-97 MK-428' : 'MK-96'}
          title={conflict ? t.settingsConflictTitle : t.confirmCapacityTitle}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previous = returnFocus.current;
            const fallback = [
              ...document.querySelectorAll<HTMLElement>('[data-class-settings-save]'),
            ].find((e) => !!e.getBoundingClientRect().height);
            (previous?.isConnected && previous.getBoundingClientRect().height
              ? previous
              : fallback
            )?.focus();
          }}
        >
          <dl className={uiClass('v5-dialog-summary')}>
            <div>
              <dt>{t.previousCapacity}</dt>
              <dd>
                {number(baseline.capacity)}
                {uiText.text_56bfaedd15bf}
              </dd>
            </div>
            <div>
              <dt>{t.nextCapacity}</dt>
              <dd>
                {number(review?.capacity ?? Number(capacity))}
                {uiText.text_56bfaedd15bf}
              </dd>
            </div>
            {learners.data && (
              <div>
                <dt>{t.activeEnrollment}</dt>
                <dd>
                  {number(learners.data.totalCount)}
                  {uiText.text_56bfaedd15bf}
                </dd>
              </div>
            )}
          </dl>
          {learners.isError && (
            <ErrorState error={learners.error} onRetry={() => void learners.refetch()} />
          )}
          <p className={uiClass('dialog-policy')}>{t.capacityPolicy}</p>
          {(command.busy || !!command.error) && command.feedback}
          {!!error && <ErrorState error={error} />}
          <div className={uiClass('confirm-actions')}>
            <Button
              disabled={command.busy || refreshing}
              onClick={() => (conflict ? void acceptLatest() : void commit())}
            >
              {conflict ? t.reviewLatest : t.confirmSettings}
            </Button>
            <Button
              variant="outline"
              disabled={command.busy || refreshing}
              onClick={() => setReview(null)}
            >
              {uiText.text_fa7af603d430}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </V5Scene>
  );
}
