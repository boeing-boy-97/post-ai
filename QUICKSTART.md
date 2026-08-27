# Quickstart Guide — PostWave AI

### 1. Clone & install

```bash
git clone https://github.com/boeing-boy-97/post-ai.git
cd post-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

> **Note:** `npm install` may print an `allow-scripts` warning for packages like
> `esbuild` and the Prisma engines. This is expected on npm v11.16+/v12. The
> required approvals are already declared in each `package.json` via the
> `allowScripts` field, so the scripts will run automatically. No action needed.

### 2. Configure environment & database

```bash
cd backend
cp .env.example .env
# Default local setup already points DATABASE_URL="file:./dev.db" (SQLite).
```

### 3. Build the frontend

```bash
# In the frontend directory, build production bundle
cd ../frontend
npm run build
# Output -> frontend/dist
```

### 4. Set up & run the backend

```bash
cd ../backend
DATABASE_URL="file:./dev.db" npx prisma db push
npm run build
npm start
```

The backend API starts on `http://localhost:4000` (configurable via `PORT`) with
the background queue publisher active.

### 5. View the app

Open `http://localhost:4000` (serves the built frontend) — or run the Vite dev
server in `frontend` (`npm run dev`) alongside the backend for hot reload.

---

## Deploying to Vercel / Render

See **[VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)** for the exact
steps and the explanation of the two common build errors.
