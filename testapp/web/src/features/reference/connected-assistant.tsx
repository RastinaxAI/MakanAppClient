'use client';
import { Textarea as NativeTextarea, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import appearance from './assistant.module.css';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  FileText,
  AlignLeft,
  Lightbulb,
  ChevronLeft,
  ArrowUp,
  RotateCcw,
  LoaderCircle,
  Wallet,
  Bot,
  CalendarDays,
  Plus,
  Library,
} from 'lucide-react';
import { AssistantSourceConnection } from '@/features/personal/sources/assistant-connection';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { aiIntegration as t } from '@/content/fa';
import { AssistantPayer } from '@/features/personal/assistant/payer';
import { AssistantResult } from '@/features/personal/assistant/result';
import { AssistantBusinessTools } from '@/features/personal/assistant/business-tools';
import { useAssistantRequest } from '@/features/personal/assistant/use-assistant-request';
import { checkAssistantQuota } from '@/features/personal/assistant/preflight';
import { sourceVersions, validGuid, type AiPayer } from '@/features/personal/assistant/model';
import { usePersonal, usePersonalApi } from '@/features/personal/provider';
import { useWorkspaceSnapshot } from '@/features/personal/workspaces';
import { sourceAiSelectable } from '@/features/personal/sources/model';
import { useViewState } from '@/components/hooks/use-view-state';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import { V5Scene } from '@/components/v5/scene';
import { SceneFooterPortal } from '@/components/v5/form-actions';

function SelectedSource({
  source,
  index,
  count,
}: {
  source: { id: string; title: string };
  index: number;
  count: number;
}) {
  const query = usePersonalApi<components['schemas']['EducationalSourceResult']>(
    '/api/v1/sources/' + source.id,
  );
  const current =
    query.data?.sourceId === source.id && query.data.capabilities.canRead ? query.data : undefined;
  const ready = !query.isError && !!current && sourceAiSelectable(current);
  return (
    <div className={uiClass('flex')}>
      <FileText size={22} />
      <div className={uiClass('grow')}>
        <b className={uiClass('small')}>{current?.title ?? source.title}</b>
        <div className={uiClass('tiny muted')}>
          {ready
            ? count === 1
              ? uiText.text_678fb3f35784
              : uiText.text_c17f0b65eb98
            : uiText.text_df889c883c4e}
        </div>
      </div>
      <span className={uiClass('badge')}>{(index + 1).toLocaleString('fa-IR')}</span>
    </div>
  );
}

export function ReferenceAssistant() {
  const { session, call } = usePersonal(),
    [picker, setPicker] = useState(false),
    [tools, setTools] = useState(false),
    [options, setOptions] = useState(false),
    [waitingQuestion, setWaitingQuestion] = useState<string | null>(null),
    [stage, setStage] = useState<'home' | 'answer' | 'error'>('home'),
    [answeredQuestion, setAnsweredQuestion] = useState(''),
    [payer, setPayer] = useState<AiPayer | ''>(''),
    [mode, setMode] = useState<'answer' | 'retrieve'>('answer'),
    [conversationId, setConversation] = useState<string | null>(null);
  const request = useAssistantRequest('conversation');
  const selectedPayer = request.pending?.payer ?? payer;
  const spaces = useWorkspaceSnapshot();
  const contextName =
    selectedPayer === 'Organization' && session.context.workspaceType === 'Organization'
      ? spaces.data?.workspaces.find(
          (space) =>
            space.organizationId === session.context.organizationId &&
            space.membershipId === session.context.membershipId &&
            space.role === session.context.activeRole,
        )?.organizationName || uiText.navigation_education
      : uiText.text_d034f3bcfe7f;
  const quotaRefused =
    request.error instanceof ApiError &&
    ['AI_QUOTA_NOT_AVAILABLE', 'SUBSCRIPTION_INACTIVE', 'QUOTA_EXCEEDED'].includes(
      request.error.problem.code ?? '',
    );
  const blocked = request.busy || !!request.pending;
  const scroll = useRef<HTMLDivElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const previousStage = useRef(stage);
  useEffect(() => {
    if (previousStage.current !== stage) heading.current?.focus({ preventScroll: true });
    previousStage.current = stage;
  }, [stage]);
  useScrollMemory(scroll, 'MK-38');
  const memory = 'makan:draft:view:' + session.user.id + ':' + session.revision + ':assistant:';
  const [sources, setSources] = useViewState<{ id: string; title: string }[]>(
    memory + 'sources',
    [],
    (v): v is { id: string; title: string }[] =>
      Array.isArray(v) &&
      v.every(
        (x) =>
          x &&
          typeof x.id === 'string' &&
          typeof x.title === 'string' &&
          /^[0-9a-f-]{36}$/i.test(x.id),
      ),
  );
  const [draft, setDraft] = useViewState(
      memory + 'question',
      '',
      (v): v is string => typeof v === 'string' && v.length <= 20000,
    ),
    [notice, setNotice] = useState('');
  const editQuestion = () => {
    request.reset();
    setStage('home');
  };
  const editAction = request.pending ? (
    <ConfirmAction
      title={t.newRequest}
      trigger={t.editQuestion}
      description={t.changeRequest}
      onConfirm={async () => {
        editQuestion();
        return true;
      }}
    />
  ) : (
    <Button variant="outline" onClick={editQuestion}>
      {t.editQuestion}
    </Button>
  );
  async function send(question = draft) {
    if (!request.pending && !question.trim()) {
      setNotice(uiText.text_1a92b2d7cdb7);
      return;
    }
    if (!request.pending) setDraft(question);
    if (!request.pending && !payer) {
      setWaitingQuestion(question);
      setOptions(true);
      return;
    }
    const result = await request.run(async (signal) => {
      if (!payer) throw new ApiError(400, { code: 'AI_PAYER_SELECTION_REQUIRED' });
      if (sources.length) {
        const preflight = await call<components['schemas']['AiSourcePreflightResult']>(
          '/api/v1/ai/sources/preflight',
          {
            method: 'POST',
            signal,
            expectedStatus: 200,
            body: JSON.stringify({
              operation: 'Chat',
              selectedSourceIds: sources.map((source) => source.id),
            }),
          },
        );
        const versions = sourceVersions(
          preflight,
          sources.map((source) => source.id),
        );
        if (mode === 'answer') await checkAssistantQuota(call, session, payer, signal);
        const operationId = crypto.randomUUID();
        return {
          path:
            mode === 'answer' ? '/api/v1/ai/knowledge/rag/answer' : '/api/v1/ai/knowledge/retrieve',
          operationId,
          payer,
          sources: versions,
          body: {
            clientOperationId: operationId,
            query: question.trim(),
            sources: versions,
            maxResults: 8,
            includeQuotePreview: true,
            language: 'fa',
            payer,
          },
        };
      }
      await checkAssistantQuota(call, session, payer, signal);
      const operationId = crypto.randomUUID();
      return {
        path: '/api/v1/ai/chat',
        operationId,
        payer,
        body: { message: question.trim(), conversationId, operationId },
      };
    });
    if (result) {
      setAnsweredQuestion(question.trim());
      setStage('answer');
      setDraft('');
      if ('conversationId' in result)
        setConversation(validGuid(result.conversationId) ? result.conversationId : null);
    } else setStage('error');
  }
  const body = (
    <div className={uiClass('v5-assistant-body ' + appearance.body)} ref={scroll}>
      {stage === 'home' && (
        <section className={appearance.hero}>
          <span className={appearance.mark}>
            <Bot size={32} />
          </span>
          <div className={uiClass('grow')}>
            <h2>{uiText.v5Product.assistantStart}</h2>
            <p>{uiText.v5Product.assistantIntro}</p>
          </div>
        </section>
      )}
      {stage === 'answer' ? (
        <section className={uiClass('card') + ' ' + appearance.sourcePanel}>
          <h3>{uiText.v5Product.assistantAnswerContext}</h3>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.aiIntegration.context}</span>
            <b className={uiClass('val')}>{contextName}</b>
          </div>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.text_9d0fb0d433db}</span>
            <b className={uiClass('val')}>
              {sources.length
                ? sources.map((s) => s.title).join(uiText.v5Product.listSeparator)
                : uiText.text_9cd73d4302b4}
            </b>
          </div>
        </section>
      ) : (
        <section className={uiClass('card') + ' ' + appearance.sourcePanel}>
          <h3>{uiText.text_9d0fb0d433db}</h3>
          {sources.length ? (
            <div className={uiClass('stack v5-assistant-sources')}>
              {sources.map((source, index) => (
                <SelectedSource
                  key={source.id}
                  source={source}
                  index={index}
                  count={sources.length}
                />
              ))}
            </div>
          ) : (
            <p>{uiText.text_9cd73d4302b4}</p>
          )}
          <Button
            variant="outline"
            className={appearance.sourceAction}
            disabled={blocked}
            onClick={() => setPicker(true)}
          >
            <Library size={20} />
            {uiText.text_e1174ae8f3c8}
          </Button>
        </section>
      )}
      {stage === 'answer' && request.result && (
        <>
          <div className={uiClass('bubble mine')}>
            <p className={uiClass('message')} dir="auto">
              {answeredQuestion}
            </p>
          </div>
          <AssistantResult value={request.result} question={answeredQuestion} conversation />
        </>
      )}
      {stage === 'home' && (
        <>
          <h3>{uiText.text_10d22840ab00}</h3>
          <div className={uiClass('list')}>
            {[
              {
                title: uiText.text_bdf39bdb81b6,
                detail: uiText.text_e9c385cbd890,
                icon: AlignLeft,
                needsSource: true,
              },
              {
                title: uiText.text_2cd3e89872c5,
                detail: uiText.text_f8031fc55c47,
                icon: Lightbulb,
                needsSource: true,
              },
              {
                title: uiText.text_f601ed0900bc,
                detail: uiText.text_a9598b86b1bf,
                icon: CalendarDays,
                needsSource: false,
              },
            ].map((item) => (
              <button
                className={uiClass('row')}
                disabled={blocked}
                key={item.title}
                onClick={() => {
                  if (item.needsSource && !sources.length) {
                    setDraft(item.title);
                    setPicker(true);
                  } else void send(item.title);
                }}
              >
                <span className={uiClass('tile-icon')}>
                  <item.icon size={22} />
                </span>
                <span className={uiClass('grow')}>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                </span>
                <span className={uiClass('chev')}>
                  <ChevronLeft size={18} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {request.busy && <p role="status">{t.sending}</p>}
      {request.waiting && <p role="status">{t.wait}</p>}
      {request.pending && !request.busy && (
        <>
          <p role="status">{t.uncertain}</p>
          <Button disabled={request.waiting} onClick={() => void send()}>
            {t.retry}
          </Button>
          {editAction}
        </>
      )}
      <SceneFooterPortal>
        <form
          className={appearance.composer}
          data-ui="composer"
          aria-busy={request.busy}
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={uiText.serverAlignedUi.addSource}
            disabled={blocked}
            onClick={() => setPicker(true)}
          >
            <Plus size={22} />
          </Button>
          <NativeTextarea
            rows={1}
            className={appearance.composeInput}
            aria-label={uiText.text_c3fd8e948061}
            value={draft}
            disabled={blocked || !request.restored}
            maxLength={sources.length ? 4000 : 20000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={uiText.text_70c689cb669f}
          />
          <Button
            size="icon"
            variant="default"
            className={appearance.send}
            type="submit"
            disabled={blocked || !request.restored || request.waiting}
            aria-busy={request.busy}
            aria-label={uiText.text_a3dd80a69e93}
          >
            {request.busy ? (
              <LoaderCircle size={22} className={uiClass('spinner')} />
            ) : (
              <ArrowUp size={22} />
            )}
          </Button>
        </form>
      </SceneFooterPortal>
      <p className={uiClass('tagline')}>{uiText.text_26c05e2e974e}</p>
    </div>
  );
  return (
    <>
      <V5Scene
        headingRef={heading}
        moreButtonRef={moreButton}
        id={
          stage === 'answer'
            ? 'MK-374'
            : stage === 'error'
              ? quotaRefused
                ? 'MK-375'
                : 'MK-376'
              : 'MK-38'
        }
        title={
          stage === 'error'
            ? quotaRefused
              ? uiText.text_229a5c2080a0
              : t.unavailableTitle
            : stage === 'answer'
              ? uiText.v5Product.assistantConversationTitle
              : uiText.navigation_assistant
        }
        subtitle={uiText.text_e3ca4bcedb43}
        back="/personal"
        onBack={stage !== 'home' ? () => setStage('home') : undefined}
        backWithinPage={stage !== 'home'}
        actions={
          stage === 'error' ? (
            <Button disabled={request.busy || request.waiting} onClick={() => void send()}>
              {t.retry}
            </Button>
          ) : undefined
        }
        kind={stage === 'home' ? 'list' : stage === 'answer' ? 'chat' : undefined}
        deep={stage === 'home' ? false : true}
        restricted={stage === 'error' && !quotaRefused}
        footerSlot={stage !== 'error'}
        onMore={() => {
          if (!request.busy) {
            setWaitingQuestion(null);
            setOptions(true);
          }
        }}
        summary={[
          { label: uiText.text_bdf39bdb81b6, value: uiText.text_e9c385cbd890 },
          { label: uiText.text_2cd3e89872c5, value: uiText.text_f8031fc55c47 },
          { label: uiText.text_f601ed0900bc, value: uiText.text_a9598b86b1bf },
        ]}
      >
        {stage === 'error' ? (
          <div className={uiClass('v5-native-form')}>
            {!!request.error && (
              <div className={uiClass('alert warn')} role="alert">
                {quotaRefused ? <Wallet size={22} /> : <RotateCcw size={22} />}
                <div>
                  {request.error instanceof Error ? request.error.message : t.serviceUnavailable}
                </div>
              </div>
            )}
            {quotaRefused && (
              <div className={uiClass('card v4-meta')}>
                <div className={uiClass('kv')}>
                  <span className={uiClass('key')}>{t.payer}</span>
                  <span className={uiClass('val')}>
                    {selectedPayer ? t.payers[selectedPayer] : t.choosePayer}
                  </span>
                </div>
                <div className={uiClass('kv')}>
                  <span className={uiClass('key')}>{t.question}</span>
                  <span className={uiClass('val')}>{t.savedQuestion}</span>
                </div>
              </div>
            )}
            {request.pending && <p className={uiClass('policy')}>{t.uncertain}</p>}
            {request.waiting && <p role="status">{t.wait}</p>}
            {editAction}
            {quotaRefused &&
              (selectedPayer !== 'Organization' || session.context.activeRole === 'Manager') && (
                <Link
                  className={uiClass('text-action')}
                  href={
                    selectedPayer === 'Organization'
                      ? '/personal/subscription?scope=organization'
                      : '/personal/subscription'
                  }
                >
                  {t.credit}
                </Link>
              )}
          </div>
        ) : (
          body
        )}
      </V5Scene>
      <Dialog open={options} onOpenChange={setOptions}>
        <DialogContent title={uiText.aiIntegration.context}>
          <div className={uiClass('v5-native-form')}>
            {waitingQuestion !== null && <p role="alert">{t.payerRequired}</p>}
            <AssistantPayer
              value={request.pending?.payer ?? payer}
              onChange={setPayer}
              disabled={blocked}
              checkQuota={!request.pending && (mode === 'answer' || !sources.length)}
            />
            {!!sources.length && (
              <label className={uiClass('field')}>
                {t.mode}
                <NativeSelect
                  aria-label={t.mode}
                  disabled={blocked}
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'answer' | 'retrieve')}
                >
                  <option value="answer">{t.answer}</option>
                  <option value="retrieve">{t.retrieval}</option>
                </NativeSelect>
              </label>
            )}
            <Button
              variant="outline"
              disabled={blocked}
              onClick={() => {
                setOptions(false);
                setTools(true);
              }}
            >
              {t.tools}
            </Button>
            <p className={uiClass('policy')}>{t.privacy}</p>
            <Button
              disabled={request.busy || (!!waitingQuestion && !payer)}
              onClick={() => {
                const question = waitingQuestion;
                setWaitingQuestion(null);
                setOptions(false);
                if (question !== null) void send(question);
              }}
            >
              {waitingQuestion !== null ? t.send : t.done}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={tools} onOpenChange={setTools}>
        <DialogContent
          title={t.tools}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            moreButton.current?.focus();
          }}
        >
          <AssistantBusinessTools />
        </DialogContent>
      </Dialog>
      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent title={uiText.text_821faf6af612} description={uiText.text_9bd9d24ad223}>
          <AssistantSourceConnection
            initialSelected={sources.map((source) => source.id)}
            initialItems={sources}
            onSelectionChange={setSources}
          />
          <div className={uiClass('confirm-actions')}>
            <Button onClick={() => setPicker(false)}>
              {uiText.text_370b22bdbc16}
              {sources.length.toLocaleString('fa-IR')}
              {uiText.text_2413fa113cc0}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!notice}
        onOpenChange={(open) => {
          if (!open) setNotice('');
        }}
      >
        <DialogContent title={uiText.text_a6d0f49fd8fe}>
          <p>{notice}</p>
          <div className={uiClass('confirm-actions')}>
            <Button onClick={() => setNotice('')}>{uiText.text_b90ffe172b6d}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
