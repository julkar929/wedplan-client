'use client';
import { SafeImg } from '@/components/shared/safe-img';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Booking } from '@/lib/types';

export default function CustomerBookingsPage() {
  const { data, loading, error, refetch } = useApi<{ items: Booking[] }>('/customer/bookings');
  const [target, setTarget] = useState<Booking | null>(null);

  return (
    <div>
      <PageHeader title="My bookings" description="Every request you've sent to vendors." />
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? (
        <EmptyState title="No bookings yet" description="Find a vendor you love and send your first request." actionHref="/services" actionLabel="Browse services" />
      ) : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Vendor</TableHead><TableHead>Event</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.service ? <Link href={`/services/${b.service.id}`} className="flex items-center gap-3 font-medium hover:text-primary"><SafeImg src={b.service.image ?? undefined} alt="" className="size-11 rounded-md object-cover" /><span className="max-w-44 truncate">{b.service.serviceName}</span></Link> : <span className="text-muted-foreground">Removed service</span>}</TableCell>
                <TableCell>{b.vendor?.businessName || b.vendor?.name}</TableCell>
                <TableCell><p>{formatDate(b.eventDate)}</p><p className="text-xs text-muted-foreground">{b.eventLocation}</p></TableCell>
                <TableCell>{b.service ? formatPrice(b.service.price) : '—'}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell className="text-right">{b.status === 'Pending' ? <Button size="sm" variant="outline" onClick={() => setTarget(b)}>Cancel</Button> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive title="Cancel this request?" confirmLabel="Cancel request"
        description={`Your request for “${target?.service?.serviceName ?? 'this service'}” on ${formatDate(target?.eventDate)} will be withdrawn.`}
        onConfirm={async () => { try { await api(`/customer/bookings/${target!.id}/cancel`, { method: 'PATCH' }); toast.success('Booking request cancelled.'); refetch(); } catch (e: any) { toast.error(e.message); refetch(); } }} />
    </div>
  );
}
