import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PRODUCT_IDS } from '@/lib/polar';

const POLAR_API_URL = 'https://api.polar.sh/v1';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const token = process.env.POLAR_ACCESS_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'Polar API token not configured' }, { status: 500 });
        }

        // Fetch active subscriptions
        const subsRes = await fetch(`${POLAR_API_URL}/subscriptions?status=active&limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!subsRes.ok) {
            const error = await subsRes.json();
            console.error('Polar subscriptions error:', error);
            return NextResponse.json({ error: 'Failed to fetch Polar subscriptions' }, { status: 500 });
        }

        const subsData = await subsRes.json();
        const subscriptions = subsData.items || [];

        // Calculate MRR and subscribers by plan
        let mrr = 0;
        const planBreakdown: Record<string, { subscribers: number; mrr: number }> = {
            basic: { subscribers: 0, mrr: 0 },
            pro: { subscribers: 0, mrr: 0 },
            business: { subscribers: 0, mrr: 0 },
        };

        subscriptions.forEach((sub: any) => {
            const amount = sub.amount / 100;
            mrr += amount;

            let plan = 'basic';
            if (sub.product_id === PRODUCT_IDS.pro) plan = 'pro';
            else if (sub.product_id === PRODUCT_IDS.business) plan = 'business';

            if (planBreakdown[plan]) {
                planBreakdown[plan].subscribers += 1;
                planBreakdown[plan].mrr += amount;
            }
        });

        // Fetch recent orders
        const ordersRes = await fetch(`${POLAR_API_URL}/orders?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        let recentOrders: any[] = [];
        if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            recentOrders = (ordersData.items || []).map((order: any) => ({
                id: order.id,
                date: order.created_at,
                customer: order.customer?.email || order.customer_email || 'Unknown',
                amount: order.amount / 100,
                status: order.status,
                productName: order.product?.name || 'Subscription',
            }));
        }

        const totalMrr = mrr;
        const planBreakdownFormatted = Object.entries(planBreakdown).map(([plan, data]) => ({
            plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            subscribers: data.subscribers,
            mrr: data.mrr,
            percentage: totalMrr > 0 ? Math.round((data.mrr / totalMrr) * 100) : 0,
        }));

        return NextResponse.json({
            success: true,
            revenue: {
                mrr: Math.round(mrr * 100) / 100,
                arr: Math.round(mrr * 12 * 100) / 100,
                totalSubscribers: subscriptions.length,
            },
            planBreakdown: planBreakdownFormatted,
            recentOrders,
        });
    } catch (error) {
        console.error('Polar revenue API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
