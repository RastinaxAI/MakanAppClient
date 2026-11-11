'use client';
import { Input as NativeInput, Textarea as NativeTextarea } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useAcademicScope } from './academic-scope';
import { Button, buttonClass } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { jalaliDisplayValue } from '@/lib/jalali-date';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePersonal, usePersonalApi } from '../provider';
import { useResourceCommand } from '../use-resource-command';
import { CatalogPicker } from './directory';
import { ClassMembersOverview } from './class-members';
import { ClassMemberAssignment } from './member-assignment';
import { GuardianInvitationForm } from './onboarding';
import { AddQuestion } from './exams';
import { ExamForm } from './exam-form';
import { ExamQuestionForm } from './exam-question-form';
import { Field, toUtc, useSchoolAction } from './shared';
import { WorkflowForm, WorkflowPage, useWorkflowDraft } from './workflow';
import s from './school.module.css';
import managerStyle from './manager-workspace.module.css';
type S = components['schemas'];
const authors = ['Manager', 'Teacher'];
export function ClassCreatePage() {
  const { base } = useAcademicScope();
  return (
    <WorkflowPage form title={uiText.text_fc6eddd72380} back={base + '/classes'}>
      <ClassCreator />
    </WorkflowPage>
  );
}
function ClassCreator() {
  const { base } = useAcademicScope();
  const d = useWorkflowDraft('class:new', {
      title: '',
      course: '',
      courseTitle: '',
      period: '',
      periodTitle: '',
      capacity: '',
      active: true,
    }),
    a = useResourceCommand('school-class:new');
  const [created, setCreated] = useState<S['ClassResult']>();
  const valid =
    !!d.values.title.trim() &&
    !!d.values.course &&
    !!d.values.period &&
    Number.isInteger(Number(d.values.capacity)) &&
    Number(d.values.capacity) > 0;
  if (created)
    return (
      <section className={uiClass(s.receipt)}>
        <h2>{uiText.text_946c6e906859}</h2>
        <p>{created.title}</p>
        <div className={uiClass(managerStyle.steps)}>
          <div>
            <span>{uiText.text_f911d7c42a09}</span>
            <Button asChild>
              <Link href={`${base}/classes/${created.id}/teachers/new`}>
                {uiText.text_78535b54c92b}
              </Link>
            </Button>
          </div>
          <div>
            <span>{uiText.text_29f48210ac93}</span>
            <Button asChild>
              <Link href={`${base}/classes/${created.id}/enrollments/new`}>
                {uiText.text_cc708e53902b}
              </Link>
            </Button>
          </div>
        </div>
        <Button asChild>
          <Link href={`${base}/classes/${created.id}`}>{uiText.text_e0c1b3a8ec7a}</Link>
        </Button>
      </section>
    );
  return (
    <WorkflowForm
      busy={a.busy}
      ready={d.ready}
      canCommit={valid}
      onSave={async () => {
        if (!valid) return;
        const result = await a.run<S['ClassResult']>(
          '/api/v1/academic/classes',
          {
            title: d.values.title.trim(),
            courseId: d.values.course,
            academicPeriodId: d.values.period,
            capacity: Number(d.values.capacity),
            activateImmediately: d.values.active,
          },
          { idempotent: true },
        );
        if (result) {
          d.reset();
          setCreated(result.value);
        }
      }}
      error={
        <>
          {a.feedback}
          {!valid && <p className={uiClass(s.hint)}>{uiText.text_5fb4677a90df}</p>}
        </>
      }
      rows={[
        [
          uiText.v5Product.educationalPeriod,
          d.values.periodTitle || (d.values.period ? uiText.text_f240dea8c236 : ''),
        ],
        [
          uiText.v5Product.courseCatalog,
          d.values.courseTitle || (d.values.course ? uiText.text_f240dea8c236 : ''),
        ],
        [uiText.v5Product.classTitle, d.values.title],
        [uiText.text_57400196e6de, d.values.capacity],
        [
          uiText.text_eabfbd7982f4,
          d.values.active ? uiText.text_a3fa2a3ffcb9 : uiText.text_4e67bd8e3482,
        ],
      ]}
      notice={uiText.text_1227743339e4}
    >
      <CatalogPicker
        kind="periods"
        value={d.values.period}
        valueTitle={d.values.periodTitle}
        onChange={(id, title) => {
          d.set('period', id);
          d.set('periodTitle', title);
        }}
        createHref={base + '/periods/new'}
        createLabel={uiText.text_51add6a204d5}
      />
      <CatalogPicker
        kind="courses"
        value={d.values.course}
        valueTitle={d.values.courseTitle}
        onChange={(id, title) => {
          d.set('course', id);
          d.set('courseTitle', title);
        }}
        createHref={base + '/courses/new'}
        createLabel={uiText.text_9f30c2048bc7}
      />
      <Field label={uiText.v5Product.classTitle}>
        <NativeInput
          required
          value={d.values.title}
          onChange={(e) => d.set('title', e.target.value)}
        />
      </Field>
      <Field label={uiText.text_57400196e6de}>
        <NativeInput
          required
          min={1}
          step={1}
          type="number"
          value={d.values.capacity}
          onChange={(e) => d.set('capacity', e.target.value)}
        />
      </Field>
      <label className={uiClass(s.check)}>
        <NativeInput
          type="checkbox"
          checked={d.values.active}
          onChange={(e) => d.set('active', e.target.checked)}
        />
        {uiText.v5Product.activateClassAfterCreate}
      </label>
    </WorkflowForm>
  );
}
export function CatalogCreatePage({ kind }: { kind: 'courses' | 'periods' }) {
  const { base } = useAcademicScope();
  return (
    <WorkflowPage
      form
      title={kind === 'courses' ? uiText.text_bc7837ca0bbb : uiText.v5SchoolForms.newPeriod}
      back={base + '/classes/new'}
    >
      <CatalogCreator kind={kind} />
    </WorkflowPage>
  );
}
function CatalogCreator({ kind }: { kind: 'courses' | 'periods' }) {
  const { base } = useAcademicScope();
  const { session } = usePersonal();
  const d = useWorkflowDraft('catalog:' + kind, { title: '', start: '', end: '' }),
    a = useSchoolAction();
  const [saved, setSaved] = useState(false);
  const valid =
    !!d.values.title.trim() &&
    (kind === 'courses' || (!!d.values.start && !!d.values.end && d.values.end >= d.values.start));
  if (saved)
    return (
      <section className={uiClass(s.receipt)}>
        <h2>{kind === 'courses' ? uiText.text_a8e9400f558e : uiText.text_55dd273e4ada}</h2>
        <Button asChild>
          <Link href={base + '/classes/new'}>{uiText.text_75454f626ebf}</Link>
        </Button>
      </section>
    );
  return (
    <WorkflowForm
      busy={a.busy}
      ready={d.ready}
      canCommit={valid}
      rows={[
        [
          kind === 'periods' ? uiText.v5SchoolForms.periodTitle : uiText.text_74190f4bb095,
          d.values.title,
        ],
        ...(kind === 'periods'
          ? ([
              [
                uiText.v5SchoolForms.startDate,
                d.values.start ? jalaliDisplayValue(d.values.start) : '',
              ],
              [uiText.v5SchoolForms.endDate, d.values.end ? jalaliDisplayValue(d.values.end) : ''],
            ] as [string, string][])
          : []),
      ]}
      error={
        <>
          {a.feedback}
          {!valid && !!d.values.title.length && (
            <p className={uiClass(s.hint)}>{uiText.text_e847e6618d02}</p>
          )}
        </>
      }
      onSave={async () => {
        if (!valid) return;
        const result = await a.run<S['CourseResult'] | S['AcademicPeriodResult']>(
          '/api/v1/academic/' + kind,
          {
            title: d.values.title.trim(),
            ...(kind === 'periods' ? { startDate: d.values.start, endDate: d.values.end } : {}),
          },
          'POST',
          (row) => row.organizationId === session.context.organizationId,
        );
        if (result) {
          d.reset();
          setSaved(true);
        }
      }}
    >
      <Field label={kind === 'courses' ? uiText.text_9398dccd15ef : uiText.text_8ce15ef5c0a9}>
        <NativeInput
          required
          value={d.values.title}
          onChange={(e) => d.set('title', e.target.value)}
        />
      </Field>
      {kind === 'periods' && (
        <>
          <Field label={uiText.v5SchoolForms.startDate}>
            <JalaliDateInput
              required
              value={d.values.start}
              onValueChange={(v) => d.set('start', v)}
            />
          </Field>
          <Field label={uiText.v5SchoolForms.endDate}>
            <JalaliDateInput
              min={d.values.start}
              required
              value={d.values.end}
              onValueChange={(v) => d.set('end', v)}
            />
          </Field>
        </>
      )}
    </WorkflowForm>
  );
}
export { PersonFormPage, PersonDetailPage } from './person-records';
export function SessionCreatePage({ classId }: { classId: string }) {
  const { base } = useAcademicScope();
  return (
    <WorkflowPage
      form
      roles={authors}
      classId={classId}
      title={uiText.v5Product.newSession}
      back={`${base}/classes/${classId}?tab=sessions`}
    >
      <SessionCreator classId={classId} />
    </WorkflowPage>
  );
}
function SessionCreator({ classId }: { classId: string }) {
  const { base } = useAcademicScope();
  const [timeZone, setTimeZone] = useState('');
  useEffect(() => setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  const zoneLabel = timeZone === 'Asia/Tehran' ? uiText.v5Product.tehranTimeZone : timeZone;
  const d = useWorkflowDraft('session:new:' + classId, { title: '', start: '', end: '', link: '' }),
    a = useSchoolAction(),
    router = useRouter();
  const valid =
    !!d.values.title.trim() &&
    Number.isFinite(Date.parse(d.values.start)) &&
    Date.parse(d.values.end) > Date.parse(d.values.start);
  return (
    <WorkflowForm
      ready={d.ready && !!timeZone}
      canCommit={valid}
      busy={a.busy}
      rows={[
        [uiText.v5SchoolForms.sessionTitle, d.values.title],
        [
          uiText.v5SchoolForms.start,
          d.values.start ? jalaliDisplayValue(d.values.start, true, true) : '',
        ],
        [
          uiText.v5SchoolForms.end,
          d.values.end ? jalaliDisplayValue(d.values.end, true, true) : '',
        ],
        [uiText.v5Product.timeZone, zoneLabel],
        [uiText.text_ea3eced42f9c, d.values.link],
      ]}
      error={
        <>
          {a.feedback}
          {!valid && <p className={uiClass(s.hint)}>{uiText.text_73b7befc5afa}</p>}
        </>
      }
      onSave={async () => {
        if (!valid) return;
        const result = await a.run<S['SessionResult']>(
          `/api/v1/academic/classes/${classId}/sessions`,
          {
            title: d.values.title.trim(),
            startUtc: toUtc(d.values.start),
            endUtc: toUtc(d.values.end),
            timeZoneId: timeZone,
            meetingUrl: d.values.link.trim() || null,
          },
        );
        if (result) {
          d.reset();
          router.replace(`${base}/sessions/${result.id}`);
        }
      }}
    >
      <Field label={uiText.text_70786012eed4}>
        <NativeInput
          required
          value={d.values.title}
          onChange={(e) => d.set('title', e.target.value)}
        />
      </Field>
      <Field label={uiText.v5SchoolForms.start}>
        <JalaliDateInput
          withTime
          compactTimeDate
          required
          value={d.values.start}
          onValueChange={(v) => d.set('start', v)}
        />
      </Field>
      <Field label={uiText.v5SchoolForms.end}>
        <JalaliDateInput
          withTime
          compactTimeDate
          required
          value={d.values.end}
          onValueChange={(v) => d.set('end', v)}
        />
      </Field>
      <Field label={uiText.v5Product.timeZone}>
        <NativeInput
          readOnly
          value={zoneLabel}
          aria-description={uiText.v5Product.sessionTimeZoneHint}
        />
      </Field>
      <Field label={uiText.v5Product.optionalSessionLink}>
        <NativeInput
          type="url"
          dir="ltr"
          value={d.values.link}
          onChange={(e) => d.set('link', e.target.value)}
        />
      </Field>
    </WorkflowForm>
  );
}
export function ExamCreatePage({ classId }: { classId: string }) {
  const { classPath, personal } = useAcademicScope();
  return (
    <WorkflowPage
      form
      roles={authors}
      classId={classId}
      title={uiText.text_00f6d8e48e00}
      back={classPath(classId) + '/exams'}
    >
      {personal ? <ExamCreator classId={classId} /> : <ExamForm key={classId} classId={classId} />}
    </WorkflowPage>
  );
}
function ExamCreator({ classId }: { classId: string }) {
  const { classApi } = useAcademicScope();
  const { base } = useAcademicScope();
  const d = useWorkflowDraft('exam:new:' + classId, {
      title: '',
      description: '',
      start: '',
      end: '',
      duration: '',
      attempts: '',
      score: '',
      random: false,
    }),
    a = useSchoolAction(),
    router = useRouter();
  const valid =
    !!d.values.title.trim() &&
    Date.parse(d.values.end) > Date.parse(d.values.start) &&
    Number(d.values.duration) > 0 &&
    Number.isInteger(Number(d.values.duration)) &&
    Number(d.values.attempts) > 0 &&
    Number.isInteger(Number(d.values.attempts)) &&
    d.values.score !== '' &&
    Number(d.values.score) > 0;
  return (
    <WorkflowForm
      ready={d.ready}
      canCommit={valid}
      busy={a.busy}
      rows={[
        [uiText.text_74190f4bb095, d.values.title],
        [uiText.text_8ea5a5c720cd, date(d.values.start, true)],
        [uiText.text_5cff509ed1c9, date(d.values.end, true)],
        [uiText.text_3a48c2c3e3b8, d.values.duration],
        [uiText.text_0fe100cdea24, d.values.attempts],
        [uiText.text_25823dfdfd3f, d.values.score],
      ]}
      button={uiText.text_938008426aca}
      notice={uiText.text_a748d1afb9b2}
      error={
        <>
          {a.feedback}
          {!valid && <p className={uiClass(s.hint)}>{uiText.text_8476a4fa8850}</p>}
        </>
      }
      onSave={async () => {
        if (!valid) return;
        const result = await a.run<S['ExamEditorDto']>(classApi(classId) + '/exams', {
          title: d.values.title.trim(),
          description: d.values.description.trim() || null,
          availableFromUtc: toUtc(d.values.start),
          availableUntilUtc: toUtc(d.values.end),
          durationMinutes: Number(d.values.duration),
          maxAttempts: Number(d.values.attempts),
          maxScore: Number(d.values.score),
          randomizationPolicy: d.values.random ? 'QuestionOrder' : 'None',
        });
        if (result) {
          d.reset();
          router.replace(`${base}/exams/${result.id}/edit`);
        }
      }}
    >
      <Field label={uiText.text_981230e1e35e}>
        <NativeInput
          required
          value={d.values.title}
          onChange={(e) => d.set('title', e.target.value)}
        />
      </Field>
      <Field label={uiText.text_4a72e6b798a7}>
        <NativeTextarea
          value={d.values.description}
          onChange={(e) => d.set('description', e.target.value)}
        />
      </Field>
      <Field label={uiText.text_8ea5a5c720cd}>
        <JalaliDateInput
          withTime
          required
          value={d.values.start}
          onValueChange={(v) => d.set('start', v)}
        />
      </Field>
      <Field label={uiText.text_5cff509ed1c9}>
        <JalaliDateInput
          withTime
          required
          value={d.values.end}
          onValueChange={(v) => d.set('end', v)}
        />
      </Field>
      {(
        [
          ['duration', uiText.text_2cced62fbe37],
          ['attempts', uiText.text_6c1546f241c8],
          ['score', uiText.text_25823dfdfd3f],
        ] as const
      ).map(([key, title]) => (
        <Field key={key} label={title}>
          <NativeInput
            type="number"
            min={key === 'score' ? 0 : 1}
            step={key === 'score' ? 'any' : 1}
            required
            value={d.values[key]}
            onChange={(e) => d.set(key, e.target.value)}
          />
        </Field>
      ))}
      <label className={uiClass(s.check)}>
        <NativeInput
          type="checkbox"
          checked={d.values.random}
          onChange={(e) => d.set('random', e.target.checked)}
        />
        {uiText.text_61f1cd67e9a3}
      </label>
    </WorkflowForm>
  );
}
export function GuardianCreatePage() {
  const { base } = useAcademicScope();
  return (
    <WorkflowPage title={uiText.text_c82d6822d030} back={base + '/guardians'}>
      <section className={uiClass(s.card)}>
        <GuardianInvitationForm />
      </section>
    </WorkflowPage>
  );
}
export function ClassMembersPage({
  classId,
  kind,
}: {
  classId: string;
  kind: 'learners' | 'teachers' | 'all';
}) {
  const { base } = useAcademicScope();
  const teachers = useSearchParams().get('member') === 'teachers';
  const { session } = usePersonal();
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled:
      session.context.workspaceType === 'Organization' &&
      ['Manager', 'Teacher'].includes(session.context.activeRole ?? ''),
  });
  const classroom = classes.data?.find(
    (item) => item.id === classId && item.organizationId === session.context.organizationId,
  );
  return (
    <WorkflowPage
      form={kind !== 'all'}
      classNotice={false}
      classId={classId}
      roles={kind === 'all' ? authors : ['Manager']}
      scenario={kind === 'all' ? (teachers ? 'MK-101' : 'MK-98') : undefined}
      menu={
        kind === 'all' ? (
          <nav className={uiClass('stack')} aria-label={uiText.v5Product.classMemberTypes}>
            <Link
              className={uiClass(buttonClass('button button-outline'))}
              href={`${base}/classes/${classId}/members?member=learners`}
            >
              {uiText.v5Product.classLearners}
            </Link>
            <Link
              className={uiClass(buttonClass('button button-outline'))}
              href={`${base}/classes/${classId}/members?member=teachers`}
            >
              {uiText.v5Product.classTeachers}
            </Link>
          </nav>
        ) : undefined
      }
      title={
        kind === 'all'
          ? teachers
            ? classroom
              ? uiText.v5Product.classTeachersPrefix + classroom.title
              : uiText.v5Product.classTeachers
            : uiText.v5Product.classLearners
          : kind === 'learners'
            ? uiText.text_e82efffd7b2d
            : uiText.text_0766ac45d984
      }
      back={`${base}/classes/${classId}`}
    >
      {kind === 'all' ? (
        <ClassMembersOverview classId={classId} showSwitcher={false} />
      ) : (
        <ClassMemberAssignment key={classId + ':' + kind} classId={classId} kind={kind} />
      )}
    </WorkflowPage>
  );
}
export function QuestionCreatePage({ id }: { id: string }) {
  const { base, personal } = useAcademicScope();
  return (
    <WorkflowPage
      form={!personal}
      roles={authors}
      title={uiText.text_78bf2b9b9225}
      back={`${base}/exams/${id}/edit`}
    >
      <QuestionCreator id={id} />
    </WorkflowPage>
  );
}
function QuestionCreator({ id }: { id: string }) {
  const scope = useAcademicScope(),
    { base } = scope;
  const q = usePersonalApi<S['ExamEditorDto']>(`/api/v1/academic/exams/${id}/editor`),
    router = useRouter();
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (q.data.id !== id || !scope.matches(q.data)) return <ErrorState error={new ApiError(404)} />;
  if (q.data.versionStatus !== 'Draft') return <ErrorState error={new ApiError(403)} />;
  if (!scope.personal)
    return (
      <ExamQuestionForm
        key={id}
        exam={q.data}
        onSaved={() => router.replace(`${base}/exams/${id}/edit`)}
        onRefresh={() => q.refetch()}
      />
    );
  return (
    <section className={uiClass(s.card)}>
      <h2>{q.data.title}</h2>
      <AddQuestion exam={q.data} onSaved={() => router.replace(`${base}/exams/${id}/edit`)} />
    </section>
  );
}
