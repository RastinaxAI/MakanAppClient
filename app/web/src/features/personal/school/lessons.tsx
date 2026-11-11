'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { PageBack } from '@/components/navigation/page-back';
import { ReferenceFrame } from '@/features/reference/frame';
import { ActivityDeliveryStatus } from './activity-delivery';
import { PublicationReceipt } from './publication-receipt';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, label, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { schoolRoutes } from '@/config/navigation';
import { ApiError } from '@/lib/api/errors';
import { useRef, useState } from 'react';
import { usePersonal, usePersonalApi } from '../provider';
import { V5Scene } from '@/components/v5/scene';
import { V4Field, V4Note } from '@/components/v4/page';
import { latinDigits, persianDigits } from '@/lib/formatting';
import { useResourceCommand } from '../use-resource-command';
import { WorkflowDraftConflict, useWorkflowDraft } from './workflow';
import { lessonDisplayOrder } from './lesson-draft';
import { useSchoolAttachments } from './use-school-attachments';
import { schoolQuery, SchoolSearch } from './directory';
import s from './school.module.css';
import { base, Card, Pager, SchoolHeading } from './shared';
import { LessonAttachmentEditor } from './lesson-attachments';
import { LessonFields } from './lesson-fields';
import { LessonDraftReview } from './lesson-review';
import { LessonDownload } from './lesson-download';
type S = components['schemas'];

export function ResourcesClasses() {
  const q = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes');
  return (
    <>
      <SchoolHeading title={uiText.text_596683be71f8} description={uiText.text_2aea2dc372bf} />
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : !q.data.length ? (
        <EmptyState title={uiText.text_b3d98309e169} />
      ) : (
        <div className={uiClass(s.grid)}>
          {q.data.map((c) => (
            <article className={uiClass(s.classCard)} key={c.id}>
              <h2>{c.title}</h2>
              <p>
                {c.courseTitle}
                {uiText.text_588da4105320}
                {c.academicPeriodTitle}
              </p>
              <footer className={uiClass(s.cardActions)}>
                <Button asChild>
                  <Link
                    href={`${base}/classes/${c.id}?tab=lessons`}
                    aria-label={uiText.text_cd953dadaced + c.title}
                  >
                    {uiText.text_4f96bdc2ea91}
                  </Link>
                </Button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function ClassLessons({ classId, teach }: { classId: string; teach: boolean }) {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const q = usePersonalApi<S['SchoolPageOfClassLessonResult']>(
    `/api/v1/academic/classes/${classId}/lessons?` + schoolQuery(page, search),
    { poll: 10000 },
  );
  return (
    <Card
      title={uiText.text_4f96bdc2ea91}
      action={
        teach && (
          <Button asChild>
            <Link href={schoolRoutes.lessonNew(classId)}>{uiText.text_1fe9a8f47a21}</Link>
          </Button>
        )
      }
    >
      <SchoolSearch
        label={uiText.text_ab0182186a14}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          {!q.data.items.length ? (
            <EmptyState
              title={uiText.text_b2bae9b56399}
              description={teach ? uiText.text_4038de890cd2 : uiText.text_b2e65fbf129d}
            />
          ) : (
            <div className={uiClass(s.editorList)}>
              {q.data.items.map((l) => (
                <article key={l.id} className={uiClass(s.classCard)}>
                  <h3>{l.title}</h3>
                  <p>
                    {label(l.status)}
                    {uiText.text_588da4105320}
                    {l.attachments.length}
                    {uiText.text_46b99be686ec}
                  </p>
                  <footer className={uiClass(s.cardActions)}>
                    <Button asChild>
                      <Link
                        href={base + '/lessons/' + l.id}
                        aria-label={uiText.text_0f5761aef3d3 + l.title}
                      >
                        {uiText.text_9b8c98558df1}
                      </Link>
                    </Button>
                  </footer>
                </article>
              ))}
            </div>
          )}
          <Pager
            page={q.data.page}
            size={q.data.pageSize}
            total={q.data.totalCount}
            onChange={setPage}
          />
        </>
      )}
    </Card>
  );
}
export function LessonDetail({
  id,
  teach,
  review = false,
}: {
  id: string;
  teach: boolean;
  review?: boolean;
}) {
  const q = usePersonalApi<S['ClassLessonResult']>('/api/v1/academic/lessons/' + id, {
    poll: 5000,
  });
  const { session } = usePersonal();
  const cache = useQueryClient();
  if (q.isPending)
    return (
      <ReferenceFrame id="MK-05" title={uiText.text_d14bfeb0a316}>
        <LoadingSkeleton />
      </ReferenceFrame>
    );
  if (q.isError)
    return (
      <ReferenceFrame id="MK-05" title={uiText.text_d14bfeb0a316}>
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      </ReferenceFrame>
    );
  const lesson = q.data;
  if (lesson.id !== id || lesson.organizationId !== session.context.organizationId)
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  if (review && teach && lesson.status === 'Draft')
    return (
      <LessonDraftReview
        lesson={lesson}
        onPublished={(value) =>
          cache.setQueryData(
            ['personal', session.user.id, session.revision, '/api/v1/academic/lessons/' + id],
            value,
          )
        }
      />
    );
  return (
    <ReferenceFrame
      id="MK-05"
      title={lesson.title}
      subtitle={label(lesson.status)}
      back={`${base}/classes/${lesson.classId}?tab=lessons`}
    >
      <article className={s.lessonReading}>
        <div className={uiClass('between')}>
          <span className={uiClass('tiny muted')}>{label(lesson.status)}</span>
          <span className={uiClass('badge neutral')}>{uiText.text_d14bfeb0a316}</span>
        </div>
        <PageBack href={`${base}/classes/${lesson.classId}?tab=lessons`} />
        <div className={uiClass('card mk-lesson-reading')}>
          <p className={s.lessonText} dir="auto">
            {lesson.body}
          </p>
        </div>
        <h3 className={uiClass('section-title')}>{uiText.text_2c00c0223035}</h3>
        <div className={uiClass('list')}>
          {lesson.attachments.map((asset) => (
            <LessonDownload key={asset.fileAssetId} lessonId={id} asset={asset} />
          ))}
        </div>
        <div className={uiClass('alert')}>
          <span>{uiText.text_bc7a8f5bd5c0}</span>
        </div>
        {teach && lesson.status === 'Draft' && (
          <>
            <Button asChild variant="outline">
              <Link href={schoolRoutes.lessonEdit(id)}>{uiText.text_a842a0ba8b1d}</Link>
            </Button>
            {!review && (
              <Button asChild>
                <Link href={schoolRoutes.lessonReview(id)}>{uiText.text_631a55a22187}</Link>
              </Button>
            )}
          </>
        )}
        {teach && lesson.status === 'Published' && (
          <>
            <p className={uiClass(s.hint)}>{uiText.text_3dd42711b07e}</p>
            <PublicationReceipt value={lesson.publicationReceipt} />
            <ActivityDeliveryStatus classId={lesson.classId} kind="Lesson" />
          </>
        )}
      </article>
    </ReferenceFrame>
  );
}
export function LessonFormPage({ classId, id }: { classId?: string; id?: string }) {
  const { session } = usePersonal(),
    router = useRouter(),
    cache = useQueryClient();
  const q = usePersonalApi<S['ClassLessonResult']>(`/api/v1/academic/lessons/${id}`, {
    enabled: !!id,
  });
  if (!['Teacher', 'Manager'].includes(session.context.activeRole ?? ''))
    return <ErrorState error={new ApiError(403)} />;
  if (id && q.isPending) return <LoadingSkeleton />;
  if (id && q.isError) return <ErrorState error={q.error} />;
  if (id && q.data?.id !== id)
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  if (
    id &&
    (q.data?.status !== 'Draft' || q.data.organizationId !== session.context.organizationId)
  )
    return <ErrorState error={new ApiError(403)} />;
  return (
    <LessonEditor
      key={id ?? classId}
      classId={classId ?? q.data!.classId}
      original={id ? q.data : undefined}
      onSaved={async (value) => {
        const key = [
          'personal',
          session.user.id,
          session.revision,
          `/api/v1/academic/lessons/${value.id}`,
        ];
        await cache.cancelQueries({ queryKey: key });
        cache.setQueryData(key, value);
        router.push(schoolRoutes.lessonReview(value.id));
      }}
    />
  );
}
function LessonEditor({
  classId,
  original,
  onSaved,
}: {
  classId: string;
  original?: S['ClassLessonResult'];
  onSaved?: (value: S['ClassLessonResult']) => Promise<void>;
}) {
  const { session } = usePersonal();
  const titleInput = useRef<HTMLInputElement>(null);
  const labels = uiText.v5Lessons;
  const initialAssets =
    original?.attachments.map((asset) => ({
      id: asset.fileAssetId,
      name: asset.fileName,
      sizeBytes: asset.sizeBytes,
      contentType: asset.contentType,
      status: asset.status,
    })) ?? [];
  const draft = useWorkflowDraft(
    'lesson:' + (original?.id ?? 'new:' + classId),
    {
      title: original?.title ?? '',
      body: original?.body ?? '',
      order: String(original?.displayOrder ?? 1),
      assets: JSON.stringify(initialAssets),
      pending: '',
    },
    original?.version ?? 'new',
  );
  const { title, body, order } = draft.values;
  const parsedOrder = lessonDisplayOrder(order);
  const [created, setCreated] = useState<S['ClassLessonResult']>();
  const [frozen, setFrozen] = useState<Omit<
    S['CreateClassLessonCommand'],
    'clientOperationId'
  > | null>(null);
  const a = useResourceCommand('school-lesson:' + (original?.id ?? 'new:' + classId));
  const {
    assets,
    pending,
    corrupt,
    uploading,
    error,
    setError,
    progress,
    setAssets,
    setPending,
    upload,
    cancel,
  } = useSchoolAttachments({
    classId,
    assetsValue: draft.values.assets,
    pendingValue: draft.values.pending,
    onAssetsChange: (value) => draft.set('assets', value),
    onPendingChange: (value) => draft.set('pending', value),
    disabled: a.busy || !!frozen || !draft.ready || draft.stale,
  });
  const controlsDisabled =
    a.busy || uploading || !!frozen || !draft.ready || draft.stale || corrupt;
  const orderField = (
    <V4Field
      label={labels.order}
      error={order && parsedOrder === null ? labels.invalidOrder : undefined}
    >
      <NativeInput
        type="text"
        inputMode="numeric"
        pattern={'\\p{Decimal_Number}+'}
        disabled={controlsDisabled}
        required
        value={persianDigits(order)}
        onChange={(event) => draft.set('order', latinDigits(event.target.value))}
      />
    </V4Field>
  );
  if (created)
    return (
      <div className={uiClass(s.receipt)}>
        <h2>{uiText.text_083a698e8bdd}</h2>
        <Button asChild>
          <Link href={base + '/lessons/' + created.id}>{uiText.text_631a55a22187}</Link>
        </Button>
      </div>
    );
  return (
    <V5Scene
      id={original ? 'MK-135' : 'MK-134'}
      title={original ? labels.edit : labels.create}
      back={`${base}/classes/${classId}?tab=lessons`}
      schoolForm
      summary={[
        { label: original ? labels.editTitle : labels.title, value: title },
        { label: original ? labels.editBody : labels.body, value: body },
        ...(!original ? [{ label: labels.order, value: persianDigits(order) }] : []),
      ]}
      onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
      actions={
        <Button
          type="submit"
          aria-busy={a.busy}
          disabled={
            a.busy ||
            uploading ||
            !!pending ||
            !title.trim() ||
            parsedOrder === null ||
            corrupt ||
            !draft.ready ||
            draft.stale ||
            assets.some((asset) => asset.status !== 'Ready')
          }
        >
          {a.busy
            ? uiText.text_fc2867f048ea
            : frozen
              ? uiText.text_31929c77bbbc
              : original
                ? labels.review
                : labels.save}
        </Button>
      }
      onSubmit={async (e) => {
        e.preventDefault();
        if (
          !draft.ready ||
          draft.stale ||
          corrupt ||
          parsedOrder === null ||
          !title.trim() ||
          uploading ||
          pending ||
          assets.some((asset) => asset.status !== 'Ready')
        )
          return;
        setError(undefined);
        const fields = {
          title: title.trim(),
          body: body.trim() || null,
          displayOrder: parsedOrder,
          fileAssetIds: assets.map((a) => a.id),
        };
        const command = frozen ?? fields;
        if (!original) setFrozen(command);
        const result = await a.run<S['ClassLessonResult']>(
          original
            ? `/api/v1/academic/lessons/${original.id}`
            : `/api/v1/academic/classes/${classId}/lessons`,
          original ? { ...fields, expectedVersion: draft.baseVersion } : command,
          {
            method: original ? 'PATCH' : 'POST',
            idempotent: !original,
            acceptResult: (row) =>
              row.organizationId === session.context.organizationId &&
              row.classId === classId &&
              (!original || row.id === original.id) &&
              row.status === 'Draft' &&
              !!row.version.trim(),
          },
        );
        if (result) {
          draft.reset();
          setCreated(result.value);
          if (onSaved) await onSaved(result.value);
        }
      }}
    >
      <WorkflowDraftConflict
        stale={draft.stale || corrupt}
        focusAfterReset={() => titleInput.current?.focus()}
        onDiscard={() => {
          draft.acceptServerValues();
          setFrozen(null);
        }}
      />
      {original && (
        <div>
          <span className={uiClass('badge neutral')}>
            <Pencil size={14} aria-hidden="true" />
            {labels.draft}
          </span>
        </div>
      )}
      <LessonFields
        title={title}
        body={body}
        titleLabel={original ? labels.editTitle : labels.title}
        bodyLabel={original ? labels.editBody : labels.body}
        titleRef={titleInput}
        onTitleChange={(value) => draft.set('title', value)}
        onBodyChange={(value) => draft.set('body', value)}
        disabled={controlsDisabled}
      >
        {!original && orderField}
      </LessonFields>
      <LessonAttachmentEditor
        inMenu={!!original}
        menuControls={original ? orderField : undefined}
        assets={assets}
        pending={pending ?? undefined}
        uploading={uploading}
        disabled={a.busy || !!frozen || !draft.ready || draft.stale || corrupt}
        progress={progress}
        error={error}
        onPick={(file) => void upload(file)}
        onRemove={(id) => setAssets((old) => old.filter((asset) => asset.id !== id))}
        onCancel={cancel}
        onCheck={() => void upload()}
        onDismiss={() => setPending(undefined)}
      />
      {original && <V4Note>{labels.draftPolicy}</V4Note>}
      {!!a.error && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setFrozen(null);
            setError(undefined);
          }}
        >
          {uiText.text_d1e71009180d}
        </Button>
      )}

      {a.feedback}
    </V5Scene>
  );
}
