'use client';
import { uiClass } from '@/components/v5/classes';
import Link from 'next/link';
import { aiIntegration as t } from '@/content/fa';
import { clientValidator } from '@/lib/api/client-contract';
import { isRecord } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { usePersonal } from '../provider';
import { citationSourceMatches } from './model';
import { v7Ui } from '@/content/fa';
type Citation = components['schemas']['KnowledgeCitation'];
function Strings({ value, title }: { value: unknown; title: string }) {
  const items = Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  return items.length ? (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.map((v, i) => (
          <li key={i} dir="auto">
            {v}
          </li>
        ))}
      </ul>
    </section>
  ) : null;
}
function Records({ value, title, schema }: { value: unknown; title: string; schema: string }) {
  const items = Array.isArray(value)
    ? value.flatMap((v) => {
        const p = clientValidator({ $ref: `#/components/schemas/${schema}` }).safeParse(v);
        return p.success && isRecord(p.data) ? [p.data] : [];
      })
    : [];
  return items.length ? (
    <section>
      <h3>{title}</h3>
      {items.map((v, i) => (
        <article className={uiClass('card')} key={i}>
          {typeof v.title === 'string' && <h4 dir="auto">{v.title}</h4>}
          {['description', 'reason', 'objective'].map((key) =>
            typeof v[key] === 'string' ? (
              <p key={key} dir="auto">
                {v[key] as string}
              </p>
            ) : null,
          )}
          {typeof v.estimatedMinutes === 'number' && (
            <p>
              {t.minutes}: {number(v.estimatedMinutes)}
            </p>
          )}
          <Strings title={t.steps} value={v.steps} />
        </article>
      ))}
    </section>
  ) : null;
}
export function AssistantCitation({ citation: c }: { citation: Citation }) {
  const [open, setOpen] = useState(false);
  const { session } = usePersonal();
  return (
    <li>
      <button type="button" className={uiClass('row')} onClick={() => setOpen(true)}>
        <span className={uiClass('tile-icon')}>
          <BookOpen size={22} />
        </span>
        <span className={uiClass('grow')}>
          <h4 dir="auto">{c.title}</h4>
          <p>
            {t.version} {number(c.version)}
            {c.sectionTitle && <> · {c.sectionTitle}</>}
            {c.pageStart !== null && (
              <>
                {' '}
                · {t.page} {number(c.pageStart)}
                {c.pageEnd !== null && c.pageEnd !== c.pageStart && <>–{number(c.pageEnd)}</>}
              </>
            )}
          </p>
        </span>
        <span className={uiClass('chev')}>
          <ChevronLeft size={18} />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={v7Ui.citationTitle}>
          {open && (
            <CitationSource
              key={session.user.id + ':' + session.revision + ':' + c.sourceId + ':' + c.version}
              citation={c}
            />
          )}
        </DialogContent>
      </Dialog>
    </li>
  );
}
function CitationSource({ citation }: { citation: Citation }) {
  const { call } = usePersonal();
  const [source, setSource] = useState<components['schemas']['EducationalSourceResult']>();
  const [error, setError] = useState<unknown>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setSource(undefined);
    setError(undefined);
    void call<components['schemas']['EducationalSourceResult']>(
      '/api/v1/sources/' + citation.sourceId,
      { signal: controller.signal },
    )
      .then((value) => {
        if (!controller.signal.aborted) setSource(value);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause);
      });
    return () => controller.abort();
  }, [call, citation.sourceId, retry]);
  if (error) return <ErrorState error={error} onRetry={() => setRetry((value) => value + 1)} />;
  if (!source) return <LoadingSkeleton />;
  if (!citationSourceMatches(citation, source))
    return (
      <p className={uiClass('alert warn')} role="status">
        {v7Ui.citationChanged}
      </p>
    );
  return (
    <div className={uiClass('v5-native-form')} data-citation-source>
      <h3 dir="auto">{source.title}</h3>
      <p className={uiClass('policy')}>
        {t.version} {number(citation.version)}
        {citation.pageStart !== null && (
          <>
            {' '}
            · {t.page} {number(citation.pageStart)}
            {citation.pageEnd !== null && citation.pageEnd !== citation.pageStart && (
              <>–{number(citation.pageEnd)}</>
            )}
          </>
        )}
        {citation.sectionTitle && <> · {citation.sectionTitle}</>}
      </p>
      {citation.quotePreview ? (
        <blockquote dir="auto">{citation.quotePreview}</blockquote>
      ) : (
        <p>{v7Ui.noQuotePreview}</p>
      )}
      <p className={uiClass('policy')}>{v7Ui.citationPrivacy}</p>
      <Button asChild>
        <Link href={'/personal/resources/' + citation.sourceId}>
          <BookOpen size={20} />
          {v7Ui.openSource}
        </Link>
      </Button>
    </div>
  );
}
export function AssistantResult({
  value,
  question,
  conversation = false,
}: {
  value: Record<string, unknown>;
  question?: string;
  conversation?: boolean;
}) {
  const citations = [
    ...(Array.isArray(value.citations) ? value.citations : []),
    ...(Array.isArray(value.claims)
      ? value.claims.flatMap((c) => (isRecord(c) && Array.isArray(c.citations) ? c.citations : []))
      : []),
    ...(Array.isArray(value.results)
      ? value.results.flatMap((r) => (isRecord(r) ? [r.citation] : []))
      : []),
  ].flatMap((v) => {
    const p = clientValidator({ $ref: '#/components/schemas/KnowledgeCitation' }).safeParse(v);
    return p.success ? [p.data as Citation] : [];
  });
  const unique = [
    ...new Map(citations.map((c) => [c.sourceId + ':' + c.version + ':' + c.chunkId, c])).values(),
  ];
  return (
    <section
      className={uiClass(conversation ? 'bubble v5-native-form' : 'v5-native-form')}
      aria-label={t.result}
      data-assistant-result
    >
      {conversation && <b className={uiClass('small accent')}>{t.result}</b>}
      {!conversation && (
        <div className={uiClass('card hero v4-hero')}>
          <h2 className={uiClass('v5-assistant-heading')} dir="auto">
            {question || t.result}
          </h2>
          <p>{t.reviewAnswer}</p>
        </div>
      )}
      {value.status === 'Empty' && <p role="status">{t.empty}</p>}
      {value.status === 'InsufficientEvidence' && <p role="status">{t.insufficient}</p>}
      {['summary', 'academicSummary', 'explanation', 'answer'].map((key) => {
        const v = value[key];
        const text =
          typeof v === 'string' ? v : isRecord(v) && typeof v.text === 'string' ? v.text : null;
        return text ? (
          <p className={uiClass('policy')} key={key} dir="auto" style={{ whiteSpace: 'pre-wrap' }}>
            {text}
          </p>
        ) : null;
      })}
      {Array.isArray(value.results) &&
        value.results.map((row, i) =>
          isRecord(row) && typeof row.text === 'string' ? (
            <p key={i} dir="auto">
              {row.text}
            </p>
          ) : null,
        )}
      {isRecord(value.progress) && typeof value.progress.description === 'string' && (
        <p dir="auto">{value.progress.description}</p>
      )}
      <Strings title={t.steps} value={value.steps ?? value.preparationSteps} />
      <Strings title={t.hints} value={value.hints} />
      <Strings title={t.priorities} value={value.priorities ?? value.priorityTopics} />
      <Records title={t.strengths} value={value.strengths} schema="AiInsight" />
      <Records title={t.risks} value={value.risks} schema="AiInsight" />
      <Records title={t.attention} value={value.attentionAreas} schema="AiAttentionArea" />
      <Records title={t.upcoming} value={value.upcomingItems} schema="AiUpcomingItem" />
      <Records title={t.planItems} value={value.planItems} schema="AiPlanItem" />
      <Records title={t.activities} value={value.activities} schema="AiTeachingActivity" />
      <Records title={t.recommendations} value={value.recommendations} schema="AiRecommendation" />
      {!!unique.length && (
        <section aria-label={t.sources}>
          <ul className={uiClass('list v5-assistant-citations')}>
            {unique.map((c) => (
              <AssistantCitation
                key={c.sourceId + ':' + c.version + ':' + c.chunkId}
                citation={c}
              />
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
