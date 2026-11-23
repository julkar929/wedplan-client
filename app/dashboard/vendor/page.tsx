'use client';
import Link from 'next/link';
import { CalendarCheck, Crown, Package, PlusCircle, Sparkles, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState, PageHeader, StatCard, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';

interface Overview { totalServices: number; activeServices: number; pendingBookings: number; acceptedBookings: number; subscriptionPlan: 'Free' | 'Premium'; subscriptionExpiresAt: string | null; cancelAtPeriodEnd: boolean; freeTierLimit: number }

export default function VendorOverview() {
  const { data, loading, error, refetch } = useApi<Overview>('/vendor/overview');
  return (
    <div>
      <PageHeader title="Vendor dashboard" description="Your listings, requests and plan at a glance." action={<Button asChild><Link href="/dashboard/vendor/services/new"><PlusCircle />Add service</Link></Button>} />
      {loading ? <TableSkeleton rows={4} /> : error || !data ? <ErrorState message={error || 'Could not load.'} onRetry={refetch} /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total services" value={data.totalServices} icon={<Package className="size-5" />} />
            <StatCard label="Live services" value={data.activeServices} icon={<Sparkles className="size-5" />} hint="Approved & available" />
            <StatCard label="Pending requests" value={data.pendingBookings} icon={<Timer className="size-5" />} />
            <StatCard label="Accepted bookings" value={data.acceptedBookings} icon={<CalendarCheck className="size-5" />} />
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2">{data.subscriptionPlan === 'Premium' && <Crown className="size-5 text-amber-500" />}Your plan: {data.subscriptionPlan}</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              {data.subscriptionPlan === 'Premium' ? (
                <p className="text-sm text-muted-foreground">Unlimited active services and top placement. {data.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on <b>{formatDate(data.subscriptionExpiresAt)}</b>.</p>
              ) : (
                <div className="min-w-60 flex-1">
                  <p className="text-sm text-muted-foreground">Free plan allows up to {data.freeTierLimit} active services.</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (data.totalServices / data.freeTierLimit) * 100)}%` }} /></div>
                </div>
              )}
              <Button variant={data.subscriptionPlan === 'Premium' ? 'outline' : 'gold'} asChild><Link href="/dashboard/vendor/subscription">{data.subscriptionPlan === 'Premium' ? 'Manage plan' : 'Upgrade to Premium'}</Link></Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
