import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-4 py-16">
      <Card className="w-full text-center"><CardContent className="space-y-4 py-6">
        <XCircle className="mx-auto size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="text-sm text-muted-foreground">No charge was made. You can upgrade whenever you&apos;re ready.</p>
        <Button asChild><Link href="/dashboard/vendor/subscription">Back to subscription</Link></Button>
      </CardContent></Card>
    </div>
  );
}
