'use client';
import {
  Select as NativeSelect,
  Input as NativeInput,
  Textarea as NativeTextarea,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useAcademicScope } from './academic-scope';
import { ActivityDeliveryStatus } from './activity-delivery';
import { Button } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { EmptyState, ErrorState, label, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { date } from '@/lib/formatting';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePersonal, usePersonalApi } from '../provider';
import { AssignmentForm } from './assignment-form';
import { AssignmentFiles } from './assignment-files';
import { V5Scene } from '@/components/v5/scene';
import { ApiError } from '@/lib/api/errors';
import f from './reference-form.module.css';
import s from './school.module.css';
import { Card, Field, Pager, SchoolHeading, Status, toUtc, useSchoolAction } from './shared';
type S = components['schemas'];
export function Assignments({ classId, teach }: { classId?: string; teach: boolean }) {
  const { base } = useAcademicScope();
  const [chosen, setChosen] = useState(classId ?? '');
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: !classId,
  });
  const q = usePersonalApi<S['AssignmentResult'][]>(
    '/api/v1/academic/classes/' + chosen + '/assignments',
    { enabled: !!chosen },
  );
  return (
    <>
      <SchoolHeading
        title={uiText.text_e8fed4d47d62}
        description={teach ? uiText.text_1e4beb165475 : uiText.text_12930efb22f3}
        action={
          teach &&
          chosen && (
            <Button asChild>
              <Link href={`${base}/classes/${chosen}/assignments/new`}>
                {uiText.text_66eea532efc0}
              </Link>
            </Button>
          )
        }
      />
      {!classId && (
        <Card>
          <Field label={uiText.text_c476f4996767}>
            <NativeSelect value={chosen} onChange={(e) => setChosen(e.target.value)}>
              <option value="">{uiText.text_64a80eb6ce5b}</option>
              {classes.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </NativeSelect>
          </Field>
          {classes.isError && <ErrorState error={classes.error} />}
        </Card>
      )}
      {chosen &&
        (q.isPending ? (
          <LoadingSkeleton />
        ) : q.isError ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : q.data.length ? (
          <div className={uiClass(s.grid)}>
            {q.data.map((a) => (
              <article key={a.id} className={uiClass(s.classCard)}>
                <Status>{label(a.status)}</Status>
                <h2>{a.title}</h2>
                <p>
                  {a.classTitle}
                  <br />
                  {uiText.text_fbb3425cdeea}
                  {date(a.dueAtUtc, true)}
                </p>
                <footer className={uiClass(s.cardActions)}>
                  <Button asChild>
                    <Link
                      href={base + '/assignments/' + a.id}
                      aria-label={uiText.text_3a93670cd3c7 + a.title}
                    >
                      {uiText.text_5588a43e9669}
                    </Link>
                  </Button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState title={uiText.text_5cb8d6841586} />
          </Card>
        ))}
    </>
  );
}
export function AssignmentFormPage({ classId }: { classId: string }) {
  const { session } = usePersonal();
  const scope = useAcademicScope();
  if (
    scope.personal
      ? !scope.personal.assignments
      : session.context.workspaceType !== 'Organization' ||
        !['Teacher', 'Manager'].includes(session.context.activeRole ?? '')
  )
    return <ErrorState error={new ApiError(403)} />;
  return scope.personal ? (
    <CreateAssignment classId={classId} />
  ) : (
    <AssignmentForm key={classId} classId={classId} />
  );
}
function CreateAssignment({ classId }: { classId: string }) {
  const { base, classApi, classPath, personal } = useAcademicScope();
  const a = useSchoolAction(),
    router = useRouter();
  return (
    <V5Scene
      id={personal ? 'MK-60' : 'MK-141'}
      title={uiText.text_6ddab36198ac}
      back={classPath(classId)}
      schoolForm
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      actions={
        <Button type="submit" disabled={a.busy}>
          {uiText.text_6cac361a9d88}
        </Button>
      }
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const result = await a.run<S['AssignmentResult']>(classApi(classId) + '/assignments', {
          title: f.get('title'),
          description: f.get('description'),
          dueAtUtc: toUtc(String(f.get('due'))),
          allowLateSubmission: f.get('late') === 'on',
          maxAttempts: Number(f.get('attempts')),
          maxScore: Number(f.get('score')),
        });
        if (result) router.push(base + '/assignments/' + result.id);
      }}
    >
      <p className={uiClass(f.intro)}>{uiText.text_f71501099cc4}</p>
      <fieldset data-v5-workflow-fields disabled={a.busy}>
        <Field label={uiText.text_c864088e1061}>
          <NativeInput required name="title" />
        </Field>
        <Field label={uiText.text_1d3c268468ff}>
          <NativeTextarea required name="description" />
        </Field>
        <h2 className={uiClass(f.sectionLabel)}>{uiText.text_8dfc669046e4}</h2>
        <Field label={uiText.text_2b26e703adf2}>
          <JalaliDateInput required withTime name="due" />
        </Field>
        <div className={uiClass(s.two)}>
          <Field label={uiText.text_0e469bc1ffab}>
            <NativeInput name="attempts" type="number" required min={1} step={1} />
          </Field>
          <Field label={uiText.text_25823dfdfd3f}>
            <NativeInput name="score" type="number" required min={0.01} step="0.01" />
          </Field>
        </div>
        <label className={uiClass(s.check)}>
          <NativeInput name="late" type="checkbox" />
          {uiText.text_8dd151936022}
        </label>
      </fieldset>
      {a.feedback}
    </V5Scene>
  );
}
export function AssignmentDetail({ id, teach }: { id: string; teach: boolean }) {
  const scope = useAcademicScope();
  const { base, routes: schoolRoutes } = useAcademicScope();
  const q = usePersonalApi<S['AssignmentResult']>('/api/v1/academic/assignments/' + id);
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  const item = q.data;
  if (item.id !== id || !scope.matches(item)) return <ErrorState error={new ApiError(404)} />;
  return (
    <>
      <SchoolHeading title={item.title} description={item.classTitle} back />
      <Card>
        <div className={uiClass(s.row)}>
          <Status>{label(item.status)}</Status>
          <span>
            {uiText.text_fbb3425cdeea}
            {date(item.dueAtUtc, true)}
          </span>
          <span>
            {uiText.text_895fe6a2fd56}
            {item.maxScore}
          </span>
        </div>
        <p className={uiClass(s.bodyText)}>{item.description}</p>
        {!scope.personal && <AssignmentFiles value={item} />}
        {teach && (!scope.personal || scope.personal.assignments) && item.status === 'Draft' && (
          <div className={uiClass(s.row)}>
            <Button asChild variant="outline">
              <Link href={`${base}/assignments/${id}/edit`}>{uiText.text_1d3577cf9675}</Link>
            </Button>
            <Button asChild>
              <Link href={`${base}/assignments/${id}/publish-review`}>
                {uiText.text_4d420238b323}
              </Link>
            </Button>
          </div>
        )}
      </Card>
      {teach && !scope.personal && item.status === 'Published' && (
        <ActivityDeliveryStatus
          classId={item.classId}
          kind="Assignment"
          sourceVersionId={item.versionId}
        />
      )}
      {teach && (!scope.personal || scope.personal.grade) ? (
        <Card title={uiText.text_3b74a41eb771}>
          <Button asChild>
            <Link href={`${base}/assignments/${id}/evaluations`}>{uiText.text_6475ed5d6ade}</Link>
          </Button>
        </Card>
      ) : (
        (!scope.personal || scope.personal.ownResults) && (
          <Card title={uiText.text_185168f80806}>
            <Button asChild>
              <Link href={schoolRoutes.answer(id)}>{uiText.text_2ea16ced02c4}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${base}/assignments/${id}/history`}>{uiText.text_73b4dad6356e}</Link>
            </Button>
          </Card>
        )
      )}
    </>
  );
}
export { Schedule } from './schedule';
export function TeacherLearners({ classId }: { classId: string }) {
  const { base } = useAcademicScope();
  const dashboard = usePersonalApi<S['TeacherDashboardDto']>('/api/v1/dashboards/teacher');
  const assigned = dashboard.data?.assignedClasses.find((item) => item.classId === classId);
  const [page, setPage] = useState(1);
  const q = usePersonalApi<S['ReportPageOfTeacherAssignmentReportItem']>(
    `/api/v1/reports/teacher/classes/${classId}/assignments?PageNumber=${page}&PageSize=30`,
  );
  return (
    <Card title={uiText.text_e443a9f2c748}>
      {assigned && (
        <p className={uiClass(s.notice)}>
          {uiText.text_5e21cda4898b}{' '}
          {new Intl.NumberFormat('fa-IR').format(assigned.activeLearnerCount)}
          {uiText.text_56bfaedd15bf}
        </p>
      )}
      <p className={uiClass(s.hint)}>{uiText.text_1cab39a10925}</p>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} />
      ) : (
        <>
          {q.data.items.length ? (
            <div className={uiClass(s.tableWrap)}>
              <table className={uiClass(s.table)}>
                <thead>
                  <tr>
                    <th>{uiText.text_fbd179d162db}</th>
                    <th>{uiText.text_b9bdf50e5da3}</th>
                    <th>{uiText.text_87479d632cb0}</th>
                    <th>{uiText.text_2b9d6b6b7916}</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.items.map((row) => (
                    <tr key={row.assignmentVersionId + row.enrollmentId}>
                      <td>{row.learnerDisplayName}</td>
                      <td>
                        <Link href={base + '/assignments/' + row.assignmentId}>{row.title}</Link>
                      </td>
                      <td>
                        {row.submissionStatus
                          ? label(row.submissionStatus)
                          : uiText.text_2675dd46965d}
                      </td>
                      <td>{row.currentScore ?? uiText.text_ad09745dadec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={uiText.text_0f71dc23b496} />
          )}
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
    </Card>
  );
}
