import type { components } from '@/generated/api/schema';
import { canonicalTime } from '@/lib/time-input';
type S = components['schemas'];
export type NotificationPreference = S['NotificationPreferenceItem'];
export function notificationPreferenceBody(
  values: NotificationPreference,
  version: string | null,
  preserveInactiveQuietHours = false,
) {
  const keepQuietValues = values.quietHoursEnabled || preserveInactiveQuietHours;
  return {
    pushEnabled: values.pushEnabled,
    smsEnabled: values.smsEnabled,
    quietHoursEnabled: values.quietHoursEnabled,
    quietHoursStartLocal: keepQuietValues ? canonicalTime(values.quietHoursStartLocal) : null,
    quietHoursEndLocal: keepQuietValues ? canonicalTime(values.quietHoursEndLocal) : null,
    timeZoneId: keepQuietValues ? values.timeZoneId : null,
    expectedRowVersion: version,
  } satisfies S['UpdateNotificationPreferenceCommand'];
}
export function acknowledgedPreference(
  result: NotificationPreference,
  original: NotificationPreference,
  body: S['UpdateNotificationPreferenceCommand'],
) {
  return (
    result.category === original.category &&
    result.organizationId === original.organizationId &&
    result.scope === original.scope &&
    (typeof result.rowVersion === 'string' || result.rowVersion === null) &&
    result.pushEnabled === body.pushEnabled &&
    result.smsEnabled === body.smsEnabled &&
    result.quietHoursEnabled === body.quietHoursEnabled &&
    result.quietHoursStartLocal === body.quietHoursStartLocal &&
    result.quietHoursEndLocal === body.quietHoursEndLocal &&
    result.timeZoneId === body.timeZoneId
  );
}
