'use client';
import { Input as NativeInput, Textarea as NativeTextarea } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { clientValidator } from '@/lib/api/client-contract';
import { ApiError } from '@/lib/api/errors';
import type { TransferProgress } from '@/lib/api/file-transfer';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Check, LoaderCircle, RefreshCw } from 'lucide-react';
import { BarChart3, ListChecks } from 'lucide-react';
import Link from 'next/link';
import {
  Smile,
  ImageIcon,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  Camera,
  ChevronLeft,
  Download,
  FileText,
  Mic,
  Paperclip,
  Plus,
  Play,
  Pause,
  Send,
  Video,
  X,
} from './messenger-icons';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { usePersonal } from '../provider';
import {
  fileTransferPath,
  formatFileSize,
  safeImagePreview,
  type Attachment,
  type FileAsset,
} from './media-model';
import s from './media.module.css';
import t from './messaging-theme.module.css';
import { VoicePlayer, LiveVoiceWaveform } from './voice-message';
type DraftFile = {
  key: string;
  file: globalThis.File;
  preview?: string;
  asset?: FileAsset;
  phase: 'selected' | 'uploading' | 'processing' | 'ready' | 'error' | 'paused';
  progress?: TransferProgress;
  error?: string;
};
function errorText(error: unknown) {
  return error instanceof Error ? error.message : uiText.text_c9d95977a264;
}
function TransferMeter({ progress, label }: { progress?: TransferProgress; label: string }) {
  const percent =
    progress?.total && progress.total > 0
      ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
      : null;
  return (
    <div className={uiClass(s.meter)}>
      <span>
        {label}
        {percent !== null
          ? ' · ' + new Intl.NumberFormat('fa-IR').format(percent) + uiText.text_a489ae36a167
          : ''}
      </span>
      <progress max={100} value={percent ?? undefined} aria-label={label} />
      {progress && progress.loaded > 0 && (
        <small>
          {formatFileSize(progress.loaded)}
          {progress.total ? uiText.text_a624a1e41ffd + formatFileSize(progress.total) : ''}
        </small>
      )}
    </div>
  );
}
export function AttachmentPicker({
  conversationId,
  disabled,
  caption,
  onSend,
  children,
  toolsEnabled = false,
}: {
  conversationId: string;
  disabled: boolean;
  caption: string;
  onSend: (files: FileAsset[], caption: string) => Promise<boolean>;
  children?: (record: () => void) => ReactNode;
  toolsEnabled?: boolean;
}) {
  const { session, transfer } = usePersonal();
  const [items, setItems] = useState<DraftFile[]>([]),
    [open, setOpen] = useState(false),
    [recording, setRecording] = useState(false),
    [pickerOpen, setPickerOpen] = useState(false),
    [text, setText] = useState(''),
    [busy, setBusy] = useState(false),
    [phase, setPhase] = useState<'upload' | 'sending'>('upload'),
    [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    voiceTrigger = useRef<HTMLElement | null>(null),
    abort = useRef<AbortController | null>(null),
    alive = useRef(true),
    running = useRef(false),
    previews = useRef(new Set<string>());
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      abort.current?.abort();
      for (const url of previews.current) URL.revokeObjectURL(url);
      previews.current.clear();
    };
  }, []);
  function patch(key: string, update: Partial<DraftFile>) {
    if (alive.current)
      setItems((previous) =>
        previous.map((item) => (item.key === key ? { ...item, ...update } : item)),
      );
  }
  function choose(input: HTMLInputElement) {
    if (disabled || running.current) return;
    const files = [...(input.files ?? [])];
    input.value = '';
    if (!files.length) return;
    const next = files.map((selected) => {
      let preview: string | undefined;
      if (safeImagePreview(selected.type) || selected.type.startsWith('video/')) {
        preview = URL.createObjectURL(selected);
        previews.current.add(preview);
      }
      return { key: crypto.randomUUID(), file: selected, preview, phase: 'selected' as const };
    });
    setItems((previous) => [...previous, ...next]);
    setText(caption);
    setError('');
    setOpen(true);
  }
  function remove(item: DraftFile) {
    if (item.preview) {
      URL.revokeObjectURL(item.preview);
      previews.current.delete(item.preview);
    }
    setItems((previous) => previous.filter((row) => row.key !== item.key));
  }
  async function submit() {
    if (running.current || disabled || !items.length) return;
    running.current = true;
    setBusy(true);
    setPhase('upload');
    setError('');
    const controller = new AbortController();
    abort.current = controller;
    let activeKey: string | undefined;
    try {
      const assets: FileAsset[] = [];
      for (const item of items) {
        activeKey = item.key;
        controller.signal.throwIfAborted();
        let asset = item.asset;
        if (!asset) {
          patch(item.key, { phase: 'uploading', error: undefined, progress: undefined });
          const body = new FormData();
          body.append('File', item.file, item.file.name);
          const response = await transfer<unknown>(fileTransferPath(conversationId), {
            method: 'POST',
            body,
            signal: controller.signal,
            onProgress: (progress) =>
              patch(item.key, {
                progress,
                phase: progress.phase === 'processing' ? 'processing' : 'uploading',
              }),
          });
          const parsed = clientValidator({
            $ref: '#/components/schemas/FileAssetResult',
          }).safeParse(response);
          if (!parsed.success) throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
          asset = parsed.data as FileAsset;
          patch(item.key, { asset });
        }
        if (asset.uploadedByUserId !== session.user.id || asset.sizeBytes !== item.file.size)
          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
        if (asset.status === 'Pending') {
          patch(item.key, { phase: 'processing', progress: undefined });
          asset = await transfer<FileAsset>(fileTransferPath(conversationId, asset.id), {
            signal: controller.signal,
          });
          patch(item.key, { asset });
        }
        if (asset.status !== 'Ready')
          throw new Error(
            asset.status === 'Pending' ? uiText.text_89f52370cb8d : uiText.text_417503843545,
          );
        if (asset.uploadedByUserId !== session.user.id || asset.sizeBytes !== item.file.size)
          throw new ApiError(502, { code: 'CONTRACT_MISMATCH' });
        patch(item.key, { phase: 'ready', asset, error: undefined });
        assets.push(asset);
      }
      controller.signal.throwIfAborted();
      activeKey = undefined;
      setPhase('sending');
      const queued = await onSend(assets, text.trim());
      if (!queued) throw new Error(uiText.text_facb92f52d74);
      if (alive.current) {
        for (const item of items)
          if (item.preview) {
            URL.revokeObjectURL(item.preview);
            previews.current.delete(item.preview);
          }
        setItems([]);
        setText('');
        setOpen(false);
      }
    } catch (error) {
      if (alive.current) {
        const canceled = error instanceof Error && error.name === 'AbortError';
        const message = canceled ? uiText.text_fbc1848b434f : errorText(error);
        if (activeKey) patch(activeKey, { phase: canceled ? 'paused' : 'error', error: message });
        setError(message);
      }
    } finally {
      running.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <>
      <Menu.Root dir="rtl" open={pickerOpen} onOpenChange={setPickerOpen}>
        <Menu.Trigger asChild>
          <button
            type="button"
            ref={trigger}
            className={uiClass(s.attachButton)}
            aria-label={uiText.text_01eac8227680}
            disabled={(disabled && !toolsEnabled) || busy}
          >
            <Plus size={23} />
            {items.length > 0 && <b>{new Intl.NumberFormat('fa-IR').format(items.length)}</b>}
          </button>
        </Menu.Trigger>
        <Menu.Portal>
          <div>
            {pickerOpen && (
              <div
                className={t.menuBackdrop}
                aria-hidden
                onPointerDown={() => setPickerOpen(false)}
              />
            )}
            <Menu.Content
              className={uiClass(`dropdown ${t.theme} ${t.menu} ${s.attachMenu}`)}
              side="top"
              align="start"
              alignOffset={10}
              sideOffset={6}
            >
              {items.length > 0 && (
                <Menu.Item onSelect={() => setOpen(true)}>
                  <Paperclip size={19} />
                  {uiText.text_00cd0fea581c}
                  <ChevronLeft size={16} />
                </Menu.Item>
              )}
              {[
                ['poll-new', uiText.v4Text.newPoll, BarChart3],
                ['quiz-new', uiText.v4Text.quiz, BarChart3],
                ['checklist-new', uiText.v4Text.newChecklist, ListChecks],
              ].map(([section, title, Icon]) => {
                const Glyph = Icon as typeof BarChart3;
                return (
                  <Menu.Item asChild key={String(section)} disabled={!toolsEnabled || busy}>
                    <Link href={`/personal/messages/${conversationId}/${section}`}>
                      <Glyph size={20} />
                      {String(title)}
                    </Link>
                  </Menu.Item>
                );
              })}
              <Menu.Item disabled={disabled || busy} onSelect={() => file.current?.click()}>
                <Paperclip size={16} />
                {uiText.text_9974dd3a9f4a}
              </Menu.Item>
              <Menu.Item disabled={disabled || busy} onSelect={() => camera.current?.click()}>
                <Camera size={16} />
                {uiText.text_4cab0b40565e}
              </Menu.Item>
              {!!caption.trim() && (
                <Menu.Item
                  disabled={disabled || busy}
                  onSelect={() => {
                    voiceTrigger.current = trigger.current;
                    setRecording(true);
                  }}
                >
                  <Mic size={16} />
                  {uiText.v6Ui.voiceRecord}
                </Menu.Item>
              )}
            </Menu.Content>
          </div>
        </Menu.Portal>
      </Menu.Root>
      {children?.(() => {
        voiceTrigger.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setRecording(true);
      })}
      <NativeInput
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label={uiText.text_15e11a432ae3}
        onChange={(event) => choose(event.currentTarget)}
      />
      <NativeInput
        ref={file}
        type="file"
        multiple
        hidden
        aria-label={uiText.text_02cc50e960a7}
        onChange={(event) => choose(event.currentTarget)}
      />
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && phase === 'upload') abort.current?.abort();
          setOpen(next);
        }}
      >
        <DialogContent
          className={uiClass(`${t.theme}`)}
          title={uiText.text_4314e718c6d3}
          description={uiText.text_43428a0f7e51}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <form
            className={uiClass(s.sendSheet)}
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void submit();
            }}
          >
            <div className={uiClass(s.draftList)}>
              {items.map((item) => (
                <article key={item.key} className={uiClass(s.draftCard)}>
                  <div className={uiClass(s.draftThumb)}>
                    {item.preview ? (
                      item.file.type.startsWith('video/') ? (
                        <video src={item.preview} muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.preview} alt={item.file.name} />
                      )
                    ) : (
                      <FileText size={30} />
                    )}
                  </div>
                  <div className={uiClass(s.draftInfo)}>
                    <strong dir="auto">{item.file.name}</strong>
                    <small>{formatFileSize(item.file.size)}</small>
                    {item.phase === 'uploading' || item.phase === 'processing' ? (
                      <TransferMeter
                        progress={item.progress}
                        label={
                          item.phase === 'processing'
                            ? uiText.text_066f81d641f6
                            : uiText.text_c16dbde9ad0a
                        }
                      />
                    ) : item.phase === 'ready' ? (
                      <span className={uiClass(s.ready)}>
                        <Check size={14} />
                        {uiText.text_69791a3b81bf}
                      </span>
                    ) : item.error ? (
                      <span className={uiClass(s.itemError)}>{item.error}</span>
                    ) : (
                      <span className={uiClass(s.selected)}>{uiText.text_e14b064baee8}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={uiClass(s.remove)}
                    aria-label={uiText.text_6f5fc5cfc9f9 + item.file.name}
                    disabled={busy}
                    onClick={() => remove(item)}
                  >
                    <X size={18} />
                  </button>
                </article>
              ))}
            </div>
            <label className={uiClass(s.caption)}>
              {uiText.text_eaca3b73fa59}
              <NativeTextarea
                rows={2}
                value={text}
                disabled={busy}
                onChange={(event) => setText(event.target.value)}
                placeholder={uiText.text_9c09cbe3bb04}
              />
            </label>
            {error && (
              <p className={uiClass(s.transferError)} role="alert">
                {error}
              </p>
            )}
            <div className={uiClass(s.sheetActions)}>
              {busy && phase === 'upload' ? (
                <Button type="button" variant="outline" onClick={() => abort.current?.abort()}>
                  {uiText.text_a72404308ae9}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                >
                  {uiText.text_fe8b0330df51}
                </Button>
              )}
              <Button type="submit" disabled={busy || !items.length || disabled}>
                {busy ? <LoaderCircle className={uiClass(s.spin)} size={18} /> : <Send size={18} />}{' '}
                {busy
                  ? phase === 'sending'
                    ? uiText.text_e735f9d9a2a5
                    : uiText.text_2096f4c8f035
                  : uiText.text_85983403b43f +
                    new Intl.NumberFormat('fa-IR').format(items.length) +
                    uiText.text_46b99be686ec}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {recording && (
        <VoiceRecording
          returnFocus={voiceTrigger}
          onClose={() => setRecording(false)}
          onReady={(recorded) => {
            setItems((previous) => [
              ...previous,
              { key: crypto.randomUUID(), file: recorded, phase: 'selected' },
            ]);
            setText(caption);
            setRecording(false);
            setOpen(true);
          }}
        />
      )}
    </>
  );
}

export function EmojiPicker({
  onSelect,
  restoreFocus,
  disabled,
}: {
  onSelect: (value: string) => void;
  restoreFocus: () => void;
  disabled: boolean;
}) {
  return (
    <Menu.Root dir="rtl">
      <Menu.Trigger asChild>
        <button
          type="button"
          className={s.emojiTrigger}
          disabled={disabled}
          aria-label={uiText.messengerPdf.emoji}
        >
          <Smile size={16} />
        </button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className={`${t.theme} ${s.emojiMenu}`}
          side="top"
          align="end"
          sideOffset={8}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          {uiText.messengerPdf.emojiChoices.map((value) => (
            <Menu.Item
              key={value}
              aria-label={uiText.messengerPdf.emojiInsert(value)}
              onSelect={() => onSelect(value)}
            >
              {value}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
function VoiceRecording({
  onClose,
  onReady,
  returnFocus,
}: {
  onClose: () => void;
  onReady: (file: globalThis.File) => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const [phase, setPhase] = useState<'idle' | 'requesting' | 'recording' | 'stopping'>('idle');
  const [error, setError] = useState(''),
    [file, setFile] = useState<globalThis.File>();
  const [preview, setPreview] = useState(''),
    [elapsed, setElapsed] = useState(0);
  const [canceling, setCanceling] = useState(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const media = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null);
  const generation = useRef(0),
    started = useRef(0);
  const finishing = useRef(false);
  function release() {
    generation.current++;
    const recorder = media.current;
    if (recorder) {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    media.current = null;
  }
  useEffect(() => () => release(), []);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (phase !== 'recording') return;
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started.current) / 1000)),
      250,
    );
    return () => clearInterval(timer);
  }, [phase]);
  async function start() {
    if (phase !== 'idle' || file) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(uiText.v6Ui.voiceUnavailable);
      return;
    }
    const attempt = ++generation.current;
    setPhase('requesting');
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (attempt !== generation.current) {
        input.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = input;
      const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(input, mimeType ? { mimeType } : undefined);
      media.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        input.getTracks().forEach((track) => track.stop());
        if (attempt !== generation.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (blob.size) {
          const extension = blob.type.includes('mp4')
            ? 'm4a'
            : blob.type.includes('ogg')
              ? 'ogg'
              : 'webm';
          setFile(
            new globalThis.File([blob], 'voice-' + Date.now() + '.' + extension, {
              type: blob.type,
            }),
          );
        } else setError(uiText.v6Ui.voiceEmpty);
        media.current = null;
        stream.current = null;
        setPhase('idle');
      };
      recorder.onerror = () => {
        release();
        setPhase('idle');
        setError(uiText.v6Ui.voiceUnavailable);
      };
      recorder.start();
      started.current = Date.now();
      setElapsed(0);
      setPhase('recording');
    } catch (cause) {
      if (attempt !== generation.current) return;
      release();
      setPhase('idle');
      setError(
        cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? uiText.v6Ui.voiceDenied
          : uiText.v6Ui.voiceUnavailable,
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          release();
          onClose();
        }
      }}
    >
      <DialogContent
        className={phase === 'recording' || file ? s.recorderDock : undefined}
        title={uiText.v6Ui.voiceTitle}
        description={uiText.v6Ui.voicePermission}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (!finishing.current) returnFocus.current?.focus();
        }}
      >
        <div className={s.sendSheet}>
          {phase === 'recording' && (
            <div className={s.recorderBar} data-canceling={canceling || undefined}>
              <button
                type="button"
                className={s.recordDelete}
                aria-label={uiText.v6Ui.voiceDelete}
                onClick={() => {
                  release();
                  onClose();
                }}
              >
                <X size={16} />
              </button>
              <div
                className={s.recordTrack}
                onPointerDown={(event) => {
                  gesture.current = { x: event.clientX, y: event.clientY };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!gesture.current) return;
                  const distance = Math.abs(event.clientX - gesture.current.x);
                  setCanceling(distance > 40);
                  if (distance > 90) {
                    gesture.current = null;
                    release();
                    onClose();
                  }
                }}
                onPointerUp={() => {
                  gesture.current = null;
                  setCanceling(false);
                }}
                onPointerCancel={() => {
                  gesture.current = null;
                  setCanceling(false);
                }}
              >
                <small>{uiText.messengerPdf.cancelRecording}</small>
                <div>
                  <time dir="ltr">
                    {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                  </time>
                  <LiveVoiceWaveform stream={stream.current} />
                </div>
              </div>
              <button
                type="button"
                className={s.recordStop}
                aria-label={uiText.v6Ui.voiceStop}
                onClick={() => {
                  setPhase('stopping');
                  media.current?.stop();
                }}
              >
                <Pause size={16} />
              </button>
              <span className="sr-only" role="status">
                {uiText.v6Ui.voiceRecording}
              </span>
            </div>
          )}
          {preview && <VoicePlayer url={preview} label={uiText.v6Ui.voiceTitle} />}
          {!!error && (
            <p role="alert" className={s.transferError}>
              {error}
            </p>
          )}
          <div className={s.sheetActions}>
            {file ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(undefined);
                    setElapsed(0);
                  }}
                >
                  {uiText.v6Ui.voiceDelete}
                </Button>
                <Button
                  onClick={() => {
                    finishing.current = true;
                    onReady(file);
                  }}
                >
                  {uiText.v6Ui.voiceUse}
                </Button>
              </>
            ) : phase === 'recording' ? null : phase === 'stopping' ? (
              <Button
                disabled
                onClick={() => {
                  setPhase('stopping');
                  media.current?.stop();
                }}
              >
                {uiText.v6Ui.voiceStop}
              </Button>
            ) : (
              <Button disabled={phase !== 'idle'} onClick={() => void start()}>
                <Mic size={18} />
                {uiText.v6Ui.voiceStart}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function AttachmentSummary({ attachments }: { attachments?: Attachment[] }) {
  return attachments?.length ? (
    <div className={uiClass(s.pendingFiles)}>
      {attachments.map((asset) => (
        <span key={asset.fileAssetId}>
          <Paperclip size={15} />
          <bdi>{asset.fileName}</bdi>
        </span>
      ))}
    </div>
  ) : null;
}
export function MessageAttachment({
  asset,
  conversationId,
  compact = false,
}: {
  asset: Attachment;
  conversationId: string;
  compact?: boolean;
}) {
  const { transfer } = usePersonal();
  const [viewing, setViewing] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle'),
    [progress, setProgress] = useState<TransferProgress>(),
    [url, setUrl] = useState<string>(),
    [error, setError] = useState(''),
    [playbackError, setPlaybackError] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null),
    alive = useRef(true),
    objectUrl = useRef<string | undefined>(undefined),
    busy = useRef(false),
    loadRef = useRef<() => void>(() => {});
  const image = safeImagePreview(asset.contentType),
    video = asset.contentType.startsWith('video/'),
    audio = asset.contentType.startsWith('audio/');
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      abort.current?.abort();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);
  async function load() {
    if (busy.current || url) return;
    busy.current = true;
    setPhase('loading');
    setProgress(undefined);
    setError('');
    const controller = new AbortController();
    abort.current = controller;
    try {
      const blob = await transfer<Blob>(fileTransferPath(conversationId, asset.fileAssetId, true), {
        binary: true,
        expectedBytes: asset.sizeBytes,
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (!alive.current || controller.signal.aborted) return;
      const value = URL.createObjectURL(new Blob([blob], { type: asset.contentType }));
      objectUrl.current = value;
      setUrl(value);
      setPhase('ready');
    } catch (error) {
      if (alive.current) {
        const canceled = error instanceof Error && error.name === 'AbortError';
        setPhase(canceled ? 'idle' : 'error');
        setError(canceled ? uiText.text_876c53967879 : errorText(error));
      }
    } finally {
      busy.current = false;
    }
  }
  loadRef.current = () => void load();
  useEffect(() => {
    if (!image || !root.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadRef.current();
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [image]);
  return (
    <>
      <div
        ref={root}
        data-compact={compact || undefined}
        data-visual={image || video || undefined}
        className={uiClass(`${s.attachment} ${image || video ? s.mediaAttachment : ''}`)}
      >
        {phase === 'ready' && url ? (
          <>
            {image ? (
              <button
                type="button"
                className={uiClass(s.imageLink)}
                onClick={() => setViewing(true)}
                aria-label={uiText.text_d7a06d9eaca7 + asset.fileName}
              >
                <img
                  src={url}
                  alt={asset.fileName}
                  loading="lazy"
                  onError={() => setPlaybackError(true)}
                />
              </button>
            ) : video && compact ? (
              <button
                type="button"
                className={s.videoCover}
                aria-label={uiText.text_d7a06d9eaca7 + asset.fileName}
                onClick={() => setViewing(true)}
              >
                <Play size={32} />
              </button>
            ) : video ? (
              <video
                src={url}
                controls
                playsInline
                preload="metadata"
                onError={() => setPlaybackError(true)}
              />
            ) : audio ? (
              <VoicePlayer url={url} label={asset.fileName} />
            ) : null}
            <div className={uiClass(s.fileReady)}>
              <FileTypeIcon name={asset.fileName} />
              <span>
                <strong dir="auto">{asset.fileName}</strong>
                <small>{formatFileSize(asset.sizeBytes)}</small>
              </span>
              <a
                href={url}
                download={asset.fileName}
                aria-label={uiText.text_6e159b54bc47 + asset.fileName}
              >
                <Download size={19} />
              </a>
            </div>
            {playbackError && (
              <small className={uiClass(s.itemError)}>{uiText.text_5f11ce92fa61}</small>
            )}
          </>
        ) : (
          <>
            {(video || (compact && image)) && (
              <button
                type="button"
                className={video ? s.videoCover : s.imageCover}
                aria-label={
                  phase === 'loading'
                    ? uiText.text_5aea7c460498 + asset.fileName
                    : uiText.text_d7a06d9eaca7 + asset.fileName
                }
                onClick={() => {
                  if (phase === 'loading') abort.current?.abort();
                  else {
                    if (compact && video) setViewing(true);
                    void load();
                  }
                }}
              >
                {phase === 'loading' ? (
                  <X size={24} />
                ) : video ? (
                  <Play size={32} />
                ) : (
                  <ImageIcon size={24} />
                )}
              </button>
            )}
            {(!compact || (!image && !video)) && (
              <div className={uiClass(s.fileIntro)}>
                <span className={uiClass(s.fileIcon)}>
                  {image ? (
                    <ImageIcon size={24} />
                  ) : video ? (
                    <Video size={24} />
                  ) : audio ? (
                    <Play size={24} />
                  ) : (
                    <FileTypeIcon name={asset.fileName} />
                  )}
                </span>
                <div>
                  <strong dir="auto">{asset.fileName}</strong>
                  <small>{formatFileSize(asset.sizeBytes)}</small>
                </div>
                <button
                  type="button"
                  aria-label={
                    phase === 'loading'
                      ? uiText.text_5aea7c460498 + asset.fileName
                      : uiText.text_1e229eb338a6 + asset.fileName
                  }
                  onClick={() => (phase === 'loading' ? abort.current?.abort() : void load())}
                >
                  {phase === 'loading' ? (
                    <X size={20} />
                  ) : phase === 'error' ? (
                    <RefreshCw size={20} />
                  ) : (
                    <Download size={20} />
                  )}
                </button>
              </div>
            )}
            {phase === 'loading' && (
              <TransferMeter progress={progress} label={uiText.text_3ebc8cefd354} />
            )}
            {error && (
              <p role={phase === 'error' ? 'alert' : 'status'} className={uiClass(s.transferError)}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
      <Dialog
        open={viewing}
        onOpenChange={(next) => {
          setViewing(next);
          if (!next && phase === 'loading') abort.current?.abort();
        }}
      >
        <DialogContent title={asset.fileName} className={s.viewer}>
          {!url &&
            (phase === 'loading' ? (
              <TransferMeter progress={progress} label={uiText.text_3ebc8cefd354} />
            ) : (
              <div>
                {error && (
                  <p role="alert" className={s.transferError}>
                    {error}
                  </p>
                )}
                <Button variant="outline" onClick={() => void load()}>
                  {uiText.text_1e229eb338a6 + asset.fileName}
                </Button>
              </div>
            ))}
          {url && (
            <>
              {image ? (
                <img
                  src={url}
                  alt={asset.fileName}
                  className={s.viewerImage}
                  onError={() => setPlaybackError(true)}
                />
              ) : (
                <video
                  src={url}
                  controls
                  playsInline
                  className={s.viewerImage}
                  onError={() => setPlaybackError(true)}
                />
              )}
              {playbackError && (
                <p role="alert" className={s.transferError}>
                  {uiText.text_5f11ce92fa61}
                </p>
              )}
              <a className={s.viewerDownload} href={url} download={asset.fileName}>
                <Download size={20} />
                {uiText.text_6e159b54bc47 + asset.fileName}
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FileTypeIcon({ name }: { name: string }) {
  const extension = name.split('.').at(-1)?.toLowerCase();
  const Icon =
    extension === 'pdf'
      ? FilePdf
      : ['doc', 'docx'].includes(extension ?? '')
        ? FileWord
        : ['xls', 'xlsx'].includes(extension ?? '')
          ? FileExcel
          : ['ppt', 'pptx'].includes(extension ?? '')
            ? FilePowerpoint
            : FileText;
  return (
    <span className={s.fileType} data-file-extension={extension}>
      <Icon size={28} />
    </span>
  );
}
