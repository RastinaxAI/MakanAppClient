'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useCallback, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { latinDigits, persianDigits } from '@/lib/formatting';
import s from './number-input.module.css';

/** A numeric draft keeps invalid input intact; the unit never becomes payload text. */
export function NumberInput({
  value,
  onValueChange,
  unit,
  decimal = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'onChange' | 'size'> & {
  value: string;
  onValueChange: (value: string) => void;
  unit?: string;
  decimal?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<{
    value: string;
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
  } | null>(null);
  const restoreSelection = useCallback(() => {
    const next = selection.current,
      element = input.current;
    if (
      !next ||
      !element ||
      document.activeElement !== element ||
      element.value !== persianDigits(next.value)
    )
      return;
    element.setSelectionRange(next.start, next.end, next.direction);
    selection.current = null;
  }, []);
  useLayoutEffect(() => {
    if (selection.current && selection.current.value !== value) selection.current = null;
    restoreSelection();
  }, [value, restoreSelection]);
  const control = (
    <NativeInput
      {...props}
      ref={input}
      className={uiClass(unit ? s.number : props.className)}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      data-v5-number-value={unit ? true : undefined}
      style={{ ...props.style, ...(unit ? { inlineSize: Math.max(1, value.length) + 'ch' } : {}) }}
      size={unit ? Math.max(1, value.length) : undefined}
      value={persianDigits(value)}
      onChange={(event) => {
        const element = event.currentTarget;
        const next = latinDigits(element.value).replace(/\u066b/g, '.');
        if (element.selectionStart !== null && element.selectionEnd !== null)
          selection.current = {
            value: next,
            start: element.selectionStart,
            end: element.selectionEnd,
            direction: element.selectionDirection ?? 'none',
          };
        onValueChange(next);
        // A same-value Latin/Persian replacement may not render again. Restore
        // after React's controlled-value update in that case as well.
        queueMicrotask(restoreSelection);
      }}
      onBlur={(event) => {
        selection.current = null;
        props.onBlur?.(event);
      }}
    />
  );
  if (!unit) return control;
  return (
    <div
      className={uiClass(s.control)}
      data-v5-number-input
      data-disabled={props.disabled || undefined}
      onClick={() => input.current?.focus()}
    >
      {control}
      <span aria-hidden="true">{unit}</span>
    </div>
  );
}
