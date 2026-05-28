<p align="center">
  <img src="logo/logo.png" alt="Protest Signs Logo" width="600">
</p>

<h1 align="center">protestsigns.com</h1>

<p align="center">
  E-commerce site for selling protest signs.<br>
  Built with Next.js, Supabase, and Stripe — deployed on Vercel.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-Latest-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-Payments-purple" alt="Stripe">
  <img src="https://img.shields.io/badge/Deployed-Vercel-black" alt="Vercel">
</p>

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS |
| **Auth** | Supabase Auth (email/password + Google + Yahoo OAuth) |
| **Database** | Supabase PostgreSQL with Row-Level Security |
| **File Storage** | Supabase Storage (`sign-images` bucket) |
| **Payments** | Stripe Checkout + Webhooks |
| **Email** | Resend (contact form notifications) |
| **Deployment** | Vercel (serverless) |

---

## Local Development

```bash
npm install
npm run dev        # starts on http://localhost:3000 with Turbopack
npm run build      # production build
npm run lint       # ESLint
```

Or with make:

```bash
make dev
make build
```

### Environment Variables

Copy `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Resend (contact form emails)
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=your@email.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, these are set in the Vercel dashboard.

---

## Deployment (Vercel)

The repo deploys automatically to Vercel on push to `main`.

After deploying to a new domain:
1. Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
2. Update the Stripe webhook endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Update OAuth redirect URIs in Google/Supabase if using Google login
4. Redeploy

For local Stripe webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Database

Schema and seed data are in `supabase/`:

```
supabase/
├── schema.sql          # Full schema — run this to set up a fresh database
├── seed.sql            # Sample data
└── migrations/         # Incremental migrations run after initial schema
    ├── 001_add-featured-signs.sql
    ├── 002_add-owner-column.sql
    ├── 003_add-pricing-tiers.sql
    └── 004_fix-all-rls-policies.sql
```

To set up a fresh Supabase project:
1. Run `supabase/schema.sql` in the SQL Editor
2. Optionally run `supabase/seed.sql` for sample data
3. Create a `sign-images` storage bucket (public)

To make a user admin:
- Supabase Dashboard → Table Editor → `profiles` → set `is_admin = true`

---

## Project Structure

```
protest-signs/
├── app/
│   ├── about/
│   ├── admin/              # Admin dashboard (requires is_admin)
│   │   ├── signs/
│   │   ├── tags/
│   │   └── orders/
│   ├── api/
│   │   ├── contact/        # Contact form handler (Resend)
│   │   └── stripe/
│   │       ├── checkout/   # Create Stripe session
│   │       └── webhook/    # Handle payment completion
│   ├── auth/               # Login, signup, forgot/reset password, OAuth callback
│   ├── browse/             # Browse signs with filters
│   ├── cart/
│   ├── checkout/           # Success page
│   ├── contact/
│   ├── sign/[id]/          # Sign detail page
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── navbar.tsx
│   ├── sign-card.tsx
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client & server helpers
│   ├── guest-cart.ts
│   ├── pricing.ts
│   ├── resend.ts
│   ├── stripe.ts
│   └── utils.ts
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
├── public/
│   ├── logo.png
│   ├── logo-tab.png
│   └── favicon.ico
├── vercel.json
└── .env.local
```

---

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Homepage — tag-based sign groups |
| `/browse` | Browse all signs with tag filters, search, sort |
| `/browse?tag=slug` | Pre-filtered by tag |
| `/sign/[id]` | Sign detail page |
| `/cart` | Shopping cart |
| `/contact` | Contact form |
| `/about` | About page |
| `/checkout/success` | Order confirmation |

### Auth
| Route | Description |
|-------|-------------|
| `/auth/login` | Login |
| `/auth/signup` | Sign up |
| `/auth/forgot-password` | Request password reset |
| `/auth/update-password` | Set new password |
| `/auth/callback` | OAuth callback |

### Admin (requires `is_admin = true`)
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/signs` | Manage signs |
| `/admin/signs/new` | Create sign |
| `/admin/signs/[id]/edit` | Edit sign |
| `/admin/tags` | Manage tags |
| `/admin/tags/new` | Create tag |
| `/admin/orders` | View orders |

### API
| Route | Description |
|-------|-------------|
| `POST /api/stripe/checkout` | Create Stripe checkout session |
| `POST /api/stripe/webhook` | Stripe webhook handler |
| `POST /api/contact` | Submit contact form |

---

## Database Schema

**`profiles`** — `id`, `email`, `full_name`, `is_admin`, `created_at`

**`tags`** — `id`, `name`, `slug`, `show_on_homepage`, `homepage_order`, `created_at`

**`signs`** — `id`, `title`, `description`, `price` (cents), `quantity_available`, `images` (text[]), `sizes`, `archived_at`, `created_at`, `updated_at`

**`sign_tags`** — `sign_id`, `tag_id`, `display_order`

**`cart_items`** — `id`, `user_id`, `sign_id`, `quantity`, `created_at`

**`orders`** — `id`, `user_id`, `stripe_session_id`, `status`, `total` (cents), `created_at`

**`order_items`** — `id`, `order_id`, `sign_id`, `quantity`, `price_at_purchase` (cents)

**`contact_submissions`** — `id`, `name`, `email`, `message`, `created_at`

---

## Security

- Row-Level Security on all Supabase tables
- Stripe webhook signature verification
- Server-side API routes keep secret keys off the client
- Input validation with Zod on API endpoints
