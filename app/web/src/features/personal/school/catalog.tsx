'use client';
import * as uiText from '@/content/fa';
import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CalendarRange, Plus } from 'lucide-react';
import { V4List, V4Row } from '@/components/v4/page';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingSkeleton, label } from '@/components/ui/states';
import type { components } from '@/generated/api/schema';
import { usePersonalApi } from '../provider';
import { SchoolSearch, schoolQuery } from './directory';
import { base, Pager } from './shared';
import { ManagerPageHeader } from './manager-page-header';
export function SchoolCatalog({ kind }: { kind: 'courses' | 'periods' }) {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const data = usePersonalApi<
    | components['schemas']['SchoolPageOfCourseResult']
    | components['schemas']['SchoolPageOfAcademicPeriodResult']
  >(`/api/v1/academic/${kind}?` + schoolQuery(page, search));
  return (
    <div data-v4-view={kind === 'courses' ? 'MK-91' : 'MK-89'}>
      <ManagerPageHeader
        title={kind === 'courses' ? uiText.text_9398dccd15ef : uiText.text_8ce15ef5c0a9}
        action={
          <Button asChild>
            <Link href={base + '/' + kind + '/new'}>
              <Plus size={18} />
              {kind === 'courses' ? uiText.text_bc7837ca0bbb : uiText.text_c19ede0cddae}
            </Link>
          </Button>
        }
      />
      <SchoolSearch
        label={kind === 'courses' ? uiText.text_7469916c83c5 : uiText.text_65d3d3894fde}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      {data.isPending ? (
        <LoadingSkeleton />
      ) : data.isError ? (
        <ErrorState error={data.error} onRetry={() => void data.refetch()} />
      ) : data.data.items.length ? (
        <>
          <V4List>
            {data.data.items.map((item) => (
              <V4Row
                key={item.id}
                title={item.title}
                description={label(item.status)}
                icon={kind === 'courses' ? <BookOpen /> : <CalendarRange />}
              />
            ))}
          </V4List>
          <Pager
            page={data.data.page}
            size={data.data.pageSize}
            total={data.data.totalCount}
            onChange={setPage}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
