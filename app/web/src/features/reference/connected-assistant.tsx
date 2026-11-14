'use client';
import { Textarea as NativeTextarea, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import appearance from './assistant.module.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { contextSignature } from '@/lib/client-surface';
import { V4List, V4Row } from '@/components/v4/page';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  FolderOpen,
  Files,
  ArrowUp,
  RotateCcw,
  LoaderCircle,
  Wallet,
  CalendarDays,
  Plus,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { aiIntegration as t } from '@/content/fa';
import { AssistantPayer } from '@/features/personal/assistant/payer';
import { AssistantResult } from '@/features/personal/assistant/result';
import type { AssistantToolStatus } from '@/features/personal/assistant/business-tools';
import { useAssistantRequest } from '@/features/personal/assistant/use-assistant-request';
import { checkAssistantQuota } from '@/features/personal/assistant/preflight';
import { sourceVersions, validGuid, type AiPayer } from '@/features/personal/assistant/model';
import { usePersonal } from '@/features/personal/provider';
import { useWorkspaceSnapshot } from '@/features/personal/workspaces';
import { useViewState } from '@/components/hooks/use-view-state';
import { useScrollMemory } from '@/components/navigation/scroll-memory';
import { V5Scene } from '@/components/v5/scene';
import { SceneFooterPortal } from '@/components/v5/form-actions';
import dynamic from 'next/dynamic';
import { ViewTabs } from '@/components/ui/tabs';
import { LoadingSkeleton } from '@/components/ui/states';
const AssistantBusinessTools = dynamic(
  () =>
    import('@/features/personal/assistant/business-tools').then(
      (module) => module.AssistantBusinessTools,
    ),
  { loading: () => <LoadingSkeleton /> },
);
const AssistantSourceConnection = dynamic(() =>
  import('@/features/personal/sources/assistant-connection').then(
    (module) => module.AssistantSourceConnection,
  ),
);

export function ReferenceAssistant() {
  const params = useSearchParams();
  const chatOpen = params.get('view') === 'chat';
  const activeTab =
    params.get('tab') === 'sources'
      ? 'sources'
      : params.get('tab') === 'outputs'
        ? 'outputs'
        : 'chat';
  const changeTab = (tab: 'sources' | 'chat' | 'outputs') => {
    const next = new URLSearchParams(params);
    next.set('tab', tab);
    if (tab === 'chat') next.set('view', 'chat');
    window.history.replaceState(null, '', '/personal/assistant?' + next);
  };
  const openChat = () => changeTab('chat');
  const { session, call } = usePersonal(),
    [toolsVisited, setToolsVisited] = useState(activeTab === 'outputs'),
    [toolStatus, setToolStatus] = useState<AssistantToolStatus>({
      busy: false,
      pendingPayer: null,
    }),
    [options, setOptions] = useState(false),
    [waitingQuestion, setWaitingQuestion] = useState<string | null>(null),
    [stage, setStage] = useState<'home' | 'answer' | 'error'>('home'),
    [answeredQuestion, setAnsweredQuestion] = useState(''),
    [mode, setMode] = useState<'answer' | 'retrieve'>('answer'),
    [conversationId, setConversation] = useState<string | null>(null);
  const request = useAssistantRequest('conversation');

  const spaces = useWorkspaceSnapshot();
  const currentContextKey = contextSignature(session.context);
  const currentContextName =
    session.context.workspaceType === 'Organization'
      ? spaces.data?.workspaces.find(
          (space) =>
            space.organizationId === session.context.organizationId &&
            space.membershipId === session.context.membershipId &&
            space.role === session.context.activeRole,
        )?.organizationName || uiText.navigation_education
      : uiText.v6Ui.assistantPersonal;
  const quotaRefused =
    request.error instanceof ApiError &&
    ['AI_QUOTA_NOT_AVAILABLE', 'SUBSCRIPTION_INACTIVE', 'QUOTA_EXCEEDED'].includes(
      request.error.problem.code ?? '',
    );
  const toolBlocked = toolStatus.busy || !!toolStatus.pendingPayer;
  const blocked = request.busy || !!request.pending || toolBlocked;
  const scroll = useRef<HTMLDivElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const payerButton = useRef<HTMLButtonElement>(null);
  const previousStage = useRef(stage);
  useEffect(() => {
    if (previousStage.current !== stage) heading.current?.focus({ preventScroll: true });
    previousStage.current = stage;
  }, [stage]);
  useScrollMemory(scroll, 'MK-38:' + activeTab);
  const memory = 'makan:draft:view:' + session.user.id + ':account:assistant:';
  const [payer, setPayer] = useViewState<AiPayer | ''>(
    // A school/role/child change requires a new explicit billing choice.
    memory + 'payer:' + currentContextKey,
    '',
    (value): value is AiPayer | '' =>
      ['', 'Individual', 'Organization', 'FreeTrial'].includes(String(value)),
  );
  const selectedPayer = request.pending?.payer ?? toolStatus.pendingPayer ?? payer;
  const quotaLabel =
    selectedPayer === 'Organization'
      ? t.schoolQuota
      : selectedPayer
        ? t.normalQuota
        : t.chooseQuota;
  useEffect(() => {
    if (activeTab === 'outputs') setToolsVisited(true);
  }, [activeTab]);
  const legacyMemory = useRef(
    'makan:draft:view:' + session.user.id + ':' + session.revision + ':assistant:',
  );
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
    legacyMemory.current + 'sources',
  );
  const [draft, setDraft] = useViewState(
      memory + 'question',
      '',
      (v): v is string => typeof v === 'string' && v.length <= 20000,
      legacyMemory.current + 'question',
    ),
    [notice, setNotice] = useState('');
  const [selectedContext, setSelectedContext] = useViewState<{ key: string; name: string } | null>(
    memory + 'context',
    null,
    (value): value is { key: string; name: string } | null =>
      value === null ||
      (!!value &&
        typeof value === 'object' &&
        typeof (value as { key: unknown }).key === 'string' &&
        typeof (value as { name: unknown }).name === 'string'),
  );
  const pinCurrentContext = () =>
    setSelectedContext({ key: currentContextKey, name: currentContextName });
  const contextName = selectedContext?.name ?? uiText.v6Ui.assistantPersonal;
  const contextMismatch =
    !!selectedContext &&
    selectedContext.key !== currentContextKey &&
    (selectedPayer === 'Organization' || sources.length > 0);
  const chooseSources = (next: { id: string; title: string }[]) => {
    setSources(next);
    if (next.length || selectedPayer === 'Organization') pinCurrentContext();
    else setSelectedContext(null);
  };
  const choosePayer = (value: AiPayer | '') => {
    setPayer(value);
    if (value === 'Organization' || sources.length) pinCurrentContext();
    else setSelectedContext(null);
  };
  const editQuestion = () => {
    request.reset();
    setStage('home');
    openChat();
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
    if (toolBlocked) return;
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
      if (contextMismatch) throw new ApiError(409, { code: 'AI_CONTEXT_RESELECT_REQUIRED' });
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
    <div
      className={uiClass('v5-assistant-body ' + appearance.body)}
      ref={scroll}
      data-assistant-workspace
    >
      {!chatOpen && stage === 'home' && (
        <section className={appearance.hero}>
          <small>{contextName}</small>
          <h2>{uiText.v7Ui.assistantWelcome}</h2>
          <p>{uiText.v6Ui.assistantIntro}</p>
        </section>
      )}
      {!chatOpen && stage === 'home' && (
        <Button onClick={openChat}>
          <Sparkles size={20} />
          {uiText.v6Ui.assistantChat}
        </Button>
      )}
      {!chatOpen && stage === 'home' ? (
        <section className={uiClass('card') + ' ' + appearance.sourcePanel}>
          <h3>{uiText.v6Ui.assistantContext}</h3>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.v6Ui.assistantMode}</span>
            <b className={uiClass('val')}>{contextName}</b>
          </div>
          <div className={uiClass('kv')}>
            <span className={uiClass('key')}>{uiText.v6Ui.assistantSource}</span>
            <b className={uiClass('val')}>
              {sources.length
                ? sources.map((source) => source.title).join(uiText.v5Product.listSeparator)
                : uiText.v6Ui.noSelectedSource}
            </b>
          </div>
          {contextMismatch && <p role="status">{uiText.v6Ui.assistantSchoolContext}</p>}
          <Button
            variant="outline"
            className={appearance.sourceAction}
            disabled={request.busy}
            onClick={() => {
              setWaitingQuestion(null);
              setOptions(true);
            }}
          >
            <Files size={20} />
            {quotaLabel}
          </Button>
        </section>
      ) : (
        <>
          <div className={appearance.chatContext}>
            <Files size={18} />
            <span>
              {uiText.v7Ui.sourceCount(sources.length)}
              <small>{contextName}</small>
            </span>
            <Button variant="ghost" disabled={blocked} onClick={() => changeTab('sources')}>
              {uiText.v7Ui.changeSources}
            </Button>
          </div>
          {contextMismatch && (
            <p className={uiClass('alert warn')} role="status">
              {uiText.v6Ui.assistantSchoolContext}
            </p>
          )}
        </>
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
      {!chatOpen && stage === 'home' && (
        <V4List>
          <V4Row
            title={uiText.v6Ui.assistantReview}
            description={uiText.v6Ui.assistantReviewHint}
            icon={<BookOpen size={19} />}
            onClick={openChat}
          />
          <V4Row
            title={uiText.v6Ui.assistantPlan}
            description={uiText.v6Ui.assistantPlanHint}
            icon={<CalendarDays size={19} />}
            onClick={() => changeTab('outputs')}
          />
          <V4Row
            title={uiText.v6Ui.assistantResources}
            description={uiText.v6Ui.assistantResourcesHint}
            icon={<FolderOpen size={19} />}
            onClick={() => changeTab('sources')}
          />
        </V4List>
      )}
      {request.busy && (
        <>
          <p role="status">{t.sending}</p>
          <Button variant="outline" onClick={request.cancelLocal}>
            {uiText.v7Ui.stopReceiving}
          </Button>
        </>
      )}
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
      {chatOpen && (
        <SceneFooterPortal>
          <div className={appearance.composeLabel}>
            <ShieldCheck size={14} />
            <span>{sources.length ? uiText.v7Ui.sourceQuestion : uiText.v7Ui.generalQuestion}</span>
          </div>
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
              onClick={() => changeTab('sources')}
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
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  if (!blocked && request.restored && !request.waiting)
                    event.currentTarget.form?.requestSubmit();
                }
              }}
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
      )}
      {chatOpen && <p className={uiClass('tagline')}>{uiText.text_26c05e2e974e}</p>}
    </div>
  );
  return (
    <>
      <V5Scene
        headerClassName={appearance.assistantHeader}
        headingRef={heading}
        id={
          stage === 'answer'
            ? 'MK-374'
            : stage === 'error'
              ? quotaRefused
                ? 'MK-375'
                : 'MK-376'
              : 'MK-38'
        }
        title={uiText.navigation_assistant}
        subtitle={uiText.v6Ui.assistantSubtitle}
        back={
          activeTab === 'chat' && stage !== 'home' ? '/personal/assistant?view=chat' : '/personal'
        }
        onBack={activeTab === 'chat' && stage !== 'home' ? () => setStage('home') : undefined}
        backWithinPage={activeTab === 'chat' && stage !== 'home'}
        actions={
          activeTab === 'chat' && stage === 'error' ? (
            <Button disabled={request.busy || request.waiting} onClick={() => void send()}>
              {t.retry}
            </Button>
          ) : undefined
        }
        kind="list"
        deep={false}
        layout="standard"
        footerSlot={activeTab === 'chat' && chatOpen && stage !== 'error'}
        headerTools={
          <Button
            ref={payerButton}
            variant="ghost"
            className={appearance.quotaButton}
            onClick={() => {
              setWaitingQuestion(null);
              setOptions(true);
            }}
            aria-haspopup="dialog"
          >
            {quotaLabel}
            <ChevronDown size={16} aria-hidden="true" />
          </Button>
        }
        summary={[
          { label: uiText.text_bdf39bdb81b6, value: uiText.text_e9c385cbd890 },
          { label: uiText.text_2cd3e89872c5, value: uiText.text_f8031fc55c47 },
          { label: uiText.text_f601ed0900bc, value: uiText.text_a9598b86b1bf },
        ]}
      >
        <ViewTabs
          value={activeTab}
          onChange={changeTab}
          prefix="assistant"
          label={uiText.v7Ui.assistantSections}
          className={appearance.studyNavigation}
          items={[
            { value: 'sources', label: uiText.v7Ui.sources },
            { value: 'chat', label: uiText.v7Ui.chat },
            { value: 'outputs', label: uiText.v7Ui.outputs },
          ]}
        />
        {activeTab !== 'outputs' && (
          <section
            role="tabpanel"
            id={`assistant-panel-${activeTab}`}
            aria-labelledby={`assistant-tab-${activeTab}`}
            className={appearance.tabPanel}
          >
            {activeTab === 'sources' ? (
              <>
                <AssistantSourceConnection
                  initialSelected={sources.map((source) => source.id)}
                  initialItems={sources}
                  onSelectionChange={chooseSources}
                  disabled={blocked}
                />
                {!!sources.length && (
                  <label className={uiClass('field')}>
                    {t.mode}
                    <NativeSelect
                      aria-label={t.mode}
                      disabled={blocked}
                      value={mode}
                      onChange={(event) => setMode(event.target.value as 'answer' | 'retrieve')}
                    >
                      <option value="answer">{t.answer}</option>
                      <option value="retrieve">{t.retrieval}</option>
                    </NativeSelect>
                  </label>
                )}
              </>
            ) : stage === 'error' ? (
              <div className={uiClass('v5-native-form')}>
                {request.cancelled && (
                  <p className={uiClass('alert warn')} role="status">
                    {uiText.v7Ui.locallyStopped}
                  </p>
                )}
                {!!request.error && (
                  <div className={uiClass('alert warn')} role="alert">
                    {quotaRefused ? <Wallet size={22} /> : <RotateCcw size={22} />}
                    <div>
                      {request.error instanceof Error
                        ? request.error.message
                        : t.serviceUnavailable}
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
                  (selectedPayer !== 'Organization' ||
                    session.context.activeRole === 'Manager') && (
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
          </section>
        )}
        {toolsVisited && (
          <section
            role="tabpanel"
            id="assistant-panel-outputs"
            aria-labelledby="assistant-tab-outputs"
            className={appearance.outputsPanel}
            hidden={activeTab !== 'outputs'}
          >
            <h2>{uiText.v7Ui.outputs}</h2>
            <h3>{t.tools}</h3>
            <AssistantBusinessTools
              payer={selectedPayer}
              disabled={request.busy || !!request.pending}
              onStatus={setToolStatus}
              navigationClassName={appearance.toolNavigation}
            />
          </section>
        )}
      </V5Scene>
      <Dialog open={options} onOpenChange={setOptions}>
        <DialogContent
          title={t.chooseQuota}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            payerButton.current?.focus();
          }}
        >
          <div className={uiClass('v5-native-form')}>
            {waitingQuestion !== null && <p role="alert">{t.payerRequired}</p>}
            <AssistantPayer
              value={selectedPayer}
              onChange={choosePayer}
              disabled={blocked}
              checkQuota={!request.pending && (mode === 'answer' || !sources.length)}
            />
            {contextMismatch && <p role="status">{uiText.v6Ui.assistantSchoolContext}</p>}
            {contextMismatch && !blocked && (
              <Button variant="outline" onClick={pinCurrentContext}>
                {uiText.v6Ui.assistantUseCurrent}
              </Button>
            )}
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
