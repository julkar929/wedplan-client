import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page wandered off</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="mt-6 flex gap-3"><Button asChild><Link href="/">Back home</Link></Button><Button variant="outline" asChild><Link href="/services">Browse services</Link></Button></div>
    </div>
  );
}
