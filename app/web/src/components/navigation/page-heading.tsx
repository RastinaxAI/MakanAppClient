'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
type Heading = { path: string; title: string; action?: ReactNode };
type Register = (id: string, heading: Heading) => () => void;
const HeadingState = createContext<Map<string, Heading>>(new Map());
const HeadingRegister = createContext<Register | undefined>(undefined);
/** Separate state and registration contexts keep registering pages out of header updates. */
export function PageHeadingProvider({ children }: { children: ReactNode }) {
  const [headings, setHeadings] = useState(() => new Map<string, Heading>());
  const register = useCallback<Register>((id, heading) => {
    setHeadings((old) => new Map(old).set(id, heading));
    return () =>
      setHeadings((old) => {
        const next = new Map(old);
        next.delete(id);
        return next;
      });
  }, []);
  return (
    <HeadingRegister.Provider value={register}>
      <HeadingState.Provider value={headings}>{children}</HeadingState.Provider>
    </HeadingRegister.Provider>
  );
}
export function PageHeading({ title, action }: { title: string; action?: ReactNode }) {
  const path = usePathname(),
    id = useId(),
    register = useContext(HeadingRegister);
  useEffect(() => register?.(id, { path, title, action }), [id, path, title, action, register]);
  return null;
}
export function usePageHeading() {
  const path = usePathname(),
    headings = useContext(HeadingState);
  return [...headings.values()].reverse().find((h) => h.path === path);
}
