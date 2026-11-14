'use client';
import Link from 'next/link';
import {
  CalendarDays,
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  NotebookPen,
  Megaphone,
  Users,
  BookOpen,
  ChartNoAxesCombined,
  Mail,
  Building2,
  UserRoundCheck,
  HeartHandshake,
} from 'lucide-react';
import { usePersonal } from '../provider';
import {
  v7Ui,
  v6Ui,
  v5Parent,
  text_9a8e4bfdd18e,
  text_016c18389868,
  text_d6541f139845,
} from '@/content/fa';
import { base } from './shared';
import s from './dashboard-layout.module.css';

/** Destinations stay inside the current school; no role selection grants permissions. */
export function SchoolQuickActions() {
  const { session } = usePersonal();
  const role = session.context.activeRole;
  const common = [
    [text_9a8e4bfdd18e, base, Building2],
    [v7Ui.schoolClasses, base + '/classes', BookOpen],
    [v7Ui.schoolSchedule, base + (role === 'Parent' ? '?view=program' : '/schedule'), CalendarDays],
    [text_016c18389868, base + '/invitations', Mail],
    [v7Ui.schoolNotices, base + '/notices', Megaphone],
    [
      v7Ui.schoolReports,
      base + (role === 'Parent' ? '/assignments' : '/reports'),
      ChartNoAxesCombined,
    ],
  ] as const;
  const items = [
    ...common,
    ...(role === 'Manager'
      ? ([
          [v7Ui.schoolPeople, base + '/members', Users],
          [v6Ui.schoolRelations, base + '/guardians', UserRoundCheck],
          [v7Ui.schoolAttendance, base + '/reports?kind=attendance', CalendarCheck],
        ] as const)
      : role === 'Parent'
        ? ([
            [v5Parent.children, base + '?view=children', HeartHandshake],
            [v7Ui.schoolExams, base + '/exams', NotebookPen],
          ] as const)
        : ([
            [v7Ui.schoolAttendance, base + '/reports?kind=attendance', CalendarCheck],
            [v7Ui.schoolAssignments, base + '/assignments', ClipboardList],
            [
              role === 'Teacher' ? v7Ui.schoolEvaluation : v7Ui.schoolGrades,
              role === 'Teacher' ? base + '/evaluations' : base + '/reports?kind=grades',
              GraduationCap,
            ],
            [v7Ui.schoolExams, base + '/exams', NotebookPen],
          ] as const)),
  ];
  return (
    <section className={s.quickSection}>
      <h3>{v7Ui.quickAccess}</h3>
      <nav className={s.quickGrid} aria-label={v7Ui.quickAccess}>
        {items.map(([label, href, Icon]) => (
          <Link key={href} href={href}>
            <Icon size={24} />
            <b>{label}</b>
          </Link>
        ))}
        {role === 'Parent' && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('makan:workspace-picker'))}
          >
            <Building2 size={24} />
            <b>{text_d6541f139845}</b>
          </button>
        )}
      </nav>
    </section>
  );
}
