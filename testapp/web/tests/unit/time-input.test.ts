import { describe, expect, it } from 'vitest';
import { canonicalTime, timeInputLabel } from '@/lib/time-input';

describe('localized time values at the existing API boundary', () => {
  it('accepts Persian, Arabic and Latin digits without changing the clock time', () => {
    for (const value of ['۲۲:۰۰', '٢٢:٠٠', '22:00']) expect(canonicalTime(value)).toBe('22:00:00');
  });
  it('keeps midnight, the end of the day and existing seconds', () => {
    expect(canonicalTime('0:00')).toBe('00:00:00');
    expect(canonicalTime('23:59')).toBe('23:59:00');
    expect(canonicalTime('08:12:34')).toBe('08:12:34');
  });
  it('rejects incomplete or out-of-range values before a request is created', () => {
    for (const value of ['', '22:', '24:00', '23:60', '08:12:60', '-1:00', '10:00 PM'])
      expect(canonicalTime(value)).toBeNull();
  });
  it('shows Persian 24-hour text while retaining an unfinished draft', () => {
    expect(timeInputLabel('22:00:00')).toBe('۲۲:۰۰');
    expect(timeInputLabel('08:00')).toBe('۰۸:۰۰');
    expect(timeInputLabel('2')).toBe('۲');
  });
});
