import type { ComponentProps, ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { uiClass } from '@/components/v5/classes';
import * as uiText from '@/content/fa';
import s from './field.module.css';

/** Native controls preserve form registration, refs, validation and browser semantics. */
export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      type={type}
      className={uiClass(
        s.control,
        (type === 'checkbox' || type === 'radio') && s.choice,
        className,
      )}
    />
  );
}
export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select {...props} className={uiClass(s.control, className)} />;
}
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea {...props} className={uiClass(s.control, s.multiline, className)} />;
}

/** Search owns its horizontal geometry independently of form labels and native field padding. */
export function SearchField({
  action,
  onClear,
  containerClassName,
  ...props
}: ComponentProps<'input'> & {
  'aria-label': string;
  action?: ReactNode;
  onClear?: () => void;
  containerClassName?: string;
}) {
  return (
    <div className={uiClass(s.search, containerClassName)} data-ui="search">
      {action ?? <Search size={22} aria-hidden="true" />}
      <Input {...props} className={uiClass(s.searchInput, props.className)} />
      {onClear && !!props.value && (
        <button
          type="button"
          className={s.searchClear}
          aria-label={uiText.text_35c84a68f506}
          disabled={props.disabled}
          onClick={(event) => {
            onClear();
            event.currentTarget.parentElement?.querySelector('input')?.focus();
          }}
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
