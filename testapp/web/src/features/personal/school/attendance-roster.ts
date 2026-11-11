'use client';
import { useQuery } from '@tanstack/react-query';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { usePersonal } from '../provider';
import type { AttendanceEntry } from './attendance-model';
type S = components['schemas'];

/** Only resolve the two bound IDs from this authorized class's paginated rosters. */
export function useAttendanceRoster(classId: string, entries: AttendanceEntry[]) {
  const { call, session } = usePersonal();
  const wanted = entries
    .map((entry) => [entry.enrollmentId, entry.learnerOrganizationPersonId])
    .sort();
  const signature = JSON.stringify(wanted);
  return useQuery({
    queryKey: [
      'personal',
      session.user.id,
      session.revision,
      'attendance-roster',
      classId,
      signature,
    ],
    queryFn: async ({ signal }) => {
      const wantedIds = new Map<string, string>(JSON.parse(signature));
      const names: Record<string, string> = {};
      if (!wantedIds.size) return names;
      for (const status of ['Active', 'Completed', 'Withdrawn'] as const) {
        const seen = new Set<string>();
        for (let page = 1; ; page++) {
          const result = await call<S['SchoolPageOfClassLearnerResult']>(
            `/api/v1/academic/classes/${classId}/learners?Page=${page}&PageSize=100&status=${status}`,
            { signal },
          );
          if (
            result.page !== page ||
            result.pageSize !== 100 ||
            result.totalCount < 0 ||
            result.items.length > 100 ||
            (result.items.length === 0 && (page - 1) * 100 < result.totalCount) ||
            result.items.some((row) => row.status !== status || seen.has(row.enrollmentId)) ||
            new Set(result.items.map((row) => row.enrollmentId)).size !== result.items.length
          )
            throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          for (const row of result.items) {
            seen.add(row.enrollmentId);
            if (
              wantedIds.get(row.enrollmentId) === row.learnerOrganizationPersonId &&
              row.displayName.trim()
            )
              names[row.enrollmentId] = row.displayName;
          }
          if (Object.keys(names).length === wantedIds.size) return names;
          if (page * result.pageSize >= result.totalCount) break;
          if (page >= 100000) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
        }
      }
      return names;
    },
  });
}
