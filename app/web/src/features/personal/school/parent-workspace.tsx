'use client';
import { uiClass } from '@/components/v5/classes';
import { SegmentedNavigation } from '@/components/ui/tabs';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock3, Search } from 'lucide-react';
import * as uiText from '@/content/fa';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import { V4List, V4Row } from '@/components/v4/page';
import { V5Scene } from '@/components/v5/scene';
import { useSceneContextSummary } from '@/components/v5/form-actions';
import type { components } from '@/generated/api/schema';
import { date, number } from '@/lib/formatting';
import { usePersonal, usePersonalApi } from '../provider';
import { ChildSelector } from './child-selector';
import { useAuthorizedChildren } from './use-authorized-children';
import { ParentDaily } from './parent-daily';
import { SchoolQuickActions } from './quick-actions';
import { Pager } from './shared';
type S = components['schemas'];
type Report = S['ParentAssignmentReportItem'] | S['ParentExamReportItem'];
const t = uiText.v5Parent;
const root = '/personal/education';
export function ParentWorkspace({ reports }: { reports?: 'assignments' | 'exams' }) {
  const { session } = usePersonal(),
    selection = useAuthorizedChildren();
  const params = useSearchParams(),
    router = useRouter();
  const childrenView =
    params.get('view') === 'children' || (selection.children.isSuccess && !selection.active);
  const program = params.get('view') === 'program';
  const relationChanged =
    selection.children.isSuccess &&
    !!session.context.subjectOrganizationPersonId &&
    params.get('view') !== 'children' &&
    !selection.active;
  const relationKey = session.revision + ':' + session.context.subjectOrganizationPersonId;
  const dismissed = useRef('');
  const [changedOpen, setChangedOpen] = useState(false);
  useEffect(() => {
    if (relationChanged && dismissed.current !== relationKey) setChangedOpen(true);
  }, [relationChanged, relationKey]);
  useEffect(() => {
    if (childrenView && params.get('view') === 'children' && location.hash === '#parent-children')
      document.querySelector<HTMLElement>('[data-parent-children]')?.focus({ preventScroll: true });
  }, [childrenView, params]);
  const name = selection.active?.displayName ?? '';
  const id = childrenView ? 'MK-116' : reports ? 'MK-118' : program ? 'MK-117' : 'MK-09';
  const title = childrenView
    ? t.children
    : reports
      ? t.results + ' ' + name
      : program
        ? t.program + ' ' + name
        : uiText.serverAlignedUi.childDashboard;
  function dismissRelation() {
    dismissed.current = relationKey;
    setChangedOpen(false);
  }
  return (
    <V5Scene
      id={id}
      title={title}
      kind="list"
      subtitle={
        childrenView || !selection.active
          ? t.parentRole
          : id === 'MK-09'
            ? selection.active.organizationName + ' · ' + t.parentRole
            : t.parentRole + ' · ' + name
      }
      contextTitle={
        selection.active?.organizationName ||
        selection.scoped[0]?.organizationName ||
        uiText.navigation_education
      }
      summary={
        childrenView
          ? selection.children.isSuccess
            ? selection.scoped.map((child) => ({
                label: child.displayName,
                value:
                  child.organizationName +
                  ' · ' +
                  (child.relationStatus === 'Active' ? t.activeRelation : t.endedRelation),
              }))
            : []
          : undefined
      }
      back={root}
      onBack={
        !reports && !program && (!childrenView || !selection.active)
          ? () => window.dispatchEvent(new Event('makan:workspace-picker'))
          : undefined
      }
      headerTools={
        <Link
          href="/personal/education/search"
          className={uiClass('rx-icon-button')}
          aria-label={uiText.text_8e87c1832a1e}
        >
          <Search size={22} />
        </Link>
      }
    >
      <SchoolQuickActions />
      {childrenView ? (
        <ChildSelector
          variant="list"
          children={selection.scoped}
          active={selection.active}
          pendingId={selection.pendingId}
          busy={selection.busy}
          loading={selection.children.isPending}
          disabled={!selection.children.isSuccess}
          error={selection.error}
          onRetry={selection.retry}
          onSelect={async (child) => {
            if (await selection.select(child)) router.push(root + '?view=program');
          }}
        />
      ) : selection.children.isPending || selection.busy ? (
        <LoadingSkeleton variant="cards" />
      ) : !selection.children.isSuccess ? (
        <ErrorState error={selection.error} onRetry={selection.retry} />
      ) : (
        selection.active &&
        (reports ? (
          <ParentResults key={session.revision + reports} child={selection.active} kind={reports} />
        ) : (
          <>
            <ParentDaily child={selection.active} program={program} />
          </>
        ))
      )}
      <Dialog
        open={changedOpen}
        onOpenChange={(open) => {
          if (!open) dismissRelation();
        }}
      >
        <DialogContent
          scenario="RX-018"
          onCloseAutoFocus={(event) => {
            const list = document.querySelector<HTMLElement>('[data-parent-children]');
            if (list) {
              event.preventDefault();
              list.focus();
            }
          }}
          title={t.changedAccess}
          description={t.changedRelation}
          footer={
            <Button
              onClick={() => {
                dismissRelation();
                router.replace(root + '?view=children#parent-children');
              }}
            >
              {t.backToChildren}
            </Button>
          }
        >
          <p>{t.changedRelationPolicy}</p>
        </DialogContent>
      </Dialog>
    </V5Scene>
  );
}
function hasReleasedResult(item: Report) {
  return (
    item.releasedScore !== null &&
    Number.isFinite(item.releasedScore) &&
    !!item.releasedAtUtc &&
    Number.isFinite(Date.parse(item.releasedAtUtc))
  );
}
function ParentResults({
  child,
  kind,
}: {
  child: S['AuthorizedChildResult'];
  kind: 'assignments' | 'exams';
}) {
  const [page, setPage] = useState(1),
    [selectedKey, setSelectedKey] = useState<string>();
  const q = usePersonalApi<
    S['ReportPageOfParentAssignmentReportItem'] | S['ReportPageOfParentExamReportItem']
  >(`/api/v1/reports/parent/${kind}?PageNumber=${page}&PageSize=30`);
  const identity = (item: Report) =>
    'assignmentId' in item
      ? item.assignmentId + ':' + item.assignmentVersionId
      : item.examId + ':' + item.examVersionId;
  const selected = q.isSuccess
    ? q.data.items.find((item) => identity(item) === selectedKey)
    : undefined;
  function description(item: Report) {
    return hasReleasedResult(item)
      ? t.releasedResult +
          ' · ' +
          number(item.releasedScore) +
          ' ' +
          uiText.text_a624a1e41ffd.trim() +
          ' ' +
          number(item.maximumScore)
      : t.unreleasedResult;
  }
  useSceneContextSummary(
    q.isSuccess
      ? q.data.items.map((item) => ({ label: item.title, value: description(item) }))
      : [],
  );
  return (
    <>
      <SegmentedNavigation aria-label={t.resultTypes}>
        <Link
          href={root + '/assignments'}
          aria-current={kind === 'assignments' ? 'page' : undefined}
        >
          {t.assignments}
        </Link>
        <Link href={root + '/exams'} aria-current={kind === 'exams' ? 'page' : undefined}>
          {t.exams}
        </Link>
      </SegmentedNavigation>
      {q.isPending ? (
        <LoadingSkeleton variant="cards" />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <V4List>
            {q.data.items.map((item) => (
              <V4Row
                key={identity(item)}
                title={item.title}
                description={description(item)}
                icon={hasReleasedResult(item) ? <CheckCircle2 /> : <Clock3 />}
                onClick={() => setSelectedKey(identity(item))}
                end={
                  !hasReleasedResult(item) ? (
                    <span className={uiClass('badge warn')}>{t.waiting}</span>
                  ) : undefined
                }
              />
            ))}
          </V4List>
          {!q.data.items.length && <EmptyState variant="v5" title={uiText.text_248322604318} />}
          {(page > 1 || q.data.totalCount > q.data.pageSize) && (
            <Pager page={page} total={q.data.totalCount} onChange={setPage} />
          )}
        </>
      )}
      <p className={uiClass('policy')}>{t.resultPolicy}</p>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedKey(undefined);
        }}
      >
        <DialogContent
          title={selected?.title || t.releasedResult}
          footer={
            <Button onClick={() => setSelectedKey(undefined)}>{uiText.text_b90ffe172b6d}</Button>
          }
        >
          <p>
            {child.displayName} · {child.organizationName}
          </p>
          {selected && (
            <>
              <p>{selected.classTitle}</p>
              <p>
                {'submissionStatus' in selected
                  ? selected.submissionStatus
                    ? label(selected.submissionStatus)
                    : uiText.text_2675dd46965d
                  : selected.latestAttemptStatus
                    ? label(selected.latestAttemptStatus)
                    : uiText.text_8b56533a0281}
              </p>
              <p>{description(selected)}</p>
              {hasReleasedResult(selected) && (
                <>
                  <p>{date(selected.releasedAtUtc, true)}</p>
                  {selected.guardianVisibleFeedback && <p>{selected.guardianVisibleFeedback}</p>}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
