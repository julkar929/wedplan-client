'use client';
import Link from 'next/link';
import { Banknote, Clock, Package, Receipt, Store, Users, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorState, PageHeader, StatCard, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { formatPrice } from '@/lib/utils';

interface Overview { totalUsers: number; totalVendors: number; totalCustomers: number; totalServices: number; pendingServices: number; totalTransactions: number; totalRevenue: number }

export default function AdminOverview() {
  const { data, loading, error, refetch } = useApi<Overview>('/admin/overview');
  return (
    <div>
      <PageHeader title="Admin overview" description="Platform health at a glance." />
      {loading ? <TableSkeleton rows={4} /> : error || !data ? <ErrorState message={error || 'Could not load.'} onRetry={refetch} /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={data.totalUsers} icon={<Users className="size-5" />} />
            <StatCard label="Vendors" value={data.totalVendors} icon={<Store className="size-5" />} />
            <StatCard label="Customers" value={data.totalCustomers} icon={<UserRound className="size-5" />} />
            <StatCard label="Services" value={data.totalServices} icon={<Package className="size-5" />} />
            <StatCard label="Awaiting review" value={data.pendingServices} icon={<Clock className="size-5" />} hint="Pending services" />
            <StatCard label="Transactions" value={data.totalTransactions} icon={<Receipt className="size-5" />} />
            <StatCard label="Revenue" value={formatPrice(data.totalRevenue)} icon={<Banknote className="size-5" />} hint="Succeeded payments" />
          </div>
          {data.pendingServices > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"><p className="text-sm"><b>{data.pendingServices}</b> service{data.pendingServices > 1 ? 's' : ''} waiting for your review.</p><Button size="sm" asChild><Link href="/dashboard/admin/services?status=Pending">Review now</Link></Button></div>}
        </div>
      )}
    </div>
  );
}
