'use client';
import Link from 'next/link';
import { CalendarCheck, CheckCircle2, ListChecks, Timer, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState, PageHeader, StatCard, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { useCurrentUser } from '@/hooks/use-current-user';

interface Overview { totalBookings: number; pendingBookings: number; acceptedBookings: number; rejectedBookings: number }

export default function CustomerOverview() {
  const { user } = useCurrentUser();
  const { data, loading, error, refetch } = useApi<Overview>('/customer/overview');
  return (
    <div>
      <PageHeader title={`Hello, ${user?.name.split(' ')[0] ?? 'there'} 👋`} description="Track your wedding booking requests." action={<Button asChild><Link href="/services"><CalendarCheck />Find vendors</Link></Button>} />
      {loading ? <TableSkeleton rows={3} /> : error || !data ? <ErrorState message={error || 'Could not load.'} onRetry={refetch} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total requests" value={data.totalBookings} icon={<ListChecks className="size-5" />} />
          <StatCard label="Pending" value={data.pendingBookings} icon={<Timer className="size-5" />} />
          <StatCard label="Accepted" value={data.acceptedBookings} icon={<CheckCircle2 className="size-5" />} />
          <StatCard label="Rejected" value={data.rejectedBookings} icon={<XCircle className="size-5" />} />
        </div>
      )}
    </div>
  );
}
