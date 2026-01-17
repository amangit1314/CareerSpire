# Setup Guide for Mocky

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose Mumbai region for better latency in India)
3. Go to Settings → API to get your:
   - Project URL
   - Anon/public key
   - Service role key (keep this secret!)

### 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### 4. Set Up Environment Variables

Create `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM API (Choose one)
# Option 1: OpenRouter (recommended for cheaper models)
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_MODEL=openai/gpt-4o-mini

# Option 2: Direct OpenAI
# OPENAI_API_KEY=your-openai-key
# LLM_MODEL=gpt-4o-mini

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 5. Seed Sample Questions (Optional)

To add sample questions to your database:

1. Install tsx: `npm install -D tsx`
2. Make sure your `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
3. Run: `npx tsx scripts/seed-db.ts`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting API Keys

### OpenRouter (Recommended)

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Get your API key from the dashboard
4. You can use cheaper models like `openai/gpt-4o-mini` or `anthropic/claude-3-haiku`

### OpenAI (Alternative)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and add billing
3. Generate an API key
4. Use `gpt-4o-mini` for cost-effective testing

### Razorpay (For Payments - Optional)

1. Go to [razorpay.com](https://razorpay.com)
2. Create a business account
3. Get your Key ID and Key Secret from Settings → API Keys
4. Set up webhook URL: `https://your-domain.com/api/payment/webhook`

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

## Troubleshooting

### "Unauthorized" errors
- Check that your Supabase keys are correct
- Verify RLS policies are enabled in Supabase

### LLM API errors
- Verify your API key is correct
- Check your API quota/credits
- Try a different model if one doesn't work

### Database errors
- Make sure you ran the migration
- Check that all tables exist in Supabase
- Verify RLS policies are set up correctly

## Next Steps

1. Add more questions to your database
2. Customize the UI colors and branding
3. Set up email notifications (using Resend or Supabase)
4. Add GitHub OAuth for easier signup
5. Implement payment processing with Razorpay

## Support

For issues or questions, check the README.md or create an issue in the repository.
