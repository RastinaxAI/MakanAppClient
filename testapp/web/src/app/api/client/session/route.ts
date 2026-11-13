import { NextResponse } from 'next/server';
import { CLIENT_COOKIE, clientSessionId, getClientState } from '@/lib/server/client-session';
import {
  withSessionRead,
  withSessionLock,
  recordSessionActivity,
  cookieOptions,
} from '@/lib/server/session';
import { problem, checkOrigin } from '@/lib/server/backend';
import { ApiError } from '@/lib/api/errors';
export const dynamic = 'force-dynamic';
/** Only explicit foreground use renews inactivity; background reads never do. */
export async function POST(request: Request) {
  if (!checkOrigin(request)) return problem(403, 'ORIGIN_REJECTED');
  const id = await clientSessionId();
  if (!id) return problem(401);
  try {
    return await withSessionLock(id, async () => {
      const state = await getClientState(id);
      if (!state) return problem(401);
      const session = await recordSessionActivity(id);
      if (!session) return problem(401);
      const result = NextResponse.json(state, {
        headers: { 'Cache-Control': 'no-store, private', Vary: 'Cookie' },
      });
      result.cookies.set(CLIENT_COOKIE, id, cookieOptions(session.refreshExpiresAtUtc));
      return result;
    });
  } catch (error) {
    return problem(
      error instanceof ApiError ? error.status : 503,
      error instanceof ApiError ? error.problem.code : 'UPSTREAM_UNAVAILABLE',
    );
  }
}
export async function GET() {
  const id = await clientSessionId();
  if (!id) return problem(401);
  try {
    return await withSessionRead(id, async () => {
      const state = await getClientState(id);
      return state
        ? NextResponse.json(state, {
            headers: { 'Cache-Control': 'no-store, private', Vary: 'Cookie' },
          })
        : problem(401);
    });
  } catch (error) {
    return problem(
      error instanceof ApiError ? error.status : 503,
      error instanceof ApiError ? error.problem.code : 'UPSTREAM_UNAVAILABLE',
    );
  }
}
