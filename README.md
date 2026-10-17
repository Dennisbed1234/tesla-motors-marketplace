# Tesla Motors — Premium Electric Vehicle Marketplace

 Premium marketplace for Tesla electric vehicles.  
**Owned by Tesla, Inc.**

**Repo:** https://github.com/Dennisbed1234/tesla-motors-marketplace

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL via Prisma
- JWT httpOnly sessions (jose + bcryptjs)
- Deploy: Vercel + Neon (or any Postgres)

## Features

- Homepage with hero, featured vehicles, how-it-works
- Vehicle catalog with search, filters, sort
- Vehicle detail pages (gallery, specs, reserve, favorites)
- Compare up to 3 models
- Customer register / login / logout
- Customer account: reservations, orders, favorites
- Server-side reservation with inventory lock (transaction)
- Admin dashboard (role-checked) + vehicle inventory list
- Admin bootstrap via env only (public register is CUSTOMER only)
- Full Prisma schema: users, vehicles, images, reservations, orders, payments, favorites, reviews, audit logs
- Sample seed labeled SAMPLE / CATALOG_ONLY
- SEO: metadata, sitemap.xml, robots.txt
- Legal placeholders: privacy, terms, refunds, delivery, FAQ, contact

## Quick start

```bash
git clone https://github.com/Dennisbed1234/tesla-motors-marketplace.git
cd tesla-motors-marketplace
npm install
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Environment

See `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| DATABASE_URL | Yes | Postgres / Neon pooler URL |
| JWT_SECRET | Yes | `openssl rand -base64 32` |
| ADMIN_BOOTSTRAP_EMAIL | Recommended | First admin |
| ADMIN_BOOTSTRAP_PASSWORD | Recommended | First admin password |
| NEXT_PUBLIC_SITE_URL | Prod | Canonical URL |
| RESEND_* | Optional | Email |
| STRIPE_* | Optional | Payments |

## First administrator

1. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`.
2. Start the app or run seed — admin is created **only if no ADMIN exists**.
3. Log in at `/login` → `/admin`.
4. `/register` never creates admin accounts.

## Database

```bash
npx prisma db push
npm run db:seed
npx prisma studio
```

## Reservation safety

`POST /api/reservations` in a transaction:
1. Load vehicle
2. Require AVAILABLE
3. Reject if active reservation exists
4. Create reservation + set RESERVED

## Deploy (Vercel)

1. Import GitHub repo
2. Add env vars
3. Build uses `prisma generate && next build`
4. Seed production DB once from local if needed

## Legal

Do not claim official Tesla affiliation. Replace SAMPLE inventory, policies, and images before taking real orders. Seed specs are approximate US figures for demo only.

## Structure

```
app/          routes + API
components/   UI
lib/          prisma, auth, utils
prisma/       schema + seed
```
