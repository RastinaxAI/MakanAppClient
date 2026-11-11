'use client';
import { uiClass } from '@/components/v5/classes';

import { v4Text as t } from '@/content/fa';
import * as uiText from '@/content/fa';
import { useContext, type ReactNode } from 'react';
import { ProductContext } from '@/components/v5/scene';
import Link from 'next/link';
import { BookOpen, Users, CalendarDays, ChevronLeft } from 'lucide-react';
import { EmptyState, label } from '@/components/ui/states';
import { V4Hero, V4List, V4Row, V4Note } from '@/components/v4/page';
import type { components } from '@/generated/api/schema';
import { number } from '@/lib/formatting';
import { base } from './shared';
import s from './v4-classes.module.css';
import { useClassRosterSummary, useVisibleClassRosterSummary } from './manager-class-summary';
type ClassItem = components['schemas']['ClassResult'];
const url = (id: string) => `${base}/classes/${id}`;

export function ManagerClassContext({ item }: { item?: ClassItem }) {
  const place = useContext(ProductContext);
  if (!item) return null;
  return (
    <>
      <div className={uiClass('context-tag')}>{uiText.v5Product.context}</div>
      <h3>{place.title}</h3>
      <p>{place.role}</p>
      <Link className={uiClass('context-item')} href={url(item.id)}>
        <b>{t.classMembers}</b>
        <div className={uiClass('context-value')}>{uiText.text_01772a20d830}</div>
      </Link>
      <Link className={uiClass('context-item')} href={url(item.id) + '?tab=sessions'}>
        <b>{t.sessions}</b>
        <div className={uiClass('context-value')}>{uiText.text_3c19c6f1ae0d}</div>
      </Link>
      <div className={uiClass('context-item')}>
        <p>{uiText.v5Product.contextBackPolicy}</p>
      </div>
    </>
  );
}

export function ManagerClassCards({
  items,
  selectedId,
  onSelect,
  search,
  counts,
}: {
  items: ClassItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  search: ReactNode;
  counts?: components['schemas']['ManagerOperationalCounts'];
}) {
  const selected = items.find((c) => c.id === selectedId) ?? items[0];
  return (
    <div className={uiClass(s.managerBody)} data-v4-view="MK-455">
      {counts && (
        <div className={uiClass(s.metrics)} data-class-metrics>
          <div>
            <b>{number(counts.activeClassCount)}</b>
            <small>{t.activeClasses}</small>
          </div>
          <div>
            <b>{number(counts.enrolledLearnerCount)}</b>
            <small>{uiText.v5Product.enrollments}</small>
          </div>
          <div>
            <b>{number(counts.teacherCount)}</b>
            <small>{uiText.v5Product.teachers}</small>
          </div>
        </div>
      )}
      {selected && <SelectedClassDetails item={selected} />}
      {search}
      {!items.length ? (
        <EmptyState title={t.noClass} />
      ) : (
        <>
          <div className={uiClass(s.tableWrap)} data-class-table>
            <table aria-label={t.classes}>
              <thead>
                <tr>
                  <th>{t.classes}</th>
                  <th>{t.course}</th>
                  <th>{uiText.v5Product.teachers}</th>
                  <th>{uiText.v5Product.enrollments}</th>
                  <th>{t.status}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <ManagerClassRow
                    key={item.id}
                    item={item}
                    selected={selected?.id === item.id}
                    onSelect={onSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className={uiClass(s.mobileCards)}>
            {items.map((item) => (
              <ManagerClassCard
                key={item.id}
                item={item}
                selected={selected?.id === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      )}
      <V4Note>{t.classListHint}</V4Note>
    </div>
  );
}

function SelectedClassDetails({ item }: { item: ClassItem }) {
  const summary = useClassRosterSummary(item);
  return (
    <>
      <V4Hero title={t.selectedClass}>{item.title}</V4Hero>
      <dl
        className={uiClass(s.details)}
        data-class-summary={item.id}
        data-enrolled={summary.enrolled}
      >
        <div>
          <dt>{t.period}</dt>
          <dd>{item.academicPeriodTitle}</dd>
        </div>
        <div>
          <dt>{t.capacity}</dt>
          <dd>{number(item.capacity)}</dd>
        </div>
        <div>
          <dt>{uiText.v5Product.enrollments}</dt>
          <dd
            aria-label={
              summary.enrolled === undefined ? uiText.v5Product.summaryUnavailable : undefined
            }
          >
            {summary.enrolled === undefined ? '—' : number(summary.enrolled)}
          </dd>
        </div>
      </dl>
      <V4List>
        <V4Row
          title={t.classMembers}
          description={uiText.text_01772a20d830}
          icon={<Users />}
          href={url(item.id)}
        />
        <V4Row
          title={t.sessions}
          description={uiText.text_3c19c6f1ae0d}
          icon={<CalendarDays />}
          href={url(item.id) + '?tab=sessions'}
        />
      </V4List>
    </>
  );
}
type RowProps = { item: ClassItem; selected: boolean; onSelect: (id: string) => void };
function TeacherName({ summary }: { summary: ReturnType<typeof useClassRosterSummary> }) {
  return (
    <span
      aria-label={summary.teacher === undefined ? uiText.v5Product.summaryUnavailable : undefined}
    >
      {summary.teacher ?? '—'}
      {summary.teacherCount !== undefined && summary.teacherCount > 1 && (
        <small> (+{number(summary.teacherCount - 1)})</small>
      )}
    </span>
  );
}
function EnrollmentCount({
  summary,
  capacity,
}: {
  summary: ReturnType<typeof useClassRosterSummary>;
  capacity: number;
}) {
  return (
    <bdi
      dir="ltr"
      aria-label={summary.enrolled === undefined ? uiText.v5Product.summaryUnavailable : undefined}
    >
      {summary.enrolled === undefined ? '—' : number(summary.enrolled)} / {number(capacity)}
    </bdi>
  );
}
function ManagerClassRow({ item, selected, onSelect }: RowProps) {
  const { ref, summary } = useVisibleClassRosterSummary(item);
  return (
    <tr ref={ref} data-selected={selected}>
      <td>
        <div className={uiClass(s.titleCell)}>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
            aria-label={t.selectClass + ' ' + item.title}
          >
            {item.title}
          </button>
          <Link
            className={uiClass(s.open)}
            href={url(item.id)}
            aria-label={uiText.text_ea1397131af1 + item.title}
          >
            <ChevronLeft size={16} />
          </Link>
        </div>
      </td>
      <td>{item.courseTitle}</td>
      <td>
        <TeacherName summary={summary} />
      </td>
      <td>
        <EnrollmentCount summary={summary} capacity={item.capacity} />
      </td>
      <td>{label(item.status)}</td>
    </tr>
  );
}
function ManagerClassCard({ item, selected, onSelect }: RowProps) {
  const { ref, summary } = useVisibleClassRosterSummary(item);
  return (
    <article ref={ref} className={uiClass('card')}>
      <h3>
        <button
          className={uiClass(s.select)}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-pressed={selected}
        >
          {item.title}
        </button>
      </h3>
      <dl className={uiClass(s.cardDetails)}>
        <div>
          <dt>{t.course}</dt>
          <dd>{item.courseTitle}</dd>
        </div>
        <div>
          <dt>{t.period}</dt>
          <dd>{item.academicPeriodTitle}</dd>
        </div>
        <div>
          <dt>{uiText.v5Product.teachers}</dt>
          <dd>
            <TeacherName summary={summary} />
          </dd>
        </div>
        <div>
          <dt>{uiText.v5Product.enrollments}</dt>
          <dd>
            <EnrollmentCount summary={summary} capacity={item.capacity} />
          </dd>
        </div>
        <div>
          <dt>{t.status}</dt>
          <dd>{label(item.status)}</dd>
        </div>
      </dl>
      <Link
        className={uiClass(s.openCard)}
        href={url(item.id)}
        aria-label={uiText.text_ea1397131af1 + item.title}
      >
        {uiText.text_e0c1b3a8ec7a}
      </Link>
    </article>
  );
}

export function V4ClassList({
  items,
  learners,
  id = 'MK-86',
}: {
  items: ClassItem[];
  learners?: Map<string, number>;
  id?: string;
}) {
  if (!items.length) return <EmptyState title={t.noClass} />;
  return (
    <div className={uiClass(s.page + ' ' + s.learnerList)} data-v4-view={id}>
      <V4List>
        {items.map((item) => (
          <V4Row
            key={item.id}
            title={item.title}
            description={
              <>
                <span>{`${learners?.has(item.id) ? number(learners.get(item.id)!) + ' ' + uiText.v5Product.learners : item.courseTitle} · ${item.academicPeriodTitle}`}</span>
                <span className={s.mobileClassFooter} aria-hidden="true">
                  {uiText.text_d77e2ea74d81}
                  <ChevronLeft size={18} />
                </span>
              </>
            }
            icon={<BookOpen />}
            href={url(item.id)}
            ariaLabel={uiText.text_535e99805ced + item.title}
            end={
              <>
                <span className={uiClass(s.badge)}>{label(item.status)}</span>
                <ChevronLeft size={16} />
              </>
            }
          />
        ))}
      </V4List>
    </div>
  );
}
