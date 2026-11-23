import { RoleGuard } from '@/components/shared/role-guard';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="customer">{children}</RoleGuard>;
}
