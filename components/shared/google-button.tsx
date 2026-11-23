'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

export function GoogleButton({ role, callbackURL, label = 'Continue with Google' }: { role?: 'customer' | 'vendor'; callbackURL: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    // `role` travels via OAuth state and is sanitised on the server (admin is impossible).
    const res = await signIn.social({ provider: 'google', callbackURL, newUserCallbackURL: callbackURL, additionalData: role ? { role } : undefined });
    if (res?.error) {
      toast.error(res.error.message || 'Google sign-in is not available right now.');
      setBusy(false);
    }
  }
  return (
    <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={go}>
      {busy ? <Loader2 className="animate-spin" /> : (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1Z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
      )}
      {label}
    </Button>
  );
}
