import * as uiText from '@/content/fa';
import type { components } from '@/generated/api/schema';
export type FileAsset = components['schemas']['FileAssetResult'];
export type Attachment = components['schemas']['MessageAttachmentResult'];
export function attachmentKind(contentType: string): 'Image' | 'Video' | 'Voice' | 'File' {
  return contentType.startsWith('image/')
    ? 'Image'
    : contentType.startsWith('video/')
      ? 'Video'
      : contentType.startsWith('audio/')
        ? 'Voice'
        : 'File';
}
export function attachmentMessageKind(files: Pick<FileAsset, 'contentType'>[]) {
  return files.length && files.every((file) => attachmentKind(file.contentType) === 'Image')
    ? 'Image'
    : files.length && files.every((file) => attachmentKind(file.contentType) === 'Video')
      ? 'Video'
      : files.length && files.every((file) => attachmentKind(file.contentType) === 'Voice')
        ? 'Voice'
        : 'File';
}
export function attachmentMetadata(file: FileAsset): Attachment {
  return {
    fileAssetId: file.id,
    fileName: file.originalFileName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    createdAtUtc: file.createdAtUtc,
    kind: attachmentKind(file.contentType),
  };
}
export function safeImagePreview(contentType: string) {
  return /^(image\/(jpeg|png|webp|gif|avif))$/i.test(contentType);
}
export function fileTransferPath(conversationId: string, fileId?: string, content = false) {
  return (
    '/api/client/files' +
    (fileId ? '/' + fileId + (content ? '/content' : '') : '') +
    '?' +
    new URLSearchParams({ conversationId })
  );
}
export function formatFileSize(bytes: number) {
  const n = (value: number) =>
    new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value);
  return bytes >= 1024 * 1024
    ? n(bytes / 1024 / 1024) + uiText.text_4f65338b34d1
    : bytes >= 1024
      ? n(bytes / 1024) + uiText.text_0429192e427e
      : n(bytes) + uiText.text_41b6f21037c8;
}

/** Plain HTTP links only; message text is never interpreted as HTML or executable URLs. */
export function messageLinks(text: string | null) {
  const seen = new Set<string>();
  for (const match of (text ?? '').matchAll(/https?:\/\/[^\s<>\u200e\u200f]+/gi)) {
    const value = match[0].replace(/[.,;!?)\]}،؛؟]+$/g, '');
    try {
      const url = new URL(value);
      if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password)
        seen.add(url.href);
    } catch {
      /* Incomplete search snippets are not turned into invalid links. */
    }
  }
  return [...seen];
}
