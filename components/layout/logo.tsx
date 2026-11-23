import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Heart className="size-4 fill-current" /></span>
      <span className={`font-serif text-xl font-semibold tracking-tight ${light ? 'text-white' : ''}`}>Wed<span className="text-primary">Plan</span></span>
    </Link>
  );
}
