import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import type { ApiRequestInit } from '@/lib/api/client';
type S = components['schemas'];
export type PushDevice = S['PushDeviceListItem'];
export type PushPage = S['PushDevicePageResult'];
export type PushAcknowledgment = S['PushDeviceRegistrationResult'];
export type WebPushBody = S['RegisterWebPushCommand'];
export type PushAssociation = {
  userId: string;
  fingerprint: string;
  registrationId?: string;
  createdAtUtc?: string;
  version: string | null;
  uncertain: boolean;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const digest = /^[0-9a-f]{64}$/;
const storagePrefix = 'makan:notification-registration:v1:';

/** This is local correlation metadata, never an ownership or permission grant. */
export function readPushAssociation(userId: string): PushAssociation | undefined {
  if (typeof window === 'undefined') return;
  try {
    const value = JSON.parse(localStorage.getItem(storagePrefix + userId) || 'null');
    if (
      !value ||
      value.userId !== userId ||
      !uuid.test(userId) ||
      !digest.test(value.fingerprint) ||
      typeof value.uncertain !== 'boolean' ||
      !(value.version === null || typeof value.version === 'string') ||
      !(value.registrationId === undefined || uuid.test(value.registrationId)) ||
      !(
        value.createdAtUtc === undefined ||
        (typeof value.createdAtUtc === 'string' && Number.isFinite(Date.parse(value.createdAtUtc)))
      ) ||
      (!value.uncertain && !value.registrationId)
    )
      return;
    return {
      userId: value.userId,
      fingerprint: value.fingerprint,
      registrationId: value.registrationId,
      createdAtUtc: value.createdAtUtc,
      version: value.version,
      uncertain: value.uncertain,
    };
  } catch {
    return;
  }
}
export function storePushAssociation(value: PushAssociation) {
  try {
    localStorage.setItem(storagePrefix + value.userId, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function webPushBody(subscription: PushSubscription): WebPushBody | undefined {
  try {
    const value = subscription.toJSON();
    const endpoint = subscription.endpoint,
      p256dh = value.keys?.p256dh,
      auth = value.keys?.auth;
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || !p256dh || !auth) return;
    return { endpoint, p256dh, auth, expectedVersion: null };
  } catch {
    return;
  }
}
export async function subscriptionFingerprint(body: WebPushBody) {
  const bytes = new TextEncoder().encode(JSON.stringify([body.endpoint, body.p256dh, body.auth]));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export function vapidApplicationKey(
  value: string | null | undefined,
): Uint8Array<ArrayBuffer> | undefined {
  if (!value || !/^[A-Za-z0-9_+/-]+={0,2}$/.test(value)) return;
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const raw = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    if (bytes.length !== 65 || bytes[0] !== 4) return;
    return bytes;
  } catch {
    return;
  }
}
export function sameApplicationKey(subscription: PushSubscription, key: Uint8Array) {
  const actual = subscription.options.applicationServerKey;
  if (!actual) return false;
  const stored = new Uint8Array(actual);
  return stored.length === key.length && stored.every((byte, index) => byte === key[index]);
}
export function acknowledgedWebPush(value: PushAcknowledgment) {
  return (
    !!value &&
    uuid.test(value.id) &&
    value.platform === 'Web' &&
    (value.version === undefined || value.version === null || typeof value.version === 'string') &&
    Number.isFinite(Date.parse(value.createdAtUtc)) &&
    Number.isFinite(Date.parse(value.lastSeenAtUtc))
  );
}
export function currentPushDevice(
  association: PushAssociation | undefined,
  fingerprint: string | undefined,
  rows: PushDevice[],
) {
  if (
    !association ||
    association.uncertain ||
    !fingerprint ||
    association.fingerprint !== fingerprint
  )
    return;
  return rows.find((row) => row.id === association.registrationId && row.platform === 'Web');
}
export function activePushDevice(row: PushDevice | undefined) {
  return !!row && row.isActive && row.revokedAtUtc === null;
}
export function validPushPage(result: PushPage, requestedPage: number) {
  return (
    result.page === requestedPage &&
    Number.isInteger(result.totalCount) &&
    result.totalCount >= 0 &&
    Number.isInteger(result.pageSize) &&
    result.pageSize > 0 &&
    result.items.length <= result.pageSize &&
    result.totalCount >= result.items.length &&
    (result.items.length > 0 || (requestedPage - 1) * result.pageSize >= result.totalCount) &&
    new Set(result.items.map((row) => row.id)).size === result.items.length &&
    result.items.every(
      (row) =>
        uuid.test(row.id) &&
        ['Web', 'Android', 'Ios'].includes(row.platform) &&
        Number.isFinite(Date.parse(row.createdAtUtc)) &&
        Number.isFinite(Date.parse(row.lastSeenAtUtc)) &&
        (row.revokedAtUtc === null || Number.isFinite(Date.parse(row.revokedAtUtc))) &&
        typeof row.isActive === 'boolean' &&
        typeof row.version === 'string',
    )
  );
}
export const pushDevicePath = '/api/v1/notifications/devices';
export function pushPagePath(page: number, includeRevoked = false) {
  return `${pushDevicePath}?page=${page}&pageSize=30&includeRevoked=${includeRevoked}`;
}
/** The self-scoped list has no endpoint lookup or snapshot token. Absence is inconclusive. */
export async function findPushDevice(
  read: (path: string, init?: ApiRequestInit) => Promise<unknown>,
  registrationId: string,
) {
  const seen = new Set<string>();
  for (let page = 1; page <= 100; page++) {
    const data = (await read(pushPagePath(page, true), { expectedStatus: 200 })) as PushPage;
    if (!validPushPage(data, page) || data.items.some((row) => seen.has(row.id)))
      throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
    const row = data.items.find((row) => row.id === registrationId);
    if (row) return row;
    data.items.forEach((row) => seen.add(row.id));
    if (!data.items.length || page * data.pageSize >= data.totalCount) return;
  }
  throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
}
export function samePushIdentity(a: PushDevice, b: PushDevice) {
  return (
    a.id === b.id &&
    a.platform === b.platform &&
    Date.parse(a.createdAtUtc) === Date.parse(b.createdAtUtc)
  );
}
