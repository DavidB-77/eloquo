-- 1. Add polar_customer_id to profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'polar_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN polar_customer_id TEXT;
    END IF;
END $$;

-- 2. Add optimizations_limit to profiles if missing (used by webhook/signup to cache limits)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'optimizations_limit') THEN
        ALTER TABLE public.profiles ADD COLUMN optimizations_limit INTEGER;
    END IF;
END $$;

-- 3. Fix subscription_tier constraint to allow 'basic' and 'business'
-- We first drop the existing constraint. The name is usually profiles_subscription_tier_check.
-- If the name is unknown, this block might need adjustment, but standard naming applies.

DO $$
BEGIN
    -- Try to drop by standard name
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
    
    -- Re-add with correct values
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_tier_check 
        CHECK (subscription_tier IN ('free', 'basic', 'pro', 'business', 'enterprise'));
EXCEPTION
    WHEN undefined_object THEN
        -- If constraint name differs, we might ignore or log. 
        -- Note: If constraint exists with different name, the ADD might fail or we have double constraints.
        -- For a standard Supabase setup, the name is likely generic.
        RAISE NOTICE 'Constraint profiles_subscription_tier_check not found, proceeding to add new one.';
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_tier_check 
            CHECK (subscription_tier IN ('free', 'basic', 'pro', 'business', 'enterprise'));
END $$;
