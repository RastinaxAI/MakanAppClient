'use client';
import Link from 'next/link';
import { useState } from 'react';
import { vnext as t } from '@/content/fa';
import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { usePersonalApi } from '../provider';
import { SchoolSearch } from './directory';
import { base, Card, Field, Pager, SchoolHeading } from './shared';
import s from './school.module.css';
type S = components['schemas'];
export function ExamDiscovery({ classId }: { classId?: string }) {
  const [chosen, setChosen] = useState(classId ?? ''),
    [status, setStatus] = useState(''),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(1);
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  const query = new URLSearchParams({
    page: String(page),
    pageSize: '25',
    ...(chosen ? { classId: chosen } : {}),
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });
  const q = usePersonalApi<S['AcademicPageOfStudentExamSummary']>(
    '/api/v1/academic/exams/discovery?' + query,
  );
  return (
    <>
      <SchoolHeading title={t.examDiscovery} description={t.examDiscoveryHint} />
      <Card>
        <SchoolSearch
          label={t.searchExams}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <div className={s.two}>
          <Field label={t.title}>
            <select
              value={chosen}
              disabled={!!classId}
              onChange={(e) => {
                setChosen(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.all}</option>
              {classes.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.status}>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.all}</option>
              {['Draft', 'Published'].map((v) => (
                <option key={v} value={v}>
                  {label(v)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {classes.isError && (
          <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
        )}
        {chosen && (
          <Button asChild>
            <Link href={`${base}/classes/${chosen}/exams/new`}>{uiText.text_00f6d8e48e00}</Link>
          </Button>
        )}
      </Card>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <Card>
          {!q.data.items.length && <EmptyState title={t.empty} />}
          <div className={s.editorList}>
            {q.data.items.map((exam) => (
              <article className={s.question} key={exam.versionId}>
                <h3>{exam.title}</h3>
                <p>
                  {exam.classTitle}
                  {uiText.text_588da4105320}
                  {label(exam.publicationState)}
                </p>
                <Button asChild>
                  <Link
                    href={`${base}/exams/${exam.id}/edit`}
                    aria-label={uiText.text_41b23f4e8fe0 + exam.title}
                  >
                    {uiText.text_dfe5265ec744}
                  </Link>
                </Button>
              </article>
            ))}
          </div>
          <Pager
            page={q.data.page}
            total={q.data.total}
            size={q.data.pageSize}
            onChange={setPage}
          />
        </Card>
      )}
    </>
  );
}
