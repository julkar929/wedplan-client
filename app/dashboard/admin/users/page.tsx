'use client';
import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState, ErrorState, PageHeader, StatusBadge, TableSkeleton } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { AppUser } from '@/lib/types';

export default function AdminUsersPage() {
  const { user: me } = useCurrentUser();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [target, setTarget] = useState<AppUser | null>(null);
  useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 350); return () => clearTimeout(t); }, [search]);

  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (role !== 'All') params.set('role', role);
  const { data, loading, error, refetch } = useApi<{ items: AppUser[] }>(`/admin/users?${params}`);

  return (
    <div>
      <PageHeader title="Manage users" description="Search accounts and block or unblock access." />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name, email or business…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" /></div>
        <Select value={role} onValueChange={setRole}><SelectTrigger aria-label="Role filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All roles</SelectItem><SelectItem value="customer">Customers</SelectItem><SelectItem value="vendor">Vendors</SelectItem><SelectItem value="admin">Admins</SelectItem></SelectContent></Select>
      </div>
      {loading ? <TableSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? <EmptyState title="No users found" description="Try a different search." /> : (
        <Card className="py-0"><Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Plan</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.items.map((u) => (
              <TableRow key={u.id}>
                <TableCell><div className="flex items-center gap-3"><Avatar className="size-9">{u.image && <AvatarImage src={u.image} alt="" />}<AvatarFallback>{u.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell>{u.role === 'vendor' ? <StatusBadge status={u.subscriptionPlan} /> : '—'}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                <TableCell><StatusBadge status={u.isBlocked ? 'Blocked' : 'Active'} /></TableCell>
                <TableCell className="text-right">{u.role === 'admin' || u.id === me?.id ? <span className="text-xs text-muted-foreground">Protected</span> : (
                  <Button size="sm" variant={u.isBlocked ? 'outline' : 'destructive'} onClick={() => setTarget(u)}>{u.isBlocked ? <><CheckCircle2 />Unblock</> : <><Ban />Block</>}</Button>)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      )}
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive={!target?.isBlocked} confirmLabel={target?.isBlocked ? 'Unblock user' : 'Block user'}
        title={target?.isBlocked ? 'Unblock this user?' : 'Block this user?'}
        description={target?.isBlocked ? `${target?.name} will be able to sign in again.` : `${target?.name} will be signed out immediately and cannot sign in. Their services are hidden from the public catalog.`}
        onConfirm={async () => { try { await api(`/admin/users/${target!.id}/block`, { method: 'PATCH', body: { isBlocked: !target!.isBlocked } }); toast.success(target!.isBlocked ? 'User unblocked.' : 'User blocked.'); refetch(); } catch (e: any) { toast.error(e.message); } }} />
    </div>
  );
}
