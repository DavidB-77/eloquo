"use client";

import * as React from "react";
import { DollarSign, TrendingUp, ArrowUpRight, ExternalLink, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/admin/StatCards";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MercuryTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
}

interface MercuryAccount {
    id: string;
    name: string;
    accountNumber: string;
    balance: number;
    transactions: MercuryTransaction[];
}

interface PlanBreakdown {
    plan: string;
    subscribers: number;
    mrr: number;
    percentage: number;
}

interface RecentOrder {
    id: string;
    date: string;
    customer: string;
    amount: number;
    status: string;
    productName: string;
}

export default function AdminRevenuePage() {
    const [loading, setLoading] = React.useState(true);
    const [mercuryAccounts, setMercuryAccounts] = React.useState<MercuryAccount[]>([]);
    const [mercuryTotal, setMercuryTotal] = React.useState(0);
    const [mercuryError, setMercuryError] = React.useState<string | null>(null);
    const [revenue, setRevenue] = React.useState({ mrr: 0, arr: 0, totalSubscribers: 0 });
    const [planBreakdown, setPlanBreakdown] = React.useState<PlanBreakdown[]>([]);
    const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([]);
    const [dodoError, setDodoError] = React.useState<string | null>(null);
    const [openRouterBalance, setOpenRouterBalance] = React.useState<number | null>(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);

        // Fetch Mercury
        try {
            const res = await fetch('/api/admin/mercury');
            const data = await res.json();
            if (data.success) {
                setMercuryAccounts(data.accounts);
                setMercuryTotal(data.totalBalance);
                setMercuryError(null);
            } else {
                setMercuryError(data.error);
            }
        } catch {
            setMercuryError('Failed to connect to Mercury');
        }

        // Fetch Dodo
        try {
            const res = await fetch('/api/admin/dodo-revenue');
            const data = await res.json();
            if (data.success) {
                setRevenue(data.revenue);
                setPlanBreakdown(data.planBreakdown);
                setRecentOrders(data.recentOrders);
                setDodoError(null);
            } else {
                setDodoError(data.error);
            }
        } catch {
            setDodoError('Failed to connect to Dodo Payments');
        }

        // Fetch OpenRouter
        try {
            const res = await fetch('/api/admin/openrouter-balance');
            const data = await res.json();
            if (data.success) setOpenRouterBalance(data.balance);
        } catch { }

        setLoading(false);
    }, []);

    React.useEffect(() => { fetchData(); }, [fetchData]);

    const getAccountEmoji = (name: string) => {
        if (name.toLowerCase().includes('checking')) return '📥';
        if (name.toLowerCase().includes('savings')) return '💵';
        return '🏦';
    };

    const infraCost = 16;
    const paymentFees = revenue.mrr * 0.044;
    const apiCost = openRouterBalance !== null ? Math.max(0, 50 - openRouterBalance) : 0;
    const netProfit = revenue.mrr - infraCost - paymentFees - apiCost;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Revenue & Finances</h1>
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white">
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
                </button>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Live Data — Connected to Dodo Payments & Mercury APIs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="MRR" value={`$${revenue.mrr.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
                <StatCard title="ARR" value={`$${revenue.arr.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5" />} />
                <StatCard title="Subscribers" value={revenue.totalSubscribers.toString()} />
                <StatCard title="Bank Total" value={`$${mercuryTotal.toFixed(2)}`} />
                <StatCard title="OpenRouter" value={openRouterBalance !== null ? `$${openRouterBalance.toFixed(2)}` : '...'} icon={<ArrowUpRight className="h-5 w-5" />} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">💰 Mercury Bank Accounts</h2>
                    <a href="https://app.mercury.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#09B7B4] hover:underline flex items-center gap-1">
                        Open Mercury <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                {mercuryError ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{mercuryError}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mercuryAccounts.map((account) => (
                            <div key={account.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{getAccountEmoji(account.name)}</span>
                                    <span className="text-sm text-gray-400">{account.name}</span>
                                    <span className="text-xs text-gray-600">••{account.accountNumber}</span>
                                </div>
                                <p className="text-2xl font-bold font-mono text-white mb-4">${account.balance.toFixed(2)}</p>
                                <div className="space-y-2 border-t border-white/5 pt-4">
                                    <p className="text-xs text-gray-500 uppercase">Recent Transactions</p>
                                    {account.transactions.length > 0 ? account.transactions.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between text-sm">
                                            <div>
                                                <span className="text-gray-400">{tx.date ? format(new Date(tx.date), 'MMM d') : ''}</span>
                                                <span className="text-gray-500 mx-2">•</span>
                                                <span className="text-gray-300 truncate">{tx.description}</span>
                                            </div>
                                            <span className={cn("font-mono", tx.amount >= 0 ? "text-green-400" : "text-red-400")}>
                                                {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    )) : <p className="text-gray-500 text-sm italic">No recent transactions</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {dodoError && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                        {dodoError}
                    </div>
                )}
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">📊 Revenue by Plan</h3>
                {planBreakdown.length > 0 ? (
                    <table className="w-full">
                        <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-3">Plan</th><th className="pb-3">Active</th><th className="pb-3">MRR</th><th className="pb-3">% of Total</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {planBreakdown.map((plan) => (
                                <tr key={plan.plan}>
                                    <td className="py-3 text-sm text-white">{plan.plan}</td>
                                    <td className="py-3 text-sm text-gray-400">{plan.subscribers}</td>
                                    <td className="py-3 text-sm font-mono text-white">${plan.mrr.toFixed(2)}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#09B7B4]" style={{ width: `${plan.percentage}%` } as React.CSSProperties} />
                                            </div>
                                            <span className="text-xs text-gray-500">{plan.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-500 text-sm italic">No active subscriptions yet</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">🧾 Recent Orders</h3>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div><p className="text-sm text-white">{order.customer}</p><p className="text-xs text-gray-500">{order.productName}</p></div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-green-400">+${order.amount.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{order.date ? format(new Date(order.date), 'MMM d') : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 text-sm italic">No orders yet</p>}
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">💵 Profit Calculation (Monthly)</h3>
                    <div className="space-y-3 font-mono text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">MRR</span><span className="text-white">${revenue.mrr.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-400"><span>API Costs (est.)</span><span>-${apiCost.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-400"><span>Infrastructure</span><span>-${infraCost.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-400"><span>Payment Fees (~4.4%)</span><span>-${paymentFees.toFixed(2)}</span></div>
                        <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex justify-between text-lg"><span className="text-white font-semibold">Net Profit</span><span className={netProfit >= 0 ? "text-green-400" : "text-red-400"}>${netProfit.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Margin</span><span className="text-gray-400">{revenue.mrr > 0 ? ((netProfit / revenue.mrr) * 100).toFixed(1) : 0}%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
