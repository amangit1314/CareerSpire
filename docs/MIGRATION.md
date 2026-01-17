# Migration Guide: Supabase to Prisma

This guide helps you migrate from the Supabase-based implementation to the new Prisma-based architecture.

## Key Changes

### 1. Database
- **Before:** Supabase PostgreSQL with direct client access
- **After:** Prisma ORM with PostgreSQL connection string
- **Migration:** Run Prisma migrations to set up the schema

### 2. Authentication
- **Before:** Supabase Auth with JWT tokens
- **After:** Custom JWT-based auth with bcryptjs for password hashing
- **Migration:** Users need to sign up again (or migrate existing users)

### 3. API Architecture
- **Before:** Direct Supabase client calls in components
- **After:** 
  - Server Actions (`app/actions/*`)
  - API Routes (`app/api/*`) that use server actions
  - Frontend Services (`services/*`)
  - TanStack Query hooks (`hooks/*`)
  - UI Components

### 4. TypeScript Types
- **Before:** Basic types in `types/index.ts`
- **After:** 
  - Enums in `types/enums.ts`
  - Comprehensive types with generics in `types/index.ts`
  - Prisma-generated types

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a PostgreSQL database (can use Supabase, Railway, or any PostgreSQL provider)
2. Get your connection string
3. Update `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?schema=public
   ```

### 3. Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 4. Update Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
- `DATABASE_URL`
- `JWT_SECRET` (generate a secure random string)
- LLM API keys
- App URL

### 5. Start Development Server

```bash
npm run dev
```

## Architecture Overview

```
┌─────────────────┐
│   UI Components │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Query    │
│     Hooks       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Services      │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Manager    │
│    (Axios)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
│  (Next.js API)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Server Actions  │
│  ('use server') │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Prisma      │
│      ORM        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

## Breaking Changes

1. **Authentication:** Users must re-register (or you need to migrate user data)
2. **API Endpoints:** Some endpoints changed structure
3. **Type Imports:** Use enums from `@/types/enums` instead of string literals
4. **Component Props:** Some components now use typed enums instead of strings

## Benefits

1. **Type Safety:** Full TypeScript support with Prisma-generated types
2. **Better Architecture:** Clear separation of concerns
3. **Performance:** React Query caching and optimistic updates
4. **Maintainability:** Server actions reduce boilerplate
5. **Scalability:** Easier to add features and refactor

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is accessible
- Run `npx prisma db pull` to sync schema

### Authentication Issues
- Clear browser cookies
- Check `JWT_SECRET` is set
- Verify token expiration

### Type Errors
- Run `npx prisma generate` after schema changes
- Restart TypeScript server in your IDE
