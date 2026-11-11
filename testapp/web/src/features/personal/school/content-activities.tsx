'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useState } from 'react';
import { vnext as t } from '@/content/fa';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import type { components } from '@/generated/api/schema';
import { date } from '@/lib/formatting';
import { usePersonalApi } from '../provider';
import { MemberPicker } from './directory';
import { Card, Field, Pager } from './shared';
import s from './school.module.css';
type S = components['schemas'];
export function ContentActivities({ classId }: { classId: string }) {
  const [page, setPage] = useState(1),
    [teacher, setTeacher] = useState<S['SchoolMemberResult'] | null>(null);
  const [kind, setKind] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState('');
  const query = new URLSearchParams({
    page: String(page),
    pageSize: '30',
    ...(classId ? { classId } : {}),
    ...(teacher ? { teacherUserId: teacher.userId } : {}),
    ...(kind ? { kind } : {}),
    ...(from ? { fromUtc: new Date(from).toISOString() } : {}),
    ...(to ? { toUtc: new Date(to).toISOString() } : {}),
  });
  const q = usePersonalApi<S['SchoolPageOfTeacherContentActivityDto']>(
    '/api/v1/organization/teacher-content-activities?' + query,
  );
  return (
    <Card title={t.contentActivities}>
      <MemberPicker
        role="Teacher"
        value={teacher?.membershipId ?? ''}
        onChange={(v) => {
          setTeacher(v);
          setPage(1);
        }}
      />
      <div className={uiClass(s.two)}>
        <Field label={t.contentKind}>
          <NativeSelect
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            {(['Lesson', 'Assignment', 'Exam', 'Session'] as const).map((k) => (
              <option key={k} value={k}>
                {t.activityKinds[k]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t.from}>
          <JalaliDateInput
            withTime
            value={from}
            onValueChange={(v) => {
              setFrom(v);
              setPage(1);
            }}
          />
        </Field>
        <Field label={t.to}>
          <JalaliDateInput
            withTime
            min={from}
            value={to}
            onValueChange={(v) => {
              setTo(v);
              setPage(1);
            }}
          />
        </Field>
      </div>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {!q.data.items.length && <EmptyState title={t.empty} />}
          <div className={uiClass(s.editorList)}>
            {q.data.items.map((a, i) => (
              <article
                className={uiClass(s.question)}
                key={a.eventId ?? a.sourceVersionId + ':' + a.sourceRevision + ':' + i}
              >
                <h3>{a.title}</h3>
                <p>
                  {a.teacherDisplayName}
                  {uiText.text_588da4105320}
                  {a.classTitle}
                  {uiText.text_588da4105320}
                  {t.activityKinds[a.kind]}
                </p>
                <p>
                  {t.revision}
                  {uiText.text_45822f54a0d0}
                  {a.sourceRevision.toLocaleString('fa-IR')}
                  {uiText.text_78887da22764} {date(a.publishedAtUtc, true)}
                </p>
              </article>
            ))}
          </div>
          <Pager
            page={q.data.page}
            total={q.data.totalCount}
            size={q.data.pageSize}
            onChange={setPage}
          />
        </>
      )}
    </Card>
  );
}
