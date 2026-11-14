'use client';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useViewState } from '@/components/hooks/use-view-state';
import { ApiError } from '@/lib/api/errors';
import { usePersonal } from '../provider';
import { contextSignature } from '@/lib/client-surface';
import {
  acceptAssistantResult,
  assistantRequestScope,
  isAssistantIntent,
  type AssistantIntent,
} from './model';

/** Requests may consume quota. Persist the exact intent before a single send;
 * a lost response never causes an automatic retry or a different payer. */
export function useAssistantRequest(slot: string) {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const key = `makan:draft:ai-request:${session.user.id}:account:${slot}`;
  const legacy = useRef(`makan:draft:ai-request:${session.user.id}:${session.revision}:${slot}`);
  const initialContext = useRef(contextSignature(session.context));
  const currentContext = useRef(initialContext.current);
  currentContext.current = contextSignature(session.context);
  const [pending, setPending, restored] = useViewState<AssistantIntent | null>(
    key,
    null,
    (v): v is AssistantIntent | null => v === null || isAssistantIntent(v),
    legacy.current,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [result, setResult] = useState<Record<string, unknown>>(),
    [retryAt, setRetryAt] = useState(0),
    [waiting, setWaiting] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const lock = useRef(false),
    alive = useRef(true),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    const left = retryAt - Date.now();
    setWaiting(left > 0);
    if (left > 0) {
      const timer = window.setTimeout(() => setWaiting(false), left);
      return () => window.clearTimeout(timer);
    }
  }, [retryAt]);
  async function run(prepare: (signal: AbortSignal) => Promise<AssistantIntent>) {
    if (lock.current || !restored || retryAt > Date.now()) return;
    lock.current = true;
    setBusy(true);
    setCancelled(false);
    setError(undefined);
    setResult(undefined);
    controller.current = new AbortController();
    try {
      const begunContext = currentContext.current;
      const prepared = pending ?? (await prepare(controller.current.signal));
      if (!isAssistantIntent(prepared)) throw new ApiError(400, { code: 'VALIDATION_ERROR' });
      const intent = {
        ...prepared,
        contextKey: prepared.contextKey ?? (pending ? initialContext.current : begunContext),
      };
      if (
        assistantRequestScope(intent) === 'context' &&
        intent.contextKey !== currentContext.current
      )
        throw new ApiError(409, { code: 'AI_CONTEXT_RESELECT_REQUIRED' });
      sessionStorage.setItem(key, JSON.stringify(intent));
      if (!alive.current) return;
      setPending(intent);
      const knowledge = !!intent.sources;
      const value = await call<unknown>(intent.path, {
        scope: assistantRequestScope(intent),
        method: 'POST',
        expectedStatus: 200,
        signal: controller.current.signal,
        headers: knowledge
          ? undefined
          : { 'X-AI-Operation-Id': intent.operationId, 'X-AI-Payer': intent.payer },
        ...(intent.body ? { body: JSON.stringify(intent.body) } : {}),
      });
      controller.current.signal.throwIfAborted();
      const accepted = acceptAssistantResult(intent, value);
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(legacy.current);
      if (!alive.current) return;
      setPending(null);
      setResult(accepted);
      setRetryAt(0);
      return accepted;
    } catch (e) {
      if (e instanceof ApiError && [403, 409, 412].includes(e.status))
        void cache.invalidateQueries({ queryKey: ['personal', session.user.id] });
      if (alive.current && !(e instanceof Error && e.name === 'AbortError')) {
        setError(e);
        if (e instanceof ApiError && e.problem.retryAfter)
          setRetryAt(Date.now() + e.problem.retryAfter * 1000);
      }
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  function reset() {
    if (lock.current || !restored) return;
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(legacy.current);
    setPending(null);
    setError(undefined);
    setResult(undefined);
    setCancelled(false);
  }
  function cancelLocal() {
    if (!lock.current) return;
    setCancelled(true);
    controller.current?.abort();
  }
  return { run, reset, cancelLocal, cancelled, pending, restored, busy, error, result, waiting };
}
