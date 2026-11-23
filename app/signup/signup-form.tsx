'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Eye, EyeOff, Loader2, Store, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/shared/google-button';
import { clearToken } from '@/lib/api';
import { authClient, signUp } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { EMAIL_RE, passwordIssues, safeRedirect } from '@/lib/validation';

type R = 'customer' | 'vendor';

export function SignUpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = safeRedirect(sp.get('redirect'));
  const [role, setRole] = useState<R>(sp.get('role') === 'vendor' ? 'vendor' : 'customer');
  const [f, setF] = useState({ name: '', email: '', password: '', businessName: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const issues = passwordIssues(f.password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (f.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(f.email)) next.email = 'Enter a valid email address.';
    if (issues.length) next.password = 'Password does not meet the requirements.';
    if (role === 'vendor' && f.businessName.trim().length < 2) next.businessName = 'Business name is required for vendors.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    clearToken();
    const { error } = await signUp.email({
      name: f.name.trim(), email: f.email.trim(), password: f.password, role,
      ...(role === 'vendor' ? { businessName: f.businessName.trim() } : {}),
    } as never);
    if (error) {
      const msg = /exist|already/i.test(error.message || '') ? 'An account with this email already exists.' : error.message || 'Could not create your account.';
      setErrors({ form: msg });
      toast.error(msg);
      setBusy(false);
      return;
    }
    toast.success('Account created — welcome to WedPlan!');
    await authClient.getSession({ query: { disableCookieCache: true } });
    router.push(redirect === '/dashboard' ? `/dashboard/${role}` : redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join WedPlan as a couple or as a wedding vendor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
            {([['customer', 'I’m planning a wedding', UserRound], ['vendor', 'I’m a wedding vendor', Store]] as const).map(([v, label, Icon]) => (
              <button key={v} type="button" role="radio" aria-checked={role === v} onClick={() => setRole(v)}
                className={cn('flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition', role === v ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40')}>
                <Icon className="size-5" />{label}
              </button>
            ))}
          </div>
          <GoogleButton role={role} callbackURL={redirect === '/dashboard' ? `/dashboard/${role}` : redirect} label="Sign up with Google" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {errors.form && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
            <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
            {role === 'vendor' && <div className="space-y-1.5"><Label htmlFor="biz">Business name</Label><Input id="biz" value={f.businessName} onChange={set('businessName')} aria-invalid={!!errors.businessName} placeholder="e.g. Ivory Lens Studio" />{errors.businessName && <p className="text-xs text-destructive">{errors.businessName}</p>}</div>}
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" value={f.password} onChange={set('password')} aria-invalid={!!errors.password} className="pr-10" />
                <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <ul className="grid grid-cols-1 gap-0.5 pt-1 text-xs sm:grid-cols-3">
                {['At least 6 characters', 'One uppercase letter', 'One lowercase letter'].map((r) => (
                  <li key={r} className={cn('flex items-center gap-1', f.password && !issues.includes(r) ? 'text-emerald-600' : 'text-muted-foreground')}><Check className="size-3" />{r}</li>
                ))}
              </ul>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Create account</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/signin" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
