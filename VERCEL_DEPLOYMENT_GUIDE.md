# 🚀 PostWave AI — Vercel & Production Deployment Guide

This guide outlines the deep checks performed on the codebase and the exact steps to deploy **PostWave AI** with the frontend hosted on **Vercel** and the backend + database hosted on a persistent Node.js server (such as **Render**, **Railway**, or **Fly.io**) with **PostgreSQL** (Supabase or Neon).

---

## 🔍 Deep Code Checks & Validation Results

1. **TypeScript Compilation (`backend`)**:
   - `npm run build` compiles successfully with **0 errors**. All strict type definitions, DTO sanitizers, Prisma models, and platform adapters are fully typed.
2. **Frontend Build (`frontend`)**:
   - `npm run build` (Vite) builds successfully with **0 errors**. All React components, Tailwind styling, and API hooks are production-ready.
3. **Database & ORM**:
   - Prisma schema is fully configured for SQLite (local dev) and PostgreSQL (production / Supabase / Neon).
4. **Security Vault**:
   - AES-256-GCM token encryption and bcrypt password hashing are fully implemented.

---

## ☁️ Architecture Strategy for Vercel

Because **Vercel Serverless Functions** do not support long-running background cron/interval workers (`setInterval` queue pollers) or persistent local SQLite files (`dev.db`), the recommended production architecture is:
- **Frontend SPA**: Hosted on **Vercel** (with automatic preview deployments and CDN caching).
- **Backend API & Background Worker**: Hosted on **Render** or **Railway** (using Docker or Node.js runtime with persistent database connection and background queue active).
- **Database**: Hosted on **Supabase** or **Neon** (PostgreSQL).

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Push Repository to GitHub
Ensure your repository is pushed to GitHub:
```bash
git push origin arena/01a0441d-post-ai
```

### Step 2: Set Up Your PostgreSQL Database (Supabase / Neon)
1. Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy your connection URI (`postgresql://...`).

### Step 3: Deploy the Backend (Render / Railway)
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app) connected to your GitHub repository.
2. Set the Root Directory to `backend` (or use the root `Dockerfile`).
3. Add the required Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://your_postgres_uri`
   - `JWT_SECRET=your_secure_random_string`
   - `ENCRYPTION_KEY=your_32_character_encryption_key`
   - `OPENAI_API_KEY=sk-proj-...` (optional for AI)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional for media)
4. Deploy the backend and copy your backend URL (e.g., `https://postwave-ai-backend.onrender.com`).

### Step 4: Configure Vercel Rewrites for the Backend API
In your root `vercel.json`, update the backend destination URL to match your deployed backend URL:
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 5: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New ➔ Project**.
2. Import your GitHub repository (`post-ai`).
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will build and deploy your production-ready frontend instantly!
