'use client';
import * as uiText from '@/content/fa';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ClipboardList, CalendarDays, NotebookPen, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { V4List, V4Row } from '@/components/v4/page';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ConnectionNotice } from '@/components/ui/connection-notice';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { useWorkspaceSnapshot } from '../workspaces';
import {
  nearestUpcoming,
  currentSchoolWeek,
  schoolWeekRange,
  localCalendarDay,
} from './calendar-model';
import { base } from './shared';
import layout from './dashboard-layout.module.css';
import { SchoolQuickActions } from './quick-actions';
type S = components['schemas'];
type Dashboard = S['ManagerDashboardDto'] | S['TeacherDashboardDto'] | S['StudentDashboardDto'];
const t = uiText.v6Ui;
export function SchoolFeed() {
  const router = useRouter();
  const [newActivity, setNewActivity] = useState<'assignments' | 'exams' | 'lessons' | null>(null),
    [activityClass, setActivityClass] = useState('');
  const { session } = usePersonal(),
    role = session.context.activeRole,
    student = role === 'Student';
  const spaces = useWorkspaceSnapshot();
  const organization =
    spaces.data?.workspaces.find(
      (space) =>
        space.organizationId === session.context.organizationId &&
        space.membershipId === session.context.membershipId &&
        space.role === role,
    )?.organizationName ?? uiText.navigation_education;
  const dashboard = usePersonalApi<Dashboard>('/api/v1/dashboards/' + role!.toLowerCase(), {
    poll: 10000,
  });
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  if (dashboard.isPending) return <LoadingSkeleton />;
  if (dashboard.isError && !dashboard.data)
    return <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />;
  const d = dashboard.data!;
  if (
    d.organizationId !== session.context.organizationId ||
    classes.data?.some((c) => c.organizationId !== session.context.organizationId)
  )
    return <ErrorState error={new ApiError(409)} />;
  const sessions =
    'upcomingSessions' in d ? d.upcomingSessions : d.nextSession ? [d.nextSession] : [];
  const scheduled = sessions.filter((item) => item.status === 'Scheduled');
  const nextSession = nearestUpcoming(scheduled, (item) => item.startUtc);
  const candidate = 'nearestAssignmentDeadline' in d ? d.nearestAssignmentDeadline : null;
  const nextAssignment =
    student && candidate && nearestUpcoming([candidate], (item) => item.dueAtUtc);
  const exams = 'upcomingExams' in d ? d.upcomingExams : [];
  const nextExam = nearestUpcoming(exams, (item) => item.availableFromUtc);
  const name = session.user.firstName || session.user.displayName || uiText.text_2018071defea;
  const grading = 'assignmentGradingQueue' in d ? d.assignmentGradingQueue.totalPendingCount : 0;
  const today = localCalendarDay(d.dataAsOfUtc);
  return (
    <>
      <ConnectionNotice
        cached={!!dashboard.data}
        error={dashboard.isError}
        onRetry={() => void dashboard.refetch()}
      />
      <section className={layout.welcome}>
        <h2>{uiText.serverAlignedUi.schoolGreeting(name)}</h2>
        <p>
          {organization} · {student ? t.schoolProgram : t.schoolTeaching}
        </p>
      </section>
      <SchoolQuickActions />
      {student && (
        <nav className={layout.week} aria-label={uiText.v5Product.weekNavigation}>
          {schoolWeekRange(currentSchoolWeek(new Date(d.dataAsOfUtc))).days.map((day) => (
            <Link
              key={day.date}
              href={base + '/schedule?day=' + day.date}
              aria-label={day.label}
              aria-current={day.date === today ? 'date' : undefined}
            >
              <span aria-hidden="true">{Array.from(day.weekday)[0]}</span>
              <b>
                {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', timeZone: 'UTC' }).format(
                  new Date(day.date + 'T12:00:00Z'),
                )}
              </b>
            </Link>
          ))}
        </nav>
      )}
      <section className={nextSession ? layout.sessionHero : layout.sessionEmpty}>
        <h3>{student ? t.schoolNextSession : t.schoolSoonSession}</h3>
        {nextSession ? (
          <>
            <h2>{nextSession.classTitle}</h2>
            <p>{nextSession.title}</p>
            <div className={layout.sessionTime}>
              <span>{t.schoolTime}</span>
              <b>{date(nextSession.startUtc, true)}</b>
            </div>
            <Button asChild>
              <Link href={base + '/sessions/' + nextSession.sessionId}>
                {uiText.text_7841d322609a}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <p>{uiText.v5Product.noUpcomingSession}</p>
            <Button asChild variant="outline">
              <Link href={base + '/schedule'}>
                <CalendarDays size={19} />
                {uiText.text_15aa7009c6f2}
              </Link>
            </Button>
          </>
        )}
      </section>
      {student && (
        <div className={layout.metrics}>
          {[
            [
              uiText.serverAlignedUi.activeClasses,
              classes.data ? classes.data.filter((c) => c.status === 'Active').length : null,
            ],
            [t.schoolPending, 'pendingAssignmentCount' in d ? d.pendingAssignmentCount : null],
            [
              t.schoolTodaySessions,
              scheduled.filter((item) => localCalendarDay(item.startUtc) === today).length,
            ],
          ].map(([label, value]) => (
            <div className={layout.metric} key={label}>
              <strong>{value === null ? '—' : number(Number(value))}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
      <div className={layout.grid}>
        <section className={layout.section}>
          <h3>{student ? t.schoolForToday : t.schoolFollowUp}</h3>
          <V4List>
            {nextAssignment && (
              <V4Row
                title={nextAssignment.title}
                description={uiText.text_fbb3425cdeea + date(nextAssignment.dueAtUtc, true)}
                icon={<ClipboardList />}
                href={base + '/assignments/' + nextAssignment.assignmentId}
              />
            )}
            {!student && (
              <V4Row
                title={uiText.schoolOverview.freshAnswers}
                description={uiText.text_522e4acaf773}
                icon={<ClipboardList />}
                end={<span className={layout.count}>{number(grading)}</span>}
                href={base + '/evaluations'}
              />
            )}
            {!student && nextSession && (
              <V4Row
                title={uiText.text_5ebf6333e4cd}
                description={nextSession.title}
                icon={<UserRoundCheck />}
                href={base + '/sessions/' + nextSession.sessionId + '?view=attendance'}
              />
            )}
            <V4Row
              title={student ? uiText.text_4f96bdc2ea91 : uiText.schoolOverview.lessonDrafts}
              description={
                student ? uiText.text_d59bfca8883f : uiText.schoolOverview.lessonDraftHint
              }
              icon={student ? <BookOpen /> : <NotebookPen />}
              href={student ? base + '/classes' : base + '/content?kind=Lesson'}
            />
          </V4List>
          <Button asChild variant="ghost">
            <Link href={student ? base + '/assignments' : base + '/evaluations'}>
              {uiText.text_d0c8b7c92026}
            </Link>
          </Button>
        </section>
        <section className={layout.section}>
          <h3>{student ? t.schoolUpcoming : t.schoolWork}</h3>
          <V4List>
            {student ? (
              <>
                {nextExam && (
                  <V4Row
                    title={nextExam.title}
                    description={date(nextExam.availableFromUtc, true)}
                    icon={<ClipboardList />}
                    href={base + '/classes/' + nextExam.classId + '?tab=exams'}
                  />
                )}
                <V4Row
                  title={uiText.text_15aa7009c6f2}
                  description={t.schoolTomorrow}
                  icon={<CalendarDays />}
                  href={base + '/schedule'}
                />
                {'attendanceSummary' in d && (
                  <V4Row
                    title={uiText.serverAlignedUi.recordedAttendance}
                    description={number(d.attendanceSummary.recordedCount)}
                    icon={<UserRoundCheck />}
                    href={base + '/reports?kind=attendance'}
                  />
                )}
              </>
            ) : (
              <>
                <V4Row
                  title={t.schoolNewAssignment}
                  icon={<ClipboardList />}
                  onClick={() => {
                    setActivityClass('');
                    setNewActivity('assignments');
                  }}
                />
                <V4Row
                  title={t.schoolNewExam}
                  icon={<NotebookPen />}
                  onClick={() => {
                    setActivityClass('');
                    setNewActivity('exams');
                  }}
                />
                <V4Row
                  title={uiText.serverAlignedUi.newSchoolContent}
                  icon={<BookOpen />}
                  onClick={() => {
                    setActivityClass('');
                    setNewActivity('lessons');
                  }}
                />
              </>
            )}
          </V4List>
        </section>
      </div>
      {!!classes.error && <ErrorState error={classes.error} />}
      <Dialog
        open={!!newActivity}
        onOpenChange={(open) => {
          if (!open) setNewActivity(null);
        }}
      >
        <DialogContent
          title={
            newActivity === 'exams'
              ? t.schoolNewExam
              : newActivity === 'lessons'
                ? uiText.serverAlignedUi.newSchoolContent
                : t.schoolNewAssignment
          }
        >
          <form
            className={layout.activityForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (
                newActivity &&
                classes.data?.some(
                  (item) =>
                    item.id === activityClass &&
                    item.organizationId === session.context.organizationId &&
                    item.status === 'Active',
                )
              )
                router.push(`${base}/classes/${activityClass}/${newActivity}/new`);
            }}
          >
            <label>
              {uiText.aiIntegration.class}
              <Select
                aria-label={uiText.aiIntegration.class}
                value={activityClass}
                onChange={(event) => setActivityClass(event.target.value)}
                required
              >
                <option value="">{uiText.aiIntegration.chooseClass}</option>
                {classes.data
                  ?.filter(
                    (item) =>
                      item.organizationId === session.context.organizationId &&
                      item.status === 'Active',
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
              </Select>
            </label>
            <Button type="submit" disabled={!activityClass || classes.isFetching}>
              {uiText.text_4c1f73ed8563}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
