'use client';
import { Input as NativeInput, Select as NativeSelect, SearchField } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, BookOpen, CalendarDays, Check } from 'lucide-react';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { useEffect, useId, useMemo, useState, Fragment, type ReactElement } from 'react';
import Link from 'next/link';
import { usePersonalApi } from '../provider';
import s from './school.module.css';
import { Card, Field, Pager, useSchoolCommand } from './shared';
import { V4List, V4Row } from '@/components/v4/page';
import { date } from '@/lib/formatting';
import { useClassRosterSummary } from './manager-class-summary';
import { usePersonal } from '../provider';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { useSceneContextSummary, useSceneMenuTools } from '@/components/v5/form-actions';
type S = components['schemas'];

export function schoolQuery(page: number, search = '', extra: Record<string, string> = {}) {
  return new URLSearchParams({
    Page: String(page),
    PageSize: '30',
    ...(search.trim() ? { Search: search.trim() } : {}),
    ...extra,
  }).toString();
}
export function SchoolSearch({
  onSearch,
  label: title = uiText.text_2a93eb7f06ce,
  disabled = false,
  embedded = false,
  initialValue = '',
  variant = 'default',
}: {
  onSearch: (q: string) => void;
  label?: string;
  disabled?: boolean;
  embedded?: boolean;
  initialValue?: string;
  variant?: 'default' | 'bar';
}) {
  const [draft, setDraft] = useState(initialValue);
  useEffect(() => setDraft(initialValue), [initialValue]);
  const search = () => {
    if (!disabled) onSearch(draft.trim());
  };
  const contents =
    variant === 'bar' ? (
      <SearchField
        aria-label={title}
        placeholder={title}
        disabled={disabled}
        maxLength={100}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (embedded && e.key === 'Enter') {
            e.preventDefault();
            search();
          }
        }}
        onClear={() => {
          setDraft('');
          if (!disabled) onSearch('');
        }}
        action={
          <Button
            aria-label={uiText.text_2a93eb7f06ce}
            type={embedded ? 'button' : 'submit'}
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={embedded ? search : undefined}
          >
            <Search size={19} />
          </Button>
        }
      />
    ) : (
      <>
        <NativeInput
          aria-label={title}
          disabled={disabled}
          maxLength={100}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (embedded && e.key === 'Enter') {
              e.preventDefault();
              search();
            }
          }}
          placeholder={title}
        />
        <Button
          aria-label={uiText.text_2a93eb7f06ce}
          type={embedded ? 'button' : 'submit'}
          variant="outline"
          disabled={disabled}
          onClick={embedded ? search : undefined}
        >
          {uiText.text_2a93eb7f06ce}
        </Button>
      </>
    );
  return embedded ? (
    <div className={uiClass(variant === 'bar' ? s.searchBar : s.toolbar)}>{contents}</div>
  ) : (
    <form
      className={uiClass(variant === 'bar' ? s.searchBar : s.toolbar)}
      onSubmit={(e) => {
        e.preventDefault();
        search();
      }}
    >
      {contents}
    </form>
  );
}
export function MemberPicker({
  role,
  value,
  onChange,
}: {
  role: 'Teacher' | 'Student';
  value: string;
  onChange: (member: S['SchoolMemberResult'] | null) => void;
}) {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const q = usePersonalApi<S['SchoolPageOfSchoolMemberResult']>(
    '/api/v1/organization/members?' + schoolQuery(page, search, { Role: role, Status: 'Active' }),
  );
  return (
    <>
      <SchoolSearch
        label={role === 'Teacher' ? uiText.text_1145531ebd7a : uiText.text_e6598afab142}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
          onChange(null);
        }}
      />
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <Field label={role === 'Teacher' ? uiText.text_21bd12880c60 : uiText.text_3419a22ae8f0}>
            <NativeSelect
              value={value}
              onChange={(e) =>
                onChange(q.data.items.find((x) => x.membershipId === e.target.value) ?? null)
              }
            >
              <option value="">{uiText.text_b1f76db217bd}</option>
              {q.data.items.map((m) => (
                <option key={m.membershipId} value={m.membershipId}>
                  {m.displayName}
                  {m.username ? ` (@${m.username})` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Pager
            page={q.data.page}
            size={q.data.pageSize}
            total={q.data.totalCount}
            onChange={(p) => {
              setPage(p);
              onChange(null);
            }}
          />
        </>
      )}
    </>
  );
}
export function ClassRoster({
  classId,
  kind,
  manage = false,
  variant = 'table',
  searchPlacement = 'body',
}: {
  classId: string;
  kind: 'learners' | 'teachers';
  manage?: boolean;
  variant?: 'list' | 'table';
  searchPlacement?: 'body' | 'menu';
}) {
  const { session } = usePersonal();
  const memory = `${session.user.id}:${contextSignature(session.context)}:class-roster:${classId}:${kind}:`;
  const [page, setPage] = useViewState(
    memory + 'page',
    1,
    (v): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0,
  );
  const [search, setSearch] = useViewState(
    memory + 'search',
    '',
    (v): v is string => typeof v === 'string',
  );
  const q = usePersonalApi<
    S['SchoolPageOfClassLearnerResult'] | S['SchoolPageOfClassTeacherResult']
  >(`/api/v1/academic/classes/${classId}/${kind}?` + schoolQuery(page, search));
  const command = useSchoolCommand();
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: variant === 'list' && manage && kind === 'learners',
  });
  const classroom = classes.data?.find(
    (item) => item.id === classId && item.organizationId === session.context.organizationId,
  );
  const summary = useClassRosterSummary(
    { id: classId, organizationId: classroom?.organizationId ?? '' },
    variant === 'list' && manage && kind === 'learners' && !!classroom,
  );
  useSceneContextSummary(
    q.data?.items
      .slice(0, 3)
      .map((member) => ({ label: member.displayName, value: label(member.status) })) ?? [],
    variant === 'list',
  );
  const searchControl = useMemo(
    () => (
      <SchoolSearch
        variant={variant === 'list' ? 'bar' : 'default'}
        initialValue={search}
        label={uiText.text_bd48b6b60f08}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
    ),
    [variant, search, setSearch, setPage],
  );
  const searchInMenu = useSceneMenuTools(searchControl, searchPlacement === 'menu');
  const endControl = (
    m: S['ClassLearnerResult'] | S['ClassTeacherResult'],
    triggerControl?: ReactElement<{ disabled?: boolean }>,
  ) => {
    const learner = 'enrollmentId' in m;
    const relationId = learner ? m.enrollmentId : m.teacherAssignmentId;
    return manage && m.status === 'Active' && m.version ? (
      <ConfirmAction
        destructive
        title={uiText.text_454d4aebcf48 + m.displayName + uiText.text_e09a66220579}
        trigger={uiText.text_276cb596ac92 + m.displayName}
        triggerControl={triggerControl}
        scenario={learner ? 'MK-100' : 'MK-103'}
        confirm={uiText.text_329f02ad417c}
        description={learner ? uiText.text_7e52cd6c1407 : uiText.text_c1259e061304}
        onConfirm={async () => {
          await command(
            `/api/v1/academic/classes/${classId}/${learner ? 'enrollments' : 'teachers'}/${relationId}/end`,
            learner
              ? { finalStatus: 'Withdrawn', expectedVersion: m.version }
              : { expectedVersion: m.version },
          );
          return true;
        }}
      />
    ) : null;
  };
  const body = (
    <>
      {!searchInMenu && searchControl}
      {variant === 'list' && manage && kind === 'learners' && classroom && (
        <div className={uiClass('stats')} data-roster-statistics>
          {[
            [uiText.v5Product.activeEnrollment, summary.enrolled],
            [
              uiText.v5Product.freeCapacity,
              summary.enrolled === undefined
                ? undefined
                : Math.max(0, classroom.capacity - summary.enrolled),
            ],
            [uiText.text_57400196e6de, classroom.capacity],
          ].map(([title, value]) => (
            <div className={uiClass('stat')} key={String(title)}>
              <b>{typeof value === 'number' ? value.toLocaleString('fa-IR') : '—'}</b>
              <span>{title}</span>
            </div>
          ))}
        </div>
      )}
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {q.data.items.length ? (
            variant === 'list' ? (
              <V4List>
                {q.data.items.map((m) => {
                  const description = date(
                    'enrolledAtUtc' in m ? m.enrolledAtUtc : m.assignedAtUtc,
                  );
                  const badge = <span className={uiClass('badge')}>{label(m.status)}</span>;
                  const trigger = (
                    <button
                      type="button"
                      className={uiClass('v5-row row')}
                      aria-label={uiText.text_276cb596ac92 + m.displayName}
                    >
                      <span className={uiClass('avatar')} aria-hidden="true">
                        {m.displayName.slice(0, 1)}
                      </span>
                      <span className={uiClass('v5-row-copy grow')}>
                        <strong>{m.displayName}</strong>
                        <small>{description}</small>
                      </span>
                      {badge}
                    </button>
                  );
                  return (
                    <Fragment key={'enrollmentId' in m ? m.enrollmentId : m.teacherAssignmentId}>
                      {endControl(m, trigger) ?? (
                        <V4Row
                          key={'enrollmentId' in m ? m.enrollmentId : m.teacherAssignmentId}
                          title={m.displayName}
                          description={description}
                          icon={m.displayName.slice(0, 1)}
                          iconClassName="avatar"
                          end={badge}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </V4List>
            ) : (
              <div className={uiClass(manage ? `${s.tableWrap} ${s.roster}` : s.tableWrap)}>
                <table role="table" className={uiClass(s.table)}>
                  <thead role="rowgroup">
                    <tr role="row">
                      <th role="columnheader">{uiText.text_69c1e5b1fe20}</th>
                      <th role="columnheader">{uiText.text_173fec6019a6}</th>
                      <th role="columnheader">{uiText.text_68d7eb08efbc}</th>
                      {manage && <th role="columnheader">{uiText.text_9d08b60ae631}</th>}
                    </tr>
                  </thead>
                  <tbody role="rowgroup">
                    {q.data.items.map((m) => {
                      const learner = 'enrollmentId' in m;
                      const relationId = learner ? m.enrollmentId : m.teacherAssignmentId;
                      return (
                        <tr role="row" key={relationId}>
                          <td role="cell">{m.displayName}</td>
                          <td role="cell">
                            <bdi>{m.username ? '@' + m.username : '—'}</bdi>
                          </td>
                          <td role="cell">{label(m.status)}</td>
                          {manage && <td role="cell">{endControl(m)}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <EmptyState title={uiText.text_88ee345f182d} />
          )}
          {(page > 1 || q.data.totalCount > q.data.pageSize) && (
            <Pager
              page={q.data.page}
              size={q.data.pageSize}
              total={q.data.totalCount}
              onChange={setPage}
            />
          )}
        </>
      )}
    </>
  );
  return variant === 'list' ? (
    <div
      className={uiClass(s.rosterList)}
      data-with-statistics={(manage && kind === 'learners') || undefined}
    >
      {body}
      {kind === 'teachers' && searchPlacement === 'menu' && (
        <p className={uiClass(s.rosterPolicy)}>{uiText.v5Product.teacherAssignmentPolicy}</p>
      )}
    </div>
  ) : (
    <Card title={kind === 'learners' ? uiText.text_4cdeeb638917 : uiText.text_a803103e88cf}>
      {body}
    </Card>
  );
}
export function CatalogPicker({
  kind,
  value,
  valueTitle,
  onChange,
  createHref,
  createLabel,
}: {
  kind: 'courses' | 'periods';
  value: string;
  valueTitle?: string;
  onChange: (id: string, title: string) => void;
  createHref?: string;
  createLabel?: string;
}) {
  const controlId = useId();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ id: string; title: string }>();
  const q = usePersonalApi<S['SchoolPageOfCourseResult'] | S['SchoolPageOfAcademicPeriodResult']>(
    `/api/v1/academic/${kind}?` + schoolQuery(page, search, { status: 'Active' }),
  );
  const title =
    q.data?.items.find((item) => item.id === value)?.title ||
    (selected?.id === value ? selected.title : valueTitle);
  const fieldLabel =
    kind === 'courses' ? uiText.v5Product.courseCatalog : uiText.v5Product.educationalPeriod;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={uiClass('v5-field field')}>
        <label htmlFor={controlId}>{fieldLabel}</label>
        <DialogTrigger asChild>
          <button id={controlId} type="button" className={uiClass('input')} aria-haspopup="dialog">
            <span>{title || (value ? uiText.text_f240dea8c236 : uiText.text_b1f76db217bd)}</span>
            <ChevronDown size={19} />
          </button>
        </DialogTrigger>
      </div>
      <DialogContent
        title={kind === 'courses' ? uiText.text_a517344f3199 : uiText.text_5f681ac52334}
        scenario={kind === 'courses' ? 'MK-93' : undefined}
      >
        <SchoolSearch
          embedded
          variant="bar"
          initialValue={search}
          label={kind === 'courses' ? uiText.text_7469916c83c5 : uiText.text_65d3d3894fde}
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
            <div className={uiClass('list')}>
              {q.data.items.length ? (
                q.data.items.map((item) => (
                  <button
                    className={uiClass('row v5-row')}
                    key={item.id}
                    type="button"
                    aria-label={uiText.v5Product.selectCatalogItem + item.title}
                    aria-pressed={value === item.id}
                    onClick={() => {
                      setSelected(item);
                      onChange(item.id, item.title);
                      setOpen(false);
                    }}
                  >
                    <span className={uiClass('tile-icon')}>
                      {kind === 'courses' ? <BookOpen size={22} /> : <CalendarDays size={22} />}
                    </span>
                    <span className={uiClass('grow')}>{item.title}</span>
                    {value === item.id && <Check size={19} />}
                  </button>
                ))
              ) : (
                <EmptyState title={uiText.vnext.empty} />
              )}
            </div>
            {(page > 1 || q.data.totalCount > q.data.pageSize) && (
              <Pager
                page={q.data.page}
                size={q.data.pageSize}
                total={q.data.totalCount}
                onChange={setPage}
              />
            )}
          </>
        )}
        {createHref && (
          <div data-dialog-actions>
            <Button asChild variant="outline">
              <Link href={createHref}>{createLabel}</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
