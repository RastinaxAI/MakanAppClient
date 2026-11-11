// Declared local bank simulation for contract/UI tests. No provider network calls.
import { make, id, ids } from './state.mjs';
export function seedPayments(state, options = {}) {
  const attempt = make('PaymentAttemptDto', {
    paymentAttemptId: id(9702),
    provider: 'Zibal',
    status: options.status ?? 'Unknown',
    amount: 1000,
    currency: 'IRR',
    providerReference: '123456789',
    paymentUrl: 'https://gateway.zibal.ir/start/123456789',
    completedAtUtc: null,
  });
  const order = make('OrderDto', {
    orderId: id(9701),
    organizationId: options.organization ? ids.org : null,
    planVersionId: id(981),
    status: options.orderStatus ?? 'PendingPayment',
    amount: 1000,
    currency: 'IRR',
    priceToman: 100,
    displayCurrency: 'تومان',
    paidAtUtc: options.orderStatus === 'Paid' ? '2026-11-10T10:00:00Z' : null,
    fulfillmentState: options.fulfillment ?? 'NotStarted',
    paymentAttempts: options.noAttempt ? [] : [attempt],
  });
  state.payments = { options, order, attempt, operations: new Map(), lost: false };
  return { orderId: order.orderId, attemptId: attempt.paymentAttemptId };
}
export function paymentRoute({ state, url, req, body, auth, send }) {
  const p = url.pathname,
    r = state.payments;
  if (!r || !p.startsWith('/api/v1/commerce/')) return false;
  const allowed = r.options.organization
    ? auth.context.workspaceType === 'Organization' &&
      auth.context.organizationId === ids.org &&
      auth.context.activeRole === 'Manager'
    : auth.user.id === (r.options.userId ?? id(199));
  if (!allowed) return send({ code: 'AUTH_FORBIDDEN' }, 403);
  const orderBase = '/api/v1/commerce/' + (r.options.organization ? '' : 'personal/') + 'orders';
  if (p.endsWith('/catalog') && r.options.emptyCatalogAfterLost && r.createLost) return send([]);
  if (p === orderBase && req.method === 'GET')
    return send(
      make('OrderListResult', {
        items: [
          make('OrderListItemDto', {
            ...r.order,
            latestPaymentStatus: r.order.paymentAttempts.at(-1)?.status ?? null,
          }),
        ],
      }),
    );
  if (p === orderBase && req.method === 'POST') {
    const replayed = !!r.createLost;
    if (r.options.lostCreateAck && !r.createLost) {
      r.createLost = true;
      return send({ code: 'UPSTREAM_UNAVAILABLE' }, 503);
    }
    return send(make('CreateOrderResult', { order: r.order, replayed }));
  }
  if (p === orderBase + '/' + r.order.orderId) return send(r.order);
  if (p === orderBase + '/' + r.order.orderId + '/payments' && req.method === 'POST') {
    if (!r.operations.has(body.clientOperationId)) {
      r.attempt.status = 'PendingVerification';
      r.order.paymentAttempts = [r.attempt];
      r.operations.set(
        body.clientOperationId,
        make('InitiatePaymentResult', {
          order: r.order,
          paymentAttempt: r.attempt,
          replayed: false,
        }),
      );
    }
    if (r.options.lostInitAck && !r.lost) {
      r.lost = true;
      return send({ code: 'UPSTREAM_UNAVAILABLE' }, 503);
    }
    return send(r.operations.get(body.clientOperationId));
  }
  const attemptBase = '/api/v1/commerce/payment-attempts/' + r.attempt.paymentAttemptId;
  if (p === attemptBase)
    return send(
      make('PaymentAttemptDetailsDto', {
        order: r.order,
        paymentAttempt: r.options.foreignAttempt
          ? { ...r.attempt, paymentAttemptId: id(9799) }
          : r.attempt,
        history: [],
      }),
    );
  if (p === attemptBase + '/verify' && req.method === 'POST') {
    const status = r.options.outcome ?? 'Unknown';
    if (['Settled', 'AlreadySettled'].includes(status)) {
      r.order.status = 'Paid';
      r.order.paidAtUtc = '2026-11-10T10:00:00Z';
      r.order.fulfillmentState = r.options.fulfillment ?? 'SubscriptionActivationPending';
      r.attempt.status = 'Succeeded';
      r.attempt.settlementReference = '987654321';
    } else if (status === 'Failed') r.attempt.status = 'Failed';
    return send(make('VerifyPaymentResult', { status, order: r.order, paymentAttempt: r.attempt }));
  }
  if (p === orderBase + '/' + r.order.orderId + '/receipt') {
    if (r.order.status !== 'Paid') return send({ code: 'ORDER_NOT_PAID' }, 409);
    return send(
      make('PaymentReceiptDto', {
        orderId: r.options.foreignReceipt ? id(9798) : r.order.orderId,
        purchaserUserId: r.options.userId ?? id(199),
        organizationId: r.order.organizationId,
        planVersionId: r.order.planVersionId,
        amount: r.order.amount,
        currency: r.order.currency,
        paidAtUtc: r.order.paidAtUtc,
        fulfillmentState: r.order.fulfillmentState,
        provider: 'Zibal',
        providerReference: r.attempt.providerReference,
        settlementReference: '987654321',
      }),
    );
  }
  if (p.includes('/orders/') || p.startsWith('/api/v1/commerce/payment-attempts/'))
    return send({ code: 'ORDER_NOT_FOUND' }, 404);
  return false;
}
