'use client';
import { useEffect, useState } from 'react';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { v5Product as t } from '@/content/fa';
type S = components['schemas'];
type Class = Pick<S['ClassResult'], 'id' | 'organizationId'>;

/** The same registered roster read used by ClassRoster; a denial never becomes a count. */
export function useClassLearnerCount(item: Class, enabled = true) {
  const { session } = usePersonal();
  const authorized =
    session.context.workspaceType === 'Organization' &&
    ['Manager', 'Teacher'].includes(session.context.activeRole ?? '') &&
    session.context.organizationId === item.organizationId;
  const query = usePersonalApi<S['SchoolPageOfClassLearnerResult']>(
    `/api/v1/academic/classes/${item.id}/learners?Page=1&PageSize=1&status=Active`,
    { enabled: enabled && authorized },
  );
  const page = query.data;
  const valid =
    authorized &&
    query.isSuccess &&
    !!page &&
    Number.isSafeInteger(page.totalCount) &&
    page.totalCount >= page.items.length &&
    page.totalCount >= 0 &&
    page.items.every((row) => row.status === 'Active') &&
    (page.totalCount === 0 || page.items.length > 0);
  return {
    count: valid ? page.totalCount : undefined,
    unavailable: query.isError || (query.isSuccess && !valid),
  };
}

/** Read authoritative active counts, never infer them from a partial roster page. */
export function useClassRosterSummary(item: Class, enabled = true) {
  const { session } = usePersonal();
  const authorized =
    session.context.workspaceType === 'Organization' &&
    session.context.activeRole === 'Manager' &&
    session.context.organizationId === item.organizationId;
  const query = '?Page=1&PageSize=1&status=Active';
  const teachers = usePersonalApi<S['SchoolPageOfClassTeacherResult']>(
    `/api/v1/academic/classes/${item.id}/teachers${query}`,
    { enabled: enabled && authorized },
  );
  const learners = usePersonalApi<S['SchoolPageOfClassLearnerResult']>(
    `/api/v1/academic/classes/${item.id}/learners${query}`,
    { enabled: enabled && authorized },
  );
  const teacherPage = teachers.data;
  const teacherValid =
    authorized &&
    teachers.isSuccess &&
    !!teacherPage &&
    teacherPage.items.every((row) => row.status === 'Active') &&
    teacherPage.totalCount >= teacherPage.items.length &&
    (teacherPage.totalCount === 0 || !!teacherPage.items[0]?.displayName.trim());
  const learnerValid =
    authorized &&
    learners.isSuccess &&
    learners.data.items.every((row) => row.status === 'Active') &&
    learners.data.totalCount >= learners.data.items.length &&
    (learners.data.totalCount === 0 || learners.data.items.length > 0);
  return {
    teacher: teacherValid
      ? teacherPage.totalCount === 0
        ? t.noTeacher
        : teacherPage.items[0].displayName
      : undefined,
    teacherCount: teacherValid ? teacherPage.totalCount : undefined,
    enrolled: learnerValid ? learners.data.totalCount : undefined,
    unavailable:
      teachers.isError ||
      learners.isError ||
      (teachers.isSuccess && !teacherValid) ||
      (learners.isSuccess && !learnerValid),
  };
}

/** Hidden cards and rows outside the viewport do not request their rosters. */
export function useVisibleClassRosterSummary(item: Class) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return { ref: setElement, summary: useClassRosterSummary(item, visible) };
}
