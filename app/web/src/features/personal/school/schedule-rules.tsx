'use client';
import { Input as NativeInput, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { v4Text as t, v5ScheduleRules as labels } from '@/content/fa';
import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/states';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { TimeInput, TimeZoneInput } from '@/components/ui/time-input';
import { timeInputLabel, timeZoneLabel } from '@/lib/time-input';
import { V4CheckLine, V4Field, V4Hero, V4List, V4Row, V4Note } from '@/components/v4/page';
import type { components } from '@/generated/api/schema';
import { date, number, latinDigits } from '@/lib/formatting';
import { usePersonal } from '../provider';
import { WorkflowPage, useWorkflowDraft } from './workflow';
import { base, useSchoolAction } from './shared';
import {
  scheduleRuleCommand,
  scheduleRuleDetails,
  ruleDays,
  type RuleDraft,
} from './schedule-rule-model';
type S = components['schemas'];
type Change = {
  command: S['CreateScheduleRuleCommand'];
  id: string;
  version: string;
  previousTime: string;
};
export function ScheduleRules({ classId }: { classId: string }) {
  const initial = {
    day: 'Saturday',
    time: '16:00',
    duration: '60',
    zone: 'Asia/Tehran',
    from: '',
    until: '',
    title: '',
    link: '',
    apply: '',
    ruleId: '',
    ruleVersion: '',
    previousTime: '',
  } satisfies RuleDraft & { ruleId: string; ruleVersion: string; previousTime: string };
  const draft = useWorkflowDraft('weekly:' + classId, initial);
  const a = useSchoolAction(),
    { session } = usePersonal(),
    router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams(),
    formId = 'schedule-rule-' + useId();
  const [acknowledged, setAcknowledged] = useState(''),
    [invalid, setInvalid] = useState(false),
    [receipt, setReceipt] = useState<S['ScheduleRuleResult']>(),
    [change, setChange] = useState<Change>();
  const v = draft.values,
    command = scheduleRuleCommand(v),
    details = scheduleRuleDetails(v),
    range = params.get('step') === 'range',
    editing = !!v.ruleId,
    signature = command ? JSON.stringify(command) : '',
    reviewed = !!signature && acknowledged === signature,
    showingReceipt = !!receipt && !editing;
  function step(next: boolean) {
    const query = new URLSearchParams(params);
    if (next) query.set('step', 'range');
    else query.delete('step');
    router.replace(pathname + (query.size ? '?' + query : ''), { scroll: false });
  }
  useEffect(() => {
    if (draft.ready && range && !details && !showingReceipt) {
      const query = new URLSearchParams(params);
      query.delete('step');
      router.replace(pathname + (query.size ? '?' + query : ''), { scroll: false });
    }
  }, [draft.ready, range, details, showingReceipt, params, pathname, router]);
  function edit() {
    if (!receipt) return;
    // Resume the acknowledged identity/version in the account/context-scoped draft.
    // Reloading an edit must not accidentally create a second rule.
    draft.reset(
      JSON.stringify({
        day: receipt.localDayOfWeek,
        time: receipt.localStartTime,
        duration: String(receipt.durationMinutes),
        zone: receipt.timeZoneId,
        from: receipt.effectiveFrom,
        until: receipt.effectiveUntil,
        title: receipt.sessionTitle,
        link: receipt.meetingUrl ?? '',
        apply: receipt.effectiveFrom,
        ruleId: receipt.id,
        ruleVersion: receipt.rowVersion,
        previousTime: receipt.localStartTime,
      }),
    );
    setAcknowledged('');
    setInvalid(false);
    step(false);
  }
  async function save(value: S['CreateScheduleRuleCommand'], update?: Change) {
    const result = await a.run<S['ScheduleRuleResult']>(
      update
        ? '/api/v1/academic/schedule-rules/' + update.id
        : '/api/v1/academic/classes/' + classId + '/schedule-rules',
      update ? { ...value, applyFromDate: v.apply, expectedRowVersion: update.version } : value,
      update ? 'PATCH' : 'POST',
      (row) =>
        row.classId === classId &&
        row.organizationId === session.context.organizationId &&
        !!row.rowVersion.trim() &&
        (!update || row.id === update.id),
    );
    if (result) {
      setReceipt(result);
      setChange(undefined);
      setAcknowledged('');
      setInvalid(false);
      draft.reset();
    }
  }
  return (
    <WorkflowPage
      title={range ? labels.range : labels.details}
      back={base + '/classes/' + classId + '?tab=sessions'}
      onBack={range && !showingReceipt ? () => step(false) : undefined}
      roles={['Manager', 'Teacher']}
      classId={classId}
      classNotice={false}
      overlayActive={!!change}
      scenario={range ? 'MK-132' : 'MK-131'}
      actions={
        !showingReceipt && (
          <Button form={formId} type="submit" disabled={a.busy || !draft.ready} aria-busy={a.busy}>
            {a.busy
              ? t.waiting
              : range
                ? editing
                  ? labels.reviewChange
                  : labels.create
                : labels.next}
          </Button>
        )
      }
    >
      {showingReceipt && receipt ? (
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
          {a.feedback}
          <div className={uiClass('v4-inline-actions')}>
            <Button onClick={edit}>{t.editRule}</Button>
            <Button asChild variant="outline">
              <Link href={base + '/classes/' + classId + '?tab=sessions'}>{t.sessions}</Link>
            </Button>
          </div>
        </>
      ) : (
        <form
          id={formId}
          className={uiClass('v5-native-form')}
          data-schedule-rule-form
          onSubmit={(event) => {
            event.preventDefault();
            if (a.busy || !draft.ready) return;
            if (!range) {
              if (!details) {
                setInvalid(true);
                return;
              }
              setInvalid(false);
              setAcknowledged('');
              step(true);
              return;
            }
            if (!command || !reviewed || (editing && !v.ruleVersion)) {
              setInvalid(true);
              return;
            }
            setInvalid(false);
            if (editing)
              setChange({
                command,
                id: v.ruleId,
                version: v.ruleVersion,
                previousTime: v.previousTime,
              });
            else void save(command);
          }}
        >
          {range ? (
            <>
              <V4Field label={t.startDate} summaryValue={v.from ? date(v.from) : ''}>
                <JalaliDateInput
                  required
                  disabled={a.busy}
                  value={v.from}
                  onValueChange={(value) => draft.set('from', value)}
                />
              </V4Field>
              <V4Field label={t.endDate} summaryValue={v.until ? date(v.until) : ''}>
                <JalaliDateInput
                  required
                  disabled={a.busy}
                  min={v.from}
                  value={v.until}
                  onValueChange={(value) => draft.set('until', value)}
                />
              </V4Field>
              <V4Field label={labels.link} summaryValue={v.link || labels.inPerson}>
                <NativeInput
                  type="url"
                  dir="auto"
                  placeholder={labels.inPerson}
                  value={v.link}
                  disabled={a.busy}
                  onChange={(event) => draft.set('link', event.target.value)}
                />
              </V4Field>
              <V4Note>{labels.zoneNote}</V4Note>
              <V4CheckLine
                required
                label={labels.reviewed}
                checked={reviewed}
                disabled={a.busy}
                onCheckedChange={(value) => setAcknowledged(value ? signature : '')}
              />
            </>
          ) : (
            <>
              <V4Field label={labels.day}>
                <NativeSelect
                  value={v.day}
                  disabled={a.busy}
                  onChange={(event) => draft.set('day', event.target.value)}
                >
                  {ruleDays.map((day, i) => (
                    <option key={day} value={day}>
                      {t.weekdays[i]}
                    </option>
                  ))}
                </NativeSelect>
              </V4Field>
              <V4Field label={labels.time} summaryValue={timeInputLabel(v.time)}>
                <TimeInput
                  required
                  disabled={a.busy}
                  value={v.time}
                  onValueChange={(value) => draft.set('time', value)}
                />
              </V4Field>
              <V4Field
                label={labels.duration}
                summaryValue={
                  v.duration ? number(Number(v.duration)) + ' ' + labels.durationUnit : ''
                }
              >
                <NativeInput
                  required
                  inputMode="numeric"
                  disabled={a.busy}
                  aria-description={labels.durationUnit}
                  value={v.duration ? number(Number(v.duration)) + ' ' + labels.durationUnit : ''}
                  onChange={(event) =>
                    draft.set('duration', latinDigits(event.target.value).replace(/\D/g, ''))
                  }
                />
              </V4Field>
              <V4Field label={labels.zone} summaryValue={timeZoneLabel(v.zone)}>
                <TimeZoneInput
                  required
                  disabled={a.busy}
                  value={v.zone}
                  onValueChange={(value) => draft.set('zone', value)}
                />
              </V4Field>
              <V4Field label={labels.title}>
                <NativeInput
                  required
                  disabled={a.busy}
                  value={v.title}
                  onChange={(event) => draft.set('title', event.target.value)}
                />
              </V4Field>
            </>
          )}
          {invalid && (
            <p className={uiClass('v4-form-error')} role="alert">
              {t.ruleInvalid}
            </p>
          )}
          {!!a.error && !change && <ErrorState error={a.error} />}
        </form>
      )}
      <Dialog
        open={!!change}
        onOpenChange={(open) => {
          if (!open && !a.busy) setChange(undefined);
        }}
      >
        <DialogContent title={labels.change} scenario="MK-133">
          <form
            className={uiClass('stack')}
            onSubmit={(event) => {
              event.preventDefault();
              if (!change || a.busy) return;
              if (
                !v.apply ||
                v.apply < change.command.effectiveFrom ||
                v.apply > change.command.effectiveUntil
              ) {
                setInvalid(true);
                return;
              }
              setInvalid(false);
              void save(change.command, change);
            }}
          >
            <V4Field label={labels.apply} error={invalid ? labels.applyInvalid : undefined}>
              <JalaliDateInput
                required
                disabled={a.busy}
                min={change?.command.effectiveFrom}
                max={change?.command.effectiveUntil}
                value={v.apply}
                onValueChange={(value) => draft.set('apply', value)}
              />
            </V4Field>
            <dl className={uiClass('v5-dialog-summary')}>
              <div className={uiClass('kv')}>
                <dt>{labels.beforeTime}</dt>
                <dd>{timeInputLabel(change?.previousTime)}</dd>
              </div>
              <div className={uiClass('kv')}>
                <dt>{labels.afterTime}</dt>
                <dd>{timeInputLabel(change?.command.localStartTime)}</dd>
              </div>
            </dl>
            <p className={uiClass('dialog-policy')}>{labels.changeNote}</p>
            {!!a.error && <ErrorState error={a.error} />}
            <div className={uiClass('confirm-actions')} data-dialog-actions>
              <Button type="submit" disabled={a.busy} aria-busy={a.busy}>
                {a.busy ? t.waiting : labels.saveChange}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={a.busy}
                onClick={() => setChange(undefined)}
              >
                {t.cancel}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </WorkflowPage>
  );
}
