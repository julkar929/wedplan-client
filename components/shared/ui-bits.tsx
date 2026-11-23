import Link from 'next/link';
import { AlertCircle, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, hint }: { label: string; value: React.ReactNode; icon?: React.ReactNode; hint?: string }) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          <p className="mt-1 font-serif text-3xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className="rounded-lg bg-secondary p-2 text-primary">{icon}</div>}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description, actionHref, actionLabel }: { title: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-secondary p-3 text-primary"><Inbox className="size-6" /></div>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionHref && actionLabel && <Button asChild className="mt-4"><Link href={actionHref}>{actionLabel}</Link></Button>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
      <AlertCircle className="size-6" />
      <p className="text-sm">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
}

const TONE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  Approved: 'success', Accepted: 'success', Succeeded: 'success', Premium: 'success', Active: 'success',
  Pending: 'warning', Rejected: 'danger', Failed: 'danger', Blocked: 'danger', Cancelled: 'secondary', Free: 'secondary',
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge variant={TONE[status] ?? 'secondary'} className={cn(className)}>{status}</Badge>;
}
