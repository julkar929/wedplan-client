'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceCard } from '@/components/shared/service-card';
import { CardGridSkeleton, EmptyState, ErrorState } from '@/components/shared/ui-bits';
import { useApi } from '@/hooks/use-api';
import { CATEGORIES, type Service } from '@/lib/types';

interface Result { items: Service[]; total: number; page: number; pages: number }

export function BrowseClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = sp.get('q') ?? '';
  const category = sp.get('category') ?? 'All';
  const location = sp.get('location') ?? '';
  const minPrice = sp.get('minPrice') ?? '';
  const maxPrice = sp.get('maxPrice') ?? '';
  const sort = sp.get('sort') ?? 'recommended';
  const page = Number(sp.get('page') ?? '1') || 1;

  // Debounced text inputs: the URL is the single source of truth
  const [search, setSearch] = useState(q);
  const [loc, setLoc] = useState(location);
  useEffect(() => setSearch(q), [q]);
  useEffect(() => setLoc(location), [location]);

  function update(next: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '' || v === 'All' || v === 'recommended') params.delete(k); else params.set(k, v);
    }
    if (resetPage) params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (search === q && loc === location) return;
    const t = setTimeout(() => update({ q: search.trim(), location: loc.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, loc]);

  const qs = new URLSearchParams();
  if (q) qs.set('search', q);
  if (category !== 'All') qs.set('category', category);
  if (location) qs.set('location', location);
  if (minPrice) qs.set('minPrice', minPrice);
  if (maxPrice) qs.set('maxPrice', maxPrice);
  if (sort !== 'recommended') qs.set('sort', sort);
  qs.set('page', String(page));
  qs.set('limit', '9');

  const { data, loading, error, refetch } = useApi<Result>(`/services?${qs}`, { auth: false });
  const hasFilters = !!(q || location || minPrice || maxPrice || category !== 'All' || sort !== 'recommended');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">Browse wedding services</h1>
        <p className="mt-1 text-muted-foreground">Search verified vendors by name, category, location and budget.</p>
      </div>

      <div className="mb-8 rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search services" placeholder="Search photographers, venues, florists…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Select value={category} onValueChange={(v) => update({ category: v })}>
              <SelectTrigger aria-label="Category"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent><SelectItem value="All">All categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Input aria-label="Location" placeholder="Location (e.g. Dhaka)" value={loc} onChange={(e) => setLoc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-5">
            <Input aria-label="Minimum price" type="number" min={0} placeholder="Min price ($)" defaultValue={minPrice} key={'min' + minPrice} onBlur={(e) => e.target.value !== minPrice && update({ minPrice: e.target.value })} />
            <Input aria-label="Maximum price" type="number" min={0} placeholder="Max price ($)" defaultValue={maxPrice} key={'max' + maxPrice} onBlur={(e) => e.target.value !== maxPrice && update({ maxPrice: e.target.value })} />
          </div>
          <div className="md:col-span-4">
            <Select value={sort} onValueChange={(v) => update({ sort: v })}>
              <SelectTrigger aria-label="Sort"><SlidersHorizontal className="size-4" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended (Premium first)</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
                <SelectItem value="newest">Newest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button variant="outline" className="w-full" disabled={!hasFilters} onClick={() => router.replace(pathname)}><X /> Clear filters</Button>
          </div>
        </div>
      </div>

      {loading ? <CardGridSkeleton count={9} /> : error ? <ErrorState message={error} onRetry={refetch} /> : !data || data.items.length === 0 ? (
        <EmptyState title="No services match your search" description="Try removing a filter or searching for something broader." actionHref="/services" actionLabel="Reset search" />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{data.total} service{data.total === 1 ? '' : 's'} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}</div>
          {data.pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, false)}><ChevronLeft /> Previous</Button>
              <span className="text-sm text-muted-foreground">Page {data.page} of {data.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) }, false)}>Next <ChevronRight /></Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
