'use client';
import { SafeImg } from '@/components/shared/safe-img';
import { useState } from 'react';
import Link from 'next/link';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Service } from '@/lib/types';

export default function VendorServicesPage() {
  const { data, loading, error, refetch } = useApi<{ items: Service[] }>('/vendor/services');
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggle(s: Service, value: boolean) {
    setToggling(s.id);
    try { await api(`/vendor/services/${s.id}`, { method: 'PUT', body: { isAvailable: value } }); toast.success(value ? 'Service is now available.' : 'Service paused.'); refetch(); }
    catch (e: any) { toast.error(e.message); } finally { setToggling(null); }
  }

  return (
    <div>
      <PageHeader title="My services" description="Manage your listings and availability." action={<Button asChild><Link href="/dashboard/vendor/services/new"><PlusCircle />Add service</Link></Button>} />
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? (
        <EmptyState title="No services yet" description="Create your first listing to start receiving booking requests." actionHref="/dashboard/vendor/services/new" actionLabel="Add your first service" />
      ) : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Available</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((s) => (
              <TableRow key={s.id}>
                <TableCell><div className="flex items-center gap-3"><SafeImg src={s.images[0]} alt="" className="size-12 rounded-md object-cover" /><span className="max-w-48 truncate font-medium">{s.serviceName}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{s.category}</TableCell>
                <TableCell>{formatPrice(s.price)}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell><Switch checked={s.isAvailable} disabled={toggling === s.id || s.status === 'Rejected'} onCheckedChange={(v) => toggle(s, v)} aria-label={`Toggle availability for ${s.serviceName}`} /></TableCell>
                <TableCell><div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" asChild aria-label="Edit"><Link href={`/dashboard/vendor/services/${s.id}/edit`}><Pencil /></Link></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setToDelete(s)}><Trash2 className="text-destructive" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} destructive confirmLabel="Delete service" title="Delete this service?"
        description={`“${toDelete?.serviceName}” will be removed and its pending requests cancelled. This cannot be undone.`}
        onConfirm={async () => { try { await api(`/vendor/services/${toDelete!.id}`, { method: 'DELETE' }); toast.success('Service deleted.'); refetch(); } catch (e: any) { toast.error(e.message); } }} />
    </div>
  );
}
