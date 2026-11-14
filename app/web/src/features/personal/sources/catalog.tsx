'use client';
import {
  Input as NativeInput,
  Select as NativeSelect,
  Textarea as NativeTextarea,
  SearchField,
} from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { SourceKnowledge } from './knowledge';
import Link from 'next/link';
import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import {
  BookOpen,
  LibraryBig,
  ChevronLeft,
  FileText,
  Plus,
  History,
  Eye,
  Globe,
  Link2,
  Type,
} from 'lucide-react';
import { V5Scene } from '@/components/v5/scene';
import {
  SceneMenuClose,
  useSceneFormAction,
  type SceneSummary,
} from '@/components/v5/form-actions';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonClass } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { useViewState } from '@/components/hooks/use-view-state';
import { ConnectionNotice } from '@/components/ui/connection-notice';
import type { components } from '@/generated/api/schema';
import { clientValidator } from '@/lib/api/client-contract';
import { ApiError } from '@/lib/api/errors';
import { date, number } from '@/lib/formatting';
import { V4List, V4Row } from '@/components/v4/page';
import { usePersonal, usePersonalApi } from '../provider';
import { sourceScopes, sourceDownloadable, sourceReadiness, sourceAiSelectable } from './model';
import s from '../service-layout.module.css';
import catalogStyle from './source-catalog.module.css';
type S = components['schemas'];
type Scope = S['EducationalSourceScope'];
const base = '/personal/resources';
function useSourceHeading(view: string) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [view]);
  return heading;
}
function SourceMenuLink({ href, children }: { href: string; children: ReactNode }) {
  const close = useContext(SceneMenuClose);
  return (
    <Link
      className={uiClass(buttonClass('button button-outline'))}
      href={href}
      onClick={() => close?.()}
    >
      {children}
    </Link>
  );
}
export function SourceCatalog({
  upload = false,
  chooseType = false,
  initialScope = 'Personal',
  initialClassId = '',
  embedded = false,
  selection,
}: {
  upload?: boolean;
  chooseType?: boolean;
  initialScope?: Scope;
  initialClassId?: string;
  embedded?: boolean;
  selection?: {
    items: { id: string; title: string }[];
    onChange: (items: { id: string; title: string }[]) => void;
    disabled?: boolean;
  };
} = {}) {
  const router = useRouter();
  const heading = useSourceHeading(upload ? 'upload' : chooseType ? 'types' : 'catalog');
  const searchInput = useRef<HTMLInputElement>(null);
  const { session } = usePersonal();
  const memory =
    'makan:draft:view:' +
    session.user.id +
    ':' +
    session.revision +
    ':resources:' +
    String(upload) +
    ':' +
    initialScope +
    ':' +
    initialClassId +
    ':';
  const [readiness, setReadiness] = useViewState(
    memory + 'readiness',
    uiText.text_15270886eadd,
    (v): v is string =>
      typeof v === 'string' &&
      [uiText.text_15270886eadd, uiText.text_376e9c9561e2, uiText.text_68bfe264e2cf].includes(v),
  );
  const [scope, setScope, scopeRestored] = useViewState<Scope>(
      memory + 'scope',
      initialScope,
      (v): v is Scope => typeof v === 'string' && Object.hasOwn(sourceScopes, v),
    ),
    [classId, setClass, classRestored] = useViewState(
      memory + 'class',
      initialClassId,
      (v): v is string => typeof v === 'string' && (!v || /^[0-9a-f-]{36}$/i.test(v)),
    ),
    [search, setSearch] = useViewState(
      memory + 'search',
      '',
      (v): v is string => typeof v === 'string' && v.length <= 200,
    ),
    [page, setPage] = useViewState(
      memory + 'page',
      1,
      (v): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0,
    );
  const org = session.context.workspaceType === 'Organization',
    role = session.context.activeRole,
    school = org && ['Teacher', 'Student', 'Manager'].includes(role ?? '');
  const classes = usePersonalApi<S['ClassResult'][]>('/api/v1/academic/classes', {
    enabled: school && scope === 'Class',
  });
  const params = new URLSearchParams({ Scope: scope, Page: String(page), PageSize: '20' });
  if (search) params.set('Search', search);
  if (scope === 'Class' && classId) params.set('ClassId', classId);
  const query = usePersonalApi<S['SourcePage']>('/api/v1/sources?' + params, {
    enabled:
      !upload &&
      !chooseType &&
      scopeRestored &&
      classRestored &&
      (scope !== 'Class' || (school && !!classId)),
  });
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  useEffect(() => {
    const current = selectionRef.current;
    if (!current || current.disabled || query.isError || !query.data) return;
    const denied = new Set(
      query.data.items
        .filter((source) => !sourceAiSelectable(source))
        .map((source) => source.sourceId),
    );
    if (current.items.some((source) => denied.has(source.id)))
      current.onChange(current.items.filter((source) => !denied.has(source.id)));
  }, [query.data, query.isError, selection?.disabled]);
  const create =
    scope === 'Personal' ||
    (school &&
      ((scope === 'Class' && ['Teacher', 'Manager'].includes(role ?? '')) ||
        (scope === 'Organization' && role === 'Manager')));
  const rows = (query.data?.items ?? []).filter(
    (item) =>
      readiness === uiText.text_15270886eadd ||
      (readiness === uiText.text_376e9c9561e2
        ? item.fileReady && item.sourceReady
        : ['Pending', 'Queued', 'Processing'].includes(item.processingStatus)),
  );
  const createAction = create && (scope !== 'Class' || !!classId) && (
    <Button
      className={catalogStyle.create}
      onClick={() =>
        router.push(
          base +
            '?' +
            new URLSearchParams({
              upload: 'choose',
              scope,
              ...(scope === 'Class' ? { classId } : {}),
            }),
        )
      }
    >
      <Plus size={20} />
      {uiText.text_1d488a965baa}
    </Button>
  );
  const readinessFilter = (
    <div className={uiClass('chips')} role="group" aria-label={uiText.text_3043b5ecb0c3}>
      {[uiText.text_15270886eadd, uiText.text_376e9c9561e2, uiText.text_68bfe264e2cf].map(
        (name) => (
          <button
            type="button"
            className={uiClass('chip ' + (readiness === name ? 'on' : ''))}
            aria-pressed={readiness === name}
            onClick={() => setReadiness(name)}
            key={name}
          >
            {name}
          </button>
        ),
      )}
    </div>
  );
  const content = (
    <>
      {createAction}
      <ConnectionNotice
        cached={!!query.data}
        error={query.isError}
        onRetry={() => void query.refetch()}
      />
      <div
        className={uiClass(catalogStyle.scopes)}
        role="radiogroup"
        aria-label={uiText.text_be51a88d392d}
        data-source-scopes
      >
        {(Object.keys(sourceScopes) as Scope[])
          .filter((value) => school || !['Class', 'Organization'].includes(value))
          .map((value) => (
            <label key={value}>
              <NativeInput
                type="radio"
                name="source-scope"
                value={value}
                checked={scope === value}
                onChange={() => {
                  setScope(value);
                  setPage(1);
                }}
              />
              <span>{value === 'Class' ? uiText.text_e7b1ccd0bda3 : sourceScopes[value]}</span>
            </label>
          ))}
      </div>
      <SearchField
        ref={searchInput}
        aria-label={uiText.text_c7ffe2197db2}
        placeholder={uiText.text_8cc9dcd7a18e}
        value={search}
        maxLength={100}
        showEmptyClear
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        onClear={() => {
          setSearch('');
          setPage(1);
        }}
        containerClassName={catalogStyle.search}
      />
      {scope === 'Class' &&
        (classes.isPending ? (
          <LoadingSkeleton />
        ) : classes.isError ? (
          <ErrorState error={classes.error} onRetry={() => void classes.refetch()} />
        ) : (
          <label className={uiClass('field')}>
            {uiText.text_dab8b743e1f2}
            <NativeSelect
              value={classId}
              onChange={(event) => {
                setClass(event.target.value);
                setPage(1);
              }}
            >
              <option value="">{uiText.text_28867895dae8}</option>
              {classes.data.map((row) => (
                <option value={row.id} key={row.id}>
                  {row.title}
                </option>
              ))}
            </NativeSelect>
          </label>
        ))}
      {scope === 'Library' && <div className={uiClass('alert')}>{uiText.text_5a1c9deed686}</div>}
      {scope === 'Class' && (!school || !classId) ? (
        <EmptyState title={uiText.text_3b83b26abcf0} />
      ) : query.isPending ? (
        <LoadingSkeleton />
      ) : query.isError && !query.data ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          <div className={catalogStyle.cards} data-source-list>
            {!rows.length ? (
              <EmptyState title={search ? uiText.text_76263ba743f2 : uiText.text_d00189e07062} />
            ) : (
              rows.map((source) => (
                <article className={catalogStyle.sourceCard} key={source.sourceId}>
                  <Link
                    href={base + '/' + source.sourceId}
                    aria-label={source.title}
                    className={catalogStyle.sourceLink}
                  >
                    <h3 dir="auto">{source.title}</h3>
                    <div className={catalogStyle.file}>
                      {source.scope === 'Library' ? (
                        <LibraryBig size={29} />
                      ) : (
                        <FileText size={29} />
                      )}
                      <span>
                        <b dir="auto">{source.file?.originalFileName ?? source.title}</b>
                        <small>{sourceSummary(source)}</small>
                      </span>
                      <ChevronLeft size={16} />
                    </div>
                    <span
                      className={catalogStyle.readiness}
                      data-ready={source.fileReady && source.sourceReady}
                    >
                      {source.processingStatus === 'Failed'
                        ? uiText.text_bbd429973d6e
                        : source.scope === 'Library'
                          ? uiText.v5Product.libraryMetadata
                          : source.fileReady && source.sourceReady
                            ? uiText.text_376e9c9561e2
                            : uiText.text_58b53f9acd41}
                    </span>
                  </Link>
                  {selection && (
                    <label className={catalogStyle.selection}>
                      <NativeInput
                        type="checkbox"
                        aria-label={uiText.text_390a9cb6ef20 + source.title}
                        disabled={
                          selection.disabled || query.isError || !sourceAiSelectable(source)
                        }
                        checked={
                          sourceAiSelectable(source) &&
                          selection.items.some((item) => item.id === source.sourceId)
                        }
                        onChange={(event) =>
                          selection.onChange(
                            event.target.checked
                              ? [...selection.items, { id: source.sourceId, title: source.title }]
                              : selection.items.filter((item) => item.id !== source.sourceId),
                          )
                        }
                      />
                      <span>
                        {sourceAiSelectable(source)
                          ? uiText.v7Ui.conversationSources
                          : uiText.v6Ui.sourceUnavailable}
                      </span>
                    </label>
                  )}
                </article>
              ))
            )}
          </div>
          {scope !== 'Library' && (
            <V4List>
              <V4Row
                title={uiText.v6Ui.authorizedLibrary}
                description={uiText.v6Ui.authorizedLibraryHint}
                icon={<LibraryBig />}
                onClick={() => {
                  setScope('Library');
                  setPage(1);
                }}
              />
            </V4List>
          )}
          {(page > 1 || query.data!.totalCount > query.data!.pageSize) && (
            <div className={uiClass('between')}>
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {uiText.text_88e65319d694}
              </Button>
              <span className={uiClass('tiny muted')}>
                {uiText.text_2714496eef16}
                {number(page)}
              </span>
              <Button
                variant="ghost"
                disabled={page * query.data!.pageSize >= query.data!.totalCount}
                onClick={() => setPage(page + 1)}
              >
                {uiText.text_12ca1a58c6ca}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
  if (embedded)
    return (
      <section className={catalogStyle.detail} data-assistant-resources>
        {readinessFilter}
        {content}
      </section>
    );
  return (
    <SourceFrame
      headingRef={heading}
      id={chooseType ? 'AST-09' : upload ? 'MK-359' : 'MK-356'}
      title={chooseType ? uiText.v7Ui.sourceTypes : undefined}
      scope={sourceScopes[scope]}
      menu={upload || chooseType ? undefined : readinessFilter}
    >
      {chooseType ? (
        create && (scope !== 'Class' || !!classId) ? (
          <SourceTypeChoice scope={scope} classId={scope === 'Class' ? classId : null} />
        ) : (
          <ErrorState error={new ApiError(403)} />
        )
      ) : upload ? (
        create && (scope !== 'Class' || !!classId) ? (
          <SourceUpload
            key={scope + classId}
            scope={scope as Exclude<Scope, 'Library'>}
            classId={scope === 'Class' ? classId : null}
          />
        ) : (
          <ErrorState error={new ApiError(403)} />
        )
      ) : (
        content
      )}
    </SourceFrame>
  );
}
function SourceTypeChoice({ scope, classId }: { scope: Scope; classId: string | null }) {
  const t = uiText.v7Ui;
  const suffix = new URLSearchParams({ upload: '1', scope, ...(classId ? { classId } : {}) });
  return (
    <div className={catalogStyle.detail} data-source-type-choice>
      <nav className={catalogStyle.studyNavigation} aria-label={t.assistantSections}>
        <Link href={base} aria-current="page">
          {t.sources}
        </Link>
        <Link href="/personal/assistant?view=chat">{t.chat}</Link>
        <span aria-disabled="true">{t.outputs}</span>
      </nav>
      <div className={catalogStyle.lead}>
        <h2>{t.chooseSourceType}</h2>
        <p>{t.sourceTypeHint}</p>
      </div>
      <V4List>
        <V4Row
          title={t.pdfSource}
          description={t.pdfSourceHint}
          icon={<FileText />}
          href={base + '?' + suffix}
        />
        {[
          { title: t.ownedText, hint: t.ownedTextUnavailable, icon: Type },
          { title: t.webSource, hint: t.proposalOff, icon: Globe },
          { title: t.connectorSource, hint: t.sourceConsentHint, icon: Link2 },
        ].map(({ title, hint, icon: Icon }) => (
          <button
            key={title}
            type="button"
            disabled
            className={uiClass('v5-row row', catalogStyle.unavailableType)}
          >
            <span className={uiClass('tile-icon')} aria-hidden="true">
              <Icon />
            </span>
            <span className={uiClass('v5-row-copy grow')}>
              <strong>{title}</strong>
              <small>{hint}</small>
            </span>
          </button>
        ))}
      </V4List>
    </div>
  );
}
function SourceFrame({
  id,
  scope,
  title,
  children,
  actions,
  menu,
  context,
  back,
  summary,
  headingRef,
}: {
  id: string;
  scope?: string;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  menu?: ReactNode;
  context?: ReactNode;
  back?: string;
  summary?: SceneSummary;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <V5Scene
      headingRef={headingRef}
      id={id}
      title={
        title ??
        (id === 'MK-356'
          ? uiText.v6Ui.assistantResources
          : id === 'MK-359'
            ? uiText.text_fe2fa4ad990a
            : uiText.text_8a52f7bc3f5c)
      }
      subtitle={scope && id !== 'MK-356' ? uiText.text_638b8573191f + scope : undefined}
      back={back ?? (id === 'MK-356' ? '/personal/profile' : base)}
      actions={actions}
      menu={menu}
      context={context}
      summary={summary}
    >
      {children}
    </V5Scene>
  );
}
function sourceSummary(source: S['EducationalSourceResult']) {
  return [
    sourceScopes[source.scope],
    source.processingStatus === 'Failed'
      ? uiText.text_bbd429973d6e
      : source.scope === 'Library'
        ? uiText.v5Product.libraryMetadata
        : !source.fileReady
          ? uiText.text_d099cfd756e0 + ': ' + uiText.text_f7b3cdaee0a4
          : source.sourceReady
            ? uiText.text_5d94e336834f
            : uiText.text_58b53f9acd41,
    ...(source.status !== 'Active'
      ? [source.status === 'Archived' ? uiText.text_9defd77e1a5d : uiText.text_4e67bd8e3482]
      : []),
  ].join(' · ');
}
function sourceNavigation(source: S['EducationalSourceResult']) {
  return [
    {
      key: 'content',
      title: uiText.text_c861d4a9c39f,
      detail: uiText.sourceWorkspace.contentHint,
      icon: BookOpen,
      allowed: source.capabilities.canRead,
    },
    {
      key: 'versions',
      title: uiText.text_e8300534d21f,
      detail: uiText.sourceWorkspace.versionHint,
      icon: History,
      allowed:
        source.capabilities.canWrite ||
        source.capabilities.canCreateVersion ||
        source.capabilities.canPublish ||
        source.capabilities.canArchive,
    },
    {
      key: 'visibility',
      title: uiText.text_d90a435157c3,
      detail: uiText.sourceWorkspace.visibilityHint,
      icon: Eye,
      allowed: source.capabilities.canChangeVisibility,
    },
  ].filter((item) => item.allowed);
}
export function SourceStatus({ source }: { source: S['EducationalSourceResult'] }) {
  return (
    <>
      <p className={uiClass(s.meta)}>
        {sourceScopes[source.scope]}
        {uiText.text_78887da22764}{' '}
        {source.publicationStatus === 'Published'
          ? uiText.text_e4f1cf0d1e04
          : uiText.text_410c47c7f8b7}
        {uiText.text_78887da22764}{' '}
        {source.status === 'Archived'
          ? uiText.text_9defd77e1a5d
          : source.status === 'Inactive'
            ? uiText.text_4e67bd8e3482
            : uiText.text_a3fa2a3ffcb9}{' '}
        {uiText.text_530d0a0f20e9}
        {number(source.revision)}
      </p>
      <div className={uiClass(s.row)}>
        {sourceReadiness(source).map((item) => (
          <span key={item.title} className={uiClass(s.status)}>
            {item.title}
            {uiText.text_45822f54a0d0}
            {item.ready ? uiText.text_376e9c9561e2 : uiText.text_f7b3cdaee0a4}
          </span>
        ))}
      </div>
    </>
  );
}
function SourceUpload({
  scope,
  classId,
  source,
  onSaved,
}: {
  scope: Exclude<Scope, 'Library'>;
  classId: string | null;
  source?: S['EducationalSourceResult'];
  onSaved?: (value: S['EducationalSourceResult']) => void | Promise<void>;
}) {
  const formId = useId();
  const { session, call, transfer } = usePersonal(),
    router = useRouter(),
    cache = useQueryClient();
  const [file, setFile] = useState<File>(),
    [asset, setAsset] = useState<S['FileAssetResult']>(),
    [title, setTitle] = useState(source?.title ?? ''),
    [description, setDescription] = useState(source?.description ?? ''),
    [reason, setReason] = useState(''),
    [frozen, setFrozen] = useState<S['CreateEducationalSourceCommand']>(),
    [versionExpected, setVersionExpected] = useState<string>(),
    [restored, setRestored] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  const lock = useRef(false),
    controller = useRef<AbortController | null>(null);
  const key = `makan:draft:source-create:${session.user.id}:${session.revision}:${scope}:${classId ?? ''}`;
  useUnsavedChanges(!!file || !!frozen);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (source) {
      setRestored(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const result = clientValidator({
          $ref: '#/components/schemas/CreateEducationalSourceCommand',
        }).safeParse(JSON.parse(raw));
        if (!result.success) throw new Error(uiText.text_b4ea75ad2e71);
        const value = result.data as S['CreateEducationalSourceCommand'];
        if (value.scope !== scope || value.classId !== classId)
          throw new Error(uiText.text_1fa2b828a69e);
        setFrozen(value);
        setTitle(value.title);
        setDescription(value.description ?? '');
        setReason(value.reason);
      }
      setRestored(true);
    } catch (e) {
      setError(e);
    }
  }, [key, source, scope, classId]);
  async function save() {
    if (lock.current || !restored) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    controller.current = new AbortController();
    try {
      let command = frozen;
      if (!command) {
        if (!file || !title.trim() || !reason.trim()) return;
        let uploaded = asset;
        const suffix = new URLSearchParams({ scope, ...(classId ? { classId } : {}) });
        if (!uploaded) {
          const body = new FormData();
          body.append('File', file);
          uploaded = await transfer<S['FileAssetResult']>('/api/client/source-files?' + suffix, {
            method: 'POST',
            body,
            signal: controller.current.signal,
          });
          setAsset(uploaded);
        } else if (uploaded.status !== 'Ready') {
          uploaded = await transfer<S['FileAssetResult']>(
            '/api/client/source-files/' + uploaded.id + '?' + suffix,
            { signal: controller.current.signal },
          );
          setAsset(uploaded);
        }
        if (uploaded.status !== 'Ready') throw new ApiError(409, { code: 'FILE_NOT_READY' });
        command = {
          clientOperationId: crypto.randomUUID(),
          scope,
          classId,
          title: title.trim(),
          description: description.trim() || null,
          fileAssetId: uploaded.id,
          reason: reason.trim(),
        };
        if (!source) {
          sessionStorage.setItem(key, JSON.stringify(command));
          setFrozen(command);
        }
      }
      if (source && !versionExpected) setVersionExpected(source.version);
      const value = await call<S['EducationalSourceResult']>(
        source ? `/api/v1/sources/${source.sourceId}/versions` : '/api/v1/sources',
        {
          method: 'POST',
          expectedStatus: 200,
          body: JSON.stringify(
            source
              ? {
                  fileAssetId: command.fileAssetId,
                  title: command.title,
                  description: command.description,
                  reason: command.reason,
                  expectedVersion: versionExpected ?? source.version,
                }
              : command,
          ),
        },
      );
      if (
        value.scope !== scope ||
        value.classId !== classId ||
        value.file?.fileAssetId !== command.fileAssetId ||
        (scope === 'Personal' && value.ownerUserId !== session.user.id) ||
        (source &&
          (value.sourceId !== source.sourceId ||
            value.organizationId !== source.organizationId ||
            value.ownerUserId !== source.ownerUserId))
      )
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      if (onSaved) await onSaved(value);
      setFile(undefined);
      setAsset(undefined);
      setFrozen(undefined);
      setVersionExpected(undefined);
      if (!source) sessionStorage.removeItem(key);
      if (!onSaved) router.push(base + '/' + value.sourceId);
    } catch (e) {
      setError(e);
      if (source && e instanceof ApiError && e.status === 412)
        void cache.invalidateQueries({
          queryKey: [
            'personal',
            session.user.id,
            session.revision,
            '/api/v1/sources/' + source.sourceId,
          ],
        });
      if (!source && e instanceof ApiError && [400, 403, 404, 422].includes(e.status)) {
        sessionStorage.removeItem(key);
        setFrozen(undefined);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const actionTitle = busy
    ? uiText.text_b5ef00b1806f
    : frozen
      ? uiText.text_3f86e11c3190
      : asset && asset.status !== 'Ready'
        ? uiText.text_2ec5f09bb601
        : source
          ? uiText.text_6037c81e20c1
          : uiText.text_914c38333ec6;
  const unavailable = busy || !restored || (!frozen && (!file || !title.trim() || !reason.trim()));
  const action = useMemo(
    () => (
      <Button form={formId} type="submit" disabled={unavailable} aria-busy={busy}>
        {actionTitle}
      </Button>
    ),
    [formId, unavailable, busy, actionTitle],
  );
  const actionPresented = useSceneFormAction(action, !source);
  return (
    <section
      className={uiClass(source ? 'card ' + catalogStyle.panel : catalogStyle.upload)}
      aria-label={source ? uiText.text_6b5fcc9a7cd5 : uiText.text_1d488a965baa}
    >
      {source && <h2>{uiText.text_6b5fcc9a7cd5}</h2>}
      <p className={uiClass(s.hint)}>{uiText.text_b7e453cfcea7}</p>
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={busy || !!frozen || !!versionExpected}>
          <label className={uiClass(s.field)}>
            {uiText.text_e3a6d4896346}
            <NativeInput value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={uiClass(s.field)}>
            {uiText.text_be51a88d392d}
            <NativeInput value={sourceScopes[scope]} readOnly />
          </label>
          <label className={uiClass(s.field)}>
            {uiText.text_5e89fc890d9e}
            <NativeTextarea
              value={description}
              maxLength={2000}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className={uiClass(s.field)}>
            {uiText.text_a69eb3885a5b}
            <NativeInput
              type="file"
              onChange={(e) => {
                setFile(e.target.files?.[0]);
                setAsset(undefined);
              }}
            />
          </label>
          <label className={uiClass(s.field)}>
            {uiText.text_dc267e54e1df}
            <NativeInput
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </fieldset>
      </form>
      {asset && (
        <p className={uiClass(s.meta)}>
          {uiText.text_db42134fccc6}{' '}
          {asset.status === 'Ready'
            ? uiText.text_376e9c9561e2
            : asset.status === 'Pending'
              ? uiText.text_10312842c4e7
              : uiText.text_f7b3cdaee0a4}
        </p>
      )}
      {frozen && <p className={uiClass(s.hint)}>{uiText.text_c83a7d86b4fd}</p>}
      {source && versionExpected && versionExpected !== source.version && (
        <>
          <p className={uiClass(s.hint)}>{uiText.text_9cf6d41e477e}</p>
          <ConfirmAction
            title={uiText.text_e3963cf48bc3}
            trigger={uiText.text_1ae4d3eba9ba}
            description={uiText.text_9efe7df540e7}
            disabled={busy}
            onConfirm={async () => {
              setVersionExpected(undefined);
              setError(undefined);
              return true;
            }}
          />
        </>
      )}
      {!actionPresented && action}
      {!!error && <ErrorState error={error} />}
    </section>
  );
}
export function SourceDetail({ id }: { id: string }) {
  const params = useSearchParams();
  const raw = params.get('view');
  const view = ['content', 'versions', 'visibility', 'knowledge'].includes(raw ?? '')
    ? raw!
    : 'overview';
  const heading = useSourceHeading(view);
  const q = usePersonalApi<S['EducationalSourceResult']>('/api/v1/sources/' + id, { poll: 10000 });
  const detail = base + '/' + id;
  const titles: Record<string, string> = {
    overview: uiText.text_4b761b981529,
    content: uiText.text_c861d4a9c39f,
    versions: uiText.text_e8300534d21f,
    visibility: uiText.text_d90a435157c3,
    knowledge: uiText.aiIntegration.knowledge,
  };
  return (
    <SourceFrame
      headingRef={heading}
      id={
        q.data?.scope === 'Library'
          ? 'MK-358'
          : view === 'knowledge'
            ? 'MK-360'
            : view === 'versions'
              ? 'MK-361'
              : 'MK-357'
      }
      title={
        q.data?.scope === 'Library' && view === 'overview' ? uiText.text_4b76e7195c0f : titles[view]
      }
      back={view === 'overview' ? base : detail}
      summary={
        q.data && view === 'overview' && q.data.scope !== 'Library'
          ? sourceNavigation(q.data).map((item) => ({ label: item.title, value: item.detail }))
          : undefined
      }
      menu={
        <div className={uiClass('stack')}>
          <SourceMenuLink href={detail}>{uiText.text_4b761b981529}</SourceMenuLink>
          {q.data?.scope !== 'Library' && (
            <SourceMenuLink href={detail + '?view=knowledge'}>
              {uiText.aiIntegration.knowledge}
            </SourceMenuLink>
          )}
          <Button variant="outline" onClick={() => void q.refetch()}>
            {uiText.text_3ac20a5871e1}
          </Button>
        </div>
      }
    >
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : q.data.sourceId !== id ? (
        <ErrorState error={new ApiError(502, { code: 'CONTRACT_MISMATCH' })} />
      ) : !q.data.capabilities.canRead ||
        (view === 'knowledge' && q.data.scope === 'Library') ||
        (view === 'visibility' && !q.data.capabilities.canChangeVisibility) ||
        (view === 'versions' &&
          !(
            q.data.capabilities.canWrite ||
            q.data.capabilities.canCreateVersion ||
            q.data.capabilities.canPublish ||
            q.data.capabilities.canArchive
          )) ? (
        <ErrorState error={new ApiError(403)} />
      ) : (
        <ResolvedSource key={id} source={q.data} view={view} refresh={() => void q.refetch()} />
      )}
    </SourceFrame>
  );
}
function ResolvedSource({
  source,
  refresh,
  view,
}: {
  source: S['EducationalSourceResult'];
  refresh: () => void;
  view: string;
}) {
  const { call, transfer, session } = usePersonal(),
    cache = useQueryClient();
  const [title, setTitle] = useState(source.title),
    [description, setDescription] = useState(source.description ?? ''),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [success, setSuccess] = useState('');
  const lock = useRef(false),
    controller = useRef<AbortController | null>(null),
    baseline = useRef(source.version);
  const dirty = title !== source.title || description !== (source.description ?? '');
  useUnsavedChanges(dirty);
  useEffect(() => () => controller.current?.abort(), []);
  async function accept(value: S['EducationalSourceResult']) {
    if (
      value.sourceId !== source.sourceId ||
      value.scope !== source.scope ||
      value.ownerUserId !== source.ownerUserId ||
      value.organizationId !== source.organizationId ||
      value.classId !== source.classId
    )
      throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
    cache.setQueryData(
      ['personal', session.user.id, session.revision, '/api/v1/sources/' + source.sourceId],
      value,
    );
    setTitle(value.title);
    setDescription(value.description ?? '');
    baseline.current = value.version;
    setSuccess(uiText.text_a1b4ad75b5a1);
    await cache.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === 'personal' &&
        query.queryKey[1] === session.user.id &&
        query.queryKey[2] === session.revision &&
        query.queryKey.some((key) => typeof key === 'string' && key.startsWith('/api/v1/sources')),
    });
  }
  async function mutate(action: 'draft' | 'publish' | 'archive' | 'visibility') {
    if (lock.current || !reason.trim()) return false;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    setSuccess('');
    try {
      const value = await call<S['EducationalSourceResult']>(
        `/api/v1/sources/${source.sourceId}/${action}`,
        {
          method: action === 'draft' ? 'PATCH' : action === 'visibility' ? 'PUT' : 'POST',
          expectedStatus: 200,
          body: JSON.stringify({
            expectedVersion: baseline.current,
            reason: reason.trim(),
            ...(action === 'draft'
              ? { title: title.trim(), description: description.trim() || null }
              : {}),
            ...(action === 'visibility'
              ? { visibility: source.visibility === 'Public' ? 'Hidden' : 'Public' }
              : {}),
          }),
        },
      );
      if (
        value.currentVersion !== source.currentVersion ||
        (action === 'publish' &&
          (value.publicationStatus !== 'Published' ||
            value.publishedVersion !== value.currentVersion)) ||
        (action === 'archive' && value.status !== 'Archived') ||
        (action === 'draft' && value.publicationStatus !== 'Draft') ||
        (action === 'visibility' &&
          value.visibility !== (source.visibility === 'Public' ? 'Hidden' : 'Public'))
      )
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      await accept(value);
      return true;
    } catch (e) {
      setError(e);
      if (e instanceof ApiError && e.status === 412) refresh();
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function download() {
    if (lock.current || !sourceDownloadable(source)) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    controller.current = new AbortController();
    try {
      const blob = await transfer<Blob>(
        `/api/client/source-files/${source.sourceId}/content?revision=${source.revision}`,
        { signal: controller.current.signal, binary: true, expectedBytes: source.file!.sizeBytes },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = source.file!.originalFileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className={uiClass(catalogStyle.detail)}>
      {view === 'overview' ? (
        <>
          <section className={uiClass('card hero')}>
            <h2 data-source-title>{source.title}</h2>
            <p>
              {source.scope === 'Personal' ? uiText.text_f5c836497867 : sourceScopes[source.scope]}{' '}
              · {uiText.aiIntegration.version} {number(source.currentVersion)}
            </p>
          </section>
          <dl className={uiClass('card v4-meta ' + catalogStyle.readiness)}>
            {sourceReadiness(source).map((item, index) => (
              <div className={uiClass('kv')} data-source-readiness={index} key={item.title}>
                <dt className={uiClass('key')}>
                  {index === 2 ? uiText.navigation_assistant : item.title}
                </dt>
                <dd className={uiClass('val')}>
                  {item.ready
                    ? [
                        sourceDownloadable(source)
                          ? uiText.text_b731da1e2e04
                          : uiText.text_376e9c9561e2,
                        uiText.text_5d94e336834f,
                        uiText.text_c17f0b65eb98,
                      ][index]
                    : uiText.text_f7b3cdaee0a4}
                </dd>
              </div>
            ))}
          </dl>
          {source.scope === 'Library' ? (
            <p className={uiClass('policy')}>{uiText.text_70050e6de11c}</p>
          ) : (
            <div className={uiClass('list')}>
              {sourceNavigation(source).map((item) => (
                <Link
                  className={uiClass('row')}
                  href={`${base}/${source.sourceId}?view=${item.key}`}
                  key={item.key}
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
                </Link>
              ))}
            </div>
          )}
        </>
      ) : null}
      {view === 'content' && (
        <>
          <section className={uiClass('card ' + catalogStyle.panel)}>
            <h2 data-source-title>{source.title}</h2>
            <SourceStatus source={source} />
            <p dir="auto">{source.description}</p>
            <dl className={uiClass(s.detail)}>
              <div>
                <dt>{uiText.text_c1a1a454512d}</dt>
                <dd>
                  {
                    {
                      PendingValidation: uiText.text_e81c80fd6d5f,
                      FileValidated: uiText.text_a94b0a08c898,
                      ReviewRequired: uiText.text_93865396d0f0,
                      Rejected: uiText.text_1d51178c62a6,
                    }[source.safetyStatus]
                  }
                </dd>
              </div>
              <div>
                <dt>{uiText.text_5eb3967bfb0e}</dt>
                <dd>
                  {
                    {
                      NotRequested: uiText.text_b215b3cdccd3,
                      Pending: uiText.text_7f201a60b34b,
                      Processing: uiText.text_68bfe264e2cf,
                      Ready: uiText.text_376e9c9561e2,
                      Failed: uiText.text_bbd429973d6e,
                    }[source.processingStatus]
                  }
                </dd>
              </div>
              <div>
                <dt>{uiText.text_a7659ef6327d}</dt>
                <dd>{date(source.createdAtUtc)}</dd>
              </div>
              {source.file && (
                <div>
                  <dt>{uiText.text_63298350bfb1}</dt>
                  <dd dir="auto">{source.file.originalFileName}</dd>
                </div>
              )}
            </dl>
            {source.aiUnavailableReason && (
              <p className={uiClass(s.hint)}>{uiText.text_059af5880dc1}</p>
            )}
            {sourceDownloadable(source) && (
              <Button disabled={busy} onClick={() => void download()}>
                {uiText.text_195904575930}
              </Button>
            )}
            {source.scope === 'Library' && (
              <p className={uiClass(s.hint)}>{uiText.text_70050e6de11c}</p>
            )}
            <Button variant="outline" onClick={refresh}>
              {uiText.text_3ac20a5871e1}
            </Button>
          </section>
        </>
      )}
      {view === 'knowledge' && (
        <SourceKnowledge key={source.sourceId + ':' + source.currentVersion} source={source} />
      )}
      {['versions', 'visibility'].includes(view) &&
        (source.capabilities.canWrite ||
          source.capabilities.canPublish ||
          source.capabilities.canArchive ||
          source.capabilities.canChangeVisibility) && (
          <section className={uiClass('card ' + catalogStyle.panel)}>
            <h2 data-source-title>{source.title}</h2>
            <SourceStatus source={source} />
            <h2>{uiText.text_8d637ce68405}</h2>
            {view === 'versions' && source.capabilities.canWrite && (
              <>
                <label className={uiClass(s.field)}>
                  {uiText.text_4aed2158ed57}
                  <NativeInput
                    value={title}
                    maxLength={200}
                    disabled={busy}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <label className={uiClass(s.field)}>
                  {uiText.text_3fb8ed5c09ec}
                  <NativeTextarea
                    value={description}
                    maxLength={2000}
                    disabled={busy}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </>
            )}
            <label className={uiClass(s.field)}>
              {uiText.text_3e94e3d48de6}
              <NativeInput
                value={reason}
                maxLength={500}
                disabled={busy}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {baseline.current !== source.version && (
              <p className={uiClass(s.hint)}>{uiText.text_8cd1e858041b}</p>
            )}
            {baseline.current !== source.version && (
              <Button
                variant="outline"
                onClick={() => {
                  baseline.current = source.version;
                  setSuccess(uiText.text_85d9aa97ab20);
                }}
              >
                {uiText.text_3e6fbac4aaf0}
              </Button>
            )}
            <div className={uiClass(s.actions)}>
              {view === 'versions' && source.capabilities.canWrite && (
                <Button
                  disabled={
                    busy || !title.trim() || !reason.trim() || baseline.current !== source.version
                  }
                  onClick={() => void mutate('draft')}
                >
                  {uiText.text_c7be60663550}
                </Button>
              )}
              {view === 'versions' && source.capabilities.canPublish && (
                <ConfirmAction
                  disabled={busy || dirty || !reason.trim() || baseline.current !== source.version}
                  trigger={uiText.text_e91f86d68e00}
                  title={uiText.text_e91f86d68e00}
                  description={uiText.text_fe1f0c9b6301}
                  onConfirm={() => mutate('publish')}
                />
              )}
              {view === 'versions' && source.capabilities.canArchive && (
                <ConfirmAction
                  destructive
                  disabled={busy || dirty || !reason.trim() || baseline.current !== source.version}
                  trigger={uiText.text_28962a621bca}
                  title={uiText.text_28962a621bca}
                  description={uiText.text_e5a46d20e71d}
                  onConfirm={() => mutate('archive')}
                />
              )}
              {view === 'visibility' && source.capabilities.canChangeVisibility && (
                <ConfirmAction
                  disabled={busy || dirty || !reason.trim() || baseline.current !== source.version}
                  trigger={
                    source.visibility === 'Public'
                      ? uiText.text_25634673d188
                      : uiText.text_113ab0e555a2
                  }
                  title={uiText.text_a1aa9c6ac26b}
                  description={uiText.text_7c12d530db7d}
                  onConfirm={() => mutate('visibility')}
                />
              )}
            </div>
          </section>
        )}
      {view === 'versions' &&
        source.scope !== 'Library' &&
        source.capabilities.canCreateVersion && (
          <SourceUpload
            key={source.sourceId}
            source={source}
            scope={source.scope}
            classId={source.classId}
            onSaved={(value) => void accept(value)}
          />
        )}
      {!!success && <p role="status">{success}</p>}
      {!!error && <ErrorState error={error} />}
    </div>
  );
}
