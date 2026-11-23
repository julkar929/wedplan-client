'use client';
import { useSession } from '@/lib/auth-client';
import type { AppUser } from '@/lib/types';

/** Typed view over the Better Auth session user (extra fields are declared in lib/auth-client.ts). */
export function useCurrentUser() {
  const { data, isPending, refetch } = useSession();
  const u = data?.user as (Record<string, unknown> & { id: string; name: string; email: string; image?: string | null }) | undefined;
  const user = u
    ? ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        role: (u.role as AppUser['role']) ?? 'customer',
        isBlocked: !!u.isBlocked,
        businessName: (u.businessName as string) ?? null,
        phone: (u.phone as string) ?? null,
        bio: (u.bio as string) ?? null,
        location: (u.location as string) ?? null,
        subscriptionPlan: (u.subscriptionPlan as AppUser['subscriptionPlan']) ?? 'Free',
        subscriptionExpiresAt: u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt as string).toISOString() : null,
        cancelAtPeriodEnd: !!u.cancelAtPeriodEnd,
        createdAt: null,
      } satisfies AppUser)
    : null;
  return { user, isPending, refetch };
}
