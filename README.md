# 🌊 PostWave AI — Production-Grade Multi-Channel Social Media Publishing & AI Engine

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21+-000000.svg?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.22+-2D3748.svg?style=flat&logo=prisma&logoColor=white)](https://prisma.io)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-009688.svg?style=flat&logo=shield&logoColor=white)](https://nodejs.org/api/crypto.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**PostWave AI** is an enterprise-grade social media scheduling, AI content generation, and multi-network publishing platform. It unifies **Instagram, LinkedIn, X (Twitter), YouTube, Facebook, Threads, Pinterest, TikTok, and Telegram** into a single master workspace with real-time background queue workers, brand knowledge memory (RAG), and cryptographic token security.

---

## 📑 Table of Contents

1. [Product Architecture](#-product-architecture)
2. [What is Already Built & Working](#-what-is-already-built--working)
3. [What is Remaining to Connect to the Real World (Key-by-Key Checklist)](#-what-is-remaining-to-connect-to-the-real-world)
4. [Step-by-Step: How to Get Every External API Key](#-step-by-step-how-to-get-every-external-api-key)
5. [Database Setup (PostgreSQL / Supabase / Neon)](#-database-setup-postgresql--supabase--neon)
6. [Multi-Channel Platform Matrix](#-multi-channel-platform-matrix)
7. [Security & Frontend-Backend Boundary](#-security--frontend-backend-boundary)
8. [Production Deployment & Quickstart](#-production-deployment--quickstart)
9. [Complete API Reference](#-complete-api-reference)

---

## 🏗️ Product Architecture

```
                                  BROWSER (React 18 + Inter UI)
                                                 │
                                 Strict Sanitized DTO Boundary
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express Backend (Port 8000)                              │
├─────────────────┬──────────────────┬──────────────────┬─────────────────┬──────────────┤
│  Authentication │  Social Accounts │   Post Studio    │ Brand Memory RAG│  Campaigns   │
│  (/api/auth)    │  (/api/accounts) │   (/api/posts)   │   (/api/brand)  │ (/api/camp)  │
└────────┬────────┴────────┬─────────┴────────┬─────────┴────────┬────────┴───────┬──────┘
         │                 │                  │                  │                │
         ▼                 ▼                  ▼                  ▼                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Security & Database Layer                              │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│  • AES-256-GCM Token Encryption Vault                 │  • Prisma ORM Client           │
│  • bcrypt (12 rounds) Password Hasher                 │  • PostgreSQL / SQLite Store   │
│  • Rate Limiting & Helmet Security Headers            │  • Error Sanitization Engine   │
└───────────────────────────────────────────────────────┴────────────────┬───────────────┘
                                                                         │
                                                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Background Queue Scheduler & Publisher                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  • 10-Second Transactional Poller                                                      │
│  • Idempotency & State Machine: DRAFT ➔ SCHEDULED ➔ PUBLISHING ➔ PUBLISHED / FAILED    │
│  • Independent Target Isolation & Partial Failure Recovery                             │
└────────┬───────────────────────────────────────────────────────────────┬───────────────┘
         │                                                               │
         ▼                                                               ▼
┌───────────────────────────────────┐               ┌────────────────────────────────────┐
│      Official Social Adapters     │               │           AI Content Engine        │
├───────────────────────────────────┤               ├────────────────────────────────────┤
│ • Instagram Graph API (v20.0)     │               │ • OpenAI GPT-4o-mini Client        │
│ • LinkedIn Community Posts API    │               │ • Brand Knowledge Ingestion (RAG)  │
│ • X / Twitter API v2              │               │ • Multi-Channel Content Adaptation │
│ • YouTube Data API v3             │               │ • 7-Day Campaign Narrative Studio  │
│ • Facebook Pages API              │               │ • Readability & Quality Scoring    │
│ • Threads, Pinterest, Telegram    │               └────────────────────────────────────┘
└───────────────────────────────────┘
```

---

## ✅ What is Already Built & Working (100% Implemented)

All internal engineering, database models, security vaults, and user interfaces are **fully written, compiled, tested, and active**:

- [x] **Real User Authentication**: Registration (`POST /api/auth/signup`), login (`POST /api/auth/signin`), JWT tokens, password reset (`/api/auth/forgot-password` & `/api/auth/reset-password`), session persistence surviving browser restarts.
- [x] **AES-256-GCM Credential Vault**: Encryption utility (`src/utils/encryption.ts`) that encrypts social OAuth tokens at rest with random IVs and auth tags.
- [x] **Strict DTO Sanitization Boundary**: Every API endpoint filters responses through DTO serializers (`src/dto/index.ts`)—zero tokens, secrets, or internal stack traces are sent to the client.
- [x] **Omni-Channel Post Studio (`PostComposer.tsx`)**: Unified composer with **Master Idea** ➔ **1-Click AI Adaptation** for Instagram, LinkedIn, X/Twitter, YouTube, and Facebook with live feed simulators.
- [x] **Independent Platform Delivery Targets (`PostAccount`)**: Posts create individual channel target records. If one platform fails, successful platforms stay `PUBLISHED`, and only the failed platform is retried.
- [x] **Autonomous Background Queue (`queue.service.ts` & `postPublisher.worker.ts`)**: Background scheduler checks for due posts every 10 seconds and automatically publishes them without requiring the browser to stay open.
- [x] **AI Brand Memory & RAG (`/api/brand`)**: Ingests company guidelines, product specs, and FAQs to ground all generated copy in factual context.
- [x] **7-Day Campaign Studio (`/api/campaigns`)**: Generates 7-day multi-channel scheduled narratives with 1-click database and queue approval.
- [x] **Publishing Calendar & Posts Queue**: Interactive month grid with date navigation, status filtering, cancellation, and retry controls.
- [x] **Performance Analytics**: Calculates reach, impressions, and engagement rate directly from database records.

---

## 🔑 What is Remaining to Connect to the Real World

To enable real-world live publishing to official social platforms and connect your cloud database, you only need to populate your **`backend/.env`** file with your external developer account credentials.

Here is the exact **Key-by-Key Checklist**:

| Environment Key | Purpose | Required For | Default Status |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | Real Cloud Database | Set to local SQLite (`file:./dev.db`) |
| `JWT_SECRET` | 32+ char secret for JWT sessions | Authentication | Pre-configured (replace in prod) |
| `ENCRYPTION_KEY` | 32-char secret for AES-256 vault | Social Token Storage | Pre-configured (replace in prod) |
| `INSTAGRAM_APP_ID` | Meta App ID | Live Instagram Publishing | **Add your Meta Developer App ID** |
| `INSTAGRAM_APP_SECRET`| Meta App Secret | Live Instagram Publishing | **Add your Meta Developer App Secret**|
| `LINKEDIN_CLIENT_ID` | LinkedIn Client ID | Live LinkedIn Publishing | **Add your LinkedIn Client ID** |
| `LINKEDIN_CLIENT_SECRET`| LinkedIn Client Secret | Live LinkedIn Publishing | **Add your LinkedIn Client Secret**|
| `TWITTER_API_KEY` | X / Twitter Client ID / Bearer | Live X / Tweet Publishing | **Add your X Developer API Key** |
| `YOUTUBE_API_KEY` | Google / YouTube Data API Key | Live YouTube Posts | **Add your Google Cloud Key** |
| `OPENAI_API_KEY` | OpenAI API Key (`sk-proj-...`) | Live GPT-4o-mini generation | **Add your OpenAI API Key** |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name | Cloud Media Storage | **Add your Cloudinary Cloud Name** |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Cloud Media Storage | **Add your Cloudinary API Key** |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | Cloud Media Storage | **Add your Cloudinary API Secret** |

---

## 📖 Step-by-Step: How to Get Every External API Key

### 1. 📸 Meta for Developers (Instagram & Facebook Graph API)
To post to real Instagram Business/Creator accounts and Facebook Pages:
1. Go to [developers.facebook.com](https://developers.facebook.com) and click **My Apps** ➔ **Create App**.
2. Choose **Other** ➔ Select **Business** as the app type.
3. In the App Dashboard, add two products:
   - **Instagram Graph API**
   - **Facebook Login for Business**
4. Under **Facebook Login ➔ Settings ➔ Valid OAuth Redirect URIs**, enter:
   ```
   http://localhost:8000/api/auth/instagram/callback
   ```
   *(Or `https://yourdomain.com/api/auth/instagram/callback` in production)*.
5. In **App Settings ➔ Basic**, copy your **App ID** and **App Secret** into `backend/.env`:
   ```env
   INSTAGRAM_APP_ID=your_meta_app_id
   INSTAGRAM_APP_SECRET=your_meta_app_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:8000/api/auth/instagram/callback
   ```

---

### 2. 💼 LinkedIn Developer Portal
To post to personal LinkedIn profiles and company pages:
1. Go to [developer.linkedin.com](https://developer.linkedin.com) and click **Create App**.
2. Associate the app with your official LinkedIn Page.
3. In the **Products** tab, request access to:
   - **Share on LinkedIn** (Enables publishing text, links, and media)
   - **Sign In with LinkedIn using OpenID Connect** (Enables user auth)
   - *(Optional for company pages)*: **Community Management API**
4. In the **Auth** tab, under **OAuth 2.0 settings**, add your **Authorized Redirect URL**:
   ```
   http://localhost:8000/api/auth/linkedin/callback
   ```
5. Copy your credentials into `backend/.env`:
   ```env
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   LINKEDIN_REDIRECT_URI=http://localhost:8000/api/auth/linkedin/callback
   ```

---

### 3. 🆇 X / Twitter Developer Portal
To post tweets and threads automatically:
1. Go to [developer.x.com](https://developer.x.com) and create a **Project & App**.
2. Under **User authentication settings**, enable **OAuth 2.0**.
3. Set permissions to **Read and Write** and add scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`.
4. Copy your Client ID and Client Secret into `backend/.env`.

---

### 4. 🤖 OpenAI API Key
For live GPT-4o-mini caption, hook, and campaign synthesis:
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys) and click **Create new secret key**.
2. Copy the key (starting with `sk-proj-...`) into `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your_actual_openai_key_here
   AI_MODEL=gpt-4o-mini
   ```

---

### 5. ☁️ Cloudinary (Media Uploads & Storage)
For permanent image and video CDN hosting:
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.
3. Paste them into `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

---

## 🗄️ Database Setup (PostgreSQL / Supabase / Neon)

### Option A: Connecting a Live PostgreSQL Database (Supabase / Neon / AWS RDS)
1. Create a database at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy your connection URI and paste it into `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres?schema=public"
   ```
3. Open `backend/prisma/schema.prisma` and set `provider = "postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Push your schema to automatically create all tables, indexes, and foreign keys:
   ```bash
   cd backend
   npx prisma db push
   ```

### Option B: Local SQLite (Zero Configuration Default)
The application works locally without setting up a remote database using:
```env
DATABASE_URL="file:./dev.db"
```

---

## 🌐 Multi-Channel Platform Matrix

| Platform | Channel / Target Type | Validation Rules & Specs |
| :--- | :--- | :--- |
| 📸 **Instagram** | Feed Post, Carousel, Reel | Image/Video asset required; 2,200 character limit |
| 💼 **LinkedIn** | Personal Profile, Company Page | Article, text, or image; 3,000 character limit |
| 🆇 **X / Twitter** | Tweet, 3-Tweet Auto-Thread | 280 characters per tweet; auto-thread with `---` |
| 🎥 **YouTube** | Community Update, Shorts Script | Text, image, or video link; 5,000 character limit |
| 📘 **Facebook** | Business / Creator Page | Status update, image attachment; 63,206 character limit |
| 🧵 **Threads** | Meta Threads Feed | Short-form text & media containers; 500 character limit |
| 📌 **Pinterest** | Board Pins | Image URL required + destination link; 500 character limit |
| 💬 **Telegram** | Official Channel / Group | Markdown formatted text & media broadcasts |

---

## 🚀 Production Deployment & Quickstart

### 1. Build the Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Prepare the Backend & Database
```bash
cd ../backend
npm install
cp .env.example .env            # set DATABASE_URL, JWT_SECRET, etc.
DATABASE_URL="file:./dev.db" npx prisma db push
npm run build
```

### 3. Start Production Server & Background Worker
```bash
npm start
```
The server will start listening at `http://0.0.0.0:8000` with the background queue publisher active.

> **Deploying to Vercel / Render?** See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) — it explains and fixes the two common errors: "No Output Directory named 'dist' found" and the npm `allow-scripts` warning for `esbuild`.

---

## 📡 Complete API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Minimal safe health check (`{ status: "ok" }`) | No |
| `/api/auth/signup` | `POST` | Register user with bcrypt password hashing | No |
| `/api/auth/signin` | `POST` | Authenticate user & issue JWT session | No |
| `/api/auth/me` | `GET` | Get current authenticated user DTO | Yes |
| `/api/auth/forgot-password` | `POST` | Issue secure password reset token | No |
| `/api/auth/reset-password` | `POST` | Update password with verified reset token | No |
| `/api/accounts` | `GET` | List connected social channels (tokens hidden) | Yes |
| `/api/accounts/connect` | `POST` | Connect channel with verified platform token | Yes |
| `/api/accounts/:id` | `DELETE` | Disconnect social channel & cancel pending jobs | Yes |
| `/api/posts` | `GET` | List posts with status/platform/search filters | Yes |
| `/api/posts` | `POST` | Create post, schedule in queue, or publish now | Yes |
| `/api/posts/:id/publish` | `POST` | Immediately publish scheduled/draft post | Yes |
| `/api/posts/:id/cancel` | `POST` | Cancel scheduled post and disarm queue job | Yes |
| `/api/posts/:id/retry` | `POST` | Retry publishing for failed targets only | Yes |
| `/api/posts/:id` | `DELETE` | Delete post and cancel associated jobs | Yes |
| `/api/brand` | `GET` | Fetch brand knowledge base documents & voice | Yes |
| `/api/brand` | `POST` | Ingest brand guidelines/specs for AI RAG | Yes |
| `/api/brand/voice` | `PUT` | Update global brand voice directives | Yes |
| `/api/campaigns` | `GET` | List multi-day AI campaigns | Yes |
| `/api/campaigns/generate`| `POST` | Generate 7-day multi-channel campaign sequence | Yes |
| `/api/campaigns/:id/approve-schedule` | `POST` | Batch schedule all campaign posts in database | Yes |
| `/api/ai/generate` | `POST` | Generate AI caption, hooks & hashtags | Yes |
| `/api/ai/adapt-all` | `POST` | Adapt 1 idea into all 7 platform variants | Yes |
| `/api/upload` | `POST` | Upload media to Cloudinary / persistent storage | Yes |
| `/api/templates` | `GET`/`POST`| Manage reusable post templates | Yes |
| `/api/analytics` | `GET` | Reconcile reach & engagement from database | Yes |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
