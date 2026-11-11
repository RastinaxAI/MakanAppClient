import { describe, it, expect } from 'vitest';
import {
  scheduleRuleCommand,
  scheduleRuleDetails,
  type RuleDraft,
} from '@/features/personal/school/schedule-rule-model';
const valid: RuleDraft = {
  day: 'Saturday',
  time: '16:30',
  duration: '90',
  from: '2027-03-21',
  until: '2027-04-21',
  title: ' Algebra ',
  link: '',
  apply: '',
};
describe('V4 weekly rule requests', () => {
  it('uses the published local time contract and an explicit Tehran time zone', () => {
    expect(scheduleRuleCommand(valid)).toMatchObject({
      localDayOfWeek: 'Saturday',
      localStartTime: '16:30:00',
      durationMinutes: 90,
      timeZoneId: 'Asia/Tehran',
      sessionTitle: 'Algebra',
      meetingUrl: null,
    });
  });
  it.each([
    { day: 'invalid' },
    { time: '25:01' },
    { time: '09:70' },
    { duration: '0' },
    { duration: '1.5' },
    { from: '2027-05-01' },
    { link: 'javascript:alert(1)' },
    { title: ' ' },
    { zone: ' ' },
  ])('blocks invalid or unsafe inputs %j', (changes) => {
    expect(scheduleRuleCommand({ ...valid, ...changes })).toBeNull();
  });
  it('allows the details step without manufacturing an executable date range', () => {
    const value = { ...valid, from: '', until: '' };
    expect(scheduleRuleDetails(value)).toMatchObject({ sessionTitle: 'Algebra' });
    expect(scheduleRuleCommand(value)).toBeNull();
  });
  it('preserves an explicitly selected time zone and existing seconds', () => {
    expect(scheduleRuleCommand({ ...valid, time: '16:30:42', zone: 'Asia/Dubai' })).toMatchObject({
      timeZoneId: 'Asia/Dubai',
      localStartTime: '16:30:42',
    });
  });
});
