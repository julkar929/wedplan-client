'use client';
import { useParams } from 'next/navigation';
import { EmptyState, PageHeader, TableSkeleton } from '@/components/shared/ui-bits';
import { ServiceForm } from '@/components/shared/service-form';
import { useApi } from '@/hooks/use-api';
import type { Service } from '@/lib/types';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useApi<{ service: Service }>(`/services/${id}`);
  return (
    <div>
      <PageHeader title="Edit service" description="Editing an approved service sends it back for admin review." />
      {loading ? <TableSkeleton rows={4} /> : error || !data ? <EmptyState title="Service not found" description={error ?? undefined} actionHref="/dashboard/vendor/services" actionLabel="Back to my services" /> : <ServiceForm service={data.service} />}
    </div>
  );
}
