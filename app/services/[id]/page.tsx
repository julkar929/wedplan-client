'use client';
import { SafeImg } from '@/components/shared/safe-img';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Crown, Loader2, MapPin, Phone, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { api } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';
import type { Service } from '@/lib/types';

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const { data, loading, error } = useApi<{ service: Service }>(`/services/${id}`);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Skeleton className="mb-6 h-8 w-40" /><div className="grid gap-8 lg:grid-cols-5"><Skeleton className="aspect-[4/3] lg:col-span-3" /><Skeleton className="h-80 lg:col-span-2" /></div></div>;
  if (error || !data) return <div className="mx-auto max-w-2xl px-4 py-20"><EmptyState title="Service not found" description={error || 'This service may have been removed or is not available.'} actionHref="/services" actionLabel="Back to services" /></div>;

  const s = data.service;
  const premium = s.vendor?.subscriptionPlan === 'Premium';
  const canBook = user?.role === 'customer' && s.status === 'Approved' && s.isAvailable;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/services" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to services</Link>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
            <SafeImg src={s.images[active] ?? s.images[0]} alt={s.serviceName} className="size-full object-cover" />
          </div>
          {s.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {s.images.map((img, i) => (
                <button key={img + i} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={cn('aspect-[4/3] overflow-hidden rounded-lg border-2', i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <SafeImg src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="pt-4">
            <h2 className="mb-2 text-xl font-semibold">About this service</h2>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{s.description}</p>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{s.category}</Badge>
                {premium && <Badge variant="gold"><Crown />Premium vendor</Badge>}
                {s.status !== 'Approved' && <Badge variant="warning">{s.status}</Badge>}
                {!s.isAvailable && <Badge variant="danger">Unavailable</Badge>}
              </div>
              <h1 className="text-3xl font-semibold">{s.serviceName}</h1>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" />{s.location}</p>
              <div><span className="text-xs text-muted-foreground uppercase">Starting from</span><p className="font-serif text-3xl font-semibold text-primary">{formatPrice(s.price)}</p></div>

              {canBook ? (
                <Button size="lg" className="w-full" onClick={() => setOpen(true)}><CalendarDays /> Request booking</Button>
              ) : user?.role === 'customer' ? (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">This service is not currently open for booking.</p>
              ) : (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Only customer accounts can send booking requests. You are signed in as {user?.role}.</p>
              )}

              {s.vendor && (
                <div className="border-t pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><Store className="size-3.5" /> Offered by</p>
                  <p className="font-serif text-lg font-semibold">{s.vendor.businessName || s.vendor.name}</p>
                  {s.vendor.location && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" />{s.vendor.location}</p>}
                  {s.vendor.phone && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="size-3.5" />{s.vendor.phone}</p>}
                  {s.vendor.bio && <p className="mt-2 text-sm text-muted-foreground">{s.vendor.bio}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
      {canBook && <BookingDialog service={s} open={open} onOpenChange={setOpen} />}
    </div>
  );
}

function BookingDialog({ service, open, onOpenChange }: { service: Service; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [f, setF] = useState({ eventDate: '', eventLocation: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!f.eventDate) next.eventDate = 'Choose your event date.';
    else if (f.eventDate < today) next.eventDate = 'Event date must be today or later.';
    if (f.eventLocation.trim().length < 3) next.eventLocation = 'Enter the event location.';
    if (f.message.trim().length < 5) next.message = 'Tell the vendor a little about your wedding.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await api('/customer/bookings', { method: 'POST', body: { serviceId: service.id, ...f } });
      toast.success('Booking request sent! The vendor will respond soon.');
      onOpenChange(false);
      setF({ eventDate: '', eventLocation: '', message: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Request {service.serviceName}</DialogTitle><DialogDescription>The vendor will review your request and accept or decline it.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5"><Label htmlFor="date">Event date</Label><Input id="date" type="date" min={today} value={f.eventDate} onChange={(e) => setF({ ...f, eventDate: e.target.value })} aria-invalid={!!errors.eventDate} />{errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="loc">Event location</Label><Input id="loc" placeholder="Venue / city" value={f.eventLocation} onChange={(e) => setF({ ...f, eventLocation: e.target.value })} aria-invalid={!!errors.eventLocation} />{errors.eventLocation && <p className="text-xs text-destructive">{errors.eventLocation}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="msg">Message</Label><Textarea id="msg" placeholder="Guest count, style, special requests…" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} aria-invalid={!!errors.message} />{errors.message && <p className="text-xs text-destructive">{errors.message}</p>}</div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Send request</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
