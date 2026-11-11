import { NotificationSettings } from '@/features/personal/notification-settings';
import { NotificationDevice, NotificationDevices } from '@/features/personal/notification-devices';
import { notFound } from 'next/navigation';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { category = [] } = await params;
  if (category.length > 1) notFound();
  if (category[0] === 'device')
    return <NotificationDevice preferences={(await searchParams).view === 'preferences'} />;
  if (category[0] === 'devices') return <NotificationDevices />;
  return <NotificationSettings category={category[0]} />;
}
