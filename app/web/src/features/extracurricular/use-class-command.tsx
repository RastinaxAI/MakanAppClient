'use client';
// Shared coordinator preserves the existing pending-intent storage contract.
import { useResourceCommand } from '@/features/personal/use-resource-command';
export function useClassCommand(scope: string) {
  return useResourceCommand(scope, 'account');
}
