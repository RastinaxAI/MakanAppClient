'use client';
import { useState } from 'react';
import { vnext as t } from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { useResourceCommand } from '../use-resource-command';
import { Card, Field } from './shared';
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
    <Card>
      <details>
        <summary>{t.classSettings}</summary>
        <p className={s.hint}>{t.classSettingsHint}</p>
        <form
          className={s.form}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!valid) return;
            setError(undefined);
            const result = await command.run<S['ClassResult']>(
              '/api/v1/academic/classes/' + item.id,
              {
                title: title.trim(),
                capacity: Number(capacity),
                reason: reason.trim(),
                expectedVersion: baseline.version,
              },
              {
                method: 'PATCH',
                acceptResult: (r) => r.id === item.id && r.organizationId === item.organizationId,
              },
            );
            if (result) {
              if (
                result.value.id !== item.id ||
                result.value.organizationId !== item.organizationId
              ) {
                setError(new ApiError(502, { code: 'CONTRACT_MISMATCH' }));
                return;
              }
              setBaseline(result.value);
              setTitle(result.value.title);
              setCapacity(String(result.value.capacity));
            }
          }}
        >
          <fieldset className={s.form} disabled={command.busy || refreshing}>
            <Field label={t.title}>
              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label={t.capacity}>
              <input
                required
                type="number"
                min={1}
                step={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </Field>
            <Field label={t.reason}>
              <textarea
                required
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </fieldset>
          {!baseline.version && <p role="alert">{t.emptyVersion}</p>}
          {command.feedback}
          {!!error && <ErrorState error={error} />}
          <div className={s.row}>
            <Button type="submit" disabled={!valid || command.busy || refreshing}>
              {t.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={command.busy || refreshing}
              onClick={async () => {
                setRefreshing(true);
                setError(undefined);
                try {
                  const next = await refresh();
                  if (next) setBaseline(next);
                } catch (e) {
                  setError(e);
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {t.refreshVersion}
            </Button>
          </div>
        </form>
      </details>
    </Card>
  );
}
