'use client';
import { FileUser, ShieldCheck } from 'lucide-react';
import { V5Scene } from '@/components/v5/scene';
import { uiClass } from '@/components/v5/classes';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import { number, date } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { v7Ui as t } from '@/content/fa';
import { usePersonal, usePersonalApi } from '../provider';
import { base } from './shared';

/** Educational data is read from the class report ACL, never from the public people profile. */
export function LearnerRecord({ classId, learnerId }: { classId: string; learnerId: string }) {
  const { session } = usePersonal();
  const allowed =
    session.context.workspaceType === 'Organization' && session.context.activeRole === 'Teacher';
  const q = usePersonalApi<components['schemas']['TeacherLearnerOverviewDto']>(
    `/api/v1/reports/teacher/classes/${classId}/learners/${learnerId}`,
    { enabled: allowed },
  );
  const row = q.data;
  const valid = row?.classId === classId && row.learnerOrganizationPersonId === learnerId;
  return (
    <V5Scene
      id="ORG-47"
      title={t.learnerRecord}
      back={base + '/classes/' + classId + '?tab=learners'}
      kind="list"
    >
      {!allowed ? (
        <ErrorState error={new ApiError(403)} />
      ) : q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : !valid ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : (
        <>
          <section className={uiClass('card')}>
            <h2>
              <FileUser size={24} /> {row.learnerDisplayName}
            </h2>
            <p>{row.classTitle}</p>
            <p className={uiClass('policy')}>{date(row.dataAsOfUtc, true)}</p>
          </section>
          {[
            [
              t.attendanceSummary,
              [
                [t.eligibleSessions, row.eligibleSessionCount],
                [t.present, row.presentCount],
                [t.absent, row.absentCount],
                [t.late, row.lateCount],
                [t.excused, row.excusedCount],
                [t.notRecorded, row.notRecordedCount],
              ],
            ],
            [
              t.assignmentSummary,
              [
                [t.totalAssignments, row.assignmentCount],
                [t.submittedAssignments, row.submittedAssignmentCount],
                [t.releasedAssignments, row.releasedAssignmentCount],
              ],
            ],
            [
              t.examSummary,
              [
                [t.totalExams, row.examCount],
                [t.finalizedExams, row.finalizedExamAttemptCount],
                [t.releasedExams, row.releasedExamCount],
              ],
            ],
          ].map(([title, values]) => (
            <section key={title as string} className={uiClass('card')}>
              <h3>{title as string}</h3>
              {(values as (string | number)[][]).map(([label, value]) => (
                <div className={uiClass('kv')} key={label}>
                  <span className={uiClass('key')}>{label}</span>
                  <b className={uiClass('val')}>{number(Number(value))}</b>
                </div>
              ))}
            </section>
          ))}
          <p className={uiClass('alert')}>
            <ShieldCheck size={18} />
            {t.learnerRecordPrivacy}
          </p>
        </>
      )}
    </V5Scene>
  );
}
