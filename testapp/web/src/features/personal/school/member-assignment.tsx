'use client';
import { Select as NativeSelect, Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, buttonClass } from '@/components/ui/button';
import { ErrorState, EmptyState, LoadingSkeleton, label } from '@/components/ui/states';
import { V5Scene } from '@/components/v5/scene';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { usePersonal, usePersonalApi } from '../provider';
import { schoolQuery, SchoolSearch } from './directory';
import { Field, Pager } from './shared';
import { useAcademicScope } from './academic-scope';
import { useClassRosterSummary } from './manager-class-summary';
import Link from 'next/link';
import s from './member-assignment.module.css';
type S = components['schemas'];
type Pick = {
  id: string;
  name: string;
  state: 'selected' | 'sending' | 'done' | 'error';
  error?: unknown;
};
export function ClassMemberAssignment({
  classId,
  kind,
}: {
  classId: string;
  kind: 'teachers' | 'learners';
}) {
  const teacher = kind === 'teachers',
    { session, call } = usePersonal(),
    cache = useQueryClient();
  const { base } = useAcademicScope();
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  const classroom = classes.data?.find(
    (item) => item.id === classId && item.organizationId === session.context.organizationId,
  );
  const summary = useClassRosterSummary(
    { id: classId, organizationId: classroom?.organizationId ?? '' },
    !teacher && !!classroom,
  );
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(''),
    [source, setSource] = useState('members');
  const [selected, setSelected] = useState<Record<string, Pick>>({}),
    [busy, setBusy] = useState(false);
  const lock = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const members = usePersonalApi<S['SchoolPageOfSchoolMemberResult']>(
    '/api/v1/organization/members?' +
      schoolQuery(page, search, { Role: teacher ? 'Teacher' : 'Student', Status: 'Active' }),
    { enabled: source === 'members' },
  );
  const people = usePersonalApi<S['OrganizationPeoplePage']>(
    `/api/v1/organization/people?page=${page}&pageSize=30&search=${encodeURIComponent(search)}`,
    { enabled: source === 'records' },
  );
  const q = source === 'records' ? people : members;
  const candidates =
    source === 'records'
      ? (people.data?.items.map((p) => ({
          id: p.id,
          name: p.displayName || p.firstName + ' ' + p.lastName,
          detail: label(p.status),
          disabled: p.status !== 'Active',
        })) ?? [])
      : (members.data?.items.map((m) => ({
          id: teacher ? m.membershipId : m.organizationPersonId,
          name: m.displayName,
          detail: m.username ? '@' + m.username : label(m.membershipStatus),
          disabled:
            m.membershipStatus !== 'Active' ||
            !m.activeRoles.includes(teacher ? 'Teacher' : 'Student') ||
            (!teacher && !m.organizationPersonId),
        })) ?? []);
  const choices = Object.values(selected),
    pending = choices.filter((p) => p.state !== 'done');
  useUnsavedChanges(busy || pending.length > 0);
  const update = (pick: Pick) => {
    if (alive.current) setSelected((old) => ({ ...old, [pick.id]: pick }));
  };
  async function alreadyActive(targetId: string) {
    for (let p = 1; ; p++) {
      const rows = await call<
        S['SchoolPageOfClassTeacherResult'] | S['SchoolPageOfClassLearnerResult']
      >(`/api/v1/academic/classes/${classId}/${kind}?` + schoolQuery(p));
      if (
        rows.items.some(
          (r) =>
            r.status === 'Active' &&
            ('teacherMembershipId' in r ? r.teacherMembershipId : r.learnerOrganizationPersonId) ===
              targetId,
        )
      )
        return true;
      if (rows.page * rows.pageSize >= rows.totalCount) return false;
    }
  }
  async function submit() {
    if (lock.current || !pending.length) return;
    lock.current = true;
    setBusy(true);
    try {
      for (const pick of pending) {
        if (!alive.current) break;
        update({ ...pick, state: 'sending', error: undefined });
        try {
          // A failed response may have applied. Reconcile before manually retrying.
          if (pick.state === 'error' && (await alreadyActive(pick.id))) {
            update({ ...pick, state: 'done', error: undefined });
            continue;
          }
          await call(
            `/api/v1/academic/classes/${classId}/${teacher ? 'teachers' : 'enrollments'}`,
            {
              method: 'POST',
              body: JSON.stringify(
                teacher
                  ? { teacherMembershipId: pick.id }
                  : { learnerOrganizationPersonId: pick.id },
              ),
            },
          );
          update({ ...pick, state: 'done', error: undefined });
        } catch (error) {
          update({ ...pick, state: 'error', error });
          if (error instanceof ApiError && [401, 403, 409].includes(error.status)) break;
        }
      }
      if (alive.current)
        await cache.invalidateQueries({
          queryKey: ['personal', session.user.id, session.revision],
        });
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <V5Scene
      id={teacher ? 'MK-102' : 'MK-99'}
      title={teacher ? uiText.v5Product.assignTeacher : uiText.v5Product.chooseLearner}
      back={`${base}/classes/${classId}`}
      kind="list"
      summary={
        q.isSuccess
          ? candidates.slice(0, 3).map((person) => ({ label: person.name, value: person.detail }))
          : []
      }
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      actions={
        <Button type="submit" disabled={busy || !pending.length} aria-busy={busy}>
          {busy
            ? uiText.text_b48606a1eeac
            : pending.some((p) => p.state === 'error')
              ? uiText.text_895f00b2273b
              : uiText.text_dc08253feac0 +
                pending.length.toLocaleString('fa-IR') +
                uiText.text_a91a0317a5d6}
        </Button>
      }
      menu={
        <div className={uiClass('stack')}>
          {!teacher && (
            <Field label={uiText.text_b4adb9469c50}>
              <NativeSelect
                disabled={busy}
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                  setSearch('');
                }}
              >
                <option value="members">{uiText.text_e896842afe7b}</option>
                <option value="records">{uiText.text_e40bbfa529e7}</option>
              </NativeSelect>
            </Field>
          )}
          <Link
            href={`${base}/classes/${classId}`}
            className={uiClass(buttonClass('button button-outline'))}
          >
            {uiText.common_back}
          </Link>
        </div>
      }
    >
      <div className={uiClass(s.layout)}>
        <section className={uiClass(s.selection)}>
          <SchoolSearch
            key={source}
            embedded
            variant="bar"
            label={teacher ? uiText.text_120de68a4876 : uiText.text_65ede2372929}
            disabled={busy}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          {q.isPending ? (
            <LoadingSkeleton />
          ) : q.isError ? (
            <ErrorState error={q.error} onRetry={() => void q.refetch()} />
          ) : (
            <>
              {candidates.length ? (
                <ul className={uiClass(s.list)} data-candidate-list>
                  {candidates.map((p, i) => (
                    <li key={p.id ?? i}>
                      <label data-kind={kind}>
                        <NativeInput
                          type="checkbox"
                          aria-label={uiText.text_89e9053371c8 + p.name}
                          disabled={
                            busy || p.disabled || !!(p.id && selected[p.id]?.state === 'done')
                          }
                          checked={!!(p.id && selected[p.id])}
                          onChange={(e) => {
                            if (!p.id) return;
                            const id = p.id;
                            if (e.target.checked) update({ id, name: p.name, state: 'selected' });
                            else
                              setSelected((old) => {
                                const next = { ...old };
                                delete next[id];
                                return next;
                              });
                          }}
                        />
                        <span>
                          <strong>{p.name}</strong>
                          <small>{p.detail}</small>
                          {p.disabled && <small>{uiText.text_b3d6c9493f41}</small>}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title={uiText.text_a7752b98a99b} />
              )}
              {(page > 1 || q.data!.totalCount > q.data!.pageSize) && (
                <Pager
                  page={page}
                  total={q.data!.totalCount}
                  size={q.data!.pageSize}
                  onChange={(v) => {
                    if (!busy) setPage(v);
                  }}
                />
              )}
            </>
          )}
        </section>
        {!teacher && classroom && (
          <dl className={uiClass('v5-summary')}>
            <div>
              <dt>{uiText.text_36167d33608a}</dt>
              <dd>{classroom.title}</dd>
            </div>
            <div>
              <dt>{uiText.v5Product.freeCapacity}</dt>
              <dd>
                {summary.enrolled === undefined
                  ? '—'
                  : Math.max(0, classroom.capacity - summary.enrolled).toLocaleString('fa-IR')}
              </dd>
            </div>
          </dl>
        )}
        <p className={uiClass(s.policy)}>{uiText.text_e00915ec36cf}</p>
        {choices.length > 0 && (
          <aside className={uiClass(s.summary)} aria-label={uiText.text_e6abca191b09}>
            <h2>
              {choices.length.toLocaleString('fa-IR')}
              {uiText.text_cd049afa6984}
            </h2>
            <p>{uiText.text_2747228563a9}</p>
            {choices.map((p) => (
              <div className={uiClass(s.result)} key={p.id}>
                <strong>{p.name}</strong>
                <span role="status">
                  {p.state === 'done'
                    ? uiText.text_26906f613c15
                    : p.state === 'sending'
                      ? uiText.text_b5ef00b1806f
                      : p.state === 'error'
                        ? uiText.text_a9562ef9a9c5
                        : uiText.text_d8d6fdf5ca72}
                </span>
                {p.state === 'error' && <ErrorState error={p.error} />}
              </div>
            ))}
          </aside>
        )}
      </div>
    </V5Scene>
  );
}
