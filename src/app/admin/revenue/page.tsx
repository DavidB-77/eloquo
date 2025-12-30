"use client";

import * as React from "react";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ExternalLink } from "lucide-react";
import { StatCard, BankAccountCard } from "@/components/admin/StatCards";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_REVENUE = {
    mrr: 4125,
    arr: 49500,
    thisMonth: 4847,
    lastMonth: 4125,
    growth: 17.5,
};

const MOCK_BANK_ACCOUNTS = [
    {
        name: "Income",
        emoji: "📥",
        balance: 1247.33,
        transactions: [
            { date: "Dec 26", description: "Lemon Squeezy Payout", amount: 287.00, type: "credit" },
            { date: "Dec 25", description: "Lemon Squeezy Payout", amount: 145.00, type: "credit" },
            { date: "Dec 24", description: "Lemon Squeezy Payout", amount: 312.00, type: "credit" },
        ],
    },
    {
        name: "Operations",
        emoji: "⚙️",
        balance: 312.50,
        transactions: [
            { date: "Dec 26", description: "OpenRouter Auto Top-up", amount: -50.00, type: "debit" },
            { date: "Dec 20", description: "Hostinger VPS", amount: -16.00, type: "debit" },
            { date: "Dec 15", description: "Income Transfer", amount: 127.00, type: "credit" },
        ],
    },
    {
        name: "Profit",
        emoji: "💵",
        balance: 2891.18,
        transactions: [
            { date: "Dec 26", description: "Income Split (65%)", amount: 186.55, type: "credit" },
            { date: "Dec 25", description: "Income Split (65%)", amount: 94.25, type: "credit" },
            { date: "Dec 24", description: "Income Split (65%)", amount: 202.80, type: "credit" },
        ],
    },
];

const MOCK_PLAN_BREAKDOWN = [
    { plan: "Basic", subscribers: 847, mrr: 0, percentage: 0 },
    { plan: "Pro", subscribers: 42, mrr: 1218, percentage: 68 },
    { plan: "Business", subscribers: 5, mrr: 495, percentage: 27 },
    { plan: "Enterprise", subscribers: 1, mrr: 89, percentage: 5 },
];

const MOCK_RECENT_ORDERS = [
    { date: "Dec 26", customer: "john@example.com", type: "New subscription", amount: 29, status: "Paid" },
    { date: "Dec 25", customer: "sarah@company.com", type: "Renewal", amount: 29, status: "Paid" },
    { date: "Dec 24", customer: "mike@startup.io", type: "Upgrade (Pro→Team)", amount: 70, status: "Paid" },
    { date: "Dec 23", customer: "test@test.com", type: "Refund", amount: -29, status: "Refunded" },
];

const MOCK_COSTS = {
    apiSpend: 127,
    infrastructure: 16,
    paymentFees: 92,
    costPerOptimization: 0.037,
};

export default function AdminRevenuePage() {
    return (
        <div className="space-y-6">
            {/* Demo Data Banner */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center gap-2">
                <span className="text-orange-400 text-sm font-medium">⚠️ Demo Data — Lemon Squeezy integration coming soon</span>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="MRR"
                    value={`$${MOCK_REVENUE.mrr.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                    title="ARR"
                    value={`$${MOCK_REVENUE.arr.toLocaleString()}`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                    title="This Month"
                    value={`$${MOCK_REVENUE.thisMonth.toLocaleString()}`}
                    change={{ value: `+${MOCK_REVENUE.growth}%`, positive: true }}
                />
                <StatCard
                    title="Last Month"
                    value={`$${MOCK_REVENUE.lastMonth.toLocaleString()}`}
                />
                <StatCard
                    title="Growth"
                    value={`${MOCK_REVENUE.growth}%`}
                    change={{ value: "vs last month", positive: true }}
                    icon={<ArrowUpRight className="h-5 w-5" />}
                />
            </div>

            {/* Mercury Bank Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">💰 Mercury Bank Accounts</h2>
                    <a
                        href="https://app.mercury.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#09B7B4] hover:underline flex items-center gap-1"
                    >
                        Open Mercury <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {MOCK_BANK_ACCOUNTS.map((account) => (
                        <div
                            key={account.name}
                            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{account.emoji}</span>
                                <span className="text-sm text-gray-400">{account.name}</span>
                            </div>
                            <p className="text-2xl font-bold font-mono text-white mb-4">
                                ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <p className="text-xs text-gray-500 uppercase">Recent Transactions</p>
                                {account.transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-gray-400">{tx.date}</span>
                                            <span className="text-gray-500 mx-2">•</span>
                                            <span className="text-gray-300">{tx.description}</span>
                                        </div>
                                        <span
                                            className={cn(
                                                "font-mono",
                                                tx.type === "credit" ? "text-green-400" : "text-red-400"
                                            )}
                                        >
                                            {tx.type === "credit" ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue by Plan Table */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">📊 Revenue by Plan</h3>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                            <th className="pb-3">Plan</th>
                            <th className="pb-3">Active</th>
                            <th className="pb-3">MRR</th>
                            <th className="pb-3">% of Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {MOCK_PLAN_BREAKDOWN.map((plan) => (
                            <tr key={plan.plan}>
                                <td className="py-3 text-sm text-white">{plan.plan}</td>
                                <td className="py-3 text-sm text-gray-400">{plan.subscribers}</td>
                                <td className="py-3 text-sm font-mono text-white">${plan.mrr}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#09B7B4]"
                                                style={{ width: `${plan.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{plan.percentage}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Orders & Profit Calculation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">🧾 Recent Orders</h3>
                    <div className="space-y-3">
                        {MOCK_RECENT_ORDERS.map((order, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <p className="text-sm text-white">{order.customer}</p>
                                    <p className="text-xs text-gray-500">{order.type}</p>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={cn(
                                            "text-sm font-mono",
                                            order.amount < 0 ? "text-red-400" : "text-green-400"
                                        )}
                                    >
                                        {order.amount < 0 ? "-" : "+"}${Math.abs(order.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500">{order.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profit Calculation */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">💵 Profit Calculation (This Month)</h3>
                    <div className="space-y-3 font-mono text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Revenue</span>
                            <span className="text-white">${MOCK_REVENUE.thisMonth.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-400">
                            <span>API Costs</span>
                            <span>-${MOCK_COSTS.apiSpend}</span>
                        </div>
                        <div className="flex justify-between text-red-400">
                            <span>Infrastructure</span>
                            <span>-${MOCK_COSTS.infrastructure}</span>
                        </div>
                        <div className="flex justify-between text-red-400">
                            <span>Payment Fees (~5%)</span>
                            <span>-${MOCK_COSTS.paymentFees}</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex justify-between text-lg">
                                <span className="text-white font-semibold">Net Profit</span>
                                <span className="text-green-400">
                                    ${(MOCK_REVENUE.thisMonth - MOCK_COSTS.apiSpend - MOCK_COSTS.infrastructure - MOCK_COSTS.paymentFees).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Margin</span>
                                <span className="text-gray-400">
                                    {Math.round(((MOCK_REVENUE.thisMonth - MOCK_COSTS.apiSpend - MOCK_COSTS.infrastructure - MOCK_COSTS.paymentFees) / MOCK_REVENUE.thisMonth) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
