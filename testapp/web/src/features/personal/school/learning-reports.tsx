'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { V5Scene } from '@/components/v5/scene';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { learningReports as t } from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { Field, Pager, base } from './shared';
import { StudentAttendanceHistory } from './student-attendance';
import s from './learning-reports.module.css';
type S = components['schemas'];
type Kind = 'grades' | 'attendance' | 'assignments' | 'exams';
type Row =
  | S['StudentReleasedGradeReportItem']
  | S['StudentAttendanceReportItem']
  | S['StudentAssignmentReportItem']
  | S['StudentExamReportItem']
  | S['TeacherAttendanceReportItem']
  | S['TeacherAssignmentReportItem']
  | S['TeacherExamReportItem'];
type Page = {
  dataAsOfUtc: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: Row[];
};
const titles: Record<Kind, string> = {
  grades: t.grades,
  attendance: t.attendance,
  assignments: t.assignments,
  exams: t.exams,
};

export function LearningReports({ teacher }: { teacher: boolean }) {
  const { session } = usePersonal(),
    params = useSearchParams();
  const permitted =
    session.context.workspaceType === 'Organization' &&
    session.context.activeRole === (teacher ? 'Teacher' : 'Student');
  const kinds: Kind[] = teacher
    ? ['attendance', 'assignments', 'exams']
    : ['grades', 'attendance', 'assignments', 'exams'];
  const kind = kinds.find((k) => k === params.get('kind')) ?? kinds[0];
  const [chosen, setChosen] = useViewState(
    session.user.id + ':' + contextSignature(session.context) + ':learning-reports:class',
    '',
    (v): v is string => typeof v === 'string',
  );
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: permitted && teacher,
  });
  const selected = classes.data?.find((c) => c.id === chosen) ?? classes.data?.[0];
  if (!permitted) return <ErrorState error={new ApiError(403)} />;
  if (!teacher && kind === 'attendance')
    return (
      <StudentAttendanceHistory
        menu={
          <nav className={uiClass(s.tabs)} aria-label={t.categories}>
            {kinds.map((value) => (
              <Link
                key={value}
                href={base + '/reports?kind=' + value}
                aria-current={kind === value ? 'page' : undefined}
              >
                {titles[value]}
              </Link>
            ))}
          </nav>
        }
      />
    );
  return (
    <V5Scene
      id={teacher ? 'MK-162' : 'MK-161'}
      title={teacher ? t.classTitle : t.studentTitle}
      subtitle={selected?.title}
      back={base}
      layout="table"
    >
      <nav className={uiClass(s.tabs)} aria-label={t.categories}>
        {kinds.map((k) => (
          <Link
            key={k}
            href={base + '/reports?kind=' + k}
            aria-current={kind === k ? 'page' : undefined}
          >
            {titles[k]}
          </Link>
        ))}
      </nav>
      {teacher &&
        (classes.isError ? (
          <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
        ) : (
          <Field label={t.class}>
            <NativeSelect
              value={selected?.id ?? ''}
              disabled={classes.isPending}
              onChange={(e) => setChosen(e.target.value)}
            >
              <option value="" disabled>
                {t.chooseClass}
              </option>
              {classes.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </NativeSelect>
          </Field>
        ))}
      {teacher && classes.isPending ? (
        <LoadingSkeleton />
      ) : teacher && !selected ? (
        <EmptyState title={t.noClass} />
      ) : (
        <ReportRows
          key={kind + ':' + (selected?.id ?? '')}
          teacher={teacher}
          kind={kind}
          classId={selected?.id}
        />
      )}
    </V5Scene>
  );
}
function ReportRows({
  teacher,
  kind,
  classId,
}: {
  teacher: boolean;
  kind: Kind;
  classId?: string;
}) {
  const [page, setPage] = useState(1);
  const endpoint = teacher
    ? `/api/v1/reports/teacher/classes/${classId}/${kind}`
    : `/api/v1/reports/student/${kind}`;
  const q = usePersonalApi<Page>(endpoint + `?PageNumber=${page}&PageSize=30`);
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  const rows = q.data.items.map((row, index) => {
    const title = 'title' in row ? row.title : row.sessionTitle;
    const context = 'learnerDisplayName' in row ? row.learnerDisplayName : row.classTitle;
    const when =
      'startUtc' in row
        ? row.startUtc
        : 'releasedAtUtc' in row
          ? row.releasedAtUtc
          : 'dueAtUtc' in row
            ? row.dueAtUtc
            : row.finalizedAtUtc;
    const score =
      'score' in row
        ? row.score
        : !teacher && 'releasedScore' in row && row.releasedAtUtc
          ? row.releasedScore
          : teacher && 'currentScore' in row
            ? row.currentScore
            : null;
    const rawStatus =
      'status' in row
        ? row.status
        : 'evaluationStatus' in row
          ? (row.evaluationStatus ?? row.submissionStatus)
          : 'gradeStatus' in row
            ? (row.gradeStatus ?? row.attemptStatus)
            : 'submissionStatus' in row
              ? row.submissionStatus
              : 'latestAttemptStatus' in row
                ? row.latestAttemptStatus
                : 'kind' in row
                  ? row.kind
                  : null;
    const translated = rawStatus ? label(rawStatus) : t.unknown;
    const status = /[A-Za-z]/.test(translated) ? t.unknown : translated;
    const key =
      'assessmentId' in row
        ? row.assessmentId
        : 'assignmentId' in row
          ? row.assignmentId
          : 'examId' in row
            ? row.examId
            : row.sessionId;
    return {
      key: key + ':' + index,
      title,
      context,
      learnerHref:
        teacher && classId && 'learnerOrganizationPersonId' in row
          ? base + '/classes/' + classId + '/learners/' + row.learnerOrganizationPersonId
          : null,
      status,
      when: when ? date(when, true) : t.unknown,
      score:
        score === null
          ? t.noScore
          : number(score) + ' / ' + ('maximumScore' in row ? number(row.maximumScore) : ''),
    };
  });
  return (
    <div className={uiClass(s.body)}>
      <p className={uiClass(s.updated)}>
        {t.updated}
        {date(q.data.dataAsOfUtc, true)}
      </p>
      {!rows.length ? (
        <EmptyState title={t.empty} description={t.emptyDescription} />
      ) : (
        <>
          <div className={uiClass(s.table)}>
            <table>
              <thead>
                <tr>
                  {[t.title, teacher ? t.learner : t.class, t.status, t.score, t.when].map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.title}</td>
                    <td>
                      {row.learnerHref ? (
                        <Link href={row.learnerHref}>{row.context}</Link>
                      ) : (
                        row.context
                      )}
                    </td>
                    <td>{row.status}</td>
                    <td>{kind === 'attendance' ? t.notApplicable : <bdi>{row.score}</bdi>}</td>
                    <td>{row.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={uiClass(s.cards)}>
            {rows.map((row) => (
              <article className={uiClass('card')} key={row.key}>
                <h2>{row.title}</h2>
                {row.learnerHref && (
                  <Link className={uiClass('text-action')} href={row.learnerHref}>
                    {t.learner}: {row.context}
                  </Link>
                )}
                <dl>
                  {[
                    [teacher ? t.learner : t.class, row.context],
                    [t.status, row.status],
                    ...(kind === 'attendance' ? [] : [[t.score, row.score]]),
                    [t.when, row.when],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>
                        <bdi>{value}</bdi>
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
      <Pager
        page={q.data.pageNumber}
        size={q.data.pageSize}
        total={q.data.totalCount}
        onChange={setPage}
      />
    </div>
  );
}
