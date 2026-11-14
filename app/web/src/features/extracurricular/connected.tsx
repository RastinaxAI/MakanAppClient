'use client';
import {
  Input as NativeInput,
  Textarea as NativeTextarea,
  SearchField,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Plus, UsersRound, Mail, ClipboardList, ChevronLeft, Link2 } from 'lucide-react';
import type { components } from '@/generated/api/schema';
import { usePersonal, usePersonalApi } from '@/features/personal/provider';
import { ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button, buttonClass } from '@/components/ui/button';
import { ApiError } from '@/lib/api/errors';
import { resolvePersonInput } from '@/features/personal/messaging/directory';
import { draftPrefix } from '@/lib/draft-storage';
import { useClassViewState } from './frame';
import { Field, Pager } from '@/features/personal/school/shared';
import { ConnectionNotice } from '@/components/ui/connection-notice';

import { FormationList, FormationDetail } from './formation';
import { ClassOverview, ClassInvitationList, ClassManagement } from './class-management';
import { IndependentLearning } from './learning';
import { useClassCommand } from './use-class-command';
import { requestInput, validRequest, requestApi } from './api-model';
import { integration80c as integrationCopy } from '@/content/fa';
import { StaticConnectedFrame, useFrameActions, FrameNotice } from './frame';
import { emptyClassDraft, validateClassDraft, type ClassDraft } from './model';
import { V5Scene } from '@/components/v5/scene';
import { V4Field, V4Note } from '@/components/v4/page';
import wizard from './formation-wizard.module.css';
import appearance from './connected.module.css';
import { ViewTabs } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { ClassPreviewSpaces } from './class-preview-spaces';

const base = '/personal/extracurricular';
function useClassDraft() {
  const { session } = usePersonal(),
    key = draftPrefix + 'extracurricular:' + session.user.id;
  const [draft, setDraft] = useState(() => emptyClassDraft(session.user.id)),
    [loaded, setLoaded] = useState(false),
    [storageIssue, setStorageIssue] = useState('');
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) ?? 'null');
      if (saved?.version === 1 && saved.draft && typeof saved.draft.title === 'string')
        setDraft({
          ...emptyClassDraft(session.user.id),
          ...saved.draft,
          managerUserId: session.user.id,
        });
    } catch {
      setStorageIssue(uiText.text_57716070bbf6);
    }
    setLoaded(true);
  }, [key, session.user.id]);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ version: 1, draft }));
      setStorageIssue('');
    } catch {
      setStorageIssue(uiText.text_90b8655d7cce);
    }
  }, [draft, key, loaded]);
  return { draft, setDraft, loaded, storageIssue };
}
export function ExtracurricularHome() {
  const params = useSearchParams();
  const tab =
    params.get('tab') === 'requests'
      ? 'requests'
      : params.get('tab') === 'invitations'
        ? 'invitations'
        : 'classes';
  function changeTab(value: 'classes' | 'requests' | 'invitations') {
    const next = new URLSearchParams(params);
    next.set('tab', value);
    window.history.replaceState(null, '', base + '?' + next);
  }
  const [page, setPage] = useState(1);
  const query = usePersonalApi<components['schemas']['PersonalClassPageOfPersonalClassDto']>(
    `/api/v1/personal-classes/page?page=${page}&pageSize=30`,
  );
  const invitations = usePersonalApi<
    components['schemas']['PersonalClassPageOfPersonalClassInvitationDto']
  >('/api/v1/personal-classes/invitations/page?page=1&pageSize=30');
  const { draft } = useClassDraft(),
    { session } = usePersonal();
  const memory =
    draftPrefix + 'view:' + session.user.id + ':' + session.revision + ':extracurricular:';
  const [search, setSearch] = useClassViewState(
      memory + 'search',
      '',
      (v): v is string => typeof v === 'string' && v.length <= 200,
    ),
    [filter, setFilter] = useClassViewState(
      memory + 'filter',
      uiText.text_15270886eadd,
      (v): v is string =>
        typeof v === 'string' &&
        [uiText.text_15270886eadd, uiText.text_740e6f513649, uiText.text_512b7d535f79].includes(v),
    );
  const items = (query.data?.items ?? []).filter(
    (value) =>
      value.title.includes(search.trim()) &&
      (filter === uiText.text_15270886eadd ||
        (filter === uiText.text_512b7d535f79
          ? value.managerUserId === session.user.id
          : value.managerUserId !== session.user.id)),
  );
  const id = query.data?.items.length ? 'MK-11' : 'MK-10';
  const body = (
    <>
      <ConnectionNotice
        cached={!!query.data}
        error={query.isError}
        onRetry={() => void query.refetch()}
      />
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          {!!query.data?.items.length && (
            <div className={appearance.searchZone}>
              <SearchField
                aria-label={uiText.text_74c3aeacf724}
                placeholder={uiText.text_74c3aeacf724}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch('')}
              />
              <div
                className={appearance.filters}
                data-ui="filters"
                role="group"
                aria-label={uiText.text_80c38e90f3ff}
              >
                {[uiText.text_15270886eadd, uiText.text_740e6f513649, uiText.text_512b7d535f79].map(
                  (name) => (
                    <button
                      key={name}
                      className={filter === name ? appearance.activeFilter : undefined}
                      aria-pressed={filter === name}
                      onClick={() => setFilter(name)}
                    >
                      {name}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
          {!items.length ? (
            <div className={uiClass('empty')}>
              <div className={uiClass('empty-mark')}>
                <UsersRound />
              </div>
              <h3>
                {search
                  ? uiText.text_4a9ad5d23452
                  : query.data?.items.length
                    ? uiText.text_00d537cc94bc
                    : uiText.v5Product.extraEmptyTitle}
              </h3>
              <p>{search ? uiText.text_e33b10d290c6 : uiText.v5Product.extraEmptyDescription}</p>
              {search && (
                <button
                  className={uiClass(buttonClass('btn secondary'))}
                  onClick={() => setSearch('')}
                >
                  {uiText.text_35c84a68f506}
                </button>
              )}
            </div>
          ) : (
            items.map((value, index) => (
              <Fragment key={value.id}>
                <div className={uiClass('card')}>
                  <div className={uiClass('between')}>
                    <span className={uiClass('overline')}>
                      {uiText.text_01d42f321cf0}
                      {value.managerUserId === session.user.id
                        ? uiText.text_d047c7316e02
                        : uiText.text_740e6f513649}
                    </span>
                    <span className={uiClass('badge ' + (value.archived ? 'neutral' : ''))}>
                      {value.archived ? uiText.text_9defd77e1a5d : uiText.text_a3fa2a3ffcb9}
                    </span>
                  </div>
                  <Link href={`${base}/classes/${value.id}`}>
                    <h3>{value.title}</h3>
                  </Link>
                  <p>
                    {value.capabilities?.canAuthorAssignments || value.capabilities?.canAuthorExams
                      ? uiText.text_763a7141dfea
                      : uiText.text_8a15f3eba711}
                  </p>
                  <Link className={uiClass('text-action')} href={`${base}/classes/${value.id}`}>
                    {uiText.text_d77e2ea74d81}
                    <ChevronLeft size={16} />
                  </Link>
                </div>
                {index === 0 && <ClassPreviewSpaces id={value.id} />}
              </Fragment>
            ))
          )}
          {query.data && items.length > 0 && (query.data.totalCount > 30 || page > 1) && (
            <Pager page={page} total={query.data.totalCount} onChange={setPage} />
          )}
          {!query.data?.items.length ? (
            <section className={uiClass('card ' + appearance.openClass)}>
              <h3>{uiText.v5Product.extraAllAccounts}</h3>
              <p>{uiText.v5Product.extraRequestPolicy}</p>
            </section>
          ) : (
            <div className={uiClass('list')}>
              <Link className={uiClass('row')} href={`${base}?tab=requests`}>
                <span className={uiClass('tile-icon')}>
                  <ClipboardList />
                </span>
                <span className={uiClass('grow')}>
                  <h4>{uiText.text_7c552fd97407}</h4>
                  <p>{draft.title ? uiText.text_d8fc6a9ac464 : uiText.text_f025323df559}</p>
                </span>
                {draft.title && (
                  <span className={uiClass('badge warn')}>{uiText.text_410c47c7f8b7}</span>
                )}
              </Link>
              <Link className={uiClass('row')} href={`${base}?tab=invitations`}>
                <span className={uiClass('tile-icon')}>
                  <Mail />
                </span>
                <span className={uiClass('grow')}>
                  <h4>{uiText.text_ae57af37bd8e}</h4>
                  <p>
                    {invitations.isPending
                      ? uiText.text_80516c4adbbe
                      : invitations.isError
                        ? uiText.text_9c0bec309b99
                        : uiText.text_7c8abbb43e1e}
                  </p>
                </span>
                {invitations.data?.items.length !== undefined && (
                  <span className={uiClass('badge')}>
                    {invitations.data.items
                      .filter((x) => x.status === 'Pending')
                      .length.toLocaleString('fa-IR')}
                  </span>
                )}
              </Link>
            </div>
          )}
          <Link
            className={uiClass(buttonClass('btn'), appearance.inlineCreate)}
            href={`${base}/requests/new?step=details`}
          >
            <Plus size={19} />
            {uiText.text_2d5123fde88c}
          </Link>
          {!query.data?.items.length && (
            <section className={uiClass('card flex')}>
              <Link2 size={24} />
              <div className={uiClass('grow')}>
                <p>{uiText.v5Product.extraInviteHint}</p>
                <small className={uiClass('muted')}>
                  {uiText.v5Product.extraInviteDescription}
                </small>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
  return (
    <StaticConnectedFrame
      id={id}
      title={uiText.navigation_extracurricular}
      subtitle={uiText.text_d034f3bcfe7f}
      back="/personal/education"
      mobileFooter={
        tab === 'classes' && query.data ? (
          <Link className={uiClass(buttonClass('btn'))} href={`${base}/requests/new?step=details`}>
            <Plus size={19} />
            {uiText.text_2d5123fde88c}
          </Link>
        ) : undefined
      }
    >
      <ViewTabs
        value={tab}
        onChange={changeTab}
        prefix="extra"
        label={uiText.navigation_extracurricular}
        className={appearance.tabs}
        items={[
          { value: 'classes', label: uiText.text_7c61d113156b },
          { value: 'requests', label: uiText.v5Product.extraTabRequests },
          { value: 'invitations', label: uiText.v5Product.extraTabInvites },
        ]}
      />
      <section
        role="tabpanel"
        id={`extra-panel-${tab}`}
        aria-labelledby={`extra-tab-${tab}`}
        className={appearance.body}
      >
        {tab === 'requests' ? (
          <FormationList embedded />
        ) : tab === 'invitations' ? (
          <ClassInvitationList embedded />
        ) : (
          body
        )}
      </section>
    </StaticConnectedFrame>
  );
}
export function ClassRequestWizard({ step = 'details' }: { step?: string }) {
  const frame = useFrameActions(),
    { draft, setDraft, loaded, storageIssue } = useClassDraft();
  const command = useClassCommand('formation-create');
  const submission = useClassCommand('formation-submit');
  const { call, session } = usePersonal();
  const receiptKey = draftPrefix + 'formation-receipt:' + session.user.id;
  const [createdId, setCreatedId, receiptReady] = useClassViewState<string | null>(
    receiptKey,
    null,
    (value): value is string | null =>
      value === null ||
      (typeof value === 'string' &&
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)),
  );
  const flowLock = useRef(false);
  const busy = command.busy || submission.busy;
  const [teacherOpen, setTeacherOpen] = useState(false),
    [teacherInput, setTeacherInput] = useState(''),
    [teacherBusy, setTeacherBusy] = useState(false),
    [teacherError, setTeacherError] = useState<unknown>();
  const [errors, setErrors] = useState<Partial<Record<keyof ClassDraft, string>>>({});
  const copy = uiText.v5Product,
    v9 = uiText.serverAlignedUi;
  // The retired audience URL opens details; manager/teacher choices have their own step.
  const review = step === 'review';
  const management = step === 'management';
  const currentStep = review ? 2 : management ? 1 : 0;
  function change<K extends keyof ClassDraft>(key: K, value: ClassDraft[K]) {
    setDraft((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: '' }));
  }
  async function saveRequest(sendForReview = false) {
    if (flowLock.current || !receiptReady || !draft.acceptedRules) return;
    const details = requestInput(draft);
    if (!validRequest(details)) {
      frame.setNotice(integrationCopy.incomplete);
      return;
    }
    flowLock.current = true;
    try {
      // Recover a known server draft before creating anything else after an uncertain submission.
      const result = createdId
        ? await command.run<components['schemas']['PersonalClassRequestDto']>(
            `${requestApi}/${createdId}`,
            undefined,
            { method: 'GET' },
          )
        : await command.run<components['schemas']['PersonalClassRequestDto']>(
            requestApi,
            { details },
            { idempotent: true },
          );
      if (!result) return;
      const saved = result.value;
      if (sendForReview && saved.status === 'Draft' && saved.capabilities.canSubmit) {
        // Persist the acknowledged creation before Submit. Submit accepts only expectedVersion,
        // not a fabricated clientOperationId; a lost ACK is reconciled by GET on the next click.
        try {
          sessionStorage.setItem(receiptKey, JSON.stringify(saved.id));
          setCreatedId(saved.id);
        } catch {
          frame.router.push(`${base}/requests/${saved.id}`);
          return;
        }
        const submitted = await submission.run<components['schemas']['PersonalClassRequestDto']>(
          `${requestApi}/${saved.id}/submit`,
          { expectedVersion: saved.version },
          { reconcileOnError: true, acceptResult: (value) => value.id === saved.id },
        );
        if (!submitted) return;
      }
      try {
        sessionStorage.removeItem(receiptKey);
      } catch {}
      setCreatedId(null);
      frame.router.push(`${base}/requests/${saved.id}`);
    } finally {
      flowLock.current = false;
    }
  }
  function submit(form: HTMLFormElement) {
    if (busy || flowLock.current) return;
    const issues = validateClassDraft(
      draft,
      review ? 'review' : management ? 'management' : 'details',
    );
    setErrors(issues);
    const first = Object.keys(issues)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (review) void saveRequest(true);
    else frame.router.push(`${base}/requests/new?step=${management ? 'review' : 'management'}`);
  }
  if (!loaded || !receiptReady)
    return (
      <div className={uiClass('bootstrap')}>
        <LoadingSkeleton />
      </div>
    );
  return (
    <>
      <V5Scene
        id={review ? 'MK-16' : management ? 'MK-15' : 'MK-13'}
        headerTools={<></>}
        desktopActionPlacement="footer"
        title={review ? copy.requestReview : v9.classRequest}
        subtitle={copy.requestActiveAccounts}
        back={
          review
            ? `${base}/requests/new?step=management`
            : management
              ? `${base}/requests/new?step=details`
              : base + '/requests'
        }
        deep
        kind={review ? 'article' : 'form'}
        context={
          review ? undefined : (
            <>
              <h3>{v9.requestBeforeSend}</h3>
              <p>{copy.requestManagerPolicy}</p>
              <p>{copy.requestTeacherPolicy}</p>
              <p>{copy.requestSubmissionPolicy}</p>
            </>
          )
        }
        actions={
          <>
            <Button
              type="submit"
              disabled={busy || (review && !draft.acceptedRules)}
              aria-busy={busy}
            >
              {review ? copy.requestSubmitReview : copy.requestNext}
            </Button>
            {review && (
              <Button
                type="button"
                variant="outline"
                disabled={busy || !draft.acceptedRules}
                onClick={() => void saveRequest()}
              >
                {integrationCopy.draft}
              </Button>
            )}
          </>
        }
        onSubmit={(event) => {
          event.preventDefault();
          submit(event.currentTarget);
        }}
      >
        <ol className={wizard.steps} aria-label={v9.classRequest}>
          {copy.formationSteps.map((label, index) => (
            <li
              key={label}
              aria-current={currentStep === index ? 'step' : undefined}
              className={
                currentStep > index
                  ? wizard.done
                  : currentStep === index
                    ? wizard.current
                    : undefined
              }
            >
              <span className={wizard.dot} aria-hidden="true">
                {currentStep > index ? '✓' : (index + 1).toLocaleString('fa-IR')}
              </span>
              <b>{label}</b>
            </li>
          ))}
        </ol>
        {createdId && <V4Note>{copy.requestReconcileDraft}</V4Note>}
        {!review ? (
          <>
            <V4Note>{copy.requestSubmissionPolicy}</V4Note>
            <section>
              <div className={wizard.formGrid}>
                {!management && (
                  <>
                    <V4Field
                      label={copy.requestClassTitle}
                      hint={
                        <span className={wizard.counter}>
                          {draft.title.length.toLocaleString('fa-IR')}
                          {v9.titleCounterLimit}
                        </span>
                      }
                      error={errors.title}
                    >
                      <NativeInput
                        name="title"
                        aria-required="true"
                        value={draft.title}
                        maxLength={200}
                        disabled={busy || !!createdId}
                        onChange={(e) => change('title', e.target.value)}
                      />
                    </V4Field>
                    <V4Field
                      label={uiText.text_3a6f00dc84e1}
                      hint={copy.requestCapacityHint}
                      error={errors.capacity}
                    >
                      <NativeInput
                        name="capacity"
                        inputMode="numeric"
                        value={draft.capacity}
                        disabled={busy || !!createdId}
                        aria-required="true"
                        onChange={(e) => change('capacity', e.target.value)}
                      />
                    </V4Field>
                    <V4Field
                      label={v9.requestPurpose}
                      hint={
                        <span className={wizard.counter}>
                          {draft.subject.length.toLocaleString('fa-IR')}
                          {v9.purposeCounterLimit}
                        </span>
                      }
                      error={errors.subject}
                    >
                      <NativeTextarea
                        name="subject"
                        rows={3}
                        value={draft.subject}
                        maxLength={2000}
                        disabled={busy || !!createdId}
                        aria-required="true"
                        placeholder={v9.requestPurposeHint}
                        onChange={(e) => change('subject', e.target.value)}
                      />
                    </V4Field>
                    <V4Field
                      label={v9.requestDescription}
                      hint={
                        <span className={wizard.counter}>
                          {draft.description.length.toLocaleString('fa-IR')}
                          {v9.descriptionCounterLimit}
                        </span>
                      }
                      error={errors.description}
                    >
                      <NativeTextarea
                        name="description"
                        rows={3}
                        value={draft.description}
                        maxLength={4000}
                        disabled={busy || !!createdId}
                        onChange={(e) => change('description', e.target.value)}
                      />
                    </V4Field>
                  </>
                )}
                {management && (
                  <>
                    <V4Field label={v9.requestManager} hint={v9.requestManagerHint}>
                      <NativeInput value={frame.name} readOnly />
                    </V4Field>
                    <fieldset className={wizard.choiceGroup}>
                      <legend>{v9.requestTeacher}</legend>
                      <label className={uiClass('v4-check')}>
                        <NativeInput
                          type="radio"
                          name="teacher"
                          checked={!draft.teacherUserId}
                          disabled={busy}
                          onChange={() => change('teacherUserId', '')}
                        />
                        <span>{copy.requestWithoutTeacher}</span>
                      </label>
                      <label className={uiClass('v4-check')}>
                        <NativeInput
                          type="radio"
                          name="teacher"
                          checked={!!draft.teacherUserId}
                          disabled={busy}
                          onChange={() => {
                            setTeacherError(undefined);
                            setTeacherOpen(true);
                          }}
                        />
                        <span>{copy.requestProposeTeacher}</span>
                      </label>
                    </fieldset>
                  </>
                )}
              </div>
            </section>
            <p className={wizard.policy}>
              {management ? copy.requestTeacherPolicy : copy.requestManagerPolicy}
            </p>
          </>
        ) : (
          <>
            <section className={uiClass('card ' + wizard.review)}>
              <h2>{draft.title}</h2>
              <dl className={uiClass('v5-summary')}>
                {[
                  [v9.requestPurpose, draft.subject],
                  ...(draft.description ? [[v9.requestDescription, draft.description]] : []),
                  [uiText.text_3a6f00dc84e1, draft.capacity + uiText.text_56bfaedd15bf],
                  [copy.requestManager, frame.name],
                  [
                    copy.requestTeacher,
                    draft.teacherUserId ? uiText.text_b7a54e700d6f : copy.requestWithoutTeacher,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Link className={uiClass('text-action')} href={`${base}/requests/new?step=details`}>
                {uiText.text_7701570756c1}
              </Link>
            </section>
            <label className={uiClass('v4-check')}>
              <NativeInput
                type="checkbox"
                name="acceptedRules"
                checked={draft.acceptedRules}
                disabled={busy}
                onChange={(e) => change('acceptedRules', e.target.checked)}
              />
              <span>{copy.requestAcceptRules}</span>
            </label>
            <p className={wizard.policy}>{integrationCopy.formationHint}</p>
            {command.feedback}
            {submission.feedback}
            {createdId && (
              <Link className={uiClass('text-action')} href={`${base}/requests/${createdId}`}>
                {copy.requestSavedDraft}
              </Link>
            )}
          </>
        )}
        {storageIssue && (
          <p className={uiClass('field-error')} role="alert">
            {storageIssue}
          </p>
        )}
      </V5Scene>
      <FrameNotice message={frame.notice} close={() => frame.setNotice('')} />
      <Dialog open={teacherOpen} onOpenChange={setTeacherOpen}>
        <DialogContent title={integrationCopy.chooseTeacher}>
          <form
            className={uiClass('stack')}
            onSubmit={async (event) => {
              event.preventDefault();
              if (teacherBusy) return;
              setTeacherBusy(true);
              setTeacherError(undefined);
              try {
                const result = await call<components['schemas']['PeopleResolveResult']>(
                  '/api/v1/people/resolve',
                  { method: 'POST', body: JSON.stringify(resolvePersonInput(teacherInput)) },
                );
                if (!result.isDiscoverable || !result.profile) throw new ApiError(404);
                setDraft((old) => ({ ...old, teacherUserId: result.profile!.userId }));
                setTeacherOpen(false);
              } catch (error) {
                setTeacherError(error);
              } finally {
                setTeacherBusy(false);
              }
            }}
          >
            <p>{integrationCopy.teacherProposal}</p>
            <Field label={integrationCopy.target}>
              <NativeInput
                required
                value={teacherInput}
                onChange={(event) => setTeacherInput(event.target.value)}
              />
            </Field>
            <div data-dialog-actions>
              <Button disabled={teacherBusy}>{integrationCopy.chooseTeacher}</Button>
            </div>
            {!!teacherError && <ErrorState error={teacherError} />}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function FormationRequests() {
  return <FormationList />;
}
export function ConnectedClassDetail({ id }: { id: string }) {
  return <ClassOverview id={id} />;
}
export function ConnectedClassInvitations() {
  return <ClassInvitationList />;
}
export function ClassLifecyclePending({ screen = 'MK-20' }: { screen?: string }) {
  return (
    <StaticConnectedFrame id={screen} title={uiText.text_a0d568059d0c}>
      <div className={uiClass('alert warn')}>{uiText.text_d896a143e687}</div>
      <Link className={uiClass(buttonClass('btn secondary'))} href={base}>
        {uiText.text_ac06972caa41}
      </Link>
    </StaticConnectedFrame>
  );
}
export function ExtracurricularRoute({ section, step }: { section: string[]; step?: string }) {
  const [area, id, action] = section;
  if (area === 'requests' && id === 'new') return <ClassRequestWizard step={step} />;
  if (area === 'requests' && !id) return <FormationRequests />;
  if (area === 'invitations' && !id) return <ConnectedClassInvitations />;
  if (area === 'classes' && id && !action) return <ConnectedClassDetail id={id} />;
  if (area === 'requests' && id) return <FormationDetail id={id} editing={action === 'edit'} />;
  if (area === 'invitations' && id) return <ClassInvitationList id={id} />;
  if (area === 'join') return <ClassManagement id={id} section="join" />;
  if (
    area === 'classes' &&
    ['learning', 'assignments', 'exams', 'submissions', 'exam-submissions', 'evaluations'].includes(
      action,
    )
  )
    return <IndependentLearning classId={id} section={section.slice(2)} />;
  if (area === 'classes' && id)
    return <ClassManagement id={id} section={action} memberId={section[3]} />;
  const screen =
    area === 'requests'
      ? 'MK-18'
      : area === 'invitations'
        ? 'MK-27'
        : area === 'join'
          ? 'MK-28'
          : action === 'members'
            ? section[3]
              ? 'MK-31'
              : 'MK-30'
            : action === 'requests'
              ? 'MK-29'
              : action === 'invite'
                ? 'MK-26'
                : action === 'learning'
                  ? 'MK-44'
                  : action === 'assignments'
                    ? 'MK-45'
                    : action === 'exams'
                      ? 'MK-66'
                      : action === 'info'
                        ? 'MK-34'
                        : action === 'group'
                          ? 'MK-32'
                          : action === 'channel'
                            ? 'MK-33'
                            : action === 'archive'
                              ? 'MK-25'
                              : action === 'edit'
                                ? 'MK-55'
                                : 'MK-20';
  return <ClassLifecyclePending screen={screen} />;
}
