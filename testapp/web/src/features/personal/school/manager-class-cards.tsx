'use client';
import { v4Text as t } from '@/content/fa';
import * as uiText from '@/content/fa';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CalendarDays, ChartNoAxesCombined, ChevronLeft } from 'lucide-react';
import { EmptyState, label } from '@/components/ui/states';
import { V4Hero, V4List, V4Row, V4Note } from '@/components/v4/page';
import type { components } from '@/generated/api/schema';
import { number } from '@/lib/formatting';
import { base } from './shared';
import s from './v4-classes.module.css';
type ClassItem = components['schemas']['ClassResult'];
export function ManagerClassCards({ items }: { items: ClassItem[] }) {
  return <V4ClassList items={items} manage />;
}
export function V4ClassList({ items, manage = false }: { items: ClassItem[]; manage?: boolean }) {
  const [selectedId, setSelectedId] = useState('');
  const selected = items.find((c) => c.id === selectedId) ?? items[0];
  if (!selected) return <EmptyState title={t.noClass} />;
  const url = (id: string) => `${base}/classes/${id}`;
  return (
    <div className={s.page} data-v4-view={manage ? 'MK-455' : 'MK-86'}>
      <div className={manage ? s.mobileList : s.allSizesList}>
        <V4List>
          {items.map((item) => (
            <V4Row
              key={item.id}
              title={item.title}
              description={`${item.courseTitle} · ${item.academicPeriodTitle}`}
              icon={<BookOpen />}
              href={url(item.id)}
              ariaLabel={
                (manage ? uiText.text_ea1397131af1 : uiText.text_535e99805ced) + item.title
              }
              end={
                <>
                  <span className={s.badge}>{label(item.status)}</span>
                  <ChevronLeft size={16} />
                </>
              }
            />
          ))}
        </V4List>
      </div>
      {manage && (
        <div className={s.desktop}>
          <div className={s.metrics}>
            <div>
              <b>{number(items.filter((c) => c.status === 'Active').length)}</b>
              <small>{t.activeClasses}</small>
            </div>
            <div>
              <b>{number(items.reduce((sum, c) => sum + c.capacity, 0))}</b>
              <small>{t.totalCapacity}</small>
            </div>
            <div>
              <b>{number(new Set(items.map((c) => c.academicPeriodId)).size)}</b>
              <small>{t.periods}</small>
            </div>
          </div>
          <div className={s.split}>
            <aside className={s.context}>
              <V4Hero title={t.selectedClass}>{selected.title}</V4Hero>
              <dl className={s.details}>
                <div>
                  <dt>{t.period}</dt>
                  <dd>{selected.academicPeriodTitle}</dd>
                </div>
                <div>
                  <dt>{t.capacity}</dt>
                  <dd>{number(selected.capacity)}</dd>
                </div>
                <div>
                  <dt>{t.status}</dt>
                  <dd>{label(selected.status)}</dd>
                </div>
              </dl>
              <V4List>
                <V4Row title={t.classMembers} icon={<Users />} href={url(selected.id)} />
                <V4Row
                  title={t.sessions}
                  icon={<CalendarDays />}
                  href={url(selected.id) + '?tab=sessions'}
                />
                <V4Row
                  title={t.reports}
                  icon={<ChartNoAxesCombined />}
                  href={url(selected.id) + '?tab=reports'}
                />
              </V4List>
            </aside>
            <div className={s.tableColumn}>
              <div className={s.tableWrap}>
                <table aria-label={t.classes}>
                  <thead>
                    <tr>
                      <th>{t.classes}</th>
                      <th>{t.course}</th>
                      <th>{t.period}</th>
                      <th>{t.capacity}</th>
                      <th>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        data-selected={selected.id === item.id}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            aria-pressed={selected.id === item.id}
                            aria-label={t.selectClass + ' ' + item.title}
                          >
                            {item.title}
                          </button>
                          <Link
                            className={s.open}
                            href={url(item.id)}
                            aria-label={uiText.text_ea1397131af1 + item.title}
                          >
                            <ChevronLeft size={16} />
                          </Link>
                        </td>
                        <td>{item.courseTitle}</td>
                        <td>{item.academicPeriodTitle}</td>
                        <td>{number(item.capacity)}</td>
                        <td>{label(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <V4Note>{t.classListHint}</V4Note>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
