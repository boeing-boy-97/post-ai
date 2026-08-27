# 🚀 PostWave AI — Vercel & Production Deployment Guide

This guide explains the **root cause** of the two errors you saw on Vercel and the
**exact fix** already applied to this repository:

> ```
> Error: No Output Directory named "dist" found after the Build completed.
> Configure the Output Directory in your Project Settings. Alternatively, configure vercel.json#outputDirectory.
> ```
>
> ```
> npm warn allow-scripts   esbuild@0.21.5 (postinstall: node install.js)
> ```

---

## 🔍 Root cause #1 — "No Output Directory named 'dist' found"

The old root `vercel.json` used a **fragile build command**:

```json
"buildCommand": "cd frontend && npm run build && cd .. && cp -r frontend/dist ./dist",
"outputDirectory": "dist"
```

It copied `frontend/dist` to a root `./dist` and told Vercel to look for `dist`.
That works locally, but on Vercel the project **Root Directory** is often
auto-detected as `frontend`, so Vercel was looking for `dist` **inside a
different directory than the one the build actually produced** — resulting in
`STATIC_BUILD_NO_OUT_DIR`.

**The fix (already applied):** point Vercel **directly at the real build output**
and remove the manual `cp` step entirely. Both `vercel.json` files below simply
run `npm run build` and set `outputDirectory` to the folder Vite actually emits.

---

## 🔍 Root cause #2 — "npm warn allow-scripts esbuild@0.21.5"

npm v11.16+ and npm v12 **block dependency install scripts** (`preinstall` /
`install` / `postinstall`) unless they are explicitly approved. `esbuild` ships a
`postinstall` script (`node install.js`) that downloads the platform-native
binary. When npm skipped it, the binary was missing and `vite build` could fail.

**The fix (already applied):** each app's `package.json` now declares an
`allowScripts` allowlist:

- `frontend/package.json` → `esbuild`, `fsevents`
- `backend/package.json` → `@prisma/client`, `@prisma/engines`, `prisma`, `fsevents`

The root `.npmrc` previously contained `enable-pre-post-scripts=true`, which is
**not a real npm setting** (it is a pnpm/yarn token) and did nothing. It has been
replaced with an explanatory comment. We intentionally do **not** set
`ignore-scripts=true`, because that would silently bypass the `allowScripts`
allowlist and re-introduce the bug.

---

## ✅ What has been fixed in this repository

| File | Change |
| :--- | :--- |
| `vercel.json` | Build → `cd frontend && npm run build`; `outputDirectory` → `frontend/dist`; SPA rewrite + `/api` proxy |
| `frontend/vercel.json` | New — same config for the **Root Directory = `frontend`** monorepo layout |
| `frontend/package.json` | Added `allowScripts` for `esbuild` + `fsevents` |
| `backend/package.json` | Added `allowScripts` for Prisma packages + `fsevents` |
| `.npmrc` | Removed invalid `enable-pre-post-scripts` directive |
| `backend/prisma/schema.prisma` | Datasource now reads `DATABASE_URL` (was hard-coded to `file:./dev.db`) |

---

## ☁️ Recommended production architecture

Vercel Serverless Functions are not ideal for the long-running background queue
worker (`setInterval` poller) or a persistent local SQLite file. So:

- **Frontend (SPA)** — host on **Vercel** (CDN + preview deploys).
- **Backend API + Background worker** — host on **Render / Railway / Fly.io**.
- **Database** — **Supabase** or **Neon** (managed PostgreSQL).

---

## 🛠️ Deployment instructions

### Option A — Vercel Root Directory = repository root (simplest, uses `/vercel.json`)

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Keep **Root Directory = the repository root** (Vercel reads the root
   `vercel.json` automatically).
4. **Do not** override Build/Output settings in the dashboard — the `vercel.json`
   already defines them. If you previously set a custom **Output Directory** in
   the dashboard, clear it (it overrides `vercel.json`).
5. Set the backend URL in `vercel.json` → `rewrites[0].destination` to your
   real backend (e.g. `https://postwave-ai-backend.onrender.com/api/$1`).
6. Click **Deploy**. It builds the frontend and serves the SPA.

### Option B — Vercel Root Directory = `frontend` (idiomatic monorepo)

1. In Vercel → **Project Settings → General**, set **Root Directory = `frontend`**.
2. Vercel reads `frontend/vercel.json` and auto-detects Vite.
3. Set the backend URL in `frontend/vercel.json` → `rewrites[0].destination`.
4. Deploy.

---

## 🗄️ Backend + database (Render / Railway)

1. Create a managed PostgreSQL database on **Supabase** or **Neon**.
2. Create a Web Service on **Render** / **Railway**, Root Directory = `backend`
   (or use the repo `Dockerfile`).
3. Set env vars:

   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://user:password@host:5432/db?schema=public`
   - `JWT_SECRET=<long random string>`
   - `ENCRYPTION_KEY=<32-char string>`
   - `OPENAI_API_KEY`, `CLOUDINARY_*` (optional)

4. Run schema push and start:
   ```bash
   cd backend
   npx prisma db push
   npm run build && npm start
   ```

> **Note:** `backend/prisma/schema.prisma` currently uses `provider = "sqlite"`.
> For PostgreSQL, change that line to `provider = "postgresql"` (the datasource
> already reads `DATABASE_URL` from the environment). See
> `docs/REAL_WORLD_SETUP_GUIDE.md`.

---

## 🔬 How to verify the build locally

```bash
# Frontend
cd frontend
npm install
npm run build        # -> creates frontend/dist

# Backend
cd backend
npm install
DATABASE_URL="file:./dev.db" npx prisma generate
DATABASE_URL="file:./dev.db" npx prisma db push
npm run build        # -> tsc compiles src to dist
```

The frontend build output is `frontend/dist`, which is exactly what
`outputDirectory` points at in both `vercel.json` files — so Vercel will always
find it after the build.

---

## ⚠️ Known, low-risk dependency advisory

`npm audit` reports an `esbuild` advisory (GHSA-67mh-4wv8-2f99). It only affects
the **local Vite development server** (it lets any website issue requests to a
running dev server); it is **not relevant to the static production build** served
by Vercel. Clearing it requires upgrading to Vite 7/8 (`npm audit fix --force`),
which is a breaking upgrade. It is intentionally left at the safe Vite 5.4 patch
line. The frontend package.json pins `"vite": "^5.4.21"`.
