'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { useEffect, useRef, type ComponentProps } from 'react';
import { timeInput as t } from '@/content/fa';
import { latinDigits } from '@/lib/formatting';
import { canonicalTime, timeInputLabel, timeZoneLabel } from '@/lib/time-input';

export function TimeZoneInput({
  value,
  onValueChange,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
}) {
  return (
    <NativeInput
      {...props}
      type="text"
      dir="auto"
      value={timeZoneLabel(value)}
      onChange={(event) =>
        onValueChange(event.target.value === t.tehran ? 'Asia/Tehran' : event.target.value)
      }
    />
  );
}

/** A localized 24-hour control; browser validity still gates its enclosing form. */
export function TimeInput({
  value,
  onValueChange,
  className = '',
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  value: string | null | undefined;
  onValueChange: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.setCustomValidity(value && !canonicalTime(value) ? t.invalidTime : '');
  }, [value]);
  return (
    <NativeInput
      {...props}
      ref={input}
      type="text"
      inputMode="numeric"
      maxLength={5}
      className={uiClass(`v5-time-input ${className}`)}
      aria-description={t.timeFormatHint}
      value={timeInputLabel(value)}
      onChange={(event) => {
        let draft = latinDigits(event.currentTarget.value).trim();
        if (/^\d{3,4}$/.test(draft)) draft = draft.slice(0, 2) + ':' + draft.slice(2);
        const time = canonicalTime(draft);
        event.currentTarget.setCustomValidity(draft && !time ? t.invalidTime : '');
        onValueChange(time?.slice(0, 5) ?? draft);
      }}
    />
  );
}
