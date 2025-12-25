-- ============================================
-- ELOQUO DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  lemon_squeezy_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create usage tracking table (per month)
CREATE TABLE IF NOT EXISTS public.usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,  -- Format: '2025-12'
  optimizations_used INTEGER DEFAULT 0,
  premium_credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- 3. Create optimization history table
CREATE TABLE IF NOT EXISTS public.optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT,
  target_model TEXT,
  strength TEXT DEFAULT 'medium',
  was_orchestrated BOOLEAN DEFAULT FALSE,
  segments JSONB,  -- Store orchestration segments as JSON
  segments_count INTEGER DEFAULT 1,
  improvements JSONB,  -- Store improvements array
  metrics JSONB,  -- Store token counts, complexity score
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create API keys table for MCP
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,  -- SHA-256 hash, never store plain key
  key_prefix TEXT NOT NULL,  -- First 15 chars for display: 'elk_pro_a1b2...'
  name TEXT,  -- User-defined name like "My Cursor Key"
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ  -- NULL if active, timestamp if revoked
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usage: Users can read and update their own usage
CREATE POLICY "Users can view own usage" ON public.usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Optimizations: Users can CRUD their own optimizations
CREATE POLICY "Users can view own optimizations" ON public.optimizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimizations" ON public.optimizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own optimizations" ON public.optimizations
  FOR DELETE USING (auth.uid() = user_id);

-- API Keys: Users can CRUD their own keys
CREATE POLICY "Users can view own api_keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api_keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api_keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usage_user_month ON public.usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_optimizations_user_created ON public.optimizations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
