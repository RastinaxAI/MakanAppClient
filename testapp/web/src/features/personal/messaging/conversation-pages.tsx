'use client';
import { Input as NativeInput, Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { V5Scene } from '@/components/v5/scene';
import { ViewTabs } from '@/components/ui/tabs';
import { useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Images,
  Image as ImageIcon,
  Users,
  Settings2,
  MessageCircle,
  Shield,
  Lock,
  History,
  Link2,
  List,
  Heart,
  Hand,
  MessagesSquare,
  Bell,
  Search,
  Video,
  Files,
  Pin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { V4List, V4Row } from '@/components/v4/page';
import {
  SceneMenuClose,
  useSceneMenuTools,
  useSceneContextSummary,
} from '@/components/v5/form-actions';
import { useViewState } from '@/components/hooks/use-view-state';
import { contextSignature } from '@/lib/client-surface';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import type { components } from '@/generated/api/schema';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { findConversationSummary, isManagedConversation } from './summary';
import { conversationRoleLabels, conversationTitle } from './model';
import { MessageAttachment } from './media';
import { safeImagePreview } from './media-model';
import { useMessagingLive } from './live';
import { OfficialBadge, OfficialIdentity, useOfficialConversationAccess } from './official';
import c from './conversation-pages.module.css';
import { ConversationInviteLinks } from './invite-links';
import { ConversationTopics } from './topics';
import { ConversationEditorAction } from './conversation-action-slot';
import { ConversationRichTools, RichToolLinks, type RichSection } from './rich-messages';
import {
  canManageMembers,
  conversationCapability,
  canManageConversation,
} from './management-policy';
import { MessagingSurface } from './messaging-surface';
import { ProfileAvatar } from '../profile-photo';
import { ConversationPhotoEditor, ConversationAvatar } from './conversation-photo';
import { MessengerSearchResults } from './search';
import {
  ConversationInfoEditor,
  AddConversationMember,
  MemberManagement,
  ConversationInteractionProvider,
} from './management';
import { SettingRow, UnavailableSetting, MuteAction } from './conversation-controls';
type S = components['schemas'];
export type ConversationSection =
  | 'info'
  | 'members'
  | 'media'
  | 'settings'
  | 'edit'
  | 'invites'
  | 'topics'
  | RichSection;
const route = (id: string) => '/personal/messages/' + id;
export function ConversationPage({ id, section }: { id: string; section: ConversationSection }) {
  const { session } = usePersonal();
  return (
    <ConversationInteractionProvider
      key={
        session.user.id +
        ':' +
        session.context.sessionId +
        ':' +
        id +
        ':' +
        (section === 'members' ? 'media' : section)
      }
    >
      <ConversationPageContent id={id} section={section} />
    </ConversationInteractionProvider>
  );
}
function ConversationPageContent({ id, section }: { id: string; section: ConversationSection }) {
  const { session, call } = usePersonal();
  const q = useQuery({
    queryKey: ['personal', session.user.id, session.revision, 'conversation-summary', id],
    queryFn: ({ signal }) =>
      findConversationSummary(
        id,
        (p) => call<S['ConversationSummaryResult']>(p, { signal }),
        signal,
      ),
    retry: false,
    refetchInterval: 15000,
  });
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  return <ResolvedConversationPage id={id} section={section} summary={q.data} />;
}
function ResolvedConversationPage({
  id,
  section,
  summary,
}: {
  id: string;
  section: ConversationSection;
  summary: S['ConversationSummaryResult'];
}) {
  const { session } = usePersonal();
  const params = useSearchParams();
  const inviteView = params.get('view');
  const [editorAction, setEditorAction] = useState<ReactNode>(null);
  const access = useOfficialConversationAccess(summary);
  const rich = ['poll-new', 'quiz-new', 'checklist-new', 'scheduled'].includes(section);
  const needsManagement = ['settings', 'edit', 'invites', 'topics'].includes(section);
  const managed = usePersonalApi<S['ManagedConversationResult']>('/api/v1/conversations/' + id, {
    enabled:
      isManagedConversation(summary.type) &&
      !rich &&
      access.ready &&
      (!needsManagement || access.canManage),
  });
  const member =
    managed.isSuccess &&
    managed.data?.conversationId === id &&
    Array.isArray(managed.data.participants)
      ? managed.data.participants.find(
          (participant) =>
            participant.user.userId === session.user.id && participant.status === 'Active',
        )
      : undefined;
  if (access.error)
    return <ErrorState error={access.error} onRetry={() => void access.refetch()} />;
  if (!access.ready) return <LoadingSkeleton />;
  if (['poll-new', 'quiz-new', 'checklist-new', 'scheduled'].includes(section))
    return <ConversationRichTools id={id} summary={summary} section={section as RichSection} />;
  const channel = summary.type === 'Channel';
  const scene =
    section === 'info'
      ? channel
        ? 'MK-197'
        : summary.type === 'Group'
          ? 'MK-194'
          : 'MK-180'
      : section === 'edit'
        ? channel
          ? 'MK-198'
          : 'MK-195'
        : section === 'members'
          ? 'MK-239'
          : section === 'media'
            ? 'MK-239'
            : section === 'invites'
              ? inviteView === 'new'
                ? 'MK-215'
                : inviteView === 'requests'
                  ? 'MK-219'
                  : 'MK-216'
              : section === 'topics'
                ? 'MK-224'
                : 'MK-200';
  const titles: Record<string, string> = {
    info: channel
      ? uiText.text_cc139334bedd
      : summary.type === 'Group'
        ? uiText.text_52d7d84bf065
        : uiText.text_e02d12375642,
    edit: channel ? uiText.text_692d5f61506b : uiText.text_b3fb229e6d10,
    members: channel ? uiText.v5Product.channelMembersTitle : uiText.v5Product.groupMembersTitle,
    media: channel
      ? uiText.v5Product.channelMediaTitle
      : summary.type === 'Group'
        ? uiText.v5Product.groupMediaTitle
        : uiText.text_563cba00d087,
    settings: channel ? uiText.v5Product.channelSettingsTitle : uiText.v5Product.groupSettingsTitle,
    invites:
      inviteView === 'new'
        ? uiText.v5Product.newInviteLinkTitle
        : inviteView === 'requests'
          ? uiText.v5Product.groupJoinRequestsTitle
          : uiText.v5Product.inviteLinksTitle,
    topics: uiText.text_0de00f83cacf,
  };
  return (
    <MessagingSurface full>
      <ConversationEditorAction.Provider value={setEditorAction}>
        <V5Scene
          id={scene}
          title={
            ['members', 'media'].includes(section)
              ? uiText.messengerPdf.conversationLibrary
              : titles[section] || conversationTitle(summary)
          }
          actions={section === 'edit' ? editorAction : undefined}
          menu={
            section === 'info' ? (
              <div className={uiClass('stack')}>
                <RichToolLinks id={id} />
                <Button asChild variant="outline">
                  <Link href={route(id)}>{uiText.navigation_messages}</Link>
                </Button>
              </div>
            ) : undefined
          }
          subtitle={
            isManagedConversation(summary.type)
              ? member
                ? uiText.v5Product.conversationMemberRoles[member.role]
                : undefined
              : conversationTitle(summary)
          }
          contextTitle={
            isManagedConversation(summary.type) ? uiText.v5Product.myConversations : undefined
          }
          back={
            section === 'invites' && ['new', 'requests'].includes(inviteView ?? '')
              ? route(id) + '/invites'
              : section === 'info'
                ? route(id) + '?focus=info'
                : ['edit', 'members', 'media'].includes(section)
                  ? route(id) + '/info'
                  : route(id) + '/edit'
          }
        >
          <ConversationSubscription id={id} />
          {section === 'info' && <OfficialIdentity summary={summary} />}
          {['info', 'media'].includes(section) && !isManagedConversation(summary.type) && (
            <div
              className={uiClass(
                `${c.identityCard} ${section === 'info' ? c.profileIdentity : ''}`,
              )}
            >
              <ProfileAvatar
                photo={summary.otherParticipant?.profilePhoto}
                name={conversationTitle(summary)}
                className={uiClass(c.heroAvatar)}
              />
              <div>
                <h2>{conversationTitle(summary)}</h2>
                {section === 'info' && (
                  <p className={uiClass(c.heroSubtitle)}>
                    {summary.type === 'Saved' ? (
                      uiText.text_9f3597ff2f66
                    ) : summary.otherParticipant?.username ? (
                      <bdi dir="ltr">
                        {uiText.text_c3641f8544d7}
                        {summary.otherParticipant.username}
                      </bdi>
                    ) : (
                      uiText.text_8f421b73047d
                    )}
                  </p>
                )}
                <div>
                  <OfficialBadge summary={summary} />
                </div>
              </div>
            </div>
          )}
          {['media', 'members'].includes(section) && isManagedConversation(summary.type) && (
            <div className={c.libraryIdentity}>
              <ConversationAvatar
                id={id}
                name={conversationTitle(summary)}
                photo={managed.data?.conversationId === id ? managed.data.photo : summary.photo}
                className={c.libraryAvatar}
              />
              <div>
                <h2>{conversationTitle(summary)}</h2>
              </div>
            </div>
          )}
          {['media', 'members'].includes(section) ? (
            <ConversationMedia
              id={id}
              managed={isManagedConversation(summary.type)}
              initialTab={section === 'members' ? 'members' : 'media'}
              members={managed.data?.conversationId === id ? managed.data : undefined}
              membersError={managed.error}
              retryMembers={() => void managed.refetch()}
            />
          ) : isManagedConversation(summary.type) ? (
            ['settings', 'edit', 'invites', 'topics'].includes(section) && !access.canManage ? (
              <EmptyState title={uiText.text_12512b4e3543} />
            ) : (
              <ManagedPage id={id} section={section} summary={summary} />
            )
          ) : section === 'info' ? (
            <DirectInfo summary={summary} />
          ) : (
            <ErrorState error={new ApiError(404)} />
          )}
        </V5Scene>
      </ConversationEditorAction.Provider>
    </MessagingSurface>
  );
}
function ConversationSubscription({ id }: { id: string }) {
  const { subscribe } = useMessagingLive();
  useEffect(() => subscribe(id), [id, subscribe]);
  return null;
}
function DirectInfo({ summary }: { summary: S['ConversationSummaryResult'] }) {
  const { call } = usePersonal();
  const cache = useQueryClient();
  const router = useRouter();
  const [block, setBlock] = useState(false);
  const blockTrigger = useRef<HTMLElement | null>(null);
  const tools = useMemo(
    () => (
      <div className="stack">
        <MuteAction summary={summary} />
        <ArchiveAction id={summary.conversationId} archived={summary.isArchived} />
      </div>
    ),
    [summary],
  );
  useSceneMenuTools(tools);
  return (
    <>
      <V4List>
        <V4Row
          title={uiText.text_563cba00d087}
          icon={<Files />}
          href={route(summary.conversationId) + '/media'}
        />
        <V4Row
          title={uiText.messengerPdf.pins}
          icon={<Pin />}
          href={route(summary.conversationId) + '/media?library=pins'}
        />
        <V4Row
          title={uiText.messengerPdf.links}
          icon={<Link2 />}
          href={route(summary.conversationId) + '/media?library=links'}
        />
        {summary.type === 'Direct' && summary.otherParticipant && (
          <V4Row
            title={uiText.v7Ui.blockAccount}
            icon={<Lock />}
            onClick={() => {
              blockTrigger.current = document.activeElement as HTMLElement;
              setBlock(true);
            }}
          />
        )}
      </V4List>
      {summary.otherParticipant && (
        <ConfirmAction
          hideTrigger
          open={block}
          onOpenChange={setBlock}
          trigger={uiText.v7Ui.blockAccount}
          title={uiText.v7Ui.blockAccount}
          description={uiText.v7Ui.blockAccountHint}
          confirm={uiText.v7Ui.blockAccount}
          destructive
          onCloseAutoFocus={(event) => {
            if (blockTrigger.current?.isConnected) {
              event.preventDefault();
              blockTrigger.current.focus();
            }
          }}
          onConfirm={async () => {
            const targetUserId = summary.otherParticipant?.userId;
            if (!targetUserId) throw new ApiError(403);
            const result = await call<S['UserBlockResult']>(
              '/api/v1/messaging/blocks/' + targetUserId,
              { method: 'POST', scope: 'account' },
            );
            if (
              result.blockedUser.userId !== targetUserId ||
              result.status !== 'Active' ||
              !result.blockId ||
              !result.version.trim()
            )
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            router.replace('/personal/messages');
            await cache.invalidateQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (value) =>
                    typeof value === 'string' &&
                    (value.includes('conversation') || value.includes('/messaging/blocks')),
                ),
            });
            return true;
          }}
        />
      )}
    </>
  );
}
function ManagedPage({
  id,
  section,
  summary,
}: {
  id: string;
  section: ConversationSection;
  summary: S['ConversationSummaryResult'];
}) {
  const q = usePersonalApi<S['ManagedConversationResult']>('/api/v1/conversations/' + id, {
    poll: 5000,
  });
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  if (q.data.conversationId !== id || !Array.isArray(q.data.participants))
    return <ErrorState error={new ApiError(502)} />;
  return section === 'members' ? (
    <ConversationMembers id={id} value={q.data} />
  ) : section === 'edit' ? (
    <ConversationInfoEditor value={q.data}>
      <ConversationEditOptions value={q.data} />
    </ConversationInfoEditor>
  ) : section === 'invites' ? (
    <ConversationInviteLinks value={q.data} />
  ) : section === 'topics' ? (
    <ConversationTopics value={q.data} />
  ) : section === 'settings' ? (
    <ConversationSettings value={q.data} />
  ) : (
    <ManagedInfo value={q.data} summary={summary} />
  );
}
function ConversationEditOptions({ value }: { value: S['ManagedConversationResult'] }) {
  const closeMenu = useContext(SceneMenuClose);
  const [photo, setPhoto] = useState(false);
  const photoTrigger = useRef<HTMLDivElement>(null);
  const channel = value.type === 'Channel';
  const photoTitle = channel ? uiText.v5Product.channelPhoto : uiText.v5Product.groupPhoto;
  const photoAction = useMemo(
    () => (
      <V4Row
        title={photoTitle}
        description={uiText.v5Product.conversationPhotoDescription}
        icon={<ImageIcon />}
        onClick={() => {
          closeMenu?.();
          setPhoto(true);
        }}
      />
    ),
    [photoTitle, closeMenu],
  );
  const tools = useMemo(
    () => (
      <div className={uiClass('stack')}>
        <ManagementRows value={value} />
      </div>
    ),
    [value],
  );
  const inMenu = useSceneMenuTools(tools);
  return (
    <>
      {conversationCapability(value, 'canEditInfo') && (
        <div ref={photoTrigger}>
          <V4List>{photoAction}</V4List>
        </div>
      )}
      {!inMenu && tools}
      <Dialog open={photo} onOpenChange={setPhoto}>
        <DialogContent
          title={photoTitle}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            photoTrigger.current?.querySelector('button')?.focus();
          }}
        >
          <ConversationPhotoEditor value={value} />
        </DialogContent>
      </Dialog>
    </>
  );
}
function ManagedInfo({
  value,
  summary,
}: {
  value: S['ManagedConversationResult'];
  summary: S['ConversationSummaryResult'];
}) {
  const { call, session } = usePersonal(),
    router = useRouter();
  const cache = useQueryClient();
  const owner = canManageConversation(value);
  const channel = value.type === 'Channel';
  const [notification, setNotification] = useState(false);
  const rows = [
    ...(!channel
      ? [
          {
            title: uiText.text_a5f9af4e336a,
            description: uiText.v5Product.conversationMembersDescription,
            Icon: Users,
            href: route(value.conversationId) + '/members',
          },
        ]
      : []),
    {
      title: uiText.text_563cba00d087,
      description: channel
        ? uiText.text_757dc74803e0
        : uiText.v5Product.conversationMediaDescription,
      Icon: Images,
      href: route(value.conversationId) + '/media',
    },
    ...(channel
      ? [
          {
            title: uiText.v5Product.channelNotifications,
            description: uiText.v5Product.channelNotificationsDescription,
            Icon: Bell,
            href: '',
          },
          {
            title: uiText.text_d03ebcbee43f,
            description: uiText.text_7e55ad7a8ca8,
            Icon: Users,
            href: route(value.conversationId) + '/members',
          },
        ]
      : []),
    ...(conversationCapability(value, 'canManageInvites')
      ? [
          {
            title: uiText.v5Product.conversationInvites,
            description: uiText.v5Product.conversationInvitesDescription,
            Icon: Link2,
            href: route(value.conversationId) + '/invites',
          },
        ]
      : []),
    ...(owner
      ? [
          {
            title: channel ? uiText.text_0b9e68551045 : uiText.text_c72d0ff183f6,
            description: uiText.v5Product.conversationSettingsDescription,
            Icon: Settings2,
            href: route(value.conversationId) + '/settings',
          },
        ]
      : []),
  ];
  useSceneContextSummary(rows.map((row) => ({ label: row.title, value: row.description })));
  const tools = useMemo(
    () => (
      <div className={uiClass('stack')}>
        {conversationCapability(value, 'canEditInfo') && (
          <Button asChild variant="outline">
            <Link href={route(value.conversationId) + '/edit'}>{uiText.text_7f018872aab1}</Link>
          </Button>
        )}
        <MuteAction summary={summary} />
        <p className={uiClass(c.body)} dir="auto">
          {value.description || uiText.text_4d3401e58f25}
        </p>
        <dl className={uiClass(c.details)}>
          <div>
            <Lock size={19} />
            <div>
              <dt>{channel ? uiText.text_1b68cebe6d65 : uiText.text_b9eed0dd74cd}</dt>
              <dd>
                {value.visibility === 'Public'
                  ? uiText.text_526e310df41f
                  : uiText.text_e205d3a7a33e}
              </dd>
            </div>
          </div>
          {!channel && (
            <div>
              <History size={19} />
              <div>
                <dt>{uiText.text_88712bbe9ebc}</dt>
                <dd>
                  {value.groupHistoryPolicy === 'FromJoin'
                    ? uiText.text_c693180e811e
                    : uiText.text_747182bc8309}
                </dd>
              </div>
            </div>
          )}
        </dl>
        {value.managementPolicy === 'SystemManagedAcademic' ? (
          <p className={uiClass(c.note)}>{uiText.text_01793b42b2ba}</p>
        ) : (
          <ConfirmAction
            destructive
            title={uiText.text_9299c9dc14c6}
            scenario="MK-256 MK-448"
            trigger={channel ? uiText.text_c71a9ac02f77 : uiText.text_25e26909e1ab}
            description={uiText.text_2b09c8612d26}
            confirm={uiText.text_9299c9dc14c6}
            onConfirm={async () => {
              await call('/api/v1/conversations/' + value.conversationId + '/leave', {
                method: 'POST',
              });
              void cache.invalidateQueries({
                queryKey: ['personal', session.user.id, session.revision],
              });
              router.replace('/personal/messages');
              return true;
            }}
          />
        )}
      </div>
    ),
    [value, summary, channel, call, cache, session.user.id, session.revision, router],
  );
  const inMenu = useSceneMenuTools(tools);
  return (
    <>
      <div className={c.libraryIdentity}>
        <ConversationAvatar
          id={value.conversationId}
          name={value.title}
          photo={value.photo}
          className={c.libraryAvatar}
        />
        <div>
          <h2>{value.title}</h2>
          {value.description && <p>{value.description}</p>}
        </div>
      </div>
      <ConversationMedia
        id={value.conversationId}
        managed
        initialTab="members"
        members={value}
        retryMembers={() =>
          void cache.invalidateQueries({
            queryKey: [
              'personal',
              session.user.id,
              session.revision,
              '/api/v1/conversations/' + value.conversationId,
            ],
          })
        }
      />
      {!inMenu && tools}
      <Dialog open={notification} onOpenChange={setNotification}>
        <DialogContent
          title={uiText.v5Product.channelNotifications}
          description={uiText.v5Product.channelNotificationsDescription}
        >
          <MuteAction summary={summary} />
        </DialogContent>
      </Dialog>
    </>
  );
}
function ManagementRows({ value }: { value: S['ManagedConversationResult'] }) {
  if (!canManageConversation(value)) return null;
  const base = route(value.conversationId),
    channel = value.type === 'Channel';
  return (
    <section className={uiClass(c.managementCards)} aria-label={uiText.text_76c4dcda8d25}>
      <div className={uiClass(c.rowCard)}>
        {conversationCapability(value, 'canChangeSettings') && (
          <SettingRow
            icon={channel ? MessagesSquare : Users}
            title={channel ? uiText.text_1b68cebe6d65 : uiText.text_b9eed0dd74cd}
            value={
              value.visibility === 'Public' ? uiText.text_526e310df41f : uiText.text_e205d3a7a33e
            }
            href={base + '/settings'}
          />
        )}
        {!channel && conversationCapability(value, 'canChangeSettings') && (
          <SettingRow
            icon={History}
            title={uiText.text_93241310d77c}
            value={
              value.groupHistoryPolicy === 'FromJoin'
                ? uiText.text_c693180e811e
                : uiText.text_4e95f3ce6edd
            }
            href={base + '/settings'}
          />
        )}
        {!channel && conversationCapability(value, 'canManageTopics') && (
          <SettingRow icon={List} title={uiText.text_7d6bf52fbd3e} href={base + '/topics'} />
        )}
        {channel && (
          <UnavailableSetting
            icon={MessageCircle}
            title={uiText.text_2226ed46e579}
            description={uiText.text_30b5f221253e}
          />
        )}
      </div>
      <div className={uiClass(c.rowCard)}>
        {conversationCapability(value, 'canManageInvites') && (
          <SettingRow icon={Link2} title={uiText.text_10c263e49b58} href={base + '/invites'} />
        )}
        {(conversationCapability(value, 'canManageMembers') ||
          conversationCapability(value, 'canManageAdmins')) && (
          <SettingRow icon={Shield} title={uiText.text_a5f9af4e336a} href={base + '/members'} />
        )}
        <PermissionCatalog value={value} />
      </div>
      <div className={uiClass(c.rowCard)}>
        <UnavailableSetting
          icon={Heart}
          title={uiText.text_6e0960982174}
          description={uiText.text_659615a7e539}
        />
        <UnavailableSetting
          icon={Hand}
          title={uiText.text_b2c00b4bfc07}
          description={uiText.text_53c8f001930c}
        />
        <UnavailableSetting
          icon={Video}
          title={channel ? uiText.text_7ac728600e49 : uiText.text_ab5201540315}
          description={uiText.text_7d03f42270a4}
        />
      </div>
    </section>
  );
}
function ConversationMembers({ id, value }: { id: string; value: S['ManagedConversationResult'] }) {
  const { session } = usePersonal();
  const owner = canManageMembers(value, session.user.id);
  const memory =
    session.user.id + ':' + contextSignature(session.context) + ':conversation-members:' + id;
  const [page, setPage] = useViewState(
    memory + ':page',
    1,
    (n): n is number => Number.isSafeInteger(n) && Number(n) > 0 && Number(n) <= 1000000,
  );
  const [search, setSearch] = useViewState(
    memory + ':search',
    '',
    (s): s is string => typeof s === 'string' && s.length <= 200,
  );
  const [admins, setAdmins] = useViewState(
    memory + ':admins',
    false,
    (s): s is boolean => typeof s === 'boolean',
  );
  const q = usePersonalApi<S['ConversationParticipantPageResult']>(
    `/api/v1/conversations/${id}/members?page=${page}&pageSize=30`,
    { poll: 5000 },
  );
  const addMember = useMemo(
    () =>
      conversationCapability(value, 'canInviteMembers') ? (
        <AddConversationMember value={value} />
      ) : null,
    [value],
  );
  const visible = (q.data?.items ?? []).filter(
    (member) =>
      (!admins || member.role !== 'Member') &&
      (member.user.displayName + ' ' + (member.user.username ?? ''))
        .toLocaleLowerCase('fa')
        .includes(search.trim().toLocaleLowerCase('fa')),
  );
  useSceneContextSummary(
    visible.slice(0, 3).map((member) => ({
      label: member.user.displayName,
      value: uiText.v5Product.conversationMemberRoles[member.role],
    })),
  );
  return (
    <section className={c.members}>
      <label className={uiClass(`search ${c.memberSearch}`)}>
        <Search size={19} />
        <NativeInput
          aria-label={uiText.v5Product.memberNameOrId}
          placeholder={uiText.v5Product.memberNameOrId}
          value={search}
          maxLength={200}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      {addMember}
      <div
        className={uiClass(c.memberFilters)}
        role="group"
        aria-label={uiText.v5Product.memberRoleFilter}
      >
        <button
          className={uiClass('chip ' + (!admins ? 'on' : ''))}
          type="button"
          aria-pressed={!admins}
          onClick={() => setAdmins(false)}
        >
          {uiText.v5Product.allMembers}
        </button>
        <button
          className={uiClass('chip ' + (admins ? 'on' : ''))}
          type="button"
          aria-pressed={admins}
          onClick={() => setAdmins(true)}
        >
          {uiText.v5Product.conversationAdmins}
        </button>
      </div>
      {(page > 1 || q.data?.hasMore) && (
        <p className={uiClass('policy')}>{uiText.v5Product.memberPageSearchPolicy}</p>
      )}
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <V4List>
            {visible.length ? (
              visible.map((m) => (
                <V4Row
                  key={m.participantId}
                  title={m.user.displayName}
                  description={
                    uiText.v5Product.conversationMemberRoles[m.role] +
                    (m.status !== 'Active'
                      ? ' · ' +
                        (m.status === 'Removed'
                          ? uiText.text_fe9630da3708
                          : uiText.text_568c1cd99f89)
                      : '')
                  }
                  iconClassName={c.memberAvatarSlot}
                  icon={
                    <ProfileAvatar
                      photo={m.user.profilePhoto}
                      name={m.user.displayName}
                      className={uiClass('avatar')}
                    />
                  }
                  end={
                    m.role === 'Owner' ? (
                      <span className={uiClass('badge')}>{uiText.v5Product.conversationOwner}</span>
                    ) : (owner || conversationCapability(value, 'canManageAdmins')) &&
                      m.status === 'Active' ? (
                      <MemberManagement
                        id={id}
                        member={m}
                        canManageAdmins={conversationCapability(value, 'canManageAdmins')}
                        canManageMembers={owner}
                      />
                    ) : (
                      <span className={uiClass('badge')}>{conversationRoleLabels[m.role]}</span>
                    )
                  }
                />
              ))
            ) : (
              <EmptyState title={uiText.text_2c34dd61a34f} />
            )}
          </V4List>
          {(page > 1 || q.data.hasMore) && (
            <div className={uiClass(c.actions)}>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {uiText.text_88e65319d694}
              </Button>
              <span>
                {uiText.text_2714496eef16}
                {page.toLocaleString('fa-IR')}
              </span>
              <Button
                variant="outline"
                disabled={!q.data.hasMore}
                onClick={() => setPage(page + 1)}
              >
                {uiText.text_12ca1a58c6ca}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
type LibraryTab = 'members' | 'media' | 'pins' | 'links';
function ConversationMedia({
  id,
  managed = false,
  initialTab,
  members,
  membersError,
  retryMembers,
}: {
  id: string;
  managed?: boolean;
  initialTab: LibraryTab;
  members?: S['ManagedConversationResult'];
  membersError?: unknown;
  retryMembers: () => void;
}) {
  const selectId = useId();
  const params = useSearchParams();
  const requested = params.get('library');
  const tab: LibraryTab =
    requested === 'pins' || requested === 'links' || requested === 'media'
      ? requested
      : requested === 'members' && managed
        ? 'members'
        : initialTab;
  const [membersVisited, setMembersVisited] = useState(tab === 'members');
  useEffect(() => {
    if (tab === 'members') setMembersVisited(true);
  }, [tab]);
  const [draft, setDraft] = useState(params.get('q') ?? '');
  const query = params.get('q') ?? '';
  function update(tab: LibraryTab, query: string) {
    const next = new URLSearchParams(params);
    next.set('library', tab);
    if (query) next.set('q', query);
    else next.delete('q');
    window.history.replaceState(null, '', window.location.pathname + '?' + next);
  }
  const { session, call } = usePersonal();
  const [kind, setKind] = useState('');
  const q = useInfiniteQuery({
    queryKey: ['personal', session.user.id, session.revision, 'conversation-media', id, kind],
    enabled: tab === 'media' && !query,
    initialPageParam: null as number | null,
    refetchInterval: 5000,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({ limit: '30' });
      if (kind) params.set('kind', kind);
      if (pageParam !== null) params.set('beforeSequence', String(pageParam));
      const value = await call<S['ConversationMediaPageResult']>(
        `/api/v1/conversations/${id}/media?${params}`,
        { signal },
      );
      if (
        value.nextBeforeSequence !== null &&
        pageParam !== null &&
        value.nextBeforeSequence >= pageParam
      )
        throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
      return value;
    },
    getNextPageParam: (last) => last.nextBeforeSequence ?? undefined,
  });
  const items =
    q.data?.pages
      .flatMap((p) => p.items)
      .filter(
        (item, i, rows) =>
          rows.findIndex(
            (x) =>
              x.sequence === item.sequence &&
              x.attachment.fileAssetId === item.attachment.fileAssetId,
          ) === i,
      ) ?? [];
  return (
    <section className={c.library}>
      <ViewTabs
        value={tab}
        onChange={(value) => update(value, query)}
        label={uiText.messengerPdf.conversationLibrary}
        prefix="conversation-library"
        className={c.libraryTabs}
        items={[
          ...(managed ? [{ value: 'members' as const, label: uiText.text_102f79b3f87c }] : []),
          ...(['media', 'pins', 'links'] as const).map((value) => ({
            value,
            label: uiText.messengerPdf[value],
          })),
        ]}
      />
      {membersVisited && managed && (
        <div
          hidden={tab !== 'members'}
          className={c.libraryPanel}
          role="tabpanel"
          id="conversation-library-panel-members"
          aria-labelledby="conversation-library-tab-members"
        >
          {members ? (
            <ConversationMembers id={id} value={members} />
          ) : membersError ? (
            <ErrorState error={membersError} onRetry={retryMembers} />
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      )}
      <div
        hidden={tab === 'members'}
        className={c.libraryPanel}
        role="tabpanel"
        id={'conversation-library-panel-' + (tab === 'members' ? 'media' : tab)}
        aria-labelledby={'conversation-library-tab-' + (tab === 'members' ? 'media' : tab)}
      >
        <form
          className={c.librarySearch}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            update(tab, draft.trim());
          }}
        >
          <button type="submit" aria-label={uiText.text_3fb47eb71ac7}>
            <Search size={16} />
          </button>
          <NativeInput
            value={draft}
            aria-label={uiText.messengerPdf.searchConversation}
            placeholder={uiText.messengerPdf.searchConversation}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={100}
          />
          {tab === 'media' && !query && (
            <details className={c.libraryFilters}>
              <summary role="button" aria-label={uiText.text_745ae2a160df}>
                <Settings2 size={16} />
              </summary>
              <label htmlFor={selectId}>
                {uiText.text_745ae2a160df}
                <NativeSelect
                  id={selectId}
                  value={kind}
                  onChange={(ev) => setKind(ev.target.value)}
                >
                  <option value="">{uiText.text_85a801ba9df1}</option>
                  <option value="Image">{uiText.text_972d6b378a7b}</option>
                  <option value="Video">{uiText.text_8a1583a102ac}</option>
                  <option value="File">{uiText.text_d099cfd756e0}</option>
                </NativeSelect>
              </label>
            </details>
          )}
        </form>
        {tab === 'members' ? null : tab !== 'media' || !!query ? (
          <MessengerSearchResults query={query} tab={tab} conversationId={id} />
        ) : (
          <>
            {q.isPending ? (
              <LoadingSkeleton />
            ) : q.isError && !items.length ? (
              <ErrorState error={q.error} onRetry={() => void q.refetch()} />
            ) : (
              <>
                <div className={uiClass(c.mediaGrid)}>
                  {items.length ? (
                    items.map((item) => (
                      <article
                        key={item.sequence + ':' + item.attachment.fileAssetId}
                        data-media-tile={
                          safeImagePreview(item.attachment.contentType) ||
                          item.attachment.contentType.startsWith('video/') ||
                          undefined
                        }
                      >
                        <MessageAttachment conversationId={id} asset={item.attachment} compact />
                        <time className={c.mediaTimestamp} dateTime={item.sentAtUtc}>
                          {date(item.sentAtUtc, true)}
                        </time>
                      </article>
                    ))
                  ) : (
                    <div className={c.libraryEmpty}>
                      <EmptyState title={uiText.text_648cc23ae875} />
                    </div>
                  )}
                </div>
                {q.isError && <ErrorState error={q.error} />}
                {q.hasNextPage && (
                  <Button
                    disabled={q.isFetchingNextPage}
                    variant="outline"
                    onClick={() => void q.fetchNextPage()}
                  >
                    {q.isFetchingNextPage ? uiText.text_80516c4adbbe : uiText.text_12e9b2eceeab}
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
function ConversationSettings({ value }: { value: S['ManagedConversationResult'] }) {
  const visibilityId = useId(),
    historyId = useId();
  const { session, call } = usePersonal(),
    cache = useQueryClient();
  const owner = conversationCapability(value, 'canChangeSettings');
  const [baseline, setBaseline] = useState({
      visibility: value.visibility,
      history: value.groupHistoryPolicy,
      version: value.version,
    }),
    [visibility, setVisibility] = useState(value.visibility),
    [history, setHistory] = useState(value.groupHistoryPolicy),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(),
    [success, setSuccess] = useState(false);
  const lock = useRef(false),
    dirty = visibility !== baseline.visibility || history !== baseline.history,
    stale = baseline.version !== value.version;
  useUnsavedChanges(dirty);
  if (!owner)
    return (
      <section className={uiClass(`${c.panel} ${c.settingsPanel}`)}>
        <h2>{uiText.text_ad01ea1c94b6}</h2>
        <p className={uiClass(c.note)}>{uiText.text_8d780fc7d678}</p>
      </section>
    );
  return (
    <section className={uiClass(`${c.panel} ${c.settingsPanel}`)}>
      <h2>
        {uiText.text_aa46bc41d37e}
        {value.type === 'Channel' ? uiText.text_2db356b462dd : uiText.text_774668d4acc7}
      </h2>
      <form
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (lock.current || stale || !dirty) return;
          lock.current = true;
          setBusy(true);
          setError(undefined);
          setSuccess(false);
          try {
            const updated = await call<S['ManagedConversationResult']>(
              '/api/v1/conversations/' + value.conversationId + '/settings',
              {
                method: 'PATCH',
                body: JSON.stringify({
                  visibility,
                  groupHistoryPolicy: history,
                  memberCapabilities: value.memberCapabilities,
                  expectedVersion: baseline.version,
                }),
              },
            );
            if (updated.conversationId !== value.conversationId)
              throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
            const key = [
              'personal',
              session.user.id,
              session.revision,
              '/api/v1/conversations/' + value.conversationId,
            ];
            await cache.cancelQueries({ queryKey: key });
            cache.setQueryData(key, updated);
            setBaseline({
              visibility: updated.visibility,
              history: updated.groupHistoryPolicy,
              version: updated.version,
            });
            setVisibility(updated.visibility);
            setHistory(updated.groupHistoryPolicy);
            setSuccess(true);
          } catch (err) {
            setError(err);
            if (err instanceof ApiError && [409, 412].includes(err.status))
              void cache.invalidateQueries({
                queryKey: [
                  'personal',
                  session.user.id,
                  session.revision,
                  '/api/v1/conversations/' + value.conversationId,
                ],
              });
          } finally {
            setBusy(false);
            lock.current = false;
          }
        }}
      >
        <fieldset disabled={busy || stale} className={uiClass(c.form)}>
          <fieldset className={uiClass(c.choiceCard)} aria-labelledby={visibilityId}>
            <legend id={visibilityId}>{uiText.text_6d85705a8779}</legend>
            {(['Private', 'Public'] as const).map((option) => (
              <label className={uiClass(c.radioChoice)} key={option}>
                <NativeInput
                  type="radio"
                  name="visibility"
                  checked={visibility === option}
                  onChange={() => setVisibility(option)}
                />
                <span>
                  <strong>
                    {option === 'Private' ? uiText.text_e205d3a7a33e : uiText.text_526e310df41f}
                  </strong>
                  <small>
                    {option === 'Private' ? uiText.text_cb504fe8648a : uiText.text_6d2331f083cb}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className={uiClass(c.choiceCard)} aria-labelledby={historyId}>
            <legend id={historyId}>{uiText.text_88712bbe9ebc}</legend>
            {(['FromJoin', 'FullHistory'] as const).map((option) => (
              <label className={uiClass(c.radioChoice)} key={option}>
                <NativeInput
                  type="radio"
                  name="history"
                  checked={history === option}
                  onChange={() => setHistory(option)}
                />
                <span>
                  <strong>
                    {option === 'FromJoin' ? uiText.text_c693180e811e : uiText.text_747182bc8309}
                  </strong>
                  <small>
                    {option === 'FromJoin' ? uiText.text_364d7031b847 : uiText.text_b0faa1b686ee}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className={uiClass(c.actions)}>
            <Button disabled={!dirty} type="submit">
              {busy ? uiText.text_b5ef00b1806f : uiText.text_0f50f4779d8f}
            </Button>
          </div>
        </fieldset>
      </form>
      {stale && (
        <div role="alert">
          <p>{uiText.text_5a085de59e41}</p>
          <ConfirmAction
            title={uiText.text_077b680f5a66}
            trigger={uiText.text_360204aefeab}
            description={uiText.text_6b8cef37f4f4}
            onConfirm={async () => {
              setVisibility(value.visibility);
              setHistory(value.groupHistoryPolicy);
              setBaseline({
                visibility: value.visibility,
                history: value.groupHistoryPolicy,
                version: value.version,
              });
              return true;
            }}
          />
        </div>
      )}
      {!!error && <ErrorState error={error} />}
      {success && <p role="status">{uiText.text_b2764e825c30}</p>}
    </section>
  );
}
function ArchiveAction({ id, archived }: { id: string; archived: boolean }) {
  const { call, session } = usePersonal(),
    router = useRouter();
  const cache = useQueryClient();
  return (
    <div className={uiClass(c.actions)}>
      <ConfirmAction
        title={archived ? uiText.text_863dece374bf : uiText.text_5c846bae22ae}
        trigger={archived ? uiText.text_7961f47c1630 : uiText.text_5c846bae22ae}
        description={uiText.text_dc67b660687e}
        onConfirm={async () => {
          await call('/api/v1/conversations/' + id + '/archive', {
            method: archived ? 'DELETE' : 'POST',
          });
          void cache.invalidateQueries({
            queryKey: ['personal', session.user.id, session.revision],
          });
          router.replace('/personal/messages' + (archived ? '' : '?filter=Archived'));
          return true;
        }}
      />
    </div>
  );
}

function PermissionCatalog({ value }: { value: S['ManagedConversationResult'] }) {
  const q = usePersonalApi<S['ConversationPermissionDescriptor'][]>(
    '/api/v1/conversations/permissions',
  );
  return (
    <details className={uiClass(c.note)}>
      <summary>{uiText.text_38ec5214a232}</summary>
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <ul>
          {q.data
            .filter(
              (item) =>
                item.conversationTypes.includes(value.type) &&
                (value.managementPolicy === 'SystemManagedAcademic'
                  ? item.appliesToSystemManagedAcademic
                  : item.appliesToUserManaged),
            )
            .map((item) => (
              <li key={item.category + ':' + item.key}>
                {item.description}
                {item.officialRelationshipDerivedOnly ? uiText.text_4ccd6c829701 : ''}
              </li>
            ))}
        </ul>
      )}
      <p>{uiText.text_a84fa232d06f}</p>
    </details>
  );
}
