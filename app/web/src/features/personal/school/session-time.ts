import { v5Sessions as t } from '@/content/fa';
import { date, latinDigits } from '@/lib/formatting';

/** Compact Tehran display only; the actual UTC range and editable year are retained. */
export function sessionTimeRange(start: string, end: string) {
  const first = new Date(start),
    last = new Date(end);
  if (![first, last].every((value) => Number.isFinite(value.getTime())))
    return t.timeBetween(date(start, true), date(end, true));
  const day = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  if (day.format(first) !== day.format(last))
    return t.timeBetween(date(start, true), date(end, true));
  const clock = (value: Date) => {
    const parts = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(value);
    const hour = parts.find((part) => part.type === 'hour')!.value;
    const minute = parts.find((part) => part.type === 'minute')!.value;
    return latinDigits(minute) === '00' ? hour : hour + ':' + minute;
  };
  const short = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    month: 'long',
    day: 'numeric',
  }).format(first);
  return t.timeRange(short, clock(first), clock(last));
}
