import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export type PricingTier = {
    monthly_price: number;
    annual_price: number;
    optimizations: number;
    history_days: number;
    api_access: boolean;
    support: string;
};

export type PricingConfig = {
    basic: PricingTier;
    pro: PricingTier;
    business: PricingTier;
};

export type Wave = {
    wave: number;
    spots: number;
    pro_price: number;
    business_price: number;
};

export type FoundingMemberConfig = {
    enabled: boolean;
    total_limit: number;
    current_count: number;
    applies_to: string[];
    waves: Wave[];
    popup_settings: {
        enabled: boolean;
        delay: number;
        trigger_on_scroll: {
            enabled: boolean;
            percentage: number;
        };
        show_frequency: "session" | "once";
        headline: string;
        description: string;
        button_text: string;
    };
};

export type AnnualDiscountConfig = {
    enabled: boolean;
    percent: number;
};

const DEFAULT_PRICING: PricingConfig = {
    basic: {
        monthly_price: 7,
        annual_price: 70,
        optimizations: 150,
        history_days: 30,
        api_access: false,
        support: "email"
    },
    pro: {
        monthly_price: 15,
        annual_price: 150,
        optimizations: 400,
        history_days: 90,
        api_access: true,
        support: "priority"
    },
    business: {
        monthly_price: 35,
        annual_price: 350,
        optimizations: 1000,
        history_days: 0,
        api_access: true,
        support: "dedicated"
    }
};

const DEFAULT_FOUNDING: FoundingMemberConfig = {
    enabled: true,
    total_limit: 500,
    current_count: 87, // Simulate some usage for demo
    applies_to: ["pro", "business"],
    waves: [
        { wave: 1, spots: 100, pro_price: 9, business_price: 20 },
        { wave: 2, spots: 200, pro_price: 11, business_price: 25 },
        { wave: 3, spots: 200, pro_price: 13, business_price: 30 }
    ],
    popup_settings: {
        enabled: false,
        delay: 3,
        trigger_on_scroll: { enabled: false, percentage: 50 },
        show_frequency: "session",
        headline: "Become a Founding Member",
        description: "Join early and lock in exclusive pricing forever.",
        button_text: "Join Now"
    }
};

const DEFAULT_ANNUAL: AnnualDiscountConfig = {
    enabled: true,
    percent: 17
};

export async function getPricingConfig(): Promise<PricingConfig> {
    const data = await convex.query(api.settings.getSettings, { key: 'pricing_tiers' });
    return data || DEFAULT_PRICING;
}

export async function getFoundingMemberConfig(): Promise<FoundingMemberConfig> {
    const data = await convex.query(api.settings.getSettings, { key: 'founding_member' });

    // Merge defaults to handle missing new fields
    const loaded = data || {};
    return {
        ...DEFAULT_FOUNDING,
        ...loaded,
        popup_settings: {
            ...DEFAULT_FOUNDING.popup_settings,
            ...(loaded.popup_settings || {})
        }
    };
}

export async function getAnnualDiscountConfig(): Promise<AnnualDiscountConfig> {
    const data = await convex.query(api.settings.getSettings, { key: 'annual_discount' });
    return data || DEFAULT_ANNUAL;
}

export type GeneralSettings = {
    enable_team_plan: boolean;
    enable_api_access: boolean;
    allow_new_signups: boolean;
    show_changelog_popup: boolean;
    maintenance_mode: boolean;
    free_plan_monthly_limit: number;
    test_mode_enabled: boolean;
    free_tier_enabled?: boolean;
    free_tier_weekly_limit?: number;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
    enable_team_plan: true,
    enable_api_access: true,
    allow_new_signups: true,
    show_changelog_popup: false,
    maintenance_mode: false,
    free_plan_monthly_limit: 10,
    test_mode_enabled: false,
    free_tier_enabled: true,
    free_tier_weekly_limit: 3
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
    const data = await convex.query(api.settings.getSettings, { key: 'general_settings' });
    return data ? { ...DEFAULT_GENERAL_SETTINGS, ...data } : DEFAULT_GENERAL_SETTINGS;
}

export async function updateSystemSetting(key: string, value: any) {
    await convex.mutation(api.settings.updateSettings, { key, value });
}
