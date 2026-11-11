/** Keep evidence from different source builds in different directories. */
export function reviewPath(value: string) {
  const run = process.env.MAKAN_REVIEW_RUN;
  if (!run) return value;
  if (!/^[a-z0-9_-]{1,64}$/.test(run)) throw new Error('Invalid review run name');
  if (!value.startsWith('output/review/')) throw new Error('Unexpected review evidence path');
  return 'output/review/' + run + '/' + value.slice('output/review/'.length);
}
