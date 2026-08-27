# AI Social Media Scheduler — Project Structure (Firebase Edition)

```
AI-Social-Media-Scheduler/
├── backend/                    # Node.js/Express API (Firebase Firestore)
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts       # All configuration & Firebase credentials
│   │   ├── firebase/
│   │   │   └── db.ts          # Firebase Firestore Client & Persistent Engine
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   ├── routes/
│   │   │   ├── auth/
│   │   │   │   ├── instagram.ts
│   │   │   │   └── linkedin.ts
│   │   │   ├── posts/
│   │   │   │   └── index.ts
│   │   │   ├── accounts/
│   │   │   │   └── index.ts
│   │   │   ├── analytics/
│   │   │   │   └── index.ts
│   │   │   ├── ai/
│   │   │   │   └── index.ts
│   │   │   └── upload/
│   │   │       └── index.ts
│   │   ├── services/
│   │   │   ├── instagram.service.ts
│   │   │   ├── linkedin.service.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── cloudinary.service.ts
│   │   │   └── queue.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts             # Express app entry & static host
│   │   └── index.ts           # Server listener
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React + TypeScript App (Advanced Light Theme)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── posts/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostList.tsx
│   │   │   │   ├── PostComposer.tsx
│   │   │   │   └── PostCalendar.tsx
│   │   │   ├── accounts/
│   │   │   │   └── AccountsView.tsx
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsDashboard.tsx
│   │   │   └── ai/
│   │   │       └── AIComposer.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
├── QUICKSTART.md
└── LICENSE
```

---

## Key Updates in this Architecture:
1. **Firebase Firestore Database**: Replaced Prisma/PostgreSQL with native Firebase Firestore collections (`users`, `accounts`, `posts`, `ai_content`, `settings`).
2. **Zero Docker Requirement**: Lightweight standard Node.js/npm workflow with single unified server build.
3. **Advanced Light Color Palette**:
   - Clean, luminous `#F8FAFC` background with pure white cards.
   - Soft, modern indigo (`#4F46E5`), violet (`#7C3AED`), and pastel status pills.
   - Live platform feed simulators for Instagram and LinkedIn.
