'use client';
import { uiClass } from '@/components/v5/classes';

import { buttonClass } from '@/components/ui/button';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  Handshake,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { V4Hero, V4List, V4Row } from '@/components/v4/page';
import {
  useSceneContextSummary,
  useSceneMenuTools,
  SceneMenuClose,
} from '@/components/v5/form-actions';
import { useContext } from 'react';
import { ApiError } from '@/lib/api/errors';
import { date, number, latinDigits } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { nearestUpcoming } from './calendar-model';
import styles from './parent-workspace.module.css';
type S = components['schemas'];
const t = uiText.v5Parent;
function sessionTime(value: string) {
  const when = new Date(value);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });
  const time = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(when);
  const clock =
    latinDigits(time.find((part) => part.type === 'minute')?.value ?? '') === '00'
      ? time.find((part) => part.type === 'hour')?.value
      : time.map((part) => part.value).join('');
  return (day.format(when) === day.format(new Date()) ? t.today : date(value)) + ' ' + clock;
}
export function ParentDaily({
  child,
  program = false,
}: {
  child: S['AuthorizedChildResult'];
  program?: boolean;
}) {
  const { session } = usePersonal();
  const closeMenu = useContext(SceneMenuClose);
  const q = usePersonalApi<S['ParentDashboardDto']>('/api/v1/dashboards/parent', { poll: 10000 });
  const matches =
    q.isSuccess &&
    q.data.organizationId === session.context.organizationId &&
    q.data.selectedLearner?.learnerOrganizationPersonId === child.learnerOrganizationPersonId;
  const d = matches ? q.data : undefined;
  const nextSession = d
    ? nearestUpcoming(
        d.upcomingSessions.filter((item) => item.status === 'Scheduled'),
        (item) => item.startUtc,
      )
    : undefined;
  const nextAssignment = d ? nearestUpcoming(d.assignments, (item) => item.dueAtUtc) : undefined;
  const nextExam = d ? nearestUpcoming(d.exams, (item) => item.availableFromUtc) : undefined;
  const released = d?.releasedAssignmentResults ?? [];
  const attendance = d?.attendanceSummary;
  const attendanceDescription = attendance
    ? attendance.eligibleSessionCount >= attendance.presentCount
      ? (program ? t.presentOfTotal : t.attendanceOfTotal)(
          number(attendance.presentCount),
          number(attendance.eligibleSessionCount),
        )
      : t.recordedPresence(number(attendance.presentCount))
    : '';
  const pending =
    d?.assignments.filter((item) => item.status === 'NotStarted' || item.status === 'Draft')
      .length ?? 0;
  const followUp = [
    {
      title: t.attendance,
      description: attendanceDescription,
      icon: <UserRoundCheck />,
      href: '/personal/education/schedule',
    },
    ...(program
      ? [
          {
            title: t.assignmentFollowUp,
            description: t.availableActivities(number(pending)),
            icon: <ClipboardList />,
            href: '/personal/education/assignments',
          },
        ]
      : [
          {
            title: t.publishedResults,
            description: released[0]
              ? released[0].assignmentTitle +
                ' · ' +
                t.scoreOf(number(released[0].score), number(released[0].maximumScore))
              : t.noPublishedResult,
            icon: <ChartNoAxesCombined />,
            href: '/personal/education/assignments',
          },
          {
            title: t.guardianRelation,
            description: t.authorizedRelation(child.displayName),
            icon: <Handshake />,
            href: '/personal/education?view=children',
          },
        ]),
  ];
  const sessionRow = {
    title: nextSession
      ? nextSession.classTitle + ' · ' + sessionTime(nextSession.startUtc)
      : t.noUpcomingSession,
    description: nextSession?.title,
    icon: <CalendarDays />,
    href: nextSession
      ? '/personal/education/classes/' + nextSession.classId
      : '/personal/education/schedule',
  };
  useSceneContextSummary(
    d
      ? (program ? [sessionRow, ...followUp] : followUp).map((row) => ({
          label: row.title,
          value: row.description || '',
        }))
      : [],
  );
  useSceneMenuTools(
    d ? (
      <div
        className={uiClass('stack')}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) closeMenu?.();
        }}
      >
        {nextAssignment && (
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            href={'/personal/education/classes/' + nextAssignment.classId + '?tab=assignments'}
          >
            {nextAssignment.title}
          </Link>
        )}
        {nextExam && (
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            href={'/personal/education/classes/' + nextExam.classId + '?tab=exams'}
          >
            {nextExam.title}
          </Link>
        )}
        {released.map((item) => (
          <Link
            key={item.submissionAttemptId}
            className={uiClass(buttonClass('button button-outline'))}
            href={'/personal/education/submissions/' + item.submissionAttemptId + '/result'}
          >
            {item.assignmentTitle}
          </Link>
        ))}
      </div>
    ) : null,
  );
  if (q.isPending) return <LoadingSkeleton variant="cards" />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (!d) return <ErrorState error={new ApiError(403)} />;
  return (
    <>
      {program ? (
        <V4Hero title={child.displayName}>{child.organizationName}</V4Hero>
      ) : (
        <>
          <Link
            href="/personal/education?view=children"
            className={uiClass(styles.child)}
            data-parent-active-child
          >
            <span className={uiClass(styles.identity)}>
              <span className={uiClass('avatar')} aria-hidden="true">
                {Array.from(child.displayName)[0]}
              </span>
              <span className={uiClass(styles.copy)}>
                <strong>{child.displayName}</strong>
                <small>{t.selectedChild}</small>
              </span>
            </span>
            <ChevronDown size={20} aria-hidden="true" />
          </Link>
          <div className={uiClass('v5-note alert')}>
            <ShieldCheck size={18} aria-hidden="true" />
            <p>{t.authorizedChildInfo(child.displayName, child.organizationName)}</p>
          </div>
          <h2 className={uiClass('section-title')}>{t.upcoming}</h2>
        </>
      )}
      {program ? (
        <V4List>
          <V4Row {...sessionRow} />
          {followUp.map((row) => (
            <V4Row key={row.title} {...row} />
          ))}
        </V4List>
      ) : (
        <>
          {nextSession ? (
            <Link
              className={uiClass(`schedule ${styles.timeline}`)}
              href={sessionRow.href}
              data-parent-upcoming-session
            >
              <time className={uiClass('time')} dateTime={nextSession.startUtc}>
                {new Intl.DateTimeFormat('fa-IR', {
                  timeZone: 'Asia/Tehran',
                  hour: '2-digit',
                  minute: '2-digit',
                  hourCycle: 'h23',
                }).format(new Date(nextSession.startUtc))}
                {Date.parse(nextSession.endUtc) > Date.parse(nextSession.startUtc) && (
                  <small className={uiClass('muted tiny')}>
                    {t.minutes(
                      number(
                        Math.round(
                          (Date.parse(nextSession.endUtc) - Date.parse(nextSession.startUtc)) /
                            60000,
                        ),
                      ),
                    )}
                  </small>
                )}
              </time>
              <span className={uiClass('bar')} aria-hidden="true" />
              <div>
                <h4>{nextSession.classTitle}</h4>
                <p>{nextSession.title}</p>
              </div>
            </Link>
          ) : (
            <V4List>
              <V4Row {...sessionRow} />
            </V4List>
          )}
          <h2 className={uiClass('section-title')}>{t.followUp}</h2>
          <V4List>
            {followUp.map((row) => (
              <V4Row key={row.title} {...row} />
            ))}
          </V4List>
        </>
      )}
    </>
  );
}
