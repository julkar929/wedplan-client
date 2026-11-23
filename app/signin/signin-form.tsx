'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/shared/google-button';
import { clearToken } from '@/lib/api';
import { authClient, signIn } from '@/lib/auth-client';
import { EMAIL_RE, safeRedirect } from '@/lib/validation';

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = safeRedirect(sp.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (sp.get('blocked')) toast.error('Your account has been blocked by an administrator.');
    if (sp.get('error')) toast.error('Sign-in failed. Please try again.');
  }, [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    clearToken();
    const { error } = await signIn.email({ email: email.trim(), password });
    if (error) {
      const msg = error.status === 403 ? error.message || 'Your account has been blocked.' : 'Invalid email or password.';
      setErrors({ form: msg });
      toast.error(msg);
      setBusy(false);
      return;
    }
    toast.success('Welcome back!');
    await authClient.getSession({ query: { disableCookieCache: true } });
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your bookings and services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <GoogleButton callbackURL={redirect} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {errors.form && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} className="pr-10" />
                <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Sign in</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">New to WedPlan? <Link href={`/signup${redirect !== '/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-medium text-primary hover:underline">Create an account</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
