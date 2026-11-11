import { describe, expect, it } from 'vitest';
import {
  acceptOrder,
  acceptPayment,
  acceptReceipt,
  paymentLink,
} from '@/features/personal/payment-model';
import { clientOperationFor } from '@/lib/api/client-contract';
const id = '00000000-0000-4000-8000-000000009701',
  attemptId = '00000000-0000-4000-8000-000000009702',
  user = '00000000-0000-4000-8000-000000000199';
const attempt = {
  paymentAttemptId: attemptId,
  provider: 'Zibal',
  status: 'Unknown' as const,
  amount: 1000,
  currency: 'IRR',
  providerReference: '123456',
  paymentUrl: 'https://gateway.zibal.ir/start/123456',
  createdAtUtc: '2026-11-10T10:00:00Z',
  completedAtUtc: null,
};
const order = {
  orderId: id,
  organizationId: null,
  planVersionId: user,
  status: 'PendingPayment' as const,
  amount: 1000,
  currency: 'IRR',
  createdAtUtc: '2026-11-10T10:00:00Z',
  paidAtUtc: null,
  fulfillmentState: 'NotStarted' as const,
  paymentAttempts: [attempt],
};
describe('payment recovery boundaries', () => {
  it('exposes only authenticated recovery/receipts and never the provider callback', () => {
    for (const [method, path] of [
      ['GET', `/api/v1/commerce/payment-attempts/${attemptId}`],
      ['POST', `/api/v1/commerce/payment-attempts/${attemptId}/verify`],
      ['GET', `/api/v1/commerce/personal/orders/${id}/receipt`],
      ['GET', `/api/v1/commerce/orders/${id}/receipt`],
    ])
      expect(clientOperationFor(method, path)).toBeDefined();
    expect(
      clientOperationFor('GET', '/api/integrations/v1/commerce/payments/zibal/callback'),
    ).toBeUndefined();
  });
  it('rejects a valid schema with the wrong order, organization or payment amount', () => {
    expect(acceptOrder(order, id, null)).toEqual(order);
    expect(() => acceptOrder(order, user, null)).toThrow();
    expect(() => acceptOrder(order, id, user)).toThrow();
    const value = { order, paymentAttempt: attempt, history: [] };
    expect(
      acceptPayment(value, 'PaymentAttemptDetailsDto', id, null, attemptId).paymentAttempt.status,
    ).toBe('Unknown');
    expect(() =>
      acceptPayment(
        { ...value, paymentAttempt: { ...attempt, paymentAttemptId: user } },
        'PaymentAttemptDetailsDto',
        id,
        null,
        attemptId,
      ),
    ).toThrow();
    expect(() =>
      acceptPayment(
        { ...value, paymentAttempt: { ...attempt, amount: 999 } },
        'PaymentAttemptDetailsDto',
        id,
        null,
        attemptId,
      ),
    ).toThrow();
  });
  it('does not treat HTTP-200 Unknown or a contradictory Settled result as successful settlement', () => {
    expect(
      acceptPayment(
        { order, paymentAttempt: attempt, status: 'Unknown' },
        'VerifyPaymentResult',
        id,
        null,
        attemptId,
      ),
    ).toMatchObject({ status: 'Unknown', order: { status: 'PendingPayment' } });
    expect(() =>
      acceptPayment(
        { order, paymentAttempt: attempt, status: 'Settled' },
        'VerifyPaymentResult',
        id,
        null,
        attemptId,
      ),
    ).toThrow();
  });
  it('only accepts an authenticated paid receipt for the same owner, plan, amount and currency', () => {
    const paid = { ...order, status: 'Paid' as const, paidAtUtc: '2026-11-10T10:00:00Z' };
    const receipt = {
      orderId: id,
      purchaserUserId: user,
      organizationId: null,
      planVersionId: user,
      productTitle: null,
      amount: 1000,
      currency: 'IRR',
      paidAtUtc: paid.paidAtUtc,
      fulfillmentState: 'SubscriptionActivationPending',
      provider: 'Zibal',
      providerReference: '123456',
      settlementReference: '987654',
      providerPaidAtUtc: null,
      purpose: 'Purchase',
      billingAnchorUtc: null,
      billingPeriodIndex: 0,
    };
    expect(acceptReceipt(receipt, paid, user)).toMatchObject({
      fulfillmentState: 'SubscriptionActivationPending',
    });
    expect(() => acceptReceipt(receipt, order, user)).toThrow();
    for (const change of [
      { orderId: user },
      { purchaserUserId: id },
      { currency: 'USD' },
      { amount: 999 },
    ])
      expect(() => acceptReceipt({ ...receipt, ...change }, paid, user)).toThrow();
  });
  it('allows only the registered HTTPS gateway and the attempt exact reference', () => {
    const pending = { ...attempt, status: 'PendingVerification' as const };
    expect(paymentLink(pending)).toBe(attempt.paymentUrl);
    for (const url of [
      'javascript:alert(1)',
      'https://gateway.zibal.ir.attacker.test/start/123456',
      'https://gateway.zibal.ir/start/654321',
      'http://gateway.zibal.ir/start/123456',
      'https://user@gateway.zibal.ir/start/123456',
    ])
      expect(paymentLink({ ...pending, paymentUrl: url })).toBeUndefined();
    expect(paymentLink(attempt)).toBeUndefined();
  });
});
