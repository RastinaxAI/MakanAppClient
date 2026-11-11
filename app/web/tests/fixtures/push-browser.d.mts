import type { BrowserContext } from '@playwright/test';
export function mockPushBrowser(
  context: BrowserContext,
  options?: {
    permission?: NotificationPermission;
    nextPermission?: NotificationPermission;
    deferPermission?: boolean;
    unsupported?: boolean;
  },
): Promise<void>;
