import { Users, DollarSign, Zap, CreditCard, TrendingUp } from "lucide-react";
import { StatCard, BankAccountCard, AlertItem, ServiceStatus } from "@/components/admin/StatCards";

// Mock data - will be replaced with API calls
const MOCK_STATS = {
    totalUsers: 1247,
    userGrowth: "+12%",
    mrr: 4125,
    mrrGrowth: "+8%",
    apiCredits: 47.82,
    optimizationsToday: 342,
    grossMargin: 87,
};

const MOCK_BANK_ACCOUNTS = [
    { name: "Income", emoji: "📥", balance: 1247.33, change: "$89", changePositive: true },
    { name: "Operations", emoji: "⚙️", balance: 312.50, change: "-$4.32", changePositive: false },
    { name: "Profit", emoji: "💵", balance: 2891.18, change: "$57", changePositive: true },
];

const MOCK_RECENT_USERS = [
    { id: 1, name: "John Smith", email: "john@example.com", plan: "Pro", signedUp: "2 hours ago" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", plan: "Free", signedUp: "5 hours ago" },
    { id: 3, name: "Mike Chen", email: "mike@example.com", plan: "Team", signedUp: "1 day ago" },
    { id: 4, name: "Emily Brown", email: "emily@example.com", plan: "Pro", signedUp: "1 day ago" },
    { id: 5, name: "Alex Wilson", email: "alex@example.com", plan: "Free", signedUp: "2 days ago" },
];

const MOCK_ALERTS = [
    { severity: "warning" as const, message: "OpenRouter balance below $50 - consider topping up" },
    { severity: "warning" as const, message: "Operations account runway: 12 days remaining" },
];

export default function AdminOverviewPage() {
    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Users"
                    value={MOCK_STATS.totalUsers.toLocaleString()}
                    change={{ value: MOCK_STATS.userGrowth, positive: true }}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    title="MRR"
                    value={`$${MOCK_STATS.mrr.toLocaleString()}`}
                    change={{ value: MOCK_STATS.mrrGrowth, positive: true }}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                    title="API Credits"
                    value={`$${MOCK_STATS.apiCredits}`}
                    warning={MOCK_STATS.apiCredits < 50}
                    critical={MOCK_STATS.apiCredits < 20}
                    icon={<CreditCard className="h-5 w-5" />}
                />
                <StatCard
                    title="Optimizations Today"
                    value={MOCK_STATS.optimizationsToday}
                    icon={<Zap className="h-5 w-5" />}
                />
                <StatCard
                    title="Gross Margin"
                    value={`${MOCK_STATS.grossMargin}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
            </div>

            {/* Bank Accounts Row */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">💰 Bank Accounts (Mercury)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_BANK_ACCOUNTS.map((account) => (
                        <BankAccountCard
                            key={account.name}
                            name={account.name}
                            emoji={account.emoji}
                            balance={account.balance}
                            change={account.change}
                            changePositive={account.changePositive}
                        />
                    ))}
                </div>
            </div>

            {/* Charts Row - Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">📈 Revenue (30 days)</h3>
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                        Chart coming soon (Recharts integration)
                    </div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">⚡ Optimizations (30 days)</h3>
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                        Chart coming soon (Recharts integration)
                    </div>
                </div>
            </div>

            {/* Two Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Signups */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">👤 Recent Signups</h3>
                    <div className="space-y-3">
                        {MOCK_RECENT_USERS.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${user.plan === "Pro"
                                                ? "bg-[#09B7B4]/20 text-[#09B7B4]"
                                                : user.plan === "Team"
                                                    ? "bg-purple-500/20 text-purple-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                            }`}
                                    >
                                        {user.plan}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">{user.signedUp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-white mb-4">
                        🔔 Alerts ({MOCK_ALERTS.length})
                    </h3>
                    {MOCK_ALERTS.length > 0 ? (
                        <div className="space-y-3">
                            {MOCK_ALERTS.map((alert, index) => (
                                <AlertItem key={index} severity={alert.severity} message={alert.message} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No active alerts</p>
                    )}
                </div>
            </div>

            {/* Service Status Bar */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center divide-x divide-white/10">
                    <ServiceStatus
                        name="OpenRouter"
                        status={MOCK_STATS.apiCredits < 20 ? "error" : MOCK_STATS.apiCredits < 50 ? "warning" : "healthy"}
                        detail={`$${MOCK_STATS.apiCredits}`}
                    />
                    <ServiceStatus name="Lemon Squeezy" status="healthy" />
                    <ServiceStatus name="Supabase" status="healthy" />
                    <ServiceStatus name="VPS" status="healthy" />
                    <ServiceStatus name="n8n" status="healthy" />
                </div>
            </div>
        </div>
    );
}
