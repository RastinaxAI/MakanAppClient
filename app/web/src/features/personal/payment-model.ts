import type { components } from '@/generated/api/schema';
import { clientValidator } from '@/lib/api/client-contract';
import { ApiError } from '@/lib/api/errors';

type S = components['schemas'];
const guid = clientValidator({ type: 'string', format: 'uuid' });
export const validPaymentId = (value: unknown): value is string => guid.safeParse(value).success;
export type PaymentIntent = { clientOperationId: string };
export const isPaymentIntent = (value: unknown): value is PaymentIntent | null =>
  value === null ||
  clientValidator({ $ref: '#/components/schemas/InitiatePaymentCommand' }).safeParse(value).success;
function parse<T>(schema: string, value: unknown): T {
  const result = clientValidator({ $ref: '#/components/schemas/' + schema }).safeParse(value);
  if (!result.success) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return result.data as T;
}
export function acceptOrder(value: unknown, orderId: string, organizationId: string | null) {
  const order = parse<S['OrderDto']>('OrderDto', value);
  if (order.orderId !== orderId || order.organizationId !== organizationId)
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return order;
}
export function acceptPayment(
  value: unknown,
  schema: 'PaymentAttemptDetailsDto' | 'VerifyPaymentResult' | 'InitiatePaymentResult',
  orderId: string,
  organizationId: string | null,
  attemptId?: string,
) {
  const result = parse<
    S['PaymentAttemptDetailsDto'] | S['VerifyPaymentResult'] | S['InitiatePaymentResult']
  >(schema, value);
  const order = acceptOrder(result.order, orderId, organizationId);
  const attempt = result.paymentAttempt;
  if (
    (attemptId && attempt.paymentAttemptId !== attemptId) ||
    attempt.amount !== order.amount ||
    attempt.currency !== order.currency ||
    !order.paymentAttempts.some(
      (a) =>
        a.paymentAttemptId === attempt.paymentAttemptId &&
        a.amount === attempt.amount &&
        a.currency === attempt.currency,
    ) ||
    ('status' in result &&
      ['Settled', 'AlreadySettled'].includes(result.status) &&
      (order.status !== 'Paid' || attempt.status !== 'Succeeded'))
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return result;
}
export function acceptReceipt(value: unknown, order: S['OrderDto'], userId: string) {
  const receipt = parse<S['PaymentReceiptDto']>('PaymentReceiptDto', value);
  if (
    order.status !== 'Paid' ||
    receipt.orderId !== order.orderId ||
    receipt.organizationId !== order.organizationId ||
    receipt.planVersionId !== order.planVersionId ||
    receipt.amount !== order.amount ||
    receipt.currency !== order.currency ||
    (!order.organizationId && receipt.purchaserUserId !== userId)
  )
    throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
  return receipt;
}
/** Only the server's registered Zibal redirect is navigable, after an explicit click.
 * Provider example: github.com/zibalco/zibal-wordpress-tourmaster. No callback invocation. */
export function paymentLink(attempt: S['PaymentAttemptDto']) {
  try {
    const url = new URL(attempt.paymentUrl ?? '');
    if (
      attempt.provider.toLowerCase() !== 'zibal' ||
      url.protocol !== 'https:' ||
      !['gateway.zibal.ir', 'gateway.zibal.io'].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/^[1-9][0-9]*$/.test(attempt.providerReference ?? '') ||
      url.pathname !== '/start/' + attempt.providerReference ||
      attempt.status !== 'PendingVerification'
    )
      return;
    return url.href;
  } catch {
    return;
  }
}
