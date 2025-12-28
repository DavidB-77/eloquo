// Supabase types - auto-generated
// This file contains type definitions for Supabase database tables

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    display_name: string | null
                    subscription_tier: string | null
                    comprehensive_credits_remaining: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    display_name?: string | null
                    subscription_tier?: string | null
                    comprehensive_credits_remaining?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    display_name?: string | null
                    subscription_tier?: string | null
                    comprehensive_credits_remaining?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            optimizations: {
                Row: {
                    id: string
                    user_id: string | null
                    original_prompt: string | null
                    optimized_prompt: string | null
                    target_model: string | null
                    strength: string | null
                    tokens_original: number | null
                    tokens_optimized: number | null
                    tokens_saved: number | null
                    improvements: Json | null
                    metrics: Json | null
                    quick_reference: string | null
                    snippet: string | null
                    was_orchestrated: boolean | null
                    api_tokens_input: number | null
                    api_tokens_output: number | null
                    api_tokens_total: number | null
                    api_cost_usd: number | null
                    processing_time_ms: number | null
                    had_file_upload: boolean | null
                    file_count: number | null
                    user_tier: string | null
                    generation_model: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    original_prompt?: string | null
                    optimized_prompt?: string | null
                    target_model?: string | null
                    strength?: string | null
                    tokens_original?: number | null
                    tokens_optimized?: number | null
                    tokens_saved?: number | null
                    improvements?: Json | null
                    metrics?: Json | null
                    quick_reference?: string | null
                    snippet?: string | null
                    was_orchestrated?: boolean | null
                    api_tokens_input?: number | null
                    api_tokens_output?: number | null
                    api_tokens_total?: number | null
                    api_cost_usd?: number | null
                    processing_time_ms?: number | null
                    had_file_upload?: boolean | null
                    file_count?: number | null
                    user_tier?: string | null
                    generation_model?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    original_prompt?: string | null
                    optimized_prompt?: string | null
                    target_model?: string | null
                    strength?: string | null
                    tokens_original?: number | null
                    tokens_optimized?: number | null
                    tokens_saved?: number | null
                    improvements?: Json | null
                    metrics?: Json | null
                    quick_reference?: string | null
                    snippet?: string | null
                    was_orchestrated?: boolean | null
                    api_tokens_input?: number | null
                    api_tokens_output?: number | null
                    api_tokens_total?: number | null
                    api_cost_usd?: number | null
                    processing_time_ms?: number | null
                    had_file_upload?: boolean | null
                    file_count?: number | null
                    user_tier?: string | null
                    generation_model?: string | null
                    created_at?: string | null
                }
            }
            usage_tracking: {
                Row: {
                    id: string
                    user_id: string
                    period_start: string
                    period_end: string
                    optimizations_used: number
                    orchestrations_used: number
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    period_start: string
                    period_end: string
                    optimizations_used?: number
                    orchestrations_used?: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    period_start?: string
                    period_end?: string
                    optimizations_used?: number
                    orchestrations_used?: number
                    created_at?: string | null
                }
            }
            system_settings: {
                Row: {
                    id: string
                    key: string
                    value: Json
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    key: string
                    value: Json
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    key?: string
                    value?: Json
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
