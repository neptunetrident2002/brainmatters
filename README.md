# BrainMatters

**Train Your Brain. Earn Your AI.**

A personal brain-training web app built to fight cognitive over-reliance on AI tools.

## Stack

- **Frontend + API**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Caching**: Vercel Edge Cache (built-in via response headers)
- **Rate Limiting**: Upstash Redis
- **Hosting**: Vercel (free tier)

**Total cost to launch: ₹0**

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd sharpstack
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the SQL editor and run `supabase/migrations/001_initial_schema.sql`
3. Enable Google Auth: Authentication → Providers → Google
4. Copy your project URL and anon key

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and service role key
```

Upstash is optional for local dev — rate limiting is skipped if env vars are missing.

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Push to GitHub, then connect repo on vercel.com
# Add env vars in Vercel dashboard
# Deploy automatically on every push to main
```

---

## Keep-alive cron (important for Supabase free tier)

Supabase free projects pause after 1 week of inactivity.

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create a cron job to GET `https://your-app.vercel.app/api/health` every 5 days
3. This prevents your Supabase project from pausing

---

## Project Structure

```
sharpstack/
├── app/
│   ├── (auth)/         # Login + signup (no sidebar)
│   ├── (app)/          # Authenticated pages with layout
│   │   ├── feed/
│   │   ├── challenges/
│   │   ├── daily/
│   │   ├── games/
│   │   ├── progress/
│   │   └── settings/
│   └── api/            # API routes
│       ├── auth/callback/
│       ├── challenges/
│       │   └── [id]/complete/
│       ├── credits/
│       ├── daily/
│       ├── feed/
│       └── health/     # Keep-alive endpoint
├── components/
│   ├── layout/         # Header, Sidebar
│   ├── challenges/     # ChallengesList, DailyTaskView
│   ├── feed/           # FeedList, FeedItem
│   ├── games/          # DotsAndBoxes, TicTacToe
│   └── ui/             # Shared atoms (Badge, Button, etc.)
├── lib/
│   ├── supabase/       # client.ts, server.ts
│   ├── hooks/          # useUser, useCredits
│   └── utils/          # cn, ratelimit, events
├── types/
│   └── index.ts        # All shared TypeScript types
├── supabase/
│   └── migrations/     # SQL schema files
└── middleware.ts        # Auth guard + session refresh
```

---

## PRD Non-Negotiables (enforced in code)

- ✅ Events table exists from week 1 (`lib/utils/events.ts`)
- ✅ `organisation_id` on users table (Teams tier hook)
- ✅ Cache-Control headers on public API routes (`next.config.js`)
- ✅ Rate limiting on all write endpoints (`lib/utils/ratelimit.ts`)
- ✅ RLS enabled on every Supabase table (`migrations/001_initial_schema.sql`)
- ✅ 2-minute minimum before challenge completion (API enforced, not just UI)
- ✅ AI Credit spending requires 2-tap confirmation (enforced in components)

---

## Payments Setup (India)

**INR (Indian users):**
1. Sign up at [razorpay.com](https://razorpay.com)
2. Requires: PAN card + active bank account
3. Setup time: ~1 weekend

**International:**
1. Sign up at [gumroad.com](https://gumroad.com)
2. Supports PPP pricing automatically
3. Connect your Wise account for USD-to-INR conversion



```
sharpstack
├─ .eslintrc.json
├─ app
│  ├─ (app)
│  │  ├─ challenges
│  │  │  └─ page.tsx
│  │  ├─ daily
│  │  │  └─ page.tsx
│  │  ├─ feed
│  │  │  └─ page.tsx
│  │  ├─ games
│  │  │  └─ page.tsx
│  │  ├─ journal
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ progress
│  │  │  └─ page.tsx
│  │  ├─ report
│  │  │  └─ page.tsx
│  │  └─ settings
│  │     └─ page.tsx
│  ├─ (auth)
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ signup
│  │     └─ page.tsx
│  ├─ api
│  │  ├─ auth
│  │  │  └─ callback
│  │  │     └─ route.ts
│  │  ├─ challenges
│  │  │  ├─ route.ts
│  │  │  └─ [id]
│  │  │     └─ complete
│  │  │        └─ route.ts
│  │  ├─ credits
│  │  ├─ daily
│  │  │  └─ route.ts
│  │  ├─ events
│  │  ├─ feed
│  │  │  └─ route.ts
│  │  └─ health
│  │     └─ route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ onboarding
│  │  └─ page.tsx
│  └─ page.tsx
├─ components
│  ├─ challenges
│  ├─ CreditModals.tsx
│  ├─ feed
│  ├─ games
│  └─ ui
├─ lib
│  ├─ hooks
│  │  ├─ useCredits.ts
│  │  └─ useUser.ts
│  ├─ supabase
│  │  ├─ client.ts
│  │  └─ server.ts
│  └─ utils
│     ├─ cn.ts
│     ├─ credits.ts
│     ├─ events.ts
│     ├─ llm.ts
│     ├─ ratelimit.ts
│     └─ taskgen.ts
├─ middleware.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ public
├─ README.md
├─ supabase
│  └─ migrations
│     └─ 001_initial_schema.sql
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   └─ index.ts

```