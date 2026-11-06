'use client';
import { v4Text as t } from '@/content/fa';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { V4Field, V4Hero, V4List, V4Row, V4Note } from '@/components/v4/page';
import type { components } from '@/generated/api/schema';
import { date, number, latinDigits } from '@/lib/formatting';
import { WorkflowPage, useWorkflowDraft } from './workflow';
import { base, useSchoolAction } from './shared';
import { scheduleRuleCommand, ruleDays, type RuleDraft } from './schedule-rule-model';
type S = components['schemas'];
export function ScheduleRules({ classId }: { classId: string }) {
  const initial: RuleDraft = {
    day: 'Saturday',
    time: '16:00',
    duration: '60',
    from: '',
    until: '',
    title: '',
    link: '',
    apply: '',
  };
  const draft = useWorkflowDraft('weekly:' + classId, initial);
  const a = useSchoolAction(),
    [review, setReview] = useState(false),
    [invalid, setInvalid] = useState(false),
    [receipt, setReceipt] = useState<S['ScheduleRuleResult']>(),
    [editing, setEditing] = useState(false);
  const v = draft.values,
    command = scheduleRuleCommand(v);
  function edit() {
    if (!receipt) return;
    draft.reset(
      JSON.stringify({
        day: receipt.localDayOfWeek,
        time: receipt.localStartTime,
        duration: String(receipt.durationMinutes),
        from: receipt.effectiveFrom,
        until: receipt.effectiveUntil,
        title: receipt.sessionTitle,
        link: receipt.meetingUrl ?? '',
        apply: receipt.effectiveFrom,
      }),
    );
    setEditing(true);
    setReview(false);
  }
  return (
    <WorkflowPage
      title={t.weeklyNew}
      back={`${base}/classes/${classId}?tab=sessions`}
      roles={['Manager', 'Teacher']}
      classId={classId}
    >
      <div data-v4-view={editing ? 'MK-133' : review ? 'MK-132' : 'MK-131'}>
        {receipt && !editing ? (
          <>
            <V4Hero title={t.lastRule}>{receipt.sessionTitle}</V4Hero>
            <V4List>
              <V4Row
                title={t.generatedSessions}
                description={number(receipt.generatedSessionCount)}
              />
              <V4Row
                title={t.range}
                description={date(receipt.effectiveFrom) + ' · ' + date(receipt.effectiveUntil)}
              />
            </V4List>
            <div className="v4-inline-actions">
              <Button onClick={edit}>{t.editRule}</Button>
              <Button asChild variant="outline">
                <Link href={`${base}/classes/${classId}?tab=sessions`}>{t.sessions}</Link>
              </Button>
            </div>
          </>
        ) : (
          <form
            className="v4-rule-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                !command ||
                (editing &&
                  (!v.apply || v.apply < command.effectiveFrom || v.apply > command.effectiveUntil))
              ) {
                setInvalid(true);
                return;
              }
              if (!review) {
                setReview(true);
                return;
              }
              const result = await a.run<S['ScheduleRuleResult']>(
                editing && receipt
                  ? `/api/v1/academic/schedule-rules/${receipt.id}`
                  : `/api/v1/academic/classes/${classId}/schedule-rules`,
                editing && receipt
                  ? { ...command, applyFromDate: v.apply, expectedRowVersion: receipt.rowVersion }
                  : command,
                editing ? 'PATCH' : 'POST',
              );
              if (result) {
                setReceipt(result);
                setEditing(false);
                draft.reset();
              }
            }}
          >
            {review && command ? (
              <>
                <V4Hero title={t.reviewRule}>{command.sessionTitle}</V4Hero>
                <V4List>
                  <V4Row
                    title={t.day}
                    description={t.weekdays[ruleDays.indexOf(command.localDayOfWeek)]}
                  />
                  <V4Row title={t.startTime} description={command.localStartTime} />
                  <V4Row title={t.duration} description={number(command.durationMinutes)} />
                  <V4Row
                    title={t.range}
                    description={date(command.effectiveFrom) + ' · ' + date(command.effectiveUntil)}
                  />
                </V4List>
                <Button type="button" variant="ghost" onClick={() => setReview(false)}>
                  {t.back}
                </Button>
              </>
            ) : (
              <>
                <V4Field label={t.day}>
                  <select value={v.day} onChange={(e) => draft.set('day', e.target.value)}>
                    {ruleDays.map((day, i) => (
                      <option key={day} value={day}>
                        {t.weekdays[i]}
                      </option>
                    ))}
                  </select>
                </V4Field>
                <V4Field label={t.startTime}>
                  <input
                    type="time"
                    required
                    value={v.time}
                    onChange={(e) => draft.set('time', e.target.value)}
                  />
                </V4Field>
                <V4Field label={t.duration}>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={v.duration}
                    onChange={(e) =>
                      draft.set('duration', latinDigits(e.target.value).replace(/\D/g, ''))
                    }
                  />
                </V4Field>
                <V4Field label={t.sessionTitle}>
                  <input
                    required
                    value={v.title}
                    onChange={(e) => draft.set('title', e.target.value)}
                  />
                </V4Field>
                <V4Field label={t.startDate}>
                  <JalaliDateInput
                    required
                    value={v.from}
                    onValueChange={(value) => draft.set('from', value)}
                  />
                </V4Field>
                <V4Field label={t.endDate}>
                  <JalaliDateInput
                    required
                    min={v.from}
                    value={v.until}
                    onValueChange={(value) => draft.set('until', value)}
                  />
                </V4Field>
                <V4Field label={t.meetingLink}>
                  <input
                    type="url"
                    value={v.link}
                    onChange={(e) => draft.set('link', e.target.value)}
                  />
                </V4Field>
                {editing && (
                  <V4Field label={t.applyFrom}>
                    <JalaliDateInput
                      required
                      min={v.from}
                      max={v.until}
                      value={v.apply}
                      onValueChange={(value) => draft.set('apply', value)}
                    />
                  </V4Field>
                )}
              </>
            )}
            <V4Note>{t.zone}</V4Note>
            {invalid && (
              <p className="v4-form-error" role="alert">
                {t.ruleInvalid}
              </p>
            )}
            {a.feedback}
            <Button type="submit" disabled={a.busy || !draft.ready}>
              {a.busy ? t.waiting : review ? t.saveRule : t.reviewRule}
            </Button>
          </form>
        )}
      </div>
    </WorkflowPage>
  );
}
