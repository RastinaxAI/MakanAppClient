'use client';
import { uiClass } from '@/components/v5/classes';

import { CalendarCheck, CalendarDays } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Select } from '@/components/ui/input';
import type { components } from '@/generated/api/schema';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { v5Attendance as t, v5Sessions, v7Ui as v7 } from '@/content/fa';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import { number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { base, Pager } from './shared';
import styles from './learning-reports.module.css';
type S = components['schemas'];

export function StudentAttendanceHistory({ menu }: { menu: ReactNode }) {
  const { session } = usePersonal();
  const permitted =
    session.context.workspaceType === 'Organization' && session.context.activeRole === 'Student';
  const memory = session.user.id + ':' + contextSignature(session.context) + ':student-attendance:';
  const [page, setPage] = useViewState(
    memory + 'page',
    1,
    (value): value is number => Number.isInteger(value) && Number(value) > 0,
  );
  const [period, setPeriod, periodRestored] = useViewState(
    memory + 'period',
    'all',
    (value): value is string => typeof value === 'string' && ['all', '7', '30'].includes(value),
  );
  const [classId, setClassId, classRestored] = useViewState(
    memory + 'class',
    '',
    (value): value is string =>
      typeof value === 'string' && (!value || /^[0-9a-f-]{36}$/i.test(value)),
  );
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: permitted,
  });
  // A fixed read window survives pagination; no academic-term boundary is invented.
  const readWindow = useMemo(() => {
    if (period === 'all') return undefined;
    const to = new Date(),
      from = new Date(to);
    from.setUTCDate(from.getUTCDate() - Number(period));
    return { from: from.toISOString(), to: to.toISOString() };
  }, [period]);
  const params = new URLSearchParams({ PageNumber: String(page), PageSize: '30' });
  if (classId) params.set('ClassId', classId);
  if (readWindow) {
    params.set('FromUtc', readWindow.from);
    params.set('ToUtc', readWindow.to);
  }
  const q = usePersonalApi<S['AttendanceReportPageOfStudentAttendanceReportItem']>(
    '/api/v1/reports/student/attendance?' + params,
    { enabled: permitted && periodRestored && classRestored },
  );
  if (!permitted) return <ErrorState error={new ApiError(403)} />;
  const summary = q.data?.summary;
  return (
    <V5Scene id="MK-130" title={v5Sessions.myAttendance} back={base + '/reports'} menu={menu}>
      <div className={styles.filters} data-attendance-filters>
        <label>
          {v7.reportPeriod}
          <Select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">{v7.allDates}</option>
            <option value="7">{v7.lastSevenDays}</option>
            <option value="30">{v7.lastThirtyDays}</option>
          </Select>
        </label>
        <label>
          {v7.reportClass}
          <Select
            value={classId}
            disabled={classes.isPending || classes.isError}
            onChange={(event) => {
              setClassId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{v7.allClasses}</option>
            {classId && !classes.data?.some((row) => row.id === classId) && (
              <option value={classId}>{v7.selectedClass}</option>
            )}
            {classes.data?.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {classes.isError && (
        <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
      )}
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {summary && (
            <div className={uiClass('stats')}>
              {(['Present', 'Absent', 'Late'] as const).map((status) => (
                <div key={status} className={uiClass('stat')}>
                  <b>
                    {number(
                      summary[
                        (
                          {
                            Present: 'presentCount',
                            Absent: 'absentCount',
                            Late: 'lateCount',
                          } as const
                        )[status]
                      ],
                    )}
                  </b>
                  <span>{label(status)}</span>
                </div>
              ))}
            </div>
          )}
          {summary && (summary.excusedCount > 0 || summary.notRecordedCount > 0) && (
            <p className={uiClass('policy')}>
              {t.otherCounts(number(summary.excusedCount), number(summary.notRecordedCount))}
            </p>
          )}
          {q.data.items.length ? (
            <V4List>
              {q.data.items.map((row) => (
                <V4Row
                  key={row.sessionId}
                  title={t.sessionContext(
                    new Intl.DateTimeFormat('fa-IR', {
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'Asia/Tehran',
                    }).format(new Date(row.startUtc)),
                    row.sessionTitle,
                  )}
                  description={
                    row.recordedAtUtc ? t.recordedStatus(label(row.status)) : label(row.status)
                  }
                  icon={
                    ['Absent', 'NotRecorded'].includes(row.status) ? (
                      <CalendarDays />
                    ) : (
                      <CalendarCheck />
                    )
                  }
                  href={`${base}/sessions/${row.sessionId}`}
                />
              ))}
            </V4List>
          ) : (
            <EmptyState title={t.noHistory} />
          )}
          {(q.data.totalCount > q.data.pageSize || page > 1) && (
            <Pager
              page={page}
              total={q.data.totalCount}
              size={q.data.pageSize}
              onChange={setPage}
            />
          )}
        </>
      )}
    </V5Scene>
  );
}
