'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Role } from '@/lib/types';

/**
 * Client-side role guard (UX only). Real authorisation is enforced by the API on every request (JWT + role checks).
 * Wrong role -> redirected to that user's own dashboard. Signed-out -> sign-in with a redirect back.
 */
export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, isPending } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;
    if (!user) router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(`/dashboard/${user.role}`);
  }, [user, isPending, role, router, pathname]);

  if (isPending || !user || user.role !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Checking access…
      </div>
    );
  }
  return <>{children}</>;
}
