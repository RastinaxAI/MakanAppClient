import type { components } from '../../src/generated/api/schema';
type S = components['schemas'];
export const sessionReferenceId: string;
export function sessionReference(options?: { count?: number; recorded?: number }): {
  sessions: S['SessionResult'][];
  attendance: Array<{
    sessionId: string;
    entries: S['AttendanceEntryResult'][];
    revisions: S['AttendanceRevisionResult'][];
  }>;
};
