'use client';
import { useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ListView } from '@/components/ui/list-view';
import { Panel, DataView } from '@/components/ui/data-view';
import { SectionTabs } from '@/components/ui/section-tabs';
import { LoadingSkeleton, ErrorState, UpdatedAt } from '@/components/ui/states';
import { useAccess } from '@/features/access-context/provider';
import { useApi } from '@/lib/api/hooks';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/generated/api/schema';

type OperationTab = 'health' | 'notifications' | 'jobs';
type OperationData =
  | components['schemas']['PlatformSystemHealth']
  | components['schemas']['PlatformNotificationOperations']
  | components['schemas']['PlatformJobOperations'];
const operationNotices: Record<OperationTab, string> = {
  health:
    'این گزارش وضعیت وابستگی‌ها و پیکربندی اتصال هوش مصنوعی را نشان می‌دهد. آماده‌بودن اتصال، تأیید اجرای موفق درخواست‌های هوش مصنوعی یا بازیابی منابع نیست.',
  notifications:
    'آماده‌بودن سرویس ارسال به معنی تحویل اعلان نیست؛ وضعیت صف و خطاهای اخیر را بررسی کنید.',
  jobs: 'تعداد و عمر صف‌ها مربوط به آخرین مشاهده سرور است. برای دیدن تغییرات، وضعیت را تازه‌سازی کنید.',
};

export function OperationsPage() {
  const { can } = useAccess();
  const tabs: { key: OperationTab; label: string }[] = [
    { key: 'health', label: 'سلامت سرویس‌ها' },
    { key: 'notifications', label: 'اعلان‌ها' },
    { key: 'jobs', label: 'پردازش‌ها' },
  ];
  const visibleTabs = tabs.filter((t) => can('/api/admin/v1/operations/' + t.key));
  const defaultTab = visibleTabs[0]?.key ?? 'health';
  const tab = useSearchParams().get('tab') ?? defaultTab;
  return (
    <>
      <PageHeader
        title="عملیات سامانه"
        description="وضعیت واقعی سلامت، اعلان‌ها و پردازش‌ها در آخرین مشاهده سرور"
      />
      <SectionTabs defaultTab={defaultTab} tabs={visibleTabs} />
      {(tab === 'health' || tab === 'notifications' || tab === 'jobs') && (
        <OperationPanel key={tab} tab={tab} />
      )}
    </>
  );
}
function OperationPanel({ tab }: { tab: OperationTab }) {
  const endpoint = '/api/admin/v1/operations/' + tab;
  const { can } = useAccess();
  const q = useApi<OperationData>(endpoint);
  if (!can(endpoint)) return <ErrorState error={new ApiError(403)} />;
  return (
    <Panel
      title={
        tab === 'health'
          ? 'سلامت سامانه'
          : tab === 'notifications'
            ? 'عملیات اعلان‌ها'
            : 'پردازش‌های سامانه'
      }
      action={
        !q.isError && (
          <Button variant="outline" disabled={q.isFetching} onClick={() => void q.refetch()}>
            <RefreshCw size={16} className={q.isFetching ? 'spin' : ''} />
            تازه‌سازی وضعیت
          </Button>
        )
      }
    >
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <p className="notice">{operationNotices[tab]}</p>
          <DataView
            value={
              'dependencies' in q.data
                ? {
                    ...q.data,
                    dependencies: q.data.dependencies.map(({ name, status }) => ({ name, status })),
                  }
                : q.data
            }
          />
          <div className="mt-4">
            <UpdatedAt at={q.dataUpdatedAt} />
          </div>
        </>
      )}
    </Panel>
  );
}
export function AuditPage() {
  return (
    <>
      <PageHeader
        title="رویدادهای مدیریتی"
        description="سوابق ثبت‌شده اقدامات مدیریتی با فیلترهای واقعی API"
      />
      <ListView
        endpoint="/api/admin/v1/audit-logs"
        title="گزارش رویدادها"
        columns={[
          { key: 'occurredAtUtc', title: 'زمان' },
          { key: 'action', title: 'اقدام' },
          { key: 'targetType', title: 'نوع منبع' },
          { key: 'targetId', title: 'شناسه منبع' },
          { key: 'reason', title: 'دلیل' },
          { key: 'result', title: 'نتیجه' },
          { key: 'actorUserId', title: 'عامل' },
        ]}
      />
    </>
  );
}
export function MessagingPage() {
  return (
    <>
      <PageHeader
        title="اطلاعات پیام‌رسان"
        description="فهرست مجاز گفتگوها برای بررسی وضعیت؛ محتوای گفتگوهای خصوصی در این صفحه نمایش داده نمی‌شود."
      />
      <p className="notice">
        مشاهده این فهرست، مجوز ورود به گفتگو یا مدیریت اعضای گروه و کانال رسمی نیست. رسمی‌بودن گفتگو
        از روی نام یا سازنده آن تعیین نمی‌شود.
      </p>
      <ListView
        title="فراداده گفتگوها"
        endpoint="/api/admin/v1/messaging/conversations"
        statusEnum="ConversationStatus"
        columns={[
          { key: 'conversationId', title: 'شناسه گفتگو' },
          { key: 'type', title: 'نوع' },
          { key: 'scope', title: 'محدوده' },
          { key: 'organization.name', title: 'سازمان' },
          { key: 'visibility', title: 'نمایانی' },
          { key: 'status', title: 'وضعیت' },
          { key: 'activeMemberCount', title: 'عضو فعال' },
          { key: 'moderationCaseCount', title: 'پرونده رسیدگی' },
          { key: 'createdAtUtc', title: 'تاریخ ایجاد' },
        ]}
      />
    </>
  );
}
