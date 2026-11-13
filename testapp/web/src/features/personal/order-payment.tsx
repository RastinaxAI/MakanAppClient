'use client';
import { useEffect, useRef, useState } from 'react';
import { useViewState } from '@/components/hooks/use-view-state';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { uiClass } from '@/components/v5/classes';
import { paymentCopy as t } from '@/content/fa';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { contextSignature } from '@/lib/client-surface';
import { usePersonal, usePersonalApi } from './provider';
import {
  acceptOrder,
  acceptPayment,
  acceptReceipt,
  isPaymentIntent,
  paymentLink,
  type PaymentIntent,
} from './payment-model';
import s from './service-layout.module.css';
type S = components['schemas'];
const prefixFor = (organization: boolean) =>
  '/api/v1/commerce/' + (organization ? '' : 'personal/') + 'orders/';

/** Ordinary product view. Query-string hints never supply payment or fulfillment state. */
export function OrderPayment({
  orderId,
  organization,
  paymentPlanId,
  returnedAttemptId,
}: {
  orderId: string;
  organization: boolean;
  paymentPlanId?: string;
  returnedAttemptId?: string;
}) {
  const { session, call } = usePersonal();
  const organizationId = organization ? session.context.organizationId : null;
  const path = prefixFor(organization) + orderId;
  const q = usePersonalApi<S['OrderDto']>(path, { poll: 15000 });
  const key = `makan:draft:payment:${session.user.id}:${organization ? contextSignature(session.context) : 'account'}:${orderId}`;
  const legacyKey = useRef(`makan:draft:payment:${session.user.id}:${session.revision}:${orderId}`);
  const [pending, setPending, restored] = useViewState<PaymentIntent | null>(
    key,
    null,
    isPaymentIntent,
    legacyKey.current,
  );
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false),
    [attemptId, setAttemptId] = useState(returnedAttemptId);
  const [retryAt, setRetryAt] = useState(0),
    [waiting, setWaiting] = useState(false);
  const lock = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const remaining = retryAt - Date.now();
    setWaiting(remaining > 0);
    if (remaining > 0) {
      const timer = setTimeout(() => setWaiting(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [retryAt]);
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  let order: S['OrderDto'];
  try {
    order = acceptOrder(q.data, orderId, organizationId);
  } catch (e) {
    return <ErrorState error={e} />;
  }
  if (
    returnedAttemptId &&
    !order.paymentAttempts.some((a) => a.paymentAttemptId === returnedAttemptId)
  )
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  const attempts = [...order.paymentAttempts].sort(
    (a, b) => Date.parse(b.createdAtUtc) - Date.parse(a.createdAtUtc),
  );
  const chosen = attempts.find((a) => a.paymentAttemptId === attemptId) ?? attempts[0];
  const unresolved = attempts.some((a) =>
    ['Created', 'Initiating', 'PendingVerification', 'Unknown'].includes(a.status),
  );
  const paymentAvailable = paymentPlanId === order.planVersionId;
  const canStart =
    order.status === 'PendingPayment' &&
    !unresolved &&
    !waiting &&
    retryAt <= Date.now() &&
    (paymentAvailable || !!pending) &&
    !(error instanceof ApiError && error.problem.code === 'PAYMENT_PROVIDER_UNAVAILABLE');
  async function initiate() {
    if (lock.current || !restored || !canStart) return false;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    const command = pending ?? { clientOperationId: crypto.randomUUID() };
    try {
      // Persist before sending. A failed write must not make a later reload create a second intent.
      try {
        sessionStorage.setItem(key, JSON.stringify(command));
      } catch {
        throw new ApiError(503, { code: 'PAYMENT_STORAGE_UNAVAILABLE' });
      }
      setPending(command);
      const value = await call<unknown>(path + '/payments', {
        method: 'POST',
        expectedStatus: 200,
        body: JSON.stringify(command),
      });
      const result = acceptPayment(value, 'InitiatePaymentResult', orderId, organizationId);
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(legacyKey.current);
      if (!alive.current) return false;
      setPending(null);
      setAttemptId(result.paymentAttempt.paymentAttemptId);
      await q.refetch();
      return true;
    } catch (e) {
      if (alive.current) {
        setError(e);
        if (e instanceof ApiError && e.problem.retryAfter)
          setRetryAt(Date.now() + e.problem.retryAfter * 1000);
      }
      // Let the confirmation dialog show the failure immediately as well.
      throw e;
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <section className={uiClass(s.panel)} aria-label={t.title}>
      <h2>{t.title}</h2>
      <p className={uiClass(s.meta)}>
        {t.order}: <bdi>{order.orderId}</bdi>
      </p>
      <OrderState order={order} />
      <dl className={uiClass(s.detail)}>
        <div>
          <dt>{t.amount}</dt>
          <dd>
            {(order.priceToman ?? order.amount).toLocaleString('fa-IR')}{' '}
            {order.displayCurrency ?? order.currency}
          </dd>
        </div>
      </dl>
      {order.status === 'PendingPayment' && !unresolved && (
        <>
          {!paymentAvailable && !pending && <p role="status">{t.quoteRequired}</p>}
          {pending && <p role="status">{t.uncertain}</p>}
          <ConfirmAction
            trigger={pending ? t.retryStart : t.start}
            title={t.startTitle}
            description={t.startDescription}
            confirm={t.start}
            disabled={busy || !restored || !canStart}
            onConfirm={initiate}
          />
        </>
      )}
      {!!error && <ErrorState error={error} />}
      {attempts.length > 1 && (
        <div className={uiClass(s.actions)}>
          {attempts.map((attempt, index) => (
            <Button
              key={attempt.paymentAttemptId}
              variant="outline"
              aria-pressed={chosen?.paymentAttemptId === attempt.paymentAttemptId}
              onClick={() => setAttemptId(attempt.paymentAttemptId)}
            >
              {t.attempt} {(index + 1).toLocaleString('fa-IR')} · {t.statuses[attempt.status]}
            </Button>
          ))}
        </div>
      )}
      {chosen ? (
        <PaymentAttempt
          key={chosen.paymentAttemptId}
          orderId={orderId}
          organizationId={organizationId}
          attemptId={chosen.paymentAttemptId}
          onChange={() => void q.refetch()}
        />
      ) : (
        <p>{t.notStarted}</p>
      )}
      {order.status === 'Paid' && <PaymentReceipt order={order} organization={organization} />}
    </section>
  );
}

function OrderState({ order }: { order: S['OrderDto'] }) {
  return (
    <div role="status">
      <p>
        {order.status === 'Paid'
          ? t.paid
          : order.status === 'Cancelled'
            ? t.cancelled
            : t.orderPending}
      </p>
      {order.status === 'Paid' && <p>{t.fulfillment[order.fulfillmentState]}</p>}
    </div>
  );
}
function PaymentAttempt({
  orderId,
  organizationId,
  attemptId,
  onChange,
}: {
  orderId: string;
  organizationId: string | null;
  attemptId: string;
  onChange: () => void;
}) {
  const { call } = usePersonal();
  const path = '/api/v1/commerce/payment-attempts/' + attemptId;
  const q = usePersonalApi<S['PaymentAttemptDetailsDto']>(path, { poll: 15000 });
  const [result, setResult] = useState<S['VerifyPaymentResult']>();
  const [error, setError] = useState<unknown>(),
    [busy, setBusy] = useState(false),
    [retryAt, setRetryAt] = useState(0),
    [waiting, setWaiting] = useState(false);
  const lock = useRef(false),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const ms = retryAt - Date.now();
    setWaiting(ms > 0);
    if (ms > 0) {
      const timer = setTimeout(() => setWaiting(false), ms);
      return () => clearTimeout(timer);
    }
  }, [retryAt]);
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  let details: S['PaymentAttemptDetailsDto'];
  try {
    details = acceptPayment(
      q.data,
      'PaymentAttemptDetailsDto',
      orderId,
      organizationId,
      attemptId,
    ) as S['PaymentAttemptDetailsDto'];
  } catch (e) {
    return <ErrorState error={e} />;
  }
  const attempt = details.paymentAttempt;
  const link = paymentLink(attempt);
  const needsRecovery =
    ['Created', 'Initiating', 'PendingVerification', 'Unknown'].includes(attempt.status) &&
    details.order.status === 'PendingPayment';
  async function recover() {
    if (lock.current || retryAt > Date.now()) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setResult(undefined);
    try {
      // Same attempt, bodyless POST. Never initiate a second charge to recover an unknown result.
      const value = await call<unknown>(path + '/verify', { method: 'POST', expectedStatus: 200 });
      const accepted = acceptPayment(
        value,
        'VerifyPaymentResult',
        orderId,
        organizationId,
        attemptId,
      ) as S['VerifyPaymentResult'];
      if (!alive.current) return;
      setResult(accepted);
      await q.refetch();
      onChange();
    } catch (e) {
      if (alive.current) {
        setError(e);
        if (e instanceof ApiError && e.problem.retryAfter)
          setRetryAt(Date.now() + e.problem.retryAfter * 1000);
      }
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className={uiClass(s.paymentAttempt)}>
      <p>{t.statuses[attempt.status]}</p>
      {attempt.providerReference && (
        <p className={uiClass(s.meta)}>
          {t.providerReference}: <bdi>{attempt.providerReference}</bdi>
        </p>
      )}
      {attempt.settlementReference && (
        <p className={uiClass(s.meta)}>
          {t.settlementReference}: <bdi>{attempt.settlementReference}</bdi>
        </p>
      )}
      <div className={uiClass(s.actions)}>
        {link && details.order.status === 'PendingPayment' && (
          <Button asChild>
            <a href={link} target="_blank" rel="noopener noreferrer">
              {t.openGateway}
            </a>
          </Button>
        )}
        <Button variant="outline" disabled={busy} onClick={() => void q.refetch()}>
          {t.refresh}
        </Button>
        {needsRecovery && (
          <Button disabled={busy || waiting} onClick={() => void recover()}>
            {t.recover}
          </Button>
        )}
      </div>
      {result && (
        <p role="status">
          {['Settled', 'AlreadySettled'].includes(result.status)
            ? t.paid
            : result.status === 'Unknown'
              ? t.verificationPending
              : result.status === 'Failed'
                ? t.failed
                : t.mismatch}
        </p>
      )}
      {!!error && <ErrorState error={error} />}
    </div>
  );
}
function PaymentReceipt({ order, organization }: { order: S['OrderDto']; organization: boolean }) {
  const { session } = usePersonal();
  const [open, setOpen] = useState(false);
  const q = usePersonalApi<S['PaymentReceiptDto']>(
    prefixFor(organization) + order.orderId + '/receipt',
    { enabled: open && order.status === 'Paid' },
  );
  let receipt: S['PaymentReceiptDto'] | undefined, error: unknown;
  if (q.data)
    try {
      receipt = acceptReceipt(q.data, order, session.user.id);
    } catch (e) {
      error = e;
    }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t.receipt}</Button>
      </DialogTrigger>
      <DialogContent title={t.receiptTitle}>
        {q.isPending ? (
          <LoadingSkeleton />
        ) : q.isError || error ? (
          <ErrorState error={error ?? q.error} onRetry={() => void q.refetch()} />
        ) : (
          receipt && (
            <dl className={uiClass(s.detail)}>
              <div>
                <dt>{t.order}</dt>
                <dd>
                  <bdi>{receipt.orderId}</bdi>
                </dd>
              </div>
              <div>
                <dt>{t.amount}</dt>
                <dd>
                  {receipt.amount.toLocaleString('fa-IR')} {receipt.currency}
                </dd>
              </div>
              <div>
                <dt>{t.paidAt}</dt>
                <dd>{date(receipt.paidAtUtc, true)}</dd>
              </div>
              {receipt.providerReference && (
                <div>
                  <dt>{t.providerReference}</dt>
                  <dd>
                    <bdi>{receipt.providerReference}</bdi>
                  </dd>
                </div>
              )}
              {receipt.settlementReference && (
                <div>
                  <dt>{t.settlementReference}</dt>
                  <dd>
                    <bdi>{receipt.settlementReference}</bdi>
                  </dd>
                </div>
              )}
              <div>
                <dt>{t.title}</dt>
                <dd>{t.fulfillment[receipt.fulfillmentState]}</dd>
              </div>
            </dl>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
