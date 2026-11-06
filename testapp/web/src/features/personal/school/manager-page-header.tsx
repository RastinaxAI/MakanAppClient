import type { ReactNode } from 'react';
import s from './manager-workspace.module.css';
import { PageHeading } from '@/components/navigation/page-heading';

export function ManagerPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className={s.dashboardHeader} data-v4-heading data-page-heading>
      <PageHeading title={title} action={action} />
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
