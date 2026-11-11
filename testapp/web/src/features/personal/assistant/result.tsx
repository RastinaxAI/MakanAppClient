import { uiClass } from '@/components/v5/classes';
import Link from 'next/link';
import { aiIntegration as t } from '@/content/fa';
import { clientValidator } from '@/lib/api/client-contract';
import { isRecord } from '@/lib/api/errors';
import { number } from '@/lib/formatting';
import type { components } from '@/generated/api/schema';
import { BookOpen, ChevronLeft } from 'lucide-react';
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
  // This link performs a fresh source read; a citation never authorizes file access.
  return (
    <li>
      <Link className={uiClass('row')} href={`/personal/resources/${c.sourceId}`}>
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
      </Link>
      {c.quotePreview && <blockquote dir="auto">{c.quotePreview}</blockquote>}
    </li>
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
