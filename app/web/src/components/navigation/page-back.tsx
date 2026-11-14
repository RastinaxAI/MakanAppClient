'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  defaultBackTarget,
  readNavigationVisits,
  previousNavigationVisit,
  type NavigationVisit,
} from '@/config/navigation';
import { safeAuthReturnPath } from '@/lib/auth-return';
type Destination = { path: string; href: string };
type Registry = {
  destinations: Map<string, Destination>;
  register: (id: string, path: string, href: string) => () => void;
  previous?: NavigationVisit;
  goBack: () => boolean;
};
const Context = createContext<Registry | null>(null);
const markerKey = '__makanNavigation';
/** Tag only this app's history entries; Next's router state is retained verbatim. */
export function PageBackProvider({
  children,
  namespace = 'public',
}: {
  children: ReactNode;
  namespace?: string;
}) {
  const [destinations, setDestinations] = useState(() => new Map<string, Destination>());
  const [previous, setPrevious] = useState<NavigationVisit>();
  const visits = useRef<NavigationVisit[]>([]),
    current = useRef<NavigationVisit | undefined>(undefined);
  const register = useCallback((id: string, path: string, href: string) => {
    setDestinations((old) => new Map(old).set(id, { path, href }));
    return () =>
      setDestinations((old) => {
        const next = new Map(old);
        next.delete(id);
        return next;
      });
  }, []);
  useEffect(() => {
    const history = window.history,
      storageKey = 'makan:draft:navigation:' + namespace;
    const originalPush = history.pushState,
      originalReplace = history.replaceState;
    let active = true;
    const href = () => safeAuthReturnPath(location.pathname + location.search + location.hash);
    const marker = () => history.state?.[markerKey];
    const markerData = (visit: NavigationVisit) => ({ scope: namespace, id: visit.id });
    const persist = () => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(visits.current));
      } catch {}
      queueMicrotask(() => {
        if (active) setPrevious(previousNavigationVisit(current.current, visits.current));
      });
    };
    const restore = () => {
      const tag = marker(),
        path = href();
      const known =
        tag?.scope === namespace &&
        visits.current.find((visit) => visit.id === tag.id && visit.href === path);
      if (known) current.current = known;
      else if (path) {
        const visit = { id: crypto.randomUUID(), index: 0, href: path, parentId: null };
        visits.current = [visit];
        current.current = visit;
        originalReplace.call(history, { ...history.state, [markerKey]: markerData(visit) }, '');
      } else current.current = undefined;
      persist();
    };
    try {
      visits.current = readNavigationVisits(JSON.parse(sessionStorage.getItem(storageKey) ?? '[]'));
    } catch {
      visits.current = [];
    }
    restore();
    const change = (
      method: 'push' | 'replace',
      data: unknown,
      title: string,
      url?: string | URL | null,
    ) => {
      const original = method === 'push' ? originalPush : originalReplace;
      // Unrelated libraries may own a primitive state. Do not alter its representation.
      if (data !== null && typeof data !== 'object') {
        original.call(history, data, title, url);
        current.current = undefined;
        persist();
        return;
      }
      const destination = new URL(url ?? location.href, location.href);
      const path =
        destination.origin === location.origin
          ? safeAuthReturnPath(destination.pathname + destination.search + destination.hash)
          : null;
      if (!path) {
        original.call(history, data, title, url);
        current.current = undefined;
        persist();
        return;
      }
      // Native back/forward changes the browser entry before React commits. Next
      // may replace its router state before our popstate listener gets a turn.
      // Resolve that actual entry rather than overwriting it with the old page.
      const tag = marker();
      const old =
        (tag?.scope === namespace && visits.current.find((visit) => visit.id === tag.id)) ||
        current.current;
      const samePage =
        old &&
        new URL(old.href, location.origin).pathname === new URL(path, location.origin).pathname;
      const visit: NavigationVisit =
        method === 'replace' && old
          ? { ...old, href: path }
          : {
              id: crypto.randomUUID(),
              index: (old?.index ?? -1) + 1,
              href: path,
              parentId: old ? (samePage ? old.parentId : old.id) : null,
            };
      // For native history calls pass only the caller's data plus our tag. Copying
      // __NA from the old state here would bypass Next's search-param notification.
      original.call(history, { ...data, [markerKey]: markerData(visit) }, title, url);
      const retained = visits.current.filter(
        (entry) => entry.id !== visit.id && (method === 'replace' || entry.index < visit.index),
      );
      visits.current = [...retained, visit].slice(-128);
      current.current = visit;
      persist();
    };
    const push: History['pushState'] = (data, title, url) => change('push', data, title, url);
    const replace: History['replaceState'] = (data, title, url) =>
      change('replace', data, title, url);
    history.pushState = push;
    history.replaceState = replace;
    window.addEventListener('popstate', restore);
    return () => {
      active = false;
      window.removeEventListener('popstate', restore);
      if (history.pushState === push) history.pushState = originalPush;
      if (history.replaceState === replace) history.replaceState = originalReplace;
    };
  }, [namespace]);
  const goBack = useCallback(() => {
    const visit = current.current,
      target = previousNavigationVisit(visit, visits.current);
    if (
      !visit ||
      !target ||
      window.history.state?.[markerKey]?.id !== visit.id ||
      window.history.state?.[markerKey]?.scope !== namespace
    )
      return false;
    window.history.go(target.index - visit.index);
    return true;
  }, [namespace]);
  const value = useMemo(
    () => ({ destinations, register, previous, goBack }),
    [destinations, register, previous, goBack],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
/** Declare the semantic fallback for a direct entry without a known in-app origin. */
export function PageBack({ href }: { href: string }) {
  const path = usePathname(),
    id = useId(),
    register = useContext(Context)?.register;
  useEffect(() => register?.(id, path, href), [id, path, href, register]);
  return null;
}
export function usePageBackTarget(fallback?: string) {
  const path = usePathname(),
    registry = useContext(Context);
  const match =
    registry && [...registry.destinations.values()].reverse().find((item) => item.path === path);
  return registry?.previous?.href ?? fallback ?? match?.href ?? defaultBackTarget(path);
}
/** Keep a real safe href for modified clicks and preserve unsaved-navigation guards. */
export function ContextBackLink({
  href,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const target = usePageBackTarget(href),
    registry = useContext(Context);
  return (
    <Link
      {...props}
      href={target}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          !event.altKey &&
          props.target !== '_blank' &&
          registry?.goBack()
        )
          event.preventDefault();
      }}
    />
  );
}
