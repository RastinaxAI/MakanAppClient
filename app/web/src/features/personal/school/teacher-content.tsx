'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useRouter, useSearchParams } from 'next/navigation';
import * as text from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { V4List, V4Row } from '@/components/v4/page';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { useViewState } from '@/components/hooks/use-view-state';
import { ApiError } from '@/lib/api/errors';
import { contextSignature } from '@/lib/client-surface';
import type { components } from '@/generated/api/schema';
import { BookOpen, ClipboardList, FileQuestion } from 'lucide-react';
import { usePersonal, usePersonalApi } from '../provider';
import { Field, Pager, base } from './shared';
import { SchoolSearch, schoolQuery } from './directory';
import s from './teacher-content.module.css';
type S = components['schemas'];
type Kind = 'Lesson' | 'Assignment' | 'Exam';
const kinds: Kind[] = ['Lesson', 'Assignment', 'Exam'];

export function TeacherContentPage() {
  const { session } = usePersonal();
  if (session.context.workspaceType !== 'Organization' || session.context.activeRole !== 'Teacher')
    return <ErrorState error={new ApiError(403)} />;
  return <AuthorizedContent />;
}

function AuthorizedContent() {
  const { session } = usePersonal();
  const router = useRouter(),
    params = useSearchParams();
  const memory = session.user.id + ':' + contextSignature(session.context) + ':teacher-content:';
  const [rememberedKind, setRememberedKind] = useViewState<Kind>(
    memory + 'kind',
    'Lesson',
    (v): v is Kind => typeof v === 'string' && kinds.includes(v as Kind),
  );
  const explicitKind = params.get('kind');
  const kind = kinds.includes(explicitKind as Kind) ? (explicitKind as Kind) : rememberedKind;
  function setKind(value: Kind) {
    setRememberedKind(value);
    if (explicitKind !== null) {
      const query = new URLSearchParams(params);
      query.set('kind', value);
      router.replace(base + '/content?' + query);
    }
  }
  const [selectedId, setSelectedId] = useViewState(
    memory + 'class',
    '',
    (v): v is string => typeof v === 'string',
  );
  const [search, setSearch] = useViewState(
    memory + 'search',
    '',
    (v): v is string => typeof v === 'string',
  );
  const [page, setPage] = useViewState(
    memory + 'page',
    1,
    (v): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0,
  );
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  const selected = classes.data?.find((item) => item.id === selectedId) ?? classes.data?.[0];
  const validContext = !!selected && selected.organizationId === session.context.organizationId;
  const lessons = usePersonalApi<S['SchoolPageOfClassLessonResult']>(
    `/api/v1/academic/classes/${selected?.id}/lessons?` + schoolQuery(page, search),
    { enabled: validContext && kind === 'Lesson' },
  );
  const assignments = usePersonalApi<S['AssignmentResult'][]>(
    `/api/v1/academic/classes/${selected?.id}/assignments`,
    { enabled: validContext && kind === 'Assignment' },
  );
  const examQuery = new URLSearchParams({
    page: String(page),
    pageSize: '25',
    ...(selected ? { classId: selected.id } : {}),
    ...(search ? { search } : {}),
  });
  const exams = usePersonalApi<S['AcademicPageOfStudentExamSummary']>(
    '/api/v1/academic/exams/discovery?' + examQuery,
    { enabled: validContext && kind === 'Exam' },
  );
  const result = kind === 'Lesson' ? lessons : kind === 'Assignment' ? assignments : exams;
  const records =
    kind === 'Lesson'
      ? lessons.data?.items.map((item) => ({
          key: item.id,
          classId: item.classId,
          title: item.title,
          state: item.status,
          href: `${base}/lessons/${item.id}${item.status === 'Draft' ? '/edit' : ''}`,
        }))
      : kind === 'Assignment'
        ? assignments.data
            ?.filter((item) => item.title.includes(search))
            .map((item) => ({
              key: item.id,
              classId: item.classId,
              title: item.title,
              state: item.status,
              href: `${base}/assignments/${item.id}${item.status === 'Draft' ? '/edit' : ''}`,
            }))
        : exams.data?.items.map((item) => ({
            key: item.versionId,
            classId: item.classId,
            title: item.title,
            state: item.publicationState,
            href: `${base}/exams/${item.id}/edit`,
          }));
  const mismatch =
    (classes.data?.some((item) => item.organizationId !== session.context.organizationId) ??
      false) ||
    (records?.some((item) => item.classId !== selected?.id) ?? false);
  const paging =
    kind === 'Lesson'
      ? lessons.data
      : kind === 'Exam' && exams.data
        ? { ...exams.data, totalCount: exams.data.total }
        : undefined;
  const Icon = kind === 'Lesson' ? BookOpen : kind === 'Assignment' ? ClipboardList : FileQuestion;
  return (
    <V5Scene
      id="MK-169"
      title={text.v5Product.teacherContent}
      summary={
        !mismatch
          ? records?.slice(0, 3).map((item) => ({ label: item.title, value: label(item.state) }))
          : []
      }
      back={base + '/classes'}
      menu={
        <div className={uiClass('stack')}>
          <Field label={text.text_36167d33608a}>
            <NativeSelect
              value={selected?.id ?? ''}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setPage(1);
              }}
            >
              <option value="" disabled>
                {text.text_64a80eb6ce5b}
              </option>
              {classes.data
                ?.filter((item) => item.organizationId === session.context.organizationId)
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title}
                  </option>
                ))}
            </NativeSelect>
          </Field>
          <SchoolSearch
            variant="bar"
            embedded
            label={text.v5Product.contentSearch}
            initialValue={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
      }
    >
      <div className={uiClass(s.kinds)} role="group" aria-label={text.vnext.contentKind}>
        {kinds.map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={kind === value}
            onClick={() => {
              setKind(value);
              setPage(1);
            }}
          >
            {text.vnext.activityKinds[value]}
          </button>
        ))}
      </div>
      {classes.isPending ? (
        <LoadingSkeleton />
      ) : classes.isError ? (
        <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
      ) : mismatch ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : !selected ? (
        <EmptyState title={text.v4Text.noClass} />
      ) : result.isPending ? (
        <LoadingSkeleton />
      ) : result.isError ? (
        <ErrorState error={result.error} onRetry={() => void result.refetch()} />
      ) : (
        <>
          <div data-teacher-work-list>
            <V4List>
              {records?.length ? (
                records.map((item) => (
                  <V4Row
                    key={item.key}
                    title={item.title}
                    description={label(item.state)}
                    ariaLabel={item.title}
                    icon={<Icon size={22} />}
                    href={item.href}
                  />
                ))
              ) : (
                <EmptyState title={text.vnext.empty} />
              )}
            </V4List>
          </div>
          {paging && (page > 1 || paging.totalCount > paging.pageSize) && (
            <Pager
              page={paging.page}
              size={paging.pageSize}
              total={paging.totalCount}
              onChange={setPage}
            />
          )}
        </>
      )}
    </V5Scene>
  );
}
