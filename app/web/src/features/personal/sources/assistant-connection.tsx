'use client';
import { useEffect, useRef, useState } from 'react';
import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { usePersonal } from '../provider';
import { preflightMessage } from './model';
import { SourceCatalog } from './catalog';
type Selected = { id: string; title: string };
/** The sources tab owns selection; the chat consumes the same server-authorized catalog. */
export function AssistantSourceConnection({
  initialSelected = [],
  initialItems = [],
  onSelectionChange,
  disabled = false,
}: {
  initialSelected?: string[];
  initialItems?: Selected[];
  onSelectionChange?: (items: Selected[]) => void;
  disabled?: boolean;
} = {}) {
  const { call } = usePersonal();
  const [selected, setSelected] = useState<Selected[]>(() =>
    initialSelected.map(
      (id) =>
        initialItems.find((item) => item.id === id) ?? { id, title: uiText.text_2a1922f9e184 },
    ),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [result, setResult] = useState<components['schemas']['AiSourcePreflightResult']>();
  const lock = useRef(false),
    callback = useRef(onSelectionChange);
  callback.current = onSelectionChange;
  useEffect(() => callback.current?.(selected), [selected]);
  async function check() {
    if (disabled || lock.current || !selected.length) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setResult(undefined);
    try {
      setResult(
        await call<components['schemas']['AiSourcePreflightResult']>(
          '/api/v1/ai/sources/preflight',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'Chat',
              selectedSourceIds: selected.map((item) => item.id),
            }),
          },
        ),
      );
    } catch (cause) {
      setError(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="stack"
      aria-label={uiText.text_a5a599a4d5ad}
      data-assistant-source-selection
    >
      <SourceCatalog
        embedded
        selection={{
          items: selected,
          disabled: disabled || busy,
          onChange: (next) => {
            setSelected(next);
            setResult(undefined);
          },
        }}
      />
      <p aria-live="polite">{uiText.v7Ui.sourceCount(selected.length)}</p>
      <Button disabled={disabled || busy || !selected.length} onClick={() => void check()}>
        {busy ? uiText.text_25384e522776 : uiText.text_5cb53aa67331}
      </Button>
      {result && <p role="status">{preflightMessage(result)}</p>}
      {!!error && <ErrorState error={error} />}
    </section>
  );
}
