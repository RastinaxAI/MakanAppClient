'use client';
import { useSearchParams } from 'next/navigation';
import { ReferenceProfile } from '@/features/reference/connected-profile';

/** The authenticated context entry reuses the actual account and authorized role picker. */
export function WorkspaceSelection() {
  const access = useSearchParams().get('view') === 'access';
  return <ReferenceProfile initialChooserOpen={!access} initialAccessOpen={access} />;
}
