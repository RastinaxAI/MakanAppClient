import type { components } from '@/generated/api/schema';
import { officialMetadataMatches } from './official-model';
import { safeAuthReturnPath } from '@/lib/auth-return';
type Summary = components['schemas']['ConversationSummaryResult'];
export type InboxView = 'all' | 'personal' | 'official';
/** Only a messaging list or room can be a picker/invitation return destination. */
export function messagingReturnPath(value: string | null) {
  const safe = safeAuthReturnPath(value);
  if (safe && /^\/personal\/messages(?:\/folders|\/[0-9a-f-]{36})?(?:[?#]|$)/i.test(safe))
    return safe;
  return '/personal/messages?list=1';
}
/** A page-local view never replaces or sorts the server's opaque account cursor. */
export function filterAccountInbox(rows: Summary[], view: InboxView) {
  return rows.filter(
    (row) =>
      view === 'all' ||
      (view === 'official'
        ? officialMetadataMatches(row)
        : row.scope === 'Personal' && !row.isOfficial && !row.official),
  );
}
/** Preserve server-wide ordering; opaque cursor pages must never be sorted by the client. */
export function flattenAccountInbox(
  pages: readonly components['schemas']['AccountInboxPageResult'][],
): Summary[] {
  const seen = new Set<string>();
  return pages
    .flatMap((page) => page.items)
    .filter((item) => {
      if (seen.has(item.conversationId)) return false;
      seen.add(item.conversationId);
      return true;
    });
}
