import { latinDigits } from './formatting';
import { timeInput as labels } from '@/content/fa';

export function timeZoneLabel(value: string | null | undefined): string {
  return value === 'Asia/Tehran' ? labels.tehran : value || '';
}

/** Keep an existing seconds value; minute edits default to zero seconds. */
export function canonicalTime(value: string | null | undefined): string | null {
  const parts = latinDigits(value || '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!parts || +parts[1] > 23 || +parts[2] > 59 || +(parts[3] || '0') > 59) return null;
  return parts[1].padStart(2, '0') + ':' + parts[2] + ':' + (parts[3] || '00');
}

export function timeInputLabel(value: string | null | undefined): string {
  const text = canonicalTime(value)?.slice(0, 5) ?? (value || '');
  return latinDigits(text).replace(/\d/g, (digit) => String.fromCharCode(0x6f0 + Number(digit)));
}
