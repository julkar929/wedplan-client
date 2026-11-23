export type Role = 'customer' | 'vendor' | 'admin';
export type ServiceStatus = 'Pending' | 'Approved' | 'Rejected';
export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';

export const CATEGORIES = [
  'Photography & Videography',
  'Wedding Venues',
  'Decoration & Florist',
  'Catering Services',
  'Makeup & Styling',
  'Wedding Fashion',
] as const;

export interface VendorBrief {
  id: string; name: string; businessName: string | null; image: string | null;
  location: string | null; phone: string | null; bio: string | null; subscriptionPlan: 'Free' | 'Premium';
}
export interface Service {
  id: string; vendorId: string; serviceName: string; category: string; description: string; price: number;
  location: string; images: string[]; status: ServiceStatus; isAvailable: boolean; createdAt: string; vendor: VendorBrief | null;
}
export interface UserBrief { id: string; name: string; email: string; image: string | null; businessName: string | null; phone: string | null }
export interface Booking {
  id: string; serviceId: string; vendorId: string; customerId: string; eventDate: string; eventLocation: string;
  message: string; status: BookingStatus; createdAt: string;
  service: { id: string; serviceName: string; category: string; image: string | null; price: number } | null;
  vendor: UserBrief | null; customer: UserBrief | null;
}
export interface Transaction {
  id: string; vendorId: string; plan: string; amount: number; currency: string; stripeSessionId: string;
  stripeSubscriptionId: string | null; status: 'Pending' | 'Succeeded' | 'Failed'; createdAt: string;
  vendor: { id: string; name: string; email: string; businessName: string | null } | null;
}
export interface AppUser {
  id: string; name: string; email: string; image: string | null; role: Role; isBlocked: boolean;
  businessName: string | null; phone: string | null; bio: string | null; location: string | null;
  subscriptionPlan: 'Free' | 'Premium'; subscriptionExpiresAt: string | null; cancelAtPeriodEnd: boolean; createdAt: string | null;
}
