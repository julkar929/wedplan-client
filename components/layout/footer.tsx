import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { CATEGORIES } from '@/lib/types';
import { Logo } from './logo';

const Social = ({ href, label, d }: { href: string; label: string; d: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-primary">
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d={d} /></svg>
  </a>
);

export function Footer() {
  return (
    <footer className="mt-24 bg-[oklch(0.24_0.03_20)] text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed text-stone-400">Find, compare and book trusted wedding professionals — from photographers to venues — all in one elegant place.</p>
          <div className="flex gap-2">
            <Social href="https://facebook.com" label="Facebook" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
            <Social href="https://instagram.com" label="Instagram" d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.75A3.05 3.05 0 1 1 12 8.95a3.05 3.05 0 0 1 0 6.1ZM17.1 6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 2.5c-2.58 0-2.9.01-3.92.06-1.01.05-1.7.2-2.3.44-.63.24-1.16.57-1.69 1.1-.53.53-.86 1.06-1.1 1.69-.24.6-.4 1.29-.44 2.3C2.5 9.1 2.5 9.42 2.5 12s.01 2.9.06 3.92c.05 1.01.2 1.7.44 2.3.24.63.57 1.16 1.1 1.69.53.53 1.06.86 1.69 1.1.6.24 1.29.4 2.3.44 1.02.05 1.34.06 3.92.06s2.9-.01 3.92-.06c1.01-.05 1.7-.2 2.3-.44a4.7 4.7 0 0 0 1.69-1.1c.53-.53.86-1.06 1.1-1.69.24-.6.4-1.29.44-2.3.05-1.02.06-1.34.06-3.92s-.01-2.9-.06-3.92c-.05-1.01-.2-1.7-.44-2.3a4.7 4.7 0 0 0-1.1-1.69 4.7 4.7 0 0 0-1.69-1.1c-.6-.24-1.29-.4-2.3-.44C14.9 2.51 14.58 2.5 12 2.5Z" />
            <Social href="https://x.com" label="X (Twitter)" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-base font-semibold text-white">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/services">Browse all services</Link></li>
            {CATEGORIES.slice(0, 4).map((c) => <li key={c}><Link className="hover:text-white" href={`/services?category=${encodeURIComponent(c)}`}>{c}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-base font-semibold text-white">For you</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/signup">Create an account</Link></li>
            <li><Link className="hover:text-white" href="/signup?role=vendor">Become a vendor</Link></li>
            <li><Link className="hover:text-white" href="/signin">Sign in</Link></li>
            <li><Link className="hover:text-white" href="/dashboard">Your dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-base font-semibold text-white">Contact</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" /><a href="mailto:hello@wedplan.example" className="hover:text-white">hello@wedplan.example</a></li>
            <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0" /><a href="tel:+8801700000000" className="hover:text-white">+880 1700 000000</a></li>
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />House 12, Road 5, Dhanmondi, Dhaka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">© {new Date().getFullYear()} WedPlan. All rights reserved.</div>
    </footer>
  );
}
