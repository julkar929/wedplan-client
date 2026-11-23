# WedPlan Client

Next.js (App Router) front-end for **WedPlan – Wedding Planning Platform**: customers discover and book wedding
services, vendors manage listings and a Premium subscription, admins moderate the platform.

- **Server repo:** <https://github.com/julkar929/wedplan-server>
- **Live site:** _add deployed URL_
- **Live API:** _add deployed URL_

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · ShadCN UI (Radix) · Motion · Sonner toasts ·
Better Auth client (`better-auth/react`, JWT plugin) · Stripe Checkout (hosted) · ImgBB (via the API)

## How the pieces fit

```
Browser ── same origin ──▶ Next.js (this app) ── rewrite /api/* ──▶ Express API ──▶ MongoDB
```

`next.config.ts` rewrites `/api/*` to the Express server, so Better Auth cookies are first-party (no CORS, no
third-party-cookie issues) and the API URL stays private.

**Auth flow:** Better Auth signs the user in (email/password or Google) and sets an HTTP-only session cookie. For REST
calls `lib/api.ts` asks Better Auth for a short-lived **JWT** (`authClient.token()`), keeps it **in memory only**, attaches
`Authorization: Bearer …`, refreshes it before expiry and retries once on a 401. If the API reports a blocked account the user
is signed out automatically.

**Route protection (three layers):**
1. `proxy.ts` (Next 16’s replacement for middleware): private routes (`/dashboard/*`, `/services/:id`, `/payment/*`) redirect
   to `/signin?redirect=…` when there is no session cookie. After login the user returns to the page they wanted
   (only same-site paths are honoured).
2. `RoleGuard` in the role layouts: a signed-in user opening another role’s dashboard is sent to their own.
3. The API: every request re-verifies the JWT and the role. The UI guards are convenience only.

## Pages
| Route | Access | Notes |
|---|---|---|
| `/` | public | Hero, categories, featured services (Premium first), how it works, why us, vendor CTA |
| `/services` | public | Debounced search, category, location, price range, sort, pagination – state lives in the URL |
| `/services/[id]` | signed-in | Gallery, vendor info, booking dialog (customers only) |
| `/signin`, `/signup` | public | Validation, password rules, Google, role choice (customer / vendor) |
| `/dashboard/customer`, `/bookings` | customer | Stats, cancel pending requests |
| `/dashboard/vendor`, `/services`, `/services/new`, `/services/[id]/edit`, `/bookings`, `/subscription` | vendor | CRUD with ImgBB uploads, availability switch, accept/reject, Stripe upgrade/cancel, payment history |
| `/dashboard/admin`, `/users`, `/services`, `/transactions` | admin | Stats, block/unblock, moderate services, read-only transactions |
| `/dashboard/profile` | any signed-in | Name, photo, phone, location, bio, business name |
| `/payment/success`, `/payment/cancel` | signed-in | Success page only *polls* – Premium is granted by the signed webhook |

Loading skeletons, empty states, error states with retry, toasts (no `alert()`), 404 and error pages, responsive layouts
(tested at 390 px) and image fall-backs are included.

## Setup
```bash
npm install
cp .env.example .env     # API_URL=http://localhost:5000
npm run dev              # http://localhost:3000   (start wedplan-server first)
```
| Variable | Meaning |
|---|---|
| `API_URL` | URL of the Express server (server-side only, used by the rewrite) |

The server’s `CLIENT_URL` and `BETTER_AUTH_URL` must equal this app’s public URL.

### Google sign-in
Create an OAuth client in Google Cloud Console with the **authorised redirect URI**
`{CLIENT_URL}/api/auth/callback/google` (e.g. `http://localhost:3000/api/auth/callback/google`) and put the id/secret in the
**server’s** `.env`. New Google users get the role chosen on the sign-up page (Customer by default; never Admin).

### Demo accounts (after `npm run seed` in the server)
| Role | Email | Password |
|---|---|---|
| Admin | `ADMIN_EMAIL` from the server `.env` | `ADMIN_PASSWORD` |
| Vendor (Free) | elena@ivorylens.co | Demo1234 |
| Vendor (Premium) | rahim@royalvenues.bd | Demo1234 |
| Customer | claire@example.com | Demo1234 |

## Testing
`e2e/ui_test.py` drives the real product in headless Firefox (31 checks): sign-up validation, vendor onboarding with image
upload, service creation, booking and duplicate handling, cancel, vendor/admin flows, blocking, route guards, responsive layout.
```bash
pip install selenium
WEDPLAN_URL=http://localhost:3000 python e2e/ui_test.py
```
Type-check: `npm run lint`. Production build: `npm run build`.

## Deployment
* **Client → Vercel.** Set `API_URL` to the deployed API.
* **Server → Render / Railway / Fly.io** (long-running Express). Set `CLIENT_URL` and `BETTER_AUTH_URL` to the Vercel URL.
* Stripe webhook endpoint points **directly at the server** (`{SERVER_URL}/api/webhooks/stripe`), not through Vercel.
* Add the production Google redirect URI `{CLIENT_URL}/api/auth/callback/google`.
