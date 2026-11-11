'use client';
import { useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ListView } from '@/components/ui/list-view';
import { Panel, DataView } from '@/components/ui/data-view';
import { SectionTabs } from '@/components/ui/section-tabs';
import { CommandDialog } from '@/components/ui/command-dialog';
import { LoadingSkeleton, ErrorState, UpdatedAt } from '@/components/ui/states';
import { useApi } from '@/lib/api/hooks';
import type { components } from '@/generated/api/schema';
import { useAccess } from '@/features/access-context/provider';
import { ApiError } from '@/lib/api/errors';
import { money } from '@/lib/formatting';
import Link from '@/components/ui/app-link';
import { PlanCatalog } from './plan-catalog';
import { CommercialContracts, CommercialHistory } from './commercial-contracts';
import { PlanVersion } from './plan-version';
export function CommercePage() {
  const { can } = useAccess();
  const defaultTab = can('/api/admin/v1/commerce/plans')
    ? 'plans'
    : can('/api/admin/v1/commerce/subscriptions')
      ? 'subscriptions'
      : 'provisioning';
  const tab = useSearchParams().get('tab') ?? defaultTab;
  return (
    <>
      <PageHeader
        title="پلن‌ها و اشتراک‌ها"
        description="پلن‌های فردی و سازمانی، قراردادهای تجاری و سهمیه‌ها"
        action={
          tab === 'plans' ? (
            <CommandDialog title="ایجاد پلن" path="/api/admin/v1/commerce/plans" resultView />
          ) : undefined
        }
      />
      <SectionTabs
        defaultTab={defaultTab}
        tabs={[
          ...(can('/api/admin/v1/commerce/plans') ? [{ key: 'plans', label: 'پلن‌ها' }] : []),
          ...(can('/api/admin/v1/commerce/subscriptions')
            ? [{ key: 'subscriptions', label: 'اشتراک‌ها' }]
            : []),
          ...(can('/api/admin/v1/commerce/users/00000000-0000-0000-0000-000000000001/subscription')
            ? [{ key: 'contracts', label: 'قراردادها و سهمیه‌ها' }]
            : []),
          ...(can('/api/admin/v1/provisioning')
            ? [{ key: 'provisioning', label: 'درخواست‌های ایجاد سازمان' }]
            : []),
        ]}
      />
      {tab === 'plans' && <PlanCatalog />}
      {tab === 'contracts' && <CommercialContracts />}
      {tab === 'subscriptions' && (
        <ListView
          title="اشتراک سازمان‌ها"
          endpoint="/api/admin/v1/commerce/subscriptions"
          statusEnum="SubscriptionStatus"
          columns={[
            {
              key: 'organization.name',
              title: 'سازمان',
              link: (r) => '/admin/organizations/' + (r.organization as { id: string }).id,
            },
            { key: 'planCode', title: 'پلن' },
            { key: 'status', title: 'وضعیت' },
            { key: 'planVersionNumber', title: 'نسخه پلن' },
            { key: 'startsAtUtc', title: 'شروع' },
            { key: 'endsAtUtc', title: 'پایان' },
          ]}
        />
      )}
      {tab === 'provisioning' && (
        <ListView
          title="وضعیت واقعی ایجاد سازمان"
          endpoint="/api/admin/v1/provisioning"
          statusEnum="PlatformProvisioningStatus"
          columns={[
            {
              key: 'organizationName',
              title: 'نام سازمان',
              render: (r) =>
                r.organizationId ? (
                  <Link className="table-link" href={'/admin/organizations/' + r.organizationId}>
                    {String(r.organizationName)}
                  </Link>
                ) : (
                  <span>{String(r.organizationName)}</span>
                ),
            },
            { key: 'status', title: 'وضعیت' },
            { key: 'failureCode', title: 'کد خطا' },
            { key: 'organizationId', title: 'شناسه سازمان' },
            { key: 'clientOperationId', title: 'شناسه عملیات' },
            { key: 'updatedAtUtc', title: 'آخرین تغییر' },
          ]}
        />
      )}
    </>
  );
}
export function PlanDetail({ id }: { id: string }) {
  const path = '/api/admin/v1/commerce/plans/' + id;
  const { can } = useAccess();
  const q = useApi<components['schemas']['PlatformPlanDetail']>(path);
  if (!can(path)) return <ErrorState error={new ApiError(403)} />;
  if (q.isPending) return <LoadingSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => void q.refetch()} />;
  return (
    <>
      <PageHeader
        title={q.data.displayName}
        description={q.data.code}
        parent={{ href: '/admin/commerce', label: 'پلن‌ها' }}
        action={<CommandDialog title="نسخه جدید پلن" path={path + '/versions'} resultView />}
      />
      <Panel
        title="شرایط ارائه پلن"
        action={
          <CommandDialog
            title="تنظیم فروش و تمدید"
            method="PUT"
            path={path + '/availability'}
            disabled={!q.data.version}
            defaults={{
              catalogVisible: q.data.catalogVisible,
              newPurchaseAvailable: q.data.newPurchaseAvailable,
              renewalAvailable: q.data.renewalAvailable,
              expectedVersion: q.data.version,
            }}
            preview={
              <p className="notice">
                {q.data.displayName}؛ {q.data.code}؛ {q.data.planId}
              </p>
            }
            onReload={async () => {
              const r = await q.refetch({ throwOnError: true });
              return { expectedVersion: r.data?.version };
            }}
          />
        }
      >
        <DataView
          value={q.data}
          fields={['audience', 'catalogVisible', 'newPurchaseAvailable', 'renewalAvailable']}
        />
      </Panel>
      {q.data.versionsTruncated && <div className="notice">فهرست نسخه‌های پلن محدود شده است.</div>}
      {q.data.versions.map((v) => (
        <PlanVersion
          key={v.planVersionId}
          version={v}
          reload={async () => {
            const r = await q.refetch({ throwOnError: true });
            return r.data?.versions.find((x) => x.planVersionId === v.planVersionId);
          }}
        />
      ))}
      <CommercialHistory id={id} />
    </>
  );
}
export function FinancePage() {
  return (
    <>
      <PageHeader title="مالی" description="پیگیری سفارش‌ها، پرداخت و فعال‌سازی اشتراک" />
      <p className="notice">
        وضعیت پرداخت و اجرای سفارش جداگانه گزارش می‌شوند. پرداخت ثبت‌شده‌ای که اشتراکش در انتظار
        فعال‌سازی است، به پرداخت مجدد نیاز ندارد.
      </p>
      <ListView
        endpoint="/api/admin/v1/finance/orders"
        title="سفارش‌ها"
        statusEnum="OrderStatus"
        columns={[
          { key: 'orderId', title: 'سفارش', link: (r) => '/admin/finance/' + r.orderId },
          { key: 'status', title: 'وضعیت پرداخت سفارش' },
          { key: 'fulfillmentState', title: 'اجرای سفارش' },
          { key: 'organization.name', title: 'سازمان' },
          {
            key: 'amount',
            title: 'مبلغ',
            render: (r) =>
              money(
                typeof r.amount === 'number' ? r.amount : null,
                typeof r.currency === 'string' ? r.currency : null,
              ),
          },
          { key: 'createdAtUtc', title: 'ایجاد' },
          { key: 'paidAtUtc', title: 'پرداخت' },
        ]}
      />
    </>
  );
}
export function OrderDetail({ id }: { id: string }) {
  const path = '/api/admin/v1/finance/orders/' + id;
  const { can } = useAccess();
  const q = useApi<components['schemas']['PlatformOrderItem']>(path);
  if (!can(path)) return <ErrorState error={new ApiError(403)} />;
  const order = q.data;
  return (
    <>
      <PageHeader
        title="جزئیات سفارش"
        description="مبلغ و واحد پول مستقیماً از سرور دریافت می‌شوند."
        parent={{ href: '/admin/finance', label: 'سفارش‌ها' }}
        action={
          !q.isError && (
            <Button variant="outline" disabled={q.isFetching} onClick={() => void q.refetch()}>
              <RefreshCw size={16} className={q.isFetching ? 'spin' : ''} />
              تازه‌سازی سفارش
            </Button>
          )
        }
      />
      {q.isPending ? (
        <LoadingSkeleton />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : order ? (
        <>
          {order.status === 'Paid' &&
            order.fulfillmentState === 'SubscriptionActivationPending' && (
              <p className="notice warning" role="status">
                پرداخت ثبت شده است؛ فعال‌سازی اشتراک هنوز در انتظار است. برای این سفارش دوباره
                پرداخت نکنید؛ وضعیت فعال‌سازی را از همین صفحه پیگیری کنید.
              </p>
            )}
          <div className="detail-grid">
            <Panel title="اطلاعات سفارش">
              <DataView
                value={{
                  ...order,
                  fulfillmentState: order.fulfillmentState,
                  amount: money(order.amount, order.currency),
                }}
                fields={[
                  'orderId',
                  'purchaserUserId',
                  'organization',
                  'planVersionId',
                  'status',
                  'fulfillmentState',
                  'amount',
                  'createdAtUtc',
                  'paidAtUtc',
                  'cancelledAtUtc',
                ]}
              />
            </Panel>
            <Panel title="پرداخت ثبت‌شده">
              {order.payment ? (
                <DataView
                  value={{
                    ...order.payment,
                    maskedSettlementReference: order.payment.maskedSettlementReference,
                    providerPaidAtUtc: order.payment.providerPaidAtUtc,
                    amount: money(order.payment.amount, order.payment.currency),
                  }}
                  fields={[
                    'paymentId',
                    'paymentAttemptId',
                    'provider',
                    'maskedProviderReference',
                    'maskedSettlementReference',
                    'amount',
                    'paidAtUtc',
                    'providerPaidAtUtc',
                  ]}
                />
              ) : (
                <p className="field-help">پرداخت قطعی برای این سفارش گزارش نشده است.</p>
              )}
            </Panel>
          </div>
          <Panel title="تلاش‌های پرداخت">
            {order.paymentAttempts.length ? (
              order.paymentAttempts.map((attempt) => (
                <div className="nested-block" key={attempt.paymentAttemptId}>
                  <DataView
                    value={{
                      ...attempt,
                      maskedSettlementReference: attempt.maskedSettlementReference,
                      callbackReceivedAtUtc: attempt.callbackReceivedAtUtc,
                      amount: money(attempt.amount, attempt.currency),
                    }}
                    fields={[
                      'paymentAttemptId',
                      'provider',
                      'status',
                      'amount',
                      'maskedProviderReference',
                      'maskedSettlementReference',
                      'createdAtUtc',
                      'callbackReceivedAtUtc',
                      'verifiedAtUtc',
                      'completedAtUtc',
                      'failureCode',
                    ]}
                  />
                </div>
              ))
            ) : (
              <p className="field-help">تلاشی برای پرداخت گزارش نشده است.</p>
            )}
            <p className="field-help">
              مرجع پیگیری درگاه و مرجع تسویه مستقل‌اند. دریافت بازگشت از درگاه به‌تنهایی تأیید
              پرداخت نیست؛ نتیجه ثبت‌شده سرور مرجع است.
            </p>
          </Panel>
          <UpdatedAt at={q.dataUpdatedAt} />
        </>
      ) : null}
    </>
  );
}
