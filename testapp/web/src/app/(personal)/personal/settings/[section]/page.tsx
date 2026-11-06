import { notFound } from 'next/navigation';
import { AccountHelp, type AccountHelpSection } from '@/features/personal/account-help';
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!['help', 'phone', 'delete-account', 'communication', 'install', 'support'].includes(section))
    notFound();
  return <AccountHelp section={section as AccountHelpSection} />;
}
