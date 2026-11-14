'use client';
import { Select as NativeSelect, Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ErrorState, LoadingSkeleton, EmptyState, label } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { useViewState } from '@/components/hooks/use-view-state';
import { V5Scene } from '@/components/v5/scene';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { contextSignature } from '@/lib/client-surface';
import { V4List, V4Row, V4Note } from '@/components/v4/page';
import { Sparkles, Receipt, RotateCcw, ChevronLeft } from 'lucide-react';
import { usePersonal, usePersonalApi } from './provider';
import { useAccountAction } from './use-account-action';
import { OrderPayment } from './order-payment';
import { validPaymentId } from './payment-model';
import { acceptOrder } from './payment-model';
import { clientValidator } from '@/lib/api/client-contract';
import {
  quotaLabels,
  quotaRemaining,
  subscriptionLabels,
  summaryMatches,
  quoteAllowsPurchase,
} from './commerce-model';
import s from './service-layout.module.css';
type S = components['schemas'];
export function CommercePage() {
  const { session } = usePersonal();
  const params = useSearchParams();
  const org = params.get('scope') === 'organization';
  const orderId = params.get('orderId'),
    attemptId = params.get('paymentAttemptId');
  if (
    (orderId && !validPaymentId(orderId)) ||
    (attemptId && !validPaymentId(attemptId)) ||
    (attemptId && !orderId)
  )
    return <ErrorState error={new ApiError(400)} />;
  return (
    <Commerce
      key={session.user.id + ':' + (org ? contextSignature(session.context) : 'account')}
      organization={org}
      overview={!org && !params.get('view') && !orderId}
      ordersOnly={params.get('view') === 'payments'}
      returnedOrderId={orderId ?? undefined}
      returnedAttemptId={attemptId ?? undefined}
    />
  );
}
function Commerce({
  organization,
  overview = false,
  ordersOnly = false,
  returnedOrderId,
  returnedAttemptId,
}: {
  organization: boolean;
  overview?: boolean;
  ordersOnly?: boolean;
  returnedOrderId?: string;
  returnedAttemptId?: string;
}) {
  const { session, call } = usePersonal();
  const allowed =
    !organization ||
    (session.context.workspaceType === 'Organization' && session.context.activeRole === 'Manager');
  const scope = organization ? 'organization' : 'personal',
    owner = organization ? 'Organization' : 'Individual',
    prefix = '/api/v1/commerce/' + scope;
  const summary = usePersonalApi<S['CommercialSummaryDto']>(prefix + '/subscription', {
    enabled: allowed,
    poll: 15000,
  });
  const plans = usePersonalApi<S['CommercialPlanDto'][]>(
    '/api/v1/commerce/catalog?audience=' + owner,
    { enabled: allowed && !overview && !ordersOnly && !returnedAttemptId },
  );
  const [quote, setQuote] = useState<S['CommercialQuoteDto']>(),
    [purpose, setPurpose] = useState<S['CommercialOrderPurpose']>('Purchase'),
    [reason, setReason] = useState(''),
    [selected, setSelected] = useState(''),
    [reviewing, setReviewing] = useState(false),
    [order, setOrder] = useState<S['OrderDto']>(),
    [now, setNow] = useState(Date.now());
  const commandKey = `makan:draft:order:${session.user.id}:${organization ? contextSignature(session.context) : 'account'}:${scope}`;
  const legacyCommandKey = useRef(
    `makan:draft:order:${session.user.id}:${session.revision}:${scope}`,
  );
  const [command, setCommand, restored] = useViewState<S['CreateOrderCommand'] | null>(
    commandKey,
    null,
    (value): value is S['CreateOrderCommand'] | null =>
      value === null ||
      clientValidator({ $ref: '#/components/schemas/CreateOrderCommand' }).safeParse(value).success,
    legacyCommandKey.current,
  );
  const orderUncertain = !!command;
  useUnsavedChanges(orderUncertain);
  const createLock = useRef(false),
    a = useAccountAction();
  useEffect(() => {
    if (!quote) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [quote]);
  if (!allowed) return <ErrorState error={new ApiError(403)} />;
  if (summary.isPending) return <LoadingSkeleton />;
  if (summary.isError)
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
  const current = summary.data;
  if (
    !summaryMatches(current, owner, organization ? session.context.organizationId : session.user.id)
  )
    return <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />;
  const previewReady = !!quote && quoteAllowsPurchase(quote, selected, now);
  async function createOrder() {
    if (createLock.current || !restored || (!command && !previewReady)) return false;
    const frozen = command ?? {
      planVersionId: quote!.planVersionId,
      clientOperationId: crypto.randomUUID(),
      purpose,
      subscriptionId: current.subscriptionId,
    };
    createLock.current = true;
    try {
      try {
        sessionStorage.setItem(commandKey, JSON.stringify(frozen));
      } catch {
        throw new ApiError(503, { code: 'PAYMENT_STORAGE_UNAVAILABLE' });
      }
      setCommand(frozen);
      const result = await call<S['CreateOrderResult']>(
        '/api/v1/commerce/' + (organization ? '' : 'personal/') + 'orders',
        { method: 'POST', expectedStatus: 200, body: JSON.stringify(frozen) },
      );
      const created = acceptOrder(
        result.order,
        result.order.orderId,
        organization ? session.context.organizationId : null,
      );
      if (created.planVersionId !== frozen.planVersionId)
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      sessionStorage.removeItem(commandKey);
      sessionStorage.removeItem(legacyCommandKey.current);
      setCommand(null);
      setOrder(created);
      await summary.refetch();
      return true;
    } catch (e) {
      if (e instanceof ApiError && [400, 403, 404, 422].includes(e.status)) {
        sessionStorage.removeItem(commandKey);
        sessionStorage.removeItem(legacyCommandKey.current);
        setCommand(null);
      }
      throw e;
    } finally {
      createLock.current = false;
    }
  }
  if (overview)
    return (
      <V5Scene
        id="MK-380"
        title={uiText.v6Ui.planServices}
        back="/personal/profile"
        kind="list"
        deep
      >
        <section className={uiClass('card')}>
          <h3>{uiText.v6Ui.yourSubscription}</h3>
          <span className={s.status} data-state={current.state}>
            {subscriptionLabels[current.state] ?? current.state}
          </span>
          <h2 className={s.planName}>{current.planDisplayName ?? uiText.text_f596b5c9d314}</h2>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.v6Ui.planBeneficiary}</span>
            <b className={uiClass('val')}>{session.user.displayName}</b>
          </div>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.v6Ui.planValidity}</span>
            <b className={uiClass('val')}>
              {current.periodStartsAtUtc && current.periodEndsAtUtc
                ? date(current.periodStartsAtUtc) +
                  uiText.text_7168a3799fbf +
                  date(current.periodEndsAtUtc)
                : uiText.text_c71eb9b208c8}
            </b>
          </div>
        </section>
        <V4List>
          <V4Row
            title={uiText.v6Ui.availablePlans}
            description={uiText.v6Ui.availablePlansHint}
            icon={<Sparkles />}
            href="/personal/subscription?view=plans"
          />
          <V4Row
            title={uiText.v6Ui.myPayments}
            description={uiText.v6Ui.myPaymentsHint}
            icon={<Receipt />}
            href="/personal/subscription?view=payments"
          />
          <V4Row
            title={uiText.v6Ui.restorePurchase}
            description={uiText.v6Ui.restoreUnavailable}
            icon={<RotateCcw />}
            disabled
          />
        </V4List>
        <V4Note>{uiText.v6Ui.familyPrivacy}</V4Note>
      </V5Scene>
    );
  if (returnedOrderId && returnedAttemptId)
    return (
      <V5Scene
        id="MK-385"
        title={uiText.paymentCopy.title}
        back="/personal/subscription?view=payments"
        kind="status"
        deep
      >
        <OrderPayment
          orderId={returnedOrderId}
          organization={organization}
          returnedAttemptId={returnedAttemptId}
        />
      </V5Scene>
    );
  if (ordersOnly)
    return (
      <V5Scene
        id="MK-382"
        title={uiText.serverAlignedUi.payments}
        back="/personal/profile"
        kind="list"
      >
        <Button asChild variant="outline">
          <Link href={'/personal/subscription' + (organization ? '?scope=organization' : '')}>
            {uiText.serverAlignedUi.planUsage}
          </Link>
        </Button>
        <Orders
          organization={organization}
          returnedOrderId={returnedOrderId}
          returnedAttemptId={returnedAttemptId}
        />
      </V5Scene>
    );
  if (!organization && !returnedOrderId && !order && !command && !reviewing && restored)
    return (
      <V5Scene
        id="MK-380"
        title={uiText.v6Ui.plansTitle}
        back="/personal/subscription"
        kind="list"
        deep
      >
        <div className={s.planLead}>
          <h2>{uiText.v6Ui.plansLead}</h2>
          <p>{uiText.v6Ui.planCatalogHint}</p>
        </div>
        {plans.isPending ? (
          <LoadingSkeleton />
        ) : plans.isError ? (
          <ErrorState error={plans.error} onRetry={() => void plans.refetch()} />
        ) : !plans.data.some((plan) => plan.audience === owner) ? (
          <EmptyState title={uiText.text_13877f13269f} />
        ) : (
          <div className={s.planCatalog}>
            {plans.data
              .filter((plan) => plan.audience === owner)
              .map((plan) => (
                <section className={uiClass('card')} key={plan.planVersionId}>
                  <h3 dir="auto">{plan.displayName}</h3>
                  <div className={uiClass('kv')}>
                    <span className={uiClass('key')}>{uiText.v6Ui.planPrice}</span>
                    <b className={uiClass('val')}>
                      {plan.priceToman.toLocaleString('fa-IR')} {plan.displayCurrency}
                    </b>
                  </div>
                  <Button
                    variant="outline"
                    aria-label={uiText.v6Ui.reviewPlan + ' ' + plan.displayName}
                    onClick={() => {
                      setSelected(plan.planVersionId);
                      setReviewing(true);
                    }}
                  >
                    {uiText.v6Ui.reviewPlan}
                    <ChevronLeft size={18} />
                  </Button>
                </section>
              ))}
          </div>
        )}
      </V5Scene>
    );
  return (
    <V5Scene
      id={organization ? 'MK-381' : 'MK-380'}
      title={organization ? uiText.text_2ae205425d42 : uiText.text_ab67aa4d93be}
      subtitle={organization ? uiText.text_6ff6f7651ca5 : uiText.text_7341b0ece9cc}
      back={organization ? '/personal/education' : '/personal/profile'}
    >
      {!organization && !returnedOrderId && !orderUncertain && (
        <Button variant="outline" onClick={() => setReviewing(false)}>
          {uiText.v6Ui.allPlans}
        </Button>
      )}
      {(organization ||
        (session.context.workspaceType === 'Organization' &&
          session.context.activeRole === 'Manager')) &&
        !orderUncertain && (
          <Button variant="outline" asChild>
            <Link href={'/personal/subscription' + (organization ? '' : '?scope=organization')}>
              {organization ? uiText.text_d86b9666ec8d : uiText.text_2ae205425d42}
            </Link>
          </Button>
        )}
      <section className={uiClass(s.panel)}>
        <span className={uiClass(s.status)}>
          {subscriptionLabels[current.state] ?? current.state}
        </span>
        <h2>{current.planDisplayName ?? uiText.text_f596b5c9d314}</h2>
        <dl className={uiClass(s.detail)}>
          <div>
            <dt>{uiText.text_7ed97f2495a5}</dt>
            <dd>
              {current.periodStartsAtUtc && current.periodEndsAtUtc
                ? date(current.periodStartsAtUtc) +
                  uiText.text_7168a3799fbf +
                  date(current.periodEndsAtUtc)
                : uiText.text_c71eb9b208c8}
            </dd>
          </div>
          {current.scheduledPlanVersionId && (
            <div>
              <dt>{uiText.text_a92c3461295f}</dt>
              <dd>{uiText.text_82752778baed}</dd>
            </div>
          )}
        </dl>
        {current.hasPendingPayment && <p className={uiClass(s.hint)}>{uiText.text_8731cd667f6e}</p>}
      </section>
      <section className={uiClass(s.panel)}>
        <h2>{uiText.text_86a2d2d4def4}</h2>
        {current.quotas.length ? (
          <div className={uiClass(s.grid)}>
            {current.quotas.map((q) => (
              <div className={uiClass(s.quota)} key={q.key} data-exceeded={q.isOverQuota}>
                <h3>{quotaLabels[q.key]}</h3>
                <strong>
                  {uiText.text_9abd6e4940e3}
                  {quotaRemaining(q)}
                </strong>
                <p>
                  {uiText.text_2f1247d5894e}{' '}
                  {q.isUsageAvailable === true
                    ? q.consumed.toLocaleString('fa-IR') + ' ' + q.unit
                    : uiText.text_257b66a50f43}
                </p>
                {q.isOverQuota && <p>{uiText.text_e2229ea0cb31}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className={uiClass(s.hint)}>{uiText.text_5de725f5f494}</p>
        )}
        <p className={uiClass(s.meta)}>
          {uiText.text_dc39ddb24c12}
          {date(current.observedAtUtc, true)}
        </p>
      </section>
      <section className={uiClass(s.panel)}>
        <h2>{uiText.text_16d1d8fb88d8}</h2>
        {plans.isPending ? (
          <LoadingSkeleton />
        ) : plans.isError ? (
          <ErrorState error={plans.error} onRetry={() => void plans.refetch()} />
        ) : !plans.data.length ? (
          <EmptyState title={uiText.text_13877f13269f} />
        ) : (
          <>
            <label className={uiClass(s.field)}>
              {uiText.text_d9772fd00176}
              <NativeSelect
                value={selected}
                disabled={a.busy || orderUncertain}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setQuote(undefined);
                  setCommand(null);
                }}
              >
                <option value="">{uiText.text_c47e8cf0803f}</option>
                {plans.data
                  .filter((p) => p.audience === owner)
                  .map((p) => (
                    <option key={p.planVersionId} value={p.planVersionId}>
                      {p.displayName}
                      {uiText.text_588da4105320}
                      {p.priceToman.toLocaleString('fa-IR')} {p.displayCurrency}
                    </option>
                  ))}
              </NativeSelect>
            </label>
            <label className={uiClass(s.field)}>
              {uiText.text_a1dbc531a2cd}
              <NativeSelect
                value={purpose}
                disabled={a.busy || orderUncertain}
                onChange={(e) => {
                  setPurpose(e.target.value as S['CommercialOrderPurpose']);
                  setQuote(undefined);
                  setCommand(null);
                }}
              >
                <option value="Purchase">{uiText.text_06e54bf7afe6}</option>
                <option value="Renewal">{uiText.text_3225fab3cd96}</option>
                <option value="Upgrade">{uiText.text_a5ebe3e6fe5e}</option>
              </NativeSelect>
            </label>
            <Button
              disabled={a.busy || orderUncertain || !selected}
              onClick={async () => {
                const result = await a.run<S['CommercialQuoteDto']>(prefix + '/quote', {
                  planVersionId: selected,
                  clientOperationId: crypto.randomUUID(),
                  purpose,
                  subscriptionId: current.subscriptionId,
                });
                if (result) {
                  setQuote(result);
                  setNow(Date.now());
                  setCommand(null);
                }
              }}
            >
              {uiText.text_d2160f8eb18d}
            </Button>
            {quote && (
              <div className={uiClass(s.panel)}>
                {(quote.paymentAvailable !== true ||
                  quote.previewOnly !== false ||
                  quote.startsUponVerifiedPayment !== true) && (
                  <p role="status">{uiText.vnext.paymentUnavailable}</p>
                )}
                <strong className={uiClass(s.price)}>
                  {quote.priceToman.toLocaleString('fa-IR')} {quote.displayCurrency}
                </strong>
                <p className={uiClass(s.hint)}>
                  {uiText.text_bae7e088f1e1}{' '}
                  {quote.expiresAtUtc ? date(quote.expiresAtUtc, true) : uiText.text_2b1bf830baea}
                  {uiText.text_9ae95d6b5b73}
                </p>
                {Date.parse(quote.expiresAtUtc ?? '') <= now && (
                  <p role="status">{uiText.text_194fed9c2345}</p>
                )}
              </div>
            )}
            {current.subscriptionId && (
              <>
                <label className={uiClass(s.field)}>
                  {uiText.text_4097df6f7123}
                  <NativeInput value={reason} onChange={(e) => setReason(e.target.value)} />
                </label>
                <ConfirmAction
                  trigger={uiText.text_bca8396dc77f}
                  title={uiText.text_b15663c9902c}
                  description={uiText.text_353836470669}
                  disabled={orderUncertain || !selected || !reason.trim() || !current.version}
                  onConfirm={async () => {
                    await call(prefix + '/subscription/downgrade', {
                      method: 'POST',
                      body: JSON.stringify({
                        planVersionId: selected,
                        expectedVersion: current.version,
                        reason: reason.trim(),
                      }),
                    });
                    await summary.refetch();
                    return true;
                  }}
                />
              </>
            )}
          </>
        )}
        {(quote || command) && (
          <ConfirmAction
            trigger={command ? uiText.paymentCopy.retryOrder : uiText.text_6ff723ebc69c}
            title={uiText.text_cdc6409eb6a5}
            description={uiText.text_2a70b317c5f5}
            disabled={!restored || (!previewReady && !command)}
            confirm={uiText.text_0c2133fae476}
            onConfirm={createOrder}
          />
        )}
        {!!a.error && <ErrorState error={a.error} />}
      </section>
      {order && (
        <section className={uiClass(s.panel)} role="status">
          <h2>{uiText.text_ed47f8b6e65c}</h2>
          <p>
            {uiText.text_2b18443f7114}
            {label(order.status)}
            {uiText.text_5adab0015a6e}
            {label(order.fulfillmentState)}
          </p>
          <p className={uiClass(s.hint)}>{uiText.text_f22a3f010537}</p>
        </section>
      )}
      <Orders
        key={returnedOrderId ?? order?.orderId ?? 'history'}
        organization={organization}
        returnedOrderId={returnedOrderId ?? order?.orderId}
        returnedAttemptId={returnedAttemptId}
        paymentPlanId={previewReady ? quote?.planVersionId : undefined}
      />
    </V5Scene>
  );
}
function Orders({
  organization,
  returnedOrderId,
  returnedAttemptId,
  paymentPlanId,
}: {
  organization: boolean;
  returnedOrderId?: string;
  returnedAttemptId?: string;
  paymentPlanId?: string;
}) {
  const q = usePersonalApi<S['OrderListResult']>(
    '/api/v1/commerce/' + (organization ? '' : 'personal/') + 'orders?limit=20',
    {
      poll: 15000,
    },
  );
  const [selected, setSelected] = useState<string>();
  const selectedId = selected ?? returnedOrderId;
  return (
    <section className={uiClass(s.panel)}>
      <h2>{uiText.text_efb1be1f18cb}</h2>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.items.length ? (
        <ul className={uiClass(s.list)}>
          {q.data.items.map((o) => (
            <li key={o.orderId}>
              <strong>
                {label(o.status)}
                {uiText.text_588da4105320}
                {(o.priceToman ?? o.amount).toLocaleString('fa-IR')}{' '}
                {o.displayCurrency ?? o.currency}
              </strong>
              <p className={uiClass(s.meta)}>{date(o.createdAtUtc, true)}</p>
              <Button variant="outline" onClick={() => setSelected(o.orderId)}>
                {uiText.text_f0452fb92a5a}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={uiText.text_f53c7f5829aa} />
      )}
      {selectedId && (
        <OrderPayment
          key={selectedId}
          orderId={selectedId}
          organization={organization}
          paymentPlanId={paymentPlanId}
          returnedAttemptId={selectedId === returnedOrderId ? returnedAttemptId : undefined}
        />
      )}
    </section>
  );
}
