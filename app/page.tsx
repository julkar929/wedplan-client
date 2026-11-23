'use client';
import { SafeImg } from '@/components/shared/safe-img';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Camera, CheckCircle2, Flower2, Search, ShieldCheck, Shirt, Sparkles, Star, UtensilsCrossed, Wallet, Palette, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceCard } from '@/components/shared/service-card';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import type { Service } from '@/lib/types';

const CATS = [
  { name: 'Photography & Videography', icon: Camera, blurb: 'Capture every moment' },
  { name: 'Wedding Venues', icon: Building2, blurb: 'Halls, gardens & estates' },
  { name: 'Decoration & Florist', icon: Flower2, blurb: 'Stages, flowers & lighting' },
  { name: 'Catering Services', icon: UtensilsCrossed, blurb: 'Feasts your guests will love' },
  { name: 'Makeup & Styling', icon: Palette, blurb: 'Bridal looks, perfected' },
  { name: 'Wedding Fashion', icon: Shirt, blurb: 'Outfits for the big day' },
];

const fade = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.55 } } as const;

export default function HomePage() {
  const { data, loading, error, refetch } = useApi<{ items: Service[] }>('/services?limit=6', { auth: false });

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_75%_10%,oklch(0.93_0.06_70),transparent),radial-gradient(50%_60%_at_10%_90%,oklch(0.92_0.05_12),transparent)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-primary"><Sparkles className="size-3.5" /> The all-in-one wedding marketplace</span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl">Plan the wedding <span className="text-primary italic">you&apos;ve always imagined</span></h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">Discover verified photographers, venues, decorators and caterers. Compare, request quotes and book — without the endless phone calls.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/services">Browse services <ArrowRight /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/signup?role=vendor">I&apos;m a wedding vendor</Link></Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[['6', 'Categories'], ['100%', 'Admin-verified'], ['24/7', 'Online booking']].map(([n, l]) => (
                <div key={l}><dt className="font-serif text-2xl font-semibold text-primary">{n}</dt><dd className="text-xs text-muted-foreground">{l}</dd></div>
              ))}
            </dl>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative mx-auto w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              {['hero-ceremony', 'hero-flowers', 'hero-table', 'hero-rings'].map((s, i) => (
                <motion.div key={s} animate={{ y: [0, i % 2 ? 10 : -10, 0] }} transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
                  className={`overflow-hidden rounded-2xl shadow-xl ${i % 2 ? 'mt-8' : ''}`}>
                  <SafeImg src={`https://picsum.photos/seed/${s}/500/600`} alt="" className="aspect-[5/6] size-full object-cover" />
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-lg">
              <Star className="size-4 fill-amber-400 text-amber-400" /> Trusted by couples & vendors
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.div {...fade} className="mb-10 text-center"><h2 className="text-3xl font-semibold sm:text-4xl">Everything for your big day</h2><p className="mt-2 text-muted-foreground">Explore services by category</p></motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c, i) => (
            <motion.div key={c.name} {...fade} transition={{ duration: 0.5, delay: i * 0.06 }}>
              <Link href={`/services?category=${encodeURIComponent(c.name)}`} className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><c.icon className="size-6" /></span>
                <span><span className="block font-serif text-lg font-semibold">{c.name}</span><span className="text-sm text-muted-foreground">{c.blurb}</span></span>
                <ArrowRight className="ml-auto size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...fade} className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-3xl font-semibold sm:text-4xl">Featured services</h2><p className="mt-2 text-muted-foreground">Premium vendors appear first</p></div>
            <Button variant="outline" asChild><Link href="/services">View all <ArrowRight /></Link></Button>
          </motion.div>
          {loading ? <CardGridSkeleton /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data?.items.length ? (
            <EmptyState title="No services yet" description="Approved services will appear here." actionHref="/services" actionLabel="Browse services" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}</div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div {...fade} className="mb-12 text-center"><h2 className="text-3xl font-semibold sm:text-4xl">How WedPlan works</h2><p className="mt-2 text-muted-foreground">Three simple steps from idea to booked</p></motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, t: '1. Discover', d: 'Search and filter approved vendors by category, location and budget.' },
            { icon: CalendarCheck, t: '2. Request', d: 'Send a booking request with your date, venue and a message to the vendor.' },
            { icon: CheckCircle2, t: '3. Confirm', d: 'Vendors accept or decline. Track every request from your dashboard.' },
          ].map((s, i) => (
            <motion.div key={s.t} {...fade} transition={{ duration: 0.55, delay: i * 0.1 }}>
              <Card className="h-full items-center text-center"><CardContent className="space-y-3"><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><s.icon className="size-7" /></span><h3 className="font-serif text-xl font-semibold">{s.t}</h3><p className="text-sm text-muted-foreground">{s.d}</p></CardContent></Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-[oklch(0.24_0.03_20)] py-20 text-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.h2 {...fade} className="mb-12 text-center text-3xl font-semibold text-white sm:text-4xl">Why couples choose WedPlan</motion.h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, t: 'Admin-verified vendors', d: 'Every listing is reviewed before it goes live.' },
              { icon: Wallet, t: 'Transparent pricing', d: 'See starting prices up front, no surprises.' },
              { icon: CalendarCheck, t: 'Easy booking', d: 'One form, one dashboard, every request tracked.' },
              { icon: Star, t: 'Premium showcase', d: 'Top vendors are featured so you meet the best first.' },
            ].map((f, i) => (
              <motion.div key={f.t} {...fade} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <f.icon className="mb-3 size-7 text-amber-300" /><h3 className="font-serif text-lg font-semibold text-white">{f.t}</h3><p className="mt-1 text-sm text-stone-400">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div {...fade} className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.33_0.12_10)] px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Grow your wedding business</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">List up to 3 services free. Go Premium for unlimited listings and top placement.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="gold" asChild><Link href="/signup?role=vendor">Become a vendor</Link></Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild><Link href="/services">See live listings</Link></Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
