'use client';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Booking } from '@/lib/types';

export default function VendorBookingsPage() {
  const { data, loading, error, refetch } = useApi<{ items: Booking[] }>('/vendor/bookings');
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(id: string, status: 'Accepted' | 'Rejected') {
    setBusy(id + status);
    try { await api(`/vendor/bookings/${id}`, { method: 'PATCH', body: { status } }); toast.success(`Request ${status.toLowerCase()}.`); refetch(); }
    catch (e: any) { toast.error(e.message); refetch(); } finally { setBusy(null); }
  }

  return (
    <div>
      <PageHeader title="Booking requests" description="Accept or decline requests from couples." />
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? (
        <EmptyState title="No booking requests yet" description="When customers request your services they will show up here." />
      ) : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Event</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((b) => (
              <TableRow key={b.id}>
                <TableCell><p className="font-medium">{b.customer?.name ?? 'Unknown'}</p><p className="text-xs text-muted-foreground">{b.customer?.email}</p></TableCell>
                <TableCell className="max-w-44 truncate">{b.service?.serviceName ?? 'Removed service'}</TableCell>
                <TableCell><p>{formatDate(b.eventDate)}</p><p className="text-xs text-muted-foreground">{b.eventLocation}</p></TableCell>
                <TableCell className="max-w-56"><p className="line-clamp-2 text-sm text-muted-foreground" title={b.message}>{b.message}</p></TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell>{b.status === 'Pending' ? (
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" disabled={!!busy} onClick={() => respond(b.id, 'Accepted')}><Check />Accept</Button>
                    <Button size="sm" variant="outline" disabled={!!busy} onClick={() => respond(b.id, 'Rejected')}><X />Reject</Button>
                  </div>) : <span className="block text-right text-xs text-muted-foreground">—</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
    </div>
  );
}
