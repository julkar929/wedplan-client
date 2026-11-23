'use client';
import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, jwtClient } from 'better-auth/client/plugins';

/**
 * No baseURL: Better Auth uses the current origin + /api/auth, which Next.js proxies to the Express server.
 * `inferAdditionalFields` mirrors the extra user fields declared on the server (role, subscription, …).
 */
export const authClient = createAuthClient({
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
        isBlocked: { type: 'boolean' },
        businessName: { type: 'string' },
        phone: { type: 'string' },
        bio: { type: 'string' },
        location: { type: 'string' },
        subscriptionPlan: { type: 'string' },
        subscriptionExpiresAt: { type: 'date' },
        cancelAtPeriodEnd: { type: 'boolean' },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
