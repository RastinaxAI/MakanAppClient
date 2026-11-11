'use client';
import { Input as NativeInput } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { ReferenceFrame } from '@/features/reference/frame';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { V4List, V4Row } from '@/components/v4/page';
import {
  SceneMenuClose,
  useSceneFormAction,
  useSceneMenuTools,
  useSceneContextSummary,
} from '@/components/v5/form-actions';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import {
  Ban,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Phone,
  Search,
  Users,
  Clock,
} from 'lucide-react';
import { useContext, useId, useMemo, useRef, useState } from 'react';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { useViewState } from '@/components/hooks/use-view-state';
import { useQueryClient } from '@tanstack/react-query';
import f from './privacy.module.css';
import { ProfileAvatar } from '../profile-photo';
import { usePersonal, usePersonalApi } from '../provider';
import { everyonePrivacyDraft, initialPrivacyDraft } from './privacy-model';

type Privacy = components['schemas']['MessagingPrivacySettingsResult'];
type Audience = components['schemas']['PrivacyAudience'];
const t = uiText.privacySettings;
const privacyFields = [
  ['directMessagesAudience', t.direct, uiText.text_aea007437dcd, MessageCircle],
  ['phoneNumberVisibilityAudience', t.phoneVisibility, uiText.text_ff36750eb49e, Phone],
  ['phoneNumberDiscoveryAudience', t.phoneDiscovery, uiText.text_77fdd18e61ea, Search],
  ['groupInvitesAudience', t.groupInvites, uiText.text_d081756dcca9, Users],
  ['onlineAudience', uiText.text_13d5a41bae50, uiText.text_13d5a41bae50, Clock],
  ['lastSeenAudience', uiText.text_f69bd374c9b5, uiText.text_f69bd374c9b5, Clock],
] as const;
type PrivacyKey = (typeof privacyFields)[number][0];

export function MessagingPrivacyPage() {
  const privacy = usePersonalApi<Privacy>('/api/v1/messaging/privacy');
  return (
    <ReferenceFrame id="MK-341" title={t.title} back="/personal/profile">
      {privacy.isPending ? (
        <LoadingSkeleton />
      ) : privacy.isError && !privacy.data ? (
        <ErrorState error={privacy.error} onRetry={() => void privacy.refetch()} />
      ) : (
        <PrivacyForm
          current={privacy.data!}
          reload={async () => {
            const result = await privacy.refetch();
            if (result.isError) throw result.error;
            return result.data;
          }}
        />
      )}
    </ReferenceFrame>
  );
}
function PrivacyForm({
  current,
  reload,
}: {
  current: Privacy;
  reload: () => Promise<Privacy | undefined>;
}) {
  const { call, session } = usePersonal();
  const cache = useQueryClient();
  const formId = useId();
  const closeMenu = useContext(SceneMenuClose);
  const [values, setValues] = useState(() => initialPrivacyDraft(current)),
    [baseline, setBaseline] = useState(current),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<PrivacyKey[] | null>(null);
  const [selection, setSelection] = useState(values);
  const lock = useRef(false);
  const dirty = privacyFields.some(([key]) => values[key] !== baseline[key]);
  useUnsavedChanges(dirty);
  const action = useMemo(
    () => (
      <Button
        type="submit"
        form={formId}
        disabled={busy || !dirty}
        aria-busy={busy}
        data-privacy-actions
      >
        {busy ? uiText.text_b5ef00b1806f : t.save}
      </Button>
    ),
    [formId, busy, dirty],
  );
  const lifted = useSceneFormAction(action);
  const rows = privacyFields.slice(0, 4).map(([key, title, , Icon]) => ({
    title,
    value: t.audiences[values[key]!],
    Icon,
    keys: [key] as PrivacyKey[],
  }));
  const presenceKeys = privacyFields
    .slice(4)
    .map(([key]) => key)
    .filter((key) => values[key] !== undefined);
  if (presenceKeys.length)
    rows.push({
      title: t.presence,
      value: presenceKeys.map((key) => t.audiences[values[key]!]).join(' · '),
      Icon: Clock,
      keys: presenceKeys,
    });
  useSceneContextSummary(rows.map(({ title, value }) => ({ label: title, value })));
  const tools = useMemo(
    () => (
      <div className={uiClass('stack')}>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setValues(everyonePrivacyDraft(values));
            setSaved(false);
            closeMenu?.();
          }}
        >
          {uiText.messagingPrivacyDefaults.everyone}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            if (dirty && !window.confirm(uiText.text_e00522c63330)) return;
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            try {
              const next = await reload();
              if (next) {
                setValues(next);
                setBaseline(next);
                setSaved(false);
                setError(undefined);
                closeMenu?.();
              }
            } catch (problem) {
              setError(problem);
            } finally {
              setBusy(false);
              lock.current = false;
            }
          }}
        >
          {uiText.text_aae95f355460}
        </Button>
        <V4List>
          <V4Row
            title={uiText.text_3393e0c3cb74}
            description={uiText.text_a636c65f53a1}
            icon={<Ban />}
            href="/personal/settings/blocked"
          />
          <V4Row
            title={uiText.text_49475717c2c3}
            description={uiText.text_9972b94c18ef}
            icon={<ShieldCheck />}
            href="/personal/profile/details"
          />
          <V4Row
            title={uiText.text_a62bc2f40f0c}
            description={uiText.text_0dfe1563bdb0}
            icon={<Users />}
            href="/personal/education/guardians"
          />
        </V4List>
      </div>
    ),
    [busy, values, dirty, reload, closeMenu],
  );
  const inMenu = useSceneMenuTools(tools);
  const direct = editing?.[0] === 'directMessagesAudience';
  return (
    <>
      <form
        id={formId}
        className={uiClass(f.form)}
        data-privacy-form
        onSubmit={async (event) => {
          event.preventDefault();
          if (lock.current || !dirty) return;
          lock.current = true;
          setBusy(true);
          setError(undefined);
          setSaved(false);
          try {
            const body: components['schemas']['UpdateMessagingPrivacyCommand'] = {
              directMessagesAudience: values.directMessagesAudience,
              phoneNumberVisibilityAudience: values.phoneNumberVisibilityAudience,
              phoneNumberDiscoveryAudience: values.phoneNumberDiscoveryAudience,
              groupInvitesAudience: values.groupInvitesAudience,
              expectedVersion: baseline.version,
              ...(values.onlineAudience !== undefined
                ? { onlineAudience: values.onlineAudience }
                : {}),
              ...(values.lastSeenAudience !== undefined
                ? { lastSeenAudience: values.lastSeenAudience }
                : {}),
            };
            const result = await call<Privacy>('/api/v1/messaging/privacy', {
              method: 'PUT',
              body: JSON.stringify(body),
            });
            setValues(result);
            setBaseline(result);
            setSaved(true);
            cache.setQueryData(
              ['personal', session.user.id, session.revision, '/api/v1/messaging/privacy'],
              result,
            );
          } catch (problem) {
            setError(problem);
          } finally {
            setBusy(false);
            lock.current = false;
          }
        }}
      >
        <V4List>
          {rows.map(({ title, value, Icon, keys }) => (
            <V4Row
              key={keys[0]}
              title={title}
              description={value}
              testId={'privacy-' + keys[0]}
              icon={<Icon />}
              disabled={busy}
              onClick={() => {
                if (busy) return;
                setSelection(values);
                setEditing(keys);
              }}
            />
          ))}
        </V4List>
        {!baseline.isExplicit && dirty && (
          <p className={uiClass('policy')}>{uiText.messagingPrivacyDefaults.unsaved}</p>
        )}
        {baseline.isExplicit && dirty && <p className={uiClass('policy')}>{t.draftHint}</p>}
        {!!error && <ErrorState error={error} />}
        {saved && (
          <p className={uiClass(f.success)} role="status">
            <CheckCircle2 size={18} />
            {uiText.text_b0806e32d30f}
          </p>
        )}
        {!lifted && action}
        {!inMenu && tools}
      </form>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent
          title={
            direct
              ? t.directDialog
              : rows.find((row) => row.keys[0] === editing?.[0])?.title || t.choose
          }
          description={t.draftHint}
          descriptionHidden
          scenario={direct ? 'MK-342' : undefined}
          footer={
            <div className={uiClass('confirm-actions')}>
              <Button
                onClick={() => {
                  setValues((previous) => {
                    const next = { ...previous };
                    for (const key of editing ?? []) {
                      const value = selection[key];
                      if (value !== undefined) next[key] = value;
                    }
                    return next;
                  });
                  setSaved(false);
                  setEditing(null);
                }}
              >
                {direct ? t.applyDirect : t.apply}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                {uiText.text_fa7af603d430}
              </Button>
            </div>
          }
        >
          {(editing ?? []).map((key) => (
            <fieldset className={uiClass('v5-choice-list')} key={key}>
              <legend className={uiClass(editing?.length === 1 ? 'sr-only' : f.legend)}>
                {privacyFields.find(([field]) => field === key)?.[2]}
              </legend>
              {(Object.keys(t.audiences) as Audience[]).map((audience) => (
                <label key={audience}>
                  <NativeInput
                    type="radio"
                    name={key}
                    aria-label={t.audiences[audience]}
                    value={audience}
                    checked={selection[key] === audience}
                    onChange={() => setSelection((previous) => ({ ...previous, [key]: audience }))}
                  />
                  <span className={uiClass('grow')}>
                    <strong>{t.audiences[audience]}</strong>
                    <small>{t.audienceDescriptions[audience]}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function BlockedAccountsPage() {
  return (
    <ReferenceFrame id="MK-343" title={t.blockedTitle} back="/personal/settings/privacy">
      <BlockedPeople />
    </ReferenceFrame>
  );
}
function BlockedPeople() {
  const { call, session } = usePersonal();
  const [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<string | null>(null),
    [error, setError] = useState<unknown>();
  const lock = useRef(false);
  const [search, setSearch] = useViewState(
    session.user.id + ':blocked-search',
    '',
    (value): value is string => typeof value === 'string' && value.length <= 200,
  );
  const blocked = usePersonalApi<components['schemas']['BlockedUserResult'][]>(
    '/api/v1/messaging/blocks',
  );
  const visible = (blocked.data ?? []).filter((item) =>
    (item.user.displayName + ' ' + (item.user.username ?? ''))
      .toLocaleLowerCase('fa')
      .includes(search.trim().toLocaleLowerCase('fa')),
  );
  const chosen = visible.find((item) => item.user.userId === selected) ?? visible[0];
  const action = useMemo(
    () => (
      <Button
        disabled={busy || !chosen || blocked.isError}
        aria-busy={busy}
        onClick={async () => {
          if (lock.current || !chosen || blocked.isError) return;
          lock.current = true;
          setBusy(true);
          setError(undefined);
          try {
            await call('/api/v1/messaging/blocks/' + chosen.user.userId, { method: 'DELETE' });
            await blocked.refetch();
            setSelected(null);
          } catch (problem) {
            setError(problem);
          } finally {
            setBusy(false);
            lock.current = false;
          }
        }}
      >
        {busy ? uiText.text_b5ef00b1806f : t.unblockSelected}
      </Button>
    ),
    [busy, chosen, blocked.isError, blocked.refetch, call],
  );
  const lifted = useSceneFormAction(action);
  useSceneContextSummary(
    visible.map((item) => ({
      label: item.user.displayName,
      value: uiText.text_616dd96097f5,
    })),
  );
  return (
    <>
      <label className={uiClass('search')}>
        <Search size={19} />
        <NativeInput
          aria-label={t.blockedSearch}
          placeholder={t.blockedSearch}
          value={search}
          maxLength={200}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelected(null);
          }}
        />
      </label>
      {blocked.isPending ? (
        <LoadingSkeleton />
      ) : blocked.isError ? (
        <ErrorState error={blocked.error} onRetry={() => void blocked.refetch()} />
      ) : !visible.length ? (
        <EmptyState
          title={blocked.data.length ? uiText.text_2c34dd61a34f : uiText.text_8fa2b3ccd332}
          description={!blocked.data.length ? uiText.text_92d06ba85662 : undefined}
        />
      ) : (
        <V4List>
          {visible.map((item) => (
            <V4Row
              key={item.blockId}
              title={item.user.displayName}
              description={uiText.text_616dd96097f5}
              iconClassName={f.avatarSlot}
              icon={
                <ProfileAvatar
                  photo={item.user.profilePhoto}
                  name={item.user.displayName}
                  className={uiClass('avatar')}
                />
              }
              pressed={chosen?.user.userId === item.user.userId}
              disabled={busy}
              onClick={() => setSelected(item.user.userId)}
            />
          ))}
        </V4List>
      )}
      {!lifted && action}
      {!!error && <ErrorState error={error} />}
    </>
  );
}
