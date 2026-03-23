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
