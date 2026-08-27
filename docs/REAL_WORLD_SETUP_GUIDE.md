# 🌍 Real-World Production Setup Guide

This guide walks you step-by-step through connecting your real-world database (**PostgreSQL / Supabase / Neon**), **Instagram Graph API (Meta)**, **LinkedIn Developer Portal**, **OpenAI**, and **Cloudinary**.

---

## 📍 Step 1: Where to Put Your API Keys

All keys and database connection strings are stored in **`backend/.env`**.

Create or edit `backend/.env` (based on `.env.example`):

```bash
cd backend
cp .env.example .env
```

---

## 🗄️ Step 2: How to Connect a Real Database (PostgreSQL / Supabase / Neon)

### Option A: Supabase or Neon (Recommended Cloud PostgreSQL)
1. Create a free PostgreSQL project at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy your Connection String (URI), which looks like:
   ```env
   DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=public"
   ```
3. Open `backend/prisma/schema.prisma` and change the datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Push your Prisma schema to create all tables and indexes automatically:
   ```bash
   cd backend
   npx prisma db push
   ```

### Option B: Local SQLite (Zero-Setup Default)
If you don't have a remote PostgreSQL yet, the app works out-of-the-box with persistent SQLite:
```env
DATABASE_URL="file:./dev.db"
```

---

## 📸 Step 3: Connecting Real Instagram Graph API (Meta for Developers)

To publish posts and reels to Instagram automatically:

1. **Prerequisites**: You need an **Instagram Business or Creator Account** connected to a **Facebook Page**.
2. Go to the [Meta for Developers Portal](https://developers.facebook.com) and click **My Apps** ➔ **Create App**.
3. Select **Other** ➔ Choose **Business** as the app type.
4. In the App Dashboard, add the following products:
   - **Instagram Graph API**
   - **Facebook Login for Business**
5. Go to **Facebook Login ➔ Settings ➔ Valid OAuth Redirect URIs** and enter:
   ```
   http://localhost:8000/api/auth/instagram/callback
   ```
   *(Replace `http://localhost:8000` with your production domain when deploying)*
6. In **App Settings ➔ Basic**, copy your:
   - **App ID** ➔ paste as `INSTAGRAM_APP_ID` in `backend/.env`
   - **App Secret** ➔ paste as `INSTAGRAM_APP_SECRET` in `backend/.env`
7. Required Scopes: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.

---

## 💼 Step 4: Connecting Real LinkedIn API (LinkedIn Developer Portal)

To publish member and company page posts automatically:

1. Go to the [LinkedIn Developer Portal](https://developer.linkedin.com) and click **Create App**.
2. Enter your App Name and link it to your official LinkedIn Page.
3. In the **Products** tab of your app, request access to:
   - **Share on LinkedIn** (Enables posting text, links, and images)
   - **Sign In with LinkedIn using OpenID Connect** (Enables OAuth 2.0 login)
   - *(Optional for company pages)*: **Community Management API**
4. In the **Auth** tab, under **OAuth 2.0 settings**, add your **Authorized redirect URL**:
   ```
   http://localhost:8000/api/auth/linkedin/callback
   ```
5. Copy your credentials from the **Auth** tab:
   - **Client ID** ➔ paste as `LINKEDIN_CLIENT_ID` in `backend/.env`
   - **Primary Client Secret** ➔ paste as `LINKEDIN_CLIENT_SECRET` in `backend/.env`

---

## 🤖 Step 5: Connecting OpenAI (AI Caption & Campaign Engine)

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys).
2. Click **Create new secret key** (e.g. `sk-proj-...`).
3. Paste it into `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your_actual_key_here
   AI_MODEL=gpt-4o-mini
   ```

---

## ☁️ Step 6: Connecting Cloudinary (Media Uploads & Storage)

1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. From your Cloudinary Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🚀 Step 7: Starting the Production Application

Once your `.env` is configured:

```bash
# 1. Build the Frontend
cd frontend
npm install
npm run build

# 2. Sync Database Schema
cd ../backend
npm install
npx prisma db push

# 3. Build & Start Backend Server + Background Queue Worker
npm run build
npm start
```

Your platform is now live at `http://localhost:8000` with real database persistence, real OAuth integrations, and automated background publishing!
