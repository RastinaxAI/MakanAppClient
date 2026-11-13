import { notFound, redirect } from 'next/navigation';
import { ExtracurricularRoute } from '@/features/extracurricular/connected';
import { isExtracurricularPath } from '@/features/extracurricular/routes';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string[] }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { section } = await params,
    { step } = await searchParams;
  if (!isExtracurricularPath(section)) notFound();
  if (section.length === 1 && ['requests', 'invitations'].includes(section[0]))
    redirect('/personal/extracurricular?tab=' + section[0]);
  return <ExtracurricularRoute section={section} step={step} />;
}
