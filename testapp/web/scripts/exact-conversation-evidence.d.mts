import type { BrowserContext } from '@playwright/test';

export function observeConversationRoles(context: BrowserContext): {
  role(
    conversationId: string,
    userId: string,
    revision: string,
  ): Promise<'Owner' | 'Admin' | 'Member' | undefined>;
  dispose(): void;
};
