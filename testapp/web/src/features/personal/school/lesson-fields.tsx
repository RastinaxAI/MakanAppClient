'use client';
import { Input as NativeInput, Textarea as NativeTextarea } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import { V4Field } from '@/components/v4/page';
import type { ReactNode, Ref } from 'react';

/** The same bound fields serve an editable draft and its read-only publication review. */
export function LessonFields({
  title,
  body,
  titleLabel,
  bodyLabel,
  titleRef,
  onTitleChange,
  onBodyChange,
  disabled,
  bodyRequired = false,
  children,
}: {
  title: string;
  body: string;
  titleLabel: string;
  bodyLabel: string;
  titleRef?: Ref<HTMLInputElement>;
  onTitleChange?: (value: string) => void;
  onBodyChange?: (value: string) => void;
  disabled?: boolean;
  bodyRequired?: boolean;
  children?: ReactNode;
}) {
  return (
    <fieldset className={uiClass('v5-native-fields')} disabled={disabled}>
      <V4Field label={titleLabel}>
        <NativeInput
          ref={titleRef}
          required={!!onTitleChange}
          readOnly={!onTitleChange}
          value={title}
          onChange={(event) => onTitleChange?.(event.target.value)}
        />
      </V4Field>
      <V4Field label={bodyLabel}>
        <NativeTextarea
          rows={3}
          required={bodyRequired && !!onBodyChange}
          readOnly={!onBodyChange}
          value={body}
          onChange={(event) => onBodyChange?.(event.target.value)}
        />
      </V4Field>
      {children}
    </fieldset>
  );
}
