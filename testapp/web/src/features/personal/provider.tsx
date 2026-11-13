'use client';
import { uiClass } from '@/components/v5/classes';

import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { network } from '@/config/network';
import { request, type ContextGuard, type ApiRequestInit } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { fileTransfer, type TransferOptions } from '@/lib/api/file-transfer';
import { clearDraftStorage } from '@/lib/draft-storage';
import { clientRequestScope, type ClientRequestScope } from '@/lib/client-surface';
import { checkPushDisplayAccount } from '@/lib/push-display';
import type { ClientState } from '@/lib/server/client-session';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MessagingLiveProvider } from './messaging/live';
import {
  rememberBrowserAuthReturn,
  safeAuthReturnPath,
  takeBrowserAuthReturn,
} from '@/lib/auth-return';
import { ScrollMemoryProvider } from '@/components/navigation/scroll-memory';
type WorkspaceDestination =
  | '/personal'
  | '/personal/education'
  | '/personal/profile'
  | '/personal/contacts'
  | '/personal/messages'
  | '/personal/messages?view=organization'
  | `/personal/messages/${string}`;
type ClientAccess = {
  session: ClientState;
  changing: boolean;
  reload: () => Promise<void>;
  call: <T>(path: string, init?: PersonalRequestInit) => Promise<T>;
  transfer: <T>(path: string, options: TransferOptions) => Promise<T>;
  selectWorkspace: (
    value: components['schemas']['SelectWorkspaceCommand'],
    destination?: WorkspaceDestination,
  ) => Promise<void>;
  logout: () => Promise<void>;
};
type PersonalRequestInit = ApiRequestInit & { scope?: ClientRequestScope };
function identity(state: ClientState) {
  return state.user.id + ':' + state.context.sessionId;
}
const contextQuery = (query: { queryKey: readonly unknown[] }) =>
  query.queryKey[0] === 'personal' && query.queryKey[2] !== 'account';
const PersonalContext = createContext<ClientAccess | null>(null);
export function PersonalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cache] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 15000, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );
  const [session, setSession] = useState<ClientState | null>(null),
    [error, setError] = useState<unknown>(),
    [changing, setChanging] = useState(false);
  const generation = useRef(0),
    loggingOut = useRef(false),
    checkingExpiry = useRef(false),
    loadAbort = useRef<AbortController | null>(null),
    loadMode = useRef<'foreground' | 'background' | null>(null),
    current = useRef<ClientState | null>(null);
  const reload = useCallback(
    async function loadSession(
      quiet = false,
      recheckUnauthorized = true,
      activity = false,
    ): Promise<void> {
      if (loggingOut.current) return;
      const previous = current.current;
      const background = quiet && previous !== null;
      // Realtime/visibility hints must not cancel a deliberate workspace/child
      // transition and leave its loading screen waiting on an aborted request.
      if (background && loadMode.current === 'foreground') return;
      const epoch = background ? generation.current : ++generation.current;
      loadAbort.current?.abort();
      const controller = new AbortController();
      loadAbort.current = controller;
      loadMode.current = !background || activity ? 'foreground' : 'background';
      if (!background) {
        setChanging(true);
        await cache.cancelQueries({ predicate: contextQuery });
      }
      if (epoch !== generation.current || controller.signal.aborted) return;
      try {
        const next = await request<ClientState>(
          '/api/client/session',
          { signal: controller.signal, method: activity ? 'POST' : 'GET' },
          { revision: '', isCurrent: () => epoch === generation.current, onUnauthorized: () => {} },
        );
        if (epoch !== generation.current || controller.signal.aborted) return;
        // A visibility check must not remount a form or invalidate its pending save
        // when the server confirms the same identity and access context.
        if (background && previous.user.id === next.user.id && previous.revision === next.revision)
          return;
        const sameIdentity = previous && identity(previous) === identity(next);
        if (background) {
          const changedEpoch = ++generation.current;
          await cache.cancelQueries({ predicate: sameIdentity ? contextQuery : undefined });
          if (generation.current !== changedEpoch || controller.signal.aborted) return;
        }
        if (!sameIdentity) {
          await cache.cancelQueries();
          cache.clear();
        } else if (previous.revision !== next.revision)
          cache.removeQueries({ predicate: contextQuery });
        current.current = next;
        checkPushDisplayAccount(next.user.id);
        setSession(next);
        setError(undefined);
      } catch (e) {
        if (epoch !== generation.current || controller.signal.aborted) return;
        // A read can carry the old cookie while another tab finishes signing in.
        // Verify once with the current cookie before expiring the new identity.
        if (e instanceof ApiError && e.status === 401 && recheckUnauthorized) {
          const ownsExpiryCheck = !checkingExpiry.current;
          checkingExpiry.current = true;
          try {
            await loadSession(false, false, activity);
          } finally {
            if (ownsExpiryCheck) checkingExpiry.current = false;
          }
          return;
        }
        // A failed background renewal is not evidence that the login was revoked.
        // Preserve the current form and let its own requests report service errors.
        if (background && !(e instanceof ApiError && e.status === 401)) return;
        current.current = null;
        setSession(null);
        cache.clear();
        if (e instanceof ApiError && e.status === 401) {
          checkPushDisplayAccount(null);
          rememberBrowserAuthReturn();
          router.replace('/enter');
        } else setError(e);
      } finally {
        if (loadAbort.current === controller) {
          loadMode.current = null;
          setChanging(false);
        }
      }
    },
    [cache, router],
  );
  useEffect(() => {
    if (session) void cache.invalidateQueries({ queryKey: ['personal', session.user.id] });
  }, [cache, session]);
  useEffect(() => {
    void reload(false, true, true);
    const channel = new BroadcastChannel('makan-client-session');
    const update = () => void reload(true);
    let lastActivity = Date.now();
    const activity = () => {
      if (
        !current.current ||
        checkingExpiry.current ||
        document.visibilityState !== 'visible' ||
        Date.now() - lastActivity < 60000
      )
        return;
      lastActivity = Date.now();
      void reload(true, true, true);
    };
    const visible = () => {
      if (current.current && !checkingExpiry.current && document.visibilityState === 'visible') {
        lastActivity = Date.now();
        void reload(true, true, true);
      }
    };
    const expired = () => {
      if (!current.current || loggingOut.current || checkingExpiry.current) return;
      checkingExpiry.current = true;
      void reload().finally(() => {
        checkingExpiry.current = false;
      });
    };
    channel.onmessage = update;
    window.addEventListener('makan:expired', expired);
    document.addEventListener('visibilitychange', visible);
    document.addEventListener('pointerdown', activity, { passive: true });
    document.addEventListener('keydown', activity);
    document.addEventListener('wheel', activity, { passive: true });
    return () => {
      generation.current++;
      loadAbort.current?.abort();
      channel.close();
      window.removeEventListener('makan:expired', expired);
      document.removeEventListener('visibilitychange', visible);
      document.removeEventListener('pointerdown', activity);
      document.removeEventListener('keydown', activity);
      document.removeEventListener('wheel', activity);
      void cache.cancelQueries();
      cache.clear();
    };
  }, [cache, reload, router]);
  function broadcast() {
    const channel = new BroadcastChannel('makan-client-session');
    channel.postMessage('changed');
    channel.close();
  }
  const renderedEpoch = generation.current;
  async function call<T>(path: string, init: PersonalRequestInit = {}): Promise<T> {
    const { scope = clientRequestScope(path), ...options } = init;
    const selected = scope === 'account' ? current.current : session;
    if (!selected || !session) throw new ApiError(401);
    const accountIdentity = identity(session);
    const isCurrent = () =>
      !!current.current &&
      !loggingOut.current &&
      identity(current.current) === accountIdentity &&
      (scope === 'account' ||
        (current.current.revision === selected.revision && renderedEpoch === generation.current));
    if (!isCurrent())
      throw new DOMException('The action belongs to an earlier account or context.', 'AbortError');
    const guard: ContextGuard = {
      revision: selected.revision,
      isCurrent,
      onContextChanged: () => {
        if (current.current && !checkingExpiry.current) void reload();
      },
    };
    const result = await request<T>(
      path.startsWith('/api/client/security/sessions')
        ? path
        : network.clientApiPrefix + '/backend' + path,
      options,
      guard,
    );
    if (!isCurrent())
      throw new DOMException(
        'The response belongs to an earlier account or context.',
        'AbortError',
      );
    return result;
  }
  async function selectWorkspace(
    value: components['schemas']['SelectWorkspaceCommand'],
    destination: WorkspaceDestination = '/personal',
  ) {
    const epoch = generation.current;
    const selected = current.current;
    setChanging(true);
    try {
      await cache.cancelQueries({ predicate: contextQuery });
      if (epoch !== generation.current || current.current !== selected) return;
      await call('/api/v1/workspaces/select', { method: 'POST', body: JSON.stringify(value) });
      broadcast();
      await reload();
      router.push(safeAuthReturnPath(destination) ?? '/personal');
    } finally {
      if (epoch === generation.current) setChanging(false);
    }
  }
  async function transfer<T>(path: string, options: TransferOptions): Promise<T> {
    const selected = session,
      epoch = renderedEpoch;
    if (!selected) throw new ApiError(401);
    const guard: ContextGuard = {
      revision: selected.revision,
      isCurrent: () => current.current === selected && generation.current === epoch,
      onContextChanged: () => {
        if (current.current && !checkingExpiry.current) void reload();
      },
    };
    const value = await fileTransfer<T>(path, options, guard);
    if (!guard.isCurrent!()) throw new DOMException('Earlier account or context.', 'AbortError');
    return value;
  }
  async function logout() {
    if (loggingOut.current) return;
    loggingOut.current = true;
    // Retire pending reads before the server ends the session. Their late 401s
    // and our own session broadcast must not turn deliberate logout into expiry.
    generation.current++;
    loadAbort.current?.abort();
    loadAbort.current = null;
    loadMode.current = null;
    setChanging(true);
    try {
      await cache.cancelQueries();
      await request('/api/client/auth/logout', { method: 'POST' });
      checkPushDisplayAccount(null);
      takeBrowserAuthReturn();
      try {
        clearDraftStorage(sessionStorage);
      } catch {}
      current.current = null;
      setSession(null);
      cache.clear();
      broadcast();
      router.replace('/enter');
    } catch (e) {
      loggingOut.current = false;
      setError(e);
    } finally {
      setChanging(false);
    }
  }
  if (error)
    return (
      <div className={uiClass('bootstrap')}>
        <ErrorState error={error} onRetry={() => void reload()} />
      </div>
    );
  if (!session)
    return (
      <div className={uiClass('bootstrap')}>
        <LoadingSkeleton />
      </div>
    );
  return (
    <PersonalContext.Provider
      value={{ session, changing, reload, call, transfer, selectWorkspace, logout }}
    >
      <QueryClientProvider client={cache}>
        <ScrollMemoryProvider namespace={identity(session)}>
          <MessagingLiveProvider
            key={identity(session)}
            userId={session.user.id}
            revision={session.revision}
            onContextInvalidated={() => {
              if (current.current && !checkingExpiry.current) return reload(true);
            }}
          >
            {children}
          </MessagingLiveProvider>
        </ScrollMemoryProvider>
      </QueryClientProvider>
    </PersonalContext.Provider>
  );
}
export function usePersonal() {
  const value = useContext(PersonalContext);
  if (!value) throw new Error('PersonalProvider required');
  return value;
}
export function usePersonalApi<T>(
  path: string,
  options: { enabled?: boolean; poll?: number; scope?: ClientRequestScope } = {},
) {
  const { session, call, changing } = usePersonal();
  const scope = options.scope ?? clientRequestScope(path);
  return useQuery<T>({
    queryKey: [
      'personal',
      session.user.id,
      scope === 'account' ? 'account' : session.revision,
      path,
    ],
    queryFn: ({ signal }) => call<T>(path, { signal, scope }),
    enabled: (options.enabled ?? true) && (scope === 'account' || !changing),
    refetchInterval: options.poll ?? false,
  });
}
