'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { JalaliDateInput } from '@/components/ui/jalali-date-input';
import { V4Field, V4Hero, V4List, V4Note, V4Row } from '@/components/v4/page';
import {
  useSceneContextSummary,
  useSceneFormAction,
  useSceneMenuTools,
} from '@/components/v5/form-actions';
import { BookOpen, MessagesSquare } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { localDateTime } from '@/lib/formatting';
import { jalaliDisplayValue } from '@/lib/jalali-date';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePersonal, usePersonalApi } from '../provider';
import { base, safeMeetingUrl, toUtc, useSchoolAction } from './shared';
import { WorkflowPage, WorkflowForm, WorkflowDraftConflict, useWorkflowDraft } from './workflow';
import { readableOfficialEndpoint, type OfficialPair } from '../messaging/official-model';
import { SessionMenu, SessionCommandDialog, type SessionCommand } from './session-actions';
import { sessionTimeRange } from './session-time';
import { SessionAttendancePage } from './session-attendance';
import s from './school.module.css';
type S = components['schemas'];
const t = uiText.v5Sessions;
export function SessionPage({ id, edit = false }: { id: string; edit?: boolean }) {
  const [command, setCommand] = useState<SessionCommand>();
  const params = useSearchParams();
  if (!edit && params.get('view') === 'attendance') return <SessionAttendancePage id={id} />;
  return (
    <WorkflowPage
      form={edit}
      title={edit ? uiText.text_04f471efe1c1 : uiText.text_7841d322609a}
      back={base + '/schedule'}
      roles={edit ? ['Manager', 'Teacher'] : ['Manager', 'Teacher', 'Student']}
      eyebrow=""
      overlayActive={!!command}
    >
      <SessionResource id={id} edit={edit} command={command} setCommand={setCommand} />
    </WorkflowPage>
  );
}
function SessionResource({
  id,
  edit,
  command,
  setCommand,
}: {
  id: string;
  edit: boolean;
  command?: SessionCommand;
  setCommand: (value: SessionCommand | undefined) => void;
}) {
  const { session } = usePersonal(),
    q = usePersonalApi<S['SessionResult']>(`/api/v1/academic/sessions/${id}`);
  const cache = useQueryClient(),
    router = useRouter();
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  const item = q.data;
  if (item.id !== id || item.organizationId !== session.context.organizationId)
    return <ErrorState error={new ApiError(403)} />;
  if (edit && item.status !== 'Scheduled') return <ErrorState error={new ApiError(409)} />;
  const manage = ['Manager', 'Teacher'].includes(session.context.activeRole ?? '');
  const refresh = () => q.refetch({ throwOnError: true });
  return (
    <>
      {edit ? (
        <SessionEditor original={item} command={command} onCommand={setCommand} />
      ) : (
        <SessionDetail item={item} manage={manage} onCommand={setCommand} />
      )}
      {manage && command && command.session.id === id && (
        <SessionCommandDialog
          key={command.kind + ':' + command.session.rowVersion}
          command={command}
          current={item}
          onClose={() => setCommand(undefined)}
          onRefresh={refresh}
          onCommitted={async (result) => {
            const queryKey = [
              'personal',
              session.user.id,
              session.revision,
              '/api/v1/academic/sessions/' + id,
            ];
            await cache.cancelQueries({ queryKey, exact: true });
            cache.setQueryData(queryKey, result);
            setCommand(undefined);
            if (edit) router.replace(`${base}/sessions/${id}`);
            void cache.invalidateQueries({
              queryKey: ['personal', session.user.id, session.revision],
            });
          }}
        />
      )}
    </>
  );
}
function SessionDetail({
  item,
  manage,
  onCommand,
}: {
  item: S['SessionResult'];
  manage: boolean;
  onCommand: (command: SessionCommand) => void;
}) {
  const { session } = usePersonal();
  const official = usePersonalApi<OfficialPair>(
    '/api/v1/organization/classes/' + item.classId + '/official-spaces',
  );
  const pair = official.data;
  const group =
    pair &&
    pair.organizationId === session.context.organizationId &&
    pair.sourceId === item.classId &&
    pair.sourceKind === 'Class'
      ? readableOfficialEndpoint(pair, 'Group')
      : undefined;
  const action = useMemo(
    () =>
      item.status === 'Scheduled' && safeMeetingUrl(item.meetingUrl) ? (
        <Button asChild>
          <a href={safeMeetingUrl(item.meetingUrl)!} target="_blank" rel="noopener noreferrer">
            {t.joinOnline}
          </a>
        </Button>
      ) : undefined,
    [item.status, item.meetingUrl],
  );
  useSceneFormAction(action, true);
  const menu = useMemo(
    () => (manage ? <SessionMenu session={item} onCommand={onCommand} /> : undefined),
    [manage, item, onCommand],
  );
  useSceneMenuTools(menu, manage);
  useSceneContextSummary([
    { label: t.resources, value: t.resourcesHint },
    { label: t.official, value: group ? t.officialHint : t.officialUnavailable },
  ]);
  return (
    <>
      <V4Hero title={item.title}>{item.classTitle}</V4Hero>
      <dl className={uiClass('card v4-meta')}>
        <div className={uiClass('kv')}>
          <dt className={uiClass('key')}>{t.time}</dt>
          <dd className={uiClass('val')}>{sessionTimeRange(item.startUtc, item.endUtc)}</dd>
        </div>
        <div className={uiClass('kv')}>
          <dt className={uiClass('key')}>{t.teacher}</dt>
          <dd className={uiClass('val')}>{'—'}</dd>
        </div>
        <div className={uiClass('kv')}>
          <dt className={uiClass('key')}>{uiText.text_68d7eb08efbc}</dt>
          <dd className={uiClass('val')}>{label(item.status)}</dd>
        </div>
      </dl>
      <V4List>
        <V4Row
          title={t.resources}
          description={t.resourcesHint}
          icon={<BookOpen />}
          href={`${base}/classes/${item.classId}?tab=lessons`}
        />
        <V4Row
          title={t.official}
          description={group ? t.officialHint : t.officialUnavailable}
          icon={<MessagesSquare />}
          href={
            group
              ? '/personal/messages/' + pair!.group.conversationId + '?view=organization'
              : undefined
          }
        />
      </V4List>
      {official.isError && (
        <ErrorState error={official.error} onRetry={() => void official.refetch()} />
      )}
    </>
  );
}
function SessionEditor({
  original,
  command,
  onCommand,
}: {
  original: S['SessionResult'];
  command?: SessionCommand;
  onCommand: (command: SessionCommand) => void;
}) {
  const { session } = usePersonal();
  const titleInput = useRef<HTMLInputElement>(null);
  const d = useWorkflowDraft(
      'session:' + original.id,
      {
        title: original.title,
        start: localDateTime(original.startUtc),
        end: localDateTime(original.endUtc),
        link: original.meetingUrl ?? '',
      },
      original.rowVersion,
    ),
    a = useSchoolAction(),
    router = useRouter();
  const valid =
    !!d.values.title.trim() &&
    Date.parse(d.values.end) > Date.parse(d.values.start) &&
    (!d.values.link.trim() || !!safeMeetingUrl(d.values.link.trim())) &&
    !d.stale;
  return (
    <WorkflowForm
      ready={d.ready && !d.stale}
      canCommit={valid}
      busy={a.busy}
      reviewLabel={t.save}
      menu={<SessionMenu session={original} edit onCommand={onCommand} />}
      overlayActive={!!command}
      fieldsClassName="v5-native-fields"
      notice={<V4Note>{t.reviewHint}</V4Note>}
      rows={[
        [t.title, d.values.title],
        [t.start, jalaliDisplayValue(d.values.start, true, true)],
        [t.end, jalaliDisplayValue(d.values.end, true, true)],
        [t.link, d.values.link],
      ]}
      error={
        <>
          {a.feedback}
          <WorkflowDraftConflict
            stale={d.stale}
            onDiscard={d.acceptServerValues}
            focusAfterReset={() => titleInput.current?.focus()}
          />
          {!valid && <p className={uiClass(s.hint)}>{uiText.text_e847e6618d02}</p>}
        </>
      }
      onSave={async () => {
        if (!valid) return;
        const body: S['UpdateSessionCommand'] = {
          title: d.values.title.trim(),
          startUtc: toUtc(d.values.start),
          endUtc: toUtc(d.values.end),
          timeZoneId: original.timeZoneId,
          meetingUrl: d.values.link.trim() || null,
          expectedRowVersion: d.baseVersion,
        };
        const result = await a.run<S['SessionResult']>(
          `/api/v1/academic/sessions/${original.id}`,
          body,
          'PATCH',
          (row) =>
            row.id === original.id &&
            row.organizationId === session.context.organizationId &&
            row.classId === original.classId &&
            row.status === 'Scheduled' &&
            !!row.rowVersion.trim() &&
            row.rowVersion !== d.baseVersion &&
            row.title === body.title &&
            Date.parse(row.startUtc) === Date.parse(body.startUtc) &&
            Date.parse(row.endUtc) === Date.parse(body.endUtc) &&
            row.timeZoneId === body.timeZoneId &&
            row.meetingUrl === body.meetingUrl,
        );
        if (result) {
          d.reset();
          router.replace(`${base}/sessions/${original.id}`);
        }
      }}
    >
      <V4Field label={t.title}>
        <NativeInput
          ref={titleInput}
          required
          value={d.values.title}
          onChange={(e) => d.set('title', e.target.value)}
        />
      </V4Field>
      <V4Field label={t.start}>
        <JalaliDateInput
          withTime
          required
          compactTimeDate
          showPickerButton={false}
          value={d.values.start}
          onValueChange={(v) => d.set('start', v)}
        />
      </V4Field>
      <V4Field label={t.end}>
        <JalaliDateInput
          withTime
          required
          compactTimeDate
          showPickerButton={false}
          value={d.values.end}
          onValueChange={(v) => d.set('end', v)}
        />
      </V4Field>
      <V4Field label={t.link}>
        <NativeInput
          type="url"
          dir="ltr"
          value={d.values.link}
          onChange={(e) => d.set('link', e.target.value)}
        />
      </V4Field>
    </WorkflowForm>
  );
}
