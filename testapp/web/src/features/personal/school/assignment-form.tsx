'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as copy from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { V4Field, V4List, V4CheckLine, V4SwitchRow } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { latinDigits, persianDigits } from '@/lib/formatting';
import { jalaliDisplayValue } from '@/lib/jalali-date';
import { contextSignature } from '@/lib/client-surface';
import { usePersonal } from '../provider';
import { LessonFields } from './lesson-fields';
import { LessonAttachmentEditor } from './lesson-attachments';
import { useSchoolAttachments } from './use-school-attachments';
import { WorkflowDraftConflict, useWorkflowDraft } from './workflow';
import { useSchoolAction, toUtc, base } from './shared';
type S = components['schemas'];
const t = copy.v5Assignments;

/** The existing organization assignment command, split into its two native views. */
export function AssignmentForm({ classId }: { classId: string }) {
  const { session } = usePersonal();
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  const rules = params.get('step') === 'rules';
  const draft = useWorkflowDraft('assignment:new:' + classId, {
    title: '',
    description: '',
    due: '',
    attempts: '',
    score: '',
    late: false,
    assets: '[]',
    pending: '',
  });
  const v = draft.values,
    action = useSchoolAction();
  const [created, setCreated] = useState(false);
  const [reviewedSnapshot, setReviewedSnapshot] = useState('');
  const titleInput = useRef<HTMLInputElement>(null),
    priorStep = useRef(rules);
  const files = useSchoolAttachments({
    classId,
    assetsValue: v.assets,
    pendingValue: v.pending,
    onAssetsChange: (value) => draft.set('assets', value),
    onPendingChange: (value) => draft.set('pending', value),
    disabled: action.busy || created || !draft.ready || draft.stale,
  });
  const attempts = /^\d+$/.test(v.attempts) ? Number(v.attempts) : NaN;
  const validAttempts = Number.isSafeInteger(attempts) && attempts > 0 && attempts <= 2147483647;
  const score = /^\d+(?:\.\d{1,2})?$/.test(v.score) ? Number(v.score) : NaN;
  const validScore = Number.isFinite(score) && score > 0;
  const statementValid = !!v.title.trim() && !!v.description.trim();
  const settingsValid =
    !!v.due && Number.isFinite(Date.parse(v.due)) && validAttempts && validScore;
  const signature = JSON.stringify({
    userId: session.user.id,
    scope: contextSignature(session.context),
    classId,
    title: v.title,
    description: v.description,
    due: v.due,
    attempts: v.attempts,
    score: v.score,
    late: v.late,
    files: files.assets.map((asset) => [asset.id, asset.status]),
  });
  const reviewed = reviewedSnapshot === signature;
  const editingDisabled = action.busy || created || !draft.ready || draft.stale || files.corrupt;
  const disabled =
    editingDisabled ||
    files.uploading ||
    !!files.pending ||
    files.assets.some((asset) => asset.status !== 'Ready');
  const step = (next: boolean) => {
    const q = new URLSearchParams(params);
    if (next) q.set('step', 'rules');
    else q.delete('step');
    router.replace(path + (q.size ? '?' + q : ''), { scroll: false });
  };
  useEffect(() => {
    if (priorStep.current === rules) return;
    priorStep.current = rules;
    if (!rules) titleInput.current?.focus();
  }, [rules]);
  return (
    <V5Scene
      id={rules ? 'MK-142' : 'MK-141'}
      title={rules ? t.rules : t.statement}
      back={base + '/classes/' + classId + '?tab=assignments'}
      onBack={rules ? () => step(false) : undefined}
      backWithinPage={rules}
      schoolForm
      summary={
        rules
          ? [
              { label: t.due, value: v.due ? jalaliDisplayValue(v.due, true, true) : '' },
              { label: t.attempts, value: persianDigits(v.attempts) },
              { label: t.score, value: persianDigits(v.score) },
            ]
          : [
              { label: t.title, value: v.title },
              { label: t.description, value: v.description },
            ]
      }
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      actions={
        <Button
          type="submit"
          disabled={disabled || !statementValid || (rules && (!settingsValid || !reviewed))}
          aria-busy={action.busy}
        >
          {action.busy ? copy.text_fc2867f048ea : rules ? t.review : t.next}
        </Button>
      }
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || !statementValid || files.assets.some((asset) => asset.status !== 'Ready'))
          return;
        if (!rules) {
          step(true);
          return;
        }
        if (!settingsValid || !reviewed) return;
        const body: S['CreateAssignmentDraftCommand'] = {
          title: v.title.trim(),
          description: v.description.trim(),
          dueAtUtc: toUtc(v.due),
          allowLateSubmission: v.late,
          maxAttempts: attempts,
          maxScore: score,
          attachmentFileIds: files.assets.map((asset) => asset.id),
        };
        const result = await action.run<S['AssignmentResult']>(
          '/api/v1/academic/classes/' + classId + '/assignments',
          body,
          'POST',
          (row) =>
            row.organizationId === session.context.organizationId &&
            row.classId === classId &&
            row.status === 'Draft' &&
            !!row.assignmentRowVersion.trim() &&
            !!row.versionRowVersion.trim(),
        );
        if (result) {
          setCreated(true);
          draft.reset();
          router.push(base + '/assignments/' + result.id + '/publish-review');
        }
      }}
    >
      <WorkflowDraftConflict
        stale={draft.stale || files.corrupt}
        onDiscard={draft.acceptServerValues}
        focusAfterReset={() =>
          rules
            ? document.querySelector<HTMLInputElement>('[data-v5-scene="MK-142"] input')?.focus()
            : titleInput.current?.focus()
        }
      />
      {rules ? (
        <>
          <fieldset className={uiClass('v5-native-fields')} disabled={disabled}>
            <V4Field label={t.due}>
              <JalaliDateInput
                required
                withTime
                compactTimeDate
                value={v.due}
                onValueChange={(value) => draft.set('due', value)}
              />
            </V4Field>
            <V4Field
              label={t.attempts}
              error={v.attempts && !validAttempts ? t.invalidAttempts : undefined}
            >
              <NativeInput
                required
                inputMode="numeric"
                pattern={'\\p{Decimal_Number}+'}
                value={persianDigits(v.attempts)}
                onChange={(event) => draft.set('attempts', latinDigits(event.target.value))}
              />
            </V4Field>
            <V4Field label={t.score} error={v.score && !validScore ? t.invalidScore : undefined}>
              <NativeInput
                required
                inputMode="decimal"
                value={persianDigits(v.score)}
                onChange={(event) =>
                  draft.set('score', latinDigits(event.target.value).replace(/\u066b/g, '.'))
                }
              />
            </V4Field>
          </fieldset>
          <V4List>
            <V4SwitchRow
              title={t.late}
              description={t.lateHint}
              checked={v.late}
              disabled={disabled}
              onCheckedChange={(value) => draft.set('late', value)}
            />
          </V4List>
          <V4CheckLine
            label={t.ready}
            checked={reviewed}
            required
            disabled={disabled || !statementValid || !settingsValid}
            onCheckedChange={(checked) => setReviewedSnapshot(checked ? signature : '')}
          />
        </>
      ) : (
        <>
          <LessonFields
            title={v.title}
            body={v.description}
            titleLabel={t.title}
            bodyLabel={t.description}
            bodyRequired
            titleRef={titleInput}
            disabled={disabled}
            onTitleChange={(value) => draft.set('title', value)}
            onBodyChange={(value) => draft.set('description', value)}
          />
          <LessonAttachmentEditor
            assets={files.assets}
            pending={files.pending ?? undefined}
            uploading={files.uploading}
            disabled={editingDisabled}
            progress={files.progress}
            error={files.error}
            pickerLabel={t.addFile}
            pickerHint={t.fileHint}
            fileInputLabel={t.fileInput}
            regionLabel={t.files}
            onPick={(file) => void files.upload(file)}
            onRemove={(id) => files.setAssets((old) => old.filter((asset) => asset.id !== id))}
            onCancel={files.cancel}
            onCheck={() => void files.upload()}
            onDismiss={() => files.setPending(undefined)}
          />
        </>
      )}
      {action.feedback}
    </V5Scene>
  );
}
