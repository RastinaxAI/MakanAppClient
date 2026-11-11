'use client';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const SceneFormAction = createContext<((action: ReactNode) => void) | null>(null);
export const SceneMenuTools = createContext<((tools: ReactNode) => void) | null>(null);
export const SceneMenuClose = createContext<(() => void) | null>(null);
export const SceneFooter = createContext<HTMLElement | null>(null);
/** A workspace composer keeps its React state while occupying the native page footer. */
export function SceneFooterPortal({ children }: { children: ReactNode }) {
  const footer = useContext(SceneFooter);
  return footer ? createPortal(children, footer) : children;
}
export type SceneHeading = { title: string; subtitle?: string; tools?: ReactNode };
export const SceneHeader = createContext<((heading: SceneHeading | undefined) => void) | null>(
  null,
);

/** A loaded workspace publishes its actual title and controls into the single page header. */
export function useSceneHeader(heading: SceneHeading, enabled = true) {
  const publish = useContext(SceneHeader);
  useEffect(() => {
    if (!enabled || !publish) return;
    publish(heading);
    return () => publish(undefined);
  }, [publish, heading, enabled]);
  return enabled && !!publish;
}

/** Keep secondary controls reachable in the menu when a scene omits them from its body. */
export function useSceneMenuTools(tools: ReactNode, enabled = true) {
  const publish = useContext(SceneMenuTools);
  useEffect(() => {
    if (!enabled || !publish) return;
    publish(tools);
    return () => publish(undefined);
  }, [publish, tools, enabled]);
  return enabled && !!publish;
}
export type SceneSummary = { label: string; value: string }[];
export const SceneContextSummary = createContext<((rows: SceneSummary | undefined) => void) | null>(
  null,
);

/** Publish only visible, bound view data to the responsive context panel. */
export function useSceneContextSummary(rows: SceneSummary, enabled = true) {
  const publish = useContext(SceneContextSummary);
  const encoded = JSON.stringify(rows.filter((row) => row.value).slice(0, 4));
  useEffect(() => {
    if (!enabled || !publish) return;
    publish(JSON.parse(encoded) as SceneSummary);
    return () => publish(undefined);
  }, [publish, encoded, enabled]);
}

/** Present a native form's submit control in its surrounding responsive scene. */
export function useSceneFormAction(action: ReactNode, enabled = true) {
  const publish = useContext(SceneFormAction);
  useEffect(() => {
    if (!enabled || !publish) return;
    publish(action);
    return () => publish(undefined);
  }, [publish, action, enabled]);
  return enabled && !!publish;
}
