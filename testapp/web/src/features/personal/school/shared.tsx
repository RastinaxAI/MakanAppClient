'use client';
import { uiClass } from '@/components/v5/classes';

import { useAcademicScope } from './academic-scope';
import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/states';
import { routes } from '@/config/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageBack } from '@/components/navigation/page-back';
import { PageHeading } from '@/components/navigation/page-heading';
import type { components } from '@/generated/api/schema';
import { PublicationReceipt } from './publication-receipt';
import { ApiError } from '@/lib/api/errors';

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePersonal } from '../provider';
import s from './school.module.css';
export const base = routes.education;
export function SchoolHeading({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: boolean;
}) {
  const scope = useAcademicScope();
  return (
    <div className={uiClass(s.heading)} data-v4-heading data-page-heading>
      <PageHeading title={title} action={action} />
      {back && <PageBack href={scope.personal ? scope.base : base + '/classes'} />}
      <div>
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
export function Card({
  title,
  children,
  action,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={uiClass(`${s.card} ${className}`)} data-v4-card>
      {title && (
        <div className={uiClass(s.cardHeading)}>
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return <span className={uiClass(s.status)}>{children}</span>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className={uiClass(s.field)} data-v4-field>
      <label htmlFor={id}>{label}</label>
      {isValidElement<{ id?: string }>(children) ? cloneElement(children, { id }) : children}
    </div>
  );
}
export function FormDialog({
  title,
  children,
}: {
  title: string;
  children: ReactNode | ((close: () => void) => ReactNode);
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{title}</Button>
      </DialogTrigger>
      <DialogContent title={title} className={uiClass(s.formDialog)}>
        <div className={uiClass(s.form)}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function useSchoolAction() {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [success, setSuccess] = useState(''),
    [receipt, setReceipt] = useState<components['schemas']['AcademicPublicationReceipt']>();
  const pending = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function run<T>(
    path: string,
    body?: unknown,
    method = 'POST',
    validateResult?: (result: T) => boolean,
  ): Promise<T | undefined> {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);
    setSuccess('');
    setReceipt(undefined);
    try {
      const result = await call<T>(path, {
        method,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      if (!alive.current) return;
      if (validateResult && !validateResult(result))
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      setSuccess(uiText.text_6afc863be80c);
      if (result && typeof result === 'object' && 'publicationReceipt' in result)
        setReceipt(
          result.publicationReceipt as components['schemas']['AcademicPublicationReceipt'],
        );
      void cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
      return result;
    } catch (e) {
      if (alive.current && !(e instanceof Error && e.name === 'AbortError')) setError(e);
      if (e instanceof ApiError && [403, 409, 412].includes(e.status))
        void cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return {
    run,
    busy,
    error,
    feedback: (
      <>
        <PublicationReceipt value={receipt} />
        {!!error && <ErrorState error={error} />}
        {success && (
          <p className={uiClass(s.success)} role="status">
            <CheckCircle2 size={18} />
            {success}
          </p>
        )}
      </>
    ),
  };
}
/** ConfirmAction owns the pending state and displays thrown failures inside its dialog. */
export function useSchoolCommand() {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  return async <T,>(path: string, body?: unknown) => {
    try {
      const result = await call<T>(path, {
        method: 'POST',
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      await cache.invalidateQueries({ queryKey: ['personal', session.user.id, session.revision] });
      return result;
    } catch (error) {
      if (error instanceof ApiError && [403, 409, 412].includes(error.status))
        await cache.invalidateQueries({
          queryKey: ['personal', session.user.id, session.revision],
        });
      throw error;
    }
  };
}
export function Pager({
  page,
  total,
  onChange,
  size = 30,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  size?: number;
}) {
  return (
    <div className={uiClass(s.pager)}>
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label={uiText.text_88e65319d694}
      >
        <ChevronRight size={18} />
      </Button>
      <span>
        {uiText.text_2714496eef16}
        {new Intl.NumberFormat('fa-IR').format(page)}
        {uiText.text_78887da22764} {new Intl.NumberFormat('fa-IR').format(total)}
        {uiText.text_7506c95e2fd6}
      </span>
      <Button
        variant="outline"
        disabled={page * size >= total}
        onClick={() => onChange(page + 1)}
        aria-label={uiText.text_12ca1a58c6ca}
      >
        <ChevronLeft size={18} />
      </Button>
    </div>
  );
}
export function toUtc(value: string) {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime())) throw new Error(uiText.text_0319845ca603);
  return date.toISOString();
}
export { safeMeetingUrl } from './policy';
