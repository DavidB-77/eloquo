-- Database changes for Frontend Production Readiness (Eloquo)

-- 1. Add Subscription and Credit tracking to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS comprehensive_credits_remaining INTEGER DEFAULT 3;

-- 2. Create function to handle new user profile creation (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_tier, comprehensive_credits_remaining)
  VALUES (
    new.id,
    new.email,
    'free',
    3
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant permissions (safety check)
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
