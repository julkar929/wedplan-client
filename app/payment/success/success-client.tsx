'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Crown, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

type State = 'checking' | 'active' | 'delayed';

/**
 * The redirect from Stripe proves nothing. Premium is granted ONLY by the signed webhook on the server;
 * this page just polls the (read-only) status endpoint until the webhook has been processed.
 */
export function SuccessClient() {
  const sessionId = useSearchParams().get('session_id');
  const [state, setState] = useState<State>('checking');
  const tries = useRef(0);

  useEffect(() => {
    if (!sessionId) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await api<{ premiumActive: boolean }>(`/vendor/subscription/session/${encodeURIComponent(sessionId)}`);
        if (r.premiumActive) { await authClient.getSession({ query: { disableCookieCache: true } }); if (!stop) setState('active'); return; }
      } catch { /* keep polling */ }
      if (++tries.current >= 15) { if (!stop) setState('delayed'); return; }
      setTimeout(tick, 2000);
    };
    tick();
    return () => { stop = true; };
  }, [sessionId]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-16">
      <Card className="w-full text-center"><CardContent className="space-y-4 py-6">
        {!sessionId ? (<><TriangleAlert className="mx-auto size-12 text-amber-500" /><h1 className="text-2xl font-semibold">Missing payment session</h1><p className="text-sm text-muted-foreground">Open your subscription page to check your plan.</p></>)
          : state === 'checking' ? (<><Loader2 className="mx-auto size-12 animate-spin text-primary" /><h1 className="text-2xl font-semibold">Confirming your payment…</h1><p className="text-sm text-muted-foreground">Waiting for Stripe to confirm. This usually takes a few seconds.</p></>)
          : state === 'active' ? (<><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h1 className="flex items-center justify-center gap-2 text-2xl font-semibold"><Crown className="size-6 text-amber-500" />You&apos;re Premium!</h1><p className="text-sm text-muted-foreground">Unlimited services and top placement are now active.</p></>)
          : (<><TriangleAlert className="mx-auto size-12 text-amber-500" /><h1 className="text-2xl font-semibold">Still processing</h1><p className="text-sm text-muted-foreground">Your payment is taking longer than usual to confirm. Premium will activate automatically once Stripe notifies us — check back in a minute.</p></>)}
        <Button asChild className="mt-2"><Link href="/dashboard/vendor/subscription">Go to subscription</Link></Button>
      </CardContent></Card>
    </div>
  );
}
