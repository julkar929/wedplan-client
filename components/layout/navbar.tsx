'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Crown, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { signOut } from '@/lib/auth-client';
import { clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Browse Services' },
];

export function Navbar() {
  const { user, isPending } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    clearToken();
    await signOut();
    toast.success('You have been signed out.');
    router.push('/');
    router.refresh();
  }

  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const premium = user?.role === 'vendor' && user.subscriptionPlan === 'Premium' && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary', isActive(l.href) && 'bg-secondary text-primary')}>{l.label}</Link>
          ))}
          {user && <Link href="/dashboard" className={cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary', pathname.startsWith('/dashboard') && 'bg-secondary text-primary')}>Dashboard</Link>}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isPending ? <Skeleton className="size-9 rounded-full" /> : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" aria-label="Account menu">
                <Avatar className="size-9 ring-2 ring-primary/20">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-1.5 truncate">{user.name}{premium && <Crown className="size-3.5 text-amber-500" />}</div>
                  <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                  <div className="mt-1 text-[11px] font-semibold tracking-wide text-primary uppercase">{user.role}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push(`/dashboard/${user.role}`)}><LayoutDashboard />Dashboard</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}><Settings />Profile Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-destructive"><LogOut className="!text-destructive" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild><Link href="/signin">Sign in</Link></Button>
              <Button asChild><Link href="/signup">Get started</Link></Button>
            </>
          )}
        </div>

        <button className="rounded-md p-2 hover:bg-secondary md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">{l.label}</Link>)}
            {user ? (
              <>
                <Link href={`/dashboard/${user.role}`} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">Dashboard</Link>
                <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">Profile Settings</Link>
                <button onClick={() => { setOpen(false); logout(); }} className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-secondary">Log out</button>
              </>
            ) : (
              <div className="mt-2 flex gap-2"><Button variant="outline" asChild className="flex-1"><Link href="/signin" onClick={() => setOpen(false)}>Sign in</Link></Button><Button asChild className="flex-1"><Link href="/signup" onClick={() => setOpen(false)}>Get started</Link></Button></div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
