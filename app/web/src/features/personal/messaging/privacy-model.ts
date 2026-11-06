import type { components } from '@/generated/api/schema';
type Settings = components['schemas']['MessagingPrivacySettingsResult'];

export function everyonePrivacyDraft(current: Settings): Settings {
  return {
    ...current,
    directMessagesAudience: 'Everyone',
    phoneNumberVisibilityAudience: 'Everyone',
    phoneNumberDiscoveryAudience: 'Everyone',
    groupInvitesAudience: 'Everyone',
    ...(current.onlineAudience === undefined ? {} : { onlineAudience: 'Everyone' }),
    ...(current.lastSeenAudience === undefined ? {} : { lastSeenAudience: 'Everyone' }),
  };
}

/** The draft is not the effective server policy until an explicit save succeeds. */
export function initialPrivacyDraft(current: Settings): Settings {
  return current.isExplicit ? { ...current } : everyonePrivacyDraft(current);
}
