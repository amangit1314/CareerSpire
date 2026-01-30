# Mocky - AI-Powered Mock Interview Platform

A production-ready, scalable AI-driven mock interview platform built with Next.js, Prisma, and Supabase.

## 🚀 Features

### Core Features
- ✅ **AI-Powered Mock Interviews** - Practice with AI-generated questions and feedback
- ✅ **Code Editor** - Monaco editor with syntax highlighting and test execution
- ✅ **Progress Tracking** - Detailed analytics and performance metrics
- ✅ **Question Bank** - 1000+ curated DSA, coding, and HR questions

### Production Features
- ✅ **Secure Authentication** - JWT with refresh tokens, password hashing
- ✅ **Rate Limiting** - Per-IP and per-user rate limits
- ✅ **Notification System** - In-app and email notifications with preferences
- ✅ **Media Storage** - Supabase storage with signed URLs
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Loading States** - Beautiful skeleton loaders
- ✅ **Caching** - React Query + server-side caching
- ✅ **Performance** - Debouncing, throttling, code splitting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Storage**: Supabase Storage
- **Email**: Supabase Email (configurable to Resend/SendGrid)
- **Auth**: JWT with refresh tokens
- **State Management**: TanStack Query (React Query)
- **Code Editor**: Monaco Editor
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Mocky
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-key
LLM_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

5. **Set up Supabase Storage**
- Create a bucket named `media` in Supabase Storage
- Configure bucket settings (private, 10MB max file size)

6. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## AGE

-- BORN on `13-01-2026`
-- DIED ON `30-01-2026 🥹😥😑☠️`

## 📁 Project Structure

```
Mocky/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── mock/              # Mock interview pages
│   └── auth/              # Auth pages
├── components/            # React components
│   ├── ui/                # UI primitives
│   └── skeletons/         # Loading skeletons
├── hooks/                 # React Query hooks
├── lib/                   # Utilities
│   ├── auth.ts           # Auth utilities
│   ├── errors.ts         # Error handling
│   ├── rate-limit.ts     # Rate limiting
│   └── supabase/         # Supabase helpers
├── services/             # API services
├── types/                # TypeScript types
└── prisma/               # Prisma schema
```

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Password Hashing**: bcryptjs with 12 rounds
- **Rate Limiting**: Per-endpoint rate limits
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: SameSite cookies

## 📊 Database Schema

See `prisma/schema.prisma` for the complete schema. Key models:
- `User` - User accounts
- `Session` - Refresh token sessions
- `Notification` - In-app notifications
- `NotificationPreference` - User notification settings
- `MockSession` - Interview sessions
- `MockResult` - Submission results
- `Question` - Question bank
- `MediaObject` - Media file metadata

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Migration

Run migrations in production:
```bash
npx prisma migrate deploy
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Mock Interviews
- `POST /api/mock/start` - Start mock interview
- `POST /api/mock/submit` - Submit solution
- `GET /api/mock/[id]` - Get session details

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PATCH /api/notifications/preferences` - Update preferences

### Media
- `POST /api/media/upload-url` - Get upload URL

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📞 Support

For issues and questions, please open an issue on GitHub.
