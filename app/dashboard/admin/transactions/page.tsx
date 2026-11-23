'use client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

export default function AdminTransactionsPage() {
  const { data, loading, error, refetch } = useApi<{ items: Transaction[] }>('/admin/transactions');
  return (
    <div>
      <PageHeader title="Transactions" description="Read-only record of all subscription payments. Status can only change through verified Stripe events." />
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? <EmptyState title="No transactions yet" description="Premium subscription payments will appear here." /> : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Vendor</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Stripe reference</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.createdAt)}</TableCell>
                <TableCell><p className="font-medium">{t.vendor?.businessName || t.vendor?.name}</p><p className="text-xs text-muted-foreground">{t.vendor?.email}</p></TableCell>
                <TableCell>{t.plan}</TableCell>
                <TableCell className="font-medium">{formatPrice(t.amount)}</TableCell>
                <TableCell className="max-w-44 truncate font-mono text-xs text-muted-foreground" title={t.stripeSessionId}>{t.stripeSessionId}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
    </div>
  );
}
