'use client';
import { useState } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

interface Overview { subscriptionPlan: 'Free' | 'Premium'; subscriptionExpiresAt: string | null; cancelAtPeriodEnd: boolean; freeTierLimit: number }

const FEATURES = ['Unlimited active services', 'Premium badge on all your listings', 'Top placement in search results', 'Priority in the featured section'];

export default function SubscriptionPage() {
  const ov = useApi<Overview>('/vendor/overview');
  const tx = useApi<{ items: Transaction[] }>('/vendor/transactions');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function upgrade() {
    setBusy(true);
    try {
      const { checkoutUrl } = await api<{ checkoutUrl: string }>('/vendor/subscription/checkout', { method: 'POST' });
      window.location.href = checkoutUrl; // Stripe-hosted Checkout (test mode)
    } catch (e: any) { toast.error(e.message); setBusy(false); }
  }

  const d = ov.data;
  const premium = d?.subscriptionPlan === 'Premium';

  return (
    <div className="space-y-8">
      <PageHeader title="Subscription" description="Choose the plan that fits your business." />
      {ov.loading ? <TableSkeleton rows={3} /> : ov.error || !d ? <ErrorState message={ov.error || 'Could not load.'} onRetry={ov.refetch} /> : (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className={premium ? '' : 'border-primary/40 ring-1 ring-primary/20'}>
            <CardHeader><CardTitle>Free</CardTitle><CardDescription>Get started at no cost</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <p className="font-serif text-3xl font-semibold">$0<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <ul className="space-y-1.5 text-sm"><li className="flex gap-2"><Check className="size-4 text-emerald-600" />Up to {d.freeTierLimit} active services</li><li className="flex gap-2"><Check className="size-4 text-emerald-600" />Booking management</li></ul>
              {!premium && <p className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">Your current plan</p>}
            </CardContent>
          </Card>
          <Card className={premium ? 'border-amber-300 ring-1 ring-amber-200' : ''}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="size-5 text-amber-500" />Premium</CardTitle><CardDescription>Grow without limits</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <p className="font-serif text-3xl font-semibold">$29<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <ul className="space-y-1.5 text-sm">{FEATURES.map((f) => <li key={f} className="flex gap-2"><Check className="size-4 text-emerald-600" />{f}</li>)}</ul>
              {premium ? (
                <div className="space-y-2">
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{d.cancelAtPeriodEnd ? <>Cancelled — access until <b>{formatDate(d.subscriptionExpiresAt)}</b></> : <>Active — renews <b>{formatDate(d.subscriptionExpiresAt)}</b></>}</p>
                  {!d.cancelAtPeriodEnd && <Button variant="outline" size="sm" onClick={() => setConfirm(true)}>Cancel subscription</Button>}
                </div>
              ) : (
                <Button variant="gold" className="w-full" disabled={busy} onClick={upgrade}>{busy && <Loader2 className="animate-spin" />}Upgrade with Stripe</Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xl font-semibold">Payment history</h2>
        {tx.loading ? <TableSkeleton rows={3} /> : tx.error ? <ErrorState message={tx.error} onRetry={tx.refetch} /> : !tx.data?.items.length ? <EmptyState title="No payments yet" description="Your subscription payments will appear here." /> : (
          <Card className="py-0"><Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{tx.data.items.map((t) => (
              <TableRow key={t.id}><TableCell>{formatDate(t.createdAt)}</TableCell><TableCell>{t.plan}</TableCell><TableCell>{formatPrice(t.amount)}</TableCell><TableCell className="max-w-40 truncate font-mono text-xs text-muted-foreground">{t.stripeSessionId}</TableCell><TableCell><StatusBadge status={t.status} /></TableCell></TableRow>
            ))}</TableBody>
          </Table></Card>
        )}
      </div>

      <ConfirmDialog open={confirm} onOpenChange={setConfirm} destructive title="Cancel your Premium subscription?" confirmLabel="Yes, cancel"
        description="You keep Premium until the end of your current billing period. After that your account returns to the Free plan (3 active services)."
        onConfirm={async () => { try { await api('/vendor/subscription/cancel', { method: 'POST' }); toast.success('Subscription will end at the close of the billing period.'); ov.refetch(); } catch (e: any) { toast.error(e.message); } }} />
    </div>
  );
}
