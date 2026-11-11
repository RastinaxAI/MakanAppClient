'use client';
import { createContext, type ReactNode } from 'react';
/** Native editor submit control, presented by the surrounding responsive scene. */
export const ConversationEditorAction = createContext<((action: ReactNode) => void) | null>(null);
