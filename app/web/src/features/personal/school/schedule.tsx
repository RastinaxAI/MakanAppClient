'use client';
import { Input as NativeInput, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock3, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { usePersonalApi, usePersonal } from '../provider';
import { Card, Field, safeMeetingUrl, base } from './shared';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { useWorkspaceSnapshot } from '../workspaces';
import { V5Scene } from '@/components/v5/scene';
import Link from 'next/link';
import {
  currentSchoolWeek,
  shiftSchoolWeek,
  schoolWeekRange,
  localCalendarDay,
  sessionEndDayLabel,
} from './calendar-model';
import s from './schedule.module.css';
type S = components['schemas'];
export function SchedulePage({ teach }: { teach: boolean }) {
  return (
    <V5Scene
      id="ORG-27"
      title={uiText.v7Ui.weeklySchedule}
      back={base}
      kind="list"
      headerTools={
        <Button
          size="icon"
          variant="ghost"
          aria-label={uiText.text_589d5004f227}
          onClick={() => window.dispatchEvent(new Event('makan:education-sections'))}
        >
          <MoreHorizontal size={20} />
        </Button>
      }
    >
      <Schedule teach={teach} standalone />
    </V5Scene>
  );
}
export function Schedule({
  classId,
  teach,
  standalone = false,
}: {
  classId?: string;
  teach: boolean;
  standalone?: boolean;
}) {
  const { session } = usePersonal();
  const workspaces = useWorkspaceSnapshot();
  const organizationName =
    workspaces.data?.workspaces.find(
      (item) =>
        item.membershipId === session.context.membershipId &&
        item.role === session.context.activeRole,
    )?.organizationName || uiText.navigation_education;
  const memory =
    session.user.id +
    ':' +
    contextSignature(session.context) +
    ':schedule:' +
    (classId || 'all') +
    ':';
  const thisWeek = currentSchoolWeek();
  const day = useSearchParams().get('day');
  let requestedWeek: string | undefined;
  if (day) {
    try {
      requestedWeek = schoolWeekRange(day).first;
    } catch {
      requestedWeek = undefined;
    }
  }
  const [week, setWeek, weekReady] = useViewState(
    memory + 'week',
    requestedWeek ?? thisWeek,
    (v): v is string =>
      typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)),
  );
  useEffect(() => {
    if (weekReady && requestedWeek) setWeek(requestedWeek);
  }, [weekReady, requestedWeek, setWeek]);
  const [filter, setFilter] = useViewState(
    memory + 'filter',
    { classId: '', cancelled: false },
    (v): v is { classId: string; cancelled: boolean } =>
      !!v &&
      typeof v === 'object' &&
      'classId' in v &&
      typeof v.classId === 'string' &&
      'cancelled' in v &&
      typeof v.cancelled === 'boolean',
  );
  const [filterOpen, setFilterOpen] = useState(false),
    [draftFilter, setDraftFilter] = useState(filter),
    [draftDate, setDraftDate] = useState(week);
  const range = schoolWeekRange(week);
  const [view, setView] = useViewState(
    memory + 'view',
    day ? 'day' : 'week',
    (value): value is string => value === 'week' || value === 'day',
  );
  const [chosenDay, setChosenDay] = useViewState(
    memory + 'day',
    day || localCalendarDay(new Date().toISOString()),
    (value): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value),
  );
  useEffect(() => {
    if (day && requestedWeek) {
      setChosenDay(day);
      setView('day');
    }
  }, [day, requestedWeek, setChosenDay, setView]);
  const activeDay = range.days.some((value) => value.date === chosenDay) ? chosenDay : range.first;
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: filterOpen && !classId,
  });
  const q = usePersonalApi<S['SessionResult'][]>(
    '/api/v1/academic/schedule?' +
      new URLSearchParams({ fromUtc: range.fromUtc, toUtc: range.toUtc }),
    { poll: 10000 },
  );
  const invalid = q.data?.some((item) => item.organizationId !== session.context.organizationId);
  const items = (q.data ?? [])
    .filter(
      (item) =>
        (!classId || item.classId === classId) &&
        (!filter.classId || item.classId === filter.classId) &&
        (filter.cancelled || item.status !== 'Cancelled') &&
        Date.parse(item.startUtc) >= Date.parse(range.fromUtc) &&
        Date.parse(item.startUtc) <= Date.parse(range.toUtc),
    )
    .sort((a, b) => Date.parse(a.startUtc) - Date.parse(b.startUtc));
  const groups = range.days
    .map((day) => ({
      ...day,
      items: items.filter((item) => localCalendarDay(item.startUtc) === day.date),
    }))
    .filter((day) => day.items.length > 0 && (view !== 'day' || day.date === activeDay));
  const time = (value: string) =>
    new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(value),
    );
  return (
    <Card
      title={uiText.text_2fdcd8a1bdba}
      className={uiClass(`${s.schedule} ${standalone ? s.standalone : ''}`)}
      action={
        <div className={uiClass(s.filterActions)}>
          <Button
            variant="outline"
            onClick={() => {
              setDraftFilter(filter);
              setDraftDate(week);
              setFilterOpen(true);
            }}
          >
            <SlidersHorizontal size={18} />
            {uiText.scheduleFilters.title}
          </Button>
          {teach && classId && (
            <div className={uiClass('v4-inline-actions')}>
              <Button asChild>
                <Link href={`${base}/classes/${classId}/sessions/new`}>
                  {uiText.text_8a8bca7672c8}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`${base}/classes/${classId}/schedule-rules/new`}>
                  {uiText.v4Text.weeklyRule}
                </Link>
              </Button>
            </div>
          )}
        </div>
      }
    >
      <nav
        className={uiClass(s.weekNavigation)}
        aria-label={uiText.text_ba767b9a0d5e}
        data-week-start={range.first}
        data-week-end={range.last}
      >
        <Button
          variant="outline"
          className={uiClass(`${s.navigationButton} ${s.previous}`)}
          aria-label={uiText.text_e32082a4e12f}
          onClick={() => setWeek((v) => shiftSchoolWeek(v, -1))}
        >
          <ChevronRight size={18} />
          <span>{uiText.text_e32082a4e12f}</span>
        </Button>
        <div className={uiClass(s.range)}>
          <p className={uiClass(s.weekLabel)} aria-live="polite" aria-atomic="true">
            {range.label}
          </p>
          <span>{uiText.text_fcd0612e300b}</span>
        </div>
        <Button
          variant="ghost"
          className={uiClass(`${s.navigationButton} ${s.current}`)}
          disabled={week === thisWeek}
          onClick={() => setWeek(thisWeek)}
        >
          {uiText.text_cf12b2fabd7e}
        </Button>
        <Button
          variant="outline"
          className={uiClass(`${s.navigationButton} ${s.next}`)}
          aria-label={uiText.text_4c6c8570d091}
          onClick={() => setWeek((v) => shiftSchoolWeek(v, 1))}
        >
          <span>{uiText.text_4c6c8570d091}</span>
          <ChevronLeft size={18} />
        </Button>
      </nav>
      <div className={s.viewControls}>
        <div className={s.viewTabs} role="group" aria-label={uiText.v7Ui.scheduleView}>
          <button type="button" aria-pressed={view === 'week'} onClick={() => setView('week')}>
            {uiText.v7Ui.weekView}
          </button>
          <button type="button" aria-pressed={view === 'day'} onClick={() => setView('day')}>
            {uiText.v7Ui.dayView}
          </button>
        </div>
        {view === 'day' && (
          <label className={s.dayChoice}>
            {uiText.v7Ui.chooseDay}
            <NativeSelect
              aria-label={uiText.v7Ui.chooseDay}
              value={activeDay}
              onChange={(event) => setChosenDay(event.target.value)}
            >
              {range.days.map((value) => (
                <option key={value.date} value={value.date}>
                  {value.weekday} · {value.label}
                </option>
              ))}
            </NativeSelect>
          </label>
        )}
      </div>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : invalid ? (
        <p role="alert">{uiText.text_be58b9137dd7}</p>
      ) : groups.length ? (
        <div className={uiClass(s.agenda)} aria-label={uiText.text_85454321f228}>
          {groups.map((day) => (
            <section
              key={day.date}
              className={uiClass(s.dayGroup)}
              aria-label={day.weekday + ' ' + day.label}
            >
              <header>
                <h3>{day.weekday}</h3>
                <time dateTime={day.date}>{day.label}</time>
              </header>
              <div className={uiClass(s.sessions)}>
                {day.items.map((item) => (
                  <article key={item.id} className={uiClass(s.session)}>
                    <div className={uiClass(s.sessionBody)}>
                      <h4>
                        <Link href={`${base}/sessions/${item.id}`}>{item.title}</Link>
                      </h4>
                      {!classId && <p>{item.classTitle}</p>}
                      <div className={uiClass(s.sessionMeta)}>
                        <span>
                          <Clock3 size={15} />
                          <bdi>
                            {time(item.startUtc)}
                            {uiText.text_7168a3799fbf}
                            {time(item.endUtc)}
                            {sessionEndDayLabel(item.startUtc, item.endUtc) && (
                              <time
                                dateTime={localCalendarDay(item.endUtc)}
                                title={uiText.text_d61ca8f948c8}
                              >
                                {' '}
                                {uiText.text_32ebb1abcc1c}
                                {sessionEndDayLabel(item.startUtc, item.endUtc)}
                                {uiText.text_ba5ec51d07a4}
                              </time>
                            )}
                          </bdi>
                        </span>
                        <span className={uiClass(s.status)}>{label(item.status)}</span>
                      </div>
                    </div>
                    {item.status === 'Scheduled' && safeMeetingUrl(item.meetingUrl) && (
                      <Button asChild variant="outline">
                        <a
                          href={safeMeetingUrl(item.meetingUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {uiText.text_b1fa64d456bf}
                        </a>
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={uiClass(s.empty)}>
          <EmptyState title={uiText.text_0ebd449a5ce9} description={uiText.text_a2a9b91a28ef} />
        </div>
      )}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent title={uiText.scheduleFilters.title} side scenario="MK-120 RX-053">
          <form
            className={uiClass('stack')}
            onSubmit={(event) => {
              event.preventDefault();
              if (!draftDate) return;
              setFilter(draftFilter);
              setWeek(currentSchoolWeek(new Date(draftDate + 'T12:00:00Z')));
              setFilterOpen(false);
            }}
          >
            <Field label={uiText.navigation_education}>
              <NativeInput readOnly value={organizationName} />
            </Field>
            {!classId && (
              <fieldset className={uiClass(s.classChoices)} disabled={classes.isPending}>
                <legend className={uiClass('sr-only')}>{uiText.scheduleFilters.class}</legend>
                {[
                  { id: '', title: uiText.scheduleFilters.allClasses },
                  ...(classes.data || []).filter(
                    (item) => item.organizationId === session.context.organizationId,
                  ),
                ].map((item) => (
                  <label key={item.id}>
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        {item.id
                          ? uiText.scheduleFilters.thisClass
                          : uiText.scheduleFilters.authorizedSchedule}
                      </small>
                    </span>
                    <NativeInput
                      type="radio"
                      name="schedule-class-filter"
                      value={item.id}
                      aria-label={item.title}
                      checked={draftFilter.classId === item.id}
                      onChange={() => setDraftFilter((value) => ({ ...value, classId: item.id }))}
                    />
                  </label>
                ))}
              </fieldset>
            )}
            {classes.isError && (
              <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
            )}
            <label className={uiClass(s.cancelledCheck)}>
              <NativeInput
                role="switch"
                type="checkbox"
                checked={draftFilter.cancelled}
                onChange={(event) =>
                  setDraftFilter((v) => ({ ...v, cancelled: event.target.checked }))
                }
              />
              {uiText.scheduleFilters.cancelled}
            </label>
            <Field label={uiText.scheduleFilters.date}>
              <JalaliDateInput required value={draftDate} onValueChange={setDraftDate} />
            </Field>
            <div className={uiClass('confirm-actions')}>
              <Button type="submit" disabled={!draftDate}>
                {uiText.scheduleFilters.apply}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraftFilter({ classId: '', cancelled: false });
                  setDraftDate(thisWeek);
                }}
              >
                {uiText.scheduleFilters.reset}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
