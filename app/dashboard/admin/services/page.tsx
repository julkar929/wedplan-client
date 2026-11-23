'use client';
import { SafeImg } from '@/components/shared/safe-img';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Eye, Pause, Play, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { CATEGORIES, type Service } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminServicesPage() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const sp = useSearchParams();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(sp.get('status') ?? 'All');
  const [category, setCategory] = useState('All');
  const [target, setTarget] = useState<Service | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 350); return () => clearTimeout(t); }, [search]);

  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (status !== 'All') params.set('status', status);
  if (category !== 'All') params.set('category', category);
  const { data, loading, error, refetch } = useApi<{ items: Service[] }>(`/admin/services?${params}`);

  async function patch(s: Service, body: Record<string, unknown>, ok: string) {
    setBusy(s.id);
    try { await api(`/admin/services/${s.id}`, { method: 'PATCH', body }); toast.success(ok); refetch(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(null); }
  }

  return (
    <div>
      <PageHeader title="Manage services" description="Approve, reject, pause or remove vendor listings." />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_200px_220px]">
        <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search services or vendors…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search services" /></div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent></Select>
        <Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? <EmptyState title="No services match" description="Adjust the filters above." /> : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Vendor</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead>Live</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((s) => (
              <TableRow key={s.id}>
                <TableCell><div className="flex items-center gap-3"><SafeImg src={s.images[0]} alt="" className="size-12 rounded-md object-cover" /><div><p className="max-w-44 truncate font-medium">{s.serviceName}</p><p className="text-xs text-muted-foreground">{s.category}</p></div></div></TableCell>
                <TableCell>{s.vendor?.businessName || s.vendor?.name}</TableCell>
                <TableCell>{formatPrice(s.price)}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>{s.isAvailable ? <StatusBadge status="Active" /> : <StatusBadge status="Cancelled" className="!bg-muted" />}</TableCell>
                <TableCell><div className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" asChild aria-label="View"><Link href={`/services/${s.id}`}><Eye /></Link></Button>
                  {s.status !== 'Approved' && <Button size="icon" variant="ghost" aria-label="Approve" disabled={busy === s.id} onClick={() => patch(s, { status: 'Approved' }, 'Service approved.')}><Check className="text-emerald-600" /></Button>}
                  {s.status !== 'Rejected' && <Button size="icon" variant="ghost" aria-label="Reject" disabled={busy === s.id} onClick={() => patch(s, { status: 'Rejected' }, 'Service rejected.')}><X className="text-destructive" /></Button>}
                  {s.status !== 'Rejected' && <Button size="icon" variant="ghost" aria-label={s.isAvailable ? 'Pause' : 'Resume'} disabled={busy === s.id} onClick={() => patch(s, { isAvailable: !s.isAvailable }, s.isAvailable ? 'Service paused.' : 'Service resumed.')}>{s.isAvailable ? <Pause /> : <Play />}</Button>}
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setTarget(s)}><Trash2 className="text-destructive" /></Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive confirmLabel="Delete service" title="Delete this service?" description={`“${target?.serviceName}” will be permanently removed and its pending requests cancelled.`}
        onConfirm={async () => { try { await api(`/admin/services/${target!.id}`, { method: 'DELETE' }); toast.success('Service deleted.'); refetch(); } catch (e: any) { toast.error(e.message); } }} />
    </div>
  );
}
