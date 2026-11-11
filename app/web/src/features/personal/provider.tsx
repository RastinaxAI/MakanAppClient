'use client';
import { uiClass } from '@/components/v5/classes';

import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { network } from '@/config/network';
import { request, type ContextGuard, type ApiRequestInit } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { fileTransfer, type TransferOptions } from '@/lib/api/file-transfer';
import { clearDraftStorage } from '@/lib/draft-storage';
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
  | '/personal/profile'
  | '/personal/contacts'
  | '/personal/messages'
  | '/personal/messages?view=organization'
  | `/personal/messages/${string}`;
type ClientAccess = {
  session: ClientState;
  changing: boolean;
  reload: () => Promise<void>;
  call: <T>(path: string, init?: ApiRequestInit) => Promise<T>;
  transfer: <T>(path: string, options: TransferOptions) => Promise<T>;
  selectWorkspace: (
    value: components['schemas']['SelectWorkspaceCommand'],
    destination?: WorkspaceDestination,
  ) => Promise<void>;
  logout: () => Promise<void>;
};
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
    loadAbort = useRef<AbortController | null>(null),
    loadMode = useRef<'foreground' | 'background' | null>(null),
    current = useRef<ClientState | null>(null);
  const reload = useCallback(
    async (quiet = false) => {
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
      loadMode.current = background ? 'background' : 'foreground';
      if (!background) {
        setChanging(true);
        await cache.cancelQueries();
      }
      if (epoch !== generation.current || controller.signal.aborted) return;
      if (!background) cache.clear();
      try {
        const next = await request<ClientState>(
          '/api/client/session',
          { signal: controller.signal },
          { revision: '', isCurrent: () => epoch === generation.current },
        );
        if (epoch !== generation.current || controller.signal.aborted) return;
        // A visibility check must not remount a form or invalidate its pending save
        // when the server confirms the same identity and access context.
        if (background && previous.user.id === next.user.id && previous.revision === next.revision)
          return;
        if (background) {
          const changedEpoch = ++generation.current;
          await cache.cancelQueries();
          if (generation.current !== changedEpoch || controller.signal.aborted) return;
          cache.clear();
        }
        current.current = next;
        checkPushDisplayAccount(next.user.id);
        setSession(next);
        setError(undefined);
      } catch (e) {
        if (epoch !== generation.current || controller.signal.aborted) return;
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
    void reload();
    const channel = new BroadcastChannel('makan-client-session');
    const update = () => void reload();
    const visible = () => {
      if (document.visibilityState === 'visible') void reload(true);
    };
    const expired = () => {
      if (loggingOut.current) return;
      rememberBrowserAuthReturn();
      generation.current++;
      loadAbort.current?.abort();
      current.current = null;
      setSession(null);
      void cache.cancelQueries();
      cache.clear();
      router.replace('/enter');
    };
    channel.onmessage = update;
    window.addEventListener('makan:expired', expired);
    document.addEventListener('visibilitychange', visible);
    return () => {
      generation.current++;
      loadAbort.current?.abort();
      channel.close();
      window.removeEventListener('makan:expired', expired);
      document.removeEventListener('visibilitychange', visible);
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
  async function call<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const selected = session;
    if (!selected) throw new ApiError(401);
    if (current.current !== selected || renderedEpoch !== generation.current)
      throw new DOMException('The action belongs to an earlier account or context.', 'AbortError');
    const epoch = renderedEpoch;
    const guard: ContextGuard = {
      revision: selected.revision,
      isCurrent: () => current.current === selected && epoch === generation.current,
      onContextChanged: () => void reload(),
    };
    const result = await request<T>(
      path.startsWith('/api/client/security/sessions')
        ? path
        : network.clientApiPrefix + '/backend' + path,
      init,
      guard,
    );
    if (current.current !== selected || epoch !== generation.current)
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
      await cache.cancelQueries();
      if (epoch !== generation.current || current.current !== selected) return;
      cache.clear();
      await call('/api/v1/workspaces/select', { method: 'POST', body: JSON.stringify(value) });
      broadcast();
      await reload();
      router.push(safeAuthReturnPath(destination) ?? '/personal');
    } catch (e) {
      if (
        epoch !== generation.current ||
        current.current !== selected ||
        (e instanceof Error && e.name === 'AbortError')
      )
        return;
      setError(e);
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
      onContextChanged: () => void reload(),
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
  if (!session || changing)
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
        <ScrollMemoryProvider namespace={session.user.id + ':' + session.revision}>
          <MessagingLiveProvider
            key={session.user.id + ':' + session.revision}
            userId={session.user.id}
            revision={session.revision}
            onContextInvalidated={() => reload(true)}
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
  options: { enabled?: boolean; poll?: number } = {},
) {
  const { session, call } = usePersonal();
  return useQuery<T>({
    queryKey: ['personal', session.user.id, session.revision, path],
    queryFn: ({ signal }) => call<T>(path, { signal }),
    enabled: options.enabled ?? true,
    refetchInterval: options.poll ?? false,
  });
}
