'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState, ErrorState, label, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { UserRoundPlus, School } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePersonal, usePersonalApi } from '../provider';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { number } from '@/lib/formatting';
import { ApiError } from '@/lib/api/errors';
import { localCalendarDay, schoolDayRange } from './calendar-model';
import { V5Scene } from '@/components/v5/scene';
import { ClassRoster, SchoolSearch } from './directory';
import { MemberDirectory } from './member-directory';
import { ManagerClassCards, ManagerClassContext, V4ClassList } from './manager-class-cards';
import { ManagerPageHeader } from './manager-page-header';
import s from './school.module.css';
import managerStyle from './manager-workspace.module.css';
import contentStyle from './teacher-content.module.css';
import { base, Card, Field, Pager, Status, useSchoolAction, useSchoolCommand } from './shared';
type S = components['schemas'];
export function Classes({ manage }: { manage: boolean }) {
  const { session } = usePersonal();
  const teacher = !manage && session.context.activeRole === 'Teacher';
  const memory = session.user.id + ':' + contextSignature(session.context) + ':classes:';
  const [search, setSearch] = useViewState(
    memory + 'search',
    '',
    (v): v is string => typeof v === 'string',
  );
  const [selectedId, setSelectedId] = useViewState(
    memory + 'selected',
    '',
    (v): v is string => typeof v === 'string',
  );
  const q = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  const statistics = usePersonalApi<S['ManagerDashboardDto']>('/api/v1/dashboards/manager', {
    enabled: manage,
  });
  const teacherStats = usePersonalApi<S['TeacherDashboardDto']>('/api/v1/dashboards/teacher', {
    enabled: teacher,
  });
  const today = schoolDayRange(localCalendarDay(new Date().toISOString()));
  const sessions = usePersonalApi<S['SessionResult'][]>(
    '/api/v1/academic/schedule?' + new URLSearchParams(today),
    { enabled: teacher, poll: teacher ? 60000 : undefined },
  );
  const [activeOnly, setActiveOnly] = useViewState(
    memory + 'active-only',
    true,
    (value): value is boolean => typeof value === 'boolean',
  );
  const items =
    q.data?.filter(
      (c) =>
        [c.title, c.courseTitle, c.academicPeriodTitle].some((v) => v.includes(search)) &&
        (manage || teacher || !activeOnly || c.status === 'Active'),
    ) ?? [];
  const selected = items.find((c) => c.id === selectedId) ?? items[0];
  if (q.data?.some((item) => item.organizationId !== session.context.organizationId))
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  const staleAvailable =
    q.isError && q.data && q.error instanceof ApiError && q.error.status >= 500;
  if (manage)
    return (
      <V5Scene
        id="MK-455"
        title={uiText.v5Product.manageClasses}
        back={base}
        deep={false}
        layout="table"
        moreLabel={uiText.text_589d5004f227}
        onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
        context={<ManagerClassContext item={selected} />}
        actions={
          q.data && (
            <Button asChild>
              <Link href={base + '/classes/new'}>{uiText.text_fc6eddd72380}</Link>
            </Button>
          )
        }
      >
        {q.isPending ? (
          <LoadingSkeleton />
        ) : q.isError && !staleAvailable ? (
          <ErrorState error={q.error} onRetry={() => void q.refetch()} />
        ) : (
          <>
            {staleAvailable && (
              <ErrorState
                error={q.error}
                staleDataAt={new Date(q.dataUpdatedAt).toISOString()}
                busy={q.isFetching}
                onRetry={() => void q.refetch()}
              />
            )}
            <ManagerClassCards
              items={items}
              counts={statistics.data?.operationalCounts}
              selectedId={selectedId}
              onSelect={setSelectedId}
              search={
                <SchoolSearch
                  variant="bar"
                  label={uiText.text_3fce236a7ccd}
                  initialValue={search}
                  onSearch={setSearch}
                />
              }
            />
          </>
        )}
      </V5Scene>
    );
  if (!teacher && q.isPending)
    return (
      <V5Scene
        id="MK-419"
        title={uiText.text_dd3d2b04ab97}
        back={base}
        onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
        moreLabel={uiText.text_589d5004f227}
      >
        <SchoolSearch
          variant="bar"
          label={uiText.text_3fce236a7ccd}
          initialValue={search}
          onSearch={setSearch}
        />
        <LoadingSkeleton variant="cards" />
      </V5Scene>
    );
  if (q.isSuccess && q.data.length === 0)
    return (
      <V5Scene
        id="MK-422"
        title={uiText.text_f8b9003a2e77}
        back={base}
        onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
        moreLabel={uiText.text_589d5004f227}
      >
        <EmptyState
          variant="v5"
          icon={<School />}
          title={uiText.text_da4ec17decdd}
          description={uiText.text_844f0342e624}
        />
        <Button asChild variant="outline">
          <Link href={base + '/invitations'}>{uiText.text_b70ec4ed1525}</Link>
        </Button>
      </V5Scene>
    );
  return (
    <V5Scene
      id={teacher ? 'MK-87' : 'MK-86'}
      title={teacher ? uiText.v5Product.teachingClasses : uiText.text_7c61d113156b}
      summary={items.slice(0, 3).map((item) => ({
        label: item.title,
        value: [item.courseTitle, item.academicPeriodTitle, label(item.status)]
          .filter(Boolean)
          .join(' · '),
      }))}
      back={base}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      moreLabel={uiText.text_589d5004f227}
    >
      {teacher ? (
        <>
          <nav
            className={uiClass(contentStyle.kinds)}
            aria-label={uiText.v5Product.teachingDestinations}
          >
            <Link href={base + '/classes'} aria-current="page">
              {uiText.text_e7b1ccd0bda3}
            </Link>
            <Link href={base + '/content'}>{uiText.text_f4044f423956}</Link>
          </nav>
          <div
            className={uiClass('stats')}
            data-teacher-statistics
            aria-busy={teacherStats.isPending || sessions.isPending}
          >
            {[
              [q.isSuccess ? q.data.length : undefined, uiText.text_e7b1ccd0bda3],
              [
                teacherStats.isSuccess &&
                teacherStats.data.organizationId === session.context.organizationId
                  ? teacherStats.data.assignmentGradingQueue.awaitingEvaluationCount
                  : undefined,
                uiText.v5Product.teacherNewAnswers,
              ],
              [
                sessions.isSuccess &&
                q.isSuccess &&
                sessions.data.every(
                  (item) => item.organizationId === session.context.organizationId,
                )
                  ? sessions.data.filter(
                      (item) =>
                        item.status !== 'Cancelled' &&
                        q.data.some((classroom) => classroom.id === item.classId),
                    ).length
                  : undefined,
                uiText.v5Product.teacherTodaySessions,
              ],
            ].map(([count, title]) => (
              <div className={uiClass('stat')} key={title}>
                <b
                  aria-label={count === undefined ? uiText.v5Product.summaryUnavailable : undefined}
                >
                  {count === undefined ? '—' : number(Number(count))}
                </b>
                <span>{title}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <SchoolSearch
            variant="bar"
            label={uiText.text_3fce236a7ccd}
            initialValue={search}
            onSearch={setSearch}
          />
          <div
            className={uiClass('chips')}
            role="group"
            aria-label={uiText.v5Product.classStatusFilter}
          >
            <button
              type="button"
              className={uiClass('chip ' + (activeOnly ? 'on' : ''))}
              aria-pressed={activeOnly}
              onClick={() => setActiveOnly(true)}
            >
              {uiText.text_a3fa2a3ffcb9}
            </button>
            <button
              type="button"
              className={uiClass('chip ' + (!activeOnly ? 'on' : ''))}
              aria-pressed={!activeOnly}
              onClick={() => setActiveOnly(false)}
            >
              {uiText.vnext.all}
            </button>
          </div>
        </>
      )}
      {q.isPending ? (
        <LoadingSkeleton variant="cards" />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : items.length ? (
        <V4ClassList
          id={teacher ? 'MK-87' : 'MK-86'}
          items={items}
          learners={
            teacher &&
            teacherStats.isSuccess &&
            teacherStats.data.organizationId === session.context.organizationId
              ? new Map(
                  teacherStats.data.assignedClasses.map((item) => [
                    item.classId,
                    item.activeLearnerCount,
                  ]),
                )
              : undefined
          }
        />
      ) : (
        <>
          <EmptyState
            variant="v5"
            icon={<School />}
            title={q.data?.length ? uiText.text_aca867e37332 : uiText.text_da4ec17decdd}
            description={q.data?.length ? uiText.text_bc49db330f23 : uiText.text_844f0342e624}
          />
          {!q.data?.length && (
            <Button asChild variant="outline">
              <Link href={base + '/invitations'}>{uiText.text_b70ec4ed1525}</Link>
            </Button>
          )}
        </>
      )}
    </V5Scene>
  );
}
export { People } from './person-records';
export function Teachers() {
  return <MemberDirectory initialRole="Teacher" />;
}
export function Enrollments({ classId }: { classId?: string }) {
  const [page, setPage] = useState(1);
  const q = usePersonalApi<S['ReportPageOfManagerEnrollmentReportItem']>(
    `/api/v1/reports/manager/enrollments?PageNumber=${page}&PageSize=30` +
      (classId ? '&ClassId=' + classId : ''),
  );
  if (classId)
    return (
      <>
        <ClassRoster classId={classId} kind="learners" manage />
        <Button asChild>
          <Link href={`${base}/classes/${classId}/enrollments/new`}>
            {uiText.text_e82efffd7b2d}
          </Link>
        </Button>
      </>
    );
  return (
    <Card
      title={classId ? uiText.text_b6f6538e49df : uiText.text_2f6b3c84f920}
      action={
        classId && (
          <Button asChild>
            <Link href={`${base}/classes/${classId}/enrollments/new`}>
              {uiText.text_e82efffd7b2d}
            </Link>
          </Button>
        )
      }
    >
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.items.length ? (
            <div className={uiClass(s.tableWrap)}>
              <table className={uiClass(s.table)}>
                <thead>
                  <tr>
                    <th>{uiText.text_fbd179d162db}</th>
                    <th>{uiText.text_56c43e096bb9}</th>
                    <th>{uiText.text_68d7eb08efbc}</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.items.map((row) => (
                    <tr key={row.enrollmentId}>
                      <td>{row.learnerDisplayName}</td>
                      <td>
                        <Link href={base + '/classes/' + row.classId}>{row.classTitle}</Link>
                      </td>
                      <td>{label(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title={uiText.text_763022dc000f} description={uiText.text_fb368cca5abe} />
          )}
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
    </Card>
  );
}
export function Guardians() {
  const [page, setPage] = useState(1);
  const q = usePersonalApi<S['SchoolGuardianRelationsPage']>(
    `/api/v1/organization/guardian-relations?page=${page}&pageSize=30`,
  );
  return (
    <div className={uiClass(managerStyle.stack)}>
      <ManagerPageHeader
        title={uiText.text_836e8b88a455}
        description={uiText.text_a8f7d5d341fb}
        action={
          <Button asChild>
            <Link href={base + '/guardians/new'}>
              <UserRoundPlus size={19} />
              {uiText.text_4984b636db1a}
            </Link>
          </Button>
        }
      />
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <Card>
            {q.data.items.length ? (
              <div className={uiClass(s.editorList)}>
                {q.data.items.map((r) => (
                  <GuardianRow key={r.id} relation={r} />
                ))}
              </div>
            ) : (
              <EmptyState title={uiText.text_4b50b911a4a4} />
            )}
          </Card>
          <Pager page={page} total={q.data.totalCount} onChange={setPage} />
        </>
      )}
    </div>
  );
}
function GuardianRow({ relation: r }: { relation: S['SchoolGuardianRelationDto'] }) {
  const person = usePersonalApi<S['OrganizationPersonDto']>(
    '/api/v1/organization/people/' + r.learnerOrganizationPersonId,
  );
  const a = useSchoolAction();
  const command = useSchoolCommand();
  const [reason, setReason] = useState('');
  return (
    <div className={uiClass(s.question)}>
      <h3>
        {r.learnerDisplayName ||
          person.data?.displayName ||
          [person.data?.firstName, person.data?.lastName].filter(Boolean).join(' ') ||
          uiText.text_b9c23f90e92a}
      </h3>
      <p className={uiClass(s.hint)}>
        {uiText.text_c9c2548db6d8}
        {r.guardianDisplayName || uiText.vnext.unnamedGuardian}
        {r.guardianUsername && (
          <bdi>
            {uiText.text_25c0dfd543f5}
            {r.guardianUsername}
            {uiText.text_ba5ec51d07a4}
          </bdi>
        )}
      </p>
      <Status>{label(r.status)}</Status>
      {r.status === 'Pending' && (
        <Button
          disabled={a.busy}
          onClick={() =>
            void a.run('/api/v1/organization/guardian-relations/' + r.id + '/activate', {
              expectedRowVersion: r.rowVersion,
              reason: uiText.text_7d11b416e34f,
            })
          }
        >
          {uiText.text_50591f0957ee}
        </Button>
      )}
      {a.feedback}
      {['Active', 'Pending'].includes(r.status) && (
        <>
          <Field label={uiText.text_94eb9f878b58}>
            <NativeInput value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <ConfirmAction
            disabled={!reason.trim()}
            destructive
            title={uiText.text_5fc6fc050d06}
            trigger={uiText.text_67a07cf5da0e}
            confirm={uiText.text_e6a502d4ee2b}
            description={uiText.text_129858da9abc}
            onConfirm={async () => {
              await command(
                `/api/v1/organization/guardian-relations/${r.id}/${r.status === 'Active' ? 'end' : 'revoke'}`,
                { expectedRowVersion: r.rowVersion, reason: reason.trim() },
              );
              return true;
            }}
          />
        </>
      )}
    </div>
  );
}
