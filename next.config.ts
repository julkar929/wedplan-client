import type { NextConfig } from 'next';

/**
 * The browser only ever talks to the Next.js origin. `/api/*` is proxied to the Express server, so
 * Better Auth cookies are first-party (no CORS, no third-party-cookie problems) and the API URL stays private.
 */
const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
