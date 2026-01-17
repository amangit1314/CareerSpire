-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'fresher' CHECK (level IN ('fresher', 'intermediate', 'experienced')),
  free_mocks_remaining INTEGER NOT NULL DEFAULT 2,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  subscription_ends_at TIMESTAMPTZ,
  weak_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  type TEXT NOT NULL CHECK (type IN ('dsa', 'coding', 'hr', 'aptitude')),
  language TEXT CHECK (language IN ('javascript', 'python', 'java')),
  test_cases JSONB NOT NULL,
  expected_complexity TEXT,
  hints TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mock sessions table
CREATE TABLE IF NOT EXISTS public.mock_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed'))
);

-- Mock results table
CREATE TABLE IF NOT EXISTS public.mock_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.mock_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_code TEXT NOT NULL,
  test_results JSONB NOT NULL,
  score INTEGER NOT NULL,
  feedback JSONB NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table (for Razorpay tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  subscription_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user_id ON public.mock_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_results_session_id ON public.mock_results(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON public.questions(topic, difficulty);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can read questions (for now)
CREATE POLICY "Questions are viewable by everyone" ON public.questions
  FOR SELECT USING (true);

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.mock_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions" ON public.mock_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON public.mock_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own results
CREATE POLICY "Users can view own results" ON public.mock_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mock_sessions
      WHERE mock_sessions.id = mock_results.session_id
      AND mock_sessions.user_id = auth.uid()
    )
  );

-- Users can create their own results
CREATE POLICY "Users can create own results" ON public.mock_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mock_sessions
      WHERE mock_sessions.id = mock_results.session_id
      AND mock_sessions.user_id = auth.uid()
    )
  );

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
