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
import { V4List, V4Row } from '@/components/v4/page';
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
import layout from './dashboard-layout.module.css';
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
      <Link
        href="/personal/education?view=children"
        className={styles.child}
        data-parent-active-child
      >
        <span className={styles.identity}>
          <span className={uiClass('avatar')} aria-hidden="true">
            {Array.from(child.displayName)[0]}
          </span>
          <span className={styles.copy}>
            <h2>{child.displayName}</h2>
            <small>
              {t.authorizedRelation(child.displayName)} · {child.organizationName}
            </small>
          </span>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </Link>
      <section className={layout.section}>
        <h3>{uiText.v6Ui.childToday}</h3>
        <div className={uiClass('kv')}>
          <span className={uiClass('key')}>{uiText.v6Ui.childSession}</span>
          <Link
            href={sessionRow.href}
            className={uiClass('val')}
            data-parent-upcoming-session={nextSession ? '' : undefined}
          >
            {sessionRow.title}
          </Link>
        </div>
        <div className={uiClass('kv')}>
          <span className={uiClass('key')}>{t.attendance}</span>
          <b className={uiClass('val')}>{attendanceDescription}</b>
        </div>
        <div className={uiClass('kv')}>
          <span className={uiClass('key')}>{t.assignmentFollowUp}</span>
          <b className={uiClass('val')}>{t.availableActivities(number(pending))}</b>
        </div>
      </section>
      <div className={layout.grid}>
        <section className={layout.section}>
          <h3>{uiText.v6Ui.childEducation}</h3>
          <V4List>
            {followUp.map((row) => (
              <V4Row key={row.title} {...row} />
            ))}
            {program && (
              <V4Row
                title={t.publishedResults}
                description={released[0]?.assignmentTitle || t.noPublishedResult}
                icon={<ChartNoAxesCombined />}
                href="/personal/education/assignments"
              />
            )}
          </V4List>
        </section>
        <section className={layout.section}>
          <h3>{uiText.v6Ui.childConnection}</h3>
          <p className={styles.privacy}>
            <ShieldCheck size={18} aria-hidden="true" />
            {uiText.v6Ui.childPrivacy}
          </p>
          <p className={styles.privacy}>
            {t.authorizedChildInfo(child.displayName, child.organizationName)}
          </p>
        </section>
      </div>
    </>
  );
}
