-- Add new columns to optimizations table
ALTER TABLE public.optimizations
ADD COLUMN IF NOT EXISTS tokens_original INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_optimized INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_saved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_savings_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS quick_reference TEXT,
ADD COLUMN IF NOT EXISTS snippet TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create RPC to save optimization with new fields
CREATE OR REPLACE FUNCTION save_optimization(
    p_user_id UUID,
    p_original_prompt TEXT,
    p_optimized_prompt TEXT,
    p_target_model TEXT,
    p_strength TEXT,
    p_tokens_original INTEGER,
    p_tokens_optimized INTEGER,
    p_tokens_saved INTEGER,
    p_improvements JSONB,
    p_metrics JSONB,
    p_quick_reference TEXT,
    p_snippet TEXT,
    p_was_orchestrated BOOLEAN DEFAULT FALSE,
    p_segments JSONB DEFAULT NULL,
    p_segments_count INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.optimizations (
        user_id,
        original_prompt,
        optimized_prompt,
        target_model,
        strength,
        tokens_original,
        tokens_optimized,
        tokens_saved,
        token_savings_percent,
        improvements,
        metrics,
        quick_reference,
        snippet,
        was_orchestrated,
        segments,
        segments_count
    ) VALUES (
        p_user_id,
        p_original_prompt,
        p_optimized_prompt,
        p_target_model,
        p_strength,
        p_tokens_original,
        p_tokens_optimized,
        p_tokens_saved,
        CASE 
            WHEN p_tokens_original > 0 THEN ROUND((p_tokens_saved::numeric / p_tokens_original::numeric) * 100, 2)
            ELSE 0
        END,
        p_improvements,
        p_metrics,
        p_quick_reference,
        p_snippet,
        p_was_orchestrated,
        p_segments,
        p_segments_count
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC to get optimization history
CREATE OR REPLACE FUNCTION get_optimization_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    original_prompt TEXT,
    optimized_prompt TEXT,
    target_model TEXT,
    strength TEXT,
    tokens_original INTEGER,
    tokens_optimized INTEGER,
    tokens_saved INTEGER,
    token_savings_percent NUMERIC,
    improvements JSONB,
    metrics JSONB,
    quick_reference TEXT,
    snippet TEXT,
    was_orchestrated BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.original_prompt,
        o.optimized_prompt,
        o.target_model,
        o.strength,
        o.tokens_original,
        o.tokens_optimized,
        o.tokens_saved,
        o.token_savings_percent,
        o.improvements,
        o.metrics,
        o.quick_reference,
        o.snippet,
        o.was_orchestrated,
        o.created_at
    FROM public.optimizations o
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC to get user optimization stats
CREATE OR REPLACE FUNCTION get_user_optimization_stats(
    p_user_id UUID
) RETURNS TABLE (
    total_optimizations BIGINT,
    total_tokens_saved BIGINT,
    avg_savings_percent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_optimizations,
        COALESCE(SUM(tokens_saved), 0)::BIGINT as total_tokens_saved,
        COALESCE(ROUND(AVG(token_savings_percent), 2), 0) as avg_savings_percent
    FROM public.optimizations
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
