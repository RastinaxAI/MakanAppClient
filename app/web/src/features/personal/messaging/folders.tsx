'use client';
import { v4Text as t } from '@/content/fa';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FolderOpen, MessageCircle, Plus, Pencil } from 'lucide-react';
import { V4Page, V4List, V4Row, V4Field, V4Note } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import { useUnsavedChanges } from '@/components/hooks/use-unsaved-changes';
import { usePersonal, usePersonalApi } from '../provider';
import { conversationTitle } from './model';
import type { components } from '@/generated/api/schema';
type S = components['schemas'];
const path = '/api/v1/messaging/folders';
export function MessagingFolders() {
  const data = usePersonalApi<S['ChatFolderResult'][]>(path);
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null),
    [folder, setFolder] = useState('');
  const item = data.data?.find((x) => x.id === editing);
  if (editing === 'new')
    return (
      <V4Page
        id="MK-174"
        title={t.newFolder}
        back="/personal/messages/folders"
        onBack={() => setEditing(null)}
        actions={<Button onClick={() => setEditing(null)}>{t.back}</Button>}
      >
        <V4Field label={t.folderName}>
          <input maxLength={100} />
        </V4Field>
        <V4List>
          <V4Row title={t.folderTypes} description={t.folderTypePending} icon={<FolderOpen />} />
        </V4List>
        <V4Note>{t.folderTypePending}</V4Note>
      </V4Page>
    );
  if (item)
    return (
      <FolderEditor
        key={item.id}
        item={item}
        close={() => setEditing(null)}
        refresh={async () => {
          const next = await data.refetch();
          return next.data?.find((x) => x.id === item.id);
        }}
      />
    );
  return (
    <V4Page
      id="MK-173"
      title={t.folders}
      back="/personal/messages"
      actions={
        <Button onClick={() => setEditing('new')}>
          <Plus size={18} />
          {t.newFolder}
        </Button>
      }
    >
      <V4List>
        <V4Row
          title={t.folderRules}
          description={t.folderEmptyHint}
          icon={<MessageCircle />}
          href="/personal/messages"
        />
      </V4List>
      {data.isPending ? (
        <LoadingSkeleton />
      ) : data.isError ? (
        <ErrorState error={data.error} onRetry={() => void data.refetch()} />
      ) : data.data.length ? (
        <V4List>
          {data.data.map((item) => (
            <div key={item.id}>
              <V4Row
                title={item.name}
                description={item.unreadOnly ? t.folderUnread : undefined}
                icon={<FolderOpen />}
                onClick={() => setFolder(item.id)}
                end={
                  <div className="v4-inline-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.editFolder + ' ' + item.name}
                      onClick={() => setEditing(item.id)}
                    >
                      <Pencil size={18} />
                    </Button>
                    <ConfirmAction
                      title={t.deleteFolder}
                      description={t.deleteFolderHint}
                      trigger={t.remove}
                      destructive
                      onConfirm={async () => {
                        await call(path + '/' + item.id, { method: 'DELETE' });
                        await cache.invalidateQueries({
                          queryKey: ['personal', session.user.id, session.revision],
                        });
                        if (folder === item.id) setFolder('');
                        return true;
                      }}
                    />
                  </div>
                }
              />
            </div>
          ))}
        </V4List>
      ) : (
        <EmptyState title={t.folderEmpty} description={t.folderEmptyHint} />
      )}
      {folder && <FolderConversations key={folder} id={folder} />}
    </V4Page>
  );
}
function FolderEditor({
  item,
  close,
  refresh,
}: {
  item: S['ChatFolderResult'];
  close: () => void;
  refresh: () => Promise<S['ChatFolderResult'] | undefined>;
}) {
  const { call, session } = usePersonal(),
    cache = useQueryClient();
  const [name, setName] = useState(item.name),
    [unread, setUnread] = useState(item.unreadOnly),
    [version, setVersion] = useState(item.version),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>();
  useUnsavedChanges(name !== item.name || unread !== item.unreadOnly);
  return (
    <V4Page
      id="MK-174"
      title={t.editFolder}
      subtitle={item.name}
      back="/personal/messages/folders"
      onBack={close}
      actions={
        <>
          <Button type="submit" form="v4-folder" disabled={busy}>
            {busy ? t.waiting : t.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            data-navigation-target="/personal/messages/folders"
            onClick={close}
          >
            {t.cancel}
          </Button>
        </>
      }
    >
      <form
        id="v4-folder"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !name.trim()) return;
          setBusy(true);
          setError(undefined);
          try {
            const command: S['SaveChatFolderCommand'] = {
              name: name.trim(),
              sortOrder: item.sortOrder,
              includedTypes: item.includedTypes,
              excludedTypes: item.excludedTypes,
              unreadOnly: unread,
              overrides: item.overrides,
              expectedVersion: version,
            };
            await call(path + '/' + item.id, { method: 'PUT', body: JSON.stringify(command) });
            await cache.invalidateQueries({
              queryKey: ['personal', session.user.id, session.revision],
            });
            close();
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        <V4Field label={t.folderName}>
          <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </V4Field>
        <V4List>
          <label className="v4-check">
            <span>{t.folderUnread}</span>
            <input type="checkbox" checked={unread} onChange={(e) => setUnread(e.target.checked)} />
          </label>
        </V4List>
        <V4Note>{t.folderTypePending}</V4Note>
        {!!error && (
          <>
            <ErrorState error={error} />
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                const latest = await refresh();
                if (latest) setVersion(latest.version);
              }}
            >
              {t.refresh}
            </Button>
          </>
        )}
      </form>
    </V4Page>
  );
}
function FolderConversations({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const data = usePersonalApi<S['ConversationSummaryResult'][]>(
    `/api/v1/conversations?folderId=${id}&page=${page}&pageSize=30`,
  );
  return data.isPending ? (
    <LoadingSkeleton />
  ) : data.isError ? (
    <ErrorState error={data.error} onRetry={() => void data.refetch()} />
  ) : (
    <>
      {data.data.length ? (
        <V4List>
          {data.data.map((item) => (
            <V4Row
              key={item.conversationId}
              title={conversationTitle(item)}
              description={item.lastMessagePreview}
              icon={<MessageCircle />}
              href={'/personal/messages/' + item.conversationId}
            />
          ))}
        </V4List>
      ) : (
        <EmptyState title={t.noMessages} />
      )}
      <div className="v4-inline-actions">
        <Button
          type="button"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t.back}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={data.data.length < 30}
          onClick={() => setPage((p) => p + 1)}
        >
          {t.loadMore}
        </Button>
      </div>
    </>
  );
}
