import { Suspense } from 'react';
import { SuccessClient } from './success-client';

export default function PaymentSuccessPage() {
  return <Suspense><SuccessClient /></Suspense>;
}
