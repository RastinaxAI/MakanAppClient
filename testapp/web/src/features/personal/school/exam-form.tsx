'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as copy from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { NumberInput } from '@/components/ui/number-input';
import { V4Field } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { persianDigits } from '@/lib/formatting';
import { jalaliDisplayValue } from '@/lib/jalali-date';
import { usePersonal } from '../provider';
import { LessonFields } from './lesson-fields';
import { WorkflowDraftConflict, useWorkflowDraft } from './workflow';
import { useSchoolAction, toUtc, base } from './shared';
type S = components['schemas'];
const t = copy.v5Exams;
const positiveInt32 = (value: string) =>
  /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647;

/** Organization exams use the existing command; independent rollout stays in its own flow. */
export function ExamForm({ classId }: { classId: string }) {
  const { session } = usePersonal();
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  const rules = ['rules', 'review'].includes(params.get('step') ?? '');
  const draft = useWorkflowDraft('exam:new:' + classId, {
    title: '',
    description: '',
    start: '',
    end: '',
    duration: '',
    attempts: '',
    score: '',
    random: false,
  });
  const v = draft.values,
    action = useSchoolAction();
  const [created, setCreated] = useState(false);
  const titleInput = useRef<HTMLInputElement>(null),
    priorStep = useRef(rules);
  const start = Date.parse(v.start),
    end = Date.parse(v.end);
  const validRange = Number.isFinite(start) && Number.isFinite(end) && end > start;
  const statementValid = !!v.title.trim() && validRange;
  const validDuration = positiveInt32(v.duration),
    validAttempts = positiveInt32(v.attempts);
  const validScore =
    /^\d+(?:\.\d{1,2})?$/.test(v.score) && Number.isFinite(Number(v.score)) && Number(v.score) > 0;
  const settingsValid = validDuration && validAttempts && validScore;
  const disabled = action.busy || created || !draft.ready || draft.stale;
  const step = (next: boolean) => {
    const q = new URLSearchParams(params);
    if (next) q.set('step', 'rules');
    else q.delete('step');
    router.replace(path + (q.size ? '?' + q : ''), { scroll: false });
  };
  useEffect(() => {
    if (priorStep.current === rules) return;
    priorStep.current = rules;
    if (rules) document.querySelector<HTMLInputElement>('[data-v5-scene="MK-151"] input')?.focus();
    else titleInput.current?.focus();
  }, [rules]);
  return (
    <V5Scene
      id={rules ? 'MK-151' : 'MK-150'}
      title={rules ? t.rules : t.statement}
      back={base + '/classes/' + classId + '/exams'}
      onBack={rules ? () => step(false) : undefined}
      backWithinPage={rules}
      schoolForm
      summary={
        rules
          ? [
              {
                label: t.duration,
                value: v.duration ? persianDigits(v.duration) + ' ' + t.minute : '',
              },
              { label: t.attempts, value: persianDigits(v.attempts) },
              { label: t.score, value: persianDigits(v.score) },
              { label: t.order, value: v.random ? t.random : t.fixed },
            ]
          : [
              { label: t.title, value: v.title },
              { label: t.description, value: v.description },
              { label: t.start, value: v.start ? jalaliDisplayValue(v.start, true, true) : '' },
              { label: t.end, value: v.end ? jalaliDisplayValue(v.end, true, true) : '' },
            ]
      }
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      actions={
        <Button
          type="submit"
          disabled={disabled || !statementValid || (rules && !settingsValid)}
          aria-busy={action.busy}
        >
          {action.busy ? copy.text_fc2867f048ea : rules ? t.create : t.next}
        </Button>
      }
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || !statementValid) return;
        if (!rules) {
          step(true);
          return;
        }
        if (!settingsValid) return;
        const body: S['CreateExamDraftCommand'] = {
          title: v.title.trim(),
          description: v.description.trim() || null,
          availableFromUtc: toUtc(v.start),
          availableUntilUtc: toUtc(v.end),
          durationMinutes: Number(v.duration),
          maxAttempts: Number(v.attempts),
          maxScore: Number(v.score),
          randomizationPolicy: v.random ? 'QuestionOrder' : 'None',
        };
        const result = await action.run<S['ExamEditorDto']>(
          '/api/v1/academic/classes/' + classId + '/exams',
          body,
          'POST',
          (row) =>
            row.organizationId === session.context.organizationId &&
            row.classId === classId &&
            row.status === 'Draft' &&
            row.versionStatus === 'Draft' &&
            !!row.examRowVersion.trim() &&
            !!row.versionRowVersion.trim() &&
            (!row.classRef ||
              (row.classRef.kind === 'OrganizationClass' && row.classRef.classId === classId)),
        );
        if (result) {
          setCreated(true);
          draft.reset();
          router.replace(base + '/exams/' + result.id + '/edit');
        }
      }}
    >
      <WorkflowDraftConflict
        stale={draft.stale}
        onDiscard={draft.acceptServerValues}
        focusAfterReset={() =>
          rules
            ? document.querySelector<HTMLInputElement>('[data-v5-scene="MK-151"] input')?.focus()
            : titleInput.current?.focus()
        }
      />
      {rules ? (
        <fieldset className={uiClass('v5-native-fields')} disabled={disabled}>
          <V4Field
            label={t.duration}
            error={v.duration && !validDuration ? t.invalidDuration : undefined}
          >
            <NumberInput
              required
              unit={t.minute}
              aria-description={t.minute}
              value={v.duration}
              aria-invalid={!!v.duration && !validDuration}
              onValueChange={(value) => draft.set('duration', value)}
            />
          </V4Field>
          <V4Field
            label={t.attempts}
            error={v.attempts && !validAttempts ? t.invalidAttempts : undefined}
          >
            <NumberInput
              required
              value={v.attempts}
              onValueChange={(value) => draft.set('attempts', value)}
            />
          </V4Field>
          <V4Field label={t.score} error={v.score && !validScore ? t.invalidScore : undefined}>
            <NumberInput
              required
              decimal
              value={v.score}
              onValueChange={(value) => draft.set('score', value)}
            />
          </V4Field>
          <V4Field label={t.order}>
            <NativeSelect
              value={v.random ? 'QuestionOrder' : 'None'}
              onChange={(event) => draft.set('random', event.target.value === 'QuestionOrder')}
            >
              <option value="None">{t.fixed}</option>
              <option value="QuestionOrder">{t.random}</option>
            </NativeSelect>
          </V4Field>
        </fieldset>
      ) : (
        <LessonFields
          title={v.title}
          body={v.description}
          titleLabel={t.title}
          bodyLabel={t.description}
          titleRef={titleInput}
          disabled={disabled}
          onTitleChange={(value) => draft.set('title', value)}
          onBodyChange={(value) => draft.set('description', value)}
        >
          <V4Field label={t.start}>
            <JalaliDateInput
              required
              withTime
              compactTimeDate
              value={v.start}
              onValueChange={(value) => draft.set('start', value)}
            />
          </V4Field>
          <V4Field
            label={t.end}
            error={v.start && v.end && !validRange ? t.invalidRange : undefined}
          >
            <JalaliDateInput
              required
              withTime
              compactTimeDate
              min={v.start}
              value={v.end}
              onValueChange={(value) => draft.set('end', value)}
            />
          </V4Field>
        </LessonFields>
      )}
      {action.feedback}
    </V5Scene>
  );
}
