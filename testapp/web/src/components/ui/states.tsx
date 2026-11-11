'use client';
import { uiClass } from '@/components/v5/classes';

import * as uiText from '@/content/fa';
import Link from '@/components/ui/app-link';
import { roleLabels } from '@/config/navigation';
import { ApiError } from '@/lib/api/errors';
import { date } from '@/lib/formatting';
import { AlertCircle, Inbox, LockKeyhole, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from './button';
import s from './states.module.css';
export function LoadingSkeleton({ variant }: { variant?: 'cards' } = {}) {
  if (variant === 'cards')
    return (
      <div
        className={uiClass('skeleton-wrap v5-loading-cards')}
        role="status"
        aria-label={uiText.text_d16616ab5bf1}
      >
        {[0, 1, 2].map((index) => (
          <div className={uiClass('card')} aria-hidden="true" key={index}>
            <div className={uiClass('skeleton medium')} />
            <div className={uiClass('skeleton short')} />
          </div>
        ))}
      </div>
    );
  return (
    <div className={uiClass('skeleton-wrap')} role="status" aria-label={uiText.text_d16616ab5bf1}>
      <div className={uiClass('skeleton ' + s.loadingHeading)} />
      {[0, 1, 2, 3, 4].map((n) => (
        <div key={n} className={uiClass('skeleton ' + s.loadingRow)} />
      ))}
    </div>
  );
}
export function EmptyState({
  title = uiText.text_757df1f837e6,
  description = uiText.text_1ca6ac3cbcd2,
  variant,
  icon,
  action,
}: {
  title?: string;
  description?: string;
  variant?: 'v5' | 'v5-full';
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={uiClass(
        variant === 'v5' ? 'empty small-empty' : variant === 'v5-full' ? 'empty' : 'state',
      )}
    >
      {variant ? (
        <div className={uiClass('empty-mark')}>{icon || <Inbox />}</div>
      ) : (
        icon || <Inbox />
      )}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({
  error,
  onRetry,
  staleDataAt,
  busy = false,
}: {
  error: unknown;
  onRetry?: () => void;
  staleDataAt?: string;
  busy?: boolean;
}) {
  const err = error instanceof ApiError ? error : new ApiError(503);
  const [retryAt, setRetryAt] = useState(0),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    const at = err.problem.retryAfter ? Date.now() + err.problem.retryAfter * 1000 : 0;
    setRetryAt(at);
    if (at <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [error]);
  const Icon =
    err.status === 403 ? LockKeyhole : err.problem.code === 'NETWORK_ERROR' ? WifiOff : AlertCircle;
  if (staleDataAt && err.status >= 500)
    return (
      <div className={uiClass('v5-stale-notice')} role="alert">
        <RefreshCw size={20} />
        <p>
          {uiText.v5Product.staleData}
          <small>
            {uiText.v5Product.lastSuccessfulRead}
            {date(staleDataAt)}
          </small>
        </p>
        {onRetry && (
          <Button
            size="icon"
            variant="ghost"
            disabled={busy || now < retryAt}
            aria-label={uiText.text_47eab78b8d28}
            onClick={onRetry}
          >
            <RefreshCw size={19} />
          </Button>
        )}
      </div>
    );
  return (
    <div className={uiClass('state error-state')} role="alert">
      <Icon />
      <h3>
        {err.status === 403
          ? uiText.text_8c44f9f4897d
          : err.status === 401
            ? uiText.text_90bcbe61d1bd
            : uiText.text_b4d89ec3251c}
      </h3>
      <p>{err.message}</p>
      {err.problem.code === 'PERMISSION_MAPPING_UNVERIFIED' && <p>{uiText.text_dc60f0f99394}</p>}
      {err.problem.retryAfter && (
        <p>
          {uiText.text_825e019cb09c}
          {err.problem.retryAfter}
          {uiText.text_fa629a79068a}
        </p>
      )}
      {err.problem.traceId && (
        <small dir="ltr">
          {uiText.text_ee748e945c4c}
          {err.problem.traceId}
        </small>
      )}
      {err.status === 401 ? (
        <Button asChild>
          <Link href="/enter">{uiText.text_6d2ae6f38c3f}</Link>
        </Button>
      ) : (
        onRetry &&
        err.status !== 403 && (
          <Button variant="outline" disabled={now < retryAt} onClick={onRetry}>
            <RefreshCw size={16} />
            {uiText.text_47eab78b8d28}
          </Button>
        )
      )}
    </div>
  );
}
const statuses: Record<string, string> = {
  Active: uiText.text_a3fa2a3ffcb9,
  Suspended: uiText.text_701d5d7a86f9,
  Inactive: uiText.text_4e67bd8e3482,
  Ended: uiText.text_996db6061aa9,
  Pending: uiText.text_caac18ea6580,
  Accepted: uiText.text_479574e266a4,
  Declined: uiText.text_c7009e8ab420,
  Completed: uiText.text_6cfe19c556aa,
  Withdrawn: uiText.text_bc6ca677cef7,
  NeedsAttention: uiText.text_79c60749cb2d,
  Requested: uiText.text_816e807fc9be,
  OrganizationCreated: uiText.text_2d59208c2547,
  SubscriptionAssigned: uiText.text_34b74ade8ade,
  ManagerInvitationCreated: uiText.text_a594ddb6bc9c,
  Published: uiText.text_e4f1cf0d1e04,
  Draft: uiText.text_410c47c7f8b7,
  Submitted: uiText.text_5b81f53beda1,
  InProgress: uiText.text_66b7ccc12b86,
  Finalized: uiText.text_7d22293a046b,
  Closed: uiText.text_c6bbfd166b33,
  Archived: uiText.text_9defd77e1a5d,
  Descriptive: uiText.text_65f21708171c,
  ObjectiveSingleChoice: uiText.text_8fc194cdb8aa,
  Revoked: uiText.text_7a56ac65be94,
  Expired: uiText.text_7e138dc09ad6,
  PendingPayment: uiText.text_8bcc64d644fd,
  NotStarted: uiText.text_337a6e199e8e,
  SubscriptionActivationPending: uiText.text_a7e7988e2ad3,
  SubscriptionActivated: uiText.text_8de717715873,
  ProvisioningPending: uiText.text_95769beb657d,
  Paid: uiText.text_74a167bdd61a,
  Failed: uiText.text_bbd429973d6e,
  Open: uiText.text_424a8f82124a,
  InReview: uiText.text_f71cd91dad22,
  Resolved: uiText.text_c4e27a602e9c,
  Dismissed: uiText.text_c7009e8ab420,
  ...roleLabels,
  Personal: uiText.text_8957887c2b2f,
  Organization: uiText.text_546832e64b74,
  Direct: uiText.text_bb8b8f5b8bfc,
  Group: uiText.text_774668d4acc7,
  Channel: uiText.text_2db356b462dd,
  Scheduled: uiText.text_48ba2fffd7f8,
  Cancelled: uiText.text_7a56ac65be94,
  Present: uiText.text_40284b78e717,
  NotRecorded: uiText.text_5749a86140fa,
  Absent: uiText.text_921c15ca4d6d,
  Late: uiText.text_5d5d32eb4327,
  Excused: uiText.text_85a79064a177,
};
export function label(value: string) {
  return statuses[value] ?? value;
}
export function StatusBadge({ value }: { value: unknown }) {
  const text = String(value ?? uiText.text_f07a81a06253);
  const tone = ['Active', 'Completed', 'Published', 'Paid', 'Resolved', 'Present'].includes(text)
    ? 'success'
    : ['Suspended', 'Failed', 'Revoked', 'Cancelled', 'Absent'].includes(text)
      ? 'danger'
      : ['Pending', 'NeedsAttention', 'Open', 'InReview', 'Requested', 'Late'].includes(text)
        ? 'warning'
        : 'neutral';
  return (
    <span className={uiClass(`badge badge-${tone}`)}>
      <span className={uiClass('badge-dot')} />
      {label(text)}
    </span>
  );
}
export function UpdatedAt({ at }: { at: number }) {
  return at > 0 ? (
    <span className={uiClass('updated')}>
      {uiText.text_97c4b62c6c33}
      {date(new Date(at).toISOString(), true)}
    </span>
  ) : null;
}
