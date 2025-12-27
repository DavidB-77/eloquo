-- Create RPC function to atomic increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_month_year TEXT,
  p_optimizations INTEGER DEFAULT 1,
  p_premium_credits INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage (user_id, month_year, optimizations_used, premium_credits_used)
  VALUES (p_user_id, p_month_year, p_optimizations, p_premium_credits)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    optimizations_used = usage.optimizations_used + p_optimizations,
    premium_credits_used = usage.premium_credits_used + p_premium_credits,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_usage TO postgres;
GRANT EXECUTE ON FUNCTION public.increment_usage TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_usage TO authenticated;
