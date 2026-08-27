# Production Dockerfile for PostWave AI
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install & Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
COPY backend/package*.json ./backend/
RUN cd frontend && npm run build
RUN cp -r frontend/dist backend/public

# 2. Install & Build Backend
COPY backend/ ./backend/
RUN cd backend && npm install && npx prisma generate && npm run build

# 3. Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/backend ./backend

WORKDIR /app/backend

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && npm start"]
