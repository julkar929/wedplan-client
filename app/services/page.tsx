import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BrowseClient } from './browse-client';
import { CardGridSkeleton } from '@/components/shared/ui-bits';

export const metadata: Metadata = { title: 'Browse Services' };

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><CardGridSkeleton /></div>}>
      <BrowseClient />
    </Suspense>
  );
}
