'use client';
import { SafeImg } from '@/components/shared/safe-img';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Crown, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { Service } from '@/lib/types';

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const premium = service.vendor?.subscriptionPlan === 'Premium';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/services/${service.id}`} className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <SafeImg src={service.images[0]} alt={service.serviceName} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur">{service.category}</Badge>
          {premium && <Badge variant="gold" className="absolute top-3 right-3"><Crown /> Premium</Badge>}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-serif text-lg font-semibold">{service.serviceName}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />{service.location}</span>
            <span className="font-serif text-lg font-semibold text-primary">{formatPrice(service.price)}</span>
          </div>
          {service.vendor && <p className="border-t pt-2 text-xs text-muted-foreground">by {service.vendor.businessName || service.vendor.name}</p>}
        </div>
      </Link>
    </motion.div>
  );
}
