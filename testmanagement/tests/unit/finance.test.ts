import { describe, expect, it } from 'vitest';
import { operationFor, validator, contract } from '@/lib/api/contract';
import { hasVerifiedPermission } from '@/lib/permissions';
import bindings from '../../contracts/platform-permissions.json';

const id = '00000000-0000-4000-8000-000000000001';
const attempt = {
  paymentAttemptId: id,
  provider: 'Zibal',
  status: 'Succeeded',
  amount: 250000,
  currency: 'Irr',
  maskedProviderReference: '***track-1234',
  maskedSettlementReference: '***ref-9876',
  createdAtUtc: '2026-11-10T10:00:00Z',
  verifiedAtUtc: '2026-11-10T10:02:00Z',
  completedAtUtc: '2026-11-10T10:02:00Z',
  callbackReceivedAtUtc: '2026-11-10T10:01:00',
  failureCode: null,
};
const payment = {
  paymentId: id,
  paymentAttemptId: id,
  provider: 'Zibal',
  maskedProviderReference: '***track-1234',
  maskedSettlementReference: '***ref-9876',
  amount: 250000,
  currency: 'Irr',
  paidAtUtc: '2026-11-10T10:02:00Z',
  providerPaidAtUtc: '2026-11-10T10:01:30',
};
const order = {
  orderId: id,
  purchaserUserId: id,
  organization: null,
  planVersionId: id,
  status: 'Paid',
  fulfillmentState: 'SubscriptionActivationPending',
  amount: 250000,
  currency: 'Irr',
  createdAtUtc: '2026-11-10T10:00:00Z',
  paidAtUtc: '2026-11-10T10:02:00Z',
  cancelledAtUtc: null,
  paymentAttempts: [attempt],
  payment,
};

describe('e5bd3ea platform finance contract', () => {
  it('preserves distinct masked references and callback/provider timestamps without exposing raw fields', () => {
    const parsed = validator({ $ref: '#/components/schemas/PlatformOrderItem' }).parse({
      ...order,
      payment: {
        ...payment,
        providerReference: 'RAW_TRACK_SECRET',
        settlementReference: 'RAW_REF_SECRET',
        merchant: 'MERCHANT_SECRET',
      },
      paymentAttempts: [
        {
          ...attempt,
          providerResponse: 'RAW_PROVIDER_BODY',
          redirectUrl: 'https://private.example/payment?token=SECRET',
          settlementReference: 'RAW_REF_SECRET',
        },
      ],
    });
    expect(parsed).toMatchObject({
      fulfillmentState: 'SubscriptionActivationPending',
      payment: {
        maskedSettlementReference: '***ref-9876',
        providerPaidAtUtc: '2026-11-10T10:01:30Z',
      },
      paymentAttempts: [
        { maskedProviderReference: '***track-1234', callbackReceivedAtUtc: '2026-11-10T10:01:00Z' },
      ],
    });
    expect(JSON.stringify(parsed)).not.toMatch(/RAW_|MERCHANT_SECRET|PRIVATE|redirectUrl/);
  });

  it('keeps missing fulfillment and nullable settlement metadata distinct from a completed subscription', () => {
    const { fulfillmentState: _, ...olderOrder } = order;
    const parsed = validator({ $ref: '#/components/schemas/PlatformOrderItem' }).parse({
      ...olderOrder,
      payment: { ...payment, maskedSettlementReference: null, providerPaidAtUtc: null },
      paymentAttempts: [
        { ...attempt, maskedSettlementReference: null, callbackReceivedAtUtc: null },
      ],
    });
    expect(parsed).not.toHaveProperty('fulfillmentState');
    expect(parsed).toMatchObject({
      payment: { maskedSettlementReference: null, providerPaidAtUtc: null },
      paymentAttempts: [{ maskedSettlementReference: null, callbackReceivedAtUtc: null }],
    });
    expect(
      validator({ $ref: '#/components/schemas/PlatformOrderItem' }).safeParse({
        ...order,
        fulfillmentState: 'InventedSuccess',
      }).success,
    ).toBe(false);
  });

  it('requires independent finance read permission and provides no manual success, refund or reconcile capability', () => {
    const read = 'GET /api/admin/v1/finance/orders';
    expect(
      hasVerifiedPermission(bindings, ['platform.access', 'platform.finance.manage'], read),
    ).toBe(false);
    expect(hasVerifiedPermission(bindings, ['platform.finance.read'], read)).toBe(true);
    for (const suffix of ['mark-paid', 'refund', 'reconcile', 'verify'])
      expect(operationFor('POST', `/api/admin/v1/finance/orders/${id}/${suffix}`)).toBeUndefined();
    expect(
      contract.operations
        .filter((operation) => operation.path.includes('/finance/'))
        .every((operation) => operation.method === 'GET'),
    ).toBe(true);
  });

  it('keeps private receipt, payment recovery and public callback endpoints outside the owner BFF', () => {
    for (const path of [
      `/api/v1/commerce/orders/${id}/receipt`,
      `/api/v1/commerce/personal/orders/${id}/receipt`,
      `/api/v1/commerce/payment-attempts/${id}`,
      `/api/v1/commerce/payment-attempts/${id}/verify`,
      '/api/integrations/v1/commerce/payments/zibal/callback',
    ])
      for (const method of ['GET', 'POST', 'PUT', 'DELETE'])
        expect(operationFor(method, path)).toBeUndefined();
    for (const schema of ['PaymentReceiptDto', 'PaymentAttemptDetailsDto', 'VerifyPaymentResult'])
      expect(contract.schemas).not.toHaveProperty(schema);
  });
});
