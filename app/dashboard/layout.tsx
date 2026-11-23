'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CalendarCheck, CreditCard, LayoutDashboard, Loader2, Package, PlusCircle, Receipt, Search, Settings, ShieldCheck, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

const NAV: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  vendor: [
    { href: '/dashboard/vendor', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/vendor/services', label: 'My Services', icon: Package },
    { href: '/dashboard/vendor/services/new', label: 'Add Service', icon: PlusCircle },
    { href: '/dashboard/vendor/bookings', label: 'Booking Requests', icon: CalendarCheck },
    { href: '/dashboard/vendor/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: Settings },
  ],
  customer: [
    { href: '/dashboard/customer', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/customer/bookings', label: 'My Bookings', icon: CalendarCheck },
    { href: '/services', label: 'Browse Services', icon: Search },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: Settings },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: ShieldCheck },
    { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
    { href: '/dashboard/admin/services', label: 'Manage Services', icon: Package },
    { href: '/dashboard/admin/transactions', label: 'Transactions', icon: Receipt },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: Settings },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !user) router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
  }, [isPending, user, router, pathname]);

  if (isPending || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" />Loading your dashboard…</div>;
  }

  const items = NAV[user.role];
  const exact = (href: string) => items.some((i) => i.href !== href && i.href.startsWith(href + '/'));
  const active = (href: string) => (exact(href) ? pathname === href : pathname === href || pathname.startsWith(href + '/'));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:py-8">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="mb-3 hidden rounded-xl border bg-card p-4 lg:block">
          <p className="truncate font-serif text-lg font-semibold">{user.name}</p>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">{user.role}</p>
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-2 lg:flex-col lg:overflow-visible">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-secondary', active(i.href) && 'bg-primary text-primary-foreground hover:bg-primary')}>
              <i.icon className="size-4" />{i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
