'use client';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
