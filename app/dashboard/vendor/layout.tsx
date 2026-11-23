import { RoleGuard } from '@/components/shared/role-guard';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="vendor">{children}</RoleGuard>;
}
