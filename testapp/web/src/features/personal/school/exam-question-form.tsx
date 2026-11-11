'use client';
import {
  Textarea as NativeTextarea,
  Input as NativeInput,
  Select as NativeSelect,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useContext, useState } from 'react';
import * as copy from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NumberInput } from '@/components/ui/number-input';
import { V4CheckLine, V4Field, V4List, V4SwitchRow } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { SceneMenuClose, useSceneMenuTools } from '@/components/v5/form-actions';
import { persianDigits } from '@/lib/formatting';
import { usePersonal } from '../provider';
import { WorkflowDraftConflict, useWorkflowDraft } from './workflow';
import { useSchoolAction, base } from './shared';
import { ExamQuestionRemove } from './exam-question-remove';
type S = components['schemas'];
type Option = S['ExamQuestionOptionCommand'];
const t = copy.v5ExamQuestion;
const mimeOptions = ['application/pdf', 'image/jpeg', 'image/png'];
const positiveInt32 = (value: string) =>
  /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647;
function optionDraft(value: string): Option[] | undefined {
  try {
    const rows: unknown = JSON.parse(value);
    if (
      Array.isArray(rows) &&
      rows.every(
        (r) =>
          r &&
          Number.isInteger(r.order) &&
          r.order > 0 &&
          typeof r.text === 'string' &&
          typeof r.isCorrect === 'boolean',
      )
    )
      return rows;
  } catch {}
}
function mimeDraft(value: string): string[] | undefined {
  try {
    const rows: unknown = JSON.parse(value);
    if (Array.isArray(rows) && rows.every((r) => typeof r === 'string' && !!r.trim())) return rows;
  } catch {}
}

/** Native school question fields share the registered add/update commands and real draft data. */
export function ExamQuestionForm({
  exam,
  question,
  onSaved,
  onDeleted,
  onRefresh,
}: {
  exam: S['ExamEditorDto'];
  question?: S['ExamEditorQuestionDto'];
  onSaved: () => void;
  onRefresh: () => Promise<unknown>;
  onDeleted?: () => void;
}) {
  const { session } = usePersonal();
  const originalPolicy = question?.attachmentPolicy;
  const originalMegabytes =
    originalPolicy?.maximumTotalBytes == null
      ? ''
      : (originalPolicy.maximumTotalBytes / 1048576).toLocaleString('en-US', {
          useGrouping: false,
          maximumFractionDigits: 20,
        });
  const nextOrder = exam.questions.reduce((highest, row) => Math.max(highest, row.order), 0) + 1;
  const draft = useWorkflowDraft(
    'exam:' + exam.id + ':question:' + (question?.id ?? 'new'),
    {
      prompt: question?.prompt ?? '',
      score: question ? String(question.score) : '',
      order: String(question?.order ?? nextOrder),
      type: question?.type ?? 'Descriptive',
      files: originalPolicy?.attachmentsAllowed ?? false,
      textRequired: originalPolicy?.textRequired ?? true,
      contentTypes: JSON.stringify(originalPolicy?.allowedContentTypes ?? mimeOptions),
      count: originalPolicy?.maximumCount == null ? '' : String(originalPolicy.maximumCount),
      megabytes: originalMegabytes,
      options: JSON.stringify(
        question?.options.length
          ? question.options.map(({ order, text, isCorrect }) => ({ order, text, isCorrect }))
          : [1, 2, 3, 4].map((order) => ({ order, text: '', isCorrect: false })),
      ),
    },
    exam.versionId + ':' + exam.versionRowVersion + ':' + (question?.rowVersion ?? 'new'),
  );
  const v = draft.values,
    action = useSchoolAction();
  const [policyOpen, setPolicyOpen] = useState(false),
    [removeOpen, setRemoveOpen] = useState(false),
    [saved, setSaved] = useState(false);
  const options = optionDraft(v.options),
    types = mimeDraft(v.contentTypes);
  const descriptive = v.type === 'Descriptive';
  const validType = descriptive || v.type === 'ObjectiveSingleChoice';
  const validScore =
    /^\d+(?:\.\d{1,2})?$/.test(v.score) && Number.isFinite(Number(v.score)) && Number(v.score) >= 0;
  const validOrder =
    positiveInt32(v.order) &&
    !exam.questions.some((q) => q.id !== question?.id && q.order === Number(v.order));
  const maximumBytes =
    v.megabytes === originalMegabytes && originalPolicy?.maximumTotalBytes != null
      ? originalPolicy.maximumTotalBytes
      : Number(v.megabytes) * 1048576;
  const validLimits =
    (!v.count || positiveInt32(v.count)) &&
    (!v.megabytes ||
      (/^\d+(?:\.\d+)?$/.test(v.megabytes) &&
        Number.isSafeInteger(maximumBytes) &&
        maximumBytes > 0));
  const validFiles = !descriptive || !v.files || (!!types?.length && validLimits);
  const validOptions =
    descriptive ||
    (!!options &&
      options.length >= 2 &&
      options.every((o) => o.text.trim() && o.order <= 2147483647) &&
      new Set(options.map((o) => o.order)).size === options.length &&
      new Set(options.map((o) => o.text.trim())).size === options.length &&
      options.filter((o) => o.isCorrect).length === 1);
  const disabled = action.busy || saved || !draft.ready || draft.stale || !options || !types;
  const valid =
    !!v.prompt.trim() && validType && validScore && validOrder && validFiles && validOptions;
  const typeLabel = (mime: string) =>
    mime === 'image/jpeg'
      ? copy.text_3ec90e9522ae
      : mime === 'image/png'
        ? copy.text_bf8629a7be63
        : mime === 'application/pdf'
          ? 'PDF'
          : mime;
  const policyLabel =
    types?.length === 3 && mimeOptions.every((mime) => types.includes(mime))
      ? t.allTypes
      : copy.fileTypeList(types?.map(typeLabel) ?? []) || t.noTypes;
  return (
    <V5Scene
      id={removeOpen ? 'MK-153' : 'MK-152'}
      title={descriptive ? t.title : t.objectiveTitle}
      back={base + '/exams/' + exam.id + '/edit'}
      schoolForm
      overlayActive={removeOpen || policyOpen}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      summary={[
        { label: t.prompt, value: v.prompt },
        { label: t.score, value: persianDigits(v.score) },
        ...(descriptive && v.files ? [{ label: t.policy, value: policyLabel }] : []),
      ]}
      actions={
        removeOpen || policyOpen ? undefined : (
          <Button type="submit" disabled={disabled || !valid} aria-busy={action.busy}>
            {action.busy ? copy.text_fc2867f048ea : t.save}
          </Button>
        )
      }
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || !valid || removeOpen || policyOpen) return;
        const body: S['AddExamQuestionCommand'] = {
          order: Number(v.order),
          type: descriptive ? 'Descriptive' : 'ObjectiveSingleChoice',
          prompt: v.prompt.trim(),
          score: Number(v.score),
          options: descriptive ? null : options!.map((o) => ({ ...o, text: o.text.trim() })),
          expectedVersionRowVersion: exam.versionRowVersion,
          attachmentPolicy:
            descriptive && v.files
              ? {
                  attachmentsAllowed: true,
                  textRequired: v.textRequired,
                  allowedContentTypes: types!,
                  maximumCount: v.count ? Number(v.count) : null,
                  maximumTotalBytes: v.megabytes ? maximumBytes : null,
                }
              : null,
        };
        const result = await action.run<S['ExamEditorDto']>(
          '/api/v1/academic/exams/' + exam.id + '/questions' + (question ? '/' + question.id : ''),
          question
            ? ({
                ...body,
                expectedQuestionRowVersion: question.rowVersion,
              } satisfies S['UpdateExamQuestionCommand'])
            : body,
          question ? 'PATCH' : 'POST',
          (row) => {
            const matching = row.questions.find((q) => {
              const wanted = body.attachmentPolicy;
              const actual = q.attachmentPolicy;
              const samePolicy = wanted?.attachmentsAllowed
                ? actual?.attachmentsAllowed === true &&
                  actual.textRequired === wanted.textRequired &&
                  actual.maximumCount === wanted.maximumCount &&
                  actual.maximumTotalBytes === wanted.maximumTotalBytes &&
                  actual.allowedContentTypes.length === wanted.allowedContentTypes?.length &&
                  actual.allowedContentTypes.every((mime) =>
                    wanted.allowedContentTypes?.some(
                      (expected) => expected.toLowerCase() === mime.toLowerCase(),
                    ),
                  )
                : !actual?.attachmentsAllowed;
              const sameOptions = !body.options
                ? !q.options.length
                : q.options.length === body.options.length &&
                  q.options.every((option) =>
                    body.options?.some(
                      (expected) =>
                        expected.order === option.order &&
                        expected.text === option.text &&
                        expected.isCorrect === option.isCorrect,
                    ),
                  );
              return (
                (question
                  ? q.id === question.id
                  : !exam.questions.some((old) => old.id === q.id)) &&
                q.order === body.order &&
                q.prompt === body.prompt &&
                q.score === body.score &&
                q.type === body.type &&
                !!q.rowVersion.trim() &&
                samePolicy &&
                sameOptions
              );
            });
            return (
              row.id === exam.id &&
              row.organizationId === session.context.organizationId &&
              row.classId === exam.classId &&
              row.versionId === exam.versionId &&
              row.status === 'Draft' &&
              row.versionStatus === 'Draft' &&
              !!row.versionRowVersion.trim() &&
              !!row.examRowVersion.trim() &&
              (!row.classRef ||
                (row.classRef.kind === 'OrganizationClass' &&
                  row.classRef.classId === exam.classId)) &&
              !!matching
            );
          },
        );
        if (result) {
          setSaved(true);
          draft.reset();
          onSaved();
        }
      }}
    >
      <QuestionMenu
        type={v.type}
        order={v.order}
        disabled={disabled}
        onType={(value) => draft.set('type', value)}
        onOrder={(value) => draft.set('order', value)}
        onRemove={question ? () => setRemoveOpen(true) : undefined}
      />
      <WorkflowDraftConflict
        stale={draft.stale || !options || !types}
        onDiscard={draft.acceptServerValues}
        focusAfterReset={() =>
          document.querySelector<HTMLTextAreaElement>('[data-exam-question-prompt]')?.focus()
        }
      />
      <fieldset className={uiClass('v5-native-fields v5-native-form')} disabled={disabled}>
        <V4Field label={t.prompt}>
          <NativeTextarea
            data-exam-question-prompt
            rows={3}
            required
            value={v.prompt}
            onChange={(event) => draft.set('prompt', event.target.value)}
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
        {!validOrder && (
          <p className={uiClass('field-error')} role="alert">
            {t.invalidOrder}
          </p>
        )}
        {descriptive ? (
          <>
            <V4List>
              <V4SwitchRow
                title={t.files}
                description={t.filesHint}
                checked={v.files}
                disabled={disabled}
                onCheckedChange={(value) => draft.set('files', value)}
              />
            </V4List>
            {v.files && (
              <V4Field
                label={t.policy}
                error={!types?.length ? t.noTypes : !validLimits ? t.invalidLimits : undefined}
              >
                <button
                  className={uiClass('input')}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={policyOpen}
                  onClick={() => setPolicyOpen(true)}
                >
                  {policyLabel}
                </button>
              </V4Field>
            )}
          </>
        ) : (
          <>
            {options?.map((option, index) => (
              <V4Field
                key={option.order}
                label={copy.text_92d381e9e27f + persianDigits(String(index + 1))}
              >
                <NativeInput
                  required
                  value={option.text}
                  onChange={(event) =>
                    draft.set(
                      'options',
                      JSON.stringify(
                        options.map((o, i) =>
                          i === index ? { ...o, text: event.target.value } : o,
                        ),
                      ),
                    )
                  }
                />
              </V4Field>
            ))}
            <V4Field label={copy.text_1ac128e79e40}>
              <NativeSelect
                required
                value={options?.find((o) => o.isCorrect)?.order ?? ''}
                onChange={(event) =>
                  draft.set(
                    'options',
                    JSON.stringify(
                      options?.map((o) => ({
                        ...o,
                        isCorrect: o.order === Number(event.target.value),
                      })),
                    ),
                  )
                }
              >
                <option value="">{copy.text_e974ebd76aac}</option>
                {options?.map((option, index) => (
                  <option key={option.order} value={option.order}>
                    {copy.text_92d381e9e27f + persianDigits(String(index + 1))}
                  </option>
                ))}
              </NativeSelect>
            </V4Field>
            {!validOptions && <p className={uiClass('field-error')}>{t.invalidOptions}</p>}
          </>
        )}
      </fieldset>
      {question && (
        <ExamQuestionRemove
          exam={exam}
          question={question}
          disabled={disabled}
          open={removeOpen}
          hideTrigger
          onOpenChange={setRemoveOpen}
          onRefresh={onRefresh}
          onRemoved={() => {
            setSaved(true);
            draft.reset();
            (onDeleted ?? onSaved)();
            void onRefresh();
          }}
        />
      )}
      {action.feedback}
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent title={t.policy}>
          <fieldset className={uiClass('v5-native-fields')} disabled={disabled}>
            <V4CheckLine
              label={copy.text_aacb94b9f8cb}
              checked={v.textRequired}
              onCheckedChange={(value) => draft.set('textRequired', value)}
            />
            {[...new Set([...mimeOptions, ...(types ?? [])])].map((mime) => (
              <V4CheckLine
                key={mime}
                label={typeLabel(mime)}
                checked={!!types?.includes(mime)}
                onCheckedChange={(checked) =>
                  draft.set(
                    'contentTypes',
                    JSON.stringify(
                      checked ? [...(types ?? []), mime] : (types?.filter((m) => m !== mime) ?? []),
                    ),
                  )
                }
              />
            ))}
            <V4Field
              label={copy.text_5b0f84fa02d1}
              error={v.count && !positiveInt32(v.count) ? t.invalidLimits : undefined}
            >
              <NumberInput value={v.count} onValueChange={(value) => draft.set('count', value)} />
            </V4Field>
            <V4Field
              label={copy.text_93b036d10054}
              error={v.megabytes && !validLimits ? t.invalidLimits : undefined}
            >
              <NumberInput
                decimal
                value={v.megabytes}
                onValueChange={(value) => draft.set('megabytes', value)}
              />
            </V4Field>
          </fieldset>
          {!types?.length && <p role="alert">{t.noTypes}</p>}
          {!validLimits && <p role="alert">{t.invalidLimits}</p>}
          <div className={uiClass('confirm-actions')}>
            <Button type="button" onClick={() => setPolicyOpen(false)}>
              {t.done}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </V5Scene>
  );
}
function QuestionMenu({
  type,
  order,
  disabled,
  onType,
  onOrder,
  onRemove,
}: {
  type: string;
  order: string;
  disabled: boolean;
  onType: (value: string) => void;
  onOrder: (value: string) => void;
  onRemove?: () => void;
}) {
  const close = useContext(SceneMenuClose);
  useSceneMenuTools(
    <>
      <V4Field label={copy.text_36f2e5cc8da2}>
        <NativeSelect
          disabled={disabled}
          value={type}
          onChange={(event) => {
            onType(event.target.value);
            close?.();
          }}
        >
          <option value="Descriptive">{copy.text_65f21708171c}</option>
          <option value="ObjectiveSingleChoice">{copy.text_8fc194cdb8aa}</option>
        </NativeSelect>
      </V4Field>
      <V4Field label={t.order}>
        <NumberInput disabled={disabled} required value={order} onValueChange={onOrder} />
      </V4Field>
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={() => {
            close?.();
            onRemove();
          }}
        >
          {t.remove}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          close?.();
          window.dispatchEvent(new Event('makan:education-sections'));
        }}
      >
        {copy.text_589d5004f227}
      </Button>
    </>,
  );
  return null;
}
