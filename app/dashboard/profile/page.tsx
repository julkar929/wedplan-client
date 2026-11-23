'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, StatusBadge } from '@/components/shared/ui-bits';
import { useCurrentUser } from '@/hooks/use-current-user';
import { api, uploadImage } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ name: '', phone: '', location: '', bio: '', businessName: '', image: '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) setF({ name: user.name, phone: user.phone ?? '', location: user.location ?? '', bio: user.bio ?? '', businessName: user.businessName ?? '', image: user.image ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.name, user?.image]);

  if (!user) return null;
  const isVendor = user.role === 'vendor';

  async function onPhoto(file?: File) {
    if (!file) return;
    setUploading(true);
    try { setF((p) => ({ ...p, image: '' })); const url = await uploadImage(file); setF((p) => ({ ...p, image: url })); toast.success('Photo uploaded. Remember to save your changes.'); }
    catch (e: any) { toast.error(e.message); setF((p) => ({ ...p, image: user!.image ?? '' })); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (f.name.trim().length < 2) next.name = 'Full name must be at least 2 characters.';
    if (isVendor && f.businessName.trim().length < 2) next.businessName = 'Business name is required.';
    if (f.bio.length > 600) next.bio = 'Bio must be 600 characters or fewer.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await api('/profile', { method: 'PUT', body: {
        name: f.name.trim(), phone: f.phone.trim() || null, location: f.location.trim() || null, bio: f.bio.trim() || null,
        image: f.image || null, ...(isVendor ? { businessName: f.businessName.trim() } : {}),
      } });
      await authClient.getSession({ query: { disableCookieCache: true } });
      router.refresh();
      toast.success('Profile updated successfully.');
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  }

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile Settings" description="Manage how you appear across WedPlan." />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-20 ring-4 ring-primary/10">{f.image && <AvatarImage src={f.image} alt={user.name} />}<AvatarFallback className="text-xl">{initials}</AvatarFallback></Avatar>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Change photo" className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow disabled:opacity-60">
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-1 flex items-center gap-2"><StatusBadge status={user.role === 'vendor' ? (user.subscriptionPlan === 'Premium' ? 'Premium' : 'Free') : 'Active'} />
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4" noValidate>
            <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={user.email} disabled readOnly /><p className="text-xs text-muted-foreground">Email cannot be changed.</p></div>
            {isVendor && <div className="space-y-1.5"><Label htmlFor="biz">Business name</Label><Input id="biz" value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} aria-invalid={!!errors.businessName} />{errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+880…" /></div>
              <div className="space-y-1.5"><Label htmlFor="loc">Location</Label><Input id="loc" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="City" /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} aria-invalid={!!errors.bio} />{errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}<p className="text-right text-xs text-muted-foreground">{f.bio.length}/600</p></div>
            <Button type="submit" disabled={busy || uploading}>{busy && <Loader2 className="animate-spin" />}Save changes</Button>
          </form>
        </CardContent>
      </Card>
      {user.role === 'vendor' && user.subscriptionExpiresAt && <p className="mt-4 text-sm text-muted-foreground">Premium active until {formatDate(user.subscriptionExpiresAt)}.</p>}
    </div>
  );
}
