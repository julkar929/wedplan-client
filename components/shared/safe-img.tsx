'use client';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/** <img> that degrades to a neutral placeholder if the remote image is missing or blocked. */
export function SafeImg({ src, alt = '', className, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt || 'Image unavailable'} className={cn('grid place-items-center bg-muted text-muted-foreground', className)}>
        <ImageOff className="size-1/4 max-h-8 max-w-8 opacity-50" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...rest} />;
}
