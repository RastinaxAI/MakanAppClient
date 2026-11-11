'use client';
import { uiClass } from '@/components/v5/classes';

import { buttonClass } from '@/components/ui/button';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ConnectionNotice } from '@/components/ui/connection-notice';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import {
  nearestUpcoming,
  currentSchoolWeek,
  schoolWeekRange,
  localCalendarDay,
} from './calendar-model';
import { ProfileAvatar } from '../profile-photo';
import {
  BookOpen,
  ClipboardList,
  ChevronLeft,
  NotebookPen,
  CalendarDays,
  UserRoundCheck,
} from 'lucide-react';
import { date } from '@/lib/formatting';
import { base } from './shared';
import layout from './dashboard-layout.module.css';
type S = components['schemas'];
type Dashboard = S['ManagerDashboardDto'] | S['TeacherDashboardDto'] | S['StudentDashboardDto'];
export function SchoolFeed() {
  const { session } = usePersonal(),
    role = session.context.activeRole,
    student = role === 'Student';
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
  const nextSession = nearestUpcoming(
    sessions.filter((x) => x.status === 'Scheduled'),
    (x) => x.startUtc,
  );
  const candidate = 'nearestAssignmentDeadline' in d ? d.nearestAssignmentDeadline : null;
  const nextAssignment = student && candidate && nearestUpcoming([candidate], (x) => x.dueAtUtc);
  const examItems =
    'upcomingExams' in d
      ? d.upcomingExams.map((x) => ({
          title: x.title,
          classTitle: x.classTitle,
          classId: x.classId,
          time: x.availableFromUtc,
        }))
      : [];
  const nextExam = nearestUpcoming(examItems, (x) => x.time);
  const name = session.user.firstName || session.user.displayName || uiText.text_2018071defea;
  const grading = 'assignmentGradingQueue' in d ? d.assignmentGradingQueue.totalPendingCount : 0;
  return (
    <>
      <ConnectionNotice
        cached={!!dashboard.data}
        error={dashboard.isError}
        onRetry={() => void dashboard.refetch()}
      />

      {student ? (
        <>
          <section className={layout.welcome}>
            <div>
              <p className={layout.eyebrow}>
                {new Intl.DateTimeFormat('fa-IR', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'Asia/Tehran',
                }).format(new Date(d.dataAsOfUtc))}
              </p>
              <h2>{uiText.serverAlignedUi.schoolGreeting(name)}</h2>
              <p>{uiText.serverAlignedUi.dayIntro}</p>
            </div>
            <ProfileAvatar
              photo={session.user.profilePhoto}
              name={name}
              className={layout.learnerAvatar}
            />
          </section>
          <nav className={layout.week} aria-label={uiText.v5Product.weekNavigation}>
            {schoolWeekRange(currentSchoolWeek(new Date(d.dataAsOfUtc))).days.map((day) => (
              <Link
                key={day.date}
                href={base + '/schedule?day=' + day.date}
                aria-label={day.label}
                aria-current={day.date === localCalendarDay(d.dataAsOfUtc) ? 'date' : undefined}
              >
                <span>{day.weekday}</span>
                <b>
                  {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', timeZone: 'UTC' }).format(
                    new Date(day.date + 'T12:00:00Z'),
                  )}
                </b>
              </Link>
            ))}
          </nav>
        </>
      ) : (
        <section className={uiClass('card hero')}>
          <h3>{uiText.serverAlignedUi.teacherDay}</h3>
          <p>{uiText.serverAlignedUi.teacherDayIntro}</p>
        </section>
      )}
      {!student && (
        <h2 className={uiClass('section-title v5-feed-heading')}>
          <span>{uiText.text_e30bd24d513b}</span>
          <Link className={uiClass('text-action')} href={base + '/schedule'}>
            {uiText.text_ca0f901fdf49}
          </Link>
        </h2>
      )}
      {nextSession ? (
        <section className={student ? layout.sessionHero : uiClass('card')}>
          {student ? (
            <>
              <span className={layout.heroTag}>{uiText.text_e30bd24d513b}</span>
              <h2>{nextSession.classTitle}</h2>
              <p>
                {nextSession.title} · {date(nextSession.startUtc, true)}
              </p>
              <Link
                className={uiClass(buttonClass('btn secondary'))}
                href={base + '/sessions/' + nextSession.sessionId}
              >
                {uiText.text_7841d322609a}
              </Link>
            </>
          ) : (
            <Link className={uiClass('row')} href={base + '/sessions/' + nextSession.sessionId}>
              <span className={uiClass('tile-icon')}>
                <CalendarDays size={22} />
              </span>
              <span className={uiClass('grow')}>
                <h4>{nextSession.title}</h4>
                <p>
                  {nextSession.classTitle} · {date(nextSession.startUtc, true)}
                </p>
              </span>
            </Link>
          )}
        </section>
      ) : (
        <div className={student ? layout.sessionEmpty : uiClass('card')}>
          {student ? (
            <>
              <h3>{uiText.v5Product.schoolToday}</h3>
              <div className={layout.sessionEmptyBody}>
                <span className={layout.sessionEmptyMark}>
                  <CalendarDays size={32} aria-hidden="true" />
                </span>
                <h4>{uiText.v5Product.noUpcomingSession}</h4>
                <p>{uiText.v5Product.noUpcomingSessionHint}</p>
              </div>
            </>
          ) : (
            <p>{uiText.text_827cc8637f4d}</p>
          )}
          <Link
            className={uiClass(student ? buttonClass('btn secondary') : 'text-action')}
            href={base + '/schedule'}
          >
            {student && <CalendarDays size={20} aria-hidden="true" />}
            {uiText.text_15aa7009c6f2}
          </Link>
        </div>
      )}
      <div className={layout.metrics} data-learner={student || undefined}>
        {('pendingAssignmentCount' in d
          ? [
              [
                uiText.serverAlignedUi.activeClasses,
                classes.data ? classes.data.filter((c) => c.status === 'Active').length : null,
              ],
              [uiText.serverAlignedUi.pendingAssignments, d.pendingAssignmentCount],
              [uiText.serverAlignedUi.upcomingExams, d.upcomingExams.length],
            ]
          : [
              [
                uiText.serverAlignedUi.activeClasses,
                'assignedClasses' in d ? d.assignedClasses.length : null,
              ],
              [uiText.serverAlignedUi.pendingAssessments, grading],
              [uiText.serverAlignedUi.upcomingSessions, sessions.length],
              [uiText.serverAlignedUi.pendingExamAssessments, d.examGradingQueue.totalPendingCount],
            ]
        ).map(([label, value], index) => (
          <div className={layout.metric} key={label}>
            {index === 0 ? (
              <BookOpen aria-hidden="true" />
            ) : index === 1 ? (
              <ClipboardList aria-hidden="true" />
            ) : index === 2 ? (
              <CalendarDays aria-hidden="true" />
            ) : (
              <UserRoundCheck aria-hidden="true" />
            )}
            <strong>{value === null ? '—' : Number(value).toLocaleString('fa-IR')}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {student && 'attendanceSummary' in d && (
        <Link className={layout.attendance} href={base + '/reports?kind=attendance'}>
          <UserRoundCheck size={18} />
          {uiText.serverAlignedUi.recordedAttendance}:{' '}
          {d.attendanceSummary.recordedCount.toLocaleString('fa-IR')}
        </Link>
      )}
      {!student && nextSession && (
        <div className={uiClass('button-row')}>
          <Link
            className={uiClass(buttonClass('btn'))}
            href={base + '/sessions/' + nextSession.sessionId + '?view=attendance'}
          >
            {uiText.text_5ebf6333e4cd}
          </Link>
          <Link
            className={uiClass(buttonClass('btn secondary'))}
            href={base + '/sessions/' + nextSession.sessionId}
          >
            {uiText.text_7841d322609a}
          </Link>
        </div>
      )}
      <h2 className={uiClass('section-title v5-feed-heading')}>
        <span>{student ? uiText.text_f9aa47c30ce0 : uiText.text_1b5115f2f6fa}</span>
        <Link
          className={uiClass('text-action')}
          href={student ? base + '/assignments' : base + '/evaluations'}
        >
          {uiText.text_d0c8b7c92026}
        </Link>
      </h2>
      <div className={uiClass('list')}>
        {nextAssignment && (
          <Link
            className={uiClass('row')}
            href={base + '/assignments/' + nextAssignment.assignmentId}
          >
            <span className={uiClass('tile-icon')}>
              <ClipboardList size={22} />
            </span>
            <span className={uiClass('grow')}>
              <h4>{nextAssignment.title}</h4>
              <p>
                {uiText.text_fbb3425cdeea}
                {date(nextAssignment.dueAtUtc, true)}
              </p>
            </span>
            <span className={uiClass('badge warn')}>{uiText.text_563c95d1f5ea}</span>
          </Link>
        )}
        {!student && (
          <Link className={uiClass('row')} href={base + '/evaluations'}>
            <span className={uiClass('tile-icon')}>
              <ClipboardList size={22} />
            </span>
            <span className={uiClass('grow')}>
              <h4>{uiText.schoolOverview.freshAnswers}</h4>
              <p>{uiText.text_522e4acaf773}</p>
            </span>
            <span className={uiClass('badge')}>{grading.toLocaleString('fa-IR')}</span>
          </Link>
        )}
        <Link
          className={uiClass('row')}
          href={student ? base + '/classes' : base + '/content?kind=Lesson'}
        >
          <span className={uiClass('tile-icon')}>
            {student ? <BookOpen size={22} /> : <NotebookPen size={22} />}
          </span>
          <span className={uiClass('grow')}>
            <h4>{student ? uiText.text_4f96bdc2ea91 : uiText.schoolOverview.lessonDrafts}</h4>
            <p>{student ? uiText.text_d59bfca8883f : uiText.schoolOverview.lessonDraftHint}</p>
          </span>
          <ChevronLeft size={18} />
        </Link>
        {student && nextExam && (
          <Link
            className={uiClass('row')}
            href={base + '/classes/' + nextExam.classId + '?tab=exams'}
          >
            <span className={uiClass('tile-icon')}>
              <ClipboardList size={22} />
            </span>
            <span className={uiClass('grow')}>
              <h4>{nextExam.title}</h4>
              <p>{date(nextExam.time, true)}</p>
            </span>
            <ChevronLeft size={18} />
          </Link>
        )}
      </div>
      {!!classes.error && <ErrorState error={classes.error} />}
    </>
  );
}
