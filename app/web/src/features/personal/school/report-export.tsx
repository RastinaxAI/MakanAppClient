'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import appearance from './report-export.module.css';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { V4Note } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { reportExport as t } from '@/content/fa';
import { usePersonal, usePersonalApi } from '../provider';
import { useResourceCommand } from '../use-resource-command';
import { Field, toUtc } from './shared';
type S = components['schemas'];
export type ManagerExportType = Extract<S['ReportExportType'], `Manager${string}`>;
export const managerExportLabels: Record<ManagerExportType, string> = {
  ManagerEnrollments: t.enrollments,
  ManagerAttendance: t.attendance,
  ManagerAssessments: t.assessments,
  ManagerTeacherWorkload: t.workload,
};
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const validExportId = (value: string) => guid.test(value);

export function ReportExportDialog({
  open,
  onOpenChange,
  initialType,
  classId,
  returnFocus,
  back,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: ManagerExportType;
  classId: string;
  returnFocus: RefObject<HTMLElement | null>;
  back: string;
}) {
  const { session } = usePersonal(),
    router = useRouter();
  const memory = session.user.id + ':' + contextSignature(session.context) + ':report-export';
  const [jobId, setJobId, loaded] = useViewState(
    memory,
    '',
    (value): value is string => typeof value === 'string' && (!value || guid.test(value)),
  );
  const [type, setType] = useState(initialType),
    [from, setFrom] = useState(''),
    [to, setTo] = useState('');
  const command = useResourceCommand('report-export');
  useEffect(() => {
    if (open) setType(initialType);
  }, [open, initialType]);
  const valid =
    (!from || Number.isFinite(Date.parse(from))) &&
    (!to || Number.isFinite(Date.parse(to))) &&
    (!from || !to || Date.parse(to) > Date.parse(from));
  const destination = (id: string) => back + (back.includes('?') ? '&' : '?') + 'export=' + id;
  async function create() {
    if (!valid || !loaded) return;
    const result = await command.run<S['ReportExportJobResult']>(
      '/api/v1/reports/exports',
      {
        reportType: type,
        format: 'Csv',
        filters: {
          classId: classId || null,
          fromUtc: from ? toUtc(from) : null,
          toUtc: to ? toUtc(to) : null,
        },
      },
      {
        idempotent: true,
        acceptResult: (r) => validExportId(r.jobId) && r.reportType === type && r.format === 'Csv',
      },
    );
    if (result) {
      setJobId(result.value.jobId);
      onOpenChange(false);
      router.push(destination(result.value.jobId));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        scenario="MK-164"
        title={t.configure}
        description={t.allowedOnly}
        descriptionHidden
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const target = returnFocus.current;
          if (target?.isConnected && target.getBoundingClientRect().height) target.focus();
          else
            [...document.querySelectorAll<HTMLElement>('[data-report-export-trigger]')]
              .find((e) => e.getBoundingClientRect().height)
              ?.focus();
        }}
      >
        {!loaded ? (
          <LoadingSkeleton />
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void create();
            }}
          >
            <div className={uiClass('v5-export-fields' + ' ' + appearance['v5-export-fields'])}>
              <Field label={t.type}>
                <NativeSelect
                  value={type}
                  onChange={(event) => setType(event.target.value as ManagerExportType)}
                >
                  {Object.entries(managerExportLabels).map(([value, title]) => (
                    <option key={value} value={value}>
                      {title}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <fieldset
                className={uiClass('v5-export-range' + ' ' + appearance['v5-export-range'])}
              >
                <legend>{t.range}</legend>
                <div>
                  <Field label={t.from}>
                    <JalaliDateInput withTime value={from} onValueChange={setFrom} />
                  </Field>
                  <Field label={t.to}>
                    <JalaliDateInput withTime min={from} value={to} onValueChange={setTo} />
                  </Field>
                </div>
              </fieldset>
              <Field label={t.format}>
                <NativeSelect value="Csv" disabled>
                  <option value="Csv">{t.csv}</option>
                </NativeSelect>
              </Field>
            </div>
            {!valid && (
              <p className={uiClass('field-error')} role="alert">
                {t.invalidRange}
              </p>
            )}
            <p
              className={uiClass(
                'dialog-policy v5-export-policy ' + appearance['v5-export-policy'],
              )}
            >
              {t.allowedOnly}
            </p>
            {command.feedback}
            <div className={uiClass('confirm-actions')}>
              <Button type="submit" disabled={!valid || command.busy} aria-busy={command.busy}>
                <FileSpreadsheet size={18} />
                {t.create}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.cancel}
              </Button>
            </div>
            {jobId && (
              <Button asChild variant="ghost">
                <Link href={destination(jobId)}>{t.lastRequest}</Link>
              </Button>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ReportExportStatus({ jobId, back }: { jobId: string; back: string }) {
  const { transfer } = usePersonal();
  const job = usePersonalApi<S['ReportExportJobResult']>('/api/v1/reports/exports/' + jobId);
  const current = job.data;
  const [error, setError] = useState<unknown>(),
    [downloading, setDownloading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const ready =
    current?.jobId === jobId && current.status === 'Completed' && current.downloadAvailable;
  async function download() {
    if (!ready || downloading) return;
    setError(undefined);
    setDownloading(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const blob = await transfer<Blob>(`/api/client/report-exports/${jobId}/content`, {
        binary: true,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob),
        link = document.createElement('a');
      link.href = url;
      link.download = 'makan-report.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      if (!controller.signal.aborted) setError(e);
    } finally {
      if (!controller.signal.aborted) setDownloading(false);
    }
  }
  return (
    <V5Scene
      id={ready ? 'MK-166' : current?.status === 'Failed' ? 'MK-426' : 'MK-165'}
      title={ready ? t.ready : current?.status === 'Failed' ? t.failed : t.preparing}
      back={back}
      actions={
        ready ? (
          <Button onClick={() => void download()} disabled={downloading}>
            <Download size={18} />
            {downloading ? t.downloading : t.download}
          </Button>
        ) : (
          <Button onClick={() => void job.refetch()} disabled={job.isFetching}>
            <RefreshCw size={18} />
            {t.check}
          </Button>
        )
      }
    >
      {job.isPending ? (
        <LoadingSkeleton />
      ) : job.isError ? (
        <ErrorState error={job.error} onRetry={() => void job.refetch()} />
      ) : current?.jobId !== jobId || !(current.reportType in managerExportLabels) ? (
        <ErrorState error={new ApiError(502)} />
      ) : (
        <div className={uiClass('stack')} data-report-export-state={current.status}>
          <div className={uiClass('card')}>
            <h2>
              {managerExportLabels[current.reportType as ManagerExportType] ||
                label(current.reportType)}
            </h2>
          </div>
          <dl className={uiClass('v5-export-details card' + ' ' + appearance['v5-export-details'])}>
            <div>
              <dt>{t.type}</dt>
              <dd>
                {managerExportLabels[current.reportType as ManagerExportType] ||
                  label(current.reportType)}
              </dd>
            </div>
            <div>
              <dt>{t.status}</dt>
              <dd>{t.statuses[current.status]}</dd>
            </div>
            <div>
              <dt>{t.rows}</dt>
              <dd>{number(current.expectedRowCount)}</dd>
            </div>
            <div>
              <dt>{t.requested}</dt>
              <dd>{date(current.requestedAtUtc, true)}</dd>
            </div>
          </dl>
          {current.status === 'Failed' ? (
            <ErrorState error={new ApiError(503)} />
          ) : (
            !ready && (
              <V4Note>{current.status === 'Completed' ? t.unavailable : t.keepRequest}</V4Note>
            )
          )}
          {!!error && <ErrorState error={error} />}
          <Button asChild variant="outline">
            <Link href={back}>{t.back}</Link>
          </Button>
        </div>
      )}
    </V5Scene>
  );
}
