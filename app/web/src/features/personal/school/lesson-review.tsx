'use client';
import { uiClass } from '@/components/v5/classes';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import * as copy from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHero, DialogTrigger } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/states';
import { V4CheckLine, V4Note } from '@/components/v4/page';
import { ApiError } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import { schoolRoutes } from '@/config/navigation';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '../provider';
import { base, useSchoolAction } from './shared';
import { useClassLearnerCount } from './manager-class-summary';
import { LessonFields } from './lesson-fields';
import { LessonDownload } from './lesson-download';
type S = components['schemas'];
const t = copy.v5Lessons;

export function LessonDraftReview({
  lesson,
  onPublished,
}: {
  lesson: S['ClassLessonResult'];
  onPublished: (value: S['ClassLessonResult']) => void;
}) {
  const { session } = usePersonal();
  const action = useSchoolAction();
  const [snapshot, setSnapshot] = useState<S['ClassLessonResult']>();
  const [reviewed, setReviewed] = useState(false);
  const published = useRef(false);
  const current = snapshot ?? lesson;
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: !!snapshot,
  });
  const roster = useClassLearnerCount(
    { id: current.classId, organizationId: current.organizationId },
    !!snapshot,
  );
  const classTitle = classes.data?.find(
    (item) => item.id === current.classId && item.organizationId === current.organizationId,
  )?.title;
  const assets = current.attachments.map((asset) => ({
    id: asset.fileAssetId,
    name: asset.fileName,
    sizeBytes: asset.sizeBytes,
    contentType: asset.contentType,
    status: asset.status,
  }));
  const ready = assets.every((asset) => asset.status === 'Ready');
  if (
    session.context.workspaceType !== 'Organization' ||
    session.context.organizationId !== lesson.organizationId ||
    !['Teacher', 'Manager'].includes(session.context.activeRole ?? '')
  )
    return <ErrorState error={new ApiError(403)} />;
  return (
    <Dialog
      open={!!snapshot}
      onOpenChange={(open) => {
        if (action.busy) return;
        if (open) {
          setSnapshot(lesson);
          setReviewed(false);
        } else setSnapshot(undefined);
      }}
    >
      <V5Scene
        id="MK-135"
        title={snapshot ? t.edit : t.review}
        back={base + '/classes/' + current.classId + '?tab=lessons'}
        schoolForm
        overlayActive={!!snapshot}
        summary={[
          { label: t.editTitle, value: current.title },
          { label: t.editBody, value: current.body },
        ]}
        onMore={() => window.dispatchEvent(new Event('makan:education-sections'))}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={schoolRoutes.lessonEdit(current.id)}>{t.edit}</Link>
            </Button>
            <DialogTrigger asChild>
              <Button disabled={!ready}>{t.publish}</Button>
            </DialogTrigger>
          </>
        }
      >
        <div>
          <span className={uiClass('badge neutral')}>
            <Pencil size={14} aria-hidden="true" />
            {t.draft}
          </span>
        </div>
        <LessonFields
          title={current.title}
          body={current.body}
          titleLabel={t.editTitle}
          bodyLabel={t.editBody}
        />
        <div className={uiClass('v5-lesson-files')}>
          {current.attachments.map((asset) => (
            <LessonDownload key={asset.fileAssetId} lessonId={current.id} asset={asset} compact />
          ))}
        </div>
        {!ready && <V4Note>{t.filesUnavailable}</V4Note>}
        <V4Note>{t.draftPolicy}</V4Note>
      </V5Scene>
      <DialogContent
        title={t.publishTitle}
        scenario="MK-136"
        onCloseAutoFocus={(event) => {
          if (published.current) {
            event.preventDefault();
            requestAnimationFrame(() =>
              document.querySelector<HTMLElement>('[data-v5-scene="MK-05"] .rx-head h1')?.focus(),
            );
          }
        }}
      >
        <form
          className={uiClass('stack')}
          onSubmit={async (event) => {
            event.preventDefault();
            if (!snapshot || !reviewed || action.busy || !ready) return;
            const value = await action.run<S['ClassLessonResult']>(
              '/api/v1/academic/lessons/' + snapshot.id + '/publish',
              { expectedVersion: snapshot.version },
              'POST',
              (row) =>
                row.id === snapshot.id &&
                row.organizationId === snapshot.organizationId &&
                row.classId === snapshot.classId &&
                row.status === 'Published' &&
                !!row.version.trim(),
            );
            if (value) {
              published.current = true;
              setSnapshot(undefined);
              onPublished(value);
            }
          }}
        >
          <DialogHero
            title={current.title}
            description={
              classTitle && (
                <>
                  {classTitle}
                  {roster.count !== undefined && (
                    <> · {t.authorizedMembers(number(roster.count))}</>
                  )}
                </>
              )
            }
          />
          <dl className={uiClass('v5-dialog-summary')}>
            <div>
              <dt>{t.sequence}</dt>
              <dd>{t.lessonSequence(number(current.displayOrder))}</dd>
            </div>
            <div>
              <dt>{t.attachment}</dt>
              <dd>
                {assets.length
                  ? t.readyFiles(number(assets.filter((asset) => asset.status === 'Ready').length))
                  : t.noAttachments}
              </dd>
            </div>
          </dl>
          <V4CheckLine
            required
            label={t.reviewed}
            checked={reviewed}
            disabled={action.busy}
            onCheckedChange={setReviewed}
          />
          {!!action.error && <ErrorState error={action.error} />}
          <div className={uiClass('confirm-actions')} data-dialog-actions>
            <Button
              type="submit"
              disabled={action.busy || !reviewed || !ready}
              aria-busy={action.busy}
            >
              {action.busy ? copy.text_fc2867f048ea : t.publish}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={action.busy}
              onClick={() => setSnapshot(undefined)}
            >
              {copy.v4Text.cancel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
