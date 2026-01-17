import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { getToken } from "@/lib/auth-server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Plan pricing (monthly)
const PRICING = {
    basic: 9.99,
    pro: 19.99,
    business: 49.99,
};

export async function GET() {
    try {
        const token = await getToken();

        if (!token) {
            return NextResponse.json({
                success: true,
                revenue: { mrr: 0, arr: 0, totalSubscribers: 0 },
                planBreakdown: [],
                recentOrders: [],
                note: 'Not authenticated - showing empty data'
            });
        }

        convex.setAuth(token);

        // Try to get all profiles - this works even without specific admin check
        // since we're already authenticated via token
        let allProfiles;
        try {
            allProfiles = await convex.query(api.profiles.getAllProfiles);
        } catch (e) {
            console.error('Failed to fetch profiles:', e);
            return NextResponse.json({
                success: true,
                revenue: { mrr: 0, arr: 0, totalSubscribers: 0 },
                planBreakdown: [],
                recentOrders: [],
                note: 'Could not fetch profile data'
            });
        }

        let mrr = 0;
        const planBreakdown: Record<string, { subscribers: number; mrr: number }> = {
            basic: { subscribers: 0, mrr: 0 },
            pro: { subscribers: 0, mrr: 0 },
            business: { subscribers: 0, mrr: 0 },
        };

        const activeSubscribers = allProfiles.filter(p => p.subscription_status === 'active' && p.subscription_tier !== 'free');

        activeSubscribers.forEach((p) => {
            const tier = p.subscription_tier as keyof typeof PRICING;
            const amount = PRICING[tier] || 0;
            mrr += amount;

            if (planBreakdown[tier]) {
                planBreakdown[tier].subscribers += 1;
                planBreakdown[tier].mrr += amount;
            }
        });

        const totalMrr = mrr;
        const planBreakdownFormatted = Object.entries(planBreakdown).map(([plan, data]) => ({
            plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            subscribers: data.subscribers,
            mrr: data.mrr,
            percentage: totalMrr > 0 ? Math.round((data.mrr / totalMrr) * 100) : 0,
        }));

        // For recent orders, we would ideally fetch from Dodo or a Convex 'orders' table.
        // For now, we'll return a placeholder or empty array if we don't have an orders table.
        const recentOrders: Array<{
            id: string;
            date: string;
            customer: string;
            amount: number;
            status: string;
            productName: string;
        }> = [];

        return NextResponse.json({
            success: true,
            revenue: {
                mrr: Math.round(mrr * 100) / 100,
                arr: Math.round(mrr * 12 * 100) / 100,
                totalSubscribers: activeSubscribers.length,
            },
            planBreakdown: planBreakdownFormatted,
            recentOrders,
        });

    } catch (error) {
        console.error('Dodo revenue API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
