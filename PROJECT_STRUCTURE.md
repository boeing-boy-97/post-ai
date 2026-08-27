# PostWave AI — Project Structure

```
post-ai/
├── backend/                     # Node.js + Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma        # SQLite (dev) / PostgreSQL (prod) models
│   │   └── seed.ts              # Demo user + connected Instagram account
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts         # Env-based config (JWT, AI, OAuth, Cloudinary)
│   │   │   └── database.ts      # Prisma client singleton
│   │   ├── dto/index.ts         # Type-safe, token-free response DTOs
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT bearer auth
│   │   │   ├── errorHandler.ts  # Sanitized Zod + operational errors
│   │   │   ├── rateLimiter.ts   # Per-IP + auth rate limits
│   │   │   └── validateRequest.ts
│   │   ├── routes/
│   │   │   ├── auth/            # signup/signin/me + Instagram & LinkedIn OAuth
│   │   │   ├── accounts/
│   │   │   ├── posts/
│   │   │   ├── templates/
│   │   │   ├── analytics/
│   │   │   ├── ai/
│   │   │   ├── upload/
│   │   │   ├── brand/
│   │   │   └── campaigns/
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   ├── cloudinary.service.ts
│   │   │   ├── instagram.service.ts
│   │   │   ├── linkedin.service.ts
│   │   │   ├── queue.service.ts
│   │   │   └── platformAdapters/   # Instagram, LinkedIn, X, YouTube, FB,
│   │   │                            # Threads, Pinterest, TikTok, Telegram
│   │   ├── types/index.ts
│   │   ├── utils/               # AES-256-GCM encryption, logger, error mapping
│   │   ├── workers/postPublisher.worker.ts
│   │   ├── app.ts               # Express app, security middleware, SPA fallback
│   │   └── index.ts             # Server listener (+ background queue)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                    # React 18 + TypeScript + Tailwind (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Modal, Toast, Badge, Skeleton…
│   │   │   ├── layout/          # Sidebar, Header, PageHeader
│   │   │   ├── posts/           # PostComposer, PostCard, PostList, PostCalendar…
│   │   │   ├── accounts/        # AccountsView
│   │   │   ├── analytics/       # AnalyticsDashboard
│   │   │   ├── ai/              # AIComposer
│   │   │   ├── campaigns/       # CampaignStudioView
│   │   │   ├── brand/           # BrandMemoryView
│   │   │   └── templates/       # TemplatesView
│   │   ├── lib/                 # api.ts, AuthContext.tsx
│   │   ├── pages/               # AuthPage, DashboardPage
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── vercel.json              # Root Directory = frontend deployment config
│
├── docs/REAL_WORLD_SETUP_GUIDE.md
├── vercel.json                  # Root Directory = repo root deployment config
├── VERCEL_DEPLOYMENT_GUIDE.md
├── QUICKSTART.md
├── README.md
├── Dockerfile
├── render.yaml
├── .npmrc
├── .env.example
└── LICENSE
```

## Key points

1. **Database**: Prisma ORM with SQLite for local dev and PostgreSQL for
   production. The datasource reads `DATABASE_URL` from the environment; switch
   `provider` to `postgresql` for managed Postgres (Supabase / Neon / RDS).
2. **Security**: AES-256-GCM encrypts OAuth tokens at rest; bcrypt (12 rounds)
   hashes passwords; JWT sessions; Helmet + rate limiting.
3. **Deployment**: Frontend → Vercel, backend + worker → Render/Railway,
   database → managed PostgreSQL. See `VERCEL_DEPLOYMENT_GUIDE.md`.
