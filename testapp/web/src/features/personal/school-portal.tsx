'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, label, LoadingSkeleton } from '@/components/ui/states';
import { isSchoolRole, isSchoolPath } from '@/config/navigation';
import { TeacherContentPage } from './school/teacher-content';
import { ApiError } from '@/lib/api/errors';
import {
  BookOpen,
  Building2,
  CalendarDays,
  Mail,
  Users,
  UserRoundCheck,
  ChartNoAxesCombined,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePersonal } from './provider';
import { useWorkspaceSnapshot } from './workspaces';
import { visibleWorkspaces, canEnterWorkspace } from './workspace-model';
import { SchoolFeed } from './school/feed';
import s from './school/school.module.css';
import { base, Card, SchoolHeading } from './school/shared';
import { ChildSelector } from './school/child-selector';
import { useAuthorizedChildren } from './school/use-authorized-children';
import { SchoolSearch } from './school/search';
import layout from './school/education-layout.module.css';
import { ReferenceSchoolFrame } from '@/features/reference/connected-school';
import { SchoolCatalog } from './school/catalog';
import { LearningReports } from './school/learning-reports';
import { SchoolSectionMenu } from './school/section-menu';
import { ScheduleRules } from './school/schedule-rules';
const dynamicLoading = () => <LoadingSkeleton />;
const LessonFormPage = dynamic(() => import('./school/lessons').then((m) => m.LessonFormPage), {
  loading: dynamicLoading,
});
const MemberDirectory = dynamic(
  () => import('./school/member-directory').then((m) => m.MemberDirectory),
  { loading: dynamicLoading },
);
const ExamEditor = dynamic(() => import('./school/exams').then((m) => m.ExamEditor), {
  loading: dynamicLoading,
});
const Exams = dynamic(() => import('./school/exams').then((m) => m.Exams), {
  loading: dynamicLoading,
});
const StudentExam = dynamic(() => import('./school/exams').then((m) => m.StudentExam), {
  loading: dynamicLoading,
});
const AssignmentDetail = dynamic(
  () => import('./school/learning').then((m) => m.AssignmentDetail),
  { loading: dynamicLoading },
);
const Assignments = dynamic(() => import('./school/learning').then((m) => m.Assignments), {
  loading: dynamicLoading,
});
const Schedule = dynamic(() => import('./school/learning').then((m) => m.Schedule), {
  loading: dynamicLoading,
});
const AssignmentFormPage = dynamic(
  () => import('./school/learning').then((m) => m.AssignmentFormPage),
  { loading: dynamicLoading },
);
const LessonDetail = dynamic(() => import('./school/lessons').then((m) => m.LessonDetail), {
  loading: dynamicLoading,
});
const ResourcesClasses = dynamic(() => import('./school/lessons').then((m) => m.ResourcesClasses), {
  loading: dynamicLoading,
});
const Classes = dynamic(() => import('./school/manager').then((m) => m.Classes), {
  loading: dynamicLoading,
});
const Enrollments = dynamic(() => import('./school/manager').then((m) => m.Enrollments), {
  loading: dynamicLoading,
});
const Guardians = dynamic(() => import('./school/manager').then((m) => m.Guardians), {
  loading: dynamicLoading,
});
const People = dynamic(() => import('./school/manager').then((m) => m.People), {
  loading: dynamicLoading,
});
const Teachers = dynamic(() => import('./school/manager').then((m) => m.Teachers), {
  loading: dynamicLoading,
});
const SubmissionFlow = dynamic(
  () => import('./school/submission-flow').then((m) => m.SubmissionFlow),
  { loading: dynamicLoading },
);
const ParentWorkspace = dynamic(
  () => import('./school/parent-workspace').then((m) => m.ParentWorkspace),
  {
    loading: dynamicLoading,
  },
);
const ClassDetail = dynamic(() => import('./school/class-detail').then((m) => m.ClassDetail), {
  loading: dynamicLoading,
});
const ParentClasses = dynamic(() => import('./school/class-detail').then((m) => m.ParentClasses), {
  loading: dynamicLoading,
});
const InvitationsPage = dynamic(
  () => import('./school/invitations').then((m) => m.InvitationsPage),
  { loading: dynamicLoading },
);
const ClassCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.ClassCreatePage),
  { loading: dynamicLoading },
);
const CatalogCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.CatalogCreatePage),
  { loading: dynamicLoading },
);
const PersonFormPage = dynamic(
  () => import('./school/creation-pages').then((m) => m.PersonFormPage),
  { loading: dynamicLoading },
);
const PersonDetailPage = dynamic(
  () => import('./school/creation-pages').then((m) => m.PersonDetailPage),
  { loading: dynamicLoading },
);
const SessionCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.SessionCreatePage),
  { loading: dynamicLoading },
);
const ExamCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.ExamCreatePage),
  { loading: dynamicLoading },
);
const GuardianCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.GuardianCreatePage),
  { loading: dynamicLoading },
);
const ClassMembersPage = dynamic(
  () => import('./school/creation-pages').then((m) => m.ClassMembersPage),
  { loading: dynamicLoading },
);
const QuestionCreatePage = dynamic(
  () => import('./school/creation-pages').then((m) => m.QuestionCreatePage),
  { loading: dynamicLoading },
);
const SessionPage = dynamic(() => import('./school/session-page').then((m) => m.SessionPage), {
  loading: dynamicLoading,
});
const ExamReviewPage = dynamic(() => import('./school/exam-review').then((m) => m.ExamReviewPage), {
  loading: dynamicLoading,
});
const AssignmentEvaluationQueue = dynamic(
  () => import('./school/assignment-evaluation').then((m) => m.AssignmentEvaluationQueue),
  { loading: dynamicLoading },
);
const AssignmentEvaluationPage = dynamic(
  () => import('./school/assignment-evaluation').then((m) => m.AssignmentEvaluationPage),
  { loading: dynamicLoading },
);
const ExamGradingQueue = dynamic(
  () => import('./school/exam-grading').then((m) => m.ExamGradingQueue),
  { loading: dynamicLoading },
);
const ExamGradingPage = dynamic(
  () => import('./school/exam-grading').then((m) => m.ExamGradingPage),
  { loading: dynamicLoading },
);
const AssessmentHistory = dynamic(
  () => import('./school/assessment-results').then((m) => m.AssessmentHistory),
  { loading: dynamicLoading },
);
const AssessmentResult = dynamic(
  () => import('./school/assessment-results').then((m) => m.AssessmentResult),
  { loading: dynamicLoading },
);
const AssignmentEditPage = dynamic(
  () => import('./school/assignment-editor').then((m) => m.AssignmentEditPage),
  { loading: dynamicLoading },
);
const ManagerHome = dynamic(() => import('./school/manager-home').then((m) => m.ManagerHome), {
  loading: dynamicLoading,
});
const ManagerClass = dynamic(() => import('./school/manager-class').then((m) => m.ManagerClass), {
  loading: dynamicLoading,
});
const ManagerReports = dynamic(
  () => import('./school/manager-reports').then((m) => m.ManagerReports),
  { loading: dynamicLoading },
);
const ManagerInvitations = dynamic(
  () => import('./school/manager-invitations').then((m) => m.ManagerInvitations),
  { loading: dynamicLoading },
);

export function PersonalEducation({ section = [] }: { section?: string[] }) {
  const { session } = usePersonal();
  const active = session.context.workspaceType === 'Organization';
  const role = session.context.activeRole;
  const manager = role === 'Manager',
    teacher = role === 'Teacher',
    parent = role === 'Parent';
  const page = section[0] ?? 'overview';
  const tabsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [page, manager]);
  const tabs = manager
    ? ([
        ['overview', uiText.text_ca3c4420b9b8, Building2],
        ['classes', uiText.text_e7b1ccd0bda3, BookOpen],
        ['members', uiText.text_102f79b3f87c, Users],
        ['guardians', uiText.text_d61b3d58a5e7, UserRoundCheck],
        ['invitations', uiText.text_016c18389868, Mail],
        ['reports', uiText.text_5dc634b07b21, ChartNoAxesCombined],
      ] as const)
    : ([
        ['overview', uiText.text_9a8e4bfdd18e, Building2],
        ['classes', uiText.text_e7b1ccd0bda3, BookOpen],
        ['schedule', uiText.text_82ec67c14936, CalendarDays],
        ['invitations', uiText.text_016c18389868, Mail],
        ...(!parent
          ? ([['reports', uiText.learningReports.navigation, ChartNoAxesCombined]] as const)
          : []),
      ] as const);
  const navigationPage =
    manager && ['people', 'members', 'teachers', 'students'].includes(page) ? 'members' : page;
  const navigation = (
    <SchoolSectionMenu>
      <nav
        ref={tabsRef}
        data-manager={manager || undefined}
        className={uiClass(`${layout.navigation} ${manager ? layout.managerNavigation : ''}`)}
        aria-label={uiText.text_589d5004f227}
      >
        {tabs.map(([key, title, Icon]) => (
          <Link
            key={key}
            href={key === 'overview' ? base : base + '/' + key}
            aria-current={navigationPage === key ? 'page' : undefined}
            aria-label={title}
          >
            <Icon size={20} />
            <span>{title}</span>
          </Link>
        ))}
      </nav>
    </SchoolSectionMenu>
  );
  if (!isSchoolPath(section)) return <ErrorState error={new ApiError(404)} />;
  if (section.length === 0 || (section.length === 1 && page === 'overview')) {
    if (active && parent) return <ParentWorkspace />;
    return (
      <ReferenceSchoolFrame>
        {navigation}
        {!active ? (
          <WorkspaceList />
        ) : !isSchoolRole(role) ? (
          <ErrorState error={new ApiError(403)} />
        ) : parent ? (
          <ParentSchool page="overview" />
        ) : manager ? (
          <ManagerHome />
        ) : (
          <SchoolOverview />
        )}
      </ReferenceSchoolFrame>
    );
  }
  if (page === 'invitations')
    return (
      <div className={uiClass(s.portal)}>
        {navigation}
        {active && manager ? <ManagerInvitations /> : <InvitationsPage />}
      </div>
    );
  if (!active)
    return (
      <div className={uiClass(s.portal)}>
        {navigation}
        <SchoolHeading title={uiText.text_8fa4122032f4} description={uiText.text_13e372aa992c} />
        <WorkspaceList />
      </div>
    );
  if (!isSchoolRole(role)) return <ErrorState error={new ApiError(403)} />;
  if (page === 'search')
    return (
      <div className={uiClass(s.portal)}>
        {navigation}
        <SchoolSearch />
      </div>
    );
  const allowed =
    tabs.some(([key]) => key === page) ||
    ['assignments', 'exams'].includes(page) ||
    ['submissions', 'exam-submissions'].includes(page) ||
    ((teacher || manager) && page === 'evaluations') ||
    (teacher && page === 'content') ||
    (!parent && ['classes', 'lessons', 'resources', 'sessions'].includes(page)) ||
    (manager &&
      [
        'people',
        'members',
        'teachers',
        'students',
        'guardians',
        'courses',
        'periods',
        'reports',
      ].includes(page));
  if (parent && allowed && section.length === 1 && (page === 'assignments' || page === 'exams'))
    return <ParentWorkspace reports={page} />;
  return (
    <div className={uiClass(s.portal)} key={session.revision}>
      {navigation}
      {!allowed ? (
        <ErrorState error={new ApiError(403)} />
      ) : page === 'content' ? (
        <TeacherContentPage />
      ) : page === 'evaluations' ? (
        <AssignmentEvaluationQueue />
      ) : page === 'submissions' ? (
        section[2] === 'result' ? (
          <AssessmentResult id={section[1]} />
        ) : (
          <AssignmentEvaluationPage id={section[1]} review={section[2] === 'evaluation-review'} />
        )
      ) : page === 'exam-submissions' ? (
        section[2] === 'result' ? (
          <AssessmentResult id={section[1]} exam />
        ) : (
          <ExamGradingPage
            id={section[1]}
            review={section[2] === 'grading-review'}
            questionId={section[2] === 'questions' ? section[3] : undefined}
          />
        )
      ) : page === 'assignments' && section[2] === 'evaluations' ? (
        <AssignmentEvaluationQueue assignmentId={section[1]} />
      ) : page === 'assignments' && ['edit', 'publish-review'].includes(section[2]) ? (
        <AssignmentEditPage id={section[1]} publish={section[2] === 'publish-review'} />
      ) : ['assignments', 'exams'].includes(page) && section[2] === 'history' ? (
        <AssessmentHistory id={section[1]} exam={page === 'exams'} />
      ) : page === 'exams' && section[2] === 'grading' ? (
        <ExamGradingQueue examId={section[1]} />
      ) : page === 'classes' && section[1] === 'new' ? (
        <ClassCreatePage />
      ) : page === 'courses' || page === 'periods' ? (
        section[1] === 'new' ? (
          <CatalogCreatePage kind={page} />
        ) : (
          <SchoolCatalog kind={page} />
        )
      ) : page === 'people' && section[1] ? (
        section[1] === 'new' ? (
          <PersonFormPage />
        ) : section[2] === 'edit' ? (
          <PersonFormPage id={section[1]} />
        ) : (
          <PersonDetailPage id={section[1]} />
        )
      ) : page === 'guardians' && section[1] === 'new' ? (
        <GuardianCreatePage />
      ) : page === 'sessions' && section[1] ? (
        <SessionPage id={section[1]} edit={section[2] === 'edit'} />
      ) : page === 'exams' && section[2] === 'review' ? (
        <ExamReviewPage id={section[1]} />
      ) : page === 'exams' && section[2] === 'questions' ? (
        <QuestionCreatePage id={section[1]} />
      ) : page === 'classes' && section[2] === 'members' ? (
        <ClassMembersPage classId={section[1]} kind="all" />
      ) : page === 'classes' && section[3] === 'new' && section[2] === 'schedule-rules' ? (
        <ScheduleRules classId={section[1]} />
      ) : page === 'classes' && section[3] === 'new' && section[2] === 'sessions' ? (
        <SessionCreatePage classId={section[1]} />
      ) : page === 'classes' && section[3] === 'new' && section[2] === 'exams' ? (
        <ExamCreatePage classId={section[1]} />
      ) : page === 'classes' && section[3] === 'new' && section[2] === 'assignments' ? (
        <AssignmentFormPage classId={section[1]} />
      ) : page === 'classes' && section[3] === 'new' && section[2] === 'lessons' ? (
        <LessonFormPage classId={section[1]} />
      ) : page === 'classes' &&
        section[3] === 'new' &&
        ['enrollments', 'teachers'].includes(section[2]) ? (
        <ClassMembersPage
          classId={section[1]}
          kind={section[2] === 'teachers' ? 'teachers' : 'learners'}
        />
      ) : parent ? (
        <ParentSchool page={page} classId={section[1]} />
      ) : page === 'overview' ? (
        manager ? (
          <ManagerHome />
        ) : (
          <SchoolOverview />
        )
      ) : page === 'reports' && manager ? (
        <ManagerReports />
      ) : page === 'reports' ? (
        <LearningReports teacher={teacher} />
      ) : page === 'classes' && section[1] ? (
        manager ? (
          <ManagerClass id={section[1]} />
        ) : (
          <ClassDetail id={section[1]} manager={false} teacher={teacher} />
        )
      ) : page === 'classes' ? (
        <Classes manage={manager} />
      ) : page === 'people' && manager ? (
        <People />
      ) : page === 'teachers' && manager ? (
        <Teachers />
      ) : page === 'members' && manager ? (
        <MemberDirectory />
      ) : page === 'students' && manager ? (
        <>
          <MemberDirectory initialRole="Student" />
          <Enrollments />
        </>
      ) : page === 'guardians' && manager ? (
        <Guardians />
      ) : page === 'lessons' && section[1] ? (
        section[2] === 'edit' ? (
          <LessonFormPage id={section[1]} />
        ) : (
          <LessonDetail
            id={section[1]}
            teach={teacher || manager}
            review={section[2] === 'review'}
          />
        )
      ) : page === 'assignments' && section[1] ? (
        section[2] === 'answer' || section[2] === 'review' || section[2] === 'receipt' ? (
          <SubmissionFlow id={section[1]} stage={section[2]} />
        ) : (
          <AssignmentDetail id={section[1]} teach={teacher || manager} />
        )
      ) : page === 'assignments' ? (
        <Assignments teach={teacher || manager} />
      ) : page === 'exams' && section[1] ? (
        section[2] === 'edit' ? (
          teacher || manager ? (
            <ExamEditor id={section[1]} />
          ) : (
            <ErrorState error={new ApiError(403)} />
          )
        ) : (
          <StudentExam id={section[1]} />
        )
      ) : page === 'exams' ? (
        <Exams teach={teacher || manager} />
      ) : page === 'schedule' ? (
        <>
          <SchoolHeading title={uiText.text_0465a6813992} />
          <Schedule teach={teacher || manager} />
        </>
      ) : (
        <ResourcesClasses />
      )}
    </div>
  );
}
function WorkspaceList() {
  const { selectWorkspace } = usePersonal();
  const q = useWorkspaceSnapshot();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  const organizations = visibleWorkspaces(q.data).filter((w) => w.workspaceType === 'Organization');
  return (
    <>
      {organizations.length ? (
        <div className={uiClass(s.grid)}>
          {organizations.map((w) => (
            <div key={w.membershipId + ':' + w.role} className={uiClass(s.classCard)}>
              <Building2 size={28} />
              <h2>{w.organizationName}</h2>
              <p>{label(w.role ?? '')}</p>
              <Button
                disabled={busy || !canEnterWorkspace(w)}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await selectWorkspace({
                      workspaceType: 'Organization',
                      membershipId: w.membershipId,
                      role: w.role,
                    });
                  } catch (e) {
                    setError(e);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {uiText.text_0cff2209b91a}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState title={uiText.text_aa11114d1a2f} description={uiText.text_d738b763f126} />
        </Card>
      )}
      {!!error && <ErrorState error={error} />}
    </>
  );
}
function SchoolOverview() {
  return <SchoolFeed />;
}
function ParentSchool({ page, classId }: { page: string; classId?: string }) {
  if (page === 'overview' || page === 'assignments' || page === 'exams')
    return <ParentWorkspace reports={page === 'overview' ? undefined : page} />;
  return <ParentClassWorkspace page={page} classId={classId} />;
}
function ParentClassWorkspace({ page, classId }: { page: string; classId?: string }) {
  const { children, scoped, active, busy, pendingId, error, retry, select } =
    useAuthorizedChildren();
  return (
    <>
      <ChildSelector
        children={scoped}
        active={active}
        pendingId={pendingId}
        busy={busy}
        loading={children.isPending}
        disabled={!children.isSuccess}
        error={error}
        onRetry={retry}
        onSelect={(id) => void select(id)}
      />
      {busy ? (
        <LoadingSkeleton />
      ) : (
        active &&
        (page === 'classes' ? (
          <ParentClasses id={classId} />
        ) : page === 'schedule' ? (
          <Schedule teach={false} />
        ) : null)
      )}
    </>
  );
}
