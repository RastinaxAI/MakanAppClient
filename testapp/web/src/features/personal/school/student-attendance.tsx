'use client';
import { uiClass } from '@/components/v5/classes';

import { CalendarCheck, CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import type { components } from '@/generated/api/schema';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { v5Attendance as t, v5Sessions } from '@/content/fa';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import { number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { base, Pager } from './shared';
type S = components['schemas'];

export function StudentAttendanceHistory({ menu }: { menu: ReactNode }) {
  const { session } = usePersonal();
  const permitted =
    session.context.workspaceType === 'Organization' && session.context.activeRole === 'Student';
  const [page, setPage] = useViewState(
    session.user.id + ':' + contextSignature(session.context) + ':student-attendance:page',
    1,
    (value): value is number => Number.isInteger(value) && Number(value) > 0,
  );
  const q = usePersonalApi<S['AttendanceReportPageOfStudentAttendanceReportItem']>(
    `/api/v1/reports/student/attendance?PageNumber=${page}&PageSize=30`,
    { enabled: permitted },
  );
  if (!permitted) return <ErrorState error={new ApiError(403)} />;
  const summary = q.data?.summary;
  return (
    <V5Scene id="MK-130" title={v5Sessions.myAttendance} back={base + '/reports'} menu={menu}>
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
