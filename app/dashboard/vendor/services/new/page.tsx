import { PageHeader } from '@/components/shared/ui-bits';
import { ServiceForm } from '@/components/shared/service-form';

export default function NewServicePage() {
  return (<div><PageHeader title="Add a service" description="New listings are reviewed by an admin before they go live." /><ServiceForm /></div>);
}
