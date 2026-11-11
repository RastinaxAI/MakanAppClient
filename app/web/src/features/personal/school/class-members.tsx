'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import { Button, buttonClass } from '@/components/ui/button';
import { usePersonal } from '../provider';
import { ClassRoster } from './directory';
import { base } from './shared';
import s from './education-layout.module.css';
import school from './school.module.css';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useSceneFormAction } from '@/components/v5/form-actions';

export function ClassMembersOverview({
  classId,
  showSwitcher = true,
}: {
  classId: string;
  showSwitcher?: boolean;
}) {
  const { session } = usePersonal();
  const path = usePathname(),
    params = useSearchParams();
  const kind = params.get('member') === 'teachers' ? 'teachers' : 'learners';
  const manage = session.context.activeRole === 'Manager';
  const action = useMemo(
    () =>
      manage ? (
        <Button asChild>
          <Link
            href={`${base}/classes/${classId}/${kind === 'learners' ? 'enrollments' : 'teachers'}/new`}
          >
            {kind === 'learners' ? uiText.text_e82efffd7b2d : uiText.v5Product.assignTeacher}
          </Link>
        </Button>
      ) : undefined,
    [classId, kind, manage],
  );
  const lifted = useSceneFormAction(action, manage && !showSwitcher);
  const viewHref = (member: string) => {
    const query = new URLSearchParams(params);
    query.set('member', member);
    return path + '?' + query;
  };
  return (
    <div className={uiClass(s.memberContent)}>
      {showSwitcher && (
        <nav className={uiClass(school.toolbar)} aria-label={uiText.v5Product.classMemberTypes}>
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            aria-current={kind === 'learners' ? 'page' : undefined}
            href={viewHref('learners')}
          >
            {uiText.v5Product.classLearners}
          </Link>
          <Link
            className={uiClass(buttonClass('button button-outline'))}
            aria-current={kind === 'teachers' ? 'page' : undefined}
            href={viewHref('teachers')}
          >
            {uiText.v5Product.classTeachers}
          </Link>
        </nav>
      )}
      <ClassRoster
        key={kind}
        classId={classId}
        kind={kind}
        manage={manage}
        variant="list"
        searchPlacement={kind === 'teachers' && !showSwitcher ? 'menu' : 'body'}
      />
      {!lifted && action}
    </div>
  );
}
