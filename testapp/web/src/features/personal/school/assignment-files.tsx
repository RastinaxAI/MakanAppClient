'use client';
import { uiClass } from '@/components/v5/classes';

import { useQuery } from '@tanstack/react-query';
import * as copy from '@/content/fa';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import { LessonDownload } from './lesson-download';
type S = components['schemas'];

export function AssignmentFiles({ value }: { value: S['AssignmentResult'] }) {
  const { session } = usePersonal();
  if (
    session.context.workspaceType !== 'Organization' ||
    value.organizationId !== session.context.organizationId ||
    !value.attachmentFileIds?.length
  )
    return null;
  return (
    <section className={uiClass('v5-lesson-files')} aria-label={copy.v5Assignments.files}>
      {[...new Set(value.attachmentFileIds)].map((fileId) => (
        <AssignmentFile key={fileId} value={value} fileId={fileId} />
      ))}
    </section>
  );
}
function AssignmentFile({ value, fileId }: { value: S['AssignmentResult']; fileId: string }) {
  const { session, transfer } = usePersonal();
  const query = useQuery({
    queryKey: ['personal', session.user.id, session.revision, 'assignment-file', value.id, fileId],
    queryFn: ({ signal }) =>
      transfer<S['FileAssetResult']>(
        `/api/client/school-files/${fileId}?assignmentId=${value.id}`,
        { signal },
      ),
    retry: false,
    refetchInterval: (q) => (q.state.data?.status === 'Pending' ? 5000 : false),
  });
  if (query.isPending) return <LoadingSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  const asset = query.data;
  if (asset.id !== fileId || asset.organizationId !== value.organizationId || asset.personalClassId)
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  return (
    <LessonDownload
      assignmentId={value.id}
      asset={{
        fileAssetId: asset.id,
        fileName: asset.originalFileName,
        contentType: asset.contentType,
        sizeBytes: asset.sizeBytes,
        status: asset.status,
        isAvailable: asset.status === 'Ready',
      }}
    />
  );
}
