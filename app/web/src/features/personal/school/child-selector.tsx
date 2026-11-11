'use client';
import { Select as NativeSelect } from '@/components/ui/input';

import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import { useId } from 'react';
import { UsersRound, LoaderCircle, Check } from 'lucide-react';
import type { components } from '@/generated/api/schema';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/states';
import s from './child-selector.module.css';
import { V4List, V4Note, V4Row } from '@/components/v4/page';
type Child = components['schemas']['AuthorizedChildResult'];
export function ChildSelector({
  children,
  active,
  pendingId,
  busy,
  loading,
  error,
  onRetry,
  onSelect,
  variant,
  disabled = false,
}: {
  children: Child[];
  active?: Child;
  pendingId?: string;
  busy: boolean;
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  onSelect: (id: string) => void;
  variant?: 'list';
  disabled?: boolean;
}) {
  const id = useId(),
    description = useId();
  if (variant === 'list')
    return (
      <section
        id="parent-children"
        className={uiClass('v5-native-form')}
        data-parent-children
        tabIndex={-1}
        aria-label={uiText.text_14130edb2ced}
        aria-busy={busy || loading}
      >
        {loading ? (
          <LoadingSkeleton variant="cards" />
        ) : children.length ? (
          <V4List>
            {children.map((child) => (
              <V4Row
                key={child.learnerOrganizationPersonId}
                testId={'child-' + child.learnerOrganizationPersonId}
                title={child.displayName}
                description={
                  child.organizationName +
                  ' · ' +
                  (child.relationStatus === 'Active'
                    ? uiText.v5Parent.activeRelation
                    : uiText.v5Parent.endedRelation)
                }
                iconClassName="avatar"
                icon={Array.from(child.displayName)[0]}
                ariaLabel={uiText.v5Parent.chooseChild + ' ' + child.displayName}
                disabled={busy || disabled || child.relationStatus !== 'Active'}
                pressed={active?.learnerOrganizationPersonId === child.learnerOrganizationPersonId}
                onClick={() => onSelect(child.learnerOrganizationPersonId)}
                end={
                  busy && pendingId === child.learnerOrganizationPersonId ? (
                    <LoaderCircle className={uiClass(s.spinner)} size={20} aria-hidden="true" />
                  ) : active?.learnerOrganizationPersonId === child.learnerOrganizationPersonId ? (
                    <span className={uiClass('badge')}>{uiText.v5Parent.selected}</span>
                  ) : undefined
                }
              />
            ))}
          </V4List>
        ) : (
          !error && (
            <EmptyState
              variant="v5"
              title={uiText.text_a27cb9baf762}
              description={uiText.text_c02cc9f23833}
            />
          )
        )}
        <V4Note>{uiText.v5Parent.childScopePolicy}</V4Note>
        {!!error && <ErrorState error={error} onRetry={onRetry} />}
      </section>
    );
  return (
    <section
      className={uiClass(s.card)}
      aria-label={uiText.text_14130edb2ced}
      aria-busy={busy || loading}
    >
      <div className={uiClass(s.heading)}>
        <span className={uiClass(s.icon)}>
          <UsersRound size={23} />
        </span>
        <div>
          <h2>{uiText.text_c5dc986b8129}</h2>
          <p id={description}>
            {busy
              ? uiText.text_7c4ad9f5aae7
              : active
                ? active.organizationName
                : uiText.text_86937d1bb9f1}
          </p>
        </div>
        {active && !busy && (
          <span className={uiClass(s.selected)}>
            <Check size={16} />
            {uiText.text_3958c9bcedb4}
          </span>
        )}
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : children.length ? (
        <div className={uiClass(s.selection)}>
          <span className={uiClass(s.avatar)}>
            {(
              children.find((c) => c.learnerOrganizationPersonId === pendingId) ?? active
            )?.displayName.slice(0, 1) ?? uiText.text_7d06b69aad65}
          </span>
          <div>
            <label htmlFor={id}>{uiText.text_91082bc0cbdc}</label>
            <NativeSelect
              id={id}
              aria-describedby={description}
              disabled={busy || disabled}
              value={pendingId ?? active?.learnerOrganizationPersonId ?? ''}
              onChange={(ev) => {
                if (ev.target.value) onSelect(ev.target.value);
              }}
            >
              <option value="" disabled>
                {uiText.text_665daedc1ba7}
              </option>
              {children.map((child) => (
                <option
                  key={child.learnerOrganizationPersonId}
                  value={child.learnerOrganizationPersonId}
                  disabled={child.relationStatus !== 'Active'}
                >
                  {child.displayName}
                  {child.relationStatus !== 'Active' ? uiText.text_503b02cb8da5 : ''}
                </option>
              ))}
            </NativeSelect>
          </div>
          {busy && <LoaderCircle className={uiClass(s.spinner)} size={21} />}
        </div>
      ) : (
        !error && (
          <EmptyState title={uiText.text_a27cb9baf762} description={uiText.text_c02cc9f23833} />
        )
      )}
      {!!error && <ErrorState error={error} onRetry={onRetry} />}
    </section>
  );
}
