'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function DashboardIndex() {
  const { user, isPending } = useCurrentUser();
  const router = useRouter();
  useEffect(() => { if (!isPending && user) router.replace(`/dashboard/${user.role}`); }, [user, isPending, router]);
  return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Redirecting…</div>;
}
