'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/shared/image-uploader';
import { api, ApiError } from '@/lib/api';
import { CATEGORIES, type Service } from '@/lib/types';

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [f, setF] = useState({
    serviceName: service?.serviceName ?? '', category: service?.category ?? '', price: service ? String(service.price) : '',
    location: service?.location ?? '', description: service?.description ?? '', images: service?.images ?? [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (f.serviceName.trim().length < 3) next.serviceName = 'Service name must be at least 3 characters.';
    if (!f.category) next.category = 'Choose a category.';
    if (!f.price || Number(f.price) <= 0) next.price = 'Enter a price greater than 0.';
    if (f.location.trim().length < 2) next.location = 'Location is required.';
    if (f.description.trim().length < 20) next.description = 'Describe the service in at least 20 characters.';
    if (f.images.length === 0) next.images = 'Upload at least one image.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setLimitHit(false);
    const body = { ...f, price: Number(f.price), serviceName: f.serviceName.trim(), location: f.location.trim(), description: f.description.trim() };
    try {
      if (service) {
        await api(`/vendor/services/${service.id}`, { method: 'PUT', body });
        toast.success(service.status === 'Approved' ? 'Saved. Your changes will be reviewed again by an admin.' : 'Service updated.');
      } else {
        await api('/vendor/services', { method: 'POST', body });
        toast.success('Service submitted for admin approval.');
      }
      router.push('/dashboard/vendor/services');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setLimitHit(true);
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setBusy(false); }
  }

  return (
    <Card className="max-w-3xl">
      <CardContent>
        <form onSubmit={submit} className="space-y-5" noValidate>
          {limitHit && (
            <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              You&apos;ve reached the Free plan limit. <Link href="/dashboard/vendor/subscription" className="font-semibold underline">Upgrade to Premium</Link> for unlimited services.
            </div>
          )}
          <div className="space-y-1.5"><Label htmlFor="sn">Service name</Label><Input id="sn" value={f.serviceName} onChange={(e) => setF({ ...f, serviceName: e.target.value })} aria-invalid={!!errors.serviceName} />{errors.serviceName && <p className="text-xs text-destructive">{errors.serviceName}</p>}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}><SelectTrigger aria-label="Category" aria-invalid={!!errors.category}><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="price">Starting price (USD)</Label><Input id="price" type="number" min={1} step="1" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} aria-invalid={!!errors.price} />{errors.price && <p className="text-xs text-destructive">{errors.price}</p>}</div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="loc">Location</Label><Input id="loc" placeholder="City or region served" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} aria-invalid={!!errors.location} />{errors.location && <p className="text-xs text-destructive">{errors.location}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="desc">Description</Label><Textarea id="desc" className="min-h-36" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} aria-invalid={!!errors.description} />{errors.description && <p className="text-xs text-destructive">{errors.description}</p>}</div>
          <div className="space-y-1.5"><Label>Images</Label><ImageUploader value={f.images} onChange={(images) => setF({ ...f, images })} />{errors.images && <p className="text-xs text-destructive">{errors.images}</p>}</div>
          <div className="flex gap-3"><Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{service ? 'Save changes' : 'Submit for approval'}</Button><Button type="button" variant="outline" asChild><Link href="/dashboard/vendor/services">Cancel</Link></Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
