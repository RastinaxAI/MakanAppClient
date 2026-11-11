import type { components } from '@/generated/api/schema';
import { safeMeetingUrl } from './policy';
type S = components['schemas'];
export type RuleDraft = {
  day: string;
  time: string;
  duration: string;
  from: string;
  until: string;
  title: string;
  link: string;
  apply: string;
  zone?: string;
};
export const ruleDays: S['DayOfWeek'][] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
export function scheduleRuleDetails(value: RuleDraft) {
  const duration = Number(value.duration);
  if (
    !ruleDays.includes(value.day as S['DayOfWeek']) ||
    !/^\d{2}:\d{2}(?::\d{2})?$/.test(value.time) ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    duration > 1440 ||
    !value.title.trim() ||
    !(value.zone ?? 'Asia/Tehran').trim()
  )
    return null;
  const [hour, minute, second = '00'] = value.time.split(':');
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return null;
  return {
    localDayOfWeek: value.day as S['DayOfWeek'],
    localStartTime: `${hour}:${minute}:${second}`,
    durationMinutes: duration,
    timeZoneId: (value.zone ?? 'Asia/Tehran').trim(),
    sessionTitle: value.title.trim(),
  };
}
export function scheduleRuleCommand(value: RuleDraft): S['CreateScheduleRuleCommand'] | null {
  const details = scheduleRuleDetails(value);
  if (
    !details ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.until) ||
    value.until < value.from ||
    (value.link.trim() && !safeMeetingUrl(value.link))
  )
    return null;
  return {
    ...details,
    effectiveFrom: value.from,
    effectiveUntil: value.until,
    meetingUrl: safeMeetingUrl(value.link) || null,
  };
}
