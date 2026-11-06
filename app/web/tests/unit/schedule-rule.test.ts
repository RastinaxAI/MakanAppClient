import { describe, it, expect } from 'vitest';
import {
  scheduleRuleCommand,
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
  ])('blocks invalid or unsafe inputs %j', (changes) => {
    expect(scheduleRuleCommand({ ...valid, ...changes })).toBeNull();
  });
});
